from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from pathlib import Path
from eansearch import EANSearch
import sqlite3
import gspread
from clean_db import clean_db
from push_db import push_db
import requests

clean_db()

app = Flask(__name__)
EAN_API_TOKEN="d016ac8894202cee4195ac5faa82037baa4a300e"
CORS(app)

DATA_FILE = Path("Databases/micronutrients_clean.json")


# === CONFIGURATION ===
SHEET_ID = "1megV5iV3BObRDTqFp2Od-50Sedsv257jLnxziAA3dN0"  # <- remplace ça par l'ID de ton Google Sheet "1g_8ETAvX5H08vR7j2fCDwaVz_mK1IEh_3wFa8QrU1GE"
SERVICE_ACCOUNT_FILE = "Databases/mukanew-4a4f2dd7432c.json"
EXPORT_FILE = "Databases/micronutrients_clean.json"

# === GOOGLE CONFIG ===
GOOGLE_API_KEY = ' AIzaSyCJwr2EJnLi7xE_IDUs7p2mQAKgGD319eE '
CX = 'd00c6b50a680d4683'

try:
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        micronutrient_data = json.load(f)
    print("[✅] Données chargées avec succès.")
except Exception as e:
    micronutrient_data = []
    print("[❌] Erreur de chargement des données : {e}")

def update_barcode_in_sheet(name, ean):
    if not DATA_FILE.exists():
        print("file not found")
        return

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    name = name.strip().lower()
    updates_made = 0

    for entry in data:
        comp_name = entry.get("Complément Alimentaire", "").strip().lower()
        barcode = entry.get("Barcode", "").strip()

        if comp_name in name:
            entry["Barcode"] = ean
            updates_made += 1
            print(f"[📝] Barcode ajouté à {name}")

    if updates_made > 0:
        with open(EXPORT_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"[✅] {updates_made} lignes mises a jour pour {name}")
    else:
        print(f"[❌] {updates_made} Aucun complément trouvé avec le nom: {name}")
    
    #TODO: PUSH THE LOCAL JSON TO OLIVIA GOOGLE SHEETS
    push_db(name, ean)



    """for ws in spreadsheet.worksheets():
        
        values = ws.get_all_values()
        
        if not values:
            continue
        print("somthing")
        # Cherche l’index des colonnes
        headers = values[0]
        try:
            name_col = headers.index("Complément alimentaire")
            barcode_col = headers.index("Barcode")
        except ValueError:
            continue  # Colonne non présente

        # Parcourt les lignes pour trouver le complément
        print("befor")
        for idx, row in enumerate(values[1:], start=2):  # ligne 2 = idx=1 => start=2 pour gspread
            if name_col >= len(row):
                continue
            row_name = row[name_col].strip().lower()
            print(row_name)

            if row_name == name:
                if barcode_col >= len(row) or not row[barcode_col].strip():
                    ws.update_cell(idx, barcode_col + 1, ean)  # gspread indexe les colonnes à partir de 1
                    updates_made += 1
                    print(f"[📝] Barcode ajouté à {name} dans la feuille {ws.title}")
        
        if updates_made == 0:
            print(f"[✅] Aucun complément trouvé avec le nom: {name}")
        else:
            print(f"[❌] {updates_made} lignes mises a jour pour {name}")"""

@app.route('/', methods = ['GET'])
def get_hello():
    return jsonify({"hello":"world"})

@app.route('/MicroNutrient', methods = ['GET'])
def get_all_MicroNutrients():
    return jsonify(micronutrient_data)

@app.route("/pathologies", methods=["GET"])
def get_pathologies():
    pathologies = sorted(set(entry["Pathologie"] for entry in micronutrient_data if "Pathologie" in entry))
    return jsonify(pathologies)

@app.route("/complements/<pathologie>", methods=["GET"])
def get_complements_by_pathologie(pathologie):
    complements = set()
    for entry in micronutrient_data:
        if entry.get("Pathologie", "").lower() == pathologie.lower():
            comp = entry.get("Complément Alimentaire")
            if comp:
                complements.add(comp.strip())
    return jsonify(sorted(complements))

@app.route("/complement/<pathologie>/<nom>", methods=["GET"])
def get_complement_details(pathologie ,nom):
    results = []
    for entry in micronutrient_data:
        comp = entry.get("Complément Alimentaire", "").lower()
        comp2 = entry.get("Pathologie", "").lower()
        if comp in nom.lower() and comp2.startswith(pathologie.lower()):
            results.append(entry)
    return jsonify(results)

@app.route("/complement/<nom>", methods=["GET"])
def get_complements(nom):
    results = []
    for entry in micronutrient_data:
        comp = entry.get("Complément Alimentaire", "").lower()
        if comp in nom.lower():
            results.append(entry)
    return jsonify(results)

@app.route("/interactions", methods=["GET"])
def get_interactions():
    query = request.args.get("with")
    if not query:
        return jsonify({"error": "Paramètre 'with' manquant"}), 400

    names = [n.strip().lower() for n in query.split("+")]
    results = []

    for entry in micronutrient_data:
        comp_name = entry.get("Complement_Alimentaire", "").lower()
        if comp_name in names:
            results.append(entry)

    return jsonify(results)

##EAN
#prefix=34009
@app.route("/qrcode/<ean>", methods=["GET"])
def get_product(ean):

    #TODO get an image
    img_url = ""
    query = ean
    endpoint = 'https://www.googleapis.com/customsearch/v1'
    params = {
        'key': GOOGLE_API_KEY,
        'cx': CX,
        'q': query,
        'searchType': 'image'
    }

    try:
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        data = response.json()

        if 'items' in data and len(data['items']) > 0:
            image_url = data['items'][0]['link']
            print('Image found:', image_url)
            img_url = image_url
        else:
            print('No image found for barcode:', ean)

    except requests.RequestException as e:
        print('Error fetching image:', e)

    #img = "jpath-to-image"
    result = next((entry for entry in micronutrient_data if entry.get("Barcode", "").strip() == ean), None)
    for entry in micronutrient_data:
        #print(len(entry.get("Barcode", "").strip().split(',')))
        #print(entry.get("Barcode", "").strip().split(','))
        if len(entry.get("Barcode", "").strip().split(',')) > 1:
            print(entry.get("Barcode", "").strip().split(',')[1])

    print(result)
    if result:
        jsonRes = jsonify({"name": result.get("Complément alimentaire")}) #=jsonified_result
        jsonRes['image'] = img_url
        print(json.dumps(jsonRes, indent=2))
        return jsonRes

    lookup = EANSearch(EAN_API_TOKEN)
    name = lookup.barcodeLookup(ean)
    print(name) #Name of the product

    product = lookup.barcodeSearch(ean)
    print(ean, " is ", product["name"].encode("utf-8"), " from category ", product["categoryName"], " issued in ", product["issuingCountry"])

    #TODO WORK AGAIN
    print("here")
    update_barcode_in_sheet(product["name"], ean)

    #TODO display

    return jsonify({
        "name": product.get("name"),
        "category": product.get("categoryName"),
        "country": product.get("issuingCountry"),
        "ean": ean,
        "image": img_url
    })





if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5001,debug=True)