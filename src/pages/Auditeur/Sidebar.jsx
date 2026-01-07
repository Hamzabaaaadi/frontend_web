import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const navStyle = {
  width: 220,
  background: '#1f2937',
  color: '#fff',
  padding: '20px 12px',
  boxSizing: 'border-box'
}

const baseLink = {
  display: 'block',
  color: '#e5e7eb',
  padding: '10px 12px',
  textDecoration: 'none',
  borderRadius: 6,
  marginBottom: 6,
  cursor: 'pointer'
}

const navItems = [
  { to: '/dashboard', label: 'Tableau de bord' },
  { to: '/tasks', label: 'Tâches' },
  { to: '/profile', label: 'Profil' }
  // Ajoutez ici d'autres routes si besoin
]

export default function Sidebar() {
  const location = useLocation()
  return (
    <aside style={navStyle}>
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>Auditeur</h3>
      <nav>
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            style={{
              ...baseLink,
              background: location.pathname === item.to ? '#374151' : 'transparent',
              color: location.pathname === item.to ? '#fff' : baseLink.color
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
