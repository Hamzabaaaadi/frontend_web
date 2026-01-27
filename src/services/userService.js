import axios from 'axios'

const API = import.meta.env.VITE_API_URL

const mockAuditeurs = [
  { id: 'u12', nom: 'Ali', prenom: 'Ben', email: 'ali@example.com', specialty: 'Auditeur pédagogique', grade: 'A' },
  { id: 'u22', nom: 'Sara', prenom: 'El', email: 'sara@example.com', specialty: 'Auditeur administratif', grade: 'B' },
  { id: 'u33', nom: 'Khadija', prenom: 'Omar', email: 'khadija@example.com', specialty: 'Auditeur financier', grade: 'C' }
]

function authHeaders() {
  try {
    const basic = localStorage.getItem('basicAuth')
    return basic ? { Authorization: `Basic ${basic}` } : {}
  } catch {
    return {}
  }
}

function normalizeAuditeur(u) {
  const prenom = u.prenom || ''
  const nom = u.nom || ''

  return {
    id: u._id,
    prenom,
    nom,
    name: `${prenom} ${nom}`.trim(),
    email: u.email || '',
    specialty: u.role || 'AUDITEUR',
    grade: u.grade || '',
    estActif: u.estActif ?? true,
    dateCreation: u.dateCreation || ''
  }
}

export async function getAuditeurs() {
  try {
    const res = await axios.get(`${API}/api/users/auditeurs`, { headers: { ...authHeaders() } })
    const data = res.data
    const auditeurs = Array.isArray(data.auditeurs) ? data.auditeurs : (Array.isArray(data) ? data : [])
    return auditeurs.map(normalizeAuditeur)

  } catch (err) {
    console.warn('getAuditeurs → fallback mock', err.message)

    return new Promise(resolve =>
      setTimeout(() => resolve(
        mockAuditeurs.map(u => ({
          id: u.id,
          prenom: u.prenom,
          nom: u.nom,
          name: `${u.prenom} ${u.nom}`,
          email: u.email,
          specialty: u.specialty,
          grade: u.grade,
          estActif: true
        }))
      ), 200)
    )
  }
}

export default { getAuditeurs }
