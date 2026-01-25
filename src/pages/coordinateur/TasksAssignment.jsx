import React, { useState } from "react";
import Tabs from "../../components/ui/Tabs";
import TaskForm from "../../components/tasks/TaskForm";
import TaskTable from "../../components/tasks/TaskTable";
import Modal from '../../components/common/Modal';
import Chat from '../../components/chat/Chat';
import * as coordSvc from '../../services/cordinateurServices'
import * as userSvc from '../../services/userService'
import { auditeursData } from '../../data/messages'

const TasksAssignment = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [discussionTask, setDiscussionTask] = useState(null);
  
  let coordinatorId = 'coordinateur_default';
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      coordinatorId = user._id || user.id || user.userId || user.email || 'coordinateur_default';
    }
  } catch {}
  
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

  const errorRef = React.useRef(null);
  
  React.useEffect(() => {
    if (
      showAffectModal &&
      selectedTask &&
      selectedAuditeurs.length > (selectedTask.slots || 1) &&
      errorRef.current
    ) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showAffectModal, selectedAuditeurs.length, selectedTask]);
  
  React.useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const tResp = await coordSvc.getTasks()
        const list = Array.isArray(tResp) ? tResp : (tResp && Array.isArray(tResp.taches) ? tResp.taches : [])
        const normalized = (list || []).map(normalizeTask)
        if (mounted) setTasks(normalized)
        
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
          const payload = { 
            ...task, 
            mode: activeTab === 0 ? 'Manuel' : activeTab === 1 ? 'Semi-automatisée' : 'Automatisé (IA)', 
            statut: 'AFFECTEE' 
          }
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
      _id: t._id || t.id,
      id: t.id || t._id,
      name: t.name || t.titre || t.title || t.nom || '',
      specialties: Array.isArray(t.specialties) ? t.specialties : (Array.isArray(t.specialitesConcernees) ? t.specialitesConcernees : []),
      grades: Array.isArray(t.grades) ? t.grades : (Array.isArray(t.gradesConcernes) ? t.gradesConcernes : []),
      slots: typeof t.slots === 'number' ? t.slots : (typeof t.nombrePlaces === 'number' ? t.nombrePlaces : 1),
      mode: t.mode || t.modeText || 'Manuel',
      estRemuneree: typeof t.estRemuneree === 'boolean' ? t.estRemuneree : false,
      estCommune: typeof t.estCommune === 'boolean' ? t.estCommune : false,
      necessiteVehicule: typeof t.necessiteVehicule === 'boolean' ? t.necessiteVehicule : false,
      fichierAdministratif: t.fichierAdministratif || t.file || null,
      statut: t.statut || t.status || 'CREEE',
      affectations: Array.isArray(t.affectations) ? t.affectations : [],
      ...t,
    }
  }
const handleAffect = (task) => {
  (async () => {
    setSelectedTask(task);
    setSelectedAuditeurs([]);
    
    try {
      setAuditeursLoading(true);
      const isSemi = (task && task.mode && task.mode.toString().toLowerCase().includes('semi'));
      
      if (isSemi) {
        // Mode Semi-automatique
        try {
          const tid = task._id || task.id;
          const proposals = await coordSvc.getSemiAutoProposals(tid);
          const arr = Array.isArray(proposals) ? proposals : (proposals?.candidats || proposals?.candidates || []);

          console.log('📥 Propositions semi-auto reçues:', arr.length);

          const mapped = arr
            .map((c, idx) => {
              const a = c?.auditor || c?.auditeur || c;
              const id = String(a?._id || c?.auditorId || a?.id || idx);
              const prenom = a?.prenom || a?.firstName || '';
              const nom = a?.nom || a?.lastName || '';
              const name = a?.name || `${prenom} ${nom}`.trim();

              return {
                id,
                name,
                email: a?.email || '',
                specialty: a?.specialite || a?.specialty || '',
                grade: a?.grade || '',
                score: c?.score || 0,
              };
            })
            .filter(m => m.id && m.id.trim() !== '') // ✅ Filtrer les IDs vides
            .slice(0, task.slots); // ✅ Limiter au nombre de slots

          console.log('✅ Propositions semi-auto valides:', mapped.length, '/', task.slots);
          setAuditeurs(mapped);
          setShowAffectModal(true); // Afficher le modal après chargement des auditeurs

        } catch (err) {
          console.warn('getSemiAutoProposals failed', err.message);
          setAuditeurs([]);
        }
      } else if (task.mode === "Automatisé (IA)") {
        // Mode Automatique IA
        setAiSuggestions([]);
        setShowSuggestionsModal(true);
        
        try {
          const tid = task._id || task.id;
          const resp = await coordSvc.getAutoProposals(tid);
          
          console.log('📥 Réponse brute de l\'API IA:', resp);
          
          const arr = Array.isArray(resp) ? resp : (resp?.candidats || resp?.auditeurs || []);

          console.log('📊 Nombre de candidats IA reçus:', arr.length);
          console.log('📊 Nombre de slots requis:', task.slots);

          const mapped = arr
            .map((c, idx) => {
              const aud = c?.auditeur || c?.auditor || c;
              const audId = extractIdLocal(c?.auditeurId || aud?._id || aud?.id || idx);
              const name = aud?.name || `${aud?.prenom || ''} ${aud?.nom || ''}`.trim() || c?.auditeurName || '';
              const score = c?.score ?? c?.scorePercent ?? null;
              
              console.log(`👤 Candidat IA ${idx + 1}:`, {
                audId,
                name,
                score,
                hasValidId: !!(audId && audId.trim() !== '')
              });
              
              return {
                auditeurId: audId,
                auditeurName: name,
                prenom: aud?.prenom || null,
                nom: aud?.nom || null,
                score: score,
                specialty: c?.specialty || aud?.specialite || '',
                grade: c?.grade || aud?.grade || '',
                dateAffectation: c?.dateAffectation || c?.date || null,
                raw: c
              };
            })
            .filter(m => m.auditeurId && m.auditeurId.trim() !== '') // ✅ Filtrer les IDs vides
            .slice(0, task.slots); // ✅ Limiter au nombre de slots
          
          console.log('✅ Suggestions IA finales après filtrage:', mapped.length, '/', task.slots);
          console.log('✅ Détails des suggestions:', mapped);
          
          setAiSuggestions(mapped);
          
        } catch (e) {
          console.error('getAutoProposals failed', e);
          setAiSuggestions([]);
        }
      } else {
        // Mode Manuel
        try {
          const aResp = await userSvc.getAuditeurs();
          const alist = Array.isArray(aResp) ? aResp : (aResp?.users || []);
          setAuditeurs(alist);
        } catch (e) {
          console.warn('getAuditeurs failed', e.message);
          setAuditeurs([]);
        }
        
        setAiSuggestions([]);
        setShowAffectModal(true);
      }
      
    } catch (e) { 
      console.warn('handleAffect failed', e.message);
      setAuditeurs([]);
      setAiSuggestions([]);
    } finally { 
      setAuditeursLoading(false);
    }
  })();
};

  const handleModeChange = (task, newMode) => {
    (async () => {
      try {
        setTasks(prev => prev.map(t => (t._id || t.id) === (task._id || task.id) ? { ...t, mode: newMode } : t))
        const id = task._id || task.id
        await coordSvc.updateTask(id, { ...task, mode: newMode })
      } catch (err) {
        console.error('handleModeChange error', err)
        alert('Erreur lors de la mise à jour du mode')
      }
    })()
  }

  React.useEffect(() => {
    const original = document.body.style.overflow || '';
    if (showAffectModal || showSuggestionsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = original;
    }
    return () => { document.body.style.overflow = original };
  }, [showAffectModal, showSuggestionsModal]);

  const validateAutoSuggestions = async () => {
  try {
    const tid = selectedTask?._id || selectedTask?.id;
    if (!tid) throw new Error('Task id missing');
    
    // ✅ Filtrer et limiter directement aiSuggestions
    const validSuggestions = aiSuggestions
      .map(sug => {
        const audId = extractIdLocal(sug.auditeurId || sug.id || sug._id);
        return {
          auditeurId: audId,
          auditeurName: sug.auditeurName || sug.name || `${sug.prenom || ''} ${sug.nom || ''}`.trim(),
          prenom: sug.prenom || null,
          nom: sug.nom || null,
          score: sug.score,
          raw: sug
        };
      })
      .filter(sug => sug.auditeurId && sug.auditeurId.trim() !== '') // ✅ Enlever les IDs vides
      .slice(0, selectedTask.slots); // ✅ Limiter au nombre de slots
    
    console.log('🔍 Nombre de slots:', selectedTask.slots);
    console.log('🔍 Suggestions IA reçues:', aiSuggestions.length);
    console.log('🔍 Suggestions valides à envoyer:', validSuggestions.length);
    console.log('🔍 Détails:', validSuggestions);

    if (validSuggestions.length === 0) {
      alert('Aucune suggestion valide à envoyer');
      return;
    }

    // ✅ Envoyer seulement les suggestions valides
    let compteur = 0;
    for (const sug of validSuggestions) {
      console.log(`📤 Envoi affectation ${compteur + 1}/${validSuggestions.length}:`, sug.auditeurId);
      
      try {
        await coordSvc.assignTask(tid, sug.auditeurId, selectedTask.mode);
        compteur++;
      } catch (e) {
        console.error('❌ Erreur assignTask:', e);
      }
    }

    console.log(`✅ Total affectations créées: ${compteur}/${validSuggestions.length}`);

    // Recharger les tâches
    const tResp = await coordSvc.getTasks();
    const list = Array.isArray(tResp) ? tResp : (tResp?.taches || []);
    setTasks(list.map(normalizeTask));

    setShowSuggestionsModal(false);
    alert(`${compteur} affectation(s) envoyée(s) pour validation !`);
    
  } catch (err) {
    console.error('validateAutoSuggestions error:', err);
    alert('Erreur lors de l\'envoi des suggestions');
  }
};

  const handleManualAffect = () => {
    (async () => {
      if (selectedAuditeurs.length === 0) {
        alert('Veuillez sélectionner au moins un auditeur');
        return;
      }
      try {
        const tid = selectedTask._id || selectedTask.id
        for (const audId of selectedAuditeurs) {
          await coordSvc.assignTask(tid, audId, selectedTask.mode)
        }
        const tResp = await coordSvc.getTasks()
        const list = Array.isArray(tResp) ? tResp : (tResp?.taches || [])
        setTasks(list.map(normalizeTask))
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
        await coordSvc.validateAffectation(affectationId)
        const tResp = await coordSvc.getTasks()
        const list = Array.isArray(tResp) ? tResp : (tResp?.taches || [])
        setTasks(list.map(normalizeTask))
        alert('Affectation validée !')
      } catch (err) {
        console.error('validateAffectation error', err)
        alert('Erreur lors de la validation')
      }
    })()
  };

  const rejectAffectation = (taskId, affectationId) => {
    (async () => {
      if (!window.confirm("Voulez-vous vraiment rejeter cette affectation ?")) return
      try {
        await coordSvc.refuseAffectation(affectationId)
        const tResp = await coordSvc.getTasks()
        const list = Array.isArray(tResp) ? tResp : (tResp?.taches || [])
        setTasks(list.map(normalizeTask))
        alert('Affectation rejetée !')
      } catch (err) {
        console.error('rejectAffectation error', err)
        alert('Erreur lors du rejet')
      }
    })()
  };

  const toggleAuditeur = (id) => {
    const sid = String(id)
    setSelectedAuditeurs(prev =>
      prev.includes(sid) ? prev.filter(aid => aid !== sid) : [...prev, sid]
    );
  };

  const extractIdLocal = (raw) => {
    if (!raw) return ''
    if (typeof raw === 'string' || typeof raw === 'number') return String(raw).trim()
    if (typeof raw === 'object') {
      return String(raw.$oid || raw.$id || raw._id || raw.id || raw.auditeurId || raw.userId || '')
    }
    return ''
  }

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (task) => {
    (async () => {
      if (!window.confirm(`Voulez-vous vraiment supprimer la tâche "${task.name}" ?`)) return
      try {
        const id = task._id || task.id
        await coordSvc.deleteTask(id)
        const tResp = await coordSvc.getTasks()
        const list = Array.isArray(tResp) ? tResp : (tResp?.taches || [])
        setTasks(list.map(normalizeTask))
        alert('Tâche supprimée !')
      } catch (err) {
        console.error('handleDelete error', err)
        alert('Erreur lors de la suppression')
      }
    })()
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setShowForm(false);
  };

  const handleOpenDiscussion = (task) => {
    setDiscussionTask(task);
    setShowDiscussionModal(true);
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div>
          <h1>📋 Affectation des tâches</h1>
          <p className="page-subtitle">Créez des tâches et gérez leur affectation aux auditeurs</p>
        </div>
        {!showForm && (
          <button className="btn-primary btn-create" onClick={() => setShowForm(true)}>
            ➕ Créer une nouvelle tâche
          </button>
        )}
      </div>

      <Tabs tabs={[]} activeTab={activeTab} onTabChange={setActiveTab} />

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
          onDiscussion={handleOpenDiscussion}
        />

        <Modal
          isOpen={showDiscussionModal}
          title={discussionTask ? `Discussion - ${discussionTask.name}` : 'Discussion'}
          onCancel={() => setShowDiscussionModal(false)}
          onConfirm={() => setShowDiscussionModal(false)}
          confirmText="Fermer"
        >
          <div style={{ minWidth: 320, maxWidth: 480 }}>
            {discussionTask && (
              <Chat taskId={discussionTask._id || discussionTask.id} currentUser={coordinatorId} />
            )}
          </div>
        </Modal>

        {tasks.filter(t => t.affectations?.length > 0).map(task => (
          <div key={task._id || task.id} className="validation-section">
            <h3>🔍 Affectations pour "{task.name}"</h3>
            <p className="task-mode-info">
              Mode: <strong>{task.mode}</strong>
            </p>
            <div className="affectations-list-validation">
              {task.affectations.map((aff, idx) => (
                <div key={aff._id || aff.id || idx} className={`affectation-card ${aff.status === "Validée" ? "validated" : "pending"}`}>
                  <div className="affectation-header-card">
                    <div className="auditeur-info-card">
                      <div className="auditeur-avatar-small">
                        {(aff.auditeurName || '').split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="auditeur-name-large">{aff.auditeurName || 'N/A'}</div>
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
                      <button className="btn-validate" onClick={() => validateAffectation(task._id || task.id, aff._id || aff.id)}>
                        ✓ Valider
                      </button>
                      <button className="btn-reject-small" onClick={() => rejectAffectation(task._id || task.id, aff._id || aff.id)}>
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

              {selectedAuditeurs.length > (selectedTask.slots || 1) && (
                <div ref={errorRef} style={{ color: '#b91c1c', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, padding: '8px 12px', marginBottom: 12 }}>
                  ⚠️ Vous ne pouvez pas sélectionner plus de {selectedTask.slots || 1} auditeur(s)
                </div>
              )}

              <div className="auditeurs-selection">
                <h4>👥 Auditeurs disponibles</h4>
                <div className="auditeurs-grid">
                  {(auditeurs.length ? auditeurs : auditeursData).map((auditeur, idx) => {
                    const audId = String(auditeur.id || auditeur._id || idx)
                    const displayName = auditeur.name || `${auditeur.prenom || ''} ${auditeur.nom || ''}`.trim() || `Auditeur ${idx+1}`
                    const checked = selectedAuditeurs.includes(audId)
                    return (
                      <div key={audId} className={`auditeur-card ${checked ? "selected" : ""}`} onClick={() => toggleAuditeur(audId)}>
                        <div className="auditeur-checkbox">
                          <input type="checkbox" checked={checked} onChange={() => {}} />
                        </div>
                        <div className="auditeur-avatar">
                          <span>{displayName.split(" ").map(n => n[0]).join("")}</span>
                        </div>
                        <div className="auditeur-info">
                          <div className="auditeur-name">{displayName}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {auditeursLoading && <div className="auditeurs-loading">Chargement...</div>}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAffectModal(false)}>Annuler</button>
              <button className="btn-primary" onClick={handleManualAffect} disabled={selectedAuditeurs.length > (selectedTask.slots || 1)}>
                Envoyer pour validation ({selectedAuditeurs.length})
              </button>
            </div>
          </div>
        </>
      )}

      {showSuggestionsModal && selectedTask && (
        <>
          <div className="modal-overlay" onClick={() => setShowSuggestionsModal(false)}></div>
          <div className="affect-modal">
            <div className="modal-header">
              <h3>🧠 Suggestions automatiques (IA)</h3>
              <button className="modal-close" onClick={() => setShowSuggestionsModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="task-info-summary">
                <h4>{selectedTask.name}</h4>
                <p>L'IA a sélectionné les meilleurs auditeurs</p>
              </div>
              <div className="ai-suggestions-list">
                {aiSuggestions.map((sug, idx) => {
                  const audId = extractIdLocal(sug.auditeurId || sug.id || idx)
                  const displayName = sug.auditeurName || sug.name || `${sug.prenom || ''} ${sug.nom || ''}`.trim()
                  return (
                    <div key={audId} className="auditeur-card">
                      <div className="auditeur-avatar">
                        <span>{displayName.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div className="auditeur-info">
                        <div className="auditeur-name">{displayName}</div>
                        {sug.score && <div className="score-badge">Score: {sug.score}%</div>}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="validation-notice">
                ⚠️ Ces suggestions nécessitent votre validation
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
    </div>
  );
};

export default TasksAssignment;