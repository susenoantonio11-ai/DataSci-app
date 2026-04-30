from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import io
import os
import anthropic
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.metrics import accuracy_score, r2_score, mean_squared_error

app = FastAPI(title="DataSci App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

datasets = {}

@app.get("/")
def read_root():
    return {"message": "DataSci App API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    filename = file.filename
    contents = await file.read()
    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        elif filename.endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported format. Please use CSV or XLSX!")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    datasets[filename] = df

    return {
        "filename": filename,
        "rows": len(df),
        "columns": list(df.columns),
        "preview": df.head(5).to_dict(orient="records")
    }

@app.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    filename = file.filename
    contents = await file.read()
    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        elif filename.endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported format. Please use CSV or XLSX!")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    summary = {
        "rows": len(df),
        "columns": list(df.columns),
        "dtypes": df.dtypes.astype(str).to_dict(),
        "missing_values": df.isnull().sum().to_dict(),
        "statistics": df.describe().to_dict()
    }

    prompt = f"""You are an expert data scientist. Analyze the following dataset and provide useful insights in English:

Dataset Summary:
- Total rows: {summary['rows']}
- Columns: {summary['columns']}
- Data types: {summary['dtypes']}
- Missing values: {summary['missing_values']}
- Statistics: {summary['statistics']}

Please provide a thorough analysis covering:
1. Dataset Overview
2. Data Quality (missing values, anomalies)
3. Key Insights from Statistics
4. Preprocessing Recommendations
5. Suggestions for Further Analysis
"""

    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )

    return {
        "filename": filename,
        "summary": summary,
        "ai_analysis": message.content[0].text
    }

class TrainRequest(BaseModel):
    filename: str
    target_column: str
    model_type: str
    task_type: str

@app.post("/train")
async def train_model(request: TrainRequest):
    file_path = os.path.join(UPLOAD_DIR, request.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found. Please upload the file first!")

    if request.filename.endswith(".csv"):
        df = pd.read_csv(file_path)
    else:
        df = pd.read_excel(file_path)

    if request.target_column not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{request.target_column}' not found!")

    df = df.dropna()

    le = LabelEncoder()
    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = le.fit_transform(df[col].astype(str))

    X = df.drop(columns=[request.target_column])
    y = df[request.target_column]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    if request.task_type == "classification":
        if request.model_type == "random_forest":
            model = RandomForestClassifier(n_estimators=100, random_state=42)
        else:
            model = LogisticRegression(max_iter=1000)
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        score = accuracy_score(y_test, y_pred)
        metric_name = "Accuracy"
    else:
        if request.model_type == "random_forest":
            model = RandomForestRegressor(n_estimators=100, random_state=42)
        else:
            model = LinearRegression()
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        score = r2_score(y_test, y_pred)
        metric_name = "R2 Score"

    model_path = os.path.join(UPLOAD_DIR, f"model_{request.filename}.pkl")
    joblib.dump(model, model_path)

    feature_importance = {}
    if hasattr(model, "feature_importances_"):
        feature_importance = dict(zip(X.columns, model.feature_importances_.tolist()))

    return {
        "model_type": request.model_type,
        "task_type": request.task_type,
        "target_column": request.target_column,
        "train_size": len(X_train),
        "test_size": len(X_test),
        "metric_name": metric_name,
        "score": round(score, 4),
        "feature_importance": feature_importance
    }
