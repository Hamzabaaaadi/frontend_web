

import axios from 'axios'

export async function fetchMessages(taskId) {
  try {
    const API = import.meta.env.VITE_API_URL
    const res = await axios.get(`${API}/chats?taskId=${taskId}`)
    const data = res.data
    // Normalise different possible shapes from backend:
    // - API returns { chat: { messages: [...] } }
    // - API returns { messages: [...] }
    // - API returns an array of messages
    if (!data) return []
    if (Array.isArray(data)) return data
    if (Array.isArray(data.messages)) return data.messages
    if (data.chat && Array.isArray(data.chat.messages)) return data.chat.messages
    // otherwise try to find first array value
    for (const k of Object.keys(data)) {
      if (Array.isArray(data[k])) return data[k]
    }
    return []
  } catch (e) {
    console.warn('chatService.fetchMessages fallback', e.message)
    return []
  }
}

export async function postMessage(payload) {
  // Expecting frontend payload: { taskId, from, text }
  // Map to backend fields according to your Mongoose schema: { tacheId, expediteurId, contenu }
  const body = {
    tacheId: payload.taskId || payload.tacheId || null,
    expediteurId: payload.from || payload.expediteurId || null,
    contenu: payload.text || payload.contenu || '',
    dateEnvoi: payload.dateEnvoi || new Date().toISOString(),
  }
  try {
    const API = import.meta.env.VITE_API_URL
    const r = await axios.post(`${API}/chats`, body, { headers: { 'Content-Type': 'application/json' } })
    const data = r.data
    // Normalize returned message to frontend-friendly shape
    // Backend message fields: { _id|id, expediteurId, contenu, dateEnvoi, estLu }
    const msg = data && (data.message || data || null)
    if (!msg) return data
    return {
      id: msg._id || msg.id,
      taskId: msg.tacheId || msg.taskId || payload.taskId || null,
      from: (msg.expediteurId && (msg.expediteurId.nom ? `${msg.expediteurId.nom} ${msg.expediteurId.prenom}` : msg.expediteurId)) || msg.expediteurId || payload.from,
      text: msg.contenu || msg.text || '',
      createdAt: msg.dateEnvoi || msg.createdAt || msg.date || new Date().toISOString(),
      read: !!msg.estLu
    }
  } catch (e) {
    throw new Error('Send message failed')
  }
}

export default { fetchMessages, postMessage }
