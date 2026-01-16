const mockTasks = [
  {
    id: 't1',
    nom: 'Evaluation formation',
    date: '2026-01-12',
    statut: 'EN_ATTENTE',
    description: 'Evaluation des participants de la formation X, durée 4h, lieu: Rabat.'
  },
   {
    id: 't',
    nom: 'Evaluation formation',
    date: '2026-01-12',
    statut: 'EN_ATTENTE',
    description: 'Evaluation des participants de la formation X, durée 4h, lieu: Rabat.'
  },
   {
    id: 't1',
    nom: 'Evaluation formation',
    date: '2026-01-12',
    statut: 'EN_ATTENTE',
    description: 'Evaluation des participants de la formation X, durée 4h, lieu: Rabat.'
  },
  {
    id: 't2',
    nom: 'Jury examen',
    date: '2026-01-20',
    statut: 'AFFECTEE',
    description: "Participation au jury d'examen, préparation des rapports et notation."
  }
]

export async function getTasks() {
  function authHeaders() {
    try {
      const basic = localStorage.getItem('basicAuth')
      return basic ? { Authorization: `Basic ${basic}` } : {}
    } catch (e) {
      return {}
    }
  }

  try {
    const res = await fetch('http://localhost:5000/api/taches', { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    if (!res.ok) throw new Error('Network response was not ok')
    const data = await res.json()
    return data
  } catch (err) {
    // Fallback to mock data if API not available
    console.warn('tacheService.getTasks fallback to mock', err.message)
    return new Promise((resolve) => setTimeout(() => resolve(mockTasks), 300))
  }
}

export default { getTasks }

export async function getTaskById(id) {
  function authHeaders() {
    try {
      const basic = localStorage.getItem('basicAuth')
      return basic ? { Authorization: `Basic ${basic}` } : {}
    } catch (e) {
      return {}
    }
  }

  try {
    const res = await fetch(`http://localhost:5000/api/tasks/${id}`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    if (!res.ok) throw new Error('Network response was not ok')
    const data = await res.json()
    return data
  
  } catch (err) {
    console.warn('tacheService.getTaskById fallback to mock', err.message)
    return new Promise((resolve) => setTimeout(() => resolve(mockTasks.find((t) => t.id === id) || null), 300))
  }
}

export async function completeTask(id) {
  function authHeaders() {
    try {
      const basic = localStorage.getItem('basicAuth')
      return basic ? { Authorization: `Basic ${basic}` } : {}
    } catch (e) {
      return {}
    }
  }

  try {
    const res = await fetch(`http://localhost:5000/api/tasks/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() }
    })
    if (!res.ok) {
      const text = await res.text().catch(() => null)
      throw new Error(text || 'Network response was not ok')
    }
    return await res.json()
  } catch (err) {
    console.warn('tacheService.completeTask fallback', err.message)
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 300))
  }
}
