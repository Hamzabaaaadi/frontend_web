import React, { useEffect, useState } from "react";
import Select from 'react-select';
import { Link, useLocation } from "react-router-dom";
import Modal from '../../components/common/Modal'
import './dashboard.css'

export default function SuperAdminSidebar() {
    const [users, setUsers] = useState([]);
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const token = localStorage.getItem('basicAuth');
          const headers = token ? { Authorization: `Basic ${token}` } : {};
          const res = await fetch('http://localhost:5000/api/users/all', { method: 'GET', headers });
          if (!res.ok) return;
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : (data && Array.isArray(data.users) ? data.users : []));
        } catch (e) {}
      };
      fetchUsers();
    }, []);
  const loc = useLocation()
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notifLoading, setNotifLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createForm, setCreateForm] = useState({ destinataire: '', type: 'AFFECTATION', titre: '', message: '', tacheId: '', sendEmail: false })

  const loadNotifications = async () => {
    try {
      setNotifLoading(true)
      const token = localStorage.getItem('basicAuth')
      const headers = token ? { Authorization: `Basic ${token}` } : {}
      const res = await fetch('http://localhost:5000/api/notifications', { method: 'GET', headers })
      if (!res.ok) { setNotifications([]); setUnreadCount(0); return }
      const data = await res.json().catch(() => null)
      let list = Array.isArray(data) ? data : (data && Array.isArray(data.notifications) ? data.notifications : [])
      if ((!list || list.length === 0)) {
        try {
          const meRes = await fetch('http://localhost:5000/api/users/me', { method: 'GET', headers })
          if (meRes.ok) {
            const meData = await meRes.json().catch(() => null)
            const userId = meData && (meData.user?._id || meData.user?.id || meData._id || meData.id)
            if (userId) {
              const byUser = await fetch(`http://localhost:5000/api/notifications?userId=${userId}`, { method: 'GET', headers })
              if (byUser.ok) {
                const byUserData = await byUser.json().catch(() => null)
                const byUserList = Array.isArray(byUserData) ? byUserData : (byUserData && Array.isArray(byUserData.notifications) ? byUserData.notifications : [])
                if (byUserList && byUserList.length) list = byUserList
              }
            }
          }
        } catch (e) { /* ignore */ }
      }
      if ((!list || list.length === 0)) {
        try {
          const byRole = await fetch('http://localhost:5000/api/notifications?role=superadmin', { method: 'GET', headers })
          if (byRole.ok) {
            const byRoleData = await byRole.json().catch(() => null)
            const byRoleList = Array.isArray(byRoleData) ? byRoleData : (byRoleData && Array.isArray(byRoleData.notifications) ? byRoleData.notifications : [])
            if (byRoleList && byRoleList.length) list = byRoleList
          }
        } catch (e) { /* ignore */ }
      }
      setNotifications(list || [])
      setUnreadCount((list || []).filter(n => !(n.estLue || n.estLu || n.read)).length)
    } catch (e) {
      console.error('Error loading notifications', e)
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setNotifLoading(false)
    }
  }

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

        {/* Notifications button */}
        <div style={{ marginTop: 12, padding: '8px 12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={async () => { setNotifOpen(true); await loadNotifications() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 10,
                border: '1.5px solid #eef2f7', background: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 600,
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)', transition: 'box-shadow 0.2s', marginBottom: 2
              }}
            >
              <span style={{ fontSize: 20 }}>🔔</span>
              <span style={{ flex: 1 }}>Notifications</span>
              {unreadCount > 0 && <span style={{ marginLeft: 8, background: '#ef4444', color: '#fff', borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>{unreadCount}</span>}
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 10,
                border: '1.5px solid #e6f0ff', background: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 600,
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)', transition: 'box-shadow 0.2s'
              }}
            >
              <span style={{ fontSize: 20 }}>✉️</span>
              <span style={{ flex: 1 }}>Créer</span>
            </button>
          </div>
        </div>
      </nav>

      <Modal isOpen={notifOpen} title={`Notifications (${notifications.length})`} onCancel={() => setNotifOpen(false)} onConfirm={() => setNotifOpen(false)} confirmText="Fermer">
        {notifLoading && <div>Chargement des notifications…</div>}
        {!notifLoading && notifications.length === 0 && <div style={{ color: '#64748b' }}>Aucune notification</div>}
        {!notifLoading && notifications.length > 0 && (
          <div style={{ display: 'grid', gap: 8 }}>
            {notifications.map(n => (
              <div key={n._id || n.id} style={{ padding: 10, borderRadius: 8, background: n.estLue ? '#fafafa' : '#fff7ed', border: '1px solid #eef2f7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700 }}>{n.titre || n.type || 'Notification'}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{n.dateEnvoi ? new Date(n.dateEnvoi).toLocaleString() : (n.createdAt ? new Date(n.createdAt).toLocaleString() : '')}</div>
                </div>
                <div style={{ marginTop: 6 }}>{n.message || '-'}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  {!n.estLue && <button className="btn-ghost" onClick={async () => { try { const token = localStorage.getItem('basicAuth'); const headers = token ? { Authorization: `Basic ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }; await fetch(`http://localhost:5000/api/notifications/${n._id || n.id}/read`, { method: 'PUT', headers }); setNotifications(prev => prev.map(x => x === n ? ({ ...x, estLue: true }) : x)); setUnreadCount(c => Math.max(0, c - 1)); } catch (e) { console.error(e) } }}>Marquer comme lu</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

    {/* Create notification modal */}
    <Modal isOpen={createOpen} title="Créer une notification" onCancel={() => setCreateOpen(false)} onConfirm={async () => {
      try {
        setCreateLoading(true)
        const token = localStorage.getItem('basicAuth')
        const headers = token ? { Authorization: `Basic ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
        let destinataireId = createForm.destinataire;
        if (typeof destinataireId === 'string') {
          const destRaw = (destinataireId || '').trim();
          destinataireId = destRaw.includes(',') ? destRaw.split(',').map(s => s.trim()).filter(Boolean) : (destRaw === '' ? [] : destRaw);
          if (Array.isArray(destinataireId) && destinataireId.length === 1) destinataireId = destinataireId[0];
        }
        if (Array.isArray(destinataireId)) {
          destinataireId = destinataireId.filter(Boolean);
          if (destinataireId.length === 1) destinataireId = destinataireId[0];
        }
        const payload = { type: createForm.type, titre: createForm.titre, message: createForm.message, sendEmail: !!createForm.sendEmail };
        if (destinataireId && (Array.isArray(destinataireId) ? destinataireId.length > 0 : destinataireId)) payload.destinataireId = destinataireId;
        if (createForm.tacheId) payload.data = { tacheId: createForm.tacheId };
        await fetch('http://localhost:5000/api/notifications', { method: 'POST', headers, body: JSON.stringify(payload) });
        setCreateOpen(false);
        setCreateForm({ destinataire: '', type: 'AFFECTATION', titre: '', message: '', tacheId: '', sendEmail: false });
      } catch (e) { console.error(e); alert('Erreur lors de la création de la notification'); } finally { setCreateLoading(false); }
    }} confirmText={createLoading ? 'Envoi…' : 'Envoyer'}>
    <div style={{ display: 'grid', gap: 8 }}>
      <label>Destinataire(s)</label>
      <Select
        isMulti
        options={users.map(user => ({ value: user._id || user.id, label: `${user.nom} ${user.prenom}` }))}
        value={Array.isArray(createForm.destinataire)
          ? users.filter(user => createForm.destinataire.includes(user._id || user.id)).map(user => ({ value: user._id || user.id, label: `${user.nom} ${user.prenom}` }))
          : []}
        onChange={selected => {
          setCreateForm(f => ({ ...f, destinataire: selected.map(opt => opt.value) }));
        }}
        placeholder="Sélectionner les destinataires..."
        styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
      />
        <label>Type</label>
        <select value={createForm.type} onChange={e => setCreateForm(f => ({ ...f, type: e.target.value }))}>
          <option value="AFFECTATION">AFFECTATION</option>
          <option value="MODIFICATION">MODIFICATION</option>
          <option value="DELEGATION">DELEGATION</option>
          <option value="RAPPEL">RAPPEL</option>
          <option value="VALIDATION">VALIDATION</option>
        </select>
      <label>Titre</label>
      <input value={createForm.titre} onChange={e => setCreateForm(f => ({ ...f, titre: e.target.value }))} />
      <label>Message</label>
      <textarea value={createForm.message} onChange={e => setCreateForm(f => ({ ...f, message: e.target.value }))} />
      <label>ID Tâche (optionnel)</label>
      <input value={createForm.tacheId} onChange={e => setCreateForm(f => ({ ...f, tacheId: e.target.value }))} placeholder="tacheId" />
      <label><input type="checkbox" checked={createForm.sendEmail} onChange={e => setCreateForm(f => ({ ...f, sendEmail: e.target.checked }))} /> Envoyer par e-mail</label>
    </div>
    </Modal>
    </aside>
  );
}
