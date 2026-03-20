// src/components/DailyLog.jsx — Interventions: Local + Remote
import { useState, useRef } from "react";
import { Camera, Eye, CalendarDays } from "lucide-react";
import { getAllTurbines } from "../data/fleet";
import ReadAloud from "./ReadAloud";

const SpeechRec = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
const ALL_TURBINES = getAllTurbines();

const INT_TYPES = [
  { value: "corrective", label: "Corectivă", color: "#dc2626" },
  { value: "preventive", label: "Preventivă", color: "#2563eb" },
  { value: "inspection", label: "Inspecție", color: "#059669" },
  { value: "repair", label: "Reparație", color: "#d97706" },
  { value: "replacement", label: "Înlocuire", color: "#7c3aed" },
  { value: "lubrication", label: "Lubrifiere", color: "#0891b2" },
  { value: "electrical", label: "Electrică", color: "#db2777" },
  { value: "scada", label: "SCADA", color: "#4f46e5" },
  { value: "other", label: "Altele", color: "#6b7280" }
];
const STATUS_TYPES = [
  { value: "completed", label: "Finalizat", color: "#16a34a", icon: "✓" },
  { value: "in_progress", label: "În lucru", color: "#d97706", icon: "⏳" },
  { value: "pending_parts", label: "Așt. piese", color: "#dc2626", icon: "🔧" },
  { value: "postponed", label: "Amânat", color: "#6b7280", icon: "⏸" },
  { value: "escalated", label: "Escaladat", color: "#7c3aed", icon: "⬆" }
];
const RESET_STATUS = [
  { value: "not_attempted", label: "Neresetat" },
  { value: "reset_ok", label: "Reset reușit ✓" },
  { value: "reset_failed", label: "Reset eșuat ✗" },
  { value: "partial", label: "Parțial rezolvat" },
  { value: "recurring", label: "Eroare recurentă" }
];

// Shared: Turbine selector row
function TurbineSelect({ entry, upd, T }) {
  const selStyle = { width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, background: T.surface, color: T.text, minHeight: 42 };
  const parks = [...new Set(ALL_TURBINES.map(t => t.park))];
  const turbinesForPark = ALL_TURBINES.filter(t => t.park === entry.park);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
      <div><label style={{ fontSize: 11, fontWeight: 700, color: T.textSec }}>Parc eolian</label>
        <select value={entry.park || ""} onChange={e => {
          upd("park", e.target.value); upd("turbine", ""); upd("serial", ""); upd("turbineType", "");
        }} style={selStyle}>
          <option value="">— Parc —</option>
          {parks.map(p => <option key={p} value={p}>{p}</option>)}
        </select></div>
      <div><label style={{ fontSize: 11, fontWeight: 700, color: T.textSec }}>Turbina</label>
        <select value={entry.turbine || ""} onChange={e => {
          const t = turbinesForPark.find(x => x.label === e.target.value);
          upd("turbine", e.target.value);
          upd("serial", t?.serial || "");
          upd("turbineType", t?.turbineType || "");
        }} style={selStyle} disabled={!entry.park}>
          <option value="">— Turbina —</option>
          {turbinesForPark.map(t => <option key={t.id} value={t.label}>{t.label}</option>)}
        </select></div>
      <div><label style={{ fontSize: 11, fontWeight: 700, color: T.textSec }}>Nr. serie</label>
        <input value={entry.serial || ""} readOnly style={{ ...selStyle, background: T.surfaceAlt, fontWeight: 700 }} /></div>
    </div>
  );
}

// Voice mic button
function VMic({ T, onResult }) {
  const [rec, setRec] = useState(false);
  const ref = useRef(null);
  const toggle = () => {
    if (!SpeechRec) { alert("Browser incompatibil. Folosiți Chrome/Edge."); return; }
    if (rec) { ref.current?.stop(); setRec(false); return; }
    const r = new SpeechRec(); r.lang = "ro-RO"; r.continuous = true; r.interimResults = false;
    r.onresult = e => { let t = ""; for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) t += e.results[i][0].transcript + " "; onResult(t.trim()); };
    r.onerror = () => setRec(false); r.onend = () => setRec(false);
    r.start(); ref.current = r; setRec(true);
  };
  return (<button onClick={toggle} style={{ width: 40, height: 40, borderRadius: "50%", border: `2px solid ${rec ? T.nok : T.border}`, background: rec ? T.nokBg : T.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, animation: rec ? "pulse 1.2s infinite" : "none" }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill={rec ? T.nok : "none"} stroke={rec ? T.nok : T.textMuted} strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
  </button>);
}

// Textarea + voice
function VField({ label, value, onChange, T, rows = 3, placeholder }) {
  return (<div>
    <label style={{ fontSize: 11, fontWeight: 700, color: T.textSec }}>{label}</label>
    <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
      <textarea value={value || ""} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder || label + "..."}
        style={{ flex: 1, fontSize: 14, padding: "10px", border: `1px solid ${T.border}`, borderRadius: 8, background: T.surface, color: T.text, fontFamily: "inherit", resize: "vertical", minHeight: rows === 2 ? 60 : 80 }} />
      <VMic T={T} onResult={txt => onChange((value || "") + (value ? " " : "") + txt)} />
    </div>
  </div>);
}

// Media section (photos/video/screenshots)
function MediaSection({ entry, upd, T, label = "Fotografii / Video" }) {
  const camRef = useRef(null), vidRef = useRef(null), galRef = useRef(null);
  const media = entry.media || [];

  const addMedia = (files) => {
    Array.from(files).forEach(f => {
      const isV = f.type.startsWith("video/"), isI = f.type.startsWith("image/");
      if (!isI && !isV) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (isI) {
          const img = new Image(); img.onload = () => {
            const c = document.createElement("canvas"); const M = 1200; let w = img.width, h = img.height;
            if (w > M || h > M) { const r = Math.min(M / w, M / h); w *= r; h *= r; }
            c.width = w; c.height = h; c.getContext("2d").drawImage(img, 0, 0, w, h);
            upd("media", [...media, { id: Date.now() + Math.random(), type: "image", name: f.name, data: c.toDataURL("image/jpeg", 0.85), timestamp: new Date().toLocaleTimeString("ro-RO") }]);
          }; img.src = ev.target.result;
        } else {
          upd("media", [...media, { id: Date.now() + Math.random(), type: "video", name: f.name, data: ev.target.result, mimeType: f.type, size: Math.round(f.size / 1024), timestamp: new Date().toLocaleTimeString("ro-RO") }]);
        }
      }; reader.readAsDataURL(f);
    });
  };
  const delM = (mid) => upd("media", media.filter(m => m.id !== mid));

  return (<div style={{ marginTop: 4 }}>
    <label style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 8, display: "block" }}>{label}</label>
    <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
      {[["Cameră foto", camRef, "image/*", Camera], ["Cameră video", vidRef, "video/*", null], ["Din galerie", galRef, "image/*,video/*", Eye]].map(([lbl, ref, acc, Icon], i) => (
        <button key={i} onClick={() => ref.current?.click()} style={{ padding: "8px 14px", border: `2px dashed ${T.border}`, borderRadius: 8, background: T.surfaceAlt, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: T.text, minHeight: 38 }}>
          {Icon ? <Icon size={16} color={T.accent} /> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>}
          {lbl}
        </button>
      ))}
    </div>
    <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={e => { if (e.target.files) addMedia(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
    <input ref={vidRef} type="file" accept="video/*" capture="environment" onChange={e => { if (e.target.files) addMedia(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
    <input ref={galRef} type="file" accept="image/*,video/*" multiple onChange={e => { if (e.target.files) addMedia(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
    {media.length === 0 && <div style={{ padding: 12, textAlign: "center", color: T.textMuted, fontSize: 12, background: T.surfaceAlt, borderRadius: 8 }}>Fără fișiere media.</div>}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120,1fr))", gap: 6 }}>
      {media.map(m => (<div key={m.id} style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: `1px solid ${m.type === "video" ? T.accent : T.border}` }}>
        {m.type === "video" ? (
          <div onClick={() => { const w = window.open(); w.document.write(`<video src="${m.data}" controls autoplay style="max-width:100%;max-height:100vh;margin:auto;display:block"/>`); }}
            style={{ height: 80, background: T.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={T.accent + "44"} stroke={T.accent} strokeWidth="1.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          </div>
        ) : (
          <img src={m.data} alt="" onClick={() => { const w = window.open(); w.document.write(`<img src="${m.data}" style="max-width:100%;max-height:100vh;margin:auto;display:block"/>`); }}
            style={{ width: "100%", height: 80, objectFit: "cover", display: "block", cursor: "pointer" }} />
        )}
        <button onClick={() => delM(m.id)} style={{ position: "absolute", top: 2, right: 2, width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>))}
    </div>
  </div>);
}

// Generate share text for an intervention
function shareText(entry) {
  const ti = INT_TYPES.find(t => t.value === entry.type) || { label: entry.type };
  const si = STATUS_TYPES.find(s => s.value === entry.status) || { label: entry.status };
  const isRemote = entry.mode === "remote";
  let txt = `${isRemote ? "🖥️ INTERVENȚIE REMOTE" : "🔧 INTERVENȚIE LOCALĂ"} — Blue Line Energy\n`;
  txt += `━━━━━━━━━━━━━━━━━━━━\n`;
  txt += `📅 ${entry.date} ${entry.time}\n`;
  if (entry.park) txt += `📍 ${entry.park}`;
  if (entry.turbine) txt += ` • ${entry.turbine}`;
  if (entry.serial) txt += ` (S/N: ${entry.serial})`;
  if (entry.park) txt += `\n`;
  txt += `🏷️ Tip: ${ti.label} | Status: ${si.label}\n`;
  if (entry.priority === "urgent") txt += `🚨 URGENT\n`;
  if (entry.planned === false) txt += `⚡ NEPLANIFICATĂ\n`;
  if (entry.duration) txt += `⏱️ Durată: ${entry.duration}h\n`;
  if (isRemote && entry.errorCode) {
    txt += `\n❌ Cod eroare: ${entry.errorCode}\n`;
    const rs = RESET_STATUS.find(r => r.value === entry.resetStatus);
    if (rs) txt += `🔄 Reset: ${rs.label}\n`;
    if (entry.errorDescription) txt += `📋 Eroare: ${entry.errorDescription}\n`;
  }
  txt += `\n`;
  if (entry.description) txt += `📝 Problemă:\n${entry.description}\n\n`;
  if (entry.actions) txt += `✅ Acțiuni:\n${entry.actions}\n\n`;
  if (entry.parts) txt += `🔧 Piese: ${entry.parts}\n`;
  if (entry.technician) txt += `👷 Tehnician: ${entry.technician}\n`;
  if (entry.notes) txt += `📌 Note: ${entry.notes}\n`;
  const mc = (entry.media || []).length;
  if (mc > 0) txt += `\n📸 ${mc} fișier${mc > 1 ? "e" : ""} media atașat${mc > 1 ? "e" : ""}\n`;
  return txt;
}

function shareEmail(entry) {
  const subject = encodeURIComponent(`[${entry.mode === "remote" ? "Remote" : "Local"}] ${entry.date} — ${entry.park || ""} ${entry.turbine || ""} ${entry.errorCode ? "Err:" + entry.errorCode : ""}`);
  const body = encodeURIComponent(shareText(entry));
  window.open(`mailto:?subject=${subject}&body=${body}`);
}

function shareWhatsApp(entry) {
  const text = encodeURIComponent(shareText(entry));
  window.open(`https://wa.me/?text=${text}`, "_blank");
}

// Generate intervention PDF
function genIntPDF(entry, T) {
  const e = s => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const ti = INT_TYPES.find(t => t.value === entry.type) || { label: entry.type, color: "#666" };
  const si = STATUS_TYPES.find(s => s.value === entry.status) || { label: entry.status, color: "#666" };
  const isRemote = entry.mode === "remote";
  let h = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Intervenție ${e(entry.date)}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;padding:24px;max-width:800px;margin:0 auto}
h1{font-size:18px;color:#0c1929;border-bottom:3px solid #2563eb;padding-bottom:6px;margin-bottom:14px}
.row{display:flex;gap:20px;margin-bottom:10px}.col{flex:1}.lbl{font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;margin-bottom:2px}
.val{font-size:13px;padding:6px 0;border-bottom:1px solid #e2e8f0;min-height:24px}.badge{display:inline-block;padding:3px 10px;border-radius:5px;font-size:11px;font-weight:700}
.section{margin-top:16px;padding-top:12px;border-top:1px solid #e2e8f0}
.pg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}
.pg img{width:100%;height:120px;object-fit:cover;border-radius:4px;border:1px solid #e2e8f0}
@media print{body{padding:12px}}</style></head><body>`;
  h += `<div style="display:flex;justify-content:space-between;margin-bottom:16px"><div><div style="font-size:16px;font-weight:800;color:#2563eb">BLUE LINE ENERGY</div><div style="font-size:11px;color:#64748b">${isRemote ? "Intervenție Remote" : "Intervenție Locală"} — ${e(entry.turbineType || "")}</div></div><div style="text-align:right;font-size:10px;color:#64748b">Data: ${e(entry.date)}<br>Ora: ${e(entry.time)}</div></div>`;
  h += `<h1>${isRemote ? "Raport Intervenție Remote" : "Raport Intervenție Locală"}${entry.priority === "urgent" ? ' <span style="color:#dc2626">— URGENT</span>' : ""}${entry.planned === false ? ' <span style="color:#d97706">— NEPLANIFICATĂ</span>' : ""}</h1>`;
  h += `<div class="row"><div class="col"><div class="lbl">Parc</div><div class="val">${e(entry.park)}</div></div><div class="col"><div class="lbl">Turbina</div><div class="val">${e(entry.turbine)}</div></div><div class="col"><div class="lbl">Nr. Serie</div><div class="val">${e(entry.serial)}</div></div></div>`;
  h += `<div class="row"><div class="col"><div class="lbl">Data</div><div class="val">${e(entry.date)}</div></div><div class="col"><div class="lbl">Ora</div><div class="val">${e(entry.time)}</div></div><div class="col"><div class="lbl">Durată</div><div class="val">${e(entry.duration) || "—"} ore</div></div></div>`;
  h += `<div class="row"><div class="col"><div class="lbl">Tip</div><div class="val"><span class="badge" style="background:${ti.color}18;color:${ti.color}">${e(ti.label)}</span></div></div><div class="col"><div class="lbl">Status</div><div class="val"><span class="badge" style="background:${si.color}18;color:${si.color}">${e(si.label)}</span></div></div></div>`;
  if (isRemote) {
    const rs = RESET_STATUS.find(r => r.value === entry.resetStatus) || { label: entry.resetStatus };
    h += `<div class="section"><div class="lbl">Cod eroare</div><div class="val" style="font-size:18px;font-weight:700;color:#dc2626">${e(entry.errorCode) || "—"}</div></div>`;
    h += `<div class="section"><div class="lbl">Status după reset</div><div class="val">${e(rs.label)}</div></div>`;
    if (entry.errorDescription) h += `<div class="section"><div class="lbl">Descriere eroare</div><div class="val" style="white-space:pre-wrap">${e(entry.errorDescription)}</div></div>`;
  }
  h += `<div class="section"><div class="lbl">${isRemote ? "Descriere eveniment" : "Descriere problemă"}</div><div class="val" style="white-space:pre-wrap;min-height:40px">${e(entry.description) || "—"}</div></div>`;
  h += `<div class="section"><div class="lbl">Acțiuni efectuate</div><div class="val" style="white-space:pre-wrap;min-height:40px">${e(entry.actions) || "—"}</div></div>`;
  if (entry.parts) h += `<div class="section"><div class="lbl">Piese</div><div class="val">${e(entry.parts)}</div></div>`;
  if (entry.notes) h += `<div class="section"><div class="lbl">Observații</div><div class="val">${e(entry.notes)}</div></div>`;
  if (entry.media?.length > 0) {
    h += `<div class="section"><div class="lbl">${isRemote ? "Capturi ecran / Fotografii" : "Fotografii / Video"} (${entry.media.length})</div><div class="pg">`;
    entry.media.forEach(m => { if (m.type === "video") h += `<div style="height:120px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;border-radius:4px;border:1px solid #e2e8f0;font-size:11px;color:#64748b">🎥 ${e(m.name)}</div>`; else h += `<img src="${m.data}"/>`; });
    h += `</div></div>`;
  }
  h += `<div style="margin-top:30px;display:grid;grid-template-columns:1fr 1fr;gap:20px"><div><div class="lbl">Semnătura tehnician</div><div style="border-bottom:1px solid #1a1a1a;height:40px;margin-top:20px"></div></div><div><div class="lbl">Semnătura verificator</div><div style="border-bottom:1px solid #1a1a1a;height:40px;margin-top:20px"></div></div></div>`;
  h += `</body></html>`;
  const w = window.open("", "_blank"); w.document.write(h); w.document.close(); setTimeout(() => w.print(), 500);
}

// ─── MAIN COMPONENT ───
export default function DailyLog({ T, dailyLog, setDailyLog }) {
  const today = new Date().toISOString().slice(0, 10);
  const [subTab, setSubTab] = useState("local"); // local | remote
  const [activeId, setActiveId] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [filterPark, setFilterPark] = useState("");

  const addEntry = (mode) => {
    const ne = {
      id: Date.now(), mode, date: today,
      time: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
      type: mode === "remote" ? "scada" : "corrective", status: "in_progress",
      planned: true, park: "", turbine: "", serial: "", turbineType: "",
      description: "", actions: "", duration: "", technician: "",
      parts: "", notes: "", priority: "normal", media: [],
      // Remote-specific
      errorCode: "", errorDescription: "", resetStatus: "not_attempted"
    };
    setDailyLog(p => [ne, ...p]);
    setActiveId(ne.id);
  };

  const upd = (id, k, v) => setDailyLog(p => p.map(x => x.id === id ? { ...x, [k]: v } : x));
  const del = (id) => { if (confirm("Ștergeți?")) { setDailyLog(p => p.filter(x => x.id !== id)); if (activeId === id) setActiveId(null); } };
  const dup = (entry) => { const ne = { ...entry, id: Date.now(), date: today, time: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }), media: [...(entry.media || [])] }; setDailyLog(p => [ne, ...p]); setActiveId(ne.id); };

  const mode = subTab;
  const filtered = dailyLog.filter(e => {
    const eMode = e.mode || "local";
    if (eMode !== mode) return false;
    if (filterDate && e.date !== filterDate) return false;
    if (filterPark && e.park !== filterPark) return false;
    return true;
  });
  const totalH = filtered.reduce((s, e) => s + (parseFloat(e.duration) || 0), 0);
  const active = activeId ? dailyLog.find(x => x.id === activeId) : null;
  const parks = [...new Set(ALL_TURBINES.map(t => t.park))];

  // ─── DETAIL VIEW ───
  if (active) {
    const ti = INT_TYPES.find(t => t.value === active.type) || INT_TYPES[8];
    const si = STATUS_TYPES.find(s => s.value === active.status) || STATUS_TYPES[0];
    const isRemote = active.mode === "remote";
    const U = (k, v) => upd(active.id, k, v);

    return (<div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button onClick={() => setActiveId(null)} style={{ padding: "8px 14px", border: `1px solid ${T.border}`, borderRadius: 8, background: T.surface, cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.text, minHeight: 40, display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg> Înapoi
        </button>
        <span style={{ padding: "4px 12px", borderRadius: 6, background: isRemote ? "#4f46e518" : "#05966918", color: isRemote ? "#4f46e5" : "#059669", fontWeight: 700, fontSize: 13 }}>{isRemote ? "🖥️ REMOTE" : "🔧 LOCALĂ"}</span>
        {!active.planned && <span style={{ padding: "4px 10px", borderRadius: 6, background: T.warnBg, color: T.warn, fontWeight: 700, fontSize: 12 }}>NEPLANIFICATĂ</span>}
        {active.priority === "urgent" && <span style={{ padding: "4px 10px", borderRadius: 6, background: T.nokBg, color: T.nok, fontWeight: 700, fontSize: 12 }}>URGENT</span>}
        <span style={{ flex: 1 }} />
        <button onClick={() => genIntPDF(active, T)} style={{ padding: "8px 14px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12, minHeight: 38 }}>PDF</button>
        <ReadAloud text={shareText(active)} T={T} label="Citește" />
        <button onClick={() => shareEmail(active)} title="Trimite pe email" style={{ padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: 8, background: T.surface, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: T.text, minHeight: 38 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          Email
        </button>
        <button onClick={() => shareWhatsApp(active)} title="Trimite pe WhatsApp" style={{ padding: "8px 12px", border: "1px solid #25D366", borderRadius: 8, background: "#25D36612", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#128C7E", fontWeight: 600, minHeight: 38 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </button>
        <button onClick={() => dup(active)} style={{ padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: 8, background: T.surface, cursor: "pointer", fontSize: 12 }}>Duplică</button>
        <button onClick={() => del(active.id)} style={{ padding: "8px 12px", border: `1px solid ${T.nok}44`, borderRadius: 8, background: T.nokBg, cursor: "pointer", fontSize: 12, color: T.nok, fontWeight: 600 }}>Șterge</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Turbine selector */}
        <TurbineSelect entry={active} upd={(k, v) => U(k, v)} T={T} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div><label style={{ fontSize: 11, fontWeight: 700, color: T.textSec }}>Data</label>
            <input type="date" value={active.date} onChange={e => U("date", e.target.value)} style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, background: T.surface, color: T.text, minHeight: 42 }} /></div>
          <div><label style={{ fontSize: 11, fontWeight: 700, color: T.textSec }}>Ora</label>
            <input value={active.time} onChange={e => U("time", e.target.value)} style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, background: T.surface, color: T.text, minHeight: 42 }} /></div>
          <div><label style={{ fontSize: 11, fontWeight: 700, color: T.textSec }}>Durată (ore)</label>
            <input type="number" step="0.5" min="0" value={active.duration} onChange={e => U("duration", e.target.value)} placeholder="ex: 2.5"
              style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, background: T.surface, color: T.text, minHeight: 42 }} /></div>
        </div>

        {/* Planned / Type / Status / Priority */}
        <div style={{ display: "grid", gridTemplateColumns: !isRemote ? "auto 1fr 1fr 1fr" : "1fr 1fr 1fr", gap: 10 }}>
          {!isRemote && <div><label style={{ fontSize: 11, fontWeight: 700, color: T.textSec }}>Planificată</label>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              {[true, false].map(v => (<button key={String(v)} onClick={() => U("planned", v)} style={{ padding: "8px 14px", borderRadius: 8, border: active.planned === v ? `2px solid ${v ? T.ok : T.warn}` : `1px solid ${T.border}`, background: active.planned === v ? (v ? T.okBg : T.warnBg) : T.surface, color: active.planned === v ? (v ? T.ok : T.warn) : T.textMuted, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>{v ? "Da" : "Nu"}</button>))}
            </div></div>}
          <div><label style={{ fontSize: 11, fontWeight: 700, color: T.textSec }}>Tip</label>
            <select value={active.type} onChange={e => U("type", e.target.value)} style={{ width: "100%", padding: "8px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, background: T.surface, color: T.text, minHeight: 42 }}>
              {INT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
          <div><label style={{ fontSize: 11, fontWeight: 700, color: T.textSec }}>Status</label>
            <select value={active.status} onChange={e => U("status", e.target.value)} style={{ width: "100%", padding: "8px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, background: T.surface, color: T.text, minHeight: 42 }}>
              {STATUS_TYPES.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}</select></div>
          <div><label style={{ fontSize: 11, fontWeight: 700, color: T.textSec }}>Prioritate</label>
            <select value={active.priority} onChange={e => U("priority", e.target.value)} style={{ width: "100%", padding: "8px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, background: T.surface, color: T.text, minHeight: 42 }}>
              <option value="normal">Normal</option><option value="urgent">Urgent</option><option value="low">Scăzut</option></select></div>
        </div>

        {/* Remote-specific fields */}
        {isRemote && <>
          <div style={{ padding: 14, background: "#4f46e510", borderRadius: 10, border: "1px solid #4f46e533" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5", marginBottom: 10 }}>Date eroare SCADA</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={{ fontSize: 11, fontWeight: 700, color: T.textSec }}>Cod eroare</label>
                <input value={active.errorCode || ""} onChange={e => U("errorCode", e.target.value)} placeholder="ex: E-401, F-203"
                  style={{ width: "100%", padding: "10px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 18, fontWeight: 700, background: T.surface, color: T.nok, minHeight: 48, fontFamily: "monospace" }} /></div>
              <div><label style={{ fontSize: 11, fontWeight: 700, color: T.textSec }}>Status după reset</label>
                <select value={active.resetStatus || "not_attempted"} onChange={e => U("resetStatus", e.target.value)}
                  style={{ width: "100%", padding: "10px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, background: T.surface, color: T.text, minHeight: 48 }}>
                  {RESET_STATUS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
            </div>
            <div style={{ marginTop: 10 }}>
              <VField label="Descriere eroare / context" value={active.errorDescription} onChange={v => U("errorDescription", v)} T={T} rows={2} placeholder="Ce indică eroarea, în ce condiții a apărut..." />
            </div>
          </div>
          <MediaSection entry={active} upd={(k, v) => U(k, v)} T={T} label="Capturi ecran / Screenshot-uri" />
        </>}

        <VField label={isRemote ? "Descriere eveniment" : "Descriere problemă / motiv intervenție"} value={active.description} onChange={v => U("description", v)} T={T} />
        <VField label="Acțiuni efectuate" value={active.actions} onChange={v => U("actions", v)} T={T} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={{ fontSize: 11, fontWeight: 700, color: T.textSec }}>Tehnician</label>
            <input value={active.technician} onChange={e => U("technician", e.target.value)} style={{ width: "100%", padding: "10px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, background: T.surface, color: T.text, minHeight: 42 }} /></div>
          <VField label="Piese utilizate" value={active.parts} onChange={v => U("parts", v)} T={T} rows={2} />
        </div>

        <VField label="Observații suplimentare" value={active.notes} onChange={v => U("notes", v)} T={T} rows={2} />

        {!isRemote && <MediaSection entry={active} upd={(k, v) => U(k, v)} T={T} />}
      </div>
    </div>);
  }

  // ─── LIST VIEW ───
  return (<div>
    {/* Sub-tabs */}
    <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
      {[["local", "🔧 Intervenții Locale"], ["remote", "🖥️ Intervenții Remote"]].map(([id, lbl]) => {
        const cnt = dailyLog.filter(e => (e.mode || "local") === id).length;
        return (<button key={id} onClick={() => { setSubTab(id); setActiveId(null); }} style={{
          flex: 1, padding: "12px", border: subTab === id ? `2px solid ${T.accent}` : `1px solid ${T.border}`,
          background: subTab === id ? T.accentLight : T.surface, color: subTab === id ? T.accent : T.text,
          borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8
        }}>{lbl}{cnt > 0 && <span style={{ fontSize: 11, padding: "1px 8px", borderRadius: 8, background: subTab === id ? T.accent : T.textMuted, color: "#fff" }}>{cnt}</span>}</button>);
      })}
    </div>

    {/* Filters + Add */}
    <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
      <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
        style={{ padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 14, background: T.surface, color: T.text, minHeight: 42 }} />
      <select value={filterPark} onChange={e => setFilterPark(e.target.value)}
        style={{ padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, background: T.surface, color: T.text, minHeight: 42 }}>
        <option value="">Toate parcurile</option>
        {parks.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <button onClick={() => { setFilterDate(""); setFilterPark(""); }} style={{ padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: 6, background: T.surface, color: T.textMuted, cursor: "pointer", fontSize: 12, minHeight: 42 }}>Resetare</button>
      <button onClick={() => addEntry(mode)} style={{ marginLeft: "auto", padding: "10px 18px", background: T.accent, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14, minHeight: 42, display: "flex", alignItems: "center", gap: 6 }}>
        <CalendarDays size={16} /> + {mode === "remote" ? "Intervenție remote" : "Intervenție locală"}
      </button>
    </div>

    {/* Summary */}
    {filtered.length > 0 && <div style={{ display: "flex", gap: 10, marginBottom: 12, padding: "10px 14px", background: T.surfaceAlt, borderRadius: 8, alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{filtered.length} intervenții</span>
      <span style={{ fontSize: 13, color: T.textSec }}>{totalH.toFixed(1)} ore</span>
    </div>}

    {filtered.length === 0 && <div style={{ padding: 28, textAlign: "center", color: T.textMuted, fontSize: 14, background: T.surfaceAlt, borderRadius: 8 }}>
      Nicio intervenție {mode === "remote" ? "remote" : "locală"}{filterDate || filterPark ? " pentru filtrele selectate" : ""}. Apăsați butonul de mai sus.
    </div>}

    {/* Cards */}
    {filtered.map(entry => {
      const ti = INT_TYPES.find(t => t.value === entry.type) || INT_TYPES[8];
      const si = STATUS_TYPES.find(s => s.value === entry.status) || STATUS_TYPES[0];
      const mc = (entry.media || []).length;
      const isRemote = entry.mode === "remote";
      return (<div key={entry.id} onClick={() => setActiveId(entry.id)} style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
        background: T.surfaceAlt, borderRadius: 10, border: `1px solid ${T.border}`,
        borderLeft: `5px solid ${ti.color}`, marginBottom: 6, cursor: "pointer"
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{entry.date}</span>
            <span style={{ fontSize: 11, color: T.textMuted }}>{entry.time}</span>
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: ti.color + "18", color: ti.color, fontWeight: 700 }}>{ti.label}</span>
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: si.color + "18", color: si.color, fontWeight: 700 }}>{si.icon} {si.label}</span>
            {entry.priority === "urgent" && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: T.nokBg, color: T.nok, fontWeight: 700 }}>URGENT</span>}
            {entry.planned === false && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: T.warnBg, color: T.warn, fontWeight: 700 }}>NEPLAN.</span>}
            {isRemote && entry.errorCode && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#dc262618", color: "#dc2626", fontWeight: 700, fontFamily: "monospace" }}>{entry.errorCode}</span>}
            {mc > 0 && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: T.accentLight, color: T.accent, fontWeight: 600 }}>{mc} 📷</span>}
          </div>
          <div style={{ fontSize: 13, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.description || <span style={{ color: T.textMuted, fontStyle: "italic" }}>Fără descriere</span>}</div>
          {entry.park && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{entry.park}{entry.turbine ? ` • ${entry.turbine}` : ""}{entry.serial ? ` (${entry.serial})` : ""}{entry.technician ? ` • ${entry.technician}` : ""}</div>}
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
      </div>);
    })}
  </div>);
}
