import React from 'react'

export default function MessageList({ messages = [], loading }) {
  if (loading) return <div>Chargement messages…</div>
  return (
    <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #eee', padding: 8 }}>
      {messages.length === 0 && <div className="muted">Aucun message</div>}
      {messages.map((m) => {
        // accept both frontend-normalized and backend raw shapes
        const author = m.from || (m.expediteurId && (typeof m.expediteurId === 'object' ? (m.expediteurId.nom ? `${m.expediteurId.nom} ${m.expediteurId.prenom}` : m.expediteurId._id) : m.expediteurId)) || 'inconnu'
        const text = m.text || m.contenu || ''
        const date = m.createdAt || m.dateEnvoi || m.date || ''
        const read = typeof m.read !== 'undefined' ? m.read : (typeof m.estLu !== 'undefined' ? m.estLu : false)
        return (
          <div key={m.id || `${author}-${date}`} style={{ marginBottom: 8, opacity: read ? 0.8 : 1 }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{author} • {date ? new Date(date).toLocaleString() : '-'}</div>
            <div>{text}</div>
          </div>
        )
      })}
    </div>
  )
}
