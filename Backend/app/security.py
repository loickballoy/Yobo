from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta

from app.db import get_supabase
from app.models import UserInDB, TokenData, Token
from app.settings import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="security/token")

SecurityRouter = APIRouter(prefix="/security")

def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)[:72]

def get_user(email: str) -> UserInDB:
    """
    Util Function used to retrieve a user from out supabase db
    """
    supabase = next(get_supabase())
    response = supabase.table('Users').select('*').eq("email", email).execute()
    return UserInDB(**response.data[0]) if response.data else None

def authenticate_user(email: str, password: str) -> UserInDB | bool:
    user = get_user(email)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False

    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    credential_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", 
                                        headers={"WWW-Authenthicate": "Bearer"})

    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        email: str = payload.get("sub")
        if email is None:
            raise credential_exception
        
        token_data = TokenData(email=email)
    except JWTError:
        raise credential_exception

    user = get_user(email=token_data.email)
    if user is None:
        raise credential_exception

    return user

async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, deail="Inactive user")

    return current_user

@SecurityRouter.post("/token", response_model=Token, tags=["Security"])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password", headers={"WWW-Authenthicate": "Bearer"})
    
    access_token_expire = timedelta(minutes=settings.expires)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expire)
    return {"access_token": access_token, "token_type": "bearer"}