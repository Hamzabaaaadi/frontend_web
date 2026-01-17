import React, { useEffect, useState } from "react";
import {
  getAllAffectations,
  deleteAffectation,
  validateAffectationStatus,
  rejectAffectationStatus
} from "../../services/affectationService";
import { getTaskById } from "../../services/tacheService";
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
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette affectation ?")) return;
    await deleteAffectation(id);
    setAffectations(prev => prev.filter(aff => aff._id !== id));
  };

  const handleValidate = async (id) => {
    await validateAffectationStatus(id);
    setAffectations(prev =>
      prev.map(aff =>
        aff._id === id ? { ...aff, estValidee: true } : aff
      )
    );
    setSuccessMsg("Affectation validée avec succès !");
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const handleReject = async (id) => {
    await rejectAffectationStatus(id);
    setAffectations(prev =>
      prev.map(aff =>
        aff._id === id ? { ...aff, estValidee: false } : aff
      )
    );
    setRejectMsg("Affectation refusée avec succès !");
    setTimeout(() => setRejectMsg(""), 2000);
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
                  {/* <button className="btn-edit" style={{margin:0, padding:'7px 0', fontWeight:'bold', background:'#f59e42', color:'#fff', border:'none', borderRadius:5, cursor:'pointer'}} >Modifier</button> */}
                  <button className="btn-delete" style={{margin:0, padding:'7px 0', fontWeight:'bold', background:'#374151', color:'#fff', border:'none', borderRadius:5, cursor:'pointer'}} onClick={() => handleDelete(aff._id)}>Supprimer</button>
                  <button className="btn-details" style={{margin:0, padding:'7px 0', fontWeight:'bold', background:'#2563eb', color:'#fff', border:'none', borderRadius:5, cursor:'pointer'}} onClick={() => handleShowTaskDetails(aff)}>Détails tâche</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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