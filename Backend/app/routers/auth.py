from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
import jwt
import json

from app.models import User, UserInDB
from app.utils import *
from app.settings import settings
import app.security as security

AuthRouter = APIRouter()

@AuthRouter.post("/auth/signup", tags=["Auth"])
async def signup(user: UserInDB) -> dict[str, Any]:
    """
        Sign Up Function For our webapp. Creates an entry in our Supabase DB, 
        a JWT token that we save in another table and link it to the created user's uuid.
        Once All that is saved and created we send an E-mail to verify the user's email.
    """
    try:
        # Check If user exists
        existing_user = security.get_user(user.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        # Hash Password
        print(user.password)
        user.password = security.get_password_hash(user.password)
        print(user.password)
        # Add to supabase db
        db_insert(user)
        # Create JWT token
        created_user = get_user(user.email)
        payload = json.loads(created_user.model_dump_json())
        token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
        add_verification_token(created_user, token)
        # Confirm e-mail
        # TODO
        
        return {"message": "User created successfully", "JWTtoken": token}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@AuthRouter.post("/auth/login", tags=["Auth"], deprecated=True)
async def login(user: User) -> dict[str, Any]:
    """
        Log In Function for our webapp. Updates the JWT token in our verification_token table.
        Also Returns the JWT token to be used by our Frontend and our other API operations.
    """
    try:
        real_user = get_user(user.email)
        if not real_user:
            raise HTTPException(status_code=400, detail="This user does not exist")
        isMatch = get_password_hash(user.password) == real_user.password
        if not isMatch:
            raise HTTPException(status_code=401, detail="Incorrect E-mail/Password")
        
        payload = json.loads(real_user.model_dump_json())
        token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
        update_verification_token(real_user, token)

        return {"message": "Logged in Successfully", "JWTtoken": token}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@AuthRouter.get("/users/me", response_model=User, tags=["Auth"])
async def read_users_me(current_user: User = Depends(security.get_current_active_user)) -> User:
    return current_user

@AuthRouter.get("/users/item", tags=["Auth"])
async def read_own_items(current_user: User = Depends(security.get_current_active_user)) -> list[dict[str, Any]]:
    return [{
        "item_id": 1,
        "owner": current_user
    }]