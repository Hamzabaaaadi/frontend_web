import React from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import useChat from '../../hooks/useChat'

export default function Chat({ taskId, currentUser }) {
  const { messages, sendMessage, loading } = useChat(taskId)

  const handleSend = (text) => {
    if (!text) return
    sendMessage({ taskId, from: currentUser || 'inconnu', text }).catch(() => {})
  }

  return (
    <div>
      <h4 style={{ marginTop: 0 }}>Discussion — Tâche {taskId}</h4>
      <MessageList messages={messages} loading={loading} />
      <MessageInput onSend={handleSend} />
    </div>
  )
}
