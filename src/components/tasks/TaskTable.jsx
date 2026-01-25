import React from "react";

const TaskTable = ({
  tasks,
  onAffect,
  onEdit,
  onDelete,
  onModeChange,
  onDiscussion,
}) => (
  <div className="task-table-container">
    {tasks.length === 0 ? (
      <div className="empty-tasks-state">
        <span className="empty-icon">📭</span>
        <p>Aucune tâche créée pour le moment</p>
        <span className="empty-hint">
          Cliquez sur "Créer une nouvelle tâche" pour commencer
        </span>
      </div>
    ) : (
      <table className="tasks-table">
        <thead>
          <tr>
            <th>Tâche</th>
            <th>Type</th>
            <th>Statut</th>
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
                    <small className="task-description-hint">
                      {task.description}
                    </small>
                  )}
                </div>
              </td>

              <td>
                <span className="task-type-badge">{task.type}</span>
              </td>

              <td>
                <span
                  className={`status-badge status-${String(
                    task.statut || task.status || ""
                  ).toLowerCase()}`}
                >
                  {task.statut || task.status || "N/A"}
                </span>
              </td>

              <td>
                <span className="slots-badge">
                  {task.slots} place(s)
                </span>
              </td>

              <td>
                <select
                  value={task.mode || "Manuel"}
                  className="mode-select"
                  onChange={(e) =>
                    onModeChange && onModeChange(task, e.target.value)
                  }
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

                 
                    <button
                      className="btn-table btn-discussion"
                      onClick={() => onDiscussion && onDiscussion(task)}
                      title="Discussion"
                    >
                      💬 Discussion
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
