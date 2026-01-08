import React from 'react'

export default function Header() {
  return (
    <header className="auditeur-header">
      <div className="header-left">
        <h2 className="page-title">Tableau Auditeur</h2>
        <p className="page-sub">Vue d'ensemble et tâches assignées</p>
      </div>

      <div className="header-right">
        <button className="icon-btn">
          🔔 <span className="notif-badge">3</span>
        </button>

        <div className="user-box">
          <div className="avatar">AU</div>
          <div className="user-info">
            <div className="user-name">Auditeur</div>
            <div className="user-role">Auditeur</div>
          </div>
        </div>
      </div>
    </header>
  )
}
