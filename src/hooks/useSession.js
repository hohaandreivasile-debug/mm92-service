import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, isOnline } from '../lib/supabase'

const LOCAL_KEY = 'mm92_service_data'

function loadLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return fallback
    return JSON.parse(raw)[key] ?? fallback
  } catch { return fallback }
}

function saveLocal(state) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(state)) } catch {}
}

export function useSession(user) {
  const [turbines, setTurbines] = useState([])
  const [activeTurbine, setActiveTurbine] = useState(null)
  const [activeSession, setActiveSession] = useState(null)
  const [syncStatus, setSyncStatus] = useState('idle') // idle, saving, saved, error
  const saveTimer = useRef(null)

  // State per session
  const [cd, setCd] = useState(() => loadLocal('cd', {}))
  const [rp, setRp] = useState(() => loadLocal('rp', { parc: '', serie: '' }))
  const [iss, setIss] = useState(() => loadLocal('iss', []))
  const [bd, setBd] = useState(() => loadLocal('bd', {}))
  const [id, setId] = useState(() => loadLocal('id', { defects: [] }))
  const [sg, setSg] = useState(() => loadLocal('sg', {}))
  const [photos, setPhotos] = useState(() => loadLocal('photos', []))
  const [itemPhotos, setItemPhotos] = useState(() => loadLocal('itemPhotos', []))
  const [procedures, setProcedures] = useState(() => loadLocal('procedures', []))
  const [themeId, setThemeId] = useState(() => loadLocal('themeId', 'light'))

  // Load turbines list
  useEffect(() => {
    if (!isOnline() || !user) return
    loadTurbines()
  }, [user])

  async function loadTurbines() {
    const { data } = await supabase.from('turbines').select('*').order('name')
    if (data) setTurbines(data)
  }

  async function createTurbine(name, park, location) {
    const { data, error } = await supabase
      .from('turbines')
      .insert({ name, park, location })
      .select()
      .single()
    if (error) throw error
    await loadTurbines()
    return data
  }

  // Load session for a turbine
  async function selectTurbine(turbine) {
    setActiveTurbine(turbine)
    if (!isOnline()) return

    // Find latest session for this turbine
    const { data: sessions } = await supabase
      .from('service_sessions')
      .select('*')
      .eq('turbine_id', turbine.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (sessions?.length > 0) {
      const s = sessions[0]
      setActiveSession(s)
      setCd(s.check_data || {})
      setRp(s.report_data || {})
      setIss(s.issues || [])
      setBd(s.bolt_data || {})
      setId(s.inspection_data || {})
      setSg(s.signatures || {})
      // Load photos from storage
      await loadPhotos(s.id)
    } else {
      // Create new session
      await createSession(turbine)
    }
  }

  async function createSession(turbine) {
    const { data, error } = await supabase
      .from('service_sessions')
      .insert({
        turbine_id: turbine.id,
        created_by: user.id,
        report_data: { parc: turbine.park, serie: turbine.name }
      })
      .select()
      .single()
    if (error) throw error
    setActiveSession(data)
    setCd({})
    setRp({ parc: turbine.park, serie: turbine.name })
    setIss([])
    setBd({})
    setId({ defects: [] })
    setSg({})
    setPhotos([])
    setItemPhotos([])
    return data
  }

  async function loadPhotos(sessionId) {
    const { data } = await supabase
      .from('photos')
      .select('*')
      .eq('session_id', sessionId)
    // Photos are stored with URLs; we load them differently than base64
    if (data) {
      const loaded = await Promise.all(data.map(async (p) => {
        if (p.file_path) {
          const { data: urlData } = supabase.storage
            .from('photos')
            .getPublicUrl(p.file_path)
          return { ...p, data: urlData?.publicUrl }
        }
        return p
      }))
      setPhotos(loaded.filter(p => !p.item_id))
      setItemPhotos(loaded.filter(p => p.item_id))
    }
  }

  // Auto-save with debounce
  useEffect(() => {
    // Always save locally
    const state = { themeId, cd, rp, iss, bd, id, sg, photos, itemPhotos, procedures }
    saveLocal(state)

    // Save to Supabase if online and session exists
    if (!isOnline() || !activeSession) return

    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSyncStatus('saving')

    saveTimer.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('service_sessions')
          .update({
            check_data: cd,
            report_data: rp,
            issues: iss,
            bolt_data: bd,
            inspection_data: id,
            signatures: sg
          })
          .eq('id', activeSession.id)

        if (error) throw error
        setSyncStatus('saved')
      } catch (e) {
        console.error('Sync error:', e)
        setSyncStatus('error')
      }
    }, 2000)

    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [cd, rp, iss, bd, id, sg, themeId])

  // Upload photo to Supabase Storage
  async function uploadPhoto(file, itemId, sectionId, caption) {
    if (!isOnline() || !activeSession) return null

    const ext = file.name.split('.').pop()
    const path = `${activeSession.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(path, file)
    if (uploadError) throw uploadError

    const { data: record } = await supabase
      .from('photos')
      .insert({
        session_id: activeSession.id,
        item_id: itemId || null,
        section_id: sectionId || null,
        caption,
        file_path: path,
        file_name: file.name,
        created_by: user.id
      })
      .select()
      .single()

    return record
  }

  // Upload procedure PDF
  async function uploadProcedure(file, description, sections) {
    if (!isOnline()) return null

    const path = `procedures/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('procedures')
      .upload(path, file)
    if (uploadError) throw uploadError

    const { data } = await supabase
      .from('procedures')
      .insert({
        name: file.name,
        description,
        file_path: path,
        file_size: Math.round(file.size / 1024),
        sections,
        created_by: user.id
      })
      .select()
      .single()

    return data
  }

  // Load procedures
  useEffect(() => {
    if (!isOnline()) return
    supabase.from('procedures').select('*').then(({ data }) => {
      if (data) setProcedures(data)
    })
  }, [])

  return {
    // Turbines
    turbines, activeTurbine, selectTurbine, createTurbine,
    // Session
    activeSession, createSession: () => activeTurbine && createSession(activeTurbine),
    // State
    cd, setCd, rp, setRp, iss, setIss, bd, setBd,
    id, setId, sg, setSg, photos, setPhotos,
    itemPhotos, setItemPhotos, procedures, setProcedures,
    themeId, setThemeId,
    // Sync
    syncStatus,
    // Upload
    uploadPhoto, uploadProcedure
  }
}
