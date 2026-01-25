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
import axios from 'axios'
import { getMyProfile, updateMyProfile, logout } from '../../services/authService'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '', formation: '' })
  const [profileImage, setProfileImage] = useState(null)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getMyProfile()
      .then(data => {
        const u = data.user
        setUser(u)
        console.log('user profile data', data)
        // fill form: formation can be in u.auditeur.formations (array)
        const formation = u.auditeur && Array.isArray(u.auditeur.formations) ? u.auditeur.formations.join(', ') : (u.formation || '')
        setForm({
          nom: u.nom || '',
          prenom: u.prenom || '',
          email: u.email || '',
          password: '',
          formation
        })
          // load existing avatar if present (could be a URL or dataURL)
          if (u.profileImage) setProfileImage(u.profileImage)
          else if (u.avatar) setProfileImage(u.avatar)
      })
      .catch(err => console.error(err))
  }, [])

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: '#64748b' }}>Chargement du profil...</p>
      </div>
    )
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage('')
      const payload = { nom: form.nom, prenom: form.prenom }
      if (form.email) payload.email = form.email
      if (form.password) payload.password = form.password

      let uploadedAvatarUrl = null
      // If a file was selected, upload it first (multipart/form-data) to /api/users/:id/avatar
      if (selectedAvatarFile) {
          try {
          const userId = (user && (user._id || user.id)) || 'me'
          const token = localStorage.getItem('basicAuth')
          const headers = token ? { Authorization: `Basic ${token}` } : {}
          const formData = new FormData()
          formData.append('avatar', selectedAvatarFile)
          const API = import.meta.env.VITE_API_URL
          const uploadRes = await axios.put(`${API}/api/users/${userId}/avatar`, formData, { headers: { ...headers } })
          const uploadData = uploadRes.data || null
          uploadedAvatarUrl = uploadData && uploadData.user && (uploadData.user.avatar || uploadData.user.avatarUrl || uploadData.user.photo || uploadData.user.profileImage) || null
          if (uploadedAvatarUrl) setProfileImage(uploadedAvatarUrl)
        } catch (err) {
          console.error('Failed to upload avatar', err)
          setMessage('Erreur lors de l\'upload de l\'image')
          setSaving(false)
          return
        }
      }
      if (form.formation) {
        const arr = String(form.formation).split(',').map(s => s.trim()).filter(Boolean)
        if (arr.length) {
          payload.formations = arr
          // keep legacy single `formation` string for compatibility
          payload.formation = arr.join(', ')
        }
      }
      // attach avatar URL to payload if we've uploaded or set it
      if (uploadedAvatarUrl) {
        payload.profileImage = uploadedAvatarUrl
        payload.avatar = uploadedAvatarUrl
      } else if (profileImage && String(profileImage).startsWith('http')) {
        // if profileImage is an external URL (not a data URL), include it
        payload.profileImage = profileImage
        payload.avatar = profileImage
      }
      console.log('payloadss', payload)
      const res = await updateMyProfile(payload)
      const updated = res.user || res
      setUser(updated)
      setEditing(false)
      setForm({ ...form, password: '' })
      setMessage('Profil mis à jour')
    } catch (err) {
      console.error(err)
      setMessage(err.message || 'Erreur mise à jour')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section style={{ maxWidth: 980, margin: '0 auto', padding: 24 }}>
      <h2 style={{ marginBottom: 20, fontWeight: 700 }}>Mon profil</h2>

      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ width: 320 }}>
              <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 8px 30px rgba(2,6,23,0.06)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 140, height: 140, borderRadius: '50%', overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 700, color: '#334155', boxShadow: '0 6px 18px rgba(2,6,23,0.06)', border: '6px solid rgba(59,130,246,0.06)' }}>
                    {profileImage ? (
                      <img src={profileImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', textAlign: 'center' }}>{user.nom?.charAt(0)}</div>
                    )}
                  </div>

                  {/* Hidden file input + styled button to match design */}
                  {editing && (
                    <div style={{ textAlign: 'center' }}>
                      <input id="profile-file-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                        const f = e.target.files && e.target.files[0]
                        if (!f) return
                        setSelectedAvatarFile(f)
                        const reader = new FileReader()
                        reader.onload = () => setProfileImage(reader.result)
                        reader.readAsDataURL(f)
                      }} />
                      <label htmlFor="profile-file-input" style={{ display: 'inline-block', marginTop: 6, padding: '10px 16px', borderRadius: 12, background: '#f3f4f6', border: '1px solid #e6eef8', cursor: 'pointer', fontWeight: 700 }}>Choisir une photo</label>
                      
                    </div>
                  )}
                </div>

            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ fontSize: 13, color: '#64748b' }}>Nom</div>
              {!editing ? <div style={{ fontWeight: 700 }}>{user.nom}</div> : <input value={form.nom} onChange={(e)=>setForm({...form, nom: e.target.value})} style={{ padding: 8, borderRadius: 8, width: '100%' }} />}

              <div style={{ fontSize: 13, color: '#64748b' }}>Prénom</div>
              {!editing ? <div style={{ fontWeight: 700 }}>{user.prenom}</div> : <input value={form.prenom} onChange={(e)=>setForm({...form, prenom: e.target.value})} style={{ padding: 8, borderRadius: 8, width: '100%' }} />}

              <div style={{ fontSize: 13, color: '#64748b' }}>Email</div>
              {!editing ? <div style={{ fontWeight: 700 }}>{user.email}</div> : <input value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} style={{ padding: 8, borderRadius: 8, width: '100%' }} />}

              <div style={{ fontSize: 13, color: '#64748b' }}>Mot de passe</div>
              {!editing ? <div style={{ fontWeight: 700 }}>••••••••</div> : <input type="password" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} placeholder="Laisser vide pour conserver" style={{ padding: 8, borderRadius: 8, width: '100%' }} />}

              <div style={{ fontSize: 13, color: '#64748b' }}>Formation(s)</div>
              {!editing ? <div style={{ fontWeight: 700 }}>{(user.auditeur && Array.isArray(user.auditeur.formations) ? user.auditeur.formations.join(', ') : (user.formation || '—'))}</div> : (
                <>
                  <input value={form.formation} onChange={(e)=>setForm({...form, formation: e.target.value})} placeholder="Séparez par , pour plusieurs" style={{ padding: 8, borderRadius: 8, width: '100%' }} />
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(form.formation || '').split(',').map((f,i)=> f.trim()).filter(Boolean).map((f,i)=>(<div key={i} style={{ padding: '6px 10px', background: '#fff7ed', borderRadius: 999 }}>{f}</div>))}
                  </div>
                </>
              )}

              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                {!editing ? (
                  <>
                    <button onClick={() => setEditing(true)} className="btn-ghost" style={{ padding: '8px 12px', borderRadius: 8 }}>Modifier</button>
                    <button onClick={() => { logout(); window.location.reload(); }} className="btn-danger" style={{ padding: '8px 12px', borderRadius: 8 }}>Déconnexion</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditing(false); setMessage(''); }} className="btn-ghost">Annuler</button>
                    <button onClick={handleSave} className="btn-primary">{saving ? '…' : 'Enregistrer'}</button>
                  </>
                )}
              </div>

              {message && <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: '#ecfdf5', color: '#064e3b' }}>{message}</div>}
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 8px 30px rgba(2,6,23,0.04)' }}>
            <h4 style={{ marginTop: 0 }}>Informations auditeur</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Info label="Grade" value={user.auditeur?._id ? (user.auditeur.grade || '—') : (user.grade || '—')} />
              <Info label="Spécialité" value={user.auditeur.specialite || '—'} />
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, color: '#64748b' }}>Diplômes</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(user.auditeur && Array.isArray(user.auditeur.diplomes) ? user.auditeur.diplomes : []).length > 0 ? (user.auditeur.diplomes.map((d,i)=> <div key={i} style={{ padding: '6px 10px', background: '#f1f5f9', borderRadius: 999 }}>{d}</div>)) : <div style={{ color: '#94a3b8' }}>—</div>}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, color: '#64748b' }}>Formations</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(user.auditeur && Array.isArray(user.auditeur.formations) ? user.auditeur.formations : []).length > 0 ? (user.auditeur.formations.map((f,i)=> <div key={i} style={{ padding: '6px 10px', background: '#fff7ed', borderRadius: 999 }}>{f}</div>)) : <div style={{ color: '#94a3b8' }}>—</div>}
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: '#64748b' }}>Compte créé</div>
                <div style={{ fontWeight: 700 }}>{new Date(user.dateCreation).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#64748b' }}>Statut</div>
                <div style={{ fontWeight: 700 }}>{user.estActif ? 'Actif' : 'Inactif'}</div>
              </div>
            </div>
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
