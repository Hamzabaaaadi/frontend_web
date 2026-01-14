import React, { useEffect, useState } from "react";
import * as svc from "../../services/superAdminService";
import './dashboard.css'
import Modal from "../../components/common/Modal";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const emptyForm = {
    nom: "",
    prenom: "",
    email: "",
    role: "COORDINATEUR",
    motDePasse: "",
    estActif: true,
    nombre_des_taches: 0,

    // champs Auditeur
    specialite: "",
    grade: "",
    diplomes: [],
    formations: [],
    anciennete: "",
    dateInscription: ""
  };

  const [form, setForm] = useState(emptyForm);

  /* ================= LOAD USERS ================= */
  const load = async () => {
    setLoading(true);
    try {
      const response = await svc.listUsers(); // Assuming this fetches the users
      if (response && Array.isArray(response.users)) {
        setUsers(response.users);
      } else {
        console.error('Invalid response format:', response);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= OPEN CREATE ================= */
  const openCreate = () => {
    setEditUser(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  /* ================= OPEN EDIT ================= */
  const openEdit = (u) => {
    setEditUser(u);
    setForm({
      nom: u.nom || "",
      prenom: u.prenom || "",
      email: u.email || "",
      role: u.role || "COORDINATEUR",
      estActif: u.estActif ?? true,

      specialite: u.specialite || "",
      grade: u.grade || "",
      diplomes: u.diplomes || [],
      formations: u.formations || [],
      anciennete: u.anciennete || "",
      dateInscription: u.dateInscription || ""
    });
    setModalOpen(true);
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    // basic client-side validation
    if (!form.email) {
      alert('Email requis');
      return;
    }
    if (!editUser && !form.motDePasse) {
      alert('Mot de passe requis pour la création');
      return;
    }

    const payload = {
      nom: form.nom,
      prenom: form.prenom,
      email: form.email,
      role: form.role,
      estActif: form.estActif
    };

    // ajouter les champs auditeur SEULEMENT si rôle = AUDITEUR
    if (form.role === "AUDITEUR") {
      Object.assign(payload, {
        specialite: form.specialite,
        grade: form.grade,
        diplomes: form.diplomes,
        formations: form.formations,
        anciennete: form.anciennete || null,
        nombre_des_taches: form.nombre_des_taches || 0,
        dateInscription: form.dateInscription || null
      });
    }

    if (editUser) {
      const id = editUser._id || editUser.id;
      // include password only if provided; send both keys to be safe
      if (form.motDePasse) {
        payload.motDePasse = form.motDePasse;
        payload.password = form.motDePasse;
      }
      try {
        console.log('update payload', id, payload);
        await svc.updateUser(id, payload);
      } catch (err) {
        console.error('Error updating user:', err);
        alert('Erreur lors de la mise à jour');
      }
    } else {
      // include password for registration (use temp default if empty)
      const regPayload = { ...payload, motDePasse: form.motDePasse || 'TempPass123!' };
      // also include `password` key for compatibility
      regPayload.password = regPayload.motDePasse;
      try {
        console.log('register payload', regPayload);
        await svc.register(regPayload); // POST /api/auth/register
      } catch (err) {
        console.error('Error creating user:', err);
        alert('Erreur lors de la création: ' + (err.message || ''));
      }
    }

    setModalOpen(false);
    await load();
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    // open modal confirmation instead of native confirm
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteUser = async () => {
    const id = deleteTargetId;
    setDeleteConfirmOpen(false);
    setDeleteTargetId(null);
    try {
      await svc.deleteUser(id);
      await load();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="sa-dashboard">
      <div className="sa-header">
        <div>
          <h1 className="sa-title">Gestion des utilisateurs</h1>
          <div className="sa-sub">Création et gestion des comptes utilisateurs</div>
        </div>

        <div>
          <button onClick={openCreate} className="btn btn-primary">+ Créer un utilisateur</button>
        </div>
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {Array.isArray(users) && users.map(u => {
            const id = u._id || u.id
            return (
              <div key={id} className="sa-card">
                <strong>{u.nom} {u.prenom} ({u.role})</strong>
                <div>{u.email}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <button onClick={() => openEdit(u)} className="btn btn-ghost btn-sm">Éditer</button>
                  <button onClick={() => handleDelete(id)} className="btn btn-danger btn-sm">Supprimer</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ================= MODAL ================= */}
      <Modal
        isOpen={modalOpen}
        title={editUser ? "Modifier utilisateur" : "Créer utilisateur"}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleSave}
        confirmText={editUser ? "Enregistrer" : "Créer"}
      >
        <div style={{ display: "grid", gap: 10 }}>
          <input
            placeholder="Nom"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />

          <input
            placeholder="Prénom"
            value={form.prenom}
            onChange={(e) => setForm({ ...form, prenom: e.target.value })}
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder={editUser ? "Nouveau mot de passe (laisser vide pour garder)" : "Mot de passe"}
            value={form.motDePasse}
            onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
          />

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="AUDITEUR">Auditeur</option>
            <option value="COORDINATEUR">Coordinateur</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>

          {/* 🔥 CHAMPS CACHÉS JUSQU’À AUDITEUR */}
          {form.role === "AUDITEUR" && (
            <>
              <input
                placeholder="Spécialité"
                value={form.specialite}
                onChange={(e) => setForm({ ...form, specialite: e.target.value })}
              />

              <input
                placeholder="Grade"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
              />

              <input
                type="number"
                placeholder="Ancienneté"
                value={form.anciennete}
                onChange={(e) => setForm({ ...form, anciennete: e.target.value })}
              />

              <input
                type="number"
                placeholder="Nombre des taches"
                value={form.nombre_des_taches}
                onChange={(e) => setForm({ ...form, nombre_des_taches: Number(e.target.value) })}
              />

              <input
                type="date"
                value={form.dateInscription}
                onChange={(e) => setForm({ ...form, dateInscription: e.target.value })}
              />

              <textarea
                placeholder="Diplômes (séparés par ,)"
                value={form.diplomes.join(",")}
                onChange={(e) =>
                  setForm({ ...form, diplomes: e.target.value.split(",").map(d => d.trim()) })
                }
              />
            </>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={deleteConfirmOpen}
        title="Confirmer la suppression"
        onCancel={() => { setDeleteConfirmOpen(false); setDeleteTargetId(null); }}
        onConfirm={confirmDeleteUser}
        confirmText="Supprimer"
      >
        <div>Voulez-vous vraiment supprimer cet utilisateur ? Cette action est irréversible.</div>
      </Modal>
    </div>
  );
}






