import React, { useEffect, useState } from 'react'
import { getAffectations } from '../../services/affectationService'
import { getDelegations } from '../../services/affectationService'

const containerStyle = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }
const cardStyle = { background: '#fff', padding: 18, borderRadius: 10, boxShadow: '0 6px 18px rgba(2,6,23,0.06)', minHeight: 110, display: 'flex', flexDirection: 'column', justifyContent: 'center' }

export default function Dashboard() {
  const [affectations, setAffectations] = useState([])
  const [delegations, setDelegations] = useState([])

  useEffect(() => {
    let mounted = true
    getAffectations().then((r) => { if (mounted) setAffectations(r || []) }).catch(() => { if (mounted) setAffectations([]) })
    getDelegations().then((d) => { if (mounted) setDelegations(d || []) }).catch(() => { if (mounted) setDelegations([]) })
    return () => { mounted = false }
  }, [])

  const total = affectations.length
  const accepted = affectations.filter(a => a.statut === 'ACCEPTEE').length
  const refused = affectations.filter(a => a.statut === 'REFUSEE').length
  const pending = affectations.filter(a => a.statut === 'EN_ATTENTE').length
  const delegationsCount = delegations.length
  const delegatedTasks = affectations.filter(a => a.statut === 'DELEGUEE').length

  return (
    <div>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ color: '#6b7280' }}>Nombre de tâches</div>
          <div style={{ fontSize: 26, fontWeight: '700', color: '#0f172a' }}>{total}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ color: '#6b7280' }}>Tâches acceptées</div>
          <div style={{ fontSize: 26, fontWeight: '700', color: '#065f46' }}>{accepted}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ color: '#6b7280' }}>Tâches refusées</div>
          <div style={{ fontSize: 26, fontWeight: '700', color: '#ef4444' }}>{refused}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ color: '#6b7280' }}>Tâches en attente</div>
          <div style={{ fontSize: 26, fontWeight: '700', color: '#0f172a' }}>{pending}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ color: '#6b7280' }}>Nombre de délégations</div>
          <div style={{ fontSize: 26, fontWeight: '700', color: '#92400e' }}>{delegationsCount}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ color: '#6b7280' }}>Tâches déléguées</div>
          <div style={{ fontSize: 26, fontWeight: '700', color: '#92400e' }}>{delegatedTasks}</div>
        </div>
      </div>
    </div>
  )
}
