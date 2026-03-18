// src/components/FloatingAI.jsx — Floating AI chat with voice conversation mode
import { useState, useRef, useEffect, useCallback } from "react";
import { Zap, Camera, Eye, X, Mic, Volume2, VolumeX } from "lucide-react";
import { isAIEnabled, getActiveProvider, chatInline } from "../lib/ai";
import { buildKnowledgeContext, buildHistoryContext, searchKnowledge, loadKnowledgeBaseSync } from "../lib/knowledgeBase";

const SpeechRec = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

export default function FloatingAI({ T, sectionContext = "", dailyLog = [] }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [recording, setRecording] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false); // waiting for user to speak in voice mode
  const scrollRef = useRef(null);
  const camRef = useRef(null);
  const galRef = useRef(null);
  const recRef = useRef(null);
  const voiceModeRef = useRef(false); // ref to avoid stale closure

  const enabled = isAIEnabled();
  const provider = getActiveProvider();
  const kb = loadKnowledgeBaseSync();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  // Keep ref in sync
  useEffect(() => { voiceModeRef.current = voiceMode; }, [voiceMode]);

  if (!enabled) return null;

  const getKnowledgeCtx = (query) => {
    let ctx = buildHistoryContext(dailyLog, 30);
    if (query) ctx += searchKnowledge(query, 3, 2000);
    else ctx += buildKnowledgeContext(40000);
    return ctx;
  };

  // ─── TEXT TO SPEECH ───
  const speak = (text) => {
    if (!synth || !text) return Promise.resolve();
    return new Promise((resolve) => {
      synth.cancel(); // stop any current speech
      // Clean text for speech (remove emojis, markdown, etc.)
      const clean = text
        .replace(/[📅📍🏷️🚨⚡⏱️❌🔄📋📝✅🔧👷📌📸💡⚠️✓✗●○▪️▫️━]/g, "")
        .replace(/\*\*/g, "").replace(/```[\s\S]*?```/g, "").replace(/`/g, "")
        .replace(/\n{2,}/g, ". ").replace(/\n/g, ", ")
        .trim();
      if (!clean) { resolve(); return; }

      const utt = new SpeechSynthesisUtterance(clean);
      utt.lang = "ro-RO";
      utt.rate = 1.05;
      utt.pitch = 1.0;
      
      // Try to find Romanian voice
      const voices = synth.getVoices();
      const roVoice = voices.find(v => v.lang.startsWith("ro")) || voices.find(v => v.lang.startsWith("en"));
      if (roVoice) utt.voice = roVoice;

      utt.onstart = () => setSpeaking(true);
      utt.onend = () => { setSpeaking(false); resolve(); };
      utt.onerror = () => { setSpeaking(false); resolve(); };
      synth.speak(utt);
    });
  };

  const stopSpeaking = () => {
    if (synth) synth.cancel();
    setSpeaking(false);
  };

  // ─── VOICE LISTEN (for voice mode auto-loop) ───
  const startListening = useCallback(() => {
    if (!SpeechRec || !voiceModeRef.current) return;
    setVoiceReady(true);
    const r = new SpeechRec();
    r.lang = "ro-RO";
    r.continuous = false;
    r.interimResults = false;
    
    r.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) text += e.results[i][0].transcript + " ";
      }
      text = text.trim();
      if (text) {
        setInput(text);
        setVoiceReady(false);
        setRecording(false);
        // Auto-send after getting voice input
        setTimeout(() => {
          document.getElementById("floating-ai-send")?.click();
        }, 100);
      }
    };
    r.onend = () => { setRecording(false); setVoiceReady(false); };
    r.onerror = () => { setRecording(false); setVoiceReady(false); };
    r.start();
    recRef.current = r;
    setRecording(true);
  }, []);

  // ─── SEND MESSAGE ───
  const send = async () => {
    const text = input.trim();
    if (!text && !imageData) return;
    const userMsg = { role: "user", text, image: imageData, time: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }) };
    setMessages(p => [...p, userMsg]);
    setInput(""); setLoading(true); setVoiceReady(false);
    const img = imageData; setImageData(null);

    try {
      const kCtx = getKnowledgeCtx(text);
      const response = await chatInline(text || "Analizează această imagine.", sectionContext, kCtx, img);
      setMessages(p => [...p, { role: "ai", text: response, time: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }) }]);
      
      // Voice mode: speak response then auto-listen
      if (voiceModeRef.current) {
        await speak(response);
        // Small pause then start listening again
        setTimeout(() => { if (voiceModeRef.current) startListening(); }, 500);
      }
    } catch (e) {
      const errMsg = `Eroare: ${e.message}`;
      setMessages(p => [...p, { role: "ai", text: errMsg, time: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }), error: true }]);
      if (voiceModeRef.current) {
        await speak("A apărut o eroare. Încercați din nou.");
        setTimeout(() => { if (voiceModeRef.current) startListening(); }, 500);
      }
    }
    setLoading(false);
  };

  // ─── TOGGLE VOICE MODE ───
  const toggleVoiceMode = () => {
    if (voiceMode) {
      // Turn off
      setVoiceMode(false);
      voiceModeRef.current = false;
      stopSpeaking();
      if (recRef.current) { try { recRef.current.stop(); } catch {} }
      setRecording(false);
      setVoiceReady(false);
    } else {
      // Turn on
      if (!SpeechRec) { alert("Browserul nu suportă recunoaștere vocală. Folosiți Chrome sau Edge."); return; }
      setVoiceMode(true);
      voiceModeRef.current = true;
      // Start listening immediately
      setTimeout(() => startListening(), 200);
    }
  };

  // ─── MANUAL VOICE INPUT (non-voice-mode) ───
  const toggleManualVoice = () => {
    if (!SpeechRec) { alert("Browser incompatibil. Folosiți Chrome/Edge."); return; }
    if (recording) { recRef.current?.stop(); setRecording(false); return; }
    const r = new SpeechRec(); r.lang = "ro-RO"; r.continuous = true; r.interimResults = false;
    r.onresult = e => { let t = ""; for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) t += e.results[i][0].transcript + " "; setInput(p => (p + " " + t).trim()); };
    r.onerror = () => setRecording(false); r.onend = () => setRecording(false);
    r.start(); recRef.current = r; setRecording(true);
  };

  const handleImage = (files) => {
    const f = files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image(); img.onload = () => {
        const c = document.createElement("canvas"); const M = 800; let w = img.width, h = img.height;
        if (w > M || h > M) { const r = Math.min(M / w, M / h); w *= r; h *= r; }
        c.width = w; c.height = h; c.getContext("2d").drawImage(img, 0, 0, w, h);
        setImageData(c.toDataURL("image/jpeg", 0.8));
      }; img.src = e.target.result;
    }; reader.readAsDataURL(f);
  };

  const clear = () => { setMessages([]); setImageData(null); setInput(""); stopSpeaking(); };

  // Cleanup on unmount
  useEffect(() => () => { if (synth) synth.cancel(); }, []);

  // ─── FLOATING BUTTON ───
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{
        position: "fixed", bottom: 20, right: 20, width: 56, height: 56,
        borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, #7c3aed)`,
        color: "#fff", border: "none", cursor: "pointer",
        boxShadow: "0 4px 20px rgba(37,99,235,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, transition: "transform 0.2s"
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        <Zap size={24} />
      </button>
    );
  }

  // ─── CHAT PANEL ───
  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20, width: 400, maxWidth: "calc(100vw - 40px)",
      height: 560, maxHeight: "calc(100vh - 100px)",
      background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`,
      boxShadow: "0 8px 40px rgba(0,0,0,0.2)", zIndex: 1000,
      display: "flex", flexDirection: "column", overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 14px", background: `linear-gradient(135deg, ${T.accent}, #7c3aed)`,
        display: "flex", alignItems: "center", gap: 8, flexShrink: 0
      }}>
        <Zap size={18} color="#fff" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Asistent AI</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
            {provider === "gemini" ? "Gemini" : "Claude"} • {sectionContext || "General"}
          </div>
        </div>
        {/* Voice mode toggle */}
        <button onClick={toggleVoiceMode} title={voiceMode ? "Oprește modul vocal" : "Mod vocal (conversație)"} style={{
          padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700,
          background: voiceMode ? "#fff" : "rgba(255,255,255,0.2)", color: voiceMode ? T.accent : "#fff",
          display: "flex", alignItems: "center", gap: 4
        }}>
          {voiceMode ? <Volume2 size={14} /> : <Mic size={14} />}
          {voiceMode ? "Vocal ON" : "Vocal"}
        </button>
        <button onClick={clear} title="Conversație nouă" style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#fff", fontSize: 11 }}>Nou</button>
        <button onClick={() => { setOpen(false); if (voiceMode) toggleVoiceMode(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", padding: 2 }}><X size={18} /></button>
      </div>

      {/* Voice mode indicator */}
      {voiceMode && (
        <div style={{
          padding: "8px 14px", background: voiceReady ? "#059669" : speaking ? "#7c3aed" : loading ? T.accent : "#059669",
          color: "#fff", fontSize: 12, fontWeight: 700, textAlign: "center",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          animation: (voiceReady || speaking) ? "pulse 1.5s infinite" : "none"
        }}>
          {voiceReady && <><Mic size={16} /> Ascult... Vorbiți acum</>}
          {speaking && <><Volume2 size={16} /> Vorbesc...</>}
          {loading && !speaking && <><Zap size={16} /> Procesez...</>}
          {!voiceReady && !speaking && !loading && <><Mic size={16} /> Mod vocal activ</>}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: 20, color: T.textMuted, fontSize: 13 }}>
            <Zap size={32} color={T.accent} style={{ display: "block", margin: "0 auto 10px", opacity: 0.5 }} />
            {voiceMode ? (
              <>Modul vocal e activ.<br/>Vorbiți și AI-ul va răspunde verbal.<br/>Conversația continuă automat.</>
            ) : (
              <>Întreabă orice despre mentenanță.<br/>Poți trimite poze sau dicta vocal.</>
            )}
            {sectionContext && <div style={{ marginTop: 10, padding: "6px 12px", background: T.accentLight, borderRadius: 6, fontSize: 12, color: T.accent, display: "inline-block" }}>📍 {sectionContext}</div>}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%", padding: "10px 14px", borderRadius: 12,
              background: m.role === "user" ? T.accent : m.error ? T.nokBg : T.surfaceAlt,
              color: m.role === "user" ? "#fff" : m.error ? T.nok : T.text,
              fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word",
              borderBottomRightRadius: m.role === "user" ? 4 : 12,
              borderBottomLeftRadius: m.role === "ai" ? 4 : 12
            }}>
              {m.image && <img src={m.image} alt="" style={{ width: "100%", maxHeight: 150, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />}
              {m.text}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, padding: "0 4px" }}>
              <span style={{ fontSize: 10, color: T.textMuted }}>{m.time}</span>
              {/* Speak button on AI messages */}
              {m.role === "ai" && !m.error && (
                <button onClick={() => speaking ? stopSpeaking() : speak(m.text)} title={speaking ? "Oprește" : "Citește cu voce"} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", alignItems: "center" }}>
                  {speaking ? <VolumeX size={12} color={T.textMuted} /> : <Volume2 size={12} color={T.textMuted} />}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 4, padding: "10px 14px", background: T.surfaceAlt, borderRadius: 12, width: "fit-content", borderBottomLeftRadius: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, animation: "blink 1s infinite" }} />
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, animation: "blink 1s infinite 0.2s" }} />
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, animation: "blink 1s infinite 0.4s" }} />
          </div>
        )}
      </div>

      {/* Image preview */}
      {imageData && (
        <div style={{ padding: "6px 14px", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 8 }}>
          <img src={imageData} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: `1px solid ${T.border}` }} />
          <span style={{ fontSize: 12, color: T.textSec }}>Imagine atașată</span>
          <button onClick={() => setImageData(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: T.nok, fontSize: 16 }}>✕</button>
        </div>
      )}

      {/* Input area */}
      <div style={{ padding: "10px 12px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 6, alignItems: "flex-end", flexShrink: 0 }}>
        <button onClick={() => camRef.current?.click()} title="Cameră" style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Camera size={16} color={T.textMuted} />
        </button>
        <button onClick={() => galRef.current?.click()} title="Galerie" style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Eye size={16} color={T.textMuted} />
        </button>
        <button onClick={voiceMode ? toggleVoiceMode : toggleManualVoice} title={voiceMode ? "Oprește vocal" : "Dictare"} style={{
          width: 36, height: 36, borderRadius: 8,
          border: `1px solid ${recording || voiceMode ? T.nok : T.border}`,
          background: recording ? T.nokBg : voiceMode ? "#05966918" : T.surface,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          animation: recording ? "pulse 1.2s infinite" : "none"
        }}>
          <Mic size={16} color={recording ? T.nok : voiceMode ? "#059669" : T.textMuted} />
        </button>
        <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={e => { handleImage(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
        <input ref={galRef} type="file" accept="image/*" onChange={e => { handleImage(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={voiceMode ? "Sau scrieți..." : "Întrebați ceva..."} rows={1}
          style={{
            flex: 1, fontSize: 14, padding: "8px 12px", border: `1px solid ${T.border}`,
            borderRadius: 10, background: T.surface, color: T.text, fontFamily: "inherit",
            resize: "none", minHeight: 36, maxHeight: 80, outline: "none"
          }} />
        <button id="floating-ai-send" onClick={send} disabled={loading || (!input.trim() && !imageData)} style={{
          width: 36, height: 36, borderRadius: 8, background: (input.trim() || imageData) ? T.accent : T.border,
          border: "none", cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
        </button>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.95)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}
