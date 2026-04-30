import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV or XLSX file first!");
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("http://34.50.69.169:8000/upload", formData);
      setResult(res.data);
      setAnalysis(null);
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
      const res = await axios.post("http://34.50.69.169:8000/analyze", formData);
      setAnalysis(res.data.ai_analysis);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to analyze file!");
    }
    setAnalyzing(false);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "50px auto", fontFamily: "Arial", padding: "0 20px" }}>
      <h1 style={{ color: "#2c3e50" }}>🔬 DataSci App</h1>
      <p style={{ color: "#7f8c8d" }}>Upload and analyze your CSV/XLSX dataset with AI</p>

      <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
        <h3>Upload Dataset</h3>
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={(e) => { setFile(e.target.files[0]); setResult(null); setAnalysis(null); }}
          style={{ marginBottom: "10px" }}
        />
        <br />
        <small style={{ color: "#7f8c8d" }}>Supported formats: CSV and XLSX</small>
        <br /><br />

        <button
          onClick={handleUpload}
          disabled={loading}
          style={{ backgroundColor: "#2c3e50", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer", marginRight: "10px" }}
        >
          {loading ? "Uploading..." : "📂 Upload File"}
        </button>

        <button
          onClick={handleAnalyze}
          disabled={analyzing || !file}
          style={{ backgroundColor: "#27ae60", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          {analyzing ? "Analyzing..." : "🤖 Analyze with AI"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginBottom: "20px" }}>
          <h3>Upload Result</h3>
          <p>File Name: <strong>{result.filename}</strong></p>
          <p>Total Rows: <strong>{result.rows}</strong></p>
          <p>Columns: <strong>{result.columns.join(", ")}</strong></p>
          <h4>Data Preview (first 5 rows):</h4>
          <div style={{ overflowX: "auto" }}>
            <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  {result.columns.map((col) => (
                    <th key={col} style={{ backgroundColor: "#2c3e50", color: "white" }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.preview.map((row, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#f9f9f9" : "white" }}>
                    {result.columns.map((col) => (
                      <td key={col}>{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {analysis && (
        <div style={{ backgroundColor: "#eafaf1", padding: "20px", borderRadius: "10px", borderLeft: "5px solid #27ae60" }}>
          <h3>🤖 AI Analysis</h3>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "Arial", lineHeight: "1.6" }}>
            {analysis}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
