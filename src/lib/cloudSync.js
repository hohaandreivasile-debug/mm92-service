// src/lib/cloudSync.js — Cloud sync for all app data via Supabase
import { supabase, isOnline } from './supabase';

// Table: cloud_data (key-value JSONB store)
// CREATE TABLE cloud_data (
//   id TEXT PRIMARY KEY,
//   data JSONB NOT NULL,
//   updated_at TIMESTAMPTZ DEFAULT now(),
//   updated_by UUID REFERENCES auth.users(id)
// );
// ALTER TABLE cloud_data DISABLE ROW LEVEL SECURITY;

const KEYS = {
  MM92: 'mm92_service_data',
  PW56: 'mm92_pw56_data', 
  DAILY: 'mm92_daily_log',
  HIST_MM92: 'mm92_report_history',
  HIST_PW56: 'pw56_report_history',
  CUSTOM_NAMES: 'mm92_custom_names'
};

let _saveTimers = {};
let _syncStatus = 'idle'; // idle, saving, saved, error
let _onStatusChange = null;

export function onSyncStatusChange(cb) { _onStatusChange = cb; }
export function getSyncStatus() { return _syncStatus; }

function setStatus(s) {
  _syncStatus = s;
  if (_onStatusChange) _onStatusChange(s);
}

// ─── SAVE TO CLOUD (debounced) ───
export function saveToCloud(key, data, debounceMs = 2000) {
  if (!isOnline() || !supabase) return;
  
  if (_saveTimers[key]) clearTimeout(_saveTimers[key]);
  _saveTimers[key] = setTimeout(async () => {
    setStatus('saving');
    try {
      const user = (await supabase.auth.getUser())?.data?.user;
      const { error } = await supabase
        .from('cloud_data')
        .upsert({
          id: key,
          data: data,
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null
        }, { onConflict: 'id' });
      
      if (error) {
        console.warn(`Cloud save error [${key}]:`, error.message);
        setStatus('error');
      } else {
        setStatus('saved');
      }
    } catch (e) {
      console.warn(`Cloud save failed [${key}]:`, e.message);
      setStatus('error');
    }
  }, debounceMs);
}

// ─── LOAD FROM CLOUD ───
export async function loadFromCloud(key) {
  if (!isOnline() || !supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('cloud_data')
      .select('data, updated_at')
      .eq('id', key)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') { // not "no rows" error
        console.warn(`Cloud load error [${key}]:`, error.message);
      }
      return null;
    }
    return data?.data || null;
  } catch (e) {
    console.warn(`Cloud load failed [${key}]:`, e.message);
    return null;
  }
}

// ─── LOAD ALL DATA (cloud-first, localStorage fallback) ───
export async function loadAllFromCloud() {
  if (!isOnline() || !supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('cloud_data')
      .select('id, data, updated_at');
    
    if (error) {
      console.warn('Cloud load all error:', error.message);
      return null;
    }
    
    const result = {};
    (data || []).forEach(row => {
      result[row.id] = row.data;
    });
    return result;
  } catch (e) {
    console.warn('Cloud load all failed:', e.message);
    return null;
  }
}

// ─── SYNC HELPERS ───
export function syncMM92(state) {
  saveToCloud(KEYS.MM92, state);
}

export function syncPW56(state) {
  saveToCloud(KEYS.PW56, state);
}

export function syncDailyLog(log) {
  saveToCloud(KEYS.DAILY, log);
}

export function syncHistoryMM92(history) {
  saveToCloud(KEYS.HIST_MM92, history);
}

export function syncHistoryPW56(history) {
  saveToCloud(KEYS.HIST_PW56, history);
}

export function syncCustomNames(names) {
  saveToCloud(KEYS.CUSTOM_NAMES, names, 1000);
}

export { KEYS };
