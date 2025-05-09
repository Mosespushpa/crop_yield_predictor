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
            "state": data.state,
            "season": data.season,
            "crop_type": data.crop_type,
            "rainfall": data.rainfall,
            "avg_temperature": data.avg_temp,
            "pesticide_usage": data.pesticide_usage,
            "fertilizer": data.fertilizer,
            "area": data.area,
        }

        df_input = pd.DataFrame([input_data])
        print("📥 Input DataFrame:\n", df_input)

        prediction = model.predict(df_input)[0]
        print("📈 Predicted Yield:", prediction)

        recs = get_recommendations(input_data, prediction)
        return {"predicted_yield": float(round(prediction, 2)),  "recommendations": recs}

    except Exception as e:
        print("❌ Prediction error:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

def get_recommendations(data: dict, predicted_yield: float):
    crop = data["crop_type"].lower()
    area = data["area"]

    recommendations = []

    # Example logic — you can replace this with real rules or ML
    if crop == "rice":
        recommendations.append(f"💡 Use 60 kg/ha of Urea and 30 kg/ha of DAP for optimal rice growth.")
        recommendations.append(f"🛡️ Apply 2.5 L/ha of Monocrotophos pesticide during tillering stage.")
    elif crop == "wheat":
        recommendations.append(f"💡 Use 50 kg/ha of NPK (12:32:16) at sowing.")
        recommendations.append(f"🛡️ Apply 2 sprays of Chlorpyrifos at 10-day intervals.")
    else:
        recommendations.append(f"📌 Follow local extension guidelines for {crop} pesticide/fertilizer usage.")

    # Add context-aware message
    if predicted_yield < 3000:
        recommendations.append("📉 Yield is low — consider adjusting fertilizer dosage or irrigation.")
    elif predicted_yield > 6000:
        recommendations.append("🌾 Great yield expected! Maintain proper weed control and nutrient management.")

    return recommendations
