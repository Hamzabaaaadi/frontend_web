const mockAuditeurs = [
  { id: 'u12', nom: 'Ali', prenom: 'Ben', email: 'ali@example.com' },
  { id: 'u22', nom: 'Sara', prenom: 'El', email: 'sara@example.com' },
  { id: 'u33', nom: 'Khadija', prenom: 'Omar', email: 'khadija@example.com' }
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
    const res = await fetch('http://localhost:5000/api/users?role=AUDITEUR', { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    if (!res.ok) throw new Error('Network response was not ok')
    return await res.json()
  } catch (err) {
    console.warn('userService.getAuditeurs fallback to mock', err.message)
    return new Promise((resolve) => setTimeout(() => resolve(mockAuditeurs), 200))
  }
}

export default { getAuditeurs }
