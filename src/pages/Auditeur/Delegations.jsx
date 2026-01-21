import React, { useEffect, useState } from 'react'
import Modal from '../../components/common/Modal'
import { getMyDelegationsPropres, deleteDelegation, modifyDelegation } from '../../services/affectationService'
import { getAuditeurs } from '../../services/userService'

const formatDate = (iso) => {
  if (!iso) return '-'
  try { return new Date(iso).toLocaleDateString('fr-FR') } catch (e) { return iso }
}

const formatAff = (a) => {
  if (!a) return '-'
  // show only useful info: task id (if available) and date — avoid exposing internal affectation id
  const tid = a.tacheId && (typeof a.tacheId === 'string' ? a.tacheId : (a.tacheId._id || a.tacheId.id || ''))
  const date = a.dateAffectation ? formatDate(a.dateAffectation) : ''
  if (tid) return `Tâche: ${tid}${date ? ' • ' + date : ''}`
  return date || '-'
}

export default function Delegations() {
  const [delegations, setDelegations] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ auditeurPropose: '', justification: '', statut: 'EN_ATTENTE' })
  const [auditeurs, setAuditeurs] = useState([])
  const [showRaw, setShowRaw] = useState({})
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getMyDelegationsPropres()
      const list = Array.isArray(data) ? data : (data && Array.isArray(data.delegations) ? data.delegations : (data && Array.isArray(data.data) ? data.data : []))
      setDelegations(list.map((d) => ({ ...d, id: d._id || d.id })))
    } catch (e) {
      console.error(e)
      setDelegations([])
    } finally { setLoading(false) }
  }

  useEffect(() => { load(); getAuditeurs().then(setAuditeurs).catch(() => setAuditeurs([])) }, [])

  const openEdit = (d) => {
    setEditing(d)
    setForm({ auditeurPropose: d.auditeurPropose && (d.auditeurPropose._id || d.auditeurPropose.id || d.auditeurPropose), justification: d.justification || '', statut: d.statut || 'EN_ATTENTE' })
    setModalOpen(true)
  }

  const displayUser = (u) => {
    if (!u) return '-'
    if (typeof u === 'object') return ((u.nom || '') + ' ' + (u.prenom || '')).trim() || '-'
    const idVal = (u && (u._id || u.id)) || u
    const found = auditeurs.find(a => a.id === idVal || a._id === idVal)
    return found ? ((found.nom || '') + ' ' + (found.prenom || '')).trim() : '-'
  }

  const handleSave = async () => {
    if (!editing) return
    setActionLoading(editing.id)
    try {
      await modifyDelegation(editing.id, { auditeurPropose: form.auditeurPropose, justification: form.justification, statut: form.statut })
      await load()
      setModalOpen(false)
    } catch (e) {
      console.error(e)
      alert('Erreur modification')
    } finally { setActionLoading(null) }
  }

  const handleDelete = async (id) => {
    setConfirmDeleteId(id)
  }

  const handleDeleteConfirm = async () => {
    const id = confirmDeleteId
    if (!id) return
    setActionLoading(id)
    try {
      await deleteDelegation(id)
      await load()
    } catch (e) {
      console.error(e)
      alert('Erreur suppression')
    } finally { setActionLoading(null); setConfirmDeleteId(null) }
  }

  if (loading) return <div>Chargement des propositions…</div>

  return (
    <section>
      <h3 style={{ marginTop: 0 }}>Mes propositions de délégation</h3>
      <div style={{ display: 'grid', gap: 12 }}>
        {delegations.length === 0 && <div className="muted">Aucune proposition</div>}
        {delegations.map((d) => (
          <div key={d.id} style={{ background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 6px 18px rgba(2,6,23,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'column' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{displayUser(d.auditeurPropose)} {d.dateProposition ? '• ' + formatDate(d.dateProposition) : ''}</div>
                <div style={{ color: '#374151' }}>Affectation: {formatAff(d.affectationOriginale)}</div>
                <div style={{ color: '#6b7280' }}>Destinataire proposé: {displayUser(d.auditeurPropose)}</div>
                <div style={{ color: '#6b7280' }}>Proposé par: {displayUser(d.auditeurInitial)}</div>
                <div style={{ marginTop: 6, color: '#6b7280' }}>{d.justification || '-'}</div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="btn" onClick={() => openEdit(d)} style={{ background: '#f8fafc', border: '1px solid #e6eef6' }}>Modifier</button>
                <button className="btn danger" onClick={() => handleDelete(d.id)} disabled={actionLoading === d.id}>Supprimer</button>
                <button className="btn" onClick={() => setShowRaw(prev => ({ ...prev, [d.id]: !prev[d.id] }))} style={{ background: '#f8fafc', border: '1px solid #e6eef6' }}>{showRaw[d.id] ? 'Masquer données' : 'Voir données'}</button>
              </div>
            </div>
            {showRaw[d.id] && <pre style={{ background: '#f8fafc', padding: 8, borderRadius: 6, marginTop: 8, width: '100%', overflowX: 'auto' }}>{JSON.stringify(d, null, 2)}</pre>}
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} title={editing ? 'Modifier proposition' : 'Modifier'} onCancel={() => setModalOpen(false)} onConfirm={handleSave} confirmText={actionLoading ? '…' : 'Sauvegarder'}>
        <div>
          <div style={{ marginBottom: 8 }}>Destinataire proposé</div>
          <select value={form.auditeurPropose} onChange={(e) => setForm({ ...form, auditeurPropose: e.target.value })} style={{ padding: 8, width: '100%', marginBottom: 8 }}>
            <option value="">-- choisir --</option>
            {auditeurs.map(u => <option key={u.id} value={u.id}>{u.nom} {u.prenom} ({u.id})</option>)}
          </select>

          <div style={{ marginBottom: 8 }}>Justification</div>
          <textarea value={form.justification} onChange={(e) => setForm({ ...form, justification: e.target.value })} rows={4} style={{ width: '100%', padding: 8 }} />

          <div style={{ marginTop: 8 }}>Statut</div>
          <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })} style={{ padding: 8, width: '100%', marginTop: 6 }}>
            <option value="EN_ATTENTE">EN_ATTENTE</option>
            <option value="ACCEPTEE">ACCEPTEE</option>
            <option value="REFUSEE">REFUSEE</option>
            <option value="DELEGUEE">DELEGUEE</option>
          </select>
        </div>
      </Modal>
      <Modal isOpen={!!confirmDeleteId} title="Confirmer la suppression" onCancel={() => setConfirmDeleteId(null)} onConfirm={handleDeleteConfirm} confirmText="Supprimer">
        <div>Confirmer la suppression ?</div>
      </Modal>
    </section>
  )
}
