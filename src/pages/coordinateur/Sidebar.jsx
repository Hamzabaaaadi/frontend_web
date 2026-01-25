import React, { useEffect, useState } from "react";
import Select from 'react-select';
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
					const res = await fetch('http://localhost:5000/api/users/all', { method: 'GET', headers });
					if (!res.ok) return;
					const data = await res.json();
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
				const res = await fetch('http://localhost:5000/api/notifications', { method: 'GET', headers })
				if (!res.ok) return
				const data = await res.json().catch(() => null)
				let list = Array.isArray(data) ? data : (data && Array.isArray(data.notifications) ? data.notifications : [])
				if ((!list || list.length === 0)) {
					try {
						const meRes = await fetch('http://localhost:5000/api/users/me', { method: 'GET', headers })
						if (meRes.ok) {
							const meData = await meRes.json().catch(() => null)
							const userId = meData && (meData.user?._id || meData.user?.id || meData._id || meData.id)
							if (userId) {
								const byUser = await fetch(`http://localhost:5000/api/notifications?userId=${userId}`, { method: 'GET', headers })
								if (byUser.ok) {
									const byUserData = await byUser.json().catch(() => null)
									const byUserList = Array.isArray(byUserData) ? byUserData : (byUserData && Array.isArray(byUserData.notifications) ? byUserData.notifications : [])
									if (byUserList && byUserList.length) list = byUserList
								}
							}
						}
					} catch (e) { /* ignore */ }
				}
				if ((!list || list.length === 0)) {
					try {
						const byRole = await fetch('http://localhost:5000/api/notifications?role=coordinateur', { method: 'GET', headers })
						if (byRole.ok) {
							const byRoleData = await byRole.json().catch(() => null)
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
	const [createForm, setCreateForm] = useState({ destinataire: [], type: 'AFFECTATION', titre: '', message: '', tacheId: '', sendEmail: false })

	const loadNotifications = async () => {
		try {
			setNotifLoading(true)
			const token = localStorage.getItem('basicAuth')
			const headers = token ? { Authorization: `Basic ${token}` } : {}
			const res = await fetch('http://localhost:5000/api/notifications', { method: 'GET', headers })
			if (!res.ok) {
				setNotifications([])
				return
			}
			const data = await res.json().catch(() => null)
			let list = Array.isArray(data) ? data : (data && Array.isArray(data.notifications) ? data.notifications : [])
			if ((!list || list.length === 0)) {
				try {
					const meRes = await fetch('http://localhost:5000/api/users/me', { method: 'GET', headers })
					if (meRes.ok) {
						const meData = await meRes.json().catch(() => null)
						const userId = meData && (meData.user?._id || meData.user?.id || meData._id || meData.id)
						if (userId) {
							const byUser = await fetch(`http://localhost:5000/api/notifications?userId=${userId}`, { method: 'GET', headers })
							if (byUser.ok) {
								const byUserData = await byUser.json().catch(() => null)
								const byUserList = Array.isArray(byUserData) ? byUserData : (byUserData && Array.isArray(byUserData.notifications) ? byUserData.notifications : [])
								if (byUserList && byUserList.length) list = byUserList
							}
						}
					}
				} catch (e) { /* ignore */ }
			}
			if ((!list || list.length === 0)) {
				try {
					const byRole = await fetch('http://localhost:5000/api/notifications?role=coordinateur', { method: 'GET', headers })
					if (byRole.ok) {
						const byRoleData = await byRole.json().catch(() => null)
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
					<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
						<button
							onClick={async () => { setNotifOpen(true); await loadNotifications() }}
							title="Voir notifications"
							style={{
								display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 10,
								border: '1.5px solid #eef2f7', background: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 600,
								boxShadow: '0 1px 4px rgba(0,0,0,0.03)', transition: 'box-shadow 0.2s', marginBottom: 2
							}}
						>
							<span style={{ fontSize: 20 }}>🔔</span>
							<span style={{ flex: 1 }}>Notifications</span>
							{unreadCount > 0 && <span style={{ marginLeft: 8, background: '#ef4444', color: '#fff', borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>{unreadCount}</span>}
						</button>
						<button
							onClick={() => setCreateOpen(true)}
							title="Créer notification"
							style={{
								display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 10,
								border: '1.5px solid #e6f0ff', background: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 600,
								boxShadow: '0 1px 4px rgba(0,0,0,0.03)', transition: 'box-shadow 0.2s'
							}}
						>
							<span style={{ fontSize: 20 }}>✉️</span>
							<span style={{ flex: 1 }}>Créer</span>
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
									{!n.estLue && <button className="btn-ghost" onClick={async () => { try { const token = localStorage.getItem('basicAuth'); const headers = token ? { Authorization: `Basic ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }; await fetch(`http://localhost:5000/api/notifications/${n._id || n.id}/read`, { method: 'PUT', headers }); setNotifications(prev => prev.map(x => x === n ? ({ ...x, estLue: true }) : x)); setUnreadCount(c => Math.max(0, c - 1)); } catch (e) { console.error(e) } }}>Marquer comme lu</button>}
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
					let destinataireId = Array.isArray(createForm.destinataire) ? createForm.destinataire.filter(Boolean) : [];
					const payload = { type: createForm.type, titre: createForm.titre, message: createForm.message, sendEmail: !!createForm.sendEmail };
					if (destinataireId.length > 0) payload.destinataireId = destinataireId;
					if (createForm.tacheId) payload.data = { tacheId: createForm.tacheId };
					await fetch('http://localhost:5000/api/notifications', { method: 'POST', headers, body: JSON.stringify(payload) });
					setCreateOpen(false);
					setCreateForm({ destinataire: [], type: 'AFFECTATION', titre: '', message: '', tacheId: '', sendEmail: false });
					await loadNotifications();
				} catch (e) { console.error(e); alert('Erreur lors de la création de la notification'); } finally { setCreateLoading(false); }
			}} confirmText={createLoading ? 'Envoi…' : 'Envoyer'}>
				<div style={{ display: 'grid', gap: 8 }}>
					<label>Destinataire(s)</label>
					<Select
						isMulti
						options={users.map(user => ({ value: user._id || user.id, label: `${user.nom} ${user.prenom}` }))}
						value={users.filter(u => createForm.destinataire.includes(u._id || u.id)).map(u => ({ value: u._id || u.id, label: `${u.nom} ${u.prenom}` }))}
						onChange={selected => {
							setCreateForm(f => ({ ...f, destinataire: selected ? selected.map(opt => opt.value) : [] }));
						}}
						placeholder="Sélectionnez un ou plusieurs destinataires..."
						styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
					/>
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