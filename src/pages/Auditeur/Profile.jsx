// import React from 'react'

// export default function Profile() {
//   return (
//     <section style={{ maxWidth: 920 }}>
//       <h3 style={{ marginBottom: 12 }}>Profil</h3>

//       <div style={{ display: 'flex', gap: 16 }}>
//         <div style={{ width: 160, height: 160, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#0f172a', fontWeight: 700 }}>
//           D
//         </div>

//         <div style={{ flex: 1, background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 6px 18px rgba(2,6,23,0.04)' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//             <div>
//               <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Dupont</div>
//               <div style={{ color: '#6b7280', marginTop: 6 }}>Grade: <strong style={{ color: '#0f172a' }}>GRADE_A</strong></div>
//               <div style={{ color: '#6b7280', marginTop: 6 }}>Spécialité: <strong style={{ color: '#0f172a' }}>PEDAGOGIQUE</strong></div>
//             </div>
//             <div style={{ display: 'flex', gap: 8 }}>
//               <button style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e6eef8', background: '#fff' }} onClick={() => console.log('edit profile')}>Modifier</button>
//               <button style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff' }} onClick={() => console.log('logout')}>Déconnexion</button>
//             </div>
//           </div>

//           <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//             <div style={{ background: '#fafafa', padding: 12, borderRadius: 8 }}>
//               <div style={{ fontSize: 13, color: '#6b7280' }}>Contact</div>
//               <div style={{ marginTop: 6, color: '#0f172a' }}>dupont@example.com</div>
//             </div>
//             <div style={{ background: '#fafafa', padding: 12, borderRadius: 8 }}>
//               <div style={{ fontSize: 13, color: '#6b7280' }}>Disponibilité</div>
//               <div style={{ marginTop: 6, color: '#0f172a' }}>Disponible</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }



















import React, { useEffect, useState } from 'react'
import { getMyProfile } from '../../services/authService'

export default function Profile() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    getMyProfile()
      .then(data => setUser(data.user))
      .catch(err => console.error(err))
  }, [])

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: '#64748b' }}>Chargement du profil...</p>
      </div>
    )
  }

  return (
    <section
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: 24
      }}
    >
      <h2 style={{ marginBottom: 20, fontWeight: 700 }}>Mon profil</h2>

      <div
        style={{
          display: 'flex',
          gap: 24,
          background: '#ffffff',
          borderRadius: 14,
          padding: 24,
          boxShadow: '0 10px 25px rgba(0,0,0,0.06)'
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 42,
            fontWeight: 700,
            color: '#334155'
          }}
        >
          {user.nom?.charAt(0)}
        </div>

        {/* Infos */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>
              {user.nom} {user.prenom}
            </h3>
            <p style={{ margin: 0, color: '#64748b' }}>
              {user.role}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginTop: 16
            }}
          >
            <Info label="Email" value={user.email} />

            {user.role === 'AUDITEUR' && (
              <>
                <Info label="Grade" value={user.grade} />
                <Info label="Spécialité" value={user.specialite} />
              </>
            )}
          </div>

          {/* Déconnexion (discrète) */}
          <div style={{ marginTop: 24 }}>
            <button
              onClick={() => console.log('logout')}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 6,
                cursor: 'pointer'
              }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 13, color: '#64748b' }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  )
}
