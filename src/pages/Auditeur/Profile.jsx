import React from 'react'

export default function Profile() {
  return (
    <section style={{ maxWidth: 920 }}>
      <h3 style={{ marginBottom: 12 }}>Profil</h3>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ width: 160, height: 160, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#0f172a', fontWeight: 700 }}>
          D
        </div>

        <div style={{ flex: 1, background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 6px 18px rgba(2,6,23,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Dupont</div>
              <div style={{ color: '#6b7280', marginTop: 6 }}>Grade: <strong style={{ color: '#0f172a' }}>GRADE_A</strong></div>
              <div style={{ color: '#6b7280', marginTop: 6 }}>Spécialité: <strong style={{ color: '#0f172a' }}>PEDAGOGIQUE</strong></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e6eef8', background: '#fff' }} onClick={() => console.log('edit profile')}>Modifier</button>
              <button style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff' }} onClick={() => console.log('logout')}>Déconnexion</button>
            </div>
          </div>

          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#fafafa', padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Contact</div>
              <div style={{ marginTop: 6, color: '#0f172a' }}>dupont@example.com</div>
            </div>
            <div style={{ background: '#fafafa', padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Disponibilité</div>
              <div style={{ marginTop: 6, color: '#0f172a' }}>Disponible</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
