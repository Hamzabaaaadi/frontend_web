import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import { AppRoleProvider, useAppRole } from "./AppRoleContext.jsx";
// Coordinator pages
import CoordinatorDashboard from "./pages/coordinateur/Dashboard";
import TasksAssignment from "./pages/coordinateur/TasksAssignment";
import Vehicles from "./pages/coordinateur/Vehicles";
import Chat from "./pages/coordinateur/Communication";
// Auditeur pages
import AuditeurDashboard from "./pages/Auditeur/Dashboard";
import AuditeurTasks from "./pages/Auditeur/Tasks";
import AuditeurProfile from "./pages/Auditeur/Profile";
import Login from "./components/Login";

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
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/chat" element={<Chat />} />
          </>
        ) : (
          <>
            <Route path="/" element={<AuditeurDashboard />} />
            <Route path="/dashboard" element={<AuditeurDashboard />} />
            <Route path="/tasks" element={<AuditeurTasks />} />
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
