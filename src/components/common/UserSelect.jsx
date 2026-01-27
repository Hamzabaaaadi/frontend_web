import React from "react";

export default function UserSelect({ users, value, onChange }) {
  return (
    <select
      multiple
      value={value}
      onChange={e => {
        const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
        onChange(selected);
      }}
      style={{ width: "100%", minHeight: 80, borderRadius: 8, border: '1px solid #eee', padding: 8 }}
    >
      {users.map(user => (
        <option key={user._id || user.id} value={user._id || user.id}>
          {user.nom} {user.prenom} {user.email ? `(${user.email})` : ''}
        </option>
      ))}
    </select>
  );
}
