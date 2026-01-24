import { useEffect, useState, useRef, useCallback } from 'react'
import { fetchMessages, postMessage } from '../services/chatService'

function uniqMerge(existing = [], incoming = []) {
  const map = new Map()
  ;[...existing, ...incoming].forEach((m) => {
    const id = m && (m.id || m._id || `${m.from || ''}-${m.createdAt || ''}`)
    if (!id) return
    if (!map.has(id)) map.set(id, m)
  })
  return Array.from(map.values()).sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
}

export default function useChat(taskId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const mounted = useRef(false)

  const load = useCallback(async () => {
    if (!taskId) { setMessages([]); setLoading(false); return }
    setLoading(true)
    try {
      const data = await fetchMessages(taskId)
      const list = Array.isArray(data) ? data : []
      setMessages(list)
    } catch (e) {
      console.warn('useChat.load', e.message)
      setMessages([])
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    mounted.current = true
    load()
    return () => { mounted.current = false }
  }, [load])

  const sendMessage = useCallback(async (payload) => {
    const saved = await postMessage(payload)
    if (saved) setMessages((prev) => uniqMerge(prev, [saved]))
    return saved
  }, [])

  const appendMessage = useCallback((msg) => {
    if (!msg) return
    setMessages((prev) => uniqMerge(prev, [msg]))
  }, [])

  const refresh = useCallback(() => load(), [load])

  return { messages, loading, sendMessage, appendMessage, refresh }
}
