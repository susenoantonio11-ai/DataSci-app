import React, { useState } from 'react';
import axios from 'axios';

const API = "http://34.50.69.169:8000";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [trainLoading, setTrainLoading] = useState(false);
  const [error, setError] = useState(null);
  const [targetColumn, setTargetColumn] = useState("");
  const [modelType, setModelType] = useState("random_forest");
  const [taskType, setTaskType] = useState("classification");
  const [activeTab, setActiveTab] = useState("upload");

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV or XLSX file first!");
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${API}/upload`, formData);
      setResult(res.data);
      setAnalysis(null);
      setTraining(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to upload file!");
    }
    setLoading(false);
  };

  const handleAnalyze = async () => {
    if (!file) return alert("Please upload a file first!");
    setAnalyzing(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${API}/analyze`, formData);
      setAnalysis(res.data.ai_analysis);
      setActiveTab("analysis");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to analyze file!");
    }
    setAnalyzing(false);
  };

  const handleTrain = async () => {
    if (!result) return alert("Please upload a file first!");
    if (!targetColumn) return alert("Please select a target column!");
    setTrainLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API}/train`, {
        filename: result.filename,
        target_column: targetColumn,
        model_type: modelType,
        task_type: taskType
      });
      setTraining(res.data);
      setActiveTab("training");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to train model!");
    }
    setTrainLoading(false);
  };

  const tabStyle = (tab) => ({
    padding: "10px 20px",
    border: "none",
    cursor: "pointer",
    borderBottom: activeTab === tab ? "3px solid #2c3e50" : "3px solid transparent",
    backgroundColor: "transparent",
    fontWeight: activeTab === tab ? "bold" : "normal",
    color: activeTab === tab ? "#2c3e50" : "#7f8c8d"
  });

  return (
    <div style={{ maxWidth: "950px", margin: "30px auto", fontFamily: "Arial", padding: "0 20px" }}>
      <div style={{ backgroundColor: "#2c3e50", padding: "20px", borderRadius: "10px", marginBottom: "20px", color: "white" }}>
        <h1 style={{ margin: 0 }}>🔬 DataSci App</h1>
        <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}>Upload, Analyze and Train ML Models with AI</p>
      </div>

      <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
        <h3>Upload Dataset</h3>
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={(e) => { setFile(e.target.files[0]); setResult(null); setAnalysis(null); setTraining(null); }}
          style={{ marginBottom: "10px" }}
        />
        <br />
        <small style={{ color: "#7f8c8d" }}>Supported formats: CSV and XLSX</small>
        <br /><br />
        <button onClick={handleUpload} disabled={loading}
          style={{ backgroundColor: "#2c3e50", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer", marginRight: "10px" }}>
          {loading ? "Uploading..." : "📂 Upload File"}
        </button>
        <button onClick={handleAnalyze} disabled={analyzing || !file}
          style={{ backgroundColor: "#27ae60", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          {analyzing ? "Analyzing..." : "🤖 Analyze with AI"}
        </button>
      </div>

      {error && <p style={{ color: "red", padding: "10px", backgroundColor: "#fdecea", borderRadius: "5px" }}>{error}</p>}

      {result && (
        <div style={{ marginBottom: "10px" }}>
          <div style={{ borderBottom: "1px solid #ddd", marginBottom: "20px" }}>
            <button style={tabStyle("upload")} onClick={() => setActiveTab("upload")}>📊 Data Preview</button>
            <button style={tabStyle("analysis")} onClick={() => setActiveTab("analysis")}>🤖 AI Analysis</button>
            <button style={tabStyle("training")} onClick={() => setActiveTab("training")}>🧠 ML Training</button>
          </div>

          {activeTab === "upload" && (
            <div>
              <p>File: <strong>{result.filename}</strong> | Rows: <strong>{result.rows}</strong> | Columns: <strong>{result.columns.length}</strong></p>
              <div style={{ overflowX: "auto" }}>
                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead>
                    <tr>{result.columns.map((col) => (
                      <th key={col} style={{ backgroundColor: "#2c3e50", color: "white" }}>{col}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {result.preview.map((row, i) => (
                      <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#f9f9f9" : "white" }}>
                        {result.columns.map((col) => <td key={col}>{row[col]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "analysis" && (
            <div style={{ backgroundColor: "#eafaf1", padding: "20px", borderRadius: "10px", borderLeft: "5px solid #27ae60" }}>
              <h3>🤖 AI Analysis Result</h3>
              {analysis
                ? <pre style={{ whiteSpace: "pre-wrap", fontFamily: "Arial", lineHeight: "1.6" }}>{analysis}</pre>
                : <p style={{ color: "#7f8c8d" }}>Click "Analyze with AI" button to get AI insights.</p>}
            </div>
          )}

          {activeTab === "training" && (
            <div>
              <div style={{ backgroundColor: "#f0f4f8", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
                <h3>🧠 Train Machine Learning Model</h3>
                <div style={{ marginBottom: "15px" }}>
                  <label><strong>Target Column:</strong></label><br />
                  <select value={targetColumn} onChange={(e) => setTargetColumn(e.target.value)}
                    style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ddd", width: "100%", marginTop: "5px" }}>
                    <option value="">-- Select Target Column --</option>
                    {result.columns.map((col) => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label><strong>Task Type:</strong></label><br />
                  <select value={taskType} onChange={(e) => setTaskType(e.target.value)}
                    style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ddd", width: "100%", marginTop: "5px" }}>
                    <option value="classification">Classification</option>
                    <option value="regression">Regression</option>
                  </select>
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label><strong>Model Type:</strong></label><br />
                  <select value={modelType} onChange={(e) => setModelType(e.target.value)}
                    style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ddd", width: "100%", marginTop: "5px" }}>
                    <option value="random_forest">Random Forest</option>
                    <option value="linear">Logistic / Linear Regression</option>
                  </select>
                </div>
                <button onClick={handleTrain} disabled={trainLoading}
                  style={{ backgroundColor: "#8e44ad", color: "white", padding: "10px 25px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                  {trainLoading ? "Training..." : "🚀 Train Model"}
                </button>
              </div>

              {training && (
                <div style={{ backgroundColor: "#f5eef8", padding: "20px", borderRadius: "10px", borderLeft: "5px solid #8e44ad" }}>
                  <h3>🎯 Training Results</h3>
                  <p>Model: <strong>{training.model_type.replace("_", " ").toUpperCase()}</strong></p>
                  <p>Task: <strong>{training.task_type.toUpperCase()}</strong></p>
                  <p>Target Column: <strong>{training.target_column}</strong></p>
                  <p>Training Size: <strong>{training.train_size} rows</strong></p>
                  <p>Testing Size: <strong>{training.test_size} rows</strong></p>
                  <p style={{ fontSize: "20px" }}>{training.metric_name}: <strong style={{ color: "#8e44ad" }}>{(training.score * 100).toFixed(2)}%</strong></p>

                  {Object.keys(training.feature_importance).length > 0 && (
                    <div>
                      <h4>Feature Importance:</h4>
                      {Object.entries(training.feature_importance)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 10)
                        .map(([feature, importance]) => (
                          <div key={feature} style={{ marginBottom: "8px" }}>
                            <span style={{ display: "inline-block", width: "200px" }}>{feature}</span>
                            <div style={{ display: "inline-block", backgroundColor: "#8e44ad", height: "15px", width: `${importance * 300}px`, borderRadius: "3px", verticalAlign: "middle" }}></div>
                            <span style={{ marginLeft: "10px" }}>{(importance * 100).toFixed(2)}%</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
