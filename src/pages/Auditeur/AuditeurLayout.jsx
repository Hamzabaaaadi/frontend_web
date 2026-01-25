import React from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AuditeurLayout({ children }) {
  const containerStyle = { fontFamily: 'Arial, sans-serif' }
  const mainStyle = { padding: '16px', overflowY: 'auto', background: '#f5f7fb', minHeight: '100vh' }

  return (
    <div style={containerStyle}>
      <Sidebar />
      <div style={{ marginLeft: '240px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={mainStyle}>{children}</main>
      </div>
    </div>
  )
}
