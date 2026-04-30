import React, { useState } from 'react';
import axios from 'axios';

const API = "http://34.50.69.169:8000";

function AutoCleaning({ uploadedFile, datasetInfo }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClean = async () => {
    if (!uploadedFile) return alert("Please upload a file first!");
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", uploadedFile);
    try {
      const res = await axios.post(`${API}/clean`, formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to clean data!");
    }
    setLoading(false);
  };

  return (
    <div style={{ marginLeft: '240px', padding: '30px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>Auto Cleaning</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Automatically detect and fix data quality issues</p>

      {!uploadedFile ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', border: '1px solid #e8ecf0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧹</div>
          <h3 style={{ color: '#1a1a2e', marginBottom: '8px' }}>No Dataset Found</h3>
          <p style={{ color: '#6b7280' }}>Please upload a dataset first from Upload Data page</p>
        </div>
      ) : (
        <div>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e8ecf0', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: '#1a1a2e' }}>Dataset: {datasetInfo?.filename}</h3>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Total Rows', value: datasetInfo?.rows?.toLocaleString() },
                { label: 'Total Columns', value: datasetInfo?.columns?.length },
              ].map((item, i) => (
                <div key={i} style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px', flex: 1 }}>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.label}</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e' }}>{item.value}</div>
                </div>
              ))}
            </div>
            <button onClick={handleClean} disabled={loading} style={{
              backgroundColor: '#3b82f6', color: 'white', border: 'none',
              borderRadius: '8px', padding: '12px 24px', fontWeight: '600', fontSize: '14px'
            }}>
              {loading ? "Cleaning..." : "🧹 Run Auto Cleaning"}
            </button>
          </div>

          {error && <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

          {result && (
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e8ecf0' }}>
              <h3 style={{ marginBottom: '16px', color: '#1a1a2e' }}>✅ Cleaning Results</h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Missing Values Fixed', value: result.missing_fixed, color: '#22c55e' },
                  { label: 'Duplicates Removed', value: result.duplicates_removed, color: '#3b82f6' },
                  { label: 'Outliers Detected', value: result.outliers_detected, color: '#f59e0b' },
                  { label: 'Rows After Clean', value: result.rows_after, color: '#8b5cf6' },
                ].map((item, i) => (
                  <div key={i} style={{ flex: 1, backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px', borderLeft: `4px solid ${item.color}` }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.label}</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ color: '#15803d', marginBottom: '8px' }}>AI Cleaning Summary</h4>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Arial', fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>
                  {result.ai_summary}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AutoCleaning;
