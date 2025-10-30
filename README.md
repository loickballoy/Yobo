# 🧪 Yobo

Yobo is a mobile application that allows users to **scan pharmaceutical products** by barcode (EAN) and get:
- Product information (name, image, effects)
- Possible interactions with micronutrients
- Side effects and patient-related effects extracted from curated datasets

This project was developed to learn more about app development and challenge myslef to solve a problem, with a focus on **full-stack development and applied health-tech**.

---

## 🚀 Features

- 📱 **Barcode scanning** via mobile app (React Native + Expo + tailwindcss/nativewind)
- 🔍 **EAN product lookup** using the [EANSearch API](https://www.ean-search.org/)
- 📊 **Micronutrient dataset** stored in Google Sheets and synced into a local JSON database (suboptimal dataset but simpler for non-tech workers to update and correct the dataset)
- 🗂 **Pathology & supplement mapping**
- ⚡ **Fast backend** with caching and async updates

---

## 🛠 Tech Stack

**Frontend**
- React Native (Expo)
- Nativewind
- Axios (for API calls)

**Backend**
- Python (FastAPI)
- FastAPI CORS
- EANSearch SDK
- Google Sheets API (via gspread)
- JSON for local storage

**Other**
- Render (CI/CD)

---

## 📂 Project Structure

```
Yobo/
│
├── mobile_yobo_app/ # React Native mobile app (Expo)
│ ├── app/...
│ ├── package.json
│ └── app.json
│
├── Backend/ # Python Fast API
│ ├── main.py # Main 
│ ├── app/
│ │   ├── routes/ # API routes
│ │   ├── ... # utils and other useful python files
│ ├── requirements.txt # All the pip modules used 
│
└── README.md
```

---

## ⚡ Setup & Run

### 1. Backend

The Backend is continuously running and deployed on render.com

Our provided API's Swagger can be accessed by: https://muka-lept.onrender.com/docs

---
### 2. Frontend

Go to the frontend folder:

```
cd mobile_yobo_app
npm install
npx expo start -c --tunnel
```

Open the Expo DevTools, run on simulator or scan QR code on your device.

---

---
## 📸 Watch the demo for Yobo!

Please note that this is a dev demo as such the errors shown only relate to a prior Access token deleted to restart the test freshly. It also displays the time of download which I am currently working on a way to reduce this even in prod.

[![Watch the demo](https://img.youtube.com/vi/W5QGtZ1tncM/maxresdefault.jpg)](https://youtu.be/W5QGtZ1tncM)

---
## 🌱 Roadmap

- Expand dataset coverage

- Implement ```Sentry``` to enhance user experience and prevent bugs.

- Light changes to the UI.

---
## 👤 Author

Developed by Balloy Loïck – Computer Engineering student at EPITA (SSSE Major).

Portfolio: [portfolio-link]

GitHub: [https://github.com/loickballoy]

LinkedIn: [https://www.linkedin.com/in/loick-balloy-332708203/]
