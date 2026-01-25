import axios from 'axios'

const API = import.meta.env.VITE_API_URL

// ===============================
// Service d'authentification
// ===============================

export async function login(email, password) {
  try {
    const response = await axios.post(`${API}/api/auth/login`, { email, password }, {
      headers: { 'Content-Type': 'application/json' }
    })

    const data = response.data

    // store Basic Auth locally
    const basicAuth = btoa(email + ':' + password)
    localStorage.setItem('basicAuth', basicAuth)

    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user))
    }

    return data
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || ''
    // fallback demo if network error
    if (msg.includes('Network') || msg.includes('Failed to fetch') || !err?.response) {
      console.warn('authService.login: API non disponible, fallback demo')
      if (email === 'coordinateur@demo.com' && password === 'demo') {
        return { role: 'COORDINATEUR', user: { email, role: 'COORDINATEUR' } }
      } else if (email === 'auditeur@demo.com' && password === 'demo') {
        return { role: 'AUDITEUR', user: { email, role: 'AUDITEUR' } }
      } else if (email === 'superadmin@demo.com' && password === 'demo') {
        return { role: 'SUPER_ADMIN', user: { email, role: 'SUPER_ADMIN' } }
      }
      throw new Error('Email ou mot de passe incorrect')
    }

    throw new Error(msg || 'Email ou mot de passe incorrect')
  }
}

// ===============================
// Logout (Basic Auth)
// ===============================
export function logout() {
  localStorage.removeItem('basicAuth')
  localStorage.removeItem('user')
}

// ===============================
// Profil utilisateur connecté
// ===============================
export async function getMyProfile() {
  const basicAuth = localStorage.getItem('basicAuth')
  if (!basicAuth) throw new Error('Utilisateur non connecté')

  try {
    const res = await axios.get(`${API}/api/users/me`, {
      headers: { Authorization: `Basic ${basicAuth}` }
    })
    return res.data
  } catch (err) {
    throw new Error(err?.response?.data?.message || 'Non authentifié')
  }
}

export async function updateMyProfile(payload = {}) {
  const basicAuth = localStorage.getItem('basicAuth')
  if (!basicAuth) throw new Error('Utilisateur non connecté')

  const allowed = ['nom', 'prenom', 'email', 'password', 'formation', 'formations']
  const body = {}
  allowed.forEach((k) => {
    if (k in payload && payload[k] !== undefined) body[k] = payload[k]
  })

  try {
    const res = await axios.put(`${API}/api/users/me`, body, {
      headers: { Authorization: `Basic ${basicAuth}` }
    })

    const data = res.data
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user))
    return data
  } catch (err) {
    throw new Error(err?.response?.data?.message || 'Erreur lors de la mise à jour du profil')
  }
}

export default {
  login,
  logout,
  getMyProfile,
  updateMyProfile
}
// file cleaned: only one implementation present above
// Service d'authentification
