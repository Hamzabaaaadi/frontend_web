const mockAuditeurs = [
  { id: 'u12', nom: 'Ali', prenom: 'Ben', email: 'ali@example.com', specialty: 'Auditeur pédagogique', grade: 'A' },
  { id: 'u22', nom: 'Sara', prenom: 'El', email: 'sara@example.com', specialty: 'Auditeur administratif', grade: 'B' },
  { id: 'u33', nom: 'Khadija', prenom: 'Omar', email: 'khadija@example.com', specialty: 'Auditeur financier', grade: 'C' }
]

export async function getAuditeurs() {
  function authHeaders() {
    try {
      const basic = localStorage.getItem('basicAuth')
      return basic ? { Authorization: `Basic ${basic}` } : {}
    } catch (e) {
      return {}
    }
  }

  try {
    // primary endpoint returns auditeur records (may contain only _id and userId)
    const res = await fetch('http://localhost:5000/api/auditeurs', { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    if (!res.ok) throw new Error('Network response was not ok')
    const data = await res.json()
    const arr = Array.isArray(data) ? data : (data && Array.isArray(data.auditeurs) ? data.auditeurs : (data && Array.isArray(data.users) ? data.users : []))

    // For any auditeur lacking a display name, try to fetch the user by userId
    const normalized = await Promise.all(arr.map(async (u) => {
      const id = u._id || u.id || u.userId || ''
      const userId = u.userId || (u.user && (u.user._id || u.user.id)) || ''
      const prenom = u.prenom || u.firstName || ''
      const nom = u.nom || u.lastName || u.name || ''
      let name = u.name || ((prenom || nom) ? `${prenom} ${nom}`.trim() : '')
      // if we still don't have a name, try GET /api/users/:userId
      if ((!name || name.trim() === '') && userId) {
        try {
          const r = await fetch(`http://localhost:5000/api/users/${userId}`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
          if (r.ok) {
            const ud = await r.json()
            const fn = ud.prenom || ud.firstName || ud.firstname || ''
            const ln = ud.nom || ud.lastName || ud.lastname || ud.name || ''
            name = ud.name || `${fn} ${ln}`.trim()
          }
        } catch (e) {
          // ignore per-user fetch errors
        }
      }

      return {
        id: String(id || userId || ''),
        userId: userId || id || '',
        prenom,
        nom,
        name: name || '',
        specialty: u.specialite || u.specialty || u.poste || '',
        grade: u.grade || u.level || '',
        email: u.email || ''
      }
    }))

    // return array of normalized auditeurs
    return normalized
  } catch (err) {
    console.warn('userService.getAuditeurs fallback to mock', err.message)
    return new Promise((resolve) => setTimeout(() => resolve(
      mockAuditeurs.map(u => ({ id: u.id, name: `${u.prenom} ${u.nom}`, prenom: u.prenom, nom: u.nom, specialty: u.specialty, grade: u.grade, email: u.email }))
    ), 200))
  }
}

export default { getAuditeurs }
