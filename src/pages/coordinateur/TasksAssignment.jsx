import React, { useState } from "react";
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
  const [loading, setLoading] = useState(true)

  // Load tasks and auditeurs on mount
  useState(() => { /* keep linter happy if no deps */ })
  React.useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const tResp = await coordSvc.getTasks()
        const list = Array.isArray(tResp) ? tResp : (tResp && Array.isArray(tResp.taches) ? tResp.taches : [])
        if (mounted) setTasks(list)
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
          setTasks(list)
          setEditingTask(null)
          alert('Tâche modifiée avec succès !')
        } else {
          const payload = { ...task, mode: activeTab === 0 ? 'Manuel' : activeTab === 1 ? 'Semi-automatisée' : 'Automatisé (IA)' }
          await coordSvc.createTask(payload)
          const tResp = await coordSvc.getTasks()
          const list = Array.isArray(tResp) ? tResp : (tResp && Array.isArray(tResp.taches) ? tResp.taches : [])
          setTasks(list)
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

  const generateAutoSuggestions = (task) => {
    const pool = (auditeurs && auditeurs.length) ? auditeurs : auditeursData
    const compatibleAuditeurs = pool.filter(auditeur => {
      const specialtyMatch = task.specialties.some(s => auditeur.specialty.includes(s.split(' ')[1]));
      const gradeMatch = task.grades.includes(auditeur.grade);
      return specialtyMatch || gradeMatch;
    });

    return compatibleAuditeurs.map(auditeur => ({
      auditeurId: auditeur.id,
      auditeurName: auditeur.name,
      score: Math.floor(Math.random() * 20) + 80,
      specialty: auditeur.specialty,
      grade: auditeur.grade,
    })).sort((a, b) => b.score - a.score).slice(0, task.slots);
  };

  const handleAffect = (task) => {
    (async () => {
      setSelectedTask(task);
      setSelectedAuditeurs([]);
      // fetch auditeurs list from backend (falls back to previous local data)
      try {
        const aResp = await coordSvc.getAuditeurs()
        const alist = Array.isArray(aResp) ? aResp : (aResp && Array.isArray(aResp.users) ? aResp.users : [])
        setAuditeurs(alist)
      } catch (e) { console.warn('handleAffect getAuditeurs failed', e.message) }

      if (task.mode === "Automatisé (IA)") {
        const suggestions = generateAutoSuggestions(task);
        setAiSuggestions(suggestions);
        setShowSuggestionsModal(true);
      } else if (task.mode === "Semi-automatisée") {
        const suggestions = generateAutoSuggestions(task);
        setAiSuggestions(suggestions);
        setShowAffectModal(true);
      } else {
        setAiSuggestions([]);
        setShowAffectModal(true);
      }
    })()
  };

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
        ? { ...t, affectations: [...t.affectations, ...newAffectations] }
        : t
    ));

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
        for (const audId of selectedAuditeurs) {
          await coordSvc.assignTask(tid, audId, selectedTask.mode)
        }
        const tResp = await coordSvc.getTasks()
        const list = Array.isArray(tResp) ? tResp : (tResp && Array.isArray(tResp.taches) ? tResp.taches : [])
        setTasks(list)
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
        setTasks(list)
        alert('Affectation validée par le coordinateur !')
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
        const list = Array.isArray(tResp) ? tResp : (tResp && Array.isArray(tResp.taches) ? tResp.taches : [])
        setTasks(list)
        alert('Affectation rejetée !')
      } catch (err) {
        console.error('rejectAffectation error', err)
        alert('Erreur lors du rejet')
      }
    })()
  };

  const toggleAuditeur = (id) => {
    setSelectedAuditeurs(prev =>
      prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
    );
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (task) => {
    (async () => {
      if (!window.confirm(`Voulez-vous vraiment supprimer la tâche "${task.name}" ?`)) return
      try {
        const id = task._id || task.id || task
        await coordSvc.deleteTask(id)
        const tResp = await coordSvc.getTasks()
        const list = Array.isArray(tResp) ? tResp : (tResp && Array.isArray(tResp.taches) ? tResp.taches : [])
        setTasks(list)
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
        tabs={["🖐️ Affectation manuelle", "🤖 Semi-automatisé", "🧠 Automatisé (IA)"]}
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
                    {aiSuggestions.map(sug => (
                      <div
                        key={sug.auditeurId}
                        className={`suggestion-card ${selectedAuditeurs.includes(sug.auditeurId) ? "selected" : ""}`}
                        onClick={() => toggleAuditeur(sug.auditeurId)}
                      >
                        <div className="suggestion-score">{sug.score}%</div>
                        <div className="suggestion-info">
                          <div className="suggestion-name">{sug.auditeurName}</div>
                          <div className="suggestion-details">{sug.specialty} • Grade {sug.grade}</div>
                        </div>
                        <div className="ai-recommendation">Recommandé par IA</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="auditeurs-selection">
                <h4>👥 Tous les auditeurs disponibles</h4>
                <div className="auditeurs-grid">
                  {(auditeurs && auditeurs.length ? auditeurs : auditeursData).map(auditeur => (
                    <div
                      key={auditeur.id}
                      className={`auditeur-card ${selectedAuditeurs.includes(auditeur.id) ? "selected" : ""}`}
                      onClick={() => toggleAuditeur(auditeur.id)}
                    >
                      <div className="auditeur-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedAuditeurs.includes(auditeur.id)}
                          onChange={() => {}}
                          className="checkbox-input"
                        />
                      </div>
                      <div className="auditeur-avatar">
                        <span>{((auditeur.name || '').toString().split(" ").map(n => n[0]).join(""))}</span>
                      </div>
                      <div className="auditeur-info">
                        <div className="auditeur-name">{auditeur.name}</div>
                        <div className="auditeur-details">{auditeur.specialty} • Grade {auditeur.grade}</div>
                      </div>
                    </div>
                  ))}
                </div>
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
    </div>
  );
};

export default TasksAssignment;