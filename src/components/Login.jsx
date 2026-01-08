import React, { useState } from "react";
import { useAppRole } from "../AppRoleContext.jsx";
import * as authService from "../services/authService";

export default function Login() {
  const { setRole } = useAppRole();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      
      // L'API peut retourner le rôle dans response.role ou response.user.role
      const userRole = response.role || response.user?.role || response.user?.role?.toLowerCase();
      
      if (userRole) {
        // Normaliser le rôle (SUPERADMIN -> superadmin, etc.)
        const normalizedRole = userRole.toLowerCase().replace('_', '');
        setRole(normalizedRole);
      } else {
        setError("Rôle utilisateur non trouvé dans la réponse");
      }
    } catch (err) {
      setError(err.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
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
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: 10, 
            borderRadius: 6, 
            background: loading ? "#94a3b8" : "#2563eb", 
            color: "#fff", 
            border: "none", 
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Connexion..." : "Se connecter"}
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
