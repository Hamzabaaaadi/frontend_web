import React from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
	{ label: "📊 Tableau de bord", to: "/dashboard", icon: "📊" },
	{ label: "📋 Gestion des tâches", to: "/tasks", icon: "📋" },
	{ label: "🚗 Gestion véhicules", to: "/vehicles", icon: "🚗" },
	{ label: "💬 Communication", to: "/chat", icon: "💬" },
];

const Sidebar = () => {
	const location = useLocation();
	return (
		<div className="sidebar">
			<div className="sidebar-header">
				<h3>🎯 Coordinateur</h3>
			</div>
			<nav className="sidebar-nav">
				<ul>
					{navItems.map((item) => (
						<li key={item.to} className={location.pathname === item.to ? "active" : ""}>
							<Link to={item.to} className="nav-link">
								<span className="nav-icon">{item.icon}</span>
								<span className="nav-label">{item.label.replace(/^[^\s]+\s/, '')}</span>
							</Link>
						</li>
					))}
				</ul>
			</nav>
		</div>
	);
};

export default Sidebar;