# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Installer les dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier les fichiers de ton backend
COPY . .

# Lancer le script de nettoyage puis le serveur Flask
CMD ["bash", "-c", "python clean_db.py && python app.py"]