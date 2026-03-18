import { useState } from 'react'

export default function TurbineSelector({ turbines, onSelect, onCreate, T }) {
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [park, setPark] = useState('')
  const [location, setLocation] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!name || !park) return
    setCreating(true)
    try {
      const t = await onCreate(name, park, location)
      onSelect(t)
    } catch (e) {
      alert('Eroare: ' + e.message)
    }
    setCreating(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: T.bg, fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif"
    }}>
      <div style={{ width: 440, background: T.surface, borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.accent }}>Selectare Turbină</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Alegeți turbina pentru sesiunea de service</div>
        </div>

        {turbines.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            {turbines.map(t => (
              <button key={t.id} onClick={() => onSelect(t)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', background: T.surfaceAlt, border: `1px solid ${T.border}`,
                borderRadius: 10, cursor: 'pointer', marginBottom: 8, textAlign: 'left'
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, background: T.accentLight,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2">
                    <circle cx="12" cy="10" r="2"/>
                    <path d="M12 8V2.5c0-.3.2-.5.4-.4l4.5 2.6c.3.2.3.6 0 .7L12 8z"/>
                    <path d="M10.3 11l-4.8 2.8c-.3.2-.6 0-.6-.3l0-5.2c0-.3.4-.5.6-.3L10.3 11z"/>
                    <path d="M13.7 11l4.8 2.8c.3.2.2.6-.1.6l-4.5-.1c-.3 0-.5-.3-.4-.5L13.7 11z"/>
                    <line x1="12" y1="12" x2="12" y2="22"/>
                    <line x1="9" y1="22" x2="15" y2="22"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>{t.park}{t.location ? ` • ${t.location}` : ''}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!showCreate ? (
          <button onClick={() => setShowCreate(true)} style={{
            width: '100%', padding: 14, background: 'transparent', border: `2px dashed ${T.border}`,
            borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: T.textMuted
          }}>
            + Adaugă turbină nouă
          </button>
        ) : (
          <div style={{ padding: 16, background: T.surfaceAlt, borderRadius: 10, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 12 }}>Turbină nouă</div>
            {[
              ['Nume (ex: WTG 3 (92692))', name, setName],
              ['Parc eolian', park, setPark],
              ['Locație (opțional)', location, setLocation]
            ].map(([label, val, setter]) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: T.textSec }}>{label}</label>
                <input value={val} onChange={e => setter(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', border: `1px solid ${T.border}`,
                    borderRadius: 6, fontSize: 14, background: T.surface, color: T.text,
                    fontFamily: 'inherit', marginTop: 3
                  }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => setShowCreate(false)} style={{
                flex: 1, padding: 10, background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 6, cursor: 'pointer', fontSize: 13, color: T.textSec
              }}>Anulare</button>
              <button onClick={handleCreate} disabled={creating || !name || !park} style={{
                flex: 1, padding: 10, background: T.accent, color: '#fff', border: 'none',
                borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                opacity: creating ? 0.7 : 1
              }}>{creating ? 'Se creează...' : 'Creează'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
