// import React, { useState, useEffect } from "react";

// const specialties = [
//   "Auditeur pédagogique",
//   "Auditeur d'orientation",
//   "Auditeur de planification",
//   "Auditeur des services financiers",
// ];
// const grades = ["A", "B", "C"];
// const directions = ["RABAT_CASA", "MEKNES_ERRACHIDIA", "MARRAKECH_AGADIR"];

// const TaskForm = ({ onSubmit, initialData, onCancel, isEditing }) => {
//   const [form, setForm] = useState({
//     nom: "",
//     description: "",
//     type: "",
//     dateDebut: "",
//     dateFin: "",
//     specialitesConcernees: [],
//     gradesConcernes: [],
//     direction: "",
//     nombrePlaces: 1,
//     fichierAdministratif: null,
//     estRemuneree: false,
//     estCommune: false,
//     necessiteVehicule: false,
//     statut: "CREEE",
//   });

//   useEffect(() => {
//     if (initialData) {
//       setForm((prev) => ({
//         ...prev,
//         nom: initialData.nom || initialData.name || "",
//         description: initialData.description || "",
//         type: initialData.type || "",
//         dateDebut: initialData.dateDebut || initialData.startDate || "",
//         dateFin: initialData.dateFin || initialData.endDate || "",
//         specialitesConcernees:
//           initialData.specialitesConcernees || initialData.specialties || [],
//         gradesConcernes: initialData.gradesConcernes || initialData.grades || [],
//         direction: initialData.direction || "",
//         nombrePlaces: initialData.nombrePlaces || initialData.slots || 1,
//         fichierAdministratif: initialData.fichierAdministratif || null,
//         estRemuneree: !!initialData.estRemuneree,
//         estCommune: !!initialData.estCommune,
//         necessiteVehicule: !!initialData.necessiteVehicule,
//         statut: initialData.statut || "CREEE",
//       }));
//     }
//   }, [initialData]);

//   const handleChange = (e) => {
//     const { name, value, type, checked, files } = e.target;
//     if (type === "checkbox") {
//       setForm((prev) => {
//         // array checkbox groups
//         if (Array.isArray(prev[name])) {
//           return {
//             ...prev,
//             [name]: checked ? [...prev[name], value] : prev[name].filter((v) => v !== value),
//           };
//         }
//         // boolean checkbox
//         return { ...prev, [name]: !!checked };
//       });
//     } else if (type === "file") {
//       setForm((prev) => ({ ...prev, [name]: files[0] }));
//     } else {
//       setForm((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const payload = {
//       nom: form.nom,
//       description: form.description,
//       type: form.type,
//       dateDebut: form.dateDebut || null,
//       dateFin: form.dateFin || null,
//       estRemuneree: !!form.estRemuneree,
//       specialitesConcernees: Array.isArray(form.specialitesConcernees) ? form.specialitesConcernees : [],
//       estCommune: !!form.estCommune,
//       gradesConcernes: Array.isArray(form.gradesConcernes) ? form.gradesConcernes : [],
//       necessiteVehicule: !!form.necessiteVehicule,
//       direction: form.direction || null,
//       fichierAdministratif: form.fichierAdministratif ? form.fichierAdministratif.name : null,
//       nombrePlaces: Number(form.nombrePlaces) || 1,
//       statut: form.statut || "CREEE",
//     };
//     onSubmit(payload);
//     if (!isEditing) {
//       setForm({
//         nom: "",
//         description: "",
//         type: "",
//         dateDebut: "",
//         dateFin: "",
//         specialitesConcernees: [],
//         gradesConcernes: [],
//         direction: "",
//         nombrePlaces: 1,
//         fichierAdministratif: null,
//         estRemuneree: false,
//         estCommune: false,
//         necessiteVehicule: false,
//         statut: "CREEE",
//       });
//     }
//   };

//   return (
//     <form className="task-form" onSubmit={handleSubmit}>
//       <div className="form-header">
//         <h2>{isEditing ? "✏️ Modifier la tâche" : "➕ Créer une nouvelle tâche"}</h2>
//         {isEditing && <span className="edit-badge">Mode édition</span>}
//       </div>

//       <div className="form-section">
//         <label className="form-label">Nom de la tâche</label>
//         <input
//           name="nom"
//           placeholder="Ex: Formation audit qualité"
//           value={form.nom}
//           onChange={handleChange}
//           className="form-input"
//           required
//         />
//       </div>

//       <div className="form-section">
//         <label className="form-label">Description</label>
//         <textarea
//           name="description"
//           placeholder="Description détaillée de la tâche..."
//           value={form.description}
//           onChange={handleChange}
//           className="form-textarea"
//           rows="4"
//         />
//       </div>

//       <div className="form-row">
//         <div className="form-section">
//           <label className="form-label">Type de tâche</label>
//           <select name="type" value={form.type} onChange={handleChange} className="form-select" required>
//             <option value="">Sélectionner</option>
//             <option value="Formation">Formation</option>
//             <option value="Orientation">Orientation</option>
//             <option value="Planification">Planification</option>
//           </select>
//         </div>
//         <div className="form-section">
//           <label className="form-label">Période d'exécution</label>
//           <div className="date-inputs">
//             <input type="date" name="dateDebut" value={form.dateDebut} onChange={handleChange} className="form-input" required />
//             <span className="date-separator">→</span>
//             <input type="date" name="dateFin" value={form.dateFin} onChange={handleChange} className="form-input" required />
//           </div>
//         </div>
//       </div>

//       <div className="form-row">
//         <div className="form-section">
//           <label className="form-label">Spécialité(s) concernée(s)</label>
//           <div className="checkbox-group">
//             {specialties.map((s) => (
//               <label key={s} className="checkbox-label">
//                 <input type="checkbox" name="specialitesConcernees" value={s} checked={form.specialitesConcernees.includes(s)} onChange={handleChange} className="checkbox-input" />
//                 <span>{s}</span>
//               </label>
//             ))}
//           </div>
//         </div>
//         <div className="form-section">
//           <label className="form-label">Grade(s) concerné(s)</label>
//           <div className="checkbox-group">
//             {grades.map((g) => (
//               <label key={g} className="checkbox-label">
//                 <input type="checkbox" name="gradesConcernes" value={g} checked={form.gradesConcernes.includes(g)} onChange={handleChange} className="checkbox-input" />
//                 <span>Grade {g}</span>
//               </label>
//             ))}
//           </div>
//         </div>
//         <div className="form-section">
//           <label className="form-label">Options</label>
//           <div className="checkbox-group">
//             <label className="checkbox-label">
//               <input type="checkbox" name="estRemuneree" checked={!!form.estRemuneree} onChange={handleChange} className="checkbox-input" />
//               <span>Est rémunérée</span>
//             </label>
//             <label className="checkbox-label">
//               <input type="checkbox" name="estCommune" checked={!!form.estCommune} onChange={handleChange} className="checkbox-input" />
//               <span>Est commune</span>
//             </label>
//             <label className="checkbox-label">
//               <input type="checkbox" name="necessiteVehicule" checked={!!form.necessiteVehicule} onChange={handleChange} className="checkbox-input" />
//               <span>Nécessite véhicule</span>
//             </label>
//           </div>
//         </div>
//       </div>

//       <div className="form-row">
//         <div className="form-section">
//           <label className="form-label">Statut</label>
//           <select name="statut" value={form.statut} onChange={handleChange} className="form-select">
//             <option value="CREEE">CREEE</option>
//             <option value="EN_ATTENTE_AFFECTATION">EN_ATTENTE_AFFECTATION</option>
//             <option value="AFFECTEE">AFFECTEE</option>
//             <option value="EN_COURS">EN_COURS</option>
//             <option value="TERMINEE">TERMINEE</option>
//             <option value="ANNULEE">ANNULEE</option>
//           </select>
//         </div>
//       </div>

//       <div className="form-row">
//         <div className="form-section">
//           <label className="form-label">Direction/Ligne</label>
//           <select name="direction" value={form.direction} onChange={handleChange} className="form-select">
//             <option value="">Sélectionner</option>
//             {directions.map((d) => (
//               <option key={d} value={d}>{d}</option>
//             ))}
//           </select>
//         </div>
//         <div className="form-section">
//           <label className="form-label">Fichier administratif (PDF)</label>
//           <input type="file" name="fichierAdministratif" accept="application/pdf" onChange={handleChange} className="form-file-input" />
//         </div>
//         <div className="form-section">
//           <label className="form-label">Nombre de places</label>
//           <input type="number" name="nombrePlaces" min={1} value={form.nombrePlaces} onChange={handleChange} className="form-input" required />
//         </div>
//       </div>

//       <div className="form-actions">
//         <button type="button" className="btn-cancel" onClick={onCancel || (() => setForm({
//           nom: "",
//           description: "",
//           type: "",
//           dateDebut: "",
//           dateFin: "",
//           specialitesConcernees: [],
//           gradesConcernes: [],
//           direction: "",
//           nombrePlaces: 1,
//           fichierAdministratif: null,
//           estRemuneree: false,
//           estCommune: false,
//           necessiteVehicule: false,
//           statut: "CREEE",
//         }))}>
//           Annuler
//         </button>
//         <button type="submit" className="btn-primary btn-submit">{isEditing ? "💾 Enregistrer les modifications" : "➕ Créer la tâche"}</button>
//       </div>
//     </form>
//   );
// };

// export default TaskForm;
//               <span>Est rémunérée</span>
//             </label>
//             <label className="checkbox-label">
//               <input type="checkbox" name="isCommon" checked={!!form.isCommon} onChange={handleChange} className="checkbox-input" />
//               <span>Est commune</span>
//             </label>
//             <label className="checkbox-label">
//               <input type="checkbox" name="needVehicle" checked={!!form.needVehicle} onChange={handleChange} className="checkbox-input" />
//               <span>Nécessite véhicule</span>
//             </label>
//           </div>
//         </div>
//       </div>

//       <div className="form-row">
//         <div className="form-section">
//           <label className="form-label">Statut</label>
//           <select name="statut" value={form.statut} onChange={handleChange} className="form-select">
//             <option value="CREEE">CREEE</option>
//             <option value="EN_ATTENTE_AFFECTATION">EN_ATTENTE_AFFECTATION</option>
//             <option value="AFFECTEE">AFFECTEE</option>
//             <option value="EN_COURS">EN_COURS</option>
//             <option value="TERMINEE">TERMINEE</option>
//             <option value="ANNULEE">ANNULEE</option>
//           </select>
//         </div>
//       </div>

//       <div className="form-row">
//         <div className="form-section">
//           <label className="form-label">Direction/Ligne</label>
//           <select name="direction" value={form.direction} onChange={handleChange} className="form-select">
//             <option value="">Sélectionner</option>
//             {directions.map((d) => (
//               <option key={d} value={d}>{d}</option>
//             ))}
//           </select>
//         </div>
//         <div className="form-section">
//           <label className="form-label">Fichier administratif (PDF)</label>
//           <input 
//             type="file" 
//             name="file" 
//             accept="application/pdf" 
//             onChange={handleChange}
//             className="form-file-input"
//           />
//         </div>
//         <div className="form-section">
//             name="fichierAdministratif" 
//           <input 
//             type="number" 
//             name="slots" 
//             min={1} 
//             value={form.slots} 
//             onChange={handleChange}
//             className="form-input"
//             required
//             type="number" 
//             name="nombrePlaces" 
//       </div>
//             value={form.nombrePlaces} 
//       <div className="form-actions">
//         <button 
//           type="button" 
//           className="btn-cancel" 
//           onClick={onCancel || (() => setForm({
//             name: "",
//             description: "",
//             type: "",
//             startDate: "",
//             endDate: "",
//             specialties: [],
//             grades: [],
//             options: [],
//             direction: "",
//             slots: 1,
//             file: null,
//           }))}
//         >
//           Annuler
//         </button>
//         <button type="submit" className="btn-primary btn-submit">
//           {isEditing ? "💾 Enregistrer les modifications" : "➕ Créer la tâche"}
//         </button>
//       </div>
//     </form>
//   );
// };

// export default TaskForm;



























import React, { useState, useEffect } from "react";

const specialties = [
  "Auditeur pédagogique",
  "Auditeur d'orientation",
  "Auditeur de planification",
  "Auditeur des services financiers",
];
const grades = ["A", "B", "C"];
const directions = ["RABAT_CASA", "MEKNES_ERRACHIDIA", "MARRAKECH_AGADIR"];

const TaskForm = ({ onSubmit, initialData, onCancel, isEditing }) => {
  const [form, setForm] = useState({
    nom: "",
    description: "",
    type: "",
    dateDebut: "",
    dateFin: "",
    specialitesConcernees: [],
    gradesConcernes: [],
    direction: "",
    nombrePlaces: 1,
    fichierAdministratif: null,
    estRemuneree: false,
    estCommune: false,
    necessiteVehicule: false,
    statut: "CREEE",
  });

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...prev,
        nom: initialData.nom || initialData.name || "",
        description: initialData.description || "",
        type: initialData.type || "",
        dateDebut: initialData.dateDebut || initialData.startDate || "",
        dateFin: initialData.dateFin || initialData.endDate || "",
        specialitesConcernees:
          initialData.specialitesConcernees || initialData.specialties || [],
        gradesConcernes: initialData.gradesConcernes || initialData.grades || [],
        direction: initialData.direction || "",
        nombrePlaces: initialData.nombrePlaces || initialData.slots || 1,
        fichierAdministratif: initialData.fichierAdministratif || null,
        estRemuneree: !!initialData.estRemuneree,
        estCommune: !!initialData.estCommune,
        necessiteVehicule: !!initialData.necessiteVehicule,
        statut: initialData.statut || "CREEE",
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm((prev) => {
        // array checkbox groups
        if (Array.isArray(prev[name])) {
          return {
            ...prev,
            [name]: checked ? [...prev[name], value] : prev[name].filter((v) => v !== value),
          };
        }
        // boolean checkbox
        return { ...prev, [name]: !!checked };
      });
    } else if (type === "file") {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      nom: form.nom,
      description: form.description,
      type: form.type,
      dateDebut: form.dateDebut || null,
      dateFin: form.dateFin || null,
      estRemuneree: !!form.estRemuneree,
      specialitesConcernees: Array.isArray(form.specialitesConcernees) ? form.specialitesConcernees : [],
      estCommune: !!form.estCommune,
      gradesConcernes: Array.isArray(form.gradesConcernes) ? form.gradesConcernes : [],
      necessiteVehicule: !!form.necessiteVehicule,
      direction: form.direction || null,
      fichierAdministratif: form.fichierAdministratif ? form.fichierAdministratif.name : null,
      nombrePlaces: Number(form.nombrePlaces) || 1,
      statut: form.statut || "CREEE",
    };
    onSubmit(payload);
    if (!isEditing) {
      setForm({
        nom: "",
        description: "",
        type: "",
        dateDebut: "",
        dateFin: "",
        specialitesConcernees: [],
        gradesConcernes: [],
        direction: "",
        nombrePlaces: 1,
        fichierAdministratif: null,
        estRemuneree: false,
        estCommune: false,
        necessiteVehicule: false,
        statut: "CREEE",
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
          name="nom"
          placeholder="Ex: Formation audit qualité"
          value={form.nom}
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
            <option value="services_financiers">services_financiers</option>
            <option value="Pédagogique">Pédagogique</option>
            <option value="Orientation">Orientation</option>
            <option value="Planification">Planification</option>
          </select>
        </div>
        <div className="form-section">
          <label className="form-label">Période d'exécution</label>
          <div className="date-inputs">
            <input type="date" name="dateDebut" value={form.dateDebut} onChange={handleChange} className="form-input" required />
            <span className="date-separator">→</span>
            <input type="date" name="dateFin" value={form.dateFin} onChange={handleChange} className="form-input" required />
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-section">
          <label className="form-label">Spécialité(s) concernée(s)</label>
          <div className="checkbox-group">
            {specialties.map((s) => (
              <label key={s} className="checkbox-label">
                <input type="checkbox" name="specialitesConcernees" value={s} checked={form.specialitesConcernees.includes(s)} onChange={handleChange} className="checkbox-input" />
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
                <input type="checkbox" name="gradesConcernes" value={g} checked={form.gradesConcernes.includes(g)} onChange={handleChange} className="checkbox-input" />
                <span>Grade {g}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="form-section">
          <label className="form-label">Options</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input type="checkbox" name="estRemuneree" checked={!!form.estRemuneree} onChange={handleChange} className="checkbox-input" />
              <span>Est rémunérée</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" name="estCommune" checked={!!form.estCommune} onChange={handleChange} className="checkbox-input" />
              <span>Est commune</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" name="necessiteVehicule" checked={!!form.necessiteVehicule} onChange={handleChange} className="checkbox-input" />
              <span>Nécessite véhicule</span>
            </label>
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-section">
          <label className="form-label">Statut</label>
          <select name="statut" value={form.statut} onChange={handleChange} className="form-select">
            <option value="CREEE">CREEE</option>
            <option value="EN_ATTENTE_AFFECTATION">EN_ATTENTE_AFFECTATION</option>
            <option value="AFFECTEE">AFFECTEE</option>
            <option value="EN_COURS">EN_COURS</option>
            <option value="TERMINEE">TERMINEE</option>
            <option value="ANNULEE">ANNULEE</option>
          </select>
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
          <input type="file" name="fichierAdministratif" accept="application/pdf" onChange={handleChange} className="form-file-input" />
        </div>
        <div className="form-section">
          <label className="form-label">Nombre de places</label>
          <input type="number" name="nombrePlaces" min={1} value={form.nombrePlaces} onChange={handleChange} className="form-input" required />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel || (() => setForm({
          nom: "",
          description: "",
          type: "",
          dateDebut: "",
          dateFin: "",
          specialitesConcernees: [],
          gradesConcernes: [],
          direction: "",
          nombrePlaces: 1,
          fichierAdministratif: null,
          estRemuneree: false,
          estCommune: false,
          necessiteVehicule: false,
          statut: "CREEE",
        }))}>
          Annuler
        </button>
        <button type="submit" className="btn-primary btn-submit">{isEditing ? "💾 Enregistrer les modifications" : "➕ Créer la tâche"}</button>
      </div>
    </form>
  );
};

export default TaskForm;