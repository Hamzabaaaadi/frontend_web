import React, { useState, useEffect } from "react";

const specialties = [
  "Auditeur pédagogique",
  "Auditeur d'orientation",
  "Auditeur de planification",
  "Auditeur des services financiers"
];
const grades = ["A", "B", "C"];
const options = ["Nouveaux", "N'ayant un véhicule"];
const directions = ["Direction 1", "Direction 2", "Direction 3"];

const TaskForm = ({ onSubmit, initialData, onCancel, isEditing }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "",
    startDate: "",
    endDate: "",
    specialties: [],
    grades: [],
    options: [],
    direction: "",
    slots: 1,
    file: null,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        type: initialData.type || "",
        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
        specialties: initialData.specialties || [],
        grades: initialData.grades || [],
        options: initialData.options || [],
        direction: initialData.direction || "",
        slots: initialData.slots || 1,
        file: initialData.file || null,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: checked
          ? [...prev[name], value]
          : prev[name].filter((v) => v !== value),
      }));
    } else if (type === "file") {
      setForm((prev) => ({ ...prev, file: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    if (!isEditing) {
      setForm({
        name: "",
        description: "",
        type: "",
        startDate: "",
        endDate: "",
        specialties: [],
        grades: [],
        options: [],
        direction: "",
        slots: 1,
        file: null,
      });
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>{isEditing ? "✏️ Modifier la tâche" : "➕ Créer une nouvelle tâche"}</h2>
        {isEditing && <span className="edit-badge">Mode édition</span>}
      </div>
      
      <div className="form-section">
        <label className="form-label">Nom de la tâche</label>
        <input 
          name="name" 
          placeholder="Ex: Formation audit qualité" 
          value={form.name} 
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-section">
        <label className="form-label">Description</label>
        <textarea 
          name="description" 
          placeholder="Description détaillée de la tâche..." 
          value={form.description} 
          onChange={handleChange}
          className="form-textarea"
          rows="4"
        />
      </div>

      <div className="form-row">
        <div className="form-section">
          <label className="form-label">Type de tâche</label>
          <select name="type" value={form.type} onChange={handleChange} className="form-select" required>
            <option value="">Sélectionner</option>
            <option value="Formation">Formation</option>
            <option value="Orientation">Orientation</option>
            <option value="Planification">Planification</option>
          </select>
        </div>
        <div className="form-section">
          <label className="form-label">Période d'exécution</label>
          <div className="date-inputs">
            <input 
              type="date" 
              name="startDate" 
              value={form.startDate} 
              onChange={handleChange}
              className="form-input"
              required
            />
            <span className="date-separator">→</span>
            <input 
              type="date" 
              name="endDate" 
              value={form.endDate} 
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-section">
          <label className="form-label">Spécialité(s) concernée(s)</label>
          <div className="checkbox-group">
            {specialties.map((s) => (
              <label key={s} className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="specialties" 
                  value={s} 
                  checked={form.specialties.includes(s)} 
                  onChange={handleChange}
                  className="checkbox-input"
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="form-section">
          <label className="form-label">Grade(s) concerné(s)</label>
          <div className="checkbox-group">
            {grades.map((g) => (
              <label key={g} className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="grades" 
                  value={g} 
                  checked={form.grades.includes(g)} 
                  onChange={handleChange}
                  className="checkbox-input"
                />
                <span>Grade {g}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="form-section">
          <label className="form-label">Autres options</label>
          <div className="checkbox-group">
            {options.map((o) => (
              <label key={o} className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="options" 
                  value={o} 
                  checked={form.options.includes(o)} 
                  onChange={handleChange}
                  className="checkbox-input"
                />
                <span>{o}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-section">
          <label className="form-label">Direction/Ligne</label>
          <select name="direction" value={form.direction} onChange={handleChange} className="form-select">
            <option value="">Sélectionner</option>
            {directions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="form-section">
          <label className="form-label">Fichier administratif (PDF)</label>
          <input 
            type="file" 
            name="file" 
            accept="application/pdf" 
            onChange={handleChange}
            className="form-file-input"
          />
        </div>
        <div className="form-section">
          <label className="form-label">Nombre de places</label>
          <input 
            type="number" 
            name="slots" 
            min={1} 
            value={form.slots} 
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          className="btn-cancel" 
          onClick={onCancel || (() => setForm({
            name: "",
            description: "",
            type: "",
            startDate: "",
            endDate: "",
            specialties: [],
            grades: [],
            options: [],
            direction: "",
            slots: 1,
            file: null,
          }))}
        >
          Annuler
        </button>
        <button type="submit" className="btn-primary btn-submit">
          {isEditing ? "💾 Enregistrer les modifications" : "➕ Créer la tâche"}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
