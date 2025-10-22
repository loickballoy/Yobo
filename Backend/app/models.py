from pydantic import BaseModel
from datetime import datetime

class User(BaseModel):
    email: str
    password: str
    full_name: str | None = None