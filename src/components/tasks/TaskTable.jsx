import React from "react";

const TaskTable = ({ tasks, onAffect, onEdit, onDelete }) => (
  <div className="task-table-container">
    {tasks.length === 0 ? (
      <div className="empty-tasks-state">
        <span className="empty-icon">📭</span>
        <p>Aucune tâche créée pour le moment</p>
        <span className="empty-hint">Cliquez sur "Créer une nouvelle tâche" pour commencer</span>
      </div>
    ) : (
      <table className="tasks-table">
        <thead>
          <tr>
            <th>Tâche</th>
            <th>Type</th>
            <th>Spécialité</th>
            <th>Places</th>
            <th>Mode d'affectation</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task._id || task.id}>
              <td>
                <div className="task-name-cell">
                  <strong>{task.name}</strong>
                  {task.description && (
                    <small className="task-description-hint">{task.description}</small>
                  )}
                </div>
              </td>
              <td>
                <span className="task-type-badge">{task.type}</span>
              </td>
              <td>{task.specialty || (task.specialties && task.specialties.join(", "))}</td>
              <td>
                <span className="slots-badge">{task.slots} place(s)</span>
              </td>
              <td>
                <select 
                  defaultValue={task.mode || "Manuel"}
                  className="mode-select"
                >
                  <option>Manuel</option>
                  <option>Semi-automatisée</option>
                  <option>Automatisé (IA)</option>
                </select>
              </td>
              <td>
                <div className="table-actions">
                  <button 
                    className="btn-table btn-affect" 
                    onClick={() => onAffect(task)}
                    title="Affecter"
                  >
                    👥 Affecter
                  </button>
                  <button 
                    className="btn-table btn-edit" 
                    onClick={() => onEdit(task)}
                    title="Modifier"
                  >
                    ✏️ Modifier
                  </button>
                  <button 
                    className="btn-table btn-delete" 
                    onClick={() => onDelete(task)}
                    title="Supprimer"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

export default TaskTable;
