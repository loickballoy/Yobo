from typing import Annotated
from datetime import datetime
import json

import uvicorn

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware

from app.models import User
from app.utils import clean_db
from app.settings import settings, data
from app.security import *

from app.routers.auth import AuthRouter
from app.routers.micronutrients import MNRouter
from app.routers.scan import ScanRouter

app = FastAPI()

origins = ['*']

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

clean_db()

# Load micronutrient data
try:
    with open(settings.data_file, "r", encoding="utf-8") as f:
        micronutrient_data = json.load(f)
    print("[✅] Données chargées avec succès.")
except Exception as e:
    micronutrient_data = []
    print("[❌] Erreur de chargement des données : {e}")

data.micronutrient_data = micronutrient_data

@app.get('/')
async def hello_world():
    return {"message": "Hello World"}

app.include_router(AuthRouter)
app.include_router(MNRouter)
app.include_router(ScanRouter)
app.include_router(SecurityRouter)

