import React from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
	// { label: "📊 Tableau de bord", to: "/dashboard", icon: "📊" },
	{ label: "📋 Gestion des tâches", to: "/tasks", icon: "📋" },
	// { label: "💬 Communication", to: "/chat", icon: "💬" },
	{ label: "🗂️ Affectation", to: "/affectation", icon: "🗂️" },
];

const Sidebar = () => {
	const location = useLocation();
	return (
		<div
			className="sidebar"
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				height: "100vh",
				overflowY: "auto",
				width: "240px",
				zIndex: 1000,
			}}
		>
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