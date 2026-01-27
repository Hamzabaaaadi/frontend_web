import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useLocation } from 'react-router-dom'
import { getTasks, getTaskById, completeTask } from '../../services/tacheService'
import { getAffectations, acceptAffectation, refuseAffectation, delegateAffectation, createDelegation, getDelegations, acceptDelegation, refuseDelegation } from '../../services/affectationService'
import { getAuditeurs } from '../../services/userService'
import Modal from '../../components/common/Modal'

const cardStyle = {
  background: '#fff',
  padding: 12,
  borderRadius: 8,
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  marginBottom: 12
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAuditeur, setSelectedAuditeur] = useState('')
  const [auditeurs, setAuditeurs] = useState([])

  useEffect(() => {
    let mounted = true
    // load affectations (not tasks) to match domain model
    const toArray = (v) => Array.isArray(v) ? v : (v && Array.isArray(v.affectations) ? v.affectations : (v && Array.isArray(v.data) ? v.data : []))

    getAffectations()
      .then((data) => {
        if (mounted) {
          // normalize server shape: keep original object for details but add an `id` prop
          const list = toArray(data).map((d) => ({ ...d, id: d._id || d.id }))
          setTasks(list)
          console.log('Loaded affectations:', list)
        }
      })
      .catch(() => {
        if (mounted) setTasks([])
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    getAuditeurs().then((list) => {
      if (mounted) setAuditeurs(list)
    }).catch(() => {
      if (mounted) setAuditeurs([])
    })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    loadDelegations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatAff = (a) => {
    if (!a) return '-'
    if (typeof a === 'object') return a._id || JSON.stringify(a)
    return a
  }

  const formatAud = (u) => {
    if (!u) return '-'
    if (typeof u === 'object') return `${u.nom || ''} ${u.prenom || ''}`.trim() || (u._id || JSON.stringify(u))
    return u
  }

  const [actionLoading, setActionLoading] = useState(null)
  
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState(null) // 'accept'|'refuse'|'delegate'
  const [modalTaskId, setModalTaskId] = useState(null)
  const [modalInput, setModalInput] = useState('')
  const [modalFromInput, setModalFromInput] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [modalJustification, setModalJustification] = useState('')
  const [modalStatut, setModalStatut] = useState('EN_ATTENTE')
  const [delegations, setDelegations] = useState([])
  const [delegationDetails, setDelegationDetails] = useState(null)
  const [delegationDetailsLoading, setDelegationDetailsLoading] = useState(false)
  const [hoveredRow, setHoveredRow] = useState(null)
  const [taskDetails, setTaskDetails] = useState(null)
  const [taskDetailsLoading, setTaskDetailsLoading] = useState(false)
  const [modalCompleteAffId, setModalCompleteAffId] = useState(null)
  // notifications
  const [notifications, setNotifications] = useState([])
  const [notifLoading, setNotifLoading] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const location = useLocation()

  const openModal = (type, id) => {
    setModalType(type)
    setModalTaskId(id)
    setModalInput('')
    setModalOpen(true)
  }

  // open delegate modal: prefill delegator from the selected affectation
  const openDelegateModal = (id) => {
    const aff = tasks.find((x) => x.id === id)
    setModalType('delegate')
    setModalTaskId(id)
    // if auditeurId is an object, prefill with its _id
    setModalFromInput(aff ? (aff.auditeurId && typeof aff.auditeurId === 'object' ? (aff.auditeurId._id || '') : aff.auditeurId || '') : '')
    setModalInput('')
    setModalJustification('')
    setModalStatut('EN_ATTENTE')
    setModalOpen(true)
  }

  const loadNotifications = async () => {
    try {
      setNotifLoading(true)
      const token = localStorage.getItem('basicAuth')
      const headers = token ? { Authorization: `Basic ${token}` } : {}
      const API = import.meta.env.VITE_API_URL
      const res = await axios.get(`${API}/api/notifications`, { headers })
      if (!res) { setNotifications([]); return }
      const data = res.data || null
      const list = Array.isArray(data) ? data : (data && Array.isArray(data.notifications) ? data.notifications : [])
      setNotifications(list)
    } catch (err) {
      console.error('Error loading notifications', err)
      setNotifications([])
    } finally {
      setNotifLoading(false)
    }
  }

  useEffect(() => {
    if (notifOpen) loadNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifOpen])

  useEffect(() => {
    try {
      const q = new URLSearchParams(location.search)
      if (q.get('showNotifs')) setNotifOpen(true)
    } catch (e) { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  const loadDelegations = async () => {
    try {
      const data = await getDelegations()
      const list = Array.isArray(data)
        ? data.map((d) => ({
            ...d,
            id: d._id || d.id,
      
            // garder l'objet COMPLET
            affectationOriginale: d.affectationOriginale,
      
            // champs utiles dérivés (optionnels)
            affectationOriginaleId: d.affectationOriginale?._id || null,
            tacheId: d.affectationOriginale?.tacheId || null,
      
            auditeurPropose: d.auditeurPropose,
            auditeurProposeLabel:
              d.auditeurPropose && typeof d.auditeurPropose === 'object'
                ? `${d.auditeurPropose.nom || ''} ${d.auditeurPropose.prenom || ''}`.trim()
                : '',
      
            auditeurInitial: d.auditeurInitial,
          }))
        : []
      console.log("Loaded delegations: ", list);
      setDelegations(list)
    } catch (err) {
      console.error(err)
      setDelegations([])
    }
  }

  const openDelegationDetails = (d) => {
    setDelegationDetails(null)
    setDelegationDetailsLoading(true)
    // currently delegations are local; assign directly
    setDelegationDetails(d)
    setDelegationDetailsLoading(false)
    setModalType('delegationDetails')
    setModalOpen(true)
  }

  const openDetails = async (tacheId) => {
    setTaskDetails(null)
    setTaskDetailsLoading(true)
    try {
      // If we already have the task object embedded in `tasks`, use it to avoid a failing API call
      let data = null
      if (!tacheId) {
        data = null
      } else {
        // if tacheId is an object, use it
        if (typeof tacheId === 'object')   
                data = await getTaskById(tacheId._id || tacheId.id)
        else
                data = await getTaskById(tacheId)
       
      }

      setTaskDetails(data)
      setModalType('details')
      setModalOpen(true)
    } catch (err) {
      console.error(err)
      alert('Erreur chargement détails tâche')
    } finally {
      setTaskDetailsLoading(false)
    }
  }

  const formatDate = (iso) => {
    if (!iso) return '-'
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('fr-FR')
    } catch (e) { return iso }
  }

  const formatDateTime = (iso) => {
    if (!iso) return '-'
    try {
      const d = new Date(iso)
      return d.toLocaleString('fr-FR')
    } catch (e) { return iso }
  }

  const statusBadge = (statut) => {
    const s = (statut || '').toUpperCase()
    const map = {
      'ACCEPTEE': { bg: '#ecfdf5', color: '#065f46' },
      'REFUSEE': { bg: '#fff1f2', color: '#991b1b' },
      'DELEGUEE': { bg: '#fff7ed', color: '#92400e' },
      'AFFECTEE': { bg: '#eff6ff', color: '#1e3a8a' },
      'TERMINEE': { bg: '#f3f4f6', color: '#374151' },
      'EN_ATTENTE': { bg: '#fffbeb', color: '#92400e' }
    }
    const style = map[s] || { bg: '#f8fafc', color: '#0f172a' }
    return (
      <span style={{ display: 'inline-block', padding: '6px 10px', borderRadius: 14, background: style.bg, color: style.color, fontSize: 12, fontWeight: 700 }}>
        {statut || '-'}
      </span>
    )
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalType(null)
    setModalTaskId(null)
    setModalInput('')
    setModalCompleteAffId(null)
  }

  const handleConfirmModal = async () => {
    const id = modalTaskId
    try {
      setActionLoading(id)
      if (modalType === 'accept') {
        await acceptAffectation(id)
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, statut: 'ACCEPTEE' } : t)))
      } else if (modalType === 'refuse') {
        await refuseAffectation(id, modalInput)
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, statut: 'REFUSEE', justificatifRefus: modalInput } : t)))
      } else if (modalType === 'acceptDelegation') {
        // accept a delegation proposal
        await acceptDelegation(id)
        try {
          const r = await getAffectations()
          const list = Array.isArray(r) ? r : (r && Array.isArray(r.affectations) ? r.affectations : (r && Array.isArray(r.data) ? r.data : []))
          setTasks(list.map((it) => ({ ...it, id: it._id || it.id })))
        } catch (e) {
          console.error('Erreur rechargement affectations après acceptation de délégation', e)
        }
        await loadDelegations()
      } else if (modalType === 'refuseDelegation') {
        // refuse a delegation proposal
        await refuseDelegation(id)
        await loadDelegations()
      } else if (modalType === 'delegate') {
        if (!modalInput || !modalFromInput) {
          alert('Veuillez saisir les deux IDs (delegateur et destinataire)')
          return
        }
        // create delegation record (proposal). affectation is not transferred until acceptation.
        const payload = {
          affectationOriginale: id,
          auditeurInitial: modalFromInput,
          auditeurPropose: modalInput,
          justification: modalJustification,
          statut: modalStatut
        }
        await createDelegation(payload)
        // refresh local delegations list
        await loadDelegations()
        // refresh affectations/tasks to reflect any server-side changes
        try {
          const r = await getAffectations()
          const list = Array.isArray(r) ? r : (r && Array.isArray(r.affectations) ? r.affectations : (r && Array.isArray(r.data) ? r.data : []))
          setTasks(list.map((it) => ({ ...it, id: it._id || it.id })))
        } catch (e) {
          console.error('Erreur rechargement affectations après délégation', e)
        }
        setToastMessage('Proposition de délégation enregistrée')
        setTimeout(() => setToastMessage(''), 3000)
      } else if (modalType === 'complete') {
        const affId = modalCompleteAffId;
        try {
          await completeTask(id);
          setTasks((prev) => prev.map((t) => (t.id === affId ? { ...t, statut: 'TERMINEE' } : t)));
          setToastMessage('Tâche terminée');
          setTimeout(() => setToastMessage(''), 3000);
        } catch (err) {
          console.error(err);
          alert('Erreur terminaison tâche');
        }
      }
      closeModal()
    } catch (err) {
      console.error(err)
      // try to extract a helpful server message
      const serverMsg = err?.response?.data?.message || err?.response?.data || err?.message || 'Erreur'
      alert(`Erreur lors de l'opération : ${typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg)}`)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <div>Chargement des tâches…</div>

  return (
    <section>
      <section className="delegations-section">
        <h4>Propositions de délégation</h4>
        <div className="delegations-list">
          
          {delegations.length === 0 && <div className="muted">Aucune proposition</div>}
          {delegations.map((d) => (
            <div key={d.id} className="delegation-card" role="button" tabIndex={0} onClick={() => openDelegationDetails(d)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDelegationDetails(d) } }}>
              <div className="delegation-main">
                <div className="delegation-title"> — <span className="badge">{d.statut}</span></div>
                <div className="delegation-sub">Affectation a Proposé à: {formatAud(d.auditeurPropose)}</div>
                <div className="delegation-just">{d.justification || '-'}</div>
              </div>
              <div className="delegation-actions">
                {console.log("d.affectationOriginale",delegations )}
                <button className="btn primary" onClick={(e) => { e.stopPropagation();const tacheId = typeof d.affectationOriginale.tacheId === 'string' ? (d.affectationOriginale.tacheId) : null; tacheId ? openDetails(tacheId) : alert('Tâche introuvable') }}>
                  Voir tâche
                </button>

                {d.statut === 'EN_ATTENTE' && (
                  <>
                    <button className="btn success" onClick={(e) => { e.stopPropagation(); openModal('acceptDelegation', d.id); }} disabled={actionLoading === d.id}>Accepter</button>
                    <button className="btn danger" onClick={(e) => { e.stopPropagation(); openModal('refuseDelegation', d.id); }} disabled={actionLoading === d.id}>Refuser</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      <h3>Tâches</h3>
      <div className="tasks-grid">
        {tasks.map((t) => {
          const tacheIdVal = t.tacheId && typeof t.tacheId === 'object' ? (t.tacheId._id || t.tacheId.id) : t.tacheId
          const tacheLabel =   (t.tacheId && typeof t.tacheId === 'object') ? (t.tacheId.description || t.tacheId._id || JSON.stringify(t.tacheId)) : (t.tacheId || '-')
          const audIdVal = t.auditeurId && typeof t.auditeurId === 'object' ? (t.auditeurId._id || t.auditeurId.id) : t.auditeurId
          const audFromList = auditeurs.find(u => u.id === audIdVal || u._id === audIdVal)
          const audLabel =   typeof t.auditeurId === 'object'
            ? `${t.auditeurId.nom || ''} ${t.auditeurId.prenom || ''} `.trim()
            : (audFromList ? `${audFromList.nom} ${audFromList.prenom} ` : t.auditeurId)
          return (
          <article key={t.id} className="task-card" tabIndex={0} role="button" onClick={() => openDetails(tacheIdVal)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetails(tacheIdVal); } }}>
            <div className="task-card-body">
              <div className="task-card-head">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong className="task-title">Affectation</strong>
                  {statusBadge(t.statut)}
                </div>
                <div className="task-meta">
                  <div className="muted small">{t.dateAffectation}</div>
                  <div className="muted small">{t.mode}</div>
                </div>
              </div>

              <div className="task-desc">Tâche: {tacheLabel} • Auditeur: {audLabel}</div>
              {t.justificatifRefus && <div className="muted small">Justif: {t.justificatifRefus}</div>}
            </div>

              <div className="task-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                <button className="btn success" disabled={actionLoading === t.id} onClick={(e) => { e.stopPropagation(); openModal('accept', t.id); }}>{actionLoading === t.id ? '…' : 'Accepter'}</button>
                <button className="btn danger" disabled={actionLoading === t.id} onClick={(e) => { e.stopPropagation(); openModal('refuse', t.id); }}>{actionLoading === t.id ? '…' : 'Refuser'}</button>
                <button className="btn warn" disabled={actionLoading === t.id} onClick={(e) => { e.stopPropagation(); openDelegateModal(t.id); }}>{actionLoading === t.id ? '…' : 'Déléguer'}</button>
                {t.statut === 'ACCEPTEE' && (
                                    <button className="btn" style={{ background: '#eef2ff', color: '#1e40af' }} onClick={(e) => { e.stopPropagation(); setModalFromInput(audIdVal || ''); setModalTaskId(tacheIdVal || t.id); setModalType('chat'); setModalOpen(true); }}>Discussion</button>

                )}
              </div>
          </article>
        )})}
      </div>
      
      <Modal
        isOpen={modalOpen}
        title={
          modalType === 'accept'
            ? 'Confirmer acceptation'
            : modalType === 'refuse'
            ? 'Motif du refus'
            : modalType === 'acceptDelegation'
            ? 'Confirmer acceptation délégation'
            : modalType === 'refuseDelegation'
            ? 'Confirmer refus délégation'
            : modalType === 'delegate'
            ? 'Déléguer la tâche'
            : modalType === 'complete'
            ? 'Confirmer terminaison'
            : 'Détails tâche'
        }
        onCancel={closeModal}
        onConfirm={modalType === 'details' ? closeModal : handleConfirmModal}
        confirmText={
          modalType === 'accept' || modalType === 'acceptDelegation'
            ? 'Accepter'
            : modalType === 'refuse' || modalType === 'refuseDelegation'
            ? 'Refuser'
            : modalType === 'delegate'
            ? 'Déléguer'
            : modalType === 'complete'
            ? 'Terminer'
            : 'Fermer'
        }
      >
        {modalType === 'accept' && <div>Voulez-vous accepter cette tâche ?</div>}
        {modalType === 'acceptDelegation' && <div>Voulez-vous accepter cette proposition de délégation ?</div>}
        {modalType === 'complete' && <div>Voulez-vous marquer cette tâche comme terminée ?</div>}
        {modalType === 'refuseDelegation' && <div>Voulez-vous refuser cette proposition de délégation ?</div>}
              {toastMessage && (
                <div style={{ margin: '8px 0', padding: 10, borderRadius: 8, background: '#ecfdf5', color: '#064e3b' }}>{toastMessage}</div>
              )}
        {(modalType === 'refuse' || modalType === 'delegate') && (
          <div>
            {modalType === 'refuse' && (
              <>
                <div style={{ marginBottom: 8 }}>Veuillez indiquer un motif (optionnel):</div>
                <input value={modalInput} onChange={(e) => setModalInput(e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} />
              </>
            )}

            {modalType === 'delegate' && (
              <>
                <div style={{ marginBottom: 8 }}>Affectation originale (ID):</div>
                <input value={modalTaskId || ''} readOnly style={{ width: '100%', padding: 8, boxSizing: 'border-box', marginBottom: 8, background: '#f8fafc' }} />

                <div style={{ marginBottom: 8 }}>Delegateur (ID):</div>
                <input value={modalFromInput} readOnly style={{ width: '100%', padding: 8, boxSizing: 'border-box', marginBottom: 8, background: '#f8fafc' }} />

                <div style={{ marginBottom: 8 }}>Destinataire (proposé):</div>
                <select value={modalInput} onChange={(e) => setModalInput(e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box', marginBottom: 8 }}>
                  <option value="">-- choisir un auditeur --</option>
                  {auditeurs.map((u) => (
                    <option key={u.id} value={u.id}> — {u.nom} {u.prenom}</option>
                  ))}
                </select>

                <div style={{ marginBottom: 8 }}>Justification (optionnel):</div>
                <textarea value={modalJustification} onChange={(e) => setModalJustification(e.target.value)} rows={3} style={{ width: '100%', padding: 8, boxSizing: 'border-box', marginBottom: 8 }} />

                <div style={{ marginBottom: 8 }}>Statut proposition:</div>
                <input value={modalStatut || 'EN_ATTENTE'} readOnly style={{ width: '100%', padding: 8, boxSizing: 'border-box', background: '#f8fafc' }} />
              </>
            )}
          </div>
        )}

        {modalType === 'delegationDetails' && (
          <div>
            {delegationDetailsLoading && <div>Chargement détails…</div>}
            {!delegationDetailsLoading && delegationDetails && (
              <div>
                <h3 style={{ marginTop: 0 }}>{delegationDetails.id}</h3>
                <div style={{ color: '#6b7280', marginBottom: 8 }}>Statut: <strong>{delegationDetails.statut}</strong></div>
                <div style={{ marginTop: 8 }}><strong>Affectation originale:</strong> {formatAff(delegationDetails.affectationOriginale)}</div>
                <div style={{ marginTop: 6 }}><strong>Auditeur initial:</strong> {formatAud(delegationDetails.auditeurInitial)}</div>
                <div style={{ marginTop: 6 }}><strong>Auditeur proposé:</strong> {formatAud(delegationDetails.auditeurPropose)}</div>
                <div style={{ marginTop: 6 }}><strong>Date proposition:</strong> {delegationDetails.dateProposition || '-'}</div>
                <div style={{ marginTop: 6 }}><strong>Date réponse:</strong> {delegationDetails.dateReponse || '-'}</div>
                <div style={{ marginTop: 10 }}><strong>Justification:</strong>
                  <div style={{ marginTop: 6, padding: 10, background: '#fafafa', borderRadius: 6 }}>{delegationDetails.justification || '-'}</div>
                </div>
              </div>
            )}
            {!delegationDetailsLoading && !delegationDetails && <div>Détails non trouvés.</div>}
          </div>
        )}

        {modalType === 'details' && (
          <div>

            {taskDetailsLoading && <div>Chargement détails…</div>}
            
           {!taskDetailsLoading && taskDetails && (
          
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>

                    {console.log("tacgffffffffff",taskDetails )}
                    <h3 style={{ marginTop: 0, marginBottom: 6 }}>{taskDetails.tache.nom || '—'}</h3>
                    <div style={{ color: '#6b7280', marginBottom: 8 }}>{taskDetails.tache.type || ''}</div>
                    <p style={{ marginTop: 10, lineHeight: 1.45 }}>{taskDetails.tache.description || 'Pas de description disponible.'}</p>
                  </div>
                  <div style={{ minWidth: 160, textAlign: 'right' }}>
                    <div style={{ marginBottom: 8, fontSize: 13, color: '#6b7280' }}>Statut</div>
                    <div style={{ display: 'inline-block', padding: '6px 10px', borderRadius: 14, background: '#f1f5f9', color: '#0f172a', fontWeight: 700 }}>{taskDetails.tache.statut || '—'}</div>
                    <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}><strong>Créée:</strong><br />{formatDateTime(taskDetails.tache.dateCreation)}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                  <div style={{ background: '#fafafa', padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>Période</div>
                    <div style={{ marginTop: 6 }}><strong>Début:</strong> {formatDate(taskDetails.tache.dateDebut)}</div>
                    <div style={{ marginTop: 4 }}><strong>Fin:</strong> {formatDate(taskDetails.tache.dateFin)}</div>
                    <div style={{ marginTop: 8 }}><strong>Places:</strong> {typeof taskDetails.nombrePlaces === 'number' ? taskDetails.nombrePlaces : '-'}</div>
                  </div>

                  <div style={{ background: '#fafafa', padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>Options</div>
                    <div style={{ marginTop: 6 }}><strong>Rémunéré:</strong> {taskDetails.tache.estRemuneree ? 'Oui' : 'Non'}</div>
                    <div style={{ marginTop: 6 }}><strong>Commune:</strong> {taskDetails.tache.estCommune ? 'Oui' : 'Non'}</div>
                    <div style={{ marginTop: 6 }}><strong>Nécessite véhicule:</strong> {taskDetails.tache.necessiteVehicule ? 'Oui' : 'Non'}</div>
                    <div style={{ marginTop: 6 }}><strong>Direction:</strong> {taskDetails.tache.direction || '-'}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                  <div style={{ background: '#fff', padding: 12, borderRadius: 8, border: '1px solid #eef2f7' }}>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Spécialités concernées</div>
                    <div style={{ color: '#0f172a' }}>{Array.isArray(taskDetails?.tache?.specialitesConcernees) && taskDetails.tache.specialitesConcernees.length ? taskDetails.tache.specialitesConcernees.join(', ') : '-'}</div>
                  </div>

                  <div style={{ background: '#fff', padding: 12, borderRadius: 8, border: '1px solid #eef2f7' }}>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Grades concernés</div>
                    <div style={{ color: '#0f172a' }}>{Array.isArray(taskDetails?.tache?.gradesConcernes) && taskDetails.tache.gradesConcernes.length ? taskDetails.tache.gradesConcernes.join(', ') : '-'}</div>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Fichier administratif</div>
                  {taskDetails.fichierAdministratif ? (
                    <a href={taskDetails.tache.fichierAdministratif} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>Télécharger / Ouvrir le fichier</a>
                  ) : (
                    <div style={{ color: '#6b7280' }}>Aucun fichier</div>
                  )}
                </div>
              </div>
            )}
            {!taskDetailsLoading && !taskDetails && <div>Détails non trouvés pour cette tâche.</div>}
          </div>
        )}
        {/* chat modal removed */}
      </Modal>

      {/* Notifications modal */}
      <Modal
        isOpen={notifOpen}
        title={`Notifications (${notifications.length})`}
        onCancel={() => setNotifOpen(false)}
        onConfirm={() => setNotifOpen(false)}
        confirmText="Fermer"
      >
        {notifLoading && <div>Chargement notifications…</div>}
        {!notifLoading && notifications.length === 0 && <div style={{ color: '#64748b' }}>Aucune notification</div>}
        {!notifLoading && notifications.length > 0 && (
          <div style={{ display: 'grid', gap: 10 }}>
            {notifications.map((n) => (
              <div key={n._id || n.id || Math.random()} style={{ padding: 10, borderRadius: 8, background: n.estLue ? '#fafafa' : '#fff7ed', border: '1px solid #eef2f7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700 }}>{n.titre || n.type || 'Notification'}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{n.dateEnvoi ? new Date(n.dateEnvoi).toLocaleString() : (n.createdAt ? new Date(n.createdAt).toLocaleString() : '')}</div>
                </div>
                <div style={{ marginTop: 6 }}>{n.message || '-'}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  {!n.estLue && <button className="btn-ghost" onClick={async () => {
                    try {
                      const token = localStorage.getItem('basicAuth')
                      const headers = token ? { Authorization: `Basic ${token}` } : {}
                      const API = import.meta.env.VITE_API_URL
                      await axios.put(`${API}/api/notifications/${n._id || n.id}/read`, null, { headers })
                      // local update
                      setNotifications(prev => prev.map(x => x === n ? ({ ...x, estLue: true }) : x))
                    } catch (e) { console.error('mark notification read error', e.response?.status, e.response?.data || e.message); const server = e?.response?.data?.message || e?.response?.data || e?.message || 'Erreur'; alert(`Erreur: ${typeof server === 'string' ? server : JSON.stringify(server)}`) }
                  }}>Marquer comme lue</button>}
                  {n.destinationId && <button className="btn-ghost" onClick={() => { setNotifOpen(false); /* optionally navigate to related item */ }}>{'Voir'}</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <section style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0 }}>Affectations (acceptées )</h4>
          <div style={{ color: '#6b7280', fontSize: 13 }}>{tasks.filter(t => ['ACCEPTEE','AFFECTEE'].includes(t.statut)).length} trouvé(s)</div>
        </div>


        <div style={{ overflowX: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 16px rgba(2,6,23,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 120px 100px', gap: 0, padding: '12px 14px', borderBottom: '1px solid #eef2f7', background: '#f1f5f9', fontWeight: 700, color: '#0f172a' }}>
              <div>Terminer</div>
              <div>Tâche</div>
              <div>Auditeur</div>
              <div>Date</div>
              <div>Mode / Statut</div>
              <div>Statut tâche</div>
              <div style={{ textAlign: 'center' }}>Validée</div>
              <div style={{ textAlign: 'center' }}>Détails</div>
            </div>
            <div>
              {tasks
                .filter((a) => ['ACCEPTEE','DELEGUEE','AFFECTEE','TERMINEE'].includes(a.statut) && (!selectedAuditeur || a.auditeurId === selectedAuditeur))
                .map((a, idx) => {
                  const isHovered = hoveredRow === a.id
                  const bg = isHovered ? '#f8fafc' : (idx % 2 === 0 ? '#ffffff' : '#fbfdff')
                  const audIdVal = a.auditeurId && typeof a.auditeurId === 'object' ? (a.auditeurId._id || a.auditeurId.id) : a.auditeurId
                  const aud = auditeurs.find(u => u.id === audIdVal || u._id === audIdVal)
                  const audLabel = a.auditeurId && typeof a.auditeurId === 'object'
                    ? `${a.auditeurId.nom || ''} ${a.auditeurId.prenom || ''} `.trim()
                    : (aud ? `${aud.nom} ${aud.prenom} ` : a.auditeurId)
                  const tIdVal = a.tacheId && typeof a.tacheId === 'object' ? (a.tacheId._id || a.tacheId.id) : a.tacheId
                  const tLabel =  a.tacheId && typeof a.tacheId === 'object' ? (a.tacheId.description ) : (a.tacheId || '')
                  return (
                  <div key={a.id} onMouseEnter={() => setHoveredRow(a.id)} onMouseLeave={() => setHoveredRow(null)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 120px 100px', gap: 0, padding: '12px 14px', alignItems: 'center', background: bg, borderBottom: '1px solid #f1f5f9', transition: 'background 140ms' }}>
                    <div style={{ textAlign: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalCompleteAffId(a.id);
                          setModalTaskId(tIdVal);
                          setModalType('complete');
                          setModalOpen(true);
                        }}
                        disabled={actionLoading === a.id}
                        style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: '#10b981', color: '#fff' }}
                      >
                        {actionLoading === a.id ? '…' : 'Terminer'}
                      </button>
                    </div>
                    <div style={{ color: '#0b556f' }}>{tLabel}</div>
                    <div style={{ color: '#0f172a' }}>{audLabel}</div>
                    <div style={{ color: '#6b7280' }}>{formatDate(a.dateAffectation)}</div>
                    <div>
                      <div style={{ fontSize: 13, color: '#0f172a' }}>{a.mode}</div>
                      <div style={{ marginTop: 6 }}>{statusBadge(a.statut)}</div>
                    </div>
                    <div style={{ color: '#0f172a' }}>
                      {/* Affiche le statut de la tâche liée si disponible */}
                      {a.tacheId && typeof a.tacheId === 'object' && a.tacheId.statut ? a.tacheId.statut : '-'}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      {a.estValidee ? <span style={{ background: '#ecfdf4', color: '#065f46', padding: '4px 8px', borderRadius: 10 }}>oui</span> : <span style={{ color: '#374151' }}>non</span>}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <button onClick={() => openDetails(tIdVal)} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff' }}>Voir</button>
                    </div>
                  </div>
                  )
                })}
            </div>
          </div>
        </div>
      </section>
    </section>
  )
}
