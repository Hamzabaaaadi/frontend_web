const simulate = (result, delay = 300) => new Promise((res) => setTimeout(() => res(result), delay))

function authHeaders() {
  try {
    const basic = localStorage.getItem('basicAuth')
    return basic ? { Authorization: `Basic ${basic}` } : {}
  } catch (e) {
    return {}
  }
}

export async function acceptAffectation(affectationId) {
  try {
    const res = await fetch(`http://localhost:5000/api/affectations/${affectationId}/accept`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    if (!res.ok) throw new Error('Network error')
    return await res.json()
  } catch (err) {
    console.warn('affectationService.accept fallback', err.message)
    return simulate({ success: true, id: affectationId })
  }
}

export async function refuseAffectation(affectationId, motif = '') {
  try {
    const res = await fetch(`http://localhost:5000/api/affectations/${affectationId}/refuse`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ motif })
    })
    if (!res.ok) throw new Error('Network error')
    return await res.json()
  } catch (err) {
    console.warn('affectationService.refuse fallback', err.message)
    return simulate({ success: true, id: affectationId })
  }
}

export async function delegateAffectation(affectationId, delegatorId, auditeurId) {
  try {
    const res = await fetch(`http://localhost:5000/api/affectations/${affectationId}/delegate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ delegatorId, auditeurId })
    })
    if (!res.ok) throw new Error('Network error')
    return await res.json()
  } catch (err) {
    console.warn('affectationService.delegate fallback', err.message)
    return simulate({ success: true, id: affectationId, from: delegatorId, to: auditeurId })
  }
}

export async function createDelegation(payload) {
  try {
    const res = await fetch(`http://localhost:5000/api/delegations/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error('Network error')
    return await res.json()
  } catch (err) {
    console.warn('affectationService.createDelegation fallback', err.message)
    const now = new Date().toISOString().split('T')[0]
    const item = {
      id: `d_${Math.random().toString(36).slice(2,9)}`,
      affectationOriginale: payload.affectationOriginale,
      auditeurInitial: payload.auditeurInitial,
      auditeurPropose: payload.auditeurPropose,
      justification: payload.justification || null,
      statut: payload.statut || 'EN_ATTENTE',
      dateProposition: now,
      dateReponse: null
    }
    mockDelegations.push(item)
    return simulate(item)
  }
}

export default { acceptAffectation, refuseAffectation, delegateAffectation }

// --- affectations listing + validation ---
const mockAffectations = [
  {
    id: 'a1',
    tacheId: 't1',
    auditeurId: 'u12',
    mode: 'MANUEL',
    dateAffectation: '2026-01-05',
    statut: 'EN_ATTENTE',
    justificatifRefus: null,
    rapportAlgorithme: null,
    estValidee: false,
    dateReponse: null,
    delaiReponse: '2026-01-10'
  },
  {
    id: 'a2',
    tacheId: 't2',
    auditeurId: 'u22',
    mode: 'SEMI_AUTOMATISE',
    dateAffectation: '2026-01-03',
    statut: 'ACCEPTEE',
    justificatifRefus: null,
    rapportAlgorithme: 'score:0.87',
    estValidee: true,
    dateReponse: '2026-01-04',
    delaiReponse: '2026-01-08'
  }
]

// simple in-memory mock storage for delegations
const mockDelegations = [
  {
    id: 'd_example1',
    affectationOriginale: 'a1',
    auditeurInitial: 'u12',
    auditeurPropose: 'u45',
    justification: 'Indisponibilité le 2026-01-12',
    statut: 'EN_ATTENTE',
    dateProposition: '2026-01-06',
    dateReponse: null
  }
]

export async function getAffectations() {
  try {
    const res = await fetch('http://localhost:5000/api/affectations/me', { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    if (!res.ok) throw new Error('Network response was not ok')
    const data = await res.json()
    return normalizeArray(data)
  } catch (err) {
    console.warn('affectationService.getAffectations fallback to mock', err.message)
    return simulate(mockAffectations)
  }
}

export async function validateAffectation(affectationId) {
  try {
    const res = await fetch(`http://localhost:5000/api/affectations/${affectationId}/validate`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    if (!res.ok) throw new Error('Network error')
    return await res.json()
  } catch (err) {
    console.warn('affectationService.validate fallback', err.message)
    return simulate({ success: true, id: affectationId })
  }
}

export async function getDelegations() {
  try {
    const res = await fetch('http://localhost:5000/api/delegations/me', { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    if (!res.ok) throw new Error('Network response was not ok')
    const data = await res.json()
    return normalizeArray(data)
  } catch (err) {
    console.warn('affectationService.getDelegations fallback', err.message)
    return simulate(mockDelegations)
  }
}

function normalizeArray(data) {
  console.log("data received 1: ", data.delegations);
  if (!data) return []
  if (Array.isArray(data)) return data
  if (data.affectations && Array.isArray(data.affectations)) return data.affectations
  if (data.delegations && Array.isArray(data.delegations)) return data.delegations 
  if (data.data && Array.isArray(data.data)) return data.data
  if (typeof data === 'object') {
    for (const k of Object.keys(data)) {
      if (Array.isArray(data[k])) return data[k]
    }
  }
  return []
}

export async function acceptDelegation(delegationId) {
  try {
    const res = await fetch(`http://localhost:5000/api/delegations/${delegationId}/accepter`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    if (!res.ok) throw new Error('Network error')
    return await res.json()
  } catch (err) {
    console.warn('affectationService.acceptDelegation fallback', err.message)
    const idx = mockDelegations.findIndex(d => d.id === delegationId)
    if (idx === -1) return simulate(null)
    mockDelegations[idx].statut = 'ACCEPTEE'
    mockDelegations[idx].dateReponse = new Date().toISOString().split('T')[0]
    // perform the actual affectation transfer locally
    const d = mockDelegations[idx]
    await delegateAffectation(d.affectationOriginale, d.auditeurInitial, d.auditeurPropose)
    return simulate(mockDelegations[idx])
  }
}

export async function refuseDelegation(delegationId) {
  try {
    const res = await fetch(`http://localhost:5000/api/delegations/${delegationId}/refuser`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    if (!res.ok) throw new Error('Network error')
    return await res.json()
  } catch (err) {
    console.warn('affectationService.refuseDelegation fallback', err.message)
    const idx = mockDelegations.findIndex(d => d.id === delegationId)
    if (idx === -1) return simulate(null)
    mockDelegations[idx].statut = 'REFUSEE'
    mockDelegations[idx].dateReponse = new Date().toISOString().split('T')[0]
    return simulate(mockDelegations[idx])
  }
}

// named functions are already exported where they are declared
