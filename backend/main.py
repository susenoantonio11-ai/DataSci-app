from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import os
import anthropic

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
            raise HTTPException(
                status_code=400,
                detail="Unsupported format. Please use CSV or XLSX!"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(contents)

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
            raise HTTPException(
                status_code=400,
                detail="Unsupported format. Please use CSV or XLSX!"
            )
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
