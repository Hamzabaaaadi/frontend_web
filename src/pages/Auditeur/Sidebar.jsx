import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Tableau de bord', icon: '🏠' },
  { to: '/tasks', label: 'Tâches', icon: '🗂️' },
  { to: '/profile', label: 'Profil', icon: '👤' }
]

export default function Sidebar() {
  const location = useLocation()
  return (
    <aside className="auditeur-sidebar">
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
