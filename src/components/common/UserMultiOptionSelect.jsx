import React, { useRef, useState } from "react";

export default function UserMultiOptionSelect({ users, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef();
  const handleToggle = () => setOpen(o => !o);
  const handleSelect = (id) => {
    if (!value.includes(id)) onChange([...value, id]);
  };
  const handleRemove = (id) => {
    onChange(value.filter(v => v !== id));
  };
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        style={{ minHeight: 38, border: '1.5px solid #cbd5e1', borderRadius: 8, background: '#f8fafc', padding: '6px 8px', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', cursor: 'pointer' }}
        onClick={handleToggle}
      >
        {value.length === 0 && <span style={{ color: '#64748b', fontSize: 15 }}>Choisir destinataire(s)...</span>}
        {value.map(val => {
          const user = users.find(u => (u._id || u.id) === val);
          return user ? (
            <span key={val} style={{ display: 'inline-flex', alignItems: 'center', background: '#e0f2fe', color: '#0369a1', borderRadius: 16, padding: '2px 10px', fontSize: 14 }}>
              {user.nom} {user.prenom}
              <button type="button" onClick={e => { e.stopPropagation(); handleRemove(val); }} style={{ marginLeft: 6, background: 'none', border: 'none', color: '#0369a1', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>&times;</button>
            </span>
          ) : null;
        })}
        <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: 18 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', zIndex: 20, maxHeight: 180, overflowY: 'auto', marginTop: 2 }}>
          {users.filter(u => !value.includes(u._id || u.id)).map(user => (
            <div key={user._id || user.id} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 15, color: '#0369a1' }} onClick={() => { handleSelect(user._id || user.id); setOpen(false); }}>
              {user.nom} {user.prenom} {user.email ? `(${user.email})` : ''}
            </div>
          ))}
          {users.filter(u => !value.includes(u._id || u.id)).length === 0 && (
            <div style={{ padding: '8px 12px', color: '#64748b', fontSize: 14 }}>Aucun autre utilisateur</div>
          )}
        </div>
      )}
    </div>
  );
}
