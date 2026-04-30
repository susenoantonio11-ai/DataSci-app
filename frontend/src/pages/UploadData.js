import React, { useState } from 'react';
import axios from 'axios';

const API = "http://34.50.69.169:8000";

function UploadData({ setUploadedFile, setDatasetInfo, setActivePage }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${API}/upload`, formData);
      setResult(res.data);
      setUploadedFile(file);
      setDatasetInfo(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to upload file!");
    }
    setLoading(false);
  };

  return (
    <div style={{ marginLeft: '240px', padding: '30px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>Upload Data</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Import your dataset in CSV or XLSX format</p>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '30px', border: '2px dashed #e8ecf0', textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
        <h3 style={{ color: '#1a1a2e', marginBottom: '8px' }}>Drop your file here or browse</h3>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>Supported formats: CSV and XLSX</p>
        <input type="file" accept=".csv,.xlsx"
          onChange={(e) => { setFile(e.target.files[0]); setResult(null); }}
          style={{ marginBottom: '16px' }} />
        <br />
        <button onClick={handleUpload} disabled={loading} style={{
          backgroundColor: '#22c55e', color: 'white', border: 'none',
          borderRadius: '8px', padding: '12px 30px', fontWeight: '600', fontSize: '14px'
        }}>
          {loading ? "Uploading..." : "⬆️ Upload File"}
        </button>
      </div>

      {error && <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

      {result && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e8ecf0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: '#1a1a2e' }}>✅ Upload Successful</h3>
            <button onClick={() => setActivePage('cleaning')} style={{
              backgroundCo
