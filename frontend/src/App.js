import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Pilih file CSV atau XLSX dulu!");
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("http://34.50.69.169:8000/upload", formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal upload file!");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "50px auto", fontFamily: "Arial" }}>
      <h1 style={{ color: "#2c3e50" }}>DataSci App</h1>
      <h3>Upload Dataset</h3>

      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ marginBottom: "10px" }}
      />
      <br />
      <small style={{ color: "#7f8c8d" }}>Format yang didukung: CSV dan XLSX</small>
      <br /><br />
      <button
        onClick={handleUpload}
        disabled={loading}
        style={{
          backgroundColor: "#2c3e50",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        {loading ? "Uploading..." : "Upload File"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
      )}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Hasil Upload</h3>
          <p>Nama File: <strong>{result.filename}</strong></p>
          <p>Jumlah Baris: <strong>{result.rows}</strong></p>
          <p>Kolom: <strong>{result.columns.join(", ")}</strong></p>
          <h4>Preview Data (5 baris pertama):</h4>
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
    </div>
  );
}

export default App;
