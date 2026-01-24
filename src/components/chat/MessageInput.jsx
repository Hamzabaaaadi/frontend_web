import React, { useState } from 'react'

export default function MessageInput({ onSend }) {
  const [text, setText] = useState('')
  const submit = () => {
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }
  return (
    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
      <input value={text} onChange={(e) => setText(e.target.value)} style={{ flex: 1, padding: 8 }} placeholder="Écrire un message…" />
      <button onClick={submit} className="btn primary">Envoyer</button>
    </div>
  )
}
