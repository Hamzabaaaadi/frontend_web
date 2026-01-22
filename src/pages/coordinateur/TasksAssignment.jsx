import React, { useState } from "react";
import Modal from "../../components/common/Modal";
import Tabs from "../../components/ui/Tabs";
import TaskForm from "../../components/tasks/TaskForm";
import TaskTable from "../../components/tasks/TaskTable";
import * as coordSvc from '../../services/cordinateurServices'
import * as userSvc from '../../services/userService'
import { auditeursData } from '../../data/messages'


const TasksAssignment = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showAffectModal, setShowAffectModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedAuditeurs, setSelectedAuditeurs] = useState([]);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [auditeurs, setAuditeurs] = useState([])
  const [auditeursLoading, setAuditeursLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [confirmAction, setConfirmAction] = useState(null) // {type: 'rejectAffect'|'deleteTask', payload}

  // Load tasks and auditeurs on mount
  useState(() => { /* keep linter happy if no deps */ })
  React.useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const tResp = await coordSvc.getTasks()
        const list = Array.isArray(tResp) ? tResp : (tResp && Array.isArray(tResp.taches) ? tResp.taches : [])
        const normalized = (list || []).map(normalizeTask)
        if (mounted) setTasks(normalized)
        // load auditeurs
        try {
          const aResp = await userSvc.getAuditeurs()
          const alist = Array.isArray(aResp) ? aResp : (aResp && Array.isArray(aResp.users) ? aResp.users : [])
          if (mounted) setAuditeurs(alist)
        } catch (e) { console.warn('load auditeurs failed', e.message) }
      } catch (err) {
        console.error('load tasks failed', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const handleAddTask = (task) => {
    (async () => {
      try {
        if (editingTask) {
          const id = editingTask._id || editingTask.id
          await coordSvc.updateTask(id, { ...task, mode: editingTask.mode })
          const tResp = await coordSvc.getTasks()
          const list = Array.isArray(tResp) ? tResp : (tResp && Array.isArray(tResp.taches) ? tResp.taches : [])
          setTasks((list || []).map(normalizeTask))
          setEditingTask(null)
          alert('Tâche modifiée avec succès !')
        } else {
          const payload = { ...task, mode: activeTab === 0 ? 'Manuel' : activeTab === 1 ? 'Semi-automatisée' : 'Automatisé (IA)' }
          await coordSvc.createTask(payload)
          const tResp = await coordSvc.getTasks()
          const list = Array.isArray(tResp) ? tResp : (tResp && Array.isArray(tResp.taches) ? tResp.taches : [])
          setTasks((list || []).map(normalizeTask))
          alert('Tâche créée avec succès !')
        }
      } catch (err) {
        console.error('handleAddTask error', err)
        alert('Erreur lors de la sauvegarde de la tâche')
      } finally {
        setShowForm(false)
      }
    })()
  };

  const normalizeTask = (t) => {
    return {
      _id: t._id || t.id || t._id,
      id: t.id || t._id,
      // accept backend fields in French (nom, specialitesConcernees, nombrePlaces, etc.)
      name: t.name || t.titre || t.title || t.nom || '',
      specialties: Array.isArray(t.specialties)
        ? t.specialties
        : (Array.isArray(t.specialitesConcernees) ? t.specialitesConcernees : (t.specialty ? [t.specialty] : (t.specialitesConcernees ? [t.specialitesConcernees] : []))),
      grades: Array.isArray(t.grades)
        ? t.grades
        : (Array.isArray(t.gradesConcernes) ? t.gradesConcernes : (t.grade ? [t.grade] : (t.gradesConcernes ? [t.gradesConcernes] : []))),
      slots: typeof t.slots === 'number' ? t.slots : (typeof t.nombrePlaces === 'number' ? t.nombrePlaces : (t.places || 1)),
      mode: t.mode || t.modeText || 'Manuel',
      estRemuneree: typeof t.estRemuneree === 'boolean' ? t.estRemuneree : (t.paid || false),
      estCommune: typeof t.estCommune === 'boolean' ? t.estCommune : false,
      necessiteVehicule: typeof t.necessiteVehicule === 'boolean' ? t.necessiteVehicule : false,
      fichierAdministratif: t.fichierAdministratif || t.file || null,
      statut: t.statut || t.status || 'CREEE',
      affectations: Array.isArray(t.affectations) ? t.affectations : [],
      ...t,
    }
  }

  const generateAutoSuggestions = (task) => {
    const pool = (auditeurs && auditeurs.length) ? auditeurs : auditeursData
    const tSpecialties = Array.isArray(task.specialties) ? task.specialties : (task.specialty ? [task.specialty] : [])
    const tGrades = Array.isArray(task.grades) ? task.grades : (task.grade ? [task.grade] : [])

    const compatibleAuditeurs = pool.filter(auditeur => {
      const specialtyMatch = tSpecialties.length > 0 && tSpecialties.some(s => (auditeur.specialty || '').toString().toLowerCase().includes(s.toString().split(' ')[1] ? s.toString().split(' ')[1].toLowerCase() : s.toString().toLowerCase()));
      const gradeMatch = tGrades.length > 0 && tGrades.includes(auditeur.grade);
      return specialtyMatch || gradeMatch;
    });

    return compatibleAuditeurs.map(auditeur => ({
      auditeurId: auditeur.id,
      auditeurName: auditeur.name,
      score: Math.floor(Math.random() * 20) + 80,
      specialty: auditeur.specialty,
      grade: auditeur.grade,
    })).sort((a, b) => b.score - a.score).slice(0, task.slots || 1);
  };

  const handleAffect = (task) => {
    (async () => {
      setSelectedTask(task);
      setSelectedAuditeurs([]);
      // Clear previous auditeurs to avoid showing stale full list while fetching proposals
      setAuditeurs([])
      // fetch auditeurs list from backend (falls back to previous local data)
      try {
        setAuditeursLoading(true)
        console.debug('[TasksAssignment] handleAffect start:', { taskId: task && (task._id || task.id), mode: task && task.mode })
        // Determine mode (manual / semi / auto)
        const modeText = (task && task.mode && task.mode.toString().toLowerCase()) || ''
        const isSemi = modeText.includes('semi')
        const isAuto = modeText.includes('ia') || modeText.includes('autom')

        if (isSemi || isAuto) {
          // For semi-automatic and automatic IA modes: request proposals and show only those auditeurs
          try {
            const tid = task._id || task.id || task
            let proposals = null
            if (isSemi) proposals = await coordSvc.getSemiAutoProposals(tid)
            else proposals = await coordSvc.getAutoProposals(tid)

            console.debug('[TasksAssignment] Received proposals (normalized):', proposals)
            // The service returns a normalized array; ensure we have an array
            const mapped = Array.isArray(proposals) ? proposals : []
            console.debug('[TasksAssignment] proposals mapped length =', mapped.length)
            setAuditeurs(mapped)
          } catch (err) {
            console.warn('handleAffect proposals failed', err && err.message ? err.message : err)
            // keep auditeurs empty so UI shows 'Aucun auditeur proposé'
            setAuditeurs([])
          }
        } else {
          // Manuel or other modes: load full auditeurs list
          const aResp = await userSvc.getAuditeurs()
          const alist = Array.isArray(aResp) ? aResp : (aResp && Array.isArray(aResp.users) ? aResp.users : [])
          console.debug('[TasksAssignment] auditeurs list loaded (manual)', alist)
          setAuditeurs(alist)
        }
      } catch (e) { console.warn('handleAffect getAuditeurs failed', e.message); setAuditeurs([]) }
      finally { setAuditeursLoading(false) }

      // Present the affect modal. For Semi and Automatisé(IA) we already loaded proposals into `auditeurs`.
      const modeText = (task && task.mode && task.mode.toString().toLowerCase()) || ''
      const isAuto = modeText.includes('ia') || modeText.includes('autom')
      if (isAuto) {
        // Automatisé (IA) should follow same structure as Semi-automatisée: show affect modal with proposed auditeurs
        setAiSuggestions([])
        setShowAffectModal(true)
      } else if (modeText.includes('semi')) {
        setAiSuggestions([])
        setShowAffectModal(true)
      } else {
        setAiSuggestions([]);
        setShowAffectModal(true);
      }
      // Do not force page scrolling; modal is presented as overlay and body scroll is locked via effect
    })()
  };

  const handleModeChange = (task, newMode) => {
    (async () => {
      try {
        // update local UI immediately
        setTasks(prev => prev.map(t => (t._id || t.id) === (task._id || task.id) ? { ...t, mode: newMode } : t))
        // persist change to backend (normalize id)
        const id = task._id || task.id || task
        await coordSvc.updateTask(id, { ...task, mode: newMode })
      } catch (err) {
        console.error('handleModeChange error', err)
        alert('Erreur lors de la mise à jour du mode')
      }
    })()
  }

  // Prevent background page scroll when either modal is open (fixes mobile portrait jumps)
  React.useEffect(() => {
    const original = document.body.style.overflow || '';
    if (showAffectModal || showSuggestionsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = original;
    }
    return () => { document.body.style.overflow = original };
  }, [showAffectModal, showSuggestionsModal]);

  const validateAutoSuggestions = () => {
    const newAffectations = aiSuggestions.map(sug => ({
      auditeurId: sug.auditeurId,
      auditeurName: sug.auditeurName,
      status: "En attente validation",
      dateAffectation: new Date().toLocaleString("fr-FR"),
      score: sug.score,
      autoGenerated: true,
    }));

    setTasks(tasks.map(t => 
      (t._id || t.id) === (selectedTask._id || selectedTask.id)
        ? { ...t, affectations: [...(t.affectations || []), ...newAffectations] }
        : t
    ));
    console.log('Validated auto suggestions', tasks);

    setShowSuggestionsModal(false);
    alert("Suggestions envoyées pour validation !");
  };

  const handleManualAffect = () => {
    (async () => {
      if (selectedAuditeurs.length === 0) {
        alert('Veuillez sélectionner au moins un auditeur');
        return;
      }
      try {
        const tid = selectedTask._id || selectedTask.id || selectedTask
        console.debug('handleManualAffect selectedAuditeurs', selectedAuditeurs)
        for (const audIdRaw of selectedAuditeurs) {
          console.debug('handleManualAffect assigning raw', audIdRaw)
          await coordSvc.assignTask(tid, audIdRaw, selectedTask.mode)
        }
        const tResp = await coordSvc.getTasks()
        const list = Array.isArray(tResp) ? tResp : (tResp && Array.isArray(tResp.taches) ? tResp.taches : [])
        setTasks((list || []).map(normalizeTask))
        setShowAffectModal(false)
        alert('Affectations envoyées pour validation !')
      } catch (err) {
        console.error('handleManualAffect error', err)
        alert('Erreur lors de l\'affectation')
      }
    })()
  };

  const validateAffectation = (taskId, affectationId) => {
    (async () => {
      try {
        const affId = affectationId
        await coordSvc.validateAffectation(affId)
        const tResp = await coordSvc.getTasks()
        const list = Array.isArray(tResp) ? tResp : (tResp && Array.isArray(tResp.taches) ? tResp.taches : [])
        setTasks((list || []).map(normalizeTask))
        alert('Affectation validée par le coordinateur !')
      } catch (err) {
        console.error('validateAffectation error', err)
        alert('Erreur lors de la validation')
      }
    })()
  };

  const rejectAffectation = (taskId, affectationId) => {
    setConfirmAction({ type: 'rejectAffect', taskId, affectationId })
  };

  const toggleAuditeur = (id) => {
    // Defensive extraction: if caller passed an object, try to pull an id-like field
    const extractLocalId = (raw) => {
      if (raw === null || typeof raw === 'undefined') return ''
      if (typeof raw === 'string' || typeof raw === 'number') return String(raw).trim()
      if (typeof raw === 'object') {
        if (raw.auditeurId) return String(raw.auditeurId)
        if (raw.id) return String(raw.id)
        if (raw._id) return String(raw._id)
        if (raw.userId) return String(raw.userId)
        if (raw.auditorId) return String(raw.auditorId)
      }
      return ''
    }

    const sid = extractLocalId(id)
    if (!sid) return
    setSelectedAuditeurs(prev =>
      prev.includes(sid) ? prev.filter(aid => aid !== sid) : [...prev, sid]
    );
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (task) => {
    setConfirmAction({ type: 'deleteTask', task })
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return
    const { type } = confirmAction
    try {
      if (type === 'rejectAffect') {
        const { affectationId } = confirmAction
        await coordSvc.refuseAffectation(affectationId)
        const tResp = await coordSvc.getTasks()
        const list = Array.isArray(tResp) ? tResp : (tResp && Array.isArray(tResp.taches) ? tResp.taches : [])
        setTasks(list)
        alert('Affectation rejetée !')
      } else if (type === 'deleteTask') {
        const task = confirmAction.task
        const id = task._id || task.id || task
        await coordSvc.deleteTask(id)
        const tResp = await coordSvc.getTasks()
        const list = Array.isArray(tResp) ? tResp : (tResp && Array.isArray(tResp.taches) ? tResp.taches : [])
        setTasks(list)
        alert('Tâche supprimée !')
      }
    } catch (err) {
      console.error('confirm action error', err)
      alert('Erreur lors de l\'opération')
    } finally {
      setConfirmAction(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingTask(null);
    setShowForm(false);
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div>
          <h1>📋 Affectation des tâches</h1>
          <p className="page-subtitle">Créez des tâches et gérez leur affectation aux auditeurs (validation obligatoire)</p>
        </div>
        {!showForm && (
          <button 
            className="btn-primary btn-create"
            onClick={() => setShowForm(true)}
          >
            ➕ Créer une nouvelle tâche
          </button>
        )}
      </div>

      <Tabs
        tabs={[]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {showForm && (
        <div className="form-container">
          <TaskForm 
            onSubmit={handleAddTask} 
            initialData={editingTask}
            onCancel={handleCancelEdit}
            isEditing={!!editingTask}
          />
        </div>
      )}

      <div className="tasks-section">
        <div className="section-header-row">
          <h2>📑 Tâches en attente d'affectation</h2>
          <span className="tasks-count">{tasks.length} tâche(s)</span>
        </div>
        
        {tasks.some(t => t.affectations?.some(a => a.status === "En attente validation")) && (
          <div className="pending-validation-banner">
            ⚠️ Des affectations nécessitent votre validation
          </div>
        )}

        <TaskTable 
      
          tasks={tasks} 
          onAffect={handleAffect} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          onModeChange={handleModeChange}
        />

        {tasks.filter(t => t.affectations?.length > 0).map(task => (
          <div key={task._id || task.id} className="validation-section">
            <h3>🔍 Affectations pour "{task.name}"</h3>
            <p className="task-mode-info">
              Mode: <strong>{task.mode}</strong>
              {(task.mode === "Semi-automatisée" || task.mode === "Automatisé (IA)") && (
                <span className="auto-badge">Suggestions automatiques</span>
              )}
            </p>
            <div className="affectations-list-validation">
              {task.affectations.map((aff, idx) => (
                <div key={aff._id || aff.id || aff.auditeurId || idx} className={`affectation-card ${aff.status === "Validée" ? "validated" : "pending"}`}>
                  <div className="affectation-header-card">
                    <div className="auditeur-info-card">
                      <div className="auditeur-avatar-small">
                        {( (aff.auditeurName || (aff.auditeur && aff.auditeur.name) || '').split(" ").map(n => n[0]).join("") )}
                      </div>
                      <div>
                        <div className="auditeur-name-large">{aff.auditeurName || (aff.auditeur && aff.auditeur.name) || 'N/A'}</div>
                        <div className="affectation-date-small">Affecté le {aff.dateAffectation}</div>
                      </div>
                    </div>
                    {aff.score && (
                      <div className="score-badge">
                        Score: {aff.score}%
                        {aff.autoGenerated && <span className="ai-badge">IA</span>}
                      </div>
                    )}
                  </div>
                  
                  {aff.status === "En attente validation" ? (
                    <div className="validation-actions">
                      <button
                        className="btn-validate"
                        onClick={() => validateAffectation(task._id || task.id, aff._id || aff.id || aff.auditeurId)}
                      >
                        ✓ Valider l'affectation
                      </button>
                      <button
                        className="btn-reject-small"
                        onClick={() => rejectAffectation(task._id || task.id, aff._id || aff.id || aff.auditeurId)}
                      >
                        ✕ Rejeter
                      </button>
                    </div>
                  ) : (
                    <div className="validated-status">
                      ✓ Validée le {aff.dateValidation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showAffectModal && selectedTask && (
        <>
          <div className="modal-overlay" onClick={() => setShowAffectModal(false)}></div>
          <div className="affect-modal">
            <div className="modal-header">
              <h3>Affecter des auditeurs - {selectedTask.mode}</h3>
              <button className="modal-close" onClick={() => setShowAffectModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="task-info-summary">
                <h4>{selectedTask.name}</h4>
                <p>Places: {selectedTask.slots} | Mode: {selectedTask.mode}</p>
              </div>

              {aiSuggestions.length > 0 && (
                <div className="suggestions-section">
                  <h4>💡 Suggestions automatiques (cliquez pour sélectionner)</h4>
                  <div className="suggestions-list">
                    {aiSuggestions.map(sug => {
                      const raw = sug && (sug.id || sug.auditeurId || sug._id || sug.userId)
                      const sugId = raw ? String(raw).trim() : ''
                      const checked = sugId && selectedAuditeurs.includes(sugId)
                      return (
                        <div
                          key={sugId || `sug-${Math.random()}`}
                          className={`suggestion-card ${checked ? "selected" : ""}`}
                          onClick={() => sugId && toggleAuditeur(sugId)}
                        >
                          <div className="suggestion-score">{sug.score}%</div>
                          <div className="suggestion-info">
                            <div className="suggestion-name">{sug.auditeurName}</div>
                            <div className="suggestion-details">{/* only name displayed per request */}</div>
                          </div>
                          <div className="ai-recommendation">Recommandé par IA</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="auditeurs-selection">
                <h4>{(selectedTask && (() => { const m = selectedTask.mode && selectedTask.mode.toString().toLowerCase(); return m && (m.includes('semi') || m.includes('ia') || m.includes('autom')); })()) ? '🔎 Auditeurs proposés' : '👥 Tous les auditeurs disponibles'}</h4>
                <div className="auditeurs-grid">
                    {(auditeurs && auditeurs.length ? auditeurs : ( (selectedTask && (() => { const m = selectedTask.mode && selectedTask.mode.toString().toLowerCase(); return m && (m.includes('semi') || m.includes('ia') || m.includes('autom')); })()) ? [] : auditeursData )).map((auditeur, idx) => {
                      // compute a safe id for selection; if not present, selection will be disabled
                      const audId = auditeur && (auditeur.auditeurId || auditeur.id || auditeur._id || auditeur.userId) ? String(auditeur.auditeurId || auditeur.id || auditeur._id || auditeur.userId).trim() : ''
                      const canSelect = !!audId
                      const displayName = (auditeur && (auditeur.name || auditeur.prenom || auditeur.nom))
                        ? (auditeur.name || `${auditeur.prenom || ''} ${auditeur.nom || ''}`.trim())
                        : (auditeur.userId || auditeur.id || `Auditeur ${idx+1}`)
                      const checked = canSelect && selectedAuditeurs.includes(audId)
                      return (
                        <div
                          key={audId || `aud-${idx}`}
                          className={`auditeur-card ${checked ? "selected" : ""}`}
                          onClick={() => canSelect && toggleAuditeur(audId)}
                        >
                          <div className="auditeur-checkbox">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => canSelect && toggleAuditeur(audId)}
                              className="checkbox-input"
                              disabled={!canSelect}
                            />
                          </div>
                          <div className="auditeur-avatar">
                            <span>{((displayName || '').toString().split(" ").map(n => n[0]).join(""))}</span>
                          </div>
                          <div className="auditeur-info">
                            <div className="auditeur-name">{displayName}</div>
                            <div className="auditeur-details">{/* only name/prenom — no grade shown */}</div>
                          </div>
                        </div>
                      )
                    })}
                </div>
                  {auditeursLoading && (
                    <div className="auditeurs-loading">Chargement des auditeurs…</div>
                  )}
                  {(selectedTask && (() => { const m = selectedTask.mode && selectedTask.mode.toString().toLowerCase(); return m && (m.includes('semi') || m.includes('ia') || m.includes('autom')); })() && (!auditeurs || auditeurs.length === 0) && !auditeursLoading) && (
                    <div className="no-proposals">Aucun auditeur proposé par l'API pour cette tâche.</div>
                  )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAffectModal(false)}>Annuler</button>
              <button className="btn-primary" onClick={handleManualAffect}>
                Envoyer pour validation ({selectedAuditeurs.length})
              </button>
            </div>
          </div>
        </>
      )}

      {showSuggestionsModal && selectedTask && (
        <>
        {console.log('Rendering AI suggestions modal with suggestionsrrrrrrrrrrrrrrrrrrrrr', aiSuggestions)}

          <div className="modal-overlay" onClick={() => setShowSuggestionsModal(false)}></div>
          <div className="affect-modal">
            <div className="modal-header">
              <h3>🧠 Suggestions automatiques (IA)</h3>
              <button className="modal-close" onClick={() => setShowSuggestionsModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="task-info-summary">
                <h4>{selectedTask.name}</h4>
                <p>L'intelligence artificielle a sélectionné les meilleurs auditeurs</p>
              </div>
              <div className="ai-suggestions-list">
                {aiSuggestions.map((sug, idx) => (
                  <div key={sug.auditeurId} className="ai-suggestion-card">
                    <div className="suggestion-rank">#{idx + 1}</div>
                    <div className="auditeur-avatar-large">
                      {( (sug.auditeurName || '').split(" ").map(n => n[0]).join("") )}
                    </div>
                    <div className="suggestion-details-full">
                      <div className="suggestion-name-large">{sug.auditeurName || 'N/A'}</div>
                      <div className="suggestion-meta">{sug.specialty} • Grade {sug.grade}</div>
                    </div>
                    <div className="suggestion-score-large">
                      <span className="score-number">{sug.score}%</span>
                      <span className="score-label">Compatibilité</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="validation-notice">
                ⚠️ Ces suggestions nécessitent votre validation avant d'être finalisées
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowSuggestionsModal(false)}>Annuler</button>
              <button className="btn-primary" onClick={validateAutoSuggestions}>
                Envoyer pour validation
              </button>
            </div>
          </div>
        </>
      )}
        <Modal
          isOpen={!!confirmAction}
          title={confirmAction?.type === 'deleteTask' ? "Confirmer la suppression" : "Confirmer l'action"}
          onCancel={() => setConfirmAction(null)}
          onConfirm={handleConfirmAction}
          confirmText={confirmAction?.type === 'deleteTask' ? 'Supprimer' : 'Confirmer'}
        >
          <div>
            {confirmAction?.type === 'deleteTask' && `Voulez-vous vraiment supprimer la tâche "${confirmAction?.task?.name || ''}" ?`}
            {confirmAction?.type === 'rejectAffect' && 'Voulez-vous vraiment rejeter cette affectation ?'}
          </div>
        </Modal>
    </div>
  );
};

export default TasksAssignment;