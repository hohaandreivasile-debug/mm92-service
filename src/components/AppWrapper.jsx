import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSession } from '../hooks/useSession'
import { isOnline } from '../lib/supabase'
import Login from './Login'
import TurbineSelector from './TurbineSelector'
import App from '../App'

// Theme for login/selector (before user picks theme)
const DEFAULT_T = {
  bg:"#f0f4f8",surface:"#ffffff",surfaceAlt:"#f8fafc",text:"#0f172a",
  textSec:"#475569",textMuted:"#94a3b8",border:"#e2e8f0",accent:"#2563eb",
  accentLight:"#dbeafe",ok:"#16a34a",okBg:"#dcfce7",nok:"#dc2626",nokBg:"#fee2e2"
}

export default function AppWrapper() {
  const { user, profile, loading, signIn, signOut, isOnline: online } = useAuth()
  const session = useSession(user)

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: DEFAULT_T.bg,
        fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", gap: 16
      }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;800&display=swap" rel="stylesheet" />
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={DEFAULT_T.accent} strokeWidth="2" style={{ animation: 'spin 1.5s linear infinite' }}>
          <circle cx="12" cy="10" r="2"/>
          <path d="M12 8V2.5c0-.3.2-.5.4-.4l4.5 2.6c.3.2.3.6 0 .7L12 8z"/>
          <path d="M10.3 11l-4.8 2.8c-.3.2-.6 0-.6-.3l0-5.2c0-.3.4-.5.6-.3L10.3 11z"/>
          <path d="M13.7 11l4.8 2.8c.3.2.2.6-.1.6l-4.5-.1c-.3 0-.5-.3-.4-.5L13.7 11z"/>
          <line x1="12" y1="12" x2="12" y2="22"/>
        </svg>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        <div style={{ fontSize: 14, color: DEFAULT_T.textMuted }}>Se încarcă...</div>
      </div>
    )
  }

  // Not logged in → show login
  if (!user && online) {
    return <Login onLogin={signIn} T={DEFAULT_T} />
  }

  // Go directly to main app (turbine selection is inside the app via fleet.js)
  return (
    <App
      session={session}
      user={user}
      profile={profile}
      signOut={signOut}
      isOnlineMode={online}
    />
  )
}
