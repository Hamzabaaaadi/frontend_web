import React from "react";
import "../../styles/coordinator.css";

const Tabs = ({ tabs, activeTab, onTabChange }) => (
  <div className="tabs">
    {tabs.map((tab, idx) => (
      <button
        key={tab}
        className={"tab-btn" + (activeTab === idx ? " active" : "")}
        onClick={() => onTabChange(idx)}
      >
        {tab}
      </button>
    ))}
  </div>
);

export default Tabs;
