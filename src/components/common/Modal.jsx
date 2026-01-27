import React from 'react'
import ReactDOM from 'react-dom'
import './Modal.css'

export default function Modal({ isOpen, title, children, onCancel, onConfirm, confirmText = 'Confirmer' }) {
  if (!isOpen) return null

  const modalContent = (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-box">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button aria-label="Fermer" className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <div className="modal-content">{children}</div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel}>Annuler</button>
          <button className="btn-primary" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  )

  return ReactDOM.createPortal(modalContent, document.body)
}
