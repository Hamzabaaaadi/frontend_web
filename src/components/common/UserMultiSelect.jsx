import React from "react";

export default function UserMultiSelect({ users, value, onChange }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <select
        multiple
        value={value}
        onChange={e => {
          const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
          onChange(selected);
        }}
        style={{ width: "100%", minHeight: 90, borderRadius: 8, border: '1px solid #cbd5e1', padding: 8, background: '#f8fafc', fontSize: 15, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        {users.map(user => (
          <option key={user._id || user.id} value={user._id || user.id}>
            {user.nom} {user.prenom} {user.email ? `(${user.email})` : ''}
          </option>
        ))}
      </select>
      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
        Maintenez Ctrl (Windows) ou Cmd (Mac) pour sélectionner plusieurs destinataires.
      </div>
    </div>
  );
}
