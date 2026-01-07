import React, { createContext, useContext, useState } from "react";

const AppRoleContext = createContext();

export function AppRoleProvider({ children }) {
  // À remplacer par une vraie logique d'authentification !
  const [role, setRole] = useState("coordinateur"); // ou "auditeur"
  return (
    <AppRoleContext.Provider value={{ role, setRole }}>
      {children}
    </AppRoleContext.Provider>
  );
}

export function useAppRole() {
  return useContext(AppRoleContext);
}
