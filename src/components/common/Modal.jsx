import React from 'react'

export default function Modal({ isOpen, title, children, onCancel, onConfirm, confirmText = 'Confirmer' }) {
  if (!isOpen) return null

  const overlay = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }

  const box = {
    width: 'min(680px, 94%)',
    background: '#fff',
    borderRadius: 8,
    padding: 18,
    boxShadow: '0 10px 30px rgba(2,6,23,0.2)'
  }

  const footer = { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }

  return (
    <div style={overlay} role="dialog" aria-modal="true">
      <div style={box}>
        {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
        <div>{children}</div>
        <div style={footer}>
          <button onClick={onCancel}>Annuler</button>
          <button onClick={onConfirm} style={{ background: '#2563eb', color: '#fff', border: 'none' }}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}
