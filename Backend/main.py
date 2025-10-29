import uvicorn
from dotenv import load_dotenv
import os

load_dotenv()
MODE = os.getenv("MODE")

if __name__ == "__main__":
    if MODE == "dev":
        uvicorn.run(
            app="app.main:app",
            host="localhost",
            port=8000,
            reload=True,
        )
    else:
        uvicorn.run(
            app="app.main:app",
            host="0.0.0.0",
            port=5000,
            reload=True
        )