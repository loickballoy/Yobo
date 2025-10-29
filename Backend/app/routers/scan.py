import json
from typing import Any
from threading import Thread

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder

from app.settings import settings, data
from app.utils import *
import app.security as security

ScanRouter = APIRouter()

@ScanRouter.get("/scanned", tags=["Scan Related Operation"])
async def get_scanned_products() -> list[dict[str, str]]:
    """
        Returns of Nullable List of ALL scanned products
    """
    try:
        scanned = []
        for entry in data.micronutrient_data:
            barcode_raw = entry.get("Barcode", "")
            lines = barcode_raw.strip().split("\n")
            for line in lines:
                parts = line.strip().split(",")
                if len(parts) == 2:
                    barcode = parts[0].strip()
                    name = parts[1].strip()
                    if barcode and name:
                        scanned.append({
                            "barcode": barcode,
                            "name": name
                        })
        return jsonable_encoder(scanned)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@ScanRouter.get("/qrcode/history", tags=["Scan"])
async def get_scanned_history(user: User = Depends(security.get_current_active_user)) -> list[dict[str, Any]]:
    try:
        results = get_user_history(get_user_uuid(user.email))

        return jsonable_encoder(results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@ScanRouter.get("/qrcode/{ean}", tags=["Scan Related Operation"])
async def get_product(ean: str, user: User = Depends(security.get_current_active_user)) -> dict[str, Any]:
    try:
        product_name: str = cached_lookup(ean)
        img_url = get_img(ean)

        Thread(target=update, args=(product_name, ean)).start()
        
        found_complements = []
        
        for entry in data.micronutrient_data:
            comp_field = entry.get("Complément Alimentaire", "")
            #print(f'comparing {comp_field} and {product_name}')
            if name_matches(comp_field, product_name):
                found_complements.append({
                    "name": entry.get("Complément Alimentaire"),
                    "effets":{
                        "indésirables": entry.get("Effets Indésirables/Contre-Indications", ""),
                        "patient": entry.get("Effet pour le patient", "")
                    }
                })

        if not found_complements:
            raise HTTPException(status_code=404, detail="No complements found")
        
        uuid = get_user_uuid(user.email)
        add_to_history(uuid, product_name, img_url)



        return jsonable_encoder({
            "ean": ean,
            "name": product_name,
            "complements": found_complements[0],
            "image": img_url
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))