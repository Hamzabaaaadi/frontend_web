import React, { useEffect, useState } from 'react'
import { getAffectations } from '../../services/affectationService'

export default function Tasks() {
	const [affectations, setAffectations] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let mounted = true
		getAffectations()
			.then(r => {
				if (!mounted) return
				const list = Array.isArray(r) ? r : (r && Array.isArray(r.affectations) ? r.affectations : (r && Array.isArray(r.data) ? r.data : []))
				setAffectations(list)
			})
			.catch(() => { if (mounted) setAffectations([]) })
			.finally(() => { if (mounted) setLoading(false) })

		return () => { mounted = false }
	}, [])

	if (loading) return <div>Chargement des tâches…</div>

	return (
		<div>
			<h2>Mes affectations</h2>
			{affectations.length === 0 ? (
				<div>Aucune affectation trouvée.</div>
			) : (
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead>
						<tr>
							<th style={{ textAlign: 'left', padding: 8 }}>Tâche</th>
							<th style={{ textAlign: 'left', padding: 8 }}>Date</th>
							<th style={{ textAlign: 'left', padding: 8 }}>Statut</th>
							<th style={{ textAlign: 'left', padding: 8 }}>Mode</th>
						</tr>
					</thead>
					<tbody>
						{affectations.map(a => (
							<tr key={a._id || a.id} style={{ borderTop: '1px solid #eee' }}>
								<td style={{ padding: 8 }}>{a?.tacheId?.nom || a.tache || '-'}</td>
								<td style={{ padding: 8 }}>{a.dateAffectation ? new Date(a.dateAffectation).toLocaleString() : '-'}</td>
								<td style={{ padding: 8 }}>{a.statut || '-'}</td>
								<td style={{ padding: 8 }}>{a.mode || '-'}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	)
}