


































import React, { useEffect, useState } from "react";
import * as svc from "../../services/superAdminService";
import Modal from "../../components/common/Modal";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const emptyForm = {
    nom: "",
    prenom: "",
    email: "",
    role: "COORDINATEUR",
    estActif: true,

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
    setUsers(await svc.listUsers());
    setLoading(false);
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
        dateInscription: form.dateInscription || null
      });
    }

    if (editUser) {
      await svc.updateUser(editUser.id, payload);
    } else {
      // 🔥 UN SEUL ENDPOINT
      await svc.register(payload); // POST /api/auth/register
    }

    setModalOpen(false);
    await load();
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    await svc.deleteUser(id);
    await load();
  };

  /* ================= RENDER ================= */
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1>Gestion des utilisateurs</h1>
          <div style={{ color: "#64748b" }}>
            Création et gestion des comptes utilisateurs
          </div>
        </div>

        {/* ✅ UN SEUL BOUTON */}
        <button onClick={openCreate}>
          + Créer un utilisateur
        </button>
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {users.map(u => (
            <div key={u.id} style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
              <strong>{u.nom} {u.prenom} ({u.role})</strong>
              <div>{u.email}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button onClick={() => openEdit(u)}>Éditer</button>
                <button onClick={() => handleDelete(u.id)}>Supprimer</button>
              </div>
            </div>
          ))}
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
    </div>
  );
}






