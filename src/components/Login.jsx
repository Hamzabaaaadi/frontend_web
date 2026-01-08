import React, { useState } from "react";
import { useAppRole } from "../AppRoleContext.jsx";

export default function Login() {
  const { setRole } = useAppRole();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple logique de rôle selon l'email
    if (email === "coordinateur@demo.com" && password === "demo") {
      setRole("coordinateur");
    } else if (email === "auditeur@demo.com" && password === "demo") {
      setRole("auditeur");
    } else if (email === "superadmin@demo.com" && password === "demo") {
      setRole("superadmin");
    } else {
      setError("Email ou mot de passe incorrect");
      return;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f7fb" }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 32, borderRadius: 10, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", minWidth: 320 }}>
        <h2 style={{ marginBottom: 24 }}>Connexion</h2>
        <div style={{ marginBottom: 16 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #e5e7eb" }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #e5e7eb" }}
            required
          />
        </div>
        {error && <div style={{ color: "#ef4444", marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: "100%", padding: 10, borderRadius: 6, background: "#2563eb", color: "#fff", border: "none", fontWeight: 600 }}>
          Se connecter
        </button>
        <div style={{ marginTop: 16, color: "#64748b", fontSize: 13 }}>
          <div>Demo coordinateur: coordinateur@demo.com / demo</div>
          <div>Demo auditeur: auditeur@demo.com / demo</div>
          <div>Demo superadmin: superadmin@demo.com / demo</div>
        </div>
      </form>
    </div>
  );
}
