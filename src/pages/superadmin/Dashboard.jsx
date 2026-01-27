import React, { useEffect, useState } from "react";
import * as svc from '../../services/superAdminService'
import axios from 'axios'
import * as tsvc from '../../services/tacheService'
import './dashboard.css'

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let mounted = true

    async function loadAll() {
      try {
        // base stats (users / vehicles)
        const base = await svc.getStats()

        // tasks
        const tasksResp = await tsvc.getTasks()
        const tasks = Array.isArray(tasksResp) ? tasksResp : (tasksResp && Array.isArray(tasksResp.taches) ? tasksResp.taches : [])
        const taskCounts = tasks.reduce((acc, t) => {
          const k = t.statut || 'UNKNOWN'
          acc[k] = (acc[k] || 0) + 1
          return acc
        }, {})

        // delegations (try API endpoint, fallback to empty)
        let delegations = []
        try {
          const basic = localStorage.getItem('basicAuth')
          const headers = {}
          if (basic) headers.Authorization = `Basic ${basic}`
          const API = import.meta.env.VITE_API_URL
          try {
            const r2 = await axios.get(`${API}/api/delegations`, { headers })
            const d = r2?.data || null
            delegations = Array.isArray(d) ? d : (d && Array.isArray(d.delegations) ? d.delegations : [])
          } catch (e) {
            // ignore
          }
        } catch (e) { /* ignore */ }
        const delegationCounts = delegations.reduce((acc, d) => {
          const s = d.statut || 'UNKNOWN'
          acc[s] = (acc[s] || 0) + 1
          return acc
        }, {})

        const merged = {
          ...base,
          taskCounts,
          delegationCounts
        }
        if (mounted) setStats(merged)
      } catch (err) {
        console.error('Error loading dashboard data', err)
      }
    }

    loadAll()
    return () => { mounted = false }
  }, [])

  return (
    <div className="sa-dashboard">
      <div className="sa-header">
        <div>
          <h1 className="sa-title">Tableau de bord Super Admin</h1>
          <div className="sa-sub">Vue d'ensemble et statistiques de la plateforme</div>
        </div>
      </div>

      <div className="sa-grid">
        <div className="sa-card">
          <div className="sa-accent accent-users" />
          <div className="card-icon">👥</div>
          <div className="label">Utilisateurs</div>
          <div className="value">{stats ? stats.totalUsers : '—'}</div>
          <div className="hint">Total des comptes sur la plateforme</div>
        </div>

        <div className="sa-card">
          <div className="sa-accent accent-vehicles" />
          <div className="card-icon">🚗</div>
          <div className="label">Véhicules (total)</div>
          <div className="value">{stats ? stats.totalVehicles : '—'}</div>
          <div className="hint">Parc total déclaré</div>
        </div>

        <div className="sa-card">
          <div className="sa-accent accent-available" />
          <div className="card-icon">🟢</div>
          <div className="label">Véhicules disponibles</div>
          <div className="value">{stats ? stats.vehiclesAvailable : '—'}</div>
          <div className="hint">Véhicules prêts à l'usage</div>
        </div>

        <div className="sa-card">
          <div className="sa-accent accent-pending" />
          <div className="card-icon">⏳</div>
          <div className="label">Tâches en attente</div>
          <div className="value">{stats ? (stats.taskCounts?.EN_ATTENTE || 0) : '—'}</div>
          <div className="hint">Tâches à affecter</div>
        </div>

        <div className="sa-card">
          <div className="sa-accent accent-assigned" />
          <div className="card-icon">✅</div>
          <div className="label">Tâches affectées</div>
          <div className="value">{stats ? (stats.taskCounts?.AFFECTEE || 0) : '—'}</div>
          <div className="hint">Tâches actuellement assignées</div>
        </div>

        <div className="sa-card">
          <div className="sa-accent accent-deleg" />
          <div className="card-icon">📮</div>
          <div className="label">Délégations en attente</div>
          <div className="value">{stats ? (stats.delegationCounts?.EN_ATTENTE || 0) : '—'}</div>
          <div className="hint">Demandes de délégation</div>
        </div>
      </div>
    </div>
  );
}
