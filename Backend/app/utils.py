from fastapi import HTTPException
from functools import lru_cache
from unidecode import unidecode

from app.db import get_supabase
from app.settings import settings, lookup
from app.models import User

import requests
import hashlib
import gspread
import pandas as pd
import re
import json
from typing import Any
from pathlib import Path
from datetime import datetime

## DB and Scan operation
def clean_db() -> None:
    gc = gspread.service_account(filename=settings.service_account_file)
    spreadsheet = gc.open_by_key(settings.sheet_id)
    worksheets = spreadsheet.worksheets()

    cleaned_data = []

    for ws in worksheets:
        pathologie = ws.title
        raw_data = ws.get_all_values()

        headers = raw_data[0]
        content = raw_data[1:]

        for row in content:
            entry = {
                "Pathologie": pathologie
            }
            for i, header in enumerate(headers):
                key = header.strip()
                value = row[i].strip() if i < len(row) else ""
                entry[key] = value
            cleaned_data.append(entry)

    output_path = Path(settings.export_file)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(cleaned_data, f, ensure_ascii=False, indent=2)

def push_db(name: str, ean: str) -> None:
    try:
        gc = gspread.service_account(filename=settings.service_account_file)
        spreadsheet = gc.open_by_key(settings.sheet_id)
        worksheets = spreadsheet.worksheets()

        for ws in worksheets:
            values = ws.get_all_values()

            headers = values[0]
            try:
                name_col = headers.index("Complément Alimentaire")
                barcode_col = headers.index("Barcode")
            except ValueError:
                continue

            for idx, row in enumerate(values[1:], start=2):
                row_name = row[name_col].strip().lower()
                if name_matches(row_name , name):
                    current_barcode = row[barcode_col] if barcode_col < len(row) else ""
                    barcode_lines = current_barcode.strip().split("\n") if current_barcode.strip() else []

                    already_present = any(ean in line for line in barcode_lines)
                    if not already_present:
                        new_line = f"{ean},{name}"
                        new_value = current_barcode.strip() + ("\n" if current_barcode.strip() else "") + new_line
                        ws.update_cell(idx, barcode_col + 1, new_value)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def update(name: str, ean: str) -> None:
    if not settings.data_file.exists():
        print("file not found")
        return

    with open(settings.data_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    updates_made = 0

    for entry in data:
        comp_field = entry.get("Complément Alimentaire", "")
        if name_matches(comp_field, name):
            entry["Barcode"] = ean
            updates_made += 1
    if updates_made > 0:
        with open(settings.export_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    push_db(name, ean)

def name_matches(comp: str, name: str) -> bool:
    possible_names = comp.split("|")
    for n in possible_names:
        # print(f'comparing {n} and {name}')
        if n and unidecode(n.strip().lower()) in unidecode(name.strip().lower()):
            return True
    return False

def get_img(ean: str) -> str:
    """
        Using the google API to get the display images for our scanned product
    """
    query = ean
    endpoint = settings.endpoint
    params = {
        'key': settings.google_api_key,
        'cx': settings.cx,
        'q': query,
        'searchType': 'image'
    }

    try:
        res = requests.get(endpoint, params=params)
        res.raise_for_status()
        data = res.json()
        if 'items' in data and len(data['items']) > 0:
            return data['items'][0]['link']
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
    return ""

@lru_cache(maxsize=1000)
def cached_lookup(ean: str) -> str:
    try:
        product = lookup.barcodeSearch(ean, lang=6)
        return product["name"]
    except Exception as e:
        return None

## AUTH
def get_user(email: str) -> User | None:
    """
    Util Function used to retrieve a user from out supabase db
    """
    supabase = next(get_supabase())
    response = supabase.table('Users').select('*').eq("email", email).execute()
    return User(**response.data[0]) if response.data else None

def delete_user(email: str) -> None:
    supabase = next(get_supabase())
    supabase.table('Users').delete().eq('email', email).execute()

def db_insert(user: User) -> None:
    supabase = next(get_supabase())
    supabase.table('Users').insert(user.model_dump()).execute()

def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def add_verification_token(created_user: User, token: str) -> None:
    supabase = next(get_supabase())
    response = supabase.table('Users').select('*').eq('email', created_user.email).execute()
    payload = {
        "user_id": response.data[0]["uuid"],
        "token": token
    }
    supabase.table('verification_tokens').insert(payload).execute()

def update_verification_token(real_user: User, token: str) -> None:
    supabase = next(get_supabase())
    response = supabase.table('Users').select('*').eq('email', real_user.email).execute()
    uuid = response.data[0]["uuid"]
    payload = {
        "user_id": uuid,
        "token": token
    }
    supabase.table('verification_tokens').update(payload).eq("user_id", uuid).execute()

def get_user_uuid(email: str):
    supabase = next(get_supabase())
    response = supabase.table('Users').select('*').eq("email", email).execute()
    return response.data[0]["uuid"]

def add_to_history(uuid: str, product_name: str, img_url: str) -> None:
    supabase = next(get_supabase())
    existing_histo = supabase.table("History").select("*").eq("product_name", product_name).execute()
    if not existing_histo.data:
        response = (
            supabase.table("History")
            .insert({
                "user_id": uuid,
                "product_name": product_name,
                "img_url": img_url
            }).execute()
        )
    else:
        response = (
            supabase.table("History")
            .update({
                "created_at": str(datetime.now()),
                "user_id": uuid,
                "product_name": product_name,
                "img_url": img_url
            })
            .eq("product_name", product_name)
            .execute()
        )

def get_user_history(uuid: str) -> list[dict[str, Any]]:
    supabase = next(get_supabase())
    response = (
        supabase.table("History")
        .select("*")
        .eq("user_id",uuid)
        .execute()
    )
    return response.data