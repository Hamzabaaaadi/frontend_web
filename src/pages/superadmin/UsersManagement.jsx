import React, { useEffect, useState } from "react";
import * as svc from '../../services/superAdminService'
import Modal from '../../components/common/Modal'

export default function UsersManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', role: 'AUDITEUR' })

  const load = async () => {
    setLoading(true)
    const list = await svc.listUsers()
    setUsers(list)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditUser(null); setForm({ nom: '', prenom: '', email: '', role: 'AUDITEUR' }); setModalOpen(true) }
  const openEdit = (u) => { setEditUser(u); setForm({ nom: u.nom || '', prenom: u.prenom || '', email: u.email || '', role: u.role || 'AUDITEUR' }); setModalOpen(true) }

  const handleSave = async () => {
    if (editUser) {
      await svc.updateUser(editUser.id, form)
    } else {
      await svc.createUser(form)
    }
    setModalOpen(false)
    await load()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return
    await svc.deleteUser(id)
    await load()
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0 }}>Gestion des utilisateurs</h1>
          <div style={{ color: '#64748b' }}>Gérer les comptes, rôles et accès de la plateforme.</div>
        </div>
        <div>
          <button onClick={openCreate} style={{ padding: '10px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700 }}>Créer un utilisateur</button>
        </div>
      </div>

      {loading ? <div>Chargement…</div> : (
        <div style={{ display: 'grid', gap: 10 }}>
          {users.map(u => (
            <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: '#fff', borderRadius: 10, boxShadow: '0 6px 18px rgba(2,6,23,0.04)' }}>
              <div>
                <div style={{ fontWeight: 800 }}>{u.nom} {u.prenom} <span style={{ color: '#94a3b8', fontWeight: 600 }}>({u.role || 'AUDITEUR'})</span></div>
                <div style={{ color: '#6b7280' }}>{u.email} • {u.id}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(u)} style={{ padding: '8px 10px', borderRadius: 8, background: '#f3f4f6', border: 'none' }}>Éditer</button>
                <button onClick={() => handleDelete(u.id)} style={{ padding: '8px 10px', borderRadius: 8, background: '#fee2e2', border: 'none' }}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} title={editUser ? 'Modifier utilisateur' : 'Créer utilisateur'} onCancel={() => setModalOpen(false)} onConfirm={handleSave} confirmText={editUser ? 'Enregistrer' : 'Créer'}>
        <div style={{ display: 'grid', gap: 8 }}>
          <input placeholder="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          <input placeholder="Prénom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="AUDITEUR">Auditeur</option>
            <option value="COORDINATEUR">Coordinateur</option>
            <option value="SUPERADMIN">Super Admin</option>
          </select>
        </div>
      </Modal>
    </div>
  )
}
