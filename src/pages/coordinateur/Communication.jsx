import React, { useState } from "react";
import { auditeursData, messagesHistorique } from "../../data/messages";

const Communication = () => {
  const [activeTab, setActiveTab] = useState("nouveau"); // nouveau | historique
  const [selectedAuditeurs, setSelectedAuditeurs] = useState([]);
  const [messageForm, setMessageForm] = useState({
    subject: "",
    message: "",
  });
  const [messages, setMessages] = useState(messagesHistorique);
  const [filterRead, setFilterRead] = useState("all"); // all | read | unread

  // Gérer la sélection des auditeurs
  const toggleAuditeur = (id) => {
    setSelectedAuditeurs((prev) =>
      prev.includes(id) ? prev.filter((aid) => aid !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedAuditeurs(auditeursData.map((a) => a.id));
  };

  const deselectAll = () => {
    setSelectedAuditeurs([]);
  };

  // Gérer le formulaire
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setMessageForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedAuditeurs.length === 0) {
      alert("Veuillez sélectionner au moins un auditeur");
      return;
    }
    if (!messageForm.subject || !messageForm.message) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const selectedNames = auditeursData
      .filter((a) => selectedAuditeurs.includes(a.id))
      .map((a) => a.name);

    const newMessage = {
      id: messages.length + 1,
      from: "Coordinateur",
      to: selectedNames,
      subject: messageForm.subject,
      message: messageForm.message,
      date: new Date().toLocaleString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false,
    };

    setMessages([newMessage, ...messages]);
    setMessageForm({ subject: "", message: "" });
    setSelectedAuditeurs([]);
    alert("Message envoyé avec succès !");
  };

  // Supprimer un message
  const deleteMessage = (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce message ?")) {
      setMessages(messages.filter((msg) => msg.id !== id));
    }
  };

  // Supprimer tout l'historique
  const clearAllHistory = () => {
    if (window.confirm("Voulez-vous vraiment supprimer tout l'historique ? Cette action est irréversible.")) {
      setMessages([]);
    }
  };

  // Filtrer l'historique
  const filteredMessages = messages.filter((msg) => {
    if (filterRead === "read") return msg.read;
    if (filterRead === "unread") return !msg.read;
    return true;
  });

  return (
    <div className="communication-page">
      <div className="communication-header">
        <h1>💬 Communication avec les Auditeurs</h1>
        <p className="page-description">
          Envoyez des messages à un ou plusieurs auditeurs et consultez l'historique des communications
        </p>
      </div>

      {/* Tabs */}
      <div className="comm-tabs">
        <button
          className={`comm-tab ${activeTab === "nouveau" ? "active" : ""}`}
          onClick={() => setActiveTab("nouveau")}
        >
          ✉️ Nouveau message
        </button>
        <button
          className={`comm-tab ${activeTab === "historique" ? "active" : ""}`}
          onClick={() => setActiveTab("historique")}
        >
          📋 Historique ({messages.length})
        </button>
      </div>

      {/* Contenu des tabs */}
      {activeTab === "nouveau" ? (
        <div className="nouveau-message-section">
          <div className="message-form-card">
            <h2>📤 Composer un message</h2>
            
            {/* Sélection des auditeurs */}
            <div className="form-section">
              <div className="section-header">
                <label className="form-label">Destinataires</label>
                <div className="selection-actions">
                  <button type="button" className="btn-link" onClick={selectAll}>
                    Tout sélectionner
                  </button>
                  <button type="button" className="btn-link" onClick={deselectAll}>
                    Tout désélectionner
                  </button>
                </div>
              </div>

              <div className="auditeurs-grid">
                {auditeursData.map((auditeur) => (
                  <div
                    key={auditeur.id}
                    className={`auditeur-card ${
                      selectedAuditeurs.includes(auditeur.id) ? "selected" : ""
                    }`}
                    onClick={() => toggleAuditeur(auditeur.id)}
                  >
                    <div className="auditeur-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedAuditeurs.includes(auditeur.id)}
                        onChange={() => {}}
                        className="checkbox-input"
                      />
                    </div>
                    <div className="auditeur-avatar">
                      {auditeur.photo ? (
                        <img src={auditeur.photo} alt={auditeur.name} />
                      ) : (
                        <span>{auditeur.name.split(" ").map((n) => n[0]).join("")}</span>
                      )}
                    </div>
                    <div className="auditeur-info">
                      <div className="auditeur-name">{auditeur.name}</div>
                      <div className="auditeur-details">
                        {auditeur.specialty} • Grade {auditeur.grade}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedAuditeurs.length > 0 && (
                <div className="selected-count">
                  {selectedAuditeurs.length} auditeur(s) sélectionné(s)
                </div>
              )}
            </div>

            {/* Formulaire du message */}
            <form onSubmit={handleSubmit} className="message-form">
              <div className="form-section">
                <label className="form-label">Objet du message</label>
                <input
                  type="text"
                  name="subject"
                  value={messageForm.subject}
                  onChange={handleFormChange}
                  placeholder="Ex: Réunion urgente, Documents requis..."
                  className="form-input"
                  required
                />
              </div>

              <div className="form-section">
                <label className="form-label">Message</label>
                <textarea
                  name="message"
                  value={messageForm.message}
                  onChange={handleFormChange}
                  placeholder="Rédigez votre message ici..."
                  className="form-textarea"
                  rows="6"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary btn-send">
                  📨 Envoyer le message
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="historique-section">
          <div className="historique-header">
            <h2>📋 Historique des messages envoyés</h2>
            <div className="header-actions">
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filterRead === "all" ? "active" : ""}`}
                  onClick={() => setFilterRead("all")}
                >
                  Tous
                </button>
                <button
                  className={`filter-btn ${filterRead === "read" ? "active" : ""}`}
                  onClick={() => setFilterRead("read")}
                >
                  Lus
                </button>
                <button
                  className={`filter-btn ${filterRead === "unread" ? "active" : ""}`}
                  onClick={() => setFilterRead("unread")}
                >
                  Non lus
                </button>
              </div>
              {messages.length > 0 && (
                <button className="btn-danger-outline" onClick={clearAllHistory}>
                  🗑️ Supprimer tout
                </button>
              )}
            </div>
          </div>

          <div className="messages-list">
            {filteredMessages.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p>Aucun message à afficher</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <div key={msg.id} className={`message-card ${msg.read ? "read" : "unread"}`}>
                  <div className="message-header-row">
                    <div className="message-meta">
                      <span className="message-from">De: {msg.from}</span>
                      <span className="message-date">📅 {msg.date}</span>
                      {!msg.read && <span className="unread-badge">Nouveau</span>}
                    </div>
                    <button
                      className="btn-delete-message"
                      onClick={() => deleteMessage(msg.id)}
                      title="Supprimer ce message"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="message-subject">
                    <strong>📌 {msg.subject}</strong>
                  </div>
                  <div className="message-recipients">
                    <strong>À:</strong> {msg.to.join(", ")}
                  </div>
                  <div className="message-body">{msg.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Communication;

