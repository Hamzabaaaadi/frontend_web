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
  try {
    const res = await fetch('/api/taches')
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
  try {
    const res = await fetch(`/api/taches/${id}`)
    if (!res.ok) throw new Error('Network response was not ok')
    return await res.json()
  } catch (err) {
    console.warn('tacheService.getTaskById fallback to mock', err.message)
    return new Promise((resolve) => setTimeout(() => resolve(mockTasks.find((t) => t.id === id) || null), 300))
  }
}
