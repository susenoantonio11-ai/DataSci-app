import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = "http://34.50.69.169:8000";

function EDAOtomatis({ uploadedFile, datasetInfo }) {
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('histogram');
  const [xColumn, setXColumn] = useState('');
  const [yColumn, setYColumn] = useState('');

  useEffect(() => {
    if (chartData && window.Plotly) {
      window.Plotly.newPlot('eda-chart', chartData.data, chartData.layout, { responsive: true });
    }
  }, [chartData]);

  const handleEDA = async () => {
    if (!uploadedFile) return alert("Please upload a file first!");
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", uploadedFile);
    try {
      const res = await axios.post(`${API}/analyze`, formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to run EDA!");
    }
    setLoading(false);
  };

  const handleChart = async () => {
    if (!datasetInfo || !xColumn) return alert("Please select X column!");
    setChartLoading(true);
    try {
      const res = await axios.post(`${API}/visualize`, {
        filename: datasetInfo.filename,
        chart_type: chartType,
        x_column: xColumn,
        y_column: yColumn || null,
        color_column: null
      });
      setChartData(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate chart!");
    }
    setChartLoading(false);
  };

  return (
    <div style={{ marginLeft: '240px', padding: '30px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>EDA Otomatis</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Automated Exploratory Data Analysis with AI insights</p>

      {!uploadedFile ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', border: '1px solid #e8ecf0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ color: '#1a1a2e' }}>No Dataset Found</h3>
          <p style={{ color: '#6b7280' }}>Please upload a dataset first</p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e8ecf0' }}>
              <h3 style={{ marginBottom: '16px', color: '#1a1a2e' }}>🤖 AI Analysis</h3>
              <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>Get comprehensive AI-powered insights about your dataset</p>
              <button onClick={handleEDA} disabled={loading} style={{
                backgroundColor: '#22c55e', color: 'white', border: 'none',
                borderRadius: '8px', padding: '10px 20px', fontWeight: '600', fontSize: '14px'
              }}>
                {loading ? "Analyzing..." : "🔍 Run EDA Analysis"}
              </button>
            </div>

            <div style={{ flex: 2, backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e8ecf0' }}>
              <h3 style={{ marginBottom: '16px', color: '#1a1a2e' }}>📈 Visualization</h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <select value={chartType} onChange={e => setChartType(e.target.value)}
                  style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #e8ecf0' }}>
                  <option value="histogram">Histogram</option>
                  <option value="scatter">Scatter Plot</option>
                  <option value="bar">Bar Chart</option>
                  <option value="box">Box Plot</option>
                  <option value="correlation">Correlation Heatmap</option>
                </select>
                {chartType !== 'correlation' && (
                  <select value={xColumn} onChange={e => setXColumn(e.target.value)}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #e8ecf0' }}>
                    <option value="">-- X Column --</option>
                    {datasetInfo?.columns?.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                )}
                {(chartType === 'scatter' || chartType === 'bar' || chartType === 'box') && (
                  <select value={yColumn} onChange={e => setYColumn(e.target.value)}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #e8ecf0' }}>
                    <option value="">-- Y Column --</option>
                    {datasetInfo?.columns?.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                )}
                <button onClick={handleChart} disabled={chartLoading} style={{
                  backgroundColor: '#8b5cf6', color: 'white', border: 'none',
                  borderRadius: '8px', padding: '8px 16px', fontWeight: '600', fontSize: '13px'
                }}>
                  {chartLoading ? "..." : "Generate"}
                </button>
              </div>
              <div id="eda-chart" style={{ width: '100%', minHeight: '300px' }}></div>
            </div>
          </div>

          {error && <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

          {result && (
            <div style={{ backgroundColor: '#f0fdf4', padding: '24px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              <h3 style={{ color: '#15803d', marginBottom: '12px' }}>🤖 AI Analysis Result</h3>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Arial', fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>
                {result.ai_analysis}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EDAOtomatis;
