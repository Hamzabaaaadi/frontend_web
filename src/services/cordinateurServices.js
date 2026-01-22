// Services used by the coordinateur pages (TasksAssignment)
// Provides endpoints for tasks, affectations and suggestions.

function authHeaders() {
  try {
    const basic = localStorage.getItem('basicAuth')
    return basic ? { Authorization: `Basic ${basic}` } : {}
  } catch (e) {
    return {}
  }
}

// Robust id extractor: accept primitives or objects and return a clean string id or empty string
function extractId(raw) {
  if (raw === null || typeof raw === 'undefined') return ''
  if (typeof raw === 'string' || typeof raw === 'number') {
    const s = String(raw).trim()
    return s === '' ? '' : s
  }
  if (typeof raw === 'object') {
    // Common nested forms: { $oid: '...' }, { _id: '...' } or Mongoose ObjectId-like
    if (raw.$oid) return String(raw.$oid)
    if (raw.$id) return String(raw.$id)
    if (raw._id) return extractId(raw._id)
    if (raw.id) return extractId(raw.id)
    if (raw.auditeurId) return extractId(raw.auditeurId)
    if (raw.auditorId) return extractId(raw.auditorId)
    if (raw.userId) return extractId(raw.userId)
    try {
      const s = raw.toString()
      if (s && s !== '[object Object]') return s
    } catch (e) {}
  }
  return ''
}

const mockTasks = [
  {
    id: 't1',
    name: 'Formation méthodologique audit',
    description: 'Formation sur les méthodologies d\'audit pédagogique',
    type: 'Formation',
    specialties: ['Pédagogique'],
    startDate: '2026-12-15',
    endDate: '2026-12-15',
    grades: ['A', 'B'],
    slots: 3,
    paid: true,
    mode: 'Manuel',
    affectations: [],
  }
]

const mockAffectations = [
  {
    id: 'a1',
    tacheId: 't1',
    auditeurId: 'u12',
    statut: 'EN_ATTENTE',
    dateAffectation: '2026-01-07T09:00:00Z'
  }
]

export async function getTasks() {
  try {
    const r = await fetch('http://localhost:5000/api/tasks', { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    if (!r.ok) throw new Error('Network')
    return await r.json()
  } catch (err) {
    console.warn('cordinateurServices.getTasks fallback', err.message)
    return new Promise((res) => setTimeout(() => res(mockTasks), 250))
  }
}

export async function getTaskById(id) {
  try {
    const r = await fetch(`http://localhost:5000/api/tasks/${id}`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    if (!r.ok) throw new Error('Network')
    return await r.json()
  } catch (err) {
    console.warn('cordinateurServices.getTaskById fallback', err.message)
    return new Promise((res) => setTimeout(() => res(mockTasks.find(t => t.id === id) || null), 200))
  }
}

export async function createTask(payload) {
  try {
    // normalize enum-like fields to match backend expectations
    const payloadNormalized = { ...payload }
    if (payloadNormalized.direction && typeof payloadNormalized.direction === 'string') {
      const key = payloadNormalized.direction.toString().toUpperCase().replace(/\s+/g, '_')
      // Map common UI labels like DIRECTION_1 / Direction 2 to backend enums
      if (key.startsWith('DIRECTION')) {
        const m = key.match(/DIRECTION[_ ]?(\d+)/)
        const n = m ? m[1] : null
        if (n === '1') payloadNormalized.direction = 'RABAT_CASA'
        else if (n === '2') payloadNormalized.direction = 'MEKNES_ERRACHIDIA'
        else if (n === '3') payloadNormalized.direction = 'MARRAKECH_AGADIR'
        else payloadNormalized.direction = 'RABAT_CASA'
      } else {
        // if already one of the backend enums, keep it; otherwise default
        const allowed = ['RABAT_CASA','MEKNES_ERRACHIDIA','MARRAKECH_AGADIR']
        if (allowed.includes(key)) payloadNormalized.direction = key
        else payloadNormalized.direction = 'RABAT_CASA'
      }
    }
    console.debug('cordinateurServices.createTask payload', payloadNormalized)
    const r = await fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payloadNormalized)
    })
    if (!r.ok) {
      let body = null
      try { body = await r.text() } catch (e) {}
      console.error('createTask HTTP error', r.status, body)
      throw new Error('Network')
    }
    return await r.json()
  } catch (err) {
    console.warn('cordinateurServices.createTask fallback', err.message)
    const item = { ...payload, id: `t_${Math.random().toString(36).slice(2,9)}` }
    mockTasks.push(item)
    return new Promise((res) => setTimeout(() => res(item), 200))
  }
}

export async function updateTask(id, payload) {
  try {
    // normalize enum-like fields similar to createTask
    const payloadNormalized = { ...payload }
    if (payloadNormalized.direction && typeof payloadNormalized.direction === 'string') {
      const key = payloadNormalized.direction.toString().toUpperCase().replace(/\s+/g, '_')
      if (key.startsWith('DIRECTION')) {
        const m = key.match(/DIRECTION[_ ]?(\d+)/)
        const n = m ? m[1] : null
        if (n === '1') payloadNormalized.direction = 'RABAT_CASA'
        else if (n === '2') payloadNormalized.direction = 'MEKNES_ERRACHIDIA'
        else if (n === '3') payloadNormalized.direction = 'MARRAKECH_AGADIR'
        else payloadNormalized.direction = 'RABAT_CASA'
      } else {
        const allowed = ['RABAT_CASA','MEKNES_ERRACHIDIA','MARRAKECH_AGADIR']
        if (allowed.includes(key)) payloadNormalized.direction = key
        else payloadNormalized.direction = 'RABAT_CASA'
      }
    }
    const r = await fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payloadNormalized)
    })
    if (!r.ok) {
      let body = null
      try { body = await r.text() } catch (e) {}
      console.error('updateTask HTTP error', r.status, body)
      throw new Error('Network')
    }
    return await r.json()
  } catch (err) {
    console.warn('cordinateurServices.updateTask fallback', err.message)
    const idx = mockTasks.findIndex(t => t.id === id)
    if (idx !== -1) mockTasks[idx] = { ...mockTasks[idx], ...payload }
    return new Promise((res) => setTimeout(() => res(mockTasks[idx] || null), 200))
  }
}

export async function deleteTask(id) {
  try {
    const r = await fetch(`http://localhost:5000/api/tasks/${id}`, { method: 'DELETE', headers: { ...authHeaders() } })
    if (!r.ok) {
      let body = null
      try { body = await r.text() } catch (e) {}
      console.error('deleteTask HTTP error', r.status, body)
      throw new Error('Network')
    }
    return true
  } catch (err) {
    console.warn('cordinateurServices.deleteTask fallback', err.message)
    const idx = mockTasks.findIndex(t => t.id === id)
    if (idx !== -1) mockTasks.splice(idx, 1)
    return new Promise((res) => setTimeout(() => res(true), 150))
  }
}

export async function getAffectations() {
  try {
    const r = await fetch('http://localhost:5000/api/affectations/me', { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    if (!r.ok) throw new Error('Network')
    return await r.json()
  } catch (err) {
    console.warn('cordinateurServices.getAffectations fallback', err.message)
    return new Promise((res) => setTimeout(() => res(mockAffectations), 200))
  }
}

export async function getAuditeurs() {
  try {
    const r = await fetch('http://localhost:5000/api/auditeurs', { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    if (!r.ok) throw new Error('Network')
    const data = await r.json()
    const arr = Array.isArray(data) ? data : (data && Array.isArray(data.auditeurs) ? data.auditeurs : (data && Array.isArray(data.users) ? data.users : []))
    // normalize similar to userService
    return arr.map(u => ({
      id: String(u._id || u.id || u.userId || ''),
      userId: u.userId || (u.user && (u.user._id || u.user.id)) || '',
      prenom: u.prenom || u.firstName || '',
      nom: u.nom || u.lastName || u.name || '',
      name: u.name || ((u.prenom || u.nom) ? `${u.prenom || ''} ${u.nom || ''}`.trim() : ''),
      specialty: u.specialite || u.specialty || '',
      grade: u.grade || u.level || '',
      email: u.email || ''
    }))
  } catch (err) {
    console.warn('cordinateurServices.getAuditeurs fallback', err.message)
    return []
  }
}

export async function getSemiAutoProposals(taskId) {
  try {
    const url = `http://localhost:5000/api/semiauto/propose/${taskId}`
    console.debug('[cordinateurServices] GET', url)

    const r = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      }
    })

    if (!r.ok) {
      const text = await r.text()
      console.error('[cordinateurServices] HTTP error', r.status, text)
      return null
    }

    const data = await r.json()
    console.debug('[cordinateurServices] response', data)

    // Normalize response into an array of candidates
    let candidates = []
    // support multiple shapes: array, { candidats: [...] }, { rapport: { candidats: [...] } }, or single object
    if (Array.isArray(data)) candidates = data
    else if (data && Array.isArray(data.candidats)) candidates = data.candidats
    else if (data && data.rapport && Array.isArray(data.rapport.candidats)) candidates = data.rapport.candidats
    else if (data && Array.isArray(data.candidates)) candidates = data.candidates
    else if (data && Array.isArray(data.auditeurs)) candidates = data.auditeurs
    else if (data && data.rapport && Array.isArray(data.rapport.auditeurs)) candidates = data.rapport.auditeurs
    else if (data && data.candidats && !Array.isArray(data.candidats)) candidates = [data.candidats]
    else if (data && data.rapport && data.rapport.candidats && !Array.isArray(data.rapport.candidats)) candidates = [data.rapport.candidats]
    else if (data && data.candidates && !Array.isArray(data.candidates)) candidates = [data.candidates]
    else if (data && data.auditeurs && !Array.isArray(data.auditeurs)) candidates = [data.auditeurs]
    else if (data && data.rapport && data.rapport.auditeurs && !Array.isArray(data.rapport.auditeurs)) candidates = [data.rapport.auditeurs]
    else if (data && (data.auditeurId || data.auditeur || data.prenom || data.nom)) candidates = [data]

    const normalized = (candidates || []).map((c) => {
      const aud = c && (c.auditeur || c.auditor) ? (c.auditeur || c.auditor) : c
      // Prefer an id present on the candidate root (c.auditeurId / c.auditorId) before inspecting nested object
      const auditeurId = extractId(c?.auditeurId || c?.auditorId || aud?.auditeurId || aud?.auditorId || aud?._id || aud?.id || aud?.userId || aud)
      const prenom = aud?.prenom || aud?.firstName || ''
      const nom = aud?.nom || aud?.lastName || aud?.name || ''
      const name = aud?.name || `${prenom} ${nom}`.trim()
      const rawScore = typeof c?.score !== 'undefined' ? Number(c.score) : (typeof aud?.score !== 'undefined' ? Number(aud.score) : null)
      const score = rawScore === null || Number.isNaN(rawScore) ? null : rawScore
      const scorePercent = score !== null ? (score <= 1 ? Math.round(score * 100) : Math.round(score)) : null
      return {
        id: auditeurId,
        auditeurId,
        prenom,
        nom,
        name,
        email: aud?.email || '',
        specialty: aud?.specialite || aud?.specialty || '',
        grade: aud?.grade || '',
        score,
        scorePercent,
        raw: c
      }
    }).filter(item => !!item.auditeurId)

    return normalized

  } catch (err) {
    console.error('cordinateurServices.getSemiAutoProposals failed', err)
    // Fallback: si l'endpoint semiauto n'est pas disponible, essayer l'endpoint IA
    try {
      console.debug('[cordinateurServices] fallback to IA proposer')
      const auto = await getAutoProposals(taskId)
      return auto
    } catch (e) {
      console.error('fallback to getAutoProposals failed', e)
      return null
    }
  }
}

// Appelle l'endpoint IA qui propose des candidats pour une tâche.
// Body: { tacheId }
export async function getAutoProposals(taskId) {
  try {
    const url = `http://localhost:5000/api/affectations/proposer-ia`
    console.debug('[cordinateurServices] POST', url, { tacheId: taskId })

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ tacheId: taskId })
    })

    if (!r.ok) {
      const text = await r.text()
      console.error('[cordinateurServices] IA proposer HTTP error', r.status, text)
      return null
    }

    const data = await r.json()
    console.debug('[cordinateurServices] IA proposer response', data)

    // Extract candidates and normalize same as semi-auto
    let candidates = []
    if (Array.isArray(data)) candidates = data
    else if (data && Array.isArray(data.candidats)) candidates = data.candidats
    else if (data && data.rapport && Array.isArray(data.rapport.candidats)) candidates = data.rapport.candidats
    else if (data && Array.isArray(data.candidates)) candidates = data.candidates
    else if (data && Array.isArray(data.auditeurs)) candidates = data.auditeurs
    else if (data && data.rapport && Array.isArray(data.rapport.auditeurs)) candidates = data.rapport.auditeurs
    else if (data && data.candidats && !Array.isArray(data.candidats)) candidates = [data.candidats]
    else if (data && data.rapport && data.rapport.candidats && !Array.isArray(data.rapport.candidats)) candidates = [data.rapport.candidats]
    else if (data && data.candidates && !Array.isArray(data.candidates)) candidates = [data.candidates]
    else if (data && data.auditeurs && !Array.isArray(data.auditeurs)) candidates = [data.auditeurs]
    else if (data && data.rapport && data.rapport.auditeurs && !Array.isArray(data.rapport.auditeurs)) candidates = [data.rapport.auditeurs]
    else if (data && (data.auditeurId || data.auditeur || data.prenom || data.nom)) candidates = [data]

    const normalized = (candidates || []).map((c) => {
      const aud = c && (c.auditeur || c.auditor) ? (c.auditeur || c.auditor) : c
      // Prefer an id present on the candidate root (c.auditeurId / c.auditorId) before inspecting nested object
      const auditeurId = extractId(c?.auditeurId || c?.auditorId || aud?.auditeurId || aud?.auditorId || aud?._id || aud?.id || aud?.userId || aud)
      const prenom = aud?.prenom || aud?.firstName || ''
      const nom = aud?.nom || aud?.lastName || aud?.name || ''
      const name = aud?.name || `${prenom} ${nom}`.trim()
      const rawScore = typeof c?.score !== 'undefined' ? Number(c.score) : (typeof aud?.score !== 'undefined' ? Number(aud.score) : null)
      const score = rawScore === null || Number.isNaN(rawScore) ? null : rawScore
      const scorePercent = score !== null ? (score <= 1 ? Math.round(score * 100) : Math.round(score)) : null
      return {
        id: auditeurId,
        auditeurId,
        prenom,
        nom,
        name,
        email: aud?.email || '',
        specialty: aud?.specialite || aud?.specialty || '',
        grade: aud?.grade || '',
        score,
        scorePercent,
        raw: c
      }
    }).filter(item => !!item.auditeurId)

    return normalized
  } catch (err) {
    console.error('cordinateurServices.getAutoProposals failed', err)
    return null
  }
}


export async function createAffectation(payload) {
  try {
    const r = await fetch('http://localhost:5000/api/affectations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload)
    })
    if (!r.ok) {
      let body = null
      try { body = await r.text() } catch (e) {}
      console.error('createAffectation HTTP error', r.status, body)
      throw new Error('Network')
    }
    return await r.json()
  } catch (err) {
    console.warn('cordinateurServices.createAffectation fallback', err.message)
    const item = { ...payload, id: `a_${Math.random().toString(36).slice(2,9)}`, statut: 'EN_ATTENTE', dateAffectation: new Date().toISOString() }
    mockAffectations.push(item)
    return new Promise((res) => setTimeout(() => res(item), 200))
  }
}

export async function assignTask(taskId, auditeurId, modeText = 'Manuel') {
  try {
    // map human-readable mode text to backend enum values expected by API
    // backend accepts: MANUELLE, SEMIAUTO, AUTOMATIQUE_IA
    let mode = 'MANUELLE'
    const m = (modeText || '').toString().toUpperCase()
    if (m.includes('SEMI')) mode = 'SEMIAUTO'
    else if (m.includes('IA') || m.includes('AUTOMAT')) mode = 'AUTOMATIQUE_IA'

    // Normalize auditeurId and validate before sending
    const audId = extractId(auditeurId)
    console.debug('assignTask called with raw:', auditeurId, 'extracted:', audId)
    if (!audId) {
      console.error('assignTask invalid auditeurId, aborting send', auditeurId)
      throw new Error('Invalid auditeurId')
    }
    const body = { auditeurId: audId, mode }
    const r = await fetch(`http://localhost:5000/api/tasks/${taskId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body)
    })
    if (!r.ok) {
      let resp = null
      try { resp = await r.text() } catch (e) {}
      console.error('assignTask HTTP error', r.status, resp)
      throw new Error('Network')
    }
    return await r.json()
  } catch (err) {
    console.warn('cordinateurServices.assignTask fallback', err.message)
    const item = { id: `a_${Math.random().toString(36).slice(2,9)}`, tacheId: taskId, auditeurId, statut: 'EN_ATTENTE', dateAffectation: new Date().toISOString() }
    mockAffectations.push(item)
    return new Promise((res) => setTimeout(() => res(item), 200))
  }
}

export async function validateAffectation(affectationId) {
  try {
    const r = await fetch(`http://localhost:5000/api/affectations/${affectationId}/validate`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    if (!r.ok) throw new Error('Network')
    return await r.json()
  } catch (err) {
    console.warn('cordinateurServices.validateAffectation fallback', err.message)
    const idx = mockAffectations.findIndex(a => a.id === affectationId)
    if (idx !== -1) { mockAffectations[idx].statut = 'ACCEPTEE' }
    return new Promise((res) => setTimeout(() => res(mockAffectations[idx] || null), 200))
  }
}

export async function refuseAffectation(affectationId, motif = '') {
  try {
    const r = await fetch(`http://localhost:5000/api/affectations/${affectationId}/refuse`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ motif }) })
    if (!r.ok) throw new Error('Network')
    return await r.json()
  } catch (err) {
    console.warn('cordinateurServices.refuseAffectation fallback', err.message)
    const idx = mockAffectations.findIndex(a => a.id === affectationId)
    if (idx !== -1) { mockAffectations[idx].statut = 'REFUSEE' }
    return new Promise((res) => setTimeout(() => res(mockAffectations[idx] || null), 200))
  }
}

export async function getSuggestions(taskId) {
  try {
    const r = await fetch(`http://localhost:5000/api/taches/${taskId}/suggestions`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    if (!r.ok) throw new Error('Network')
    return await r.json()
  } catch (err) {
    console.warn('cordinateurServices.getSuggestions fallback', err.message)
    // simple local suggestion generator
    return mockTasks[0] ? mockTasks[0].affectations || [] : []
  }
}

export default {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getAffectations,
  createAffectation,
  validateAffectation,
  refuseAffectation,
  getSuggestions
}
