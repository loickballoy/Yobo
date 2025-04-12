from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from pathlib import Path
import sqlite3

app = Flask(__name__)
CORS(app)

DATA_FILE = Path("../Databases/micronutrients_clean.json")

try:
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        micronutrient_data = json.load(f)
    print("[✅] Données chargées avec succès.")
except Exception as e:
    micronutrient_data = []
    print("[❌] Erreur de chargement des données : {e}")

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
            comp = entry.get("Complement_Alimentaire")
            if comp:
                complements.add(comp.strip())
    return jsonify(sorted(complements))

@app.route("/complement/<nom>", methods=["GET"])
def get_complement_details(nom):
    results = []
    for entry in micronutrient_data:
        comp = entry.get("Complement_Alimentaire", "").lower()
        if comp.startswith(nom.lower()):
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

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)