from pydantic import BaseModel
from datetime import datetime, timedelta

class User(BaseModel):
    email: str
    full_name: str | None = None
    disabled: bool = False

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class UserInDB(User):
    password: str