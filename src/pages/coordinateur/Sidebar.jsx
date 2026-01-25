import React, { useEffect, useState } from "react";
import axios from 'axios'
import { Link, useLocation } from "react-router-dom";
import Modal from '../../components/common/Modal'

const navItems = [
	{ label: "📊 Tableau de bord", to: "/dashboard", icon: "📊" },
	{ label: "📋 Gestion des tâches", to: "/tasks", icon: "📋" },
	// { label: "💬 Communication", to: "/chat", icon: "💬" },
	{ label: "🗂️ Affectation", to: "/affectation", icon: "🗂️" },
];

const Sidebar = () => {
		const [users, setUsers] = useState([]);
		useEffect(() => {
			const fetchUsers = async () => {
				try {
					const token = localStorage.getItem('basicAuth');
					const headers = token ? { Authorization: `Basic ${token}` } : {};
					const API = import.meta.env.VITE_API_URL
					const res = await axios.get(`${API}/api/users/all`, { headers });
					if (!res) return;
					const data = res.data;
					setUsers(Array.isArray(data) ? data : (data && Array.isArray(data.users) ? data.users : []));
				} catch (e) {}
			};
			fetchUsers();
		}, []);
	const location = useLocation();
	const [unreadCount, setUnreadCount] = useState(0)

	useEffect(() => {
		let mounted = true
		const load = async () => {
			try {
				const token = localStorage.getItem('basicAuth')
				const headers = token ? { Authorization: `Basic ${token}` } : {}
				const API = import.meta.env.VITE_API_URL
				const res = await axios.get(`${API}/api/notifications`, { headers })
				if (!res) return
				const data = res.data || null
				let list = Array.isArray(data) ? data : (data && Array.isArray(data.notifications) ? data.notifications : [])
				if ((!list || list.length === 0)) {
					try {
						const meRes = await axios.get(`${API}/api/users/me`, { headers })
						if (meRes) {
							const meData = meRes.data || null
							const userId = meData && (meData.user?._id || meData.user?.id || meData._id || meData.id)
							if (userId) {
								const byUser = await axios.get(`${API}/api/notifications?userId=${userId}`, { headers })
								if (byUser) {
									const byUserData = byUser.data || null
									const byUserList = Array.isArray(byUserData) ? byUserData : (byUserData && Array.isArray(byUserData.notifications) ? byUserData.notifications : [])
									if (byUserList && byUserList.length) list = byUserList
								}
							}
						}
					} catch (e) { /* ignore */ }
				}
				if ((!list || list.length === 0)) {
					try {
						const byRole = await axios.get(`${API}/api/notifications?role=coordinateur`, { headers })
						if (byRole) {
							const byRoleData = byRole.data || null
							const byRoleList = Array.isArray(byRoleData) ? byRoleData : (byRoleData && Array.isArray(byRoleData.notifications) ? byRoleData.notifications : [])
							if (byRoleList && byRoleList.length) list = byRoleList
						}
					} catch (e) { /* ignore */ }
				}
				if (!mounted) return
				const unread = (list || []).filter(n => !(n.estLue || n.estLu || n.read)).length
				setUnreadCount(unread)
			} catch (e) {
				// ignore
			}
		}
		load()
		return () => { mounted = false }
	}, [])

	const [notifOpen, setNotifOpen] = useState(false)
	const [notifications, setNotifications] = useState([])
	const [notifLoading, setNotifLoading] = useState(false)
	const [createOpen, setCreateOpen] = useState(false)
	const [createLoading, setCreateLoading] = useState(false)
	const [createForm, setCreateForm] = useState({ destinataire: '', type: 'AFFECTATION', titre: '', message: '', tacheId: '', sendEmail: false })

	const loadNotifications = async () => {
		try {
			setNotifLoading(true)
			const token = localStorage.getItem('basicAuth')
			const headers = token ? { Authorization: `Basic ${token}` } : {}
				const API = import.meta.env.VITE_API_URL
				const res = await axios.get(`${API}/api/notifications`, { headers })
				if (!res) { setNotifications([]); return }
				const data = res.data || null
			let list = Array.isArray(data) ? data : (data && Array.isArray(data.notifications) ? data.notifications : [])
			if ((!list || list.length === 0)) {
				try {
						const meRes = await axios.get(`${API}/api/users/me`, { headers })
						if (meRes) {
							const meData = meRes.data || null
						const userId = meData && (meData.user?._id || meData.user?.id || meData._id || meData.id)
						if (userId) {
								const byUser = await axios.get(`${API}/api/notifications?userId=${userId}`, { headers })
								if (byUser) {
									const byUserData = byUser.data || null
								const byUserList = Array.isArray(byUserData) ? byUserData : (byUserData && Array.isArray(byUserData.notifications) ? byUserData.notifications : [])
								if (byUserList && byUserList.length) list = byUserList
							}
						}
					}
				} catch (e) { /* ignore */ }
			}
			if ((!list || list.length === 0)) {
				try {
						const byRole = await axios.get(`${API}/api/notifications?role=coordinateur`, { headers })
						if (byRole) {
							const byRoleData = byRole.data || null
						const byRoleList = Array.isArray(byRoleData) ? byRoleData : (byRoleData && Array.isArray(byRoleData.notifications) ? byRoleData.notifications : [])
						if (byRoleList && byRoleList.length) list = byRoleList
					}
				} catch (e) { /* ignore */ }
			}
			setNotifications(list || [])
		} catch (e) {
			console.error('Error loading notifications', e)
			setNotifications([])
		} finally {
			setNotifLoading(false)
		}
	}

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

				<div style={{ padding: '12px 14px' }}>
					<div style={{ display: 'flex', gap: 8 }}>
						<button
							onClick={async () => { setNotifOpen(true); await loadNotifications() }}
							title="Voir notifications"
							style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid #eef2f7', background: '#fff', cursor: 'pointer' }}
						>
							<span style={{ fontSize: 18 }}>🔔</span>
							<span style={{ fontWeight: 600 }}>Notifications</span>
							{unreadCount > 0 && <span style={{ marginLeft: 8, background: '#ef4444', color: '#fff', borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>{unreadCount}</span>}
						</button>
						<button
							onClick={() => setCreateOpen(true)}
							title="Créer notification"
							style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid #e6f0ff', background: '#fff', cursor: 'pointer' }}
						>
							<span style={{ fontSize: 18 }}>✉️</span>
							<span style={{ fontWeight: 600 }}>Créer</span>
						</button>
					</div>
				</div>
			</nav>

			{/* modal */}
			<Modal isOpen={notifOpen} title={`Notifications (${notifications.length})`} onCancel={() => setNotifOpen(false)} onConfirm={() => setNotifOpen(false)} confirmText="Fermer">
				{notifLoading && <div>Chargement des notifications…</div>}
				{!notifLoading && notifications.length === 0 && <div style={{ color: '#64748b' }}>Aucune notification</div>}
				{!notifLoading && notifications.length > 0 && (
					<div style={{ display: 'grid', gap: 8 }}>
						{notifications.map(n => (
							<div key={n._id || n.id} style={{ padding: 10, borderRadius: 8, background: n.estLue ? '#fafafa' : '#fff7ed', border: '1px solid #eef2f7' }}>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<div style={{ fontWeight: 700 }}>{n.titre || n.type || 'Notification'}</div>
									<div style={{ fontSize: 12, color: '#64748b' }}>{n.dateEnvoi ? new Date(n.dateEnvoi).toLocaleString() : (n.createdAt ? new Date(n.createdAt).toLocaleString() : '')}</div>
								</div>
								<div style={{ marginTop: 6 }}>{n.message || '-'}</div>
								<div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
									{!n.estLue && <button className="btn-ghost" onClick={async () => { try { const token = localStorage.getItem('basicAuth'); const headers = token ? { Authorization: `Basic ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }; const API = import.meta.env.VITE_API_URL; await axios.put(`${API}/api/notifications/${n._id || n.id}/read`, null, { headers }); setNotifications(prev => prev.map(x => x === n ? ({ ...x, estLue: true }) : x)); setUnreadCount(c => Math.max(0, c - 1)); } catch (e) { console.error(e) } }}>Marquer comme lu</button>}
								</div>
							</div>
						))}
					</div>
				)}
			</Modal>

			{/* Create notification modal */}
			<Modal isOpen={createOpen} title="Créer une notification" onCancel={() => setCreateOpen(false)} onConfirm={async () => {
					try {
						setCreateLoading(true)
						const token = localStorage.getItem('basicAuth')
						const headers = token ? { Authorization: `Basic ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
					let destinataireId = createForm.destinataire;
					if (typeof destinataireId === 'string') {
						const destRaw = (destinataireId || '').trim();
						destinataireId = destRaw.includes(',') ? destRaw.split(',').map(s => s.trim()).filter(Boolean) : (destRaw === '' ? [] : destRaw);
						if (Array.isArray(destinataireId) && destinataireId.length === 1) destinataireId = destinataireId[0];
					}
					if (Array.isArray(destinataireId)) {
						destinataireId = destinataireId.filter(Boolean);
						if (destinataireId.length === 1) destinataireId = destinataireId[0];
					}
					const payload = { type: createForm.type, titre: createForm.titre, message: createForm.message, sendEmail: !!createForm.sendEmail };
					if (destinataireId && (Array.isArray(destinataireId) ? destinataireId.length > 0 : destinataireId)) payload.destinataireId = destinataireId;
					if (createForm.tacheId) payload.data = { tacheId: createForm.tacheId };
						const API = import.meta.env.VITE_API_URL
						await axios.post(`${API}/api/notifications`, payload, { headers });
					setCreateOpen(false);
					setCreateForm({ destinataire: '', type: 'AFFECTATION', titre: '', message: '', tacheId: '', sendEmail: false });
					await loadNotifications();
				} catch (e) { console.error(e); alert('Erreur lors de la création de la notification'); } finally { setCreateLoading(false); }
			}} confirmText={createLoading ? 'Envoi…' : 'Envoyer'}>
				<div style={{ display: 'grid', gap: 8 }}>
					<label>Destinataire(s)</label>
					<div style={{ maxHeight: 120, overflowY: 'auto', border: '1px solid #eee', borderRadius: 4, padding: 4 }}>
						{users.map(user => (
							<label key={user._id || user.id} style={{ display: 'block', marginBottom: 4 }}>
								<input
									type="checkbox"
									value={user._id || user.id}
									checked={Array.isArray(createForm.destinataire) ? createForm.destinataire.includes(user._id || user.id) : false}
									onChange={e => {
										const val = user._id || user.id;
										setCreateForm(f => {
											let arr = Array.isArray(f.destinataire) ? [...f.destinataire] : [];
											if (e.target.checked) {
												if (!arr.includes(val)) arr.push(val);
											} else {
												arr = arr.filter(id => id !== val);
											}
											return { ...f, destinataire: arr };
										});
									}}
								/> {user.nom} {user.prenom}
							</label>
						))}
					</div>
					<label>Type</label>
					<select value={createForm.type} onChange={e => setCreateForm(f => ({ ...f, type: e.target.value }))}>
						<option value="AFFECTATION">AFFECTATION</option>
						<option value="MODIFICATION">MODIFICATION</option>
						<option value="DELEGATION">DELEGATION</option>
						<option value="RAPPEL">RAPPEL</option>
						<option value="VALIDATION">VALIDATION</option>
					</select>
					<label>Titre</label>
					<input value={createForm.titre} onChange={e => setCreateForm(f => ({ ...f, titre: e.target.value }))} />
					<label>Message</label>
					<textarea value={createForm.message} onChange={e => setCreateForm(f => ({ ...f, message: e.target.value }))} />
					<label>ID Tâche (optionnel)</label>
					<input value={createForm.tacheId} onChange={e => setCreateForm(f => ({ ...f, tacheId: e.target.value }))} placeholder="tacheId" />
					<label><input type="checkbox" checked={createForm.sendEmail} onChange={e => setCreateForm(f => ({ ...f, sendEmail: e.target.checked }))} /> Envoyer par e-mail</label>
				</div>
			</Modal>
		</div>
	);
};

export default Sidebar;