import React from 'react'
import ReactDOM from 'react-dom/client'
import { isOnline } from './lib/supabase'
import AppWrapper from './components/AppWrapper'
import App from './App'

// If Supabase is configured → use auth flow (AppWrapper)
// If not configured → use direct App (offline mode)
const Root = isOnline() ? AppWrapper : App

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
