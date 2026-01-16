import React, { useEffect, useState } from "react";
import { getAllAffectations, deleteAffectation, validateAffectationStatus, rejectAffectationStatus } from "../../services/affectationService";
import "../../styles/affectation.css";

const Affectation = () => {
  const [affectations, setAffectations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [rejectMsg, setRejectMsg] = useState("");

  useEffect(() => {
    getAllAffectations()
      .then((data) => {
        setAffectations(data.affectations || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Erreur lors du chargement des affectations.");
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette affectation ?")) {
      await deleteAffectation(id);
      setAffectations((prev) => prev.filter((aff) => aff._id !== id));
    }
  };

  const handleValidate = async (id) => {
    await validateAffectationStatus(id);
    setAffectations((prev) => prev.map((aff) => aff._id === id ? { ...aff, statut: "VALIDEE" } : aff));
    setSuccessMsg("Affectation validée avec succès !");
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const handleReject = async (id) => {
    await rejectAffectationStatus(id);
    setAffectations((prev) => prev.map((aff) => aff._id === id ? { ...aff, statut: "REFUSEE" } : aff));
    setRejectMsg("Affectation refusée avec succès !");
    setTimeout(() => setRejectMsg(""), 2000);
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!Array.isArray(affectations)) return <div>Aucune affectation trouvée.</div>;

  return (
    <div className="affectation-page">
      {successMsg && <div className="success-message">{successMsg}</div>}
      {rejectMsg && <div className="reject-message">{rejectMsg}</div>}
      <h2>Liste des Affectations</h2>
      <table className="affectation-table">
        <thead>
          <tr>
            <th>Nom de la tâche</th>
            <th>Nom Auditeur</th>
            <th>Date Affectation</th>
            <th>Statut Affectation</th>
            <th>Mode</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {affectations.map((aff, idx) => (
            <tr key={aff._id || idx}>
              <td>{aff.tacheId?.nom || "-"}</td>
              <td>{typeof aff.auditeurId === "object" && aff.auditeurId !== null ? `${aff.auditeurId.nom || ""} ${aff.auditeurId.prenom || ""}` : (aff.auditeurId || "-")}</td>
              <td>
                {aff.dateAffectation
                  ? new Date(aff.dateAffectation).toLocaleString()
                  : "-"}
              </td>
              <td>{aff.statut || "-"}</td>
              <td>{aff.mode || "-"}</td>
              <td>
                <button className="btn-accept" onClick={() => handleValidate(aff._id)}>Accepter</button>
                <button className="btn-refuse" onClick={() => handleReject(aff._id)}>Refuser</button>
                <button className="btn-edit">Modifier</button>
                <button className="btn-delete" onClick={() => handleDelete(aff._id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Affectation;
