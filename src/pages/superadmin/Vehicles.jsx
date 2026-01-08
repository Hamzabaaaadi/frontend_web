import React, { useEffect, useState } from 'react'
import * as svc from '../../services/superAdminService'
import Modal from '../../components/common/Modal'

export default function VehiclesManagement(){
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editVeh, setEditVeh] = useState(null)
  const [form, setForm] = useState({ immatriculation: '', marque: '', modele: '', direction: null, estDisponible: true, typeAttribution: null, auditeurAttribue: null, dateDebut: null, dateFin: null })

  const load = async ()=>{ setLoading(true); setVehicles(await svc.listVehicles()); setLoading(false) }
  useEffect(()=>{ load() }, [])

  const openCreate = ()=>{ setEditVeh(null); setForm({ immatriculation: '', marque: '', modele: '', direction: null, estDisponible: true, typeAttribution: null, auditeurAttribue: null, dateDebut: null, dateFin: null }); setModalOpen(true) }
  const openEdit = (v)=>{ setEditVeh(v); setForm({ immatriculation: v.immatriculation || '', marque: v.marque || '', modele: v.modele || '', direction: v.direction || '', estDisponible: !!v.estDisponible, typeAttribution: v.typeAttribution || 'TEMPORAIRE', auditeurAttribue: v.auditeurAttribue || '', dateDebut: v.dateDebut || '', dateFin: v.dateFin || '' }); setModalOpen(true) }

  const handleSave = async ()=>{
    // normalize dates empty -> null
    const payload = { ...form, dateDebut: form.dateDebut || null, dateFin: form.dateFin || null }
    if(editVeh) await svc.updateVehicle(editVeh.id, payload)
    else await svc.createVehicle(payload)
    setModalOpen(false)
    await load()
  }

  const handleDelete = async (id)=>{ if(!window.confirm('Supprimer le véhicule ?')) return; await svc.deleteVehicle(id); await load() }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18 }}>
        <div>
          <h1 style={{ margin: 0 }}>Parc automobile</h1>
          <div style={{ color: '#64748b' }}>Gérer les véhicules de la plateforme.</div>
        </div>
        <div>
          <button onClick={openCreate} style={{ padding: '10px 14px', background: '#2563eb', color:'#fff', border:'none', borderRadius:8, fontWeight:700 }}>Ajouter véhicule</button>
        </div>
      </div>

      {loading ? <div>Chargement…</div> : (
        <div style={{ display:'grid', gap:10 }}>
          {vehicles.map(v=> (
            <div key={v.id} style={{ display:'flex',justifyContent:'space-between',padding:12,background:'#fff',borderRadius:10,boxShadow:'0 6px 18px rgba(2,6,23,0.04)' }}>
              <div>
                <div style={{ fontWeight:800 }}>{v.immatriculation} — {v.marque} {v.modele}</div>
                <div style={{ color:'#6b7280' }}>{v.id} • {v.estDisponible ? 'Disponible' : 'Indisponible'}</div>
                <div style={{ color:'#475569', marginTop:6 }}>Direction: {v.direction || '-' } • Type: {v.typeAttribution || '-'}</div>
                <div style={{ color:'#475569', marginTop:6 }}>Attribué à: {v.auditeurAttribue || '-'}</div>
                <div style={{ color:'#475569', marginTop:6 }}>Période: {v.dateDebut || '-'} → {v.dateFin || '-'}</div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => openEdit(v)} style={{ padding:'8px 10px',borderRadius:8,background:'#f3f4f6',border:'none' }}>Éditer</button>
                <button onClick={() => handleDelete(v.id)} style={{ padding:'8px 10px',borderRadius:8,background:'#fee2e2',border:'none' }}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} title={editVeh ? 'Modifier véhicule' : 'Ajouter véhicule'} onCancel={()=>setModalOpen(false)} onConfirm={handleSave} confirmText={editVeh ? 'Enregistrer' : 'Ajouter'}>
        <div style={{ display:'grid', gap:8 }}>
          <input placeholder="Immatriculation" value={form.immatriculation} onChange={(e)=>setForm({...form, immatriculation:e.target.value})} />
          <input placeholder="Marque" value={form.marque} onChange={(e)=>setForm({...form, marque:e.target.value})} />
          <input placeholder="Modèle" value={form.modele} onChange={(e)=>setForm({...form, modele:e.target.value})} />
          {/* Assignment fields only when editing an existing vehicle */}
          {editVeh && (
            <>
              <input placeholder="Direction" value={form.direction || ''} onChange={(e)=>setForm({...form, direction:e.target.value || null})} />
              <select value={form.typeAttribution || ''} onChange={(e)=>setForm({...form, typeAttribution:e.target.value || null})}>
                <option value="">-- Type d'attribution --</option>
                <option value="TEMPORAIRE">TEMPORAIRE</option>
                <option value="PERMANENT">PERMANENT</option>
              </select>
              <input placeholder="Auditeur attribué (ID)" value={form.auditeurAttribue || ''} onChange={(e)=>setForm({...form, auditeurAttribue:e.target.value || null})} />
              <div style={{ display:'flex', gap:8 }}>
                <label style={{ display:'flex',flexDirection:'column' }}>
                  Date début
                  <input type="date" value={form.dateDebut || ''} onChange={(e)=>setForm({...form, dateDebut:e.target.value || null})} />
                </label>
                <label style={{ display:'flex',flexDirection:'column' }}>
                  Date fin
                  <input type="date" value={form.dateFin || ''} onChange={(e)=>setForm({...form, dateFin:e.target.value || null})} />
                </label>
              </div>
            </>
          )}
          <label style={{ display:'flex',alignItems:'center',gap:8 }}>
            <input type="checkbox" checked={!!form.estDisponible} onChange={(e)=>setForm({...form, estDisponible:e.target.checked})} /> Disponible
          </label>
        </div>
      </Modal>
    </div>
  )
}
