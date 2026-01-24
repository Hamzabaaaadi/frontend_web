import React from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import useChat from '../../hooks/useChat'

export default function Chat({ taskId, currentUser }) {
  const { messages, sendMessage, loading } = useChat(taskId)

  // On send, patch the returned message locally to always have expediteurId as {_id: currentUser}
  const handleSend = async (text) => {
    if (!text) return;
    const saved = await sendMessage({
      taskId,
      from: currentUser || 'inconnu',
      expediteurId: { _id: currentUser || 'inconnu' },
      text
    });
    // Patch the last message in the list if needed
    if (saved && saved.id) {
      saved.expediteurId = { _id: currentUser };
    }
  }

  return (
    <div>
      <h4 style={{ marginTop: 0 }}>Discussion — Tâche </h4>
      <MessageList messages={messages} loading={loading} currentUser={currentUser} />
      <MessageInput onSend={handleSend} />
    </div>
  )
}
