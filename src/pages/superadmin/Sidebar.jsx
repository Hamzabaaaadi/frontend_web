import React from "react";
import { Link, useLocation } from "react-router-dom";
import './dashboard.css'

export default function SuperAdminSidebar() {
  const loc = useLocation()
  return (
    <aside className="sidebar sa-sidebar">
      <div className="brand">
        <div className="brand-logo">SA</div>
        <div className="brand-text">Super Admin</div>
      </div>
      <nav>
        <Link to="/dashboard" className={loc.pathname === '/dashboard' || loc.pathname === '/' ? 'active' : ''}>
          <span className="sa-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3v6h8V3h-8zM3 21h8v-6H3v6z" fill="currentColor"/></svg>
          </span>
          <span className="sa-label">Dashboard</span>
        </Link>
        <Link to="/users" className={loc.pathname === '/users' ? 'active' : ''}>
          <span className="sa-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>
          </span>
          <span className="sa-label">Utilisateurs</span>
        </Link>
        <Link to="/vehicles" className={loc.pathname === '/vehicles' ? 'active' : ''}>
          <span className="sa-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 16c0 .88.39 1.67 1 2.22V20h2v-1h6v1h2v-1.78c.61-.55 1-1.34 1-2.22V7H5v9zM7 9h10v3H7V9z" fill="currentColor"/></svg>
          </span>
          <span className="sa-label">Parc automobile</span>
        </Link>
      </nav>
    </aside>
  );
}
