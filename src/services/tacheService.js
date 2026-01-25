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
    const axios = (await import('axios')).default
    const API = import.meta.env.VITE_API_URL
    const res = await axios.get(`${API}/api/tasks`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    const data = res.data
    // Normalize to an array of tasks
    let list = []
    if (Array.isArray(data)) list = data
    else if (Array.isArray(data.taches)) list = data.taches
    else if (Array.isArray(data.tasks)) list = data.tasks
    else if (Array.isArray(data.data)) list = data.data
    else list = []

    return list.map(t => ({ _id: t._id || t.id, nom: t.nom || t.name || t.label || '' }))
  } catch (err) {
    // Fallback to mock data if API not available
    console.warn('tacheService.getTasks fallback to mock', err.message)
    return new Promise((resolve) => setTimeout(() => resolve(
      mockTasks.map(t => ({ _id: t.id, nom: t.nom }))
    ), 300))
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
    const axios = (await import('axios')).default
    const API = import.meta.env.VITE_API_URL
    const res = await axios.get(`${API}/api/tasks/${id}`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    const data = res.data
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
    const axios = (await import('axios')).default
    const API = import.meta.env.VITE_API_URL
    const r = await axios.post(`${API}/api/tasks/${id}/complete`, null, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    return r.data
  } catch (err) {
    console.warn('tacheService.completeTask fallback', err.message)
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 300))
  }
}
