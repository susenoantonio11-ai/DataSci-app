import React from 'react';

function StatCard({ icon, title, value, sub, color }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', flex: 1, border: '1px solid #e8ecf0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>{title}</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e' }}>{value}</div>
          <div style={{ fontSize: '12px', color: '#22c55e', marginTop: '6px' }}>{sub}</div>
        </div>
        <div style={{ fontSize: '28px' }}>{icon}</div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, desc, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      backgroundColor: '#fff', border: '1px solid #e8ecf0', borderRadius: '12px',
      padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '8px', cursor: 'pointer', transition: 'all 0.2s', flex: 1
    }}>
      <span style={{ fontSize: '28px' }}>{icon}</span>
      <span style={{ fontWeight: '600', fontSize: '13px', color: '#1a1a2e' }}>{label}</span>
      <span style={{ fontSize: '11px', color: '#6b7280' }}>{desc}</span>
    </button>
  );
}

function Dashboard({ setActivePage, datasetInfo }) {
  const recentActivity = [
    { color: '#22c55e', text: 'App started successfully', time: 'Just now' },
    { color: '#3b82f6', text: 'Docker containers running', time: '5 min ago' },
    { color: '#8b5cf6', text: 'Database connected', time: '5 min ago' },
    { color: '#f59e0b', text: 'System ready for data upload', time: '5 min ago' },
  ];

  return (
    <div style={{ marginLeft: '240px', padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e' }}>Good morning, Data Scientist! 👋</h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>Welcome back to your data science workspace.</p>
        </div>
        <button onClick={() => setActivePage('upload')} style={{
          backgroundColor: '#22c55e', color: 'white', border: 'none',
          borderRadius: '8px', padding: '10px 20px', fontWeight: '600', fontSize: '14px'
        }}>+ New Project</button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <StatCard icon="🗄️" title="Datasets" value={datasetInfo ? '1' : '0'} sub="Total uploaded datasets" />
        <StatCard icon="📁" title="Projects" value="0" sub="Active projects" />
        <StatCard icon="🧠" title="Models" value="0" sub="Trained models" />
        <StatCard icon="🎯" title="Accuracy (Avg.)" value="N/A" sub="Average model accuracy" />
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ flex: 2, backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e8ecf0' }}>
          <h3 style={{ marginBottom: '16px', color: '#1a1a2e' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <QuickAction icon="⬆️" label="Upload Data" desc="Import your dataset" onClick={() => setActivePage('upload')} />
            <QuickAction icon="🧹" label="Auto Cleaning" desc="Clean your data" onClick={() => setActivePage('cleaning')} />
            <QuickAction icon="🔍" label="EDA Otomatis" desc="Explore your data" onClick={() => setActivePage('eda')} />
            <QuickAction icon="🤖" label="AI Insights" desc="Get AI insights" onClick={() => setActivePage('insights')} />
          </div>
        </div>

        <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e8ecf0' }}>
          <h3 style={{ marginBottom: '16px', color: '#1a1a2e' }}>Dataset Summary</h3>
          {datasetInfo ? (
            <div>
              <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                <strong>File:</strong> {datasetInfo.filename}
              </div>
              <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                <strong>Rows:</strong> {datasetInfo.rows?.toLocaleString()}
              </div>
              <div style={{ fontSize: '14px', color: '#374151' }}>
                <strong>Columns:</strong> {datasetInfo.columns?.length}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
              <div>No dataset uploaded yet</div>
              <button onClick={() => setActivePage('upload')} style={{
                marginTop: '12px', backgroundColor: '#22c55e', color: 'white',
                border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px'
              }}>Upload Now</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e8ecf0' }}>
        <h3 style={{ marginBottom: '16px', color: '#1a1a2e' }}>Recent Activity</h3>
        {recentActivity.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < recentActivity.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: item.color, borderRadius: '50%' }}></div>
              <span style={{ fontSize: '14px', color: '#374151' }}>{item.text}</span>
            </div>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
