import React, { useEffect, useState } from "react";
import * as svc from '../../services/superAdminService'

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let mounted = true
    svc.getStats().then((s) => { if (mounted) setStats(s) }).catch(() => {}).finally(() => {})
    return () => { mounted = false }
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0 }}>Tableau de bord Super Admin</h1>
          <div style={{ color: '#64748b' }}>Vue d'ensemble et statistiques de la plateforme</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ background: '#fff', padding: 18, borderRadius: 12, boxShadow: '0 6px 24px rgba(2,6,23,0.06)' }}>
          <div style={{ color: '#6b7280' }}>Utilisateurs</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{stats ? stats.totalUsers : '—'}</div>
        </div>

        <div style={{ background: '#fff', padding: 18, borderRadius: 12, boxShadow: '0 6px 24px rgba(2,6,23,0.06)' }}>
          <div style={{ color: '#6b7280' }}>Véhicules (total)</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{stats ? stats.totalVehicles : '—'}</div>
        </div>

        <div style={{ background: '#fff', padding: 18, borderRadius: 12, boxShadow: '0 6px 24px rgba(2,6,23,0.06)' }}>
          <div style={{ color: '#6b7280' }}>Véhicules disponibles</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{stats ? stats.vehiclesAvailable : '—'}</div>
        </div>
      </div>
    </div>
  );
}
