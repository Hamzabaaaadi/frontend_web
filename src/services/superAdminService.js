// Mock SuperAdmin service: in-memory data and simple CRUD
let users = [
  { id: 'u1', nom: 'Admin', prenom: 'Systeme', email: 'admin@taskme.com', role: 'SUPERADMIN' },
  { id: 'u2', nom: 'Coordo', prenom: 'Demo', email: 'coordinateur@demo.com', role: 'COORDINATEUR' }
]

let vehicles = [
  { id: 'v1', immatriculation: '123-ABC', marque: 'Renault', modele: 'Clio', direction: 'Nord', estDisponible: true, typeAttribution: 'PERMANENT', auditeurAttribue: '', dateDebut: null, dateFin: null },
  { id: 'v2', immatriculation: '456-DEF', marque: 'Peugeot', modele: '308', direction: 'Sud', estDisponible: false, typeAttribution: 'TEMPORAIRE', auditeurAttribue: 'u12', dateDebut: '2025-11-01', dateFin: '2025-11-10' }
]

function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 9)
}

export async function listUsers() {
  try {
    const r = await fetch('/api/users')
    if (!r.ok) throw new Error('Network')
    return await r.json()
  } catch (err) {
    console.warn('superAdminService.listUsers fallback to mock', err.message)
    return new Promise((res) => setTimeout(() => res([...users]), 200))
  }
}

export async function createUser(payload) {
  try {
    const r = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!r.ok) throw new Error('Network')
    return await r.json()
  } catch (err) {
    console.warn('superAdminService.createUser fallback to mock', err.message)
    const u = { ...payload, id: uid('u') }
    users = [u, ...users]
    return new Promise((res) => setTimeout(() => res(u), 200))
  }
}

export async function register(payload) {
  try {
    const r = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!r.ok) throw new Error('Network')
    return await r.json()
  } catch (err) {
    console.warn('superAdminService.register fallback to mock', err.message)
    const u = { ...payload, id: uid('u') }
    users = [u, ...users]
    return new Promise((res) => setTimeout(() => res(u), 200))
  }
}

export async function updateUser(id, payload) {
  try {
    const r = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!r.ok) throw new Error('Network')
    return await r.json()
  } catch (err) {
    console.warn('superAdminService.updateUser fallback to mock', err.message)
    users = users.map((u) => (u.id === id ? { ...u, ...payload } : u))
    return new Promise((res) => setTimeout(() => res(users.find((x) => x.id === id)), 200))
  }
}

export async function deleteUser(id) {
  try {
    const r = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    if (!r.ok) throw new Error('Network')
    return true
  } catch (err) {
    console.warn('superAdminService.deleteUser fallback to mock', err.message)
    users = users.filter((u) => u.id !== id)
    return new Promise((res) => setTimeout(() => res(true), 150))
  }
}

export async function listVehicles() {
  try {
    const r = await fetch('/api/vehicles')
    if (!r.ok) throw new Error('Network')
    return await r.json()
  } catch (err) {
    console.warn('superAdminService.listVehicles fallback to mock', err.message)
    return new Promise((res) => setTimeout(() => res([...vehicles]), 200))
  }
}

export async function createVehicle(payload) {
  try {
    const r = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!r.ok) throw new Error('Network')
    return await r.json()
  } catch (err) {
    console.warn('superAdminService.createVehicle fallback to mock', err.message)
    const v = { ...payload, id: uid('v') }
    vehicles = [v, ...vehicles]
    return new Promise((res) => setTimeout(() => res(v), 200))
  }
}

export async function updateVehicle(id, payload) {
  try {
    const r = await fetch(`/api/vehicles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!r.ok) throw new Error('Network')
    return await r.json()
  } catch (err) {
    console.warn('superAdminService.updateVehicle fallback to mock', err.message)
    vehicles = vehicles.map((v) => (v.id === id ? { ...v, ...payload } : v))
    return new Promise((res) => setTimeout(() => res(vehicles.find((x) => x.id === id)), 200))
  }
}

export async function deleteVehicle(id) {
  try {
    const r = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' })
    if (!r.ok) throw new Error('Network')
    return true
  } catch (err) {
    console.warn('superAdminService.deleteVehicle fallback to mock', err.message)
    vehicles = vehicles.filter((v) => v.id !== id)
    return new Promise((res) => setTimeout(() => res(true), 150))
  }
}

export async function getStats() {
  const totalUsers = users.length
  const totalVehicles = vehicles.length
  const vehiclesAvailable = vehicles.filter((v) => v.disponible).length
  return new Promise((res) => setTimeout(() => res({ totalUsers, totalVehicles, vehiclesAvailable }), 180))
}

export default {
  listUsers,
  createUser,
  register,
  updateUser,
  deleteUser,
  listVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getStats
}
