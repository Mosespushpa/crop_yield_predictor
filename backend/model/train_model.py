import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import pickle
import os

# ---- 1. Load Dataset ----
file_path = os.path.join("data", "D:/Gruop_project/Major_Project/crop_yield_predictor/data/cleaned_crop_yield.csv")  # relative path
df = pd.read_csv(file_path)

# ---- 2. Clean & Prepare ----
df.dropna(inplace=True)
df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

# Define feature columns and target
feature_cols = [
    "crop_type", "season", "state",
    "rainfall", "fertilizer", "pesticide_usage",
    "avg_temperature", "area"
]
target_col = "crop_yield"

X = df[feature_cols]
y = df[target_col]

# ---- 3. Preprocessing ----
categorical_features = ["crop_type", "season", "state"]
numerical_features = ["rainfall", "fertilizer", "pesticide_usage", "avg_temperature", "area"]

preprocessor = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown='ignore'), categorical_features),
    ("num", StandardScaler(), numerical_features)
])

# ---- 4. Pipelines ----
xgb_pipe = Pipeline([
    ("preprocess", preprocessor),
    ("regressor", XGBRegressor(objective="reg:squarederror"))
])

rf_pipe = Pipeline([
    ("preprocess", preprocessor),
    ("regressor", RandomForestRegressor())
])

# ---- 5. Hyperparameters ----
xgb_params = {
    "regressor__n_estimators": [100, 200],
    "regressor__max_depth": [3, 5],
    "regressor__learning_rate": [0.05, 0.1]
}

rf_params = {
    "regressor__n_estimators": [100],
    "regressor__max_depth": [None, 10]
}

# ---- 6. Train/Test Split ----
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ---- 7. Grid Search ----
xgb_search = GridSearchCV(xgb_pipe, xgb_params, cv=5, scoring="r2", n_jobs=-1)
xgb_search.fit(X_train, y_train)

rf_search = GridSearchCV(rf_pipe, rf_params, cv=3, scoring="r2", n_jobs=-1)
rf_search.fit(X_train, y_train)

# ---- 8. Evaluation ----
def evaluate(model, name):
    preds = model.predict(X_test)
    print(f"\n📊 Model: {name}")
    print("R² Score:", r2_score(y_test, preds))
    print("MAE:", mean_absolute_error(y_test, preds))
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    print("RMSE:", rmse)

evaluate(xgb_search, "XGBoost")
evaluate(rf_search, "Random Forest")

# ---- 9. Save Best Model ----
best_model = xgb_search if xgb_search.best_score_ > rf_search.best_score_ else rf_search
model_path = os.path.join("best_model","model.pkl")

# Ensure directory exists
os.makedirs(os.path.dirname(model_path), exist_ok=True)

with open(model_path, "wb") as f:
    pickle.dump(best_model, f)


