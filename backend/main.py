from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import pickle

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Or ["*"] for all origins (dev only)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load the trained model
with open("D:/Gruop_project/Major_Project/crop_yield_predictor/backend/model/best_model/model.pkl", "rb") as f:
    model = pickle.load(f)
    

@app.get("/")
def home():
    return {"message": "FastAPI is running. Use /predict via POST."}

@app.post("/predict")
async def predict(request: Request):
    try:
        data = await request.json()
        print("Incoming data:", data)

        input_data = {
            'Crop_Type': data['crop_type'],
            'Season': data['season'],
            'State': data['state'],
            'Rainfall': float(data['rainfall']),
            'Fertilizer': float(data['fertilizer']),
            'Pesticide_Usage': float(data['pesticide_usage']),
            'Avg_Temperature': float(data['avg_temp']),
            'Area': float(data['area']),
        }

        df_input = pd.DataFrame([input_data])
        print("Processed DataFrame:", df_input)

        prediction = model.predict(df_input)[0]

        return {"predicted_yield": round(prediction, 2)}

    except Exception as e:
        return {"error": str(e)}
