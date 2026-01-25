import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const CoordinatorLayout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        {children}
      </div>
    </div>
  );
};

export default CoordinatorLayout;
