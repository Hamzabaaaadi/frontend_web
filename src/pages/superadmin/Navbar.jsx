import React from "react";
import './dashboard.css'

export default function SuperAdminNavbar() {
  return (
    <div className="sa-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Administration globale</h2>
        <div style={{ width: 1, height: 28, background: '#eef2ff', opacity: .6 }} />
        <input placeholder="Rechercher..." style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #eef2ff' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ textAlign: 'right', marginRight: 8 }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Bonjour,</div>
          <div style={{ fontWeight: 700 }}>Super Admin</div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>SA</div>
      </div>
    </div>
  );
}
