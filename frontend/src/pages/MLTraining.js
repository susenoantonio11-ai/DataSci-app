import React, { useState } from 'react';
import axios from 'axios';

const API = "http://34.50.69.169:8000";

function MLTraining({ uploadedFile, datasetInfo }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [targetColumn, setTargetColumn] = useState('');
  const [modelType, setModelType] = useState('random_forest');
  const [taskType, setTaskType] = useState('classification');

  const handleTrain = async () => {
    if (!datasetInfo) return alert("Please upload a file first!");
    if (!targetColumn) return alert("Please select a target column!");
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API}/train`, {
        filename: datasetInfo.filename,
        target_column: targetColumn,
        model_type: modelType,
        task_type: taskType
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to train model!");
    }
    setLoading(false);
  };

  return (
    <div style={{ marginLeft: '240px', padding: '30px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>ML Training</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Train machine learning models on your dataset</p>

      {!datasetInfo ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', border: '1px solid #e8ecf0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
          <h3 style={{ color: '#1a1a2e' }}>No Dataset Found</h3>
          <p style={{ color: '#6b7280' }}>Please upload a dataset first</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e8ecf0', marginBottom: '16px' }}>
              <h3 style={{ marginBottom: '16px', color: '#1a1a2e' }}>Model Configuration</h3>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Target Column</label>
                <select value={targetColumn} onChange={e => setTargetColumn(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e8ecf0', fontSize: '14px' }}>
                  <option value="">-- Select Target Column --</option>
                  {datasetInfo?.columns?.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Task Type</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['classification', 'regression'].map(type => (
                    <button key={type} onClick={() => setTaskType(type)} style={{
                      flex: 1, padding: '10px', border: '2px solid',
                      borderColor: taskType === type ? '#22c55e' : '#e8ecf0',
                      borderRadius: '8px', backgroundColor: taskType === type ? '#f0fdf4' : '#fff',
                      color: taskType === type ? '#15803d' : '#374151',
                      fontWeight: taskType === type ? '600' : '400', fontSize: '13px'
                    }}>{type.charAt(0).toUpperCase() + type.slice(1)}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Model Type</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { value: 'random_forest', label: 'Random Forest' },
                    { value: 'linear', label: 'Linear / Logistic' }
                  ].map(m => (
                    <button key={m.value} onClick={() => setModelType(m.value)} style={{
                      flex: 1, padding: '10px', border: '2px solid',
                      borderColor: modelType === m.value ? '#8b5cf6' : '#e8ecf0',
                      borderRadius: '8px', backgroundColor: modelType === m.value ? '#f5f3ff' : '#fff',
                      color: modelType === m.value ? '#7c3aed' : '#374151',
                      fontWeight: modelType === m.value ? '600' : '400', fontSize: '13px'
                    }}>{m.label}</button>
                  ))}
                </div>
              </div>

              <button onClick={handleTrain} disabled={loading} style={{
                width: '100%', backgroundColor: '#8b5cf6', color: 'white', border: 'none',
                borderRadius: '8px', padding: '12px', fontWeight: '600', fontSize: '14px'
              }}>
                {loading ? "Training Model..." : "🚀 Train Model"}
              </button>
            </div>

            {error && <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px' }}>{error}</div>}
          </div>

          {result && (
            <div style={{ flex: 2, backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e8ecf0' }}>
              <h3 style={{ marginBottom: '16px', color: '#1a1a2e' }}>🎯 Training Results</h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Model', value: result.model_type.replace('_', ' ').toUpperCase(), color: '#8b5cf6' },
                  { label: result.metric_name, value: `${(result.score * 100).toFixed(2)}%`, color: '#22c55e' },
                  { label: 'Train Size', value: result.train_size, color: '#3b82f6' },
                  { label: 'Test Size', value: result.test_size, color: '#f59e0b' },
                ].map((item, i) => (
                  <div key={i} style={{ flex: 1, backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px', borderLeft: `4px solid ${item.color}` }}>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{item.label}</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {Object.keys(result.feature_importance).length > 0 && (
                <div>
                  <h4 style={{ marginBottom: '12px', color: '#374151' }}>Feature Importance</h4>
                  {Object.entries(result.feature_importance)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([feature, importance]) => (
                      <div key={feature} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', color: '#374151' }}>{feature}</span>
                          <span style={{ fontSize: '13px', color: '#8b5cf6', fontWeight: '600' }}>{(importance * 100).toFixed(2)}%</span>
                        </div>
                        <div style={{ backgroundColor: '#f3f4f6', borderRadius: '4px', height: '8px' }}>
                          <div style={{ backgroundColor: '#8b5cf6', height: '8px', borderRadius: '4px', width: `${importance * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MLTraining;
