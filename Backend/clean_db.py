import gspread
import pandas as pd
import re
import json
from pathlib import Path

# === CONFIGURATION ===
SHEET_ID = "1megV5iV3BObRDTqFp2Od-50Sedsv257jLnxziAA3dN0"  # <- remplace ça par l'ID de ton Google Sheet "1g_8ETAvX5H08vR7j2fCDwaVz_mK1IEh_3wFa8QrU1GE"
SERVICE_ACCOUNT_FILE = "Databases/mukanew-4a4f2dd7432c.json"
EXPORT_FILE = "Databases/micronutrients_clean.json"

COLUMN_KEYWORDS = {
    "Complement_Alimentaire": r"compl[eé]ment.*alimentaire",
    "Effets_Indesirables": r"effets.*(indésirable|secondaire)|contre.*indication",
    "Interactions_Pro": r"interaction.*pro",
    "Interactions_Patient": r"interaction.*patient",
    "Recommandations": r"recommandation",
    "Posologie": r"posologie",
    "Forme": r"forme",
    "Indication": r"indication",
    "Cibles": r"cible.*",
    "Sources": r"source",
    "CategoryName": r"category\s*name",
    "Barcode": r"barcode",
    "Display_Image": r"display.*image"
}


def match_column(header_row):
    matched = {}
    for col_name, pattern in COLUMN_KEYWORDS.items():
        for i, cell in enumerate(header_row):
            if re.search(pattern, cell.strip().lower()):
                matched[col_name] = i
                break
    return matched

# === Connexion à Google Sheets ===
gc = gspread.service_account(filename=SERVICE_ACCOUNT_FILE)
spreadsheet = gc.open_by_key(SHEET_ID)
worksheets = spreadsheet.worksheets()

# === Lecture et nettoyage ===
cleaned_data = []

for ws in worksheets:
    pathologie = ws.title
    raw_data = ws.get_all_values()
    if len(raw_data) < 3:
        continue

    # Chercher la première ligne avec des en-têtes utiles
    header_idx = None
    for idx, row in enumerate(raw_data[:10]):  # check les 10 premières lignes max
        if any(re.search(r"compl[eé]ment.*alimentaire", cell.lower()) for cell in row):
            header_idx = idx
            break

    if header_idx is None:
        print(f"[⚠️] En-tête non détecté pour la feuille {pathologie}")
        continue

    headers = raw_data[header_idx]
    content = raw_data[header_idx + 1:]
    col_matches = match_column(headers)

    for row in content:
        entry = {"Pathologie": pathologie}
        for col_name, idx in col_matches.items():
            if idx < len(row):
                entry[col_name] = row[idx].strip()
        cleaned_data.append(entry)

# === Export JSON
if cleaned_data:
    output_path = Path(EXPORT_FILE)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(cleaned_data, f, ensure_ascii=False, indent=2)
    print(f"[✅] Données exportées : {output_path.resolve()}")
else:
    print("[❌] Aucune donnée exportée. Vérifiez la structure des feuilles.")

 