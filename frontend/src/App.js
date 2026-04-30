import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import UploadData from './pages/UploadData';
import AutoCleaning from './pages/AutoCleaning';
import EDAOtomatis from './pages/EDAOtomatis';
import MLTraining from './pages/MLTraining';
import AIInsights from './pages/AIInsights';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);

  const renderPage = () => {
    switch(activePage) {
      case 'dashboard': return <Dashboard setActivePage={setActivePage} datasetInfo={datasetInfo} />;
      case 'upload': return <UploadData setUploadedFile={setUploadedFile} setDatasetInfo={setDatasetInfo} setActivePage={setActivePage} />;
      case 'cleaning': return <AutoCleaning uploadedFile={uploadedFile} datasetInfo={datasetInfo} />;
      case 'eda': return <EDAOtomatis uploadedFile={uploadedFile} datasetInfo={datasetInfo} />;
      case 'ml': return <MLTraining uploadedFile={uploadedFile} datasetInfo={datasetInfo} />;
      case 'insights': return <AIInsights uploadedFile={uploadedFile} datasetInfo={datasetInfo} />;
      default: return <Dashboard setActivePage={setActivePage} datasetInfo={datasetInfo} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f6fa' }}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div style={{ flex: 1, overflow: 'auto' }}>
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
