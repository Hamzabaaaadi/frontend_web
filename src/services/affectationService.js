const simulate = (result, delay = 300) => new Promise((res) => setTimeout(() => res(result), delay))

function authHeaders() {
  try {
    const basic = localStorage.getItem('basicAuth')
    return basic ? { Authorization: `Basic ${basic}` } : {}
  } catch (e) {
    return {}
  }
}

import axios from 'axios'
const API = import.meta.env.VITE_API_URL

export async function acceptAffectation(affectationId) {
  try {
    const headers = { ...authHeaders() }
    // do not set Content-Type when no body is sent (some servers reject a JSON content-type with empty body)
    const res = await axios.put(`${API}/api/affectations/${affectationId}/accept`, null, { headers })
    return res.data
  } catch (err) {
    console.error('affectationService.accept error', err.response?.status, err.response?.data || err.message)
    throw err
  }
}

export async function refuseAffectation(affectationId, motif = '') {
  try {
    const headers = { 'Content-Type': 'application/json', ...authHeaders() }
    const res = await axios.put(`${API}/api/affectations/${affectationId}/refuse`, { motif }, { headers })
    return res.data
  } catch (err) {
    console.error('affectationService.refuse error', err.response?.status, err.response?.data || err.message)
    throw err
  }
}

export async function delegateAffectation(affectationId, delegatorId, auditeurId) {
  try {
    const res = await axios.post(`${API}/api/affectations/${affectationId}/delegate`, { delegatorId, auditeurId }, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    return res.data
  } catch (err) {
    console.warn('affectationService.delegate fallback', err.message)
    return simulate({ success: true, id: affectationId, from: delegatorId, to: auditeurId })
  }
}

export async function createDelegation(payload) {
  try {
    const res = await axios.post(`${API}/api/delegations/create`, payload, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    return res.data
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
    const res = await axios.get(`${API}/api/affectations/me`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    return res.data
  } catch (err) {
    console.warn('affectationService.getAffectations fallback', err.message);
    return simulate([]);
  }
}
export async function getAllAffectations() {
  try {
    const res = await axios.get(`${API}/api/affectations`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    return res.data
  } catch (err) {
    console.warn('affectationService.getAffectations fallback', err.message);
    return simulate([]);
  }
}

export async function validateAffectation(affectationId) {
  try {
    const res = await axios.post(`${API}/api/affectations/${affectationId}/validate`, null, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    return res.data
  } catch (err) {
    console.warn('affectationService.validate fallback', err.message)
    return simulate({ success: true, id: affectationId })
  }
}

export async function getDelegations() {
  try {
    const res = await axios.get(`${API}/api/delegations/me`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    const data = res.data
    return normalizeArray(data)
  } catch (err) {
    console.warn('affectationService.getDelegations fallback', err.message)
    return simulate(mockDelegations)
  }
}

// get delegations proposed by the currently connected auditeur (propres)
export async function getMyDelegationsPropres() {
  try {
    const res = await axios.get(`${API}/api/delegations/me/propres`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    const data = res.data
    return normalizeArray(data)
  } catch (err) {
    console.warn('affectationService.getMyDelegationsPropres fallback', err.message)
    // fallback to same mock list
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
    const res = await axios.put(`${API}/api/delegations/${delegationId}/accepter`, null, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    return res.data
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
    const res = await axios.put(`${API}/api/delegations/${delegationId}/refuser`, null, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    return res.data
  } catch (err) {
    console.warn('affectationService.refuseDelegation fallback', err.message)
    const idx = mockDelegations.findIndex(d => d.id === delegationId)
    if (idx === -1) return simulate(null)
    mockDelegations[idx].statut = 'REFUSEE'
    mockDelegations[idx].dateReponse = new Date().toISOString().split('T')[0]
    return simulate(mockDelegations[idx])
  }
}

export async function deleteDelegation(delegationId) {
  const headers = { 'Content-Type': 'application/json', ...authHeaders() }
  try {
    const res = await axios.delete(`${API}/api/delegations/${delegationId}`, { headers })
    if (res.status === 204) return { success: true, id: delegationId }
    return res.data || { success: true, id: delegationId }
  } catch (err) {
    console.warn('affectationService.deleteDelegation fallback', err.message)
    const idx = mockDelegations.findIndex(d => d.id === delegationId)
    if (idx !== -1) mockDelegations.splice(idx, 1)
    return simulate({ success: true, id: delegationId })
  }
}

export async function modifyDelegation(delegationId, payload) {
  try {
    const res = await axios.put(`${API}/api/delegations/${delegationId}/modifier`, payload, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    return res.data
  } catch (err) {
    console.warn('affectationService.modifyDelegation fallback', err.message)
    const idx = mockDelegations.findIndex(d => d.id === delegationId)
    if (idx !== -1) mockDelegations[idx] = { ...mockDelegations[idx], ...payload }
    return simulate(mockDelegations[idx] || null)
  }
}

export async function deleteAffectation(affectationId) {
  try {
    const res = await axios.delete(`${API}/api/affectations/${affectationId}`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    return res.data
  } catch (err) {
    console.warn('affectationService.deleteAffectation fallback', err.message);
    return simulate({ success: true, id: affectationId });
  }
}

export async function updateAffectation(affectationId, payload) {
  try {
    const res = await axios.put(`${API}/api/affectations/${affectationId}`, payload, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    return res.data || { success: true, id: affectationId }
  } catch (err) {
    console.warn('affectationService.updateAffectation fallback', err.message)
    // update local mock if present
    const idx = mockAffectations.findIndex(a => a.id === affectationId || a._id === affectationId)
    if (idx !== -1) mockAffectations[idx] = { ...mockAffectations[idx], ...payload }
    return simulate({ success: true, id: affectationId })
  }
}

export async function validateAffectationStatus(affectationId) {
  try {
    const res = await axios.post(`${API}/api/tasks/affectation/${affectationId}/validate`, null, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    return res.data
  } catch (err) {
    console.warn('affectationService.validateAffectationStatus fallback', err.message);
    return simulate({ success: true, id: affectationId });
  }
}

export async function rejectAffectationStatus(affectationId) {
  try {
    const res = await axios.post(`${API}/api/tasks/affectation/${affectationId}/reject`, null, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    return res.data
  } catch (err) {
    console.warn('affectationService.rejectAffectationStatus fallback', err.message);
    return simulate({ success: true, id: affectationId });
  }
}

// named functions are already exported where they are declared
