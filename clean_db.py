import pandas as pd
import sqlite3
import os

file_paths = [
    "Databases/Base de donées- Micro nutrition - Anxiété.csv",
    "Databases/Base de donées- Micro nutrition - Beauté de la peau.csv",
    "Databases/Base de donées- Micro nutrition - Cholesterol.csv",
    "Databases/Base de donées- Micro nutrition - Dépression.csv",
    "Databases/Base de donées- Micro nutrition - Diabète.csv",
    "Databases/Base de donées- Micro nutrition - HTA.csv",
    "Databases/Base de donées- Micro nutrition - Ménopause.csv",
    "Databases/Base de donées- Micro nutrition - Sommeil.csv",
    "Databases/Base de donées- Micro nutrition - SPM Règles douloureuses.csv"
]

# Fonction pour charger et ajouter une colonne "Pathologie"
def load_and_add_pathology(file_path):
    # Déduire la pathologie à partir du nom du fichier
    pathology = os.path.basename(file_path).split("-")[-1].strip().replace(".csv", "")
    
    # Charger le fichier CSV
    df = pd.read_csv(file_path)
    
    # Ajouter la colonne "Pathologie"
    df["Pathologie"] = pathology
    
    return df

# Charger et combiner tous les fichiers
dataframes = [load_and_add_pathology(fp) for fp in file_paths]

# Identifier les colonnes communes et gérer les colonnes manquantes
all_columns = set(col for df in dataframes for col in df.columns)
for df in dataframes:
    missing_columns = all_columns - set(df.columns)
    for col in missing_columns:
        df[col] = None  # Ajouter les colonnes manquantes avec des valeurs vides

# Consolider toutes les données
all_data = pd.concat(dataframes, ignore_index=True)

# Nettoyage minimal : suppression des lignes entièrement vides
all_data.dropna(how="all", inplace=True)

# Connexion à SQLite et sauvegarde des données
conn = sqlite3.connect("base_de_donnees_micro_nutrition.db")
all_data.to_sql("micro_nutrition", conn, if_exists="replace", index=False)

query = "SELECT * FROM micro_nutrition"

# Charger la table existante
all_data = pd.read_sql_query("SELECT * FROM micro_nutrition", conn)

# Suppression des deux premières colonnes
all_data = all_data.iloc[:, 2:]

# Renommer les colonnes restantes
all_data.columns = ["Compléments", "Effets indésirables", "Interactions", "Pathologie"]

# Supprimer les lignes où toutes les colonnes sont NULL
all_data.dropna(subset=['Compléments'], inplace=True)

all_data = all_data.iloc[1:,:]

# Exporter la table nettoyée dans la base SQLite
all_data.to_sql("micro_nutrition_cleaned", conn, if_exists="replace", index=False)

# Fermer la connexion
conn.close()

print("Les données ont été nettoyées et exportées dans la table 'micro_nutrition_cleaned'.")

