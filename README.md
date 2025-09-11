# 🧪 Muka

Muka is a mobile application that allows users to **scan pharmaceutical products** by barcode (EAN) and get:
- Product information (name, category, country of issue, image)
- Possible interactions with micronutrients
- Side effects and patient-related effects extracted from curated datasets

This project was developed to learn more about app development and challenge myslef to solve a problem, with a focus on **full-stack development and applied health-tech**.

---

## 🚀 Features

- 📱 **Barcode scanning** via mobile app (React Native + Expo)
- 🔍 **EAN product lookup** using the [EANSearch API](https://www.ean-search.org/)
- 📊 **Micronutrient dataset** stored in Google Sheets and synced into a local JSON database
- 🗂 **Pathology & supplement mapping**
- ⚡ **Fast backend** with caching and async updates

---

## 🛠 Tech Stack

**Frontend**
- React Native (Expo)
- React Navigation
- Axios (for API calls)

**Backend**
- Python (Flask)
- Flask-CORS
- EANSearch SDK
- Google Sheets API (via gspread)
- JSON for local storage

**Other**
- GitHub Actions (CI/CD ready)

---

## 📂 Project Structure

```
Muka/
│
├── frontend/ # React Native mobile app (Expo)
│ ├── App.js
│ ├── package.json
│ └── screens/...
│
├── backend/ # Python Flask API
│ ├── app.py # Main API
│ ├── push_db.py # Updates Google Sheets
│ ├── clean_db.py # Cleans and exports data
│ └── Databases/
│ ├── micronutrients_clean.json
│ └── service_account.json
│
├── README.md
└── requirements.txt
```

---

## ⚡ Setup & Run

### 1. Backend

Clone the repo and install dependencies:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # (Linux/Mac)
venv\Scripts\activate     # (Windows)

pip install -r requirements.txt
```

Run the server:

```
python app.py
```

---
### 2. Frontend

Go to the frontend folder:

```
cd TEST
npm install
npx expo start -c --tunnel
```

Open the Expo DevTools, run on simulator or scan QR code on your device.

---

## 🔑 API Endpoints (Backend)

- ```GET /```  → health check
- ```GET /MicroNutrient```→ all micronutrient data
- ```GET /pathologies```→ all pathologies
- ```GET /complements/<pathologie>```→ supplements for a pathology
- ```GET /complement/<nom>```→ supplement details by name
- ```GET /qrcode/<ean>```→ product info + interactions
- ```GET /scanned```→ already scanned products

---
## 📸 Watch the demo for Muka!

[![Watch the demo](https://img.youtube.com/vi/AAt_0GxZDq0/0.jpg)](https://youtube.com/shorts/AAt_0GxZDq0?feature=share)

---
## 🌱 Roadmap

- Basic EAN scanning and lookup

- Google Sheets integration

- Deploy demo backend on Render (for the backend the full front deploy is ongoing)

- Improve speed 

- Expand dataset coverage

---
## 👤 Author

Developed by Balloy Loïck – Computer Engineering student at EPITA (SSSE Major).

Portfolio: [portfolio-link]

GitHub: [https://github.com/loickballoy]

LinkedIn: [https://www.linkedin.com/in/loick-balloy-332708203/]
