import json
from typing import Any
from threading import Thread

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder

from app.settings import settings, data
from app.utils import *

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


@ScanRouter.get("/qrcode/{ean}", tags=["Scan Related Operation"])
async def get_product(ean: str) -> dict[str, Any]:
    try:
        product_name = cached_lookup(ean)
        img_url = get_img(ean)

        Thread(target=update, args=(product_name, ean)).start()
        
        found_complements = []
        
        for entry in data.micronutrient_data:
            comp_field = entry.get("Complément Alimentaire", "")
            if name_matches(comp_field, product_name):
                found_complements.append({
                    "name": entry.get("Complément Alimentaire"),
                    "effets":{
                        "indésirables": entry.get("Effets Indésirables/Contre-Indications", ""),
                        "patient": entry.get("Effet pour le patient", "")
                    }
                })

        return jsonable_encoder({
            "ean": ean,
            "name": product_name,
            "complements": found_complements[0]
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))