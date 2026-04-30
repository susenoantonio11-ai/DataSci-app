import React, { useState } from 'react';
import axios from 'axios';

const API = "http://34.50.69.169:8000";

function AIInsights({ uploadedFile, datasetInfo }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInsights = async () => {
    if (!uploadedFile) return alert("Please upload a file first!");
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", uploadedFile);
    try {
      const res = await axios.post(`${API}/analyze`, formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to get AI insights!");
    }
    setLoading(false);
  };

  return (
    <div style={{ marginLeft: '240px', padding: '30px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>AI Insights</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Get deep AI-powered insights and recommendations for your dataset</p>

      {!uploadedFile ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', border: '1px solid #e8ecf0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
          <h3 style={{ color: '#1a1a2e' }}>No Dataset Found</h3>
          <p style={{ color: '#6b7280' }}>Please upload a dataset first</p>
        </div>
      ) : (
        <div>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e8ecf0', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: '#1a1a2e', marginBottom: '4px' }}>Dataset: {datasetInfo?.filename}</h3>
                <p style={{ color: '#6b7280', fontSize: '13px' }}>{datasetInfo?.rows?.toLocaleString()} rows · {datasetInfo?.columns?.length} columns</p>
              </div>
              <button onClick={handleInsights} disabled={loading} style={{
                backgroundColor: '#22c55e', color: 'white', border: 'none',
                borderRadius: '8px', padding: '12px 24px', fontWeight: '600', fontSize: '14px'
              }}>
                {loading ? "Analyzing..." : "🤖 Get AI Insights"}
              </button>
            </div>
          </div>

          {error && <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

          {result && (
            <div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                {[
                  { icon: '📊', label: 'Total Rows', value: result.summary?.rows?.toLocaleString(), color: '#22c55e' },
                  { icon: '📋', label: 'Total Columns', value: result.summary?.columns?.length, color: '#3b82f6' },
                  { icon: '❓', label: 'Missing Values', value: Object.values(result.summary?.missing_values || {}).reduce((a, b) => a + b, 0), color: '#f59e0b' },
                ].map((item, i) => (
                  <div key={i} style={{ flex: 1, backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e8ecf0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '32px' }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.label}</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: item.color }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e8ecf0' }}>
                <h3 style={{ marginBottom: '16px', color: '#1a1a2e' }}>🤖 AI Analysis & Recommendations</h3>
                <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Arial', fontSize: '14px', color: '#374151', lineHeight: '1.8' }}>
                    {result.ai_analysis}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIInsights;
