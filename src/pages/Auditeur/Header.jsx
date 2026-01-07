import React from 'react'

const headerStyle = {
  height: 64,
  padding: '0 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#ffffff',
  borderBottom: '1px solid #e6edf3'
}

export default function Header() {
  return (
    <header style={headerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Tableau Auditeur</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#334155' }}>Bonjour, Auditeur</span>
        <button onClick={() => console.log('logout')} style={{ padding: '6px 10px' }}>Déconnexion</button>
      </div>
    </header>
  )
}
