import React, { useEffect, useState } from "react";
import {
  getAllAffectations,
  deleteAffectation,
  validateAffectationStatus,
  rejectAffectationStatus,
  updateAffectation
} from "../../services/affectationService";
import { getTaskById, getTasks } from "../../services/tacheService";
import { getAuditeurs } from "../../services/userService";
import Modal from "../../components/common/Modal";
import "../../styles/affectation.css";

const Affectation = () => {
  const [affectations, setAffectations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [rejectMsg, setRejectMsg] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskDetails, setTaskDetails] = useState(null);
  const [taskLoading, setTaskLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null) // {type: 'validate'|'reject', id}
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingAff, setEditingAff] = useState(null)
  const [editForm, setEditForm] = useState({ mode: '', dateAffectation: '', estValidee: false, tacheId: '', auditeurName: '' })
  const [savingEdit, setSavingEdit] = useState(false)
  const [tasksList, setTasksList] = useState([])
  const [auditeursList, setAuditeursList] = useState([])

  useEffect(() => {
    getAllAffectations()
      .then((data) => {
        setAffectations(data?.affectations || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement des affectations.");
        setLoading(false);
      });

    // fetch tasks and auditeurs for edit selects
    getTasks().then(d => {
      const list = Array.isArray(d) ? d : (d.taches || d.tasks || [])
      setTasksList(list)
    }).catch(() => {})

    getAuditeurs().then(list => setAuditeursList(list)).catch(() => {})
  }, []);

  const handleDelete = async (id) => {
    // open modal to confirm deletion
    setConfirmDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    const id = confirmDeleteId;
    if (!id) return;
    try {
      await deleteAffectation(id);
      setAffectations(prev => prev.filter(aff => aff._id !== id));
    } catch (e) {
      console.error(e);
      setError('Erreur lors de la suppression.');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleValidate = async (id) => {
    setConfirmAction({ type: 'validate', id });
  };

  const handleReject = async (id) => {
    setConfirmAction({ type: 'reject', id });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;
    try {
      if (type === 'validate') {
        await validateAffectationStatus(id);
        setAffectations(prev => prev.map(aff => aff._id === id ? { ...aff, estValidee: true } : aff));
        setSuccessMsg('Affectation validée avec succès !');
        setTimeout(() => setSuccessMsg(''), 2000);
      } else if (type === 'reject') {
        await rejectAffectationStatus(id);
        setAffectations(prev => prev.map(aff => aff._id === id ? { ...aff, estValidee: false } : aff));
        setRejectMsg('Affectation refusée avec succès !');
        setTimeout(() => setRejectMsg(''), 2000);
      }
    } catch (e) {
      console.error(e);
      setError('Erreur lors de l\'action.');
    } finally {
      setConfirmAction(null);
    }
  };

  const handleShowTaskDetails = async (aff) => {
    if (!aff?.tacheId?._id) return;

    setShowTaskModal(true);
    setTaskLoading(true);

    try {
      const data = await getTaskById(aff.tacheId._id);
      setTaskDetails(data || null);
    } catch (e) {
      setTaskDetails(null);
    } finally {
      setTaskLoading(false);
    }
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setTaskDetails(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const toLocalDatetimeInput = (isoString) => {
    if (!isoString) return ''
    const d = new Date(isoString)
    const tzOffset = d.getTimezoneOffset() * 60000
    const localISO = new Date(d - tzOffset).toISOString().slice(0,16)
    return localISO
  }

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="affectation-page">
      {successMsg && <div className="success-message">{successMsg}</div>}
      {rejectMsg && <div className="reject-message">{rejectMsg}</div>}

      <h2>Liste des Affectations</h2>

      <table className="affectation-table">
        <thead>
          <tr>
            <th>Nom de la tâche</th>
            <th>Auditeur</th>
            <th>Date</th>
            <th>Statut</th>
            <th>Mode</th>
            <th>Validation</th>
            <th>Statut tâche</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {affectations.map((aff) => (
            <tr key={aff._id}>
              <td>{aff?.tacheId?.nom || "-"}</td>
              <td>
                {console.log("AuditeurIdqqqqqqqqqqqq:", aff)}
                {typeof aff.auditeurId === "object" && aff.auditeurId !== null
                  ? `${aff.auditeurId.nom || ""} ${aff.auditeurId.prenom || ""}`
                  : aff.auditeurId || "-"}
              </td>
              <td>
                {aff.dateAffectation
                  ? new Date(aff.dateAffectation).toLocaleString()
                  : "-"}
              </td>
              <td>{aff.statut || "-"}</td>
              <td>{aff.mode || "-"}</td>
              <td>{aff.estValidee ? "Validée" : "Non validée"}</td>
              <td>{aff?.tacheId?.statut || "-"}</td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
                  <button className="btn-accept" style={{margin:0, padding:'7px 0', fontWeight:'bold', background:'#10b981', color:'#fff', border:'none', borderRadius:5, cursor:'pointer'}} onClick={() => handleValidate(aff._id)}>Accepter</button>
                  <button className="btn-refuse" style={{margin:0, padding:'7px 0', fontWeight:'bold', background:'#ef4444', color:'#fff', border:'none', borderRadius:5, cursor:'pointer'}} onClick={() => handleReject(aff._id)}>Refuser</button>
                  <button className="btn-edit" style={{margin:0, padding:'7px 0', fontWeight:'bold', background:'#f59e42', color:'#fff', border:'none', borderRadius:5, cursor:'pointer'}} onClick={() => {
                    // open edit modal
                    setEditingAff(aff)
                    setEditForm({
                      mode: aff.mode || '',
                      dateAffectation: aff.dateAffectation ? toLocalDatetimeInput(aff.dateAffectation) : '',
                      estValidee: !!aff.estValidee,
                      tacheId: aff?.tacheId?._id || aff?.tacheId?.id || (typeof aff.tacheId === 'string' ? aff.tacheId : ''),
                      auditeurName: (typeof aff.auditeurId === 'object' && aff.auditeurId !== null) ? `${aff.auditeurId.prenom || ''} ${aff.auditeurId.nom || ''}`.trim() : (typeof aff.auditeurId === 'string' ? aff.auditeurId : ''),
                      statut: aff?.tacheId?.statut || ''
                    })
                    setEditModalOpen(true)
                  }}>Modifier</button>
                  <button className="btn-delete" style={{margin:0, padding:'7px 0', fontWeight:'bold', background:'#374151', color:'#fff', border:'none', borderRadius:5, cursor:'pointer'}} onClick={() => handleDelete(aff._id)}>Supprimer</button>
                  <button className="btn-details" style={{margin:0, padding:'7px 0', fontWeight:'bold', background:'#2563eb', color:'#fff', border:'none', borderRadius:5, cursor:'pointer'}} onClick={() => handleShowTaskDetails(aff)}>Détails tâche</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={!!confirmDeleteId}
        title="Confirmer la suppression"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        confirmText="Supprimer"
      >
        <div>Voulez-vous vraiment supprimer cette affectation ?</div>
      </Modal>

      <Modal
        isOpen={!!confirmAction}
        title={confirmAction?.type === 'validate' ? 'Confirmer la validation' : 'Confirmer le refus'}
        onCancel={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
        confirmText={confirmAction?.type === 'validate' ? 'Valider' : 'Refuser'}
      >
        <div>{confirmAction?.type === 'validate' ? 'Confirmer la validation de cette affectation ?' : 'Confirmer le refus de cette affectation ?'}</div>
      </Modal>

      {/* Edit Affectation Modal */}
      <Modal
        isOpen={editModalOpen}
        title={`Modifier l'affectation : ${editingAff?.tacheId?.nom || ''}`}
        onCancel={() => { setEditModalOpen(false); setEditingAff(null) }}
        onConfirm={async () => {
          if (!editingAff) return;
          setSavingEdit(true)

          // build a partial payload containing only changed fields
          const partial = {}

          // mode
          if ((editingAff.mode || '') !== (editForm.mode || '')) partial.mode = editForm.mode || null

          // dateAffectation (compare ISO strings normalized)
          const origDate = editingAff.dateAffectation ? new Date(editingAff.dateAffectation).toISOString() : null
          const newDate = editForm.dateAffectation ? new Date(editForm.dateAffectation).toISOString() : null
          if (origDate !== newDate) partial.dateAffectation = newDate

          // estValidee (boolean)
          if (Boolean(editingAff.estValidee) !== Boolean(editForm.estValidee)) partial.estValidee = !!editForm.estValidee

          // tacheId (may be object or string)
          const origTacheId = editingAff?.tacheId?._id || editingAff?.tacheId?.id || (typeof editingAff.tacheId === 'string' ? editingAff.tacheId : '')
          if ((editForm.tacheId || '') !== (origTacheId || '')) partial.tacheId = editForm.tacheId || null

          // auditeurName (manual string)
          const origAudName = (typeof editingAff.auditeurId === 'object' && editingAff.auditeurId !== null) ? `${editingAff.auditeurId.prenom || ''} ${editingAff.auditeurId.nom || ''}`.trim() : (typeof editingAff.auditeurId === 'string' ? editingAff.auditeurId : '')
          if ((editForm.auditeurName || '') !== (origAudName || '')) partial.auditeurName = editForm.auditeurName || null

          // task status (statut on the task object)
          const origTaskStat = editingAff?.tacheId?.statut || ''
          const newTaskStat = editForm.statut || ''
          if ((newTaskStat || '') !== (origTaskStat || '')) partial.tacheStatut = newTaskStat || null

          // if nothing changed, close modal
          if (Object.keys(partial).length === 0) {
            setEditModalOpen(false)
            setEditingAff(null)
            setSavingEdit(false)
            return
          }

          try {
            await updateAffectation(editingAff._id || editingAff.id, partial)
            setAffectations(prev => prev.map(a => {
              if (a._id !== (editingAff._id || editingAff.id) && a.id !== (editingAff._id || editingAff.id)) return a
              const updated = { ...a, ...partial }
              // replace tacheId and auditeurId with objects from lists if available for display
              if (partial.tacheId) {
                const t = tasksList.find(x => (x._id || x.id) === partial.tacheId)
                if (t) updated.tacheId = t
                else updated.tacheId = { _id: partial.tacheId }
              }
              if (partial.tacheStatut) {
                updated.tacheId = updated.tacheId || {}
                if (typeof updated.tacheId === 'object') updated.tacheId.statut = partial.tacheStatut
              }
              if (partial.auditeurName) {
                updated.auditeurId = partial.auditeurName
              }
              return updated
            }))
            setEditModalOpen(false)
            setEditingAff(null)
          } catch (e) {
            console.error(e)
            setError('Erreur lors de la mise à jour de l\'affectation.')
          } finally {
            setSavingEdit(false)
          }
        }}
        confirmText={savingEdit ? 'Enregistrement…' : 'Enregistrer'}
      >
        <div style={{ display: 'grid', gap: 8 }}>
          <label>
            Mode
            <select value={editForm.mode} onChange={e => setEditForm(f => ({ ...f, mode: e.target.value }))} style={{ width: '100%', padding: 6, marginTop: 6 }}>
              <option value="">-- sélectionner --</option>
              <option value="MANUEL">MANUEL</option>
              <option value="SEMI_AUTOMATISE">SEMI_AUTOMATISE</option>
              <option value="AUTOMATISE">AUTOMATISE</option>
            </select>
          </label>

          <label>
            Tâche
            <select value={editForm.tacheId} onChange={e => setEditForm(f => ({ ...f, tacheId: e.target.value }))} style={{ width: '100%', padding: 6, marginTop: 6 }}>
              <option value="">-- sélectionner une tâche --</option>
              {tasksList.map(t => (
                <option key={t._id || t.id} value={t._id || t.id}>{t.nom || t.name || t.nomTache || t.label}</option>
              ))}
            </select>
          </label>

          <label>
            Auditeur (saisir manuellement)
            <input type="text" value={editForm.auditeurName} onChange={e => setEditForm(f => ({ ...f, auditeurName: e.target.value }))} placeholder="Nom de l'auditeur" style={{ width: '100%', padding: 6, marginTop: 6 }} />
          </label>

          <label>
            Date d'affectation
            <input type="datetime-local" value={editForm.dateAffectation} onChange={e => setEditForm(f => ({ ...f, dateAffectation: e.target.value }))} style={{ width: '100%', padding: 6, marginTop: 6 }} />
          </label>

          <label>
            Statut tâche
            <select value={editForm.statut || ''} onChange={e => setEditForm(f => ({ ...f, statut: e.target.value }))} style={{ width: '100%', padding: 6, marginTop: 6 }}>
              <option value="">-- sélectionner --</option>
              <option value="CREEE">CREEE</option>
              <option value="EN_ATTENTE_AFFECTATION">EN_ATTENTE_AFFECTATION</option>
              <option value="AFFECTEE">AFFECTEE</option>
              <option value="EN_COURS">EN_COURS</option>
              <option value="TERMINEE">TERMINEE</option>
              <option value="ANNULEE">ANNULEE</option>
            </select>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={editForm.estValidee} onChange={e => setEditForm(f => ({ ...f, estValidee: e.target.checked }))} /> Est validée
          </label>
        </div>
      </Modal>

      {showTaskModal && (
        <Modal
          isOpen={showTaskModal}
          title={`Détails de la tâche : ${taskDetails?.tache?.nom || ""}`}
          onCancel={handleCloseTaskModal}
          onConfirm={handleCloseTaskModal}
          confirmText="Fermer"
        >
          <div>
            {taskLoading && <div>Chargement détails…</div>}
            
            {!taskLoading && taskDetails && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginTop: 0, marginBottom: 6 }}>{taskDetails.tache.nom || '—'}</h3>
                    <div style={{ color: '#6b7280', marginBottom: 8 }}>{taskDetails.tache.type || ''}</div>
                    <p style={{ marginTop: 10, lineHeight: 1.45 }}>{taskDetails.tache.description || 'Pas de description disponible.'}</p>
                  </div>
                  <div style={{ minWidth: 160, textAlign: 'right' }}>
                    <div style={{ marginBottom: 8, fontSize: 13, color: '#6b7280' }}>Statut</div>
                    <div style={{ display: 'inline-block', padding: '6px 10px', borderRadius: 14, background: '#f1f5f9', color: '#0f172a', fontWeight: 700 }}>{taskDetails.tache.statut || '—'}</div>
                    <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
                      <strong>Créée:</strong><br />{formatDateTime(taskDetails.tache.dateCreation)}
                    </div>
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
                    <div style={{ color: '#0f172a' }}>
                      {Array.isArray(taskDetails?.tache?.specialitesConcernees) && taskDetails.tache.specialitesConcernees.length 
                        ? taskDetails.tache.specialitesConcernees.join(', ') 
                        : '-'}
                    </div>
                  </div>

                  <div style={{ background: '#fff', padding: 12, borderRadius: 8, border: '1px solid #eef2f7' }}>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Grades concernés</div>
                    <div style={{ color: '#0f172a' }}>
                      {Array.isArray(taskDetails?.tache?.gradesConcernes) && taskDetails.tache.gradesConcernes.length 
                        ? taskDetails.tache.gradesConcernes.join(', ') 
                        : '-'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Fichier administratif</div>
                  {taskDetails.tache.fichierAdministratif ? (
                    <a href={taskDetails.tache.fichierAdministratif} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>
                      Télécharger / Ouvrir le fichier
                    </a>
                  ) : (
                    <div style={{ color: '#6b7280' }}>Aucun fichier</div>
                  )}
                </div>
              </div>
            )}

            {!taskLoading && !taskDetails && (
              <div>Détails non trouvés pour cette tâche.</div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Affectation;