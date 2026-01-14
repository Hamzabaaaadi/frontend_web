import React, { useEffect, useState } from 'react';
import * as svc from '../../services/superAdminService';
import { getAuditeurs } from '../../services/userService';
import Modal from '../../components/common/Modal';
import './dashboard.css'

export default function VehiclesManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editVeh, setEditVeh] = useState(null);
  const [form, setForm] = useState({
    immatriculation: '',
    marque: '',
    modele: '',
    direction: null,
    estDisponible: true,
    typeAttribution: null,
    auditeurAttribue: null,
    dateDebut: null,
    dateFin: null,
  });
  const [auditeurs, setAuditeurs] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      console.log('Fetching vehicles...');
      const response = await svc.listVehicles();
      console.log('Vehicles fetched:', response);
      // accept multiple response shapes:
      // - array directly
      // - { vehicles: [...] }
      // - { vehicules: [...] } (API in French)
      let list = [];
      if (Array.isArray(response)) list = response;
      else if (response && Array.isArray(response.vehicles)) list = response.vehicles;
      else if (response && Array.isArray(response.vehicules)) list = response.vehicules;
      else {
        console.error('Invalid response format:', response);
      }
      setVehicles(list);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await getAuditeurs();
        if (!mounted) return;
        setAuditeurs(list || []);
      } catch (err) {
        console.error('Erreur getAuditeurs:', err);
        setAuditeurs([]);
      }
    })();
    return () => { mounted = false };
  }, []);

  const getAuditeurName = (id) => {
    if (!id) return '-';
    const found = auditeurs.find((a) => a.id === id);
    return found ? found.name : id;
  };

  const openCreate = () => {
    setEditVeh(null);
    setForm({
      immatriculation: '',
      marque: '',
      modele: '',
      direction: null,
      estDisponible: true,
      typeAttribution: null,
      auditeurAttribue: null,
      dateDebut: null,
      dateFin: null,
    });
    setModalOpen(true);
  };

  const openEdit = (v) => {
    setEditVeh(v);
    setForm({
      immatriculation: v.immatriculation || '',
      marque: v.marque || '',
      modele: v.modele || '',
      direction: v.direction || '',
      estDisponible: !!v.estDisponible,
      typeAttribution: v.typeAttribution || 'INDIVIDUELLE',
      auditeurAttribue: v.auditeurAttribue || '',
      dateDebut: v.dateDebut || '',
      dateFin: v.dateFin || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      dateDebut: form.dateDebut || null,
      dateFin: form.dateFin || null,
      // ensure backend enum fields are never null
      direction: form.direction || 'RABAT_CASA',
      typeAttribution: form.typeAttribution || 'INDIVIDUELLE',
      // avoid sending empty string for ObjectId fields
      auditeurAttribue: form.auditeurAttribue || null,
    };
    try {
      if (editVeh) {
        const id = editVeh._id || editVeh.id;
        await svc.updateVehicle(id, payload);
      } else {
        await svc.createVehicle(payload);
      }
      setModalOpen(false);
      await loadVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
    }
  };

  const handleDelete = async (id) => {
    // open confirmation modal instead of native confirm
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteVehicle = async () => {
    const id = deleteTargetId;
    setDeleteConfirmOpen(false);
    setDeleteTargetId(null);
    try {
      await svc.deleteVehicle(id);
      await loadVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  return (
    <div className="sa-dashboard">
      <div className="sa-header">
        <div>
          <h1 className="sa-title">Parc automobile</h1>
          <div className="sa-sub">Gérer les véhicules de la plateforme.</div>
        </div>
        <div>
          <button onClick={openCreate} className="btn btn-primary">Ajouter véhicule</button>
        </div>
      </div>

      {loading ? (
        <div>Chargement…</div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {vehicles.map((v) => (
            <div key={v._id || v.id} className="sa-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800 }}>
                  {v.immatriculation} — {v.marque} {v.modele}
                </div>
                <div style={{ color: '#6b7280' }}>
                  •  •  • {v.estDisponible ? 'Disponible' : 'Indisponible'}
                </div>
                <div style={{ color: '#475569', marginTop: 6 }}>
                  Direction: {v.direction || '-'} • Type: {v.typeAttribution || '-'}
                </div>
                <div style={{ color: '#475569', marginTop: 6 }}>
                  Attribué à: {getAuditeurName(v.auditeurAttribue)}
                </div>
                <div style={{ color: '#475569', marginTop: 6 }}>
                  Période: {v.dateDebut || '-'} → {v.dateFin || '-'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(v)} className="btn btn-ghost btn-sm">Éditer</button>
                <button onClick={() => handleDelete(v._id)} className="btn btn-danger btn-sm">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        title={editVeh ? 'Modifier véhicule' : 'Ajouter véhicule'}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleSave}
        confirmText={editVeh ? 'Enregistrer' : 'Ajouter'}
      >
        <div style={{ display: 'grid', gap: 8 }}>
          <input
            placeholder="Immatriculation"
            value={form.immatriculation}
            onChange={(e) => setForm({ ...form, immatriculation: e.target.value })}
          />
          <input
            placeholder="Marque"
            value={form.marque}
            onChange={(e) => setForm({ ...form, marque: e.target.value })}
          />
          <input
            placeholder="Modèle"
            value={form.modele}
            onChange={(e) => setForm({ ...form, modele: e.target.value })}
          />
          {editVeh && (
            <>
              <input
                placeholder="Direction"
                value={form.direction || ''}
                onChange={(e) =>
                  setForm({ ...form, direction: e.target.value || null })
                }
              />
              <select
                value={form.typeAttribution || ''}
                onChange={(e) =>
                  setForm({ ...form, typeAttribution: e.target.value || null })
                }
              >
                <option value="">-- Type d'attribution --</option>
                <option value="TEMPORAIRE">TEMPORAIRE</option>
                <option value="PERMANENT">PERMANENT</option>
              </select>
              <label style={{ display: 'flex', flexDirection: 'column' }}>
                Auditeur attribué
                <select
                  value={form.auditeurAttribue || ''}
                  onChange={(e) =>
                    setForm({ ...form, auditeurAttribue: e.target.value || null })
                  }
                >
                  <option value="">-- Choisir un auditeur --</option>
                  {auditeurs.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <label style={{ display: 'flex', flexDirection: 'column' }}>
                  Date début
                  <input
                    type="date"
                    value={form.dateDebut || ''}
                    onChange={(e) =>
                      setForm({ ...form, dateDebut: e.target.value || null })
                    }
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column' }}>
                  Date fin
                  <input
                    type="date"
                    value={form.dateFin || ''}
                    onChange={(e) =>
                      setForm({ ...form, dateFin: e.target.value || null })
                    }
                  />
                </label>
              </div>
            </>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={!!form.estDisponible}
              onChange={(e) =>
                setForm({ ...form, estDisponible: e.target.checked })
              }
            />{' '}
            Disponible
          </label>
        </div>
      </Modal>

      <Modal
        isOpen={deleteConfirmOpen}
        title="Confirmer la suppression"
        onCancel={() => { setDeleteConfirmOpen(false); setDeleteTargetId(null); }}
        onConfirm={confirmDeleteVehicle}
        confirmText="Supprimer"
      >
        <div>Voulez-vous vraiment supprimer ce véhicule ? Cette action est irréversible.</div>
      </Modal>
    </div>
  );
}
