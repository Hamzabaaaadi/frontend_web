import React from "react";

const Navbar = () => {
  return (
    <div
      style={{
        height: "60px",
        background: "linear-gradient(90deg, #6d5bd0, #7c4fb6)",
        color: "white",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        fontSize: "18px",
        fontWeight: "600",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        letterSpacing: "0.5px"
      }}
    >
      🎯 Coordinateur
    </div>
  );
};

export default Navbar;





























// import React from "react";
// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { notificationsData } from "../../data/notifications";


// const defaultProfile = {
// 	name: "Hamza Coordinateur",
// 	role: "Coordinateur",
// 	email: "hamza@taskme.com",
// 	grade: "A",
// 	specialty: "Auditeur pédagogique",
// 	photo: ""
// };


// const Navbar = () => {
// 	const [showProfile, setShowProfile] = useState(false);
// 	const [showNotifications, setShowNotifications] = useState(false);
// 	const [editMode, setEditMode] = useState(false);
// 	const [profile, setProfile] = useState(defaultProfile);
// 	const [photoPreview, setPhotoPreview] = useState("");
// 	const [notifications, setNotifications] = useState(notificationsData);

// 	const unreadCount = notifications.filter(n => !n.read).length;

// 	const handlePhotoChange = (e) => {
// 		const file = e.target.files[0];
// 		if (file) {
// 			const reader = new FileReader();
// 			reader.onload = (ev) => {
// 				setProfile((prev) => ({ ...prev, photo: ev.target.result }));
// 				setPhotoPreview(ev.target.result);
// 			};
// 			reader.readAsDataURL(file);
// 		}
// 	};

// 	const handleChange = (e) => {
// 		const { name, value } = e.target;
// 		setProfile((prev) => ({ ...prev, [name]: value }));
// 	};

// 	const markAsRead = (id) => {
// 		setNotifications(notifications.map(n => 
// 			n.id === id ? { ...n, read: true } : n
// 		));
// 	};

// 	const markAllAsRead = () => {
// 		setNotifications(notifications.map(n => ({ ...n, read: true })));
// 	};

// 	const deleteNotification = (id) => {
// 		setNotifications(notifications.filter(n => n.id !== id));
// 	};

// 	const clearAllNotifications = () => {
// 		if (window.confirm("Voulez-vous vraiment supprimer toutes les notifications ?")) {
// 			setNotifications([]);
// 		}
// 	};

// 	return (
// 		<div className="navbar">
// 			<div className="navbar-content">
// 				<span className="role-badge-modern">Coordinateur</span>
// 				<div className="navbar-actions">
// 					<Link to="/chat" className="navbar-icon-modern" title="Chat">
// 						<span role="img" aria-label="chat">💬</span>
// 					</Link>
// 					<div 
// 						className="navbar-icon-modern" 
// 						title="Notifications"
// 						onClick={() => {
// 							setShowNotifications(!showNotifications);
// 							setShowProfile(false);
// 						}}
// 						style={{ cursor: 'pointer' }}
// 					>
// 						<span role="img" aria-label="notifications">🔔</span>
// 						{unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
// 					</div>
// 					<div
// 						className="user-avatar"
// 						onClick={() => {
// 							setShowProfile((v) => !v);
// 							setShowNotifications(false);
// 						}}
// 						title="Voir le profil"
// 					>
// 						{profile.photo ? (
// 							<img src={profile.photo} alt="Profil" className="avatar-image" />
// 						) : (
// 							<span className="avatar-initials">CO</span>
// 						)}
// 					</div>
// 				</div>
// 			</div>

// 			{/* Modale des notifications */}
// 			{showNotifications && (
// 				<div className="notifications-modal">
// 					<div className="notifications-header">
// 						<h3>🔔 Notifications</h3>
// 						{notifications.length > 0 && (
// 							<div className="notifications-actions">
// 								{unreadCount > 0 && (
// 									<button className="btn-link-small" onClick={markAllAsRead}>
// 										Tout marquer comme lu
// 									</button>
// 								)}
// 								<button className="btn-link-small text-danger" onClick={clearAllNotifications}>
// 									Tout supprimer
// 								</button>
// 							</div>
// 						)}
// 					</div>

// 					<div className="notifications-list">
// 						{notifications.length === 0 ? (
// 							<div className="notifications-empty">
// 								<span className="empty-icon">🔕</span>
// 								<p>Aucune notification</p>
// 							</div>
// 						) : (
// 							notifications.map((notif) => (
// 								<div 
// 									key={notif.id} 
// 									className={`notification-item ${notif.read ? 'read' : 'unread'}`}
// 									onClick={() => markAsRead(notif.id)}
// 								>
// 									<div className="notification-icon">{notif.icon}</div>
// 									<div className="notification-content">
// 										<div className="notification-title">{notif.title}</div>
// 										<div className="notification-message">{notif.message}</div>
// 										<div className="notification-date">{notif.date}</div>
// 									</div>
// 									<button 
// 										className="notification-delete"
// 										onClick={(e) => {
// 											e.stopPropagation();
// 											deleteNotification(notif.id);
// 										}}
// 										title="Supprimer"
// 									>
// 										✕
// 									</button>
// 									{!notif.read && <span className="unread-dot"></span>}
// 								</div>
// 							))
// 						)}
// 					</div>
// 				</div>
// 			)}

// 			{/* Modale du profil */}
// 			{showProfile && (
// 				<div className="profile-modal">
// 					{editMode ? (
// 						<form className="profile-form" onSubmit={e => {e.preventDefault(); setEditMode(false);}}>
// 							<h3 className="profile-title">Modifier le profil</h3>
// 							<div className="profile-photo-section">
// 								<div className="photo-upload-wrapper">
// 									{(photoPreview || profile.photo) ? (
// 										<img src={photoPreview || profile.photo} alt="Preview" className="profile-photo-large" />
// 									) : (
// 										<div className="profile-photo-placeholder">
// 											<span>📷</span>
// 										</div>
// 									)}
// 									<label className="photo-upload-label">
// 										<input type="file" accept="image/*" onChange={handlePhotoChange} className="photo-input" />
// 										<span className="upload-btn">Choisir une photo</span>
// 									</label>
// 								</div>
// 							</div>
// 							<div className="profile-field">
// 								<label className="field-label">Nom complet</label>
// 								<input 
// 									name="name" 
// 									value={profile.name} 
// 									onChange={handleChange} 
// 									placeholder="Nom complet" 
// 									className="profile-input"
// 								/>
// 							</div>
// 							<div className="profile-field">
// 								<label className="field-label">Email</label>
// 								<input 
// 									name="email" 
// 									type="email"
// 									value={profile.email} 
// 									onChange={handleChange} 
// 									placeholder="email@example.com" 
// 									className="profile-input"
// 								/>
// 							</div>
// 							<div className="profile-field">
// 								<label className="field-label">Grade</label>
// 								<input 
// 									name="grade" 
// 									value={profile.grade} 
// 									onChange={handleChange} 
// 									placeholder="Grade" 
// 									className="profile-input"
// 								/>
// 							</div>
// 							<div className="profile-field">
// 								<label className="field-label">Spécialité</label>
// 								<input 
// 									name="specialty" 
// 									value={profile.specialty} 
// 									onChange={handleChange} 
// 									placeholder="Spécialité" 
// 									className="profile-input"
// 								/>
// 							</div>
// 							<div className="profile-actions">
// 								<button type="button" className="btn-cancel" onClick={() => setEditMode(false)}>Annuler</button>
// 								<button type="submit" className="btn-primary">Enregistrer</button>
// 							</div>
// 						</form>
// 					) : (
// 						<div className="profile-view">
// 							<div className="profile-header">
// 								<div className="profile-photo-section">
// 									{profile.photo ? (
// 										<img src={profile.photo} alt="Profil" className="profile-photo-large" />
// 									) : (
// 										<div className="profile-photo-placeholder">
// 											<span style={{fontSize: '2rem'}}>👤</span>
// 										</div>
// 									)}
// 								</div>
// 								<h3 className="profile-name">{profile.name}</h3>
// 								<span className="profile-role-tag">{profile.role}</span>
// 							</div>
// 							<div className="profile-details">
// 								<div className="profile-detail-item">
// 									<span className="detail-icon">📧</span>
// 									<div>
// 										<div className="detail-label">Email</div>
// 										<div className="detail-value">{profile.email}</div>
// 									</div>
// 								</div>
// 								<div className="profile-detail-item">
// 									<span className="detail-icon">📊</span>
// 									<div>
// 										<div className="detail-label">Grade</div>
// 										<div className="detail-value">{profile.grade}</div>
// 									</div>
// 								</div>
// 								<div className="profile-detail-item">
// 									<span className="detail-icon">🎓</span>
// 									<div>
// 										<div className="detail-label">Spécialité</div>
// 										<div className="detail-value">{profile.specialty}</div>
// 									</div>
// 								</div>
// 							</div>
// 							<div className="profile-actions">
// 								<button className="btn-primary" onClick={() => setEditMode(true)}>Modifier le profil</button>
// 								<button className="btn-cancel" onClick={() => setShowProfile(false)}>Fermer</button>
// 							</div>
// 							<div className="profile-footer">
// 								<button className="btn-logout" onClick={() => {
// 									if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
// 										// Logique de déconnexion ici
// 										window.location.href = '/';
// 									}
// 								}}>🚪 Déconnexion</button>
// 							</div>
// 						</div>
// 					)}
// 				</div>
// 			)}
// 		</div>
// 	);
// };

// export default Navbar;