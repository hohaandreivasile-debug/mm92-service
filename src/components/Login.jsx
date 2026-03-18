import { useState } from 'react'

export default function Login({ onLogin, T }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onLogin(email, password)
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Email sau parolă incorectă'
          : err.message || 'Eroare la autentificare'
      )
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: T.bg, fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      <div style={{
        width: 380, background: T.surface, borderRadius: 16, padding: 32,
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
            <circle cx="12" cy="10" r="2"/>
            <path d="M12 8V2.5c0-.3.2-.5.4-.4l4.5 2.6c.3.2.3.6 0 .7L12 8z"/>
            <path d="M10.3 11l-4.8 2.8c-.3.2-.6 0-.6-.3l0-5.2c0-.3.4-.5.6-.3L10.3 11z"/>
            <path d="M13.7 11l4.8 2.8c.3.2.2.6-.1.6l-4.5-.1c-.3 0-.5-.3-.4-.5L13.7 11z"/>
            <line x1="12" y1="12" x2="12" y2="22"/>
            <line x1="9" y1="22" x2="15" y2="22"/>
          </svg>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.accent }}>BLUE LINE ENERGY</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Protocol Service — Senvion MM92</div>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', background: T.nokBg, color: T.nok,
            borderRadius: 8, fontSize: 13, marginBottom: 16, textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: T.textSec, display: 'block', marginBottom: 4 }}>
              Email
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tehnician@bluelineenergy.ro"
              autoComplete="email"
              style={{
                width: '100%', padding: '12px 14px', border: `1px solid ${T.border}`,
                borderRadius: 8, fontSize: 15, background: T.surface, color: T.text,
                fontFamily: 'inherit', outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: T.textSec, display: 'block', marginBottom: 4 }}>
              Parolă
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
              style={{
                width: '100%', padding: '12px 14px', border: `1px solid ${T.border}`,
                borderRadius: 8, fontSize: 15, background: T.surface, color: T.text,
                fontFamily: 'inherit', outline: 'none'
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            style={{
              width: '100%', padding: '14px', background: T.accent, color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
              opacity: loading ? 0.7 : 1, minHeight: 50
            }}
          >
            {loading ? 'Se autentifică...' : 'Autentificare'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: T.textMuted }}>
          Contactați administratorul pentru cont nou
        </div>
      </div>
    </div>
  )
}
