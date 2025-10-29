from typing import Any
from dotenv import load_dotenv
import os
from pathlib import Path

from eansearch import EANSearch

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
DATABASE_KEY = os.getenv('DATABASE_KEY')

JWT_SECRET = os.getenv('JWT_SECRET')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM')
EXPIRE = os.getenv('ACCESS_TOKEN_EXPIRES_MIN')
REFRESH = os.getenv('REFRESH_TOKEN_EXPIRES_DAYS')

EAN_API_TOKEN = os.getenv('EAN_API_TOKEN')

DATA_FILE = os.getenv('DATA_FILE')

SHEET_ID = os.getenv('SHEET_ID')
SERVICE_ACCOUNT_FILE = os.getenv('SERVICE_ACCOUNT_FILE')
EXPORT_FILE = os.getenv('EXPORT_FILE')

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
CX = os.getenv('CX')
ENDPOINT = os.getenv('GOOGLE_ENDPOINT')

class Settings:
    database_url: str = DATABASE_URL
    database_key: str = DATABASE_KEY

    jwt_algorithm: str = JWT_ALGORITHM
    jwt_secret: str = JWT_SECRET
    expires: int = int(EXPIRE)
    refresh: int = int(REFRESH)

    ean_api_token: str = EAN_API_TOKEN

    data_file: Path = Path(DATA_FILE)

    sheet_id: str = SHEET_ID
    service_account_file: str = SERVICE_ACCOUNT_FILE
    export_file: str = EXPORT_FILE

    google_api_key: str = GOOGLE_API_KEY
    cx: str = CX
    endpoint: str = ENDPOINT

class Data:
    micronutrient_data: dict[str, Any] = []

settings = Settings()

data = Data()

lookup = EANSearch(settings.ean_api_token)