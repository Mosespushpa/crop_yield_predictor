from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import pickle
import os
import traceback

# Initialize FastAPI app
app = FastAPI()

# Enable CORS (React default localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model path (portable)
MODEL_PATH = "D:/Gruop_project/Major_Project/crop_yield_predictor/backend/model/best_model/model.pkl"

# Load trained model
try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
        print("✅ Model loaded successfully.")
except Exception as e:
    raise RuntimeError(f"❌ Failed to load model: {e}")

# Input validation schema
class YieldRequest(BaseModel):
    crop_type: str
    season: str
    state: str
    rainfall: float
    avg_temp: float
    pesticide_usage: float
    fertilizer: float
    area: float

@app.get("/")
def home():
    return {"message": "🌾 FastAPI is live. Use POST /predict to get yield."}

@app.post("/predict")
def predict(data: YieldRequest):
    try:
        # Prepare input dict matching training feature names
        input_data = {
            "Crop_Type": data.crop_type,
            "Season": data.season,
            "State": data.state,
            "Rainfall": data.rainfall,
            "Fertilizer": data.fertilizer,
            "Pesticide_Usage": data.pesticide_usage,
            "Avg_Temperature": data.avg_temp,
            "Area": data.area,
        }

        df_input = pd.DataFrame([input_data])
        print("📥 Input DataFrame:\n", df_input)

        prediction = model.predict(df_input)[0]
        print("📈 Predicted Yield:", prediction)

        return {"predicted_yield": round(prediction, 2)}

    except Exception as e:
        print("❌ Prediction error:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
