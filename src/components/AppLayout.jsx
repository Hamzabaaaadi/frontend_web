import React from "react";
import CoordinatorSidebar from "../pages/coordinateur/Sidebar";
import CoordinatorNavbar from "../pages/coordinateur/Navbar";
import AuditeurSidebar from "../pages/Auditeur/Sidebar";
import AuditeurHeader from "../pages/Auditeur/Header";
import SuperAdminSidebar from "../pages/superadmin/Sidebar";
import SuperAdminNavbar from "../pages/superadmin/Navbar";
import { useAppRole } from "../AppRoleContext.jsx";

export default function AppLayout({ role, children }) {
  const { setRole } = useAppRole();
  // Bouton déconnexion simple
  const logoutBtn = (
    <button
      onClick={() => setRole("")}
      style={{
        marginLeft: 16,
        padding: "6px 12px",
        borderRadius: 6,
        border: "none",
        background: "#ef4444",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      Déconnexion
    </button>
  );
  return (
    <div className="layout">
      {role === "coordinateur" ? (
        <CoordinatorSidebar />
      ) : role === "superadmin" ? (
        <SuperAdminSidebar />
      ) : (
        <AuditeurSidebar />
      )}
      <div className="main-content">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {role === "coordinateur" ? (
            <CoordinatorNavbar />
          ) : role === "superadmin" ? (
            <SuperAdminNavbar />
          ) : (
            <AuditeurHeader />
          )}
          {logoutBtn}
        </div>
        {children}
      </div>
    </div>
  );
}
