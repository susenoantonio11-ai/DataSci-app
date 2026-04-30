from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import pandas as pd
import numpy as np
import io
import os
import anthropic
import joblib
import json
import math
import plotly.express as px
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.metrics import accuracy_score, r2_score

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

def safe_value(v):
    if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
        return None
    return v

def clean_dict(obj):
    if isinstance(obj, dict):
        return {k: clean_dict(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_dict(v) for v in obj]
    elif isinstance(obj, float):
        return safe_value(obj)
    elif isinstance(obj, np.floating):
        v = float(obj)
        return None if (math.isnan(v) or math.isinf(v)) else v
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.ndarray):
        return clean_dict(obj.tolist())
    return obj

def make_response(data):
    return JSONResponse(content=json.loads(
        json.dumps(clean_dict(data), allow_nan=False, default=str)
    ))

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

    df_clean = df.where(pd.notnull(df), None)
    preview = df_clean.head(5).to_dict(orient="records")

    return make_response({
        "filename": filename,
        "rows": len(df),
        "columns": list(df.columns),
        "dtypes": df.dtypes.astype(str).to_dict(),
        "preview": preview
    })

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
            raise HTTPException(status_code=400, detail="Unsupported format!")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    summary = {
        "rows": len(df),
        "columns": list(df.columns),
        "dtypes": df.dtypes.astype(str).to_dict(),
        "missing_values": {k: int(v) for k, v in df.isnull().sum().to_dict().items()},
        "statistics": df.describe().where(pd.notnull(df.describe()), None).to_dict()
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

    return make_response({
        "filename": filename,
        "summary": summary,
        "ai_analysis": message.content[0].text
    })

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
        model = RandomForestClassifier(n_estimators=100, random_state=42) if request.model_type == "random_forest" else LogisticRegression(max_iter=1000)
        model.fit(X_train, y_train)
        score = accuracy_score(y_test, model.predict(X_test))
        metric_name = "Accuracy"
    else:
        model = RandomForestRegressor(n_estimators=100, random_state=42) if request.model_type == "random_forest" else LinearRegression()
        model.fit(X_train, y_train)
        score = r2_score(y_test, model.predict(X_test))
        metric_name = "R2 Score"

    joblib.dump(model, os.path.join(UPLOAD_DIR, f"model_{request.filename}.pkl"))

    feature_importance = {}
    if hasattr(model, "feature_importances_"):
        feature_importance = dict(zip(X.columns.tolist(), [float(v) for v in model.feature_importances_]))

    return make_response({
        "model_type": request.model_type,
        "task_type": request.task_type,
        "target_column": request.target_column,
        "train_size": len(X_train),
        "test_size": len(X_test),
        "metric_name": metric_name,
        "score": round(float(score), 4),
        "feature_importance": feature_importance
    })

class VizRequest(BaseModel):
    filename: str
    chart_type: str
    x_column: str
    y_column: str = None
    color_column: str = None

@app.post("/visualize")
async def visualize_data(request: VizRequest):
    file_path = os.path.join(UPLOAD_DIR, request.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found. Please upload the file first!")

    if request.filename.endswith(".csv"):
        df = pd.read_csv(file_path)
    else:
        df = pd.read_excel(file_path)

    try:
        if request.chart_type == "histogram":
            fig = px.histogram(df, x=request.x_column, color=request.color_column,
                             title=f"Histogram of {request.x_column}")
        elif request.chart_type == "scatter":
            fig = px.scatter(df, x=request.x_column, y=request.y_column,
                           color=request.color_column,
                           title=f"{request.x_column} vs {request.y_column}")
        elif request.chart_type == "bar":
            fig = px.bar(df, x=request.x_column, y=request.y_column,
                        color=request.color_column,
                        title=f"Bar Chart: {request.x_column}")
        elif request.chart_type == "box":
            fig = px.box(df, x=request.x_column, y=request.y_column,
                        color=request.color_column,
                        title=f"Box Plot of {request.x_column}")
        elif request.chart_type == "correlation":
            numeric_df = df.select_dtypes(include=[np.number])
            corr = numeric_df.corr()
            fig = px.imshow(corr, text_auto=True, title="Correlation Heatmap",
                          color_continuous_scale="RdBu_r")
        else:
            raise HTTPException(status_code=400, detail="Unsupported chart type!")

        fig.update_layout(template="plotly_white")
        return JSONResponse(content=json.loads(fig.to_json()))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/clean")
async def clean_data(file: UploadFile = File(...)):
    filename = file.filename
    contents = await file.read()
    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        elif filename.endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported format!")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    rows_before = len(df)
    missing_before = int(df.isnull().sum().sum())
    duplicates = int(df.duplicated().sum())

    df = df.drop_duplicates()
    df = df.fillna(df.median(numeric_only=True))
    df = df.fillna("Unknown")

    rows_after = len(df)
    missing_after = int(df.isnull().sum().sum())

    numeric_cols = df.select_dtypes(include=[np.number]).columns
    outliers_detected = 0
    for col in numeric_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        outliers = ((df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR))).sum()
        outliers_detected += int(outliers)

    prompt = f"""You are a data cleaning expert. Summarize the cleaning results in English:

Before cleaning:
- Rows: {rows_before}
- Missing values: {missing_before}
- Duplicates: {duplicates}

After cleaning:
- Rows: {rows_after}
- Missing values fixed: {missing_before - missing_after}
- Duplicates removed: {duplicates}
- Outliers detected: {outliers_detected}

Provide a brief summary of what was done and recommendations."""

    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )

    return make_response({
        "rows_before": rows_before,
        "rows_after": rows_after,
        "missing_fixed": missing_before - missing_after,
        "duplicates_removed": duplicates,
        "outliers_detected": outliers_detected,
        "ai_summary": message.content[0].text
    })
