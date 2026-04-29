import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    axios.get('http://34.50.69.169:8000/health')
      .then(res => setStatus(res.data.status))
      .catch(() => setStatus('Backend not connected'));
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>DataSci App</h1>
      <p>Backend Status: <strong>{status}</strong></p>
    </div>
  );
}

export default App;
