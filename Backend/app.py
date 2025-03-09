from flask import Flask, jsonify
import sqlite3

app = Flask(__name__)

@app.route('/', methods = ['GET'])
def get_hello():
    return jsonify({"hello":"world"})

@app.route('/MicroNutrient', methods = ['GET'])
def get_all_MicroNutrients():
    conn = sqlite3.connect("base_de_donnees_micro_nutrition.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM micro_nutrition_cleaned")
    rows = cursor.fetchall()
    conn.close()
    return jsonify(rows)

@app.route('/Pathology', methods = ['GET'])
def get_all_pathologies():
    conn = sqlite3.connect("base_de_donnees_micro_nutrition.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM micro_nutrition_cleaned")
    rows = cursor.fetchall()
    conn.close()
    return jsonify(rows)

@app.route('/Pathology/<id>', methods = ['GET'])
def get_complements_by_pathology(id):
    conn = sqlite3.connect("base_de_donnees_micro_nutrition.db")
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM micro_nutrition_cleaned WHERE Pathologie=\'{id}\'")
    rows = cursor.fetchall()
    conn.close()
    return jsonify(rows)

if __name__ == "__main__":
    app.run(host='192.168.1.90',port=5000,debug=True)