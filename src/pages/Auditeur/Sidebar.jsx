import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Modal from '../../components/common/Modal'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Tableau de bord', icon: '🏠' },
  { to: '/tasks', label: 'Tâches', icon: '🗂️' },
  { to: '/delegations', label: 'Mes délégations', icon: '🔁' },
  { to: '/profile', label: 'Profil', icon: '👤' }
  // notifications will be shown as a dedicated link below
]

export default function Sidebar() {
// ...existing code...
    const [users, setUsers] = useState([]);

    // Charger tous les utilisateurs au montage du composant
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const token = localStorage.getItem('basicAuth');
          const headers = token ? { Authorization: `Basic ${token}` } : {};
          const API = import.meta.env.VITE_API_URL
          const res = await axios.get(`${API}/api/users/all`, { headers });
          if (!res) return;
          const data = res.data;
          setUsers(Array.isArray(data) ? data : (data && Array.isArray(data.users) ? data.users : []));
        } catch (e) {
          // ignore
        }
      };
      fetchUsers();
    }, []);
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({ destinataire: '', type: 'AFFECTATION', titre: '', message: '', tacheId: '', sendEmail: false });

  // Handler pour la création de notification
  const handleCreateNotification = async () => {
    try {
      setCreateLoading(true)
      const token = localStorage.getItem('basicAuth')
      const headers = token ? { Authorization: `Basic ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
      let destinataireId = createForm.destinataire;
      // Si c'est une chaîne (ancienne version), parser comme avant
      if (typeof destinataireId === 'string') {
        const destRaw = (destinataireId || '').trim();
        destinataireId = destRaw.includes(',') ? destRaw.split(',').map(s => s.trim()).filter(Boolean) : (destRaw === '' ? [] : destRaw);
        if (Array.isArray(destinataireId) && destinataireId.length === 1) destinataireId = destinataireId[0];
      }
      // Si c'est un tableau, filtrer les vides
      if (Array.isArray(destinataireId)) {
        destinataireId = destinataireId.filter(Boolean);
        if (destinataireId.length === 1) destinataireId = destinataireId[0];
      }
      const payload = { type: createForm.type, titre: createForm.titre, message: createForm.message, sendEmail: !!createForm.sendEmail };
      if (destinataireId && (Array.isArray(destinataireId) ? destinataireId.length > 0 : destinataireId)) payload.destinataireId = destinataireId;
      if (createForm.tacheId) payload.data = { tacheId: createForm.tacheId };
      const API = import.meta.env.VITE_API_URL
      await axios.post(`${API}/api/notifications`, payload, { headers });
      setCreateOpen(false);
      setCreateForm({ destinataire: '', type: 'AFFECTATION', titre: '', message: '', tacheId: '', sendEmail: false });
    } catch (e) {
      console.error(e); alert('Erreur lors de la création de la notification');
    } finally {
      setCreateLoading(false);
    }
  }

  return (
    <>
      <aside
        className="auditeur-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '240px',
          overflowY: 'auto',
          zIndex: 1000,
        }}
      >
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
          {/* Notifications link */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link
              key="/tasks?showNotifs=1"
              to={'/tasks?showNotifs=1'}
              className={"auditeur-nav-link " + (location.pathname === '/tasks' ? 'active' : '')}
            >
              <span className="nav-icon">🔔</span>
              <span className="nav-label">Notifications</span>
              {unreadCount > 0 && <span style={{ marginLeft: 8, background: '#ef4444', color: '#fff', borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>{unreadCount}</span>}
            </Link>
            <button onClick={() => setCreateOpen(true)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e6f0ff', background: '#fff', cursor: 'pointer' }}>✉️ Créer</button>
          </div>
        </nav>
      </aside>
      {/* Create notification modal */}
      <Modal isOpen={createOpen} title="Créer une notification" onCancel={() => setCreateOpen(false)} onConfirm={handleCreateNotification} confirmText={createLoading ? 'Envoi…' : 'Envoyer'}>
        <div style={{ display: 'grid', gap: 8 }}>
          <label>Destinataire(s)</label>
          <div style={{ maxHeight: 120, overflowY: 'auto', border: '1px solid #eee', borderRadius: 4, padding: 4 }}>
            {users.map(user => (
              <label key={user._id || user.id} style={{ display: 'block', marginBottom: 4 }}>
                <input
                  type="checkbox"
                  value={user._id || user.id}
                  checked={Array.isArray(createForm.destinataire) ? createForm.destinataire.includes(user._id || user.id) : false}
                  onChange={e => {
                    const val = user._id || user.id;
                    setCreateForm(f => {
                      let arr = Array.isArray(f.destinataire) ? [...f.destinataire] : [];
                      if (e.target.checked) {
                        if (!arr.includes(val)) arr.push(val);
                      } else {
                        arr = arr.filter(id => id !== val);
                      }
                      return { ...f, destinataire: arr };
                    });
                  }}
                /> {user.nom} {user.prenom}
              </label>
            ))}
          </div>
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
    </>
  )
}
// ...existing code...
