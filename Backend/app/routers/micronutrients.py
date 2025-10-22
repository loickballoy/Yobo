import stat
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
import jwt
import json

# from Backend.old_app import micronutrient_data
from app.models import User
from app.utils import *
from app.settings import settings, data

MNRouter = APIRouter()

@MNRouter.get("/micronutrient", tags=["Micronutrients"])
async def get_all_Micronutrients() -> list[dict[str, Any]]:
    """
        Returns a json version of all the micronutrients data
    """
    try:
        return jsonable_encoder(data.micronutrient_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@MNRouter.get("/pathologies", tags=["Micronutrients"])
async def get_pathologies() -> list:
    """
        Returns a set of all the pathologies we are handling
    """
    try:
        pathologies = set()
        for entry in data.micronutrient_data:
            if "Pathologie" in entry:
                pathologies.add(entry["Pathologie"])
        return jsonable_encoder(sorted(pathologies))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@MNRouter.get("/complements/{pathology}", tags=["Micronutrients"])
async def get_complement_by_pathology(pathology: str) -> list:
    """
        Returns a list of Micronutrients associated with a given pathology.
    """
    try:
        complements = set()
        for entry in data.micronutrient_data:
            if entry.get("Pathologie", "").lower() == pathology.lower():
                comp = entry.get("Complément Alimentaire")
                if comp:
                    complements.add(comp.strip())
        return jsonable_encoder(sorted(complements))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@MNRouter.get("/complement/{pathology}/{name}", tags=["Micronutrients"])
async def get_complement_details(pathology: str, name: str) -> list:
    """
        Returns a list of matching components inside a given Pathology
        (e.g try out with 
        Patholgy: Ménopause
        Name: Bourrache avec Houblon)
    """
    try:
        results = []
        for entry in data.micronutrient_data:
            if entry.get("Pathologie", "").lower() == pathology.lower():
                comp_field = entry.get("Complément Alimentaire", "")
                if name_matches(comp_field, name):
                    results.append(entry)
        if not results:
            raise HTTPException(status_code=401, 
            detail=f"No components were found matching: {name}")
        return jsonable_encoder(results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@MNRouter.get("/complement/{name}", tags=["Micronutrients"])
async def get_complents(name: str) -> list[dict[str, Any]]:
    """
        Returns a list of matching components regardless of the given pathologies
        NOTE there is no use of the name_matches function this is to 
        look into for the accents problem. Compared to the other API
        operation get_complement_details()
    """
    try:
        results = []
        for entry in data.micronutrient_data:
            comp = entry.get("Complément Alimentaire", "").lower()
            if name_matches(comp, name.lower()):
                results.append(entry)
        if not results:
            raise HTTPException(status_code=401, 
            detail=f"No components were found matching: {name}")
        return jsonable_encoder(results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@MNRouter.get("/interactions/{complements}", tags=["Micronutrients"], deprecated=True)
async def get_interactions(name) -> None:
    """
        Returns Interactions between 2 micronutrients with 
        {name} being formated as such: "comp1+comp2"
    """
    return None

