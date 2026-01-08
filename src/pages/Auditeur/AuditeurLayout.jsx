import React from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AuditeurLayout({ children }) {
  const containerStyle = { display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }
  const mainStyle = { flex: 1, padding: '16px', overflowY: 'auto', background: '#f5f7fb' }

  return (
    <div style={containerStyle}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={mainStyle}>{children}</main>
      </div>
    </div>
  )
}
