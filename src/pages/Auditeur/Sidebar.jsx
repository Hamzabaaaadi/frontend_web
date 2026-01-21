import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Tableau de bord', icon: '🏠' },
  { to: '/tasks', label: 'Tâches', icon: '🗂️' },
  { to: '/delegations', label: 'Mes délégations', icon: '🔁' },
  { to: '/profile', label: 'Profil', icon: '👤' }
]

export default function Sidebar() {
  const location = useLocation()
  return (
    <aside
      className="auditeur-sidebar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '240px',
        overflowY: 'auto',
        zIndex: 1000,
      }}
    >
      <div className="auditeur-brand">
        <div className="brand-logo">TM</div>
        <div className="brand-text">Taskme</div>
      </div>

      <nav className="auditeur-nav">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={"auditeur-nav-link " + (location.pathname === item.to ? 'active' : '')}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

    </aside>
  )
}
