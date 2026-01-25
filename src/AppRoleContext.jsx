import React, { createContext, useContext, useState } from "react";

const AppRoleContext = createContext();

export function AppRoleProvider({ children }) {
  const [role, setRole] = useState(""); // vide par défaut
  return (
    <AppRoleContext.Provider value={{ role, setRole }}>
      {children}
    </AppRoleContext.Provider>
  );
}

export function useAppRole() {
  return useContext(AppRoleContext);
}
