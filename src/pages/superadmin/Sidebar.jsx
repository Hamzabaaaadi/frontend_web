import React from "react";
import { Link } from "react-router-dom";

export default function SuperAdminSidebar() {
  return (
    <aside className="sidebar" style={{ width: 220, padding: 16, background: "#0f172a", color: "#fff", minHeight: "100vh" }}>
      <div style={{ fontWeight: 700, marginBottom: 16 }}>Super Admin</div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Link to="/" style={{ color: "#cbd5e1" }}>Dashboard</Link>
        <Link to="/users" style={{ color: "#cbd5e1" }}>Utilisateurs</Link>
        <Link to="/vehicles" style={{ color: "#cbd5e1" }}>Parc automobile</Link>
        <Link to="/settings" style={{ color: "#cbd5e1" }}>Paramètres</Link>
      </nav>
    </aside>
  );
}
