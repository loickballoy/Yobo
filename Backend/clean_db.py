import gspread
import pandas as pd
import re
import json
from pathlib import Path

def clean_db():
    # === CONFIGURATION ===
    SHEET_ID = "1megV5iV3BObRDTqFp2Od-50Sedsv257jLnxziAA3dN0"  # <- remplace ça par l'ID de ton Google Sheet "1g_8ETAvX5H08vR7j2fCDwaVz_mK1IEh_3wFa8QrU1GE"
    SERVICE_ACCOUNT_FILE = "Databases/mukanew-4a4f2dd7432c.json"
    EXPORT_FILE = "Databases/micronutrients_clean.json"

    # === Connexion à Google Sheets ===
    gc = gspread.service_account(filename=SERVICE_ACCOUNT_FILE)
    spreadsheet = gc.open_by_key(SHEET_ID)
    worksheets = spreadsheet.worksheets()

    # === Lecture et nettoyage ===
    cleaned_data = []

    for ws in worksheets:
        pathologie = ws.title
        raw_data = ws.get_all_values()
        if len(raw_data) < 2:
            continue

        headers = raw_data[0]
        content = raw_data[1:]

        for row in content:
            if all(cell.strip() == "" for cell in row):
                continue  # Ignore completely empty rows

            entry = {"Pathologie": pathologie}
            for i, header in enumerate(headers):
                key = header.strip()
                value = row[i].strip() if i < len(row) else ""
                entry[key] = value
            cleaned_data.append(entry)



    # === Export JSON
    if cleaned_data:
        output_path = Path(EXPORT_FILE)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(cleaned_data, f, ensure_ascii=False, indent=2)
        print(f"[✅] Données exportées : {output_path.resolve()}")
    else:
        print("[❌] Aucune donnée exportée. Vérifiez la structure des feuilles.")

clean_db()

 