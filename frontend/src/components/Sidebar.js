import React from 'react';

const menuItems = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard', section: 'MAIN' },
  { id: 'upload', icon: '⬆️', label: 'Upload Data', section: 'PIPELINE' },
  { id: 'cleaning', icon: '🧹', label: 'Auto Cleaning', section: 'PIPELINE' },
  { id: 'eda', icon: '🔍', label: 'EDA Otomatis', section: 'PIPELINE' },
  { id: 'ml', icon: '🧠', label: 'ML Training', section: 'MODELLING' },
  { id: 'insights', icon: '🤖', label: 'AI Insights', section: 'MODELLING' },
];

function Sidebar({ activePage, setActivePage }) {
  const sections = [...new Set(menuItems.map(i => i.section))];

  return (
    <div style={{
      width: '240px', minHeight: '100vh', backgroundColor: '#ffffff',
      borderRight: '1px solid #e8ecf0', padding: '0', display: 'flex',
      flexDirection: 'column', position: 'fixed', left: 0, top: 0, bottom: 0
    }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #e8ecf0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', backgroundColor: '#22c55e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📈</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#1a1a2e' }}>DataSci App</div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Data Intelligence Platform</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {sections.map(section => (
          <div key={section} style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#9ca3af', letterSpacing: '0.1em', padding: '0 8px', marginBottom: '6px' }}>
              {section}
            </div>
            {menuItems.filter(i => i.section === section).map(item => (
              <button key={item.id}
                onClick={() => setActivePage(item.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', border: 'none', borderRadius: '8px', marginBottom: '2px',
                  backgroundColor: activePage === item.id ? '#f0fdf4' : 'transparent',
                  color: activePage === item.id ? '#22c55e' : '#374151',
                  fontWeight: activePage === item.id ? '600' : '400',
                  fontSize: '14px', textAlign: 'left',
                  transition: 'all 0.2s'
                }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div style={{ padding: '16px', borderTop: '1px solid #e8ecf0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6b7280' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%' }}></div>
          <span>Kernel ready · Python 3.11</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
