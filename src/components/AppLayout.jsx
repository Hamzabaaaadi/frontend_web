import React from "react";
import CoordinatorSidebar from "../pages/coordinateur/Sidebar";
import CoordinatorNavbar from "../pages/coordinateur/Navbar";
import AuditeurSidebar from "../pages/Auditeur/Sidebar";
import AuditeurHeader from "../pages/Auditeur/Header";
import SuperAdminSidebar from "../pages/superadmin/Sidebar";
import SuperAdminNavbar from "../pages/superadmin/Navbar";
import { useAppRole } from "../AppRoleContext.jsx";
import * as authService from "../services/authService";

export default function AppLayout({ role, children }) {
  const { setRole } = useAppRole();
  
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Erreur lors de la déconnexion:', err);
    } finally {
      setRole("");
    }
  };

  // Bouton déconnexion
  const logoutBtn = (
    <button onClick={handleLogout} className="logout-btn">Déconnexion</button>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
