import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import { AppRoleProvider, useAppRole } from "./AppRoleContext.jsx";
// Coordinator pages
import CoordinatorDashboard from "./pages/coordinateur/Dashboard";
import TasksAssignment from "./pages/coordinateur/TasksAssignment";
import Chat from "./pages/coordinateur/Communication";
import Affectation from "./pages/coordinateur/Affectation";
// Auditeur pages
import AuditeurDashboard from "./pages/Auditeur/Dashboard";
import AuditeurTasks from "./pages/Auditeur/Tasks";
import AuditeurProfile from "./pages/Auditeur/Profile";
import AuditeurDelegations from "./pages/Auditeur/Delegations";
import Login from "./components/Login";
// SuperAdmin pages
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import UsersManagement from "./pages/superadmin/UsersManagement";
import SuperAdminSettings from "./pages/superadmin/Settings";
import VehiclesManagement from "./pages/superadmin/Vehicles";

function AppRoutes() {
  const { role } = useAppRole();
  return (
    <AppLayout role={role}>
      <Routes>
        {role === "coordinateur" ? (
          <>
            <Route path="/" element={<CoordinatorDashboard />} />
            <Route path="/dashboard" element={<CoordinatorDashboard />} />
            <Route path="/tasks" element={<TasksAssignment />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/affectation" element={<Affectation />} />
          </>
        ) : role === "superadmin" ? (
          <>
            <Route path="/" element={<SuperAdminDashboard />} />
            <Route path="/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/users" element={<UsersManagement />} />
            <Route path="/vehicles" element={<VehiclesManagement />} />
            <Route path="/settings" element={<SuperAdminSettings />} />
          </>
        ) : (
          <>
            <Route path="/" element={<AuditeurDashboard />} />
            <Route path="/dashboard" element={<AuditeurDashboard />} />
            <Route path="/tasks" element={<AuditeurTasks />} />
            <Route path="/delegations" element={<AuditeurDelegations />} />
            <Route path="/profile" element={<AuditeurProfile />} />
          </>
        )}
      </Routes>
    </AppLayout>
  );
}

function AppRoutesOrLogin() {
  const { role } = useAppRole();
  return role ? <AppRoutes /> : <Login />;
}

function App() {
  return (
    <AppRoleProvider>
      <Router>
        <AppRoutesOrLogin />
      </Router>
    </AppRoleProvider>
  );
}

export default App;
