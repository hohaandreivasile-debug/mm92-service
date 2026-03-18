// src/components/AIAssistant.jsx — AI with history + knowledge base
import { useState, useRef, useEffect } from "react";
import { Camera, Eye, Zap } from "lucide-react";
import { isAIEnabled, getActiveProvider, identifyComponent, detectDefects, readLabel, generateReport, getSuggestions, askQuestion } from "../lib/ai";
import { loadKnowledgeBase, loadKnowledgeBaseSync, buildKnowledgeContext, buildHistoryContext, searchKnowledge } from "../lib/knowledgeBase";

const SpeechRec = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

const TOOLS = [
  { id: "identify", label: "Recunoaștere piesă", desc: "Fă o poză → AI identifică componenta", icon: "🔍", color: "#2563eb", needsImage: true },
  { id: "defects", label: "Detecție defecte", desc: "Fă o poză → AI detectează defecte vizuale", icon: "⚠️", color: "#dc2626", needsImage: true },
  { id: "ocr", label: "Citire etichetă", desc: "Fă o poză → AI citește valorile", icon: "📋", color: "#059669", needsImage: true },
  { id: "report", label: "Asistent raport", desc: "Dictează → AI completează raportul structurat", icon: "🎤", color: "#7c3aed", needsImage: false },
  { id: "suggestions", label: "Sugestii inteligente", desc: "AI analizează istoricul și oferă recomandări", icon: "💡", color: "#0891b2", needsImage: false },
  { id: "ask", label: "Întrebare liberă", desc: "Întreabă orice — AI folosește manualele și istoricul", icon: "💬", color: "#d97706", needsImage: false }
];

export default function AIAssistant({ T, dailyLog = [] }) {
  const [activeTool, setActiveTool] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [voiceText, setVoiceText] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [recording, setRecording] = useState(false);
  const [kb, setKb] = useState([]);
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const recRef = useRef(null);

  const enabled = isAIEnabled();

  useEffect(() => { 
    setKb(loadKnowledgeBaseSync()); 
    loadKnowledgeBase().then(docs => setKb(docs)).catch(() => {}); 
  }, []);

  // Build context string for AI (history + knowledge from Documentation tab)
  const getContext = (query = "") => {
    let ctx = buildHistoryContext(dailyLog, 50);
    if (query) ctx += searchKnowledge(query, 5, 3000);
    else ctx += buildKnowledgeContext(60000);
    return ctx;
  };

  const handleImage = (files) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        const M = 1200; let w = img.width, h = img.height;
        if (w > M || h > M) { const r = Math.min(M / w, M / h); w *= r; h *= r; }
        c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        setImageData(c.toDataURL("image/jpeg", 0.85));
        setResult(null); setError(null);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async () => {
    if (!activeTool) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const ctx = getContext(voiceText || questionText || "mentenanță turbină");
      let res;
      switch (activeTool) {
        case "identify": res = await identifyComponent(imageData, ctx); break;
        case "defects": res = await detectDefects(imageData, ctx); break;
        case "ocr": res = await readLabel(imageData, ctx); break;
        case "report": res = await generateReport(voiceText, ctx); break;
        case "suggestions": res = await getSuggestions(ctx, questionText); break;
        case "ask": res = await askQuestion(questionText, ctx, imageData); break;
      }
      setResult(res);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const toggleVoice = () => {
    if (!SpeechRec) { alert("Browser incompatibil. Folosiți Chrome/Edge."); return; }
    if (recording) { recRef.current?.stop(); setRecording(false); return; }
    const rec = new SpeechRec();
    rec.lang = "ro-RO"; rec.continuous = true; rec.interimResults = false;
    rec.onresult = (e) => {
      let txt = "";
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) txt += e.results[i][0].transcript + " ";
      if (activeTool === "report") setVoiceText(p => (p + " " + txt).trim());
      else setQuestionText(p => (p + " " + txt).trim());
    };
    rec.onerror = () => setRecording(false);
    rec.onend = () => setRecording(false);
    rec.start(); recRef.current = rec; setRecording(true);
  };

  const reset = () => { setActiveTool(null); setImageData(null); setResult(null); setError(null); setVoiceText(""); setQuestionText(""); };

  // ─── NOT CONFIGURED ───
  if (!enabled) {
    return (<div>
      <h2 style={{ fontSize: 18, color: T.text, marginBottom: 12 }}>Asistent AI</h2>
      <div style={{ padding: 24, background: T.warnBg, borderRadius: 12, border: `1px solid ${T.warn}44` }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.warn, marginBottom: 8 }}>API Key necesar</div>
        <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>Adăugați cel puțin o cheie API în fișierul <code style={{ background: T.surfaceAlt, padding: "2px 6px", borderRadius: 4 }}>.env</code>:</div>
        <div style={{ background: T.surface, padding: 12, borderRadius: 8, fontFamily: "monospace", fontSize: 12, marginTop: 10, color: T.text, border: `1px solid ${T.border}`, lineHeight: 2 }}>
          # Gemini (recomandat — ieftin, context mare)<br/>
          VITE_GEMINI_API_KEY=your-key<br/><br/>
          # Claude (cel mai bun la structurare)<br/>
          VITE_ANTHROPIC_API_KEY=sk-ant-api03-xxx
        </div>
        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 10 }}>
          <strong>Gemini:</strong> aistudio.google.com/apikey — gratuit 15 req/min, ~$0.0003/analiză<br/>
          <strong>Claude:</strong> console.anthropic.com — ~$0.003-0.01/analiză<br/>
          Dacă ambele sunt configurate, se folosește Gemini (mai ieftin).
        </div>
      </div>
    </div>);
  }

  return (<div>

    {/* ─── TOOL SELECTION ─── */}
    {!activeTool && (<div>
      <h2 style={{ fontSize: 18, color: T.text, marginBottom: 6 }}>Asistent AI — Senvion MM92</h2>
      <div style={{ fontSize: 13, color: T.textSec, marginBottom: 6 }}>
        AI-ul folosește {dailyLog.length > 0 ? `${dailyLog.length} intervenții din istoric` : "fără istoric"}{kb.length > 0 ? ` + ${kb.length} manuale (${kb.reduce((s, d) => s + d.pages, 0)} pag)` : ""} ca referință.
      </div>
      {kb.length === 0 && dailyLog.length === 0 && (
        <div style={{ padding: 10, background: T.warnBg, borderRadius: 8, fontSize: 12, color: T.warn, marginBottom: 12 }}>
          💡 Încărcați manuale din tab-ul "Documentație" și adăugați intervenții în "Intervenții Zilnice" — AI-ul va oferi sugestii mai bune.
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {TOOLS.map(tool => (
          <button key={tool.id} onClick={() => { setActiveTool(tool.id); setResult(null); setError(null); setImageData(null); }}
            style={{ padding: "18px 14px", background: T.surfaceAlt, border: `2px solid ${T.border}`, borderRadius: 12, cursor: "pointer", textAlign: "left", transition: "border-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = tool.color} onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>{tool.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 3 }}>{tool.label}</div>
            <div style={{ fontSize: 11, color: T.textMuted }}>{tool.desc}</div>
          </button>
        ))}
      </div>
    </div>)}

    {/* ─── ACTIVE TOOL ─── */}
    {activeTool && (() => {
      const tool = TOOLS.find(t => t.id === activeTool);
      return (<div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <button onClick={reset} style={{ padding: "8px 14px", border: `1px solid ${T.border}`, borderRadius: 8, background: T.surface, cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.text, minHeight: 40, display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg> Înapoi
          </button>
          <span style={{ fontSize: 26 }}>{tool.icon}</span>
          <div><div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{tool.label}</div><div style={{ fontSize: 12, color: T.textMuted }}>{tool.desc}</div></div>
        </div>

        {/* Image capture */}
        {tool.needsImage && (<div style={{ marginBottom: 16 }}>
          {!imageData ? (
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => cameraRef.current?.click()} style={{ flex: 1, padding: "20px", border: `2px dashed ${T.border}`, borderRadius: 10, background: T.surfaceAlt, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <Camera size={32} color={tool.color} /><span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Cameră</span></button>
              <button onClick={() => galleryRef.current?.click()} style={{ flex: 1, padding: "20px", border: `2px dashed ${T.border}`, borderRadius: 10, background: T.surfaceAlt, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <Eye size={32} color={T.textMuted} /><span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Galerie</span></button>
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={e => handleImage(e.target.files)} style={{ display: "none" }} />
              <input ref={galleryRef} type="file" accept="image/*" onChange={e => handleImage(e.target.files)} style={{ display: "none" }} />
            </div>
          ) : (
            <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}` }}>
              <img src={imageData} alt="" style={{ width: "100%", maxHeight: 350, objectFit: "contain", display: "block", background: T.bg }} />
              <button onClick={() => { setImageData(null); setResult(null); }} style={{ position: "absolute", top: 8, right: 8, padding: "6px 14px", borderRadius: 8, background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", cursor: "pointer", fontSize: 12 }}>Schimbă</button>
            </div>
          )}
        </div>)}

        {/* Text/voice input */}
        {(activeTool === "report" || activeTool === "suggestions" || activeTool === "ask") && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <textarea value={activeTool === "report" ? voiceText : questionText}
                onChange={e => activeTool === "report" ? setVoiceText(e.target.value) : setQuestionText(e.target.value)}
                placeholder={activeTool === "report" ? "Dictați sau scrieți ce ați constatat..." : activeTool === "suggestions" ? "Opțional: descrieți situația curentă..." : "Întrebare despre mentenanță MM92..."}
                rows={4} style={{ flex: 1, fontSize: 14, padding: 12, border: `1px solid ${T.border}`, borderRadius: 10, background: T.surface, color: T.text, fontFamily: "inherit", resize: "vertical", minHeight: 100 }} />
              <button onClick={toggleVoice} style={{ width: 48, height: 48, borderRadius: "50%", border: `2px solid ${recording ? T.nok : T.border}`, background: recording ? T.nokBg : T.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, animation: recording ? "pulse 1.2s infinite" : "none" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill={recording ? T.nok : "none"} stroke={recording ? T.nok : T.textMuted} strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
              </button>
            </div>
            {recording && <div style={{ fontSize: 12, color: T.nok, marginTop: 6, fontWeight: 600 }}>● Se înregistrează... Vorbiți clar.</div>}
          </div>
        )}

        {/* Run button */}
        <button onClick={runAnalysis}
          disabled={loading || (tool.needsImage && !imageData) || (activeTool === "report" && !voiceText) || (activeTool === "ask" && !questionText && !imageData)}
          style={{ width: "100%", padding: "14px", background: loading ? T.textMuted : tool.color, color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: loading ? "wait" : "pointer", minHeight: 50, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1, marginBottom: 16 }}>
          {loading ? (<><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Se analizează...</>)
            : (<><Zap size={18} /> {tool.label}</>)}
        </button>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>

        {error && <div style={{ padding: 14, background: T.nokBg, borderRadius: 10, border: `1px solid ${T.nok}44`, marginBottom: 16 }}><div style={{ fontSize: 13, fontWeight: 700, color: T.nok }}>Eroare</div><div style={{ fontSize: 13, color: T.text }}>{error}</div></div>}

        {/* ─── RESULTS ─── */}
        {result && <div style={{ padding: 16, background: T.surfaceAlt, borderRadius: 12, border: `1px solid ${T.border}` }}>

          {/* Raw text fallback */}
          {result._parseError && <div style={{ fontSize: 14, color: T.text, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{result._raw}</div>}

          {/* Component identification */}
          {activeTool === "identify" && !result._parseError && (<div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 8 }}>{result.component}</div>
            {result.model && <div style={{ fontSize: 13, color: T.textSec }}>Model: <strong>{result.model}</strong></div>}
            {result.location && <div style={{ fontSize: 13, color: T.textSec }}>Locație: {result.location}</div>}
            {result.section_name && <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 6, background: T.accentLight, color: T.accent, fontSize: 12, fontWeight: 700, marginTop: 8 }}>Secțiune: {result.section_name}</div>}
            {result.description && <div style={{ fontSize: 13, color: T.text, marginTop: 10, padding: 10, background: T.surface, borderRadius: 8, lineHeight: 1.6 }}>{result.description}</div>}
            {result.maintenance_tips && <div style={{ fontSize: 13, marginTop: 8, padding: 10, background: T.okBg, borderRadius: 8, lineHeight: 1.6, color: T.text }}>💡 {result.maintenance_tips}</div>}
            {result.history_note && <div style={{ fontSize: 13, marginTop: 8, padding: 10, background: T.warnBg, borderRadius: 8, lineHeight: 1.6, color: T.text }}>📊 Din istoric: {result.history_note}</div>}
            {result.manual_reference && <div style={{ fontSize: 13, marginTop: 8, padding: 10, background: T.accentLight, borderRadius: 8, lineHeight: 1.6, color: T.accent }}>📖 Manual: {result.manual_reference}</div>}
          </div>)}

          {/* Defect detection */}
          {activeTool === "defects" && !result._parseError && (<div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: result.defects_found ? T.nok : T.ok }}>{result.defects_found ? "⚠️ Defecte detectate" : "✓ Fără defecte"}</span>
              {result.severity && result.severity !== "none" && <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: result.severity === "critical" ? T.nokBg : T.warnBg, color: result.severity === "critical" ? T.nok : T.warn }}>{result.severity === "critical" ? "CRITIC" : result.severity === "moderate" ? "MODERAT" : "MINOR"}</span>}
            </div>
            {result.defects?.map((d, i) => (
              <div key={i} style={{ padding: 12, background: T.surface, borderRadius: 8, marginBottom: 8, borderLeft: `4px solid ${d.severity === "critical" ? T.nok : d.severity === "moderate" ? T.warn : T.textMuted}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{d.type}</div>
                {d.location && <div style={{ fontSize: 12, color: T.textSec }}>📍 {d.location}</div>}
                <div style={{ fontSize: 13, color: T.text, marginTop: 4 }}>{d.description}</div>
                {d.action && <div style={{ fontSize: 13, color: T.accent, marginTop: 4, fontWeight: 600 }}>→ {d.action}</div>}
                {d.manual_reference && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>📖 {d.manual_reference}</div>}
              </div>
            ))}
            {result.recurring_pattern && <div style={{ fontSize: 13, marginTop: 8, padding: 10, background: T.warnBg, borderRadius: 8, color: T.text }}>🔄 Tipar recurent: {result.recurring_pattern}</div>}
            {result.recommendation && <div style={{ fontSize: 13, marginTop: 8, padding: 10, background: T.surface, borderRadius: 8, color: T.text }}>📋 {result.recommendation}</div>}
          </div>)}

          {/* OCR */}
          {activeTool === "ocr" && !result._parseError && (<div>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 8 }}>Valori citite</div>
            {result.manufacturer && <div style={{ fontSize: 13, color: T.textSec }}>Producător: <strong>{result.manufacturer}</strong></div>}
            {result.model && <div style={{ fontSize: 13, color: T.textSec }}>Model: <strong>{result.model}</strong></div>}
            {result.serial_number && <div style={{ fontSize: 13, color: T.textSec, marginBottom: 8 }}>Serie: <strong>{result.serial_number}</strong></div>}
            {result.readings?.length > 0 && <div style={{ background: T.surface, borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
              {result.readings.map((r, i) => (<div key={i} style={{ display: "flex", padding: "8px 12px", borderBottom: `1px solid ${T.border}` }}><span style={{ flex: 1, fontSize: 13, color: T.textSec }}>{r.label}</span><span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{r.value}{r.unit ? ` ${r.unit}` : ""}</span></div>))}
            </div>}
            {result.manual_note && <div style={{ fontSize: 12, marginTop: 8, padding: 8, background: T.accentLight, borderRadius: 6, color: T.accent }}>📖 {result.manual_note}</div>}
          </div>)}

          {/* Report */}
          {activeTool === "report" && !result._parseError && (<div>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 12 }}>Raport generat</div>
            {[["Descriere", result.description], ["Acțiuni", result.actions], ["Piese", result.parts], ["Observații", result.notes], ["Avertismente", result.warnings]].filter(([, v]) => v).map(([l, v]) => (
              <div key={l} style={{ marginBottom: 10 }}><div style={{ fontSize: 11, fontWeight: 700, color: T.textSec, textTransform: "uppercase", marginBottom: 2 }}>{l}</div><div style={{ fontSize: 14, color: T.text, padding: 10, background: T.surface, borderRadius: 8, lineHeight: 1.5 }}>{v}</div></div>
            ))}
            {result.similar_past_events && <div style={{ fontSize: 13, marginTop: 8, padding: 10, background: T.warnBg, borderRadius: 8, color: T.text }}>📊 Intervenții similare: {result.similar_past_events}</div>}
            {result.manual_procedure && <div style={{ fontSize: 13, marginTop: 8, padding: 10, background: T.accentLight, borderRadius: 8, color: T.accent }}>📖 Procedură manual: {result.manual_procedure}</div>}
            {result.preventive_suggestion && <div style={{ fontSize: 13, marginTop: 8, padding: 10, background: T.okBg, borderRadius: 8, color: T.text }}>💡 Sugestie preventivă: {result.preventive_suggestion}</div>}
          </div>)}

          {/* Suggestions */}
          {activeTool === "suggestions" && !result._parseError && (<div>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 12 }}>Sugestii inteligente</div>
            {result.patterns?.length > 0 && (<div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.textSec, marginBottom: 6 }}>TIPARE DETECTATE</div>
              {result.patterns.map((p, i) => (
                <div key={i} style={{ padding: 12, background: T.surface, borderRadius: 8, marginBottom: 6, borderLeft: `4px solid ${p.risk_level === "high" ? T.nok : p.risk_level === "medium" ? T.warn : T.ok}` }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{p.description}</div>
                  <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>{p.affected_component} • {p.frequency}</div>
                  <div style={{ fontSize: 13, color: T.accent, marginTop: 4 }}>→ {p.suggestion}</div>
                </div>
              ))}
            </div>)}
            {result.upcoming_maintenance?.length > 0 && (<div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.textSec, marginBottom: 6 }}>MENTENANȚĂ RECOMANDATĂ</div>
              {result.upcoming_maintenance.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: T.surface, borderRadius: 8, marginBottom: 4 }}>
                  <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, background: m.urgency === "urgent" ? T.nokBg : m.urgency === "soon" ? T.warnBg : T.surfaceAlt, color: m.urgency === "urgent" ? T.nok : m.urgency === "soon" ? T.warn : T.textSec }}>{m.urgency === "urgent" ? "URGENT" : m.urgency === "soon" ? "CURÂND" : "RUTINĂ"}</span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{m.component}</div><div style={{ fontSize: 12, color: T.textSec }}>{m.reason}</div></div>
                  {m.estimated_time && <span style={{ fontSize: 12, color: T.textMuted }}>{m.estimated_time}h</span>}
                </div>
              ))}
            </div>)}
            {result.parts_to_stock?.length > 0 && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 13, fontWeight: 700, color: T.textSec, marginBottom: 6 }}>PIESE RECOMANDATE ÎN STOC</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{result.parts_to_stock.map((p, i) => (<span key={i} style={{ padding: "4px 10px", borderRadius: 6, background: T.surface, border: `1px solid ${T.border}`, fontSize: 12, color: T.text }}>{p}</span>))}</div></div>}
            {result.general_recommendations && <div style={{ fontSize: 13, padding: 12, background: T.okBg, borderRadius: 8, lineHeight: 1.6, color: T.text }}>📋 {result.general_recommendations}</div>}
          </div>)}

          {/* Free question */}
          {activeTool === "ask" && typeof result === "string" && <div style={{ fontSize: 14, color: T.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{result}</div>}
        </div>}
      </div>);
    })()}
  </div>);
}
