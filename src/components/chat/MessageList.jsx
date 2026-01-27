import React, { useRef, useEffect } from 'react'

export default function MessageList({ messages = [], loading, currentUser }) {
  const containerRef = useRef(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);
  if (loading) return <div>Chargement messages…</div>;
  return (
    <div ref={containerRef} style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #eee', padding: 8 }}>
      {messages.length === 0 && <div className="muted">Aucun message</div>}
      {messages.map((m) => {
        // Get author display name
        const author = (m.expediteur ? (typeof m.expediteur === 'object' ? `${m.expediteur.nom} ${m.expediteur.prenom}` : m.expediteur) : 'inconnu');
        const text = m.text || m.contenu || '';
        const date = m.createdAt || m.dateEnvoi || m.date || '';
        const read = typeof m.read !== 'undefined' ? m.read : (typeof m.estLu !== 'undefined' ? m.estLu : false);
        // Extract sender id for comparison
        let senderId = null;
        if (m.expediteurId && typeof m.expediteurId === 'object') {
          senderId = m.expediteurId._id || m.expediteurId.id || m.expediteurId.userId || m.expediteurId.email;
        } else if (m.expediteurId) {
          senderId = m.expediteurId;
        } else if (m.fromId) {
          senderId = m.fromId;
        }
        // fallback: if message sent just now, use currentUser
        if (!senderId && m.from === currentUser) senderId = currentUser;
        // Align right if currentUser is the sender
        const isMine = currentUser && senderId && String(senderId) === String(currentUser);
        return (
          <div
            key={m.id || `${author}-${date}`}
            style={{
              marginBottom: 8,
              opacity: read ? 0.8 : 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: isMine ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{ fontSize: 12, color: '#6b7280', textAlign: isMine ? 'right' : 'left' }}>{author} • {date ? new Date(date).toLocaleString() : '-'}</div>
            <div
              style={{
                background: isMine ? '#dbeafe' : '#f3f4f6',
                color: '#1e293b',
                borderRadius: 12,
                padding: '6px 14px',
                maxWidth: 320,
                minWidth: 40,
                textAlign: 'left',
                boxShadow: isMine ? '0 2px 8px #60a5fa22' : '0 2px 8px #aaa2',
              }}
            >
              {text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
