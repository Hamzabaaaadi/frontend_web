import React, { useState, useEffect } from "react";
import axios from 'axios'
import { Link } from "react-router-dom";


const defaultProfile = {
	name: "Hamza Coordinateur",
	role: "Coordinateur",
	email: "hamza@taskme.com",
	grade: "A",
	specialty: "Auditeur pédagogique",
	photo: ""
};


const Navbar = () => {
	const [showProfile, setShowProfile] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [profile, setProfile] = useState(defaultProfile);
	const [photoPreview, setPhotoPreview] = useState("");
	const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
	const [loadingProfile, setLoadingProfile] = useState(false);
	const [profileError, setProfileError] = useState(null);
	const [savingProfile, setSavingProfile] = useState(false);
	const handlePhotoChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setSelectedAvatarFile(file);
			const reader = new FileReader();
			reader.onload = (ev) => {
				setProfile((prev) => ({ ...prev, photo: ev.target.result }));
				setPhotoPreview(ev.target.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setProfile((prev) => ({ ...prev, [name]: value }));
	};

	const handleLogout = () => {
		if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
			try {
				localStorage.removeItem('basicAuth');
			} catch (e) {}
			window.location.href = '/';
		}
	};

	const handleSaveProfile = async (e) => {
		if (e && e.preventDefault) e.preventDefault();
		setSavingProfile(true);
		setProfileError(null);
		try {
			let uploadedAvatarUrl = null;
			// If user selected a new avatar file, upload it first using multipart/form-data to /api/users/:id/avatar
			if (selectedAvatarFile) {
				const userId = profile._id || 'me';
				const token = localStorage.getItem('basicAuth');
				const headers = token ? { Authorization: `Basic ${token}` } : {};
				const form = new FormData();
				form.append('avatar', selectedAvatarFile);
					const API = import.meta.env.VITE_API_URL
					const uploadRes = await axios.put(`${API}/api/users/${userId}/avatar`, form, { headers: { ...headers } })
					const uploadData = uploadRes.data
				// according to spec response contains { message, user: { ..., avatar: 'https://...' } }
				uploadedAvatarUrl = uploadData.user && (uploadData.user.avatar || uploadData.user.avatarUrl || uploadData.user.photo) || null;
				if (uploadedAvatarUrl) {
					setProfile((prev) => ({ ...prev, photo: uploadedAvatarUrl }));
				}
			}
			
			// now save other profile fields
			// split full name into prenom / nom when possible
			const parts = (profile.name || '').trim().split(/\s+/);
			const prenom = parts.shift() || '';
			const nom = parts.join(' ') || '';

			const token = localStorage.getItem('basicAuth');
			const headers = token ? { Authorization: `Basic ${token}` } : {};

			// build body without sending large data URLs; include photo only when we have an uploaded URL
			const body = {
				prenom,
				nom,
				email: profile.email,
				grade: profile.grade,
				specialty: profile.specialty,
			};
			if (uploadedAvatarUrl) {
				body.photo = uploadedAvatarUrl;
			}

			const API = import.meta.env.VITE_API_URL
			const res = await axios.put(`${API}/api/users/me`, body, { headers: { 'Content-Type': 'application/json', ...headers } })
			const data = res.data
			const u = data.user || data;
			const name = `${u.prenom || ''} ${u.nom || ''}`.trim() || u.email || profile.name;
			setProfile((prev) => ({
				...prev,
				name,
				email: u.email || prev.email,
				role: u.role || prev.role,
				photo: u.photo || prev.photo || prev.photo,
				grade: u.grade || prev.grade,
				specialty: u.specialty || prev.specialty,
			}));
			setEditMode(false);
			// small visual confirmation
			alert('Profil mis à jour avec succès.');
		} catch (err) {
			console.error('Failed to save profile', err);
			setProfileError(err.message || String(err));
			alert('Échec mise à jour profil: ' + (err.message || err));
		} finally {
			setSavingProfile(false);
		}
	};

	useEffect(() => {
		const loadProfile = async () => {
			setLoadingProfile(true);
			setProfileError(null);
			try {
				const token = localStorage.getItem('basicAuth');
				const headers = token ? { Authorization: `Basic ${token}` } : {};
				const API = import.meta.env.VITE_API_URL
				const res = await axios.get(`${API}/api/users/me`, { headers: { ...headers } })
				const data = res.data
				const u = data.user || data;
				const name = `${u.prenom || ''} ${u.nom || ''}`.trim() || u.email || profile.name;
				setProfile((prev) => ({
					...prev,
					_id: u._id || u.id || prev._id,
					name,
					email: u.email || prev.email,
					role: u.role || prev.role,
					photo: u.avatar || u.photo || prev.photo || '',
				}));
			} catch (err) {
				console.error('Failed to load profile', err);
				setProfileError(err.message || String(err));
			} finally {
				setLoadingProfile(false);
			}
		};

		loadProfile();
	}, []);

	return (
		<div className="navbar">
			<div className="navbar-content">
				<span className="role-badge-modern">Coordinateur</span>
				<div className="navbar-actions">
					{/* Chat icon removed */}
					<div
						className="user-avatar"
						onClick={() => {
							setShowProfile((v) => !v);
							setShowNotifications(false);
						}}
						title="Voir le profil"
					>
						{profile.photo ? (
							<img src={profile.photo} alt="Profil" className="avatar-image" />
						) : (
							<span className="avatar-initials">CO</span>
						)}
					</div>
				</div>
			</div>


			{/* Modale du profil */}
			{showProfile && (
				<div className="profile-modal">
				  <div className="profile-modal-box">
					{editMode ? (
						<form className="profile-form" onSubmit={handleSaveProfile}>
							<h3 className="profile-title">Modifier le profil</h3>
							<div className="profile-photo-section">
								<div className="photo-upload-wrapper">
									{(photoPreview || profile.photo) ? (
										<img src={photoPreview || profile.photo} alt="Preview" className="profile-photo-large" />
									) : (
										<div className="profile-photo-placeholder">
											<span>📷</span>
										</div>
									)}
									<label className="photo-upload-label">
										<input type="file" accept="image/*" onChange={handlePhotoChange} className="photo-input" />
										<span className="upload-btn">Choisir une photo</span>
									</label>
								</div>
							</div>
							<div className="profile-field">
								<label className="field-label">Nom complet</label>
								<input 
									name="name" 
									value={profile.name} 
									onChange={handleChange} 
									placeholder="Nom complet" 
									className="profile-input"
								/>
							</div>
							<div className="profile-field">
								<label className="field-label">Email</label>
								<input 
									name="email" 
									type="email"
									value={profile.email} 
									onChange={handleChange} 
									placeholder="email@example.com" 
									className="profile-input"
								/>
							</div>
							<div className="profile-field">
								<label className="field-label">Grade</label>
								<input 
									name="grade" 
									value={profile.grade} 
									onChange={handleChange} 
									placeholder="Grade" 
									className="profile-input"
								/>
							</div>
							<div className="profile-field">
								<label className="field-label">Spécialité</label>
								<input 
									name="specialty" 
									value={profile.specialty} 
									onChange={handleChange} 
									placeholder="Spécialité" 
									className="profile-input"
								/>
							</div>
							<div className="profile-actions" style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
								<button type="button" className="btn-cancel" onClick={() => setEditMode(false)} disabled={savingProfile}>Annuler</button>
								<button type="submit" className="btn-primary" disabled={savingProfile}>{savingProfile ? 'Enregistrement...' : 'Enregistrer'}</button>
							</div>
						</form>
					) : (
						<div className="profile-view">
							<div className="profile-header">
								<div className="profile-photo-section">
									{profile.photo ? (
										<img src={profile.photo} alt="Profil" className="profile-photo-large" />
									) : (
										<div className="profile-photo-placeholder">
											<span style={{fontSize: '2rem'}}>👤</span>
										</div>
									)}
								</div>
								<h3 className="profile-name">{profile.name}</h3>
								<span className="profile-role-tag">{profile.role}</span>
							</div>
							<div className="profile-details">
								<div className="profile-detail-item">
									<span className="detail-icon">📧</span>
									<div>
										<div className="detail-label">Email</div>
										<div className="detail-value">{profile.email}</div>
									</div>
								</div>
								<div className="profile-detail-item">
									<span className="detail-icon">📊</span>
									<div>
										<div className="detail-label">Grade</div>
										<div className="detail-value">{profile.grade}</div>
									</div>
								</div>
								<div className="profile-detail-item">
									<span className="detail-icon">🎓</span>
									<div>
										<div className="detail-label">Spécialité</div>
										<div className="detail-value">{profile.specialty}</div>
									</div>
								</div>
							</div>
							<div className="profile-actions" style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
								<button className="btn-primary" onClick={() => setEditMode(true)}>Modifier le profil</button>
								<button className="btn-cancel" onClick={() => setShowProfile(false)}>Fermer</button>
							</div>
						</div>
					)}
				  </div>
				</div>
			)}
		</div>
	);
};

export default Navbar;