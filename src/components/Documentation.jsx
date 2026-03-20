// src/components/Documentation.jsx — Manual & documentation management
import { useState, useRef, useEffect } from "react";
import { FileText, BookOpen } from "lucide-react";
import { loadKnowledgeBase, addDocument, removeDocument } from "../lib/knowledgeBase";
import { supabase, isOnline } from "../lib/supabase";
import ReadAloud from "./ReadAloud";

export default function Documentation({ T }) {
  const [kb, setKb] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewDoc, setPreviewDoc] = useState(null);
  const [cloudStatus, setCloudStatus] = useState("checking"); // checking, ok, error, offline
  const fileRef = useRef(null);

  const [loadingKb, setLoadingKb] = useState(true);

  useEffect(() => {
    // Check cloud connectivity
    const checkCloud = async () => {
      if (!isOnline() || !supabase) { setCloudStatus("offline"); return; }
      try {
        const { error } = await supabase.from('knowledge_docs').select('id').limit(1);
        setCloudStatus(error ? "error" : "ok");
        if (error) console.error("KB table check:", error.message);
      } catch { setCloudStatus("error"); }
    };
    checkCloud();
    loadKnowledgeBase().then(docs => { setKb(docs); setLoadingKb(false); }).catch(() => setLoadingKb(false));
  }, []);

  const handleUpload = async (files) => {
    for (const file of Array.from(files)) {
      if (file.type !== "application/pdf") { alert("Doar fișiere PDF: " + file.name); continue; }
      setUploading(true);
      setUploadProgress(`Se procesează ${file.name}...`);
      try {
        const doc = await addDocument(file, (page, total) =>
          setUploadProgress(`${file.name}: pagina ${page}/${total}`)
        );
        setKb(await loadKnowledgeBase());
        const status = doc.cloud ? "☁️ Salvat în cloud" : doc.cloudError ? `⚠️ Cloud eroare: ${doc.cloudError} (salvat local)` : "💾 Salvat local";
        setUploadProgress(`✓ ${file.name} — ${doc.pages} pagini, ${doc.textLength.toLocaleString()} caractere • ${status}`);
      } catch (e) {
        setUploadProgress(`✗ ${file.name}: ${e.message}`);
      }
      setUploading(false);
    }
  };

  const deleteDoc = async (docId) => {
    if (!confirm("Ștergeți acest document din baza de cunoștințe?")) return;
    await removeDocument(docId);
    setKb(await loadKnowledgeBase());
    if (previewDoc?.id === docId) setPreviewDoc(null);
  };

  const totalChars = kb.reduce((s, d) => s + d.textLength, 0);
  const totalPages = kb.reduce((s, d) => s + d.pages, 0);

  // Search within docs
  const filteredPreview = previewDoc && searchQuery
    ? previewDoc.text.split("\n").filter(line =>
        line.toLowerCase().includes(searchQuery.toLowerCase())
      ).join("\n....\n")
    : previewDoc?.text;

  // ─── PREVIEW MODE ───
  if (previewDoc) {
    return (<div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button onClick={() => setPreviewDoc(null)} style={{ padding: "8px 14px", border: `1px solid ${T.border}`, borderRadius: 8, background: T.surface, cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.text, minHeight: 40, display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Înapoi
        </button>
        <FileText size={20} color={T.accent} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{previewDoc.name}</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>{previewDoc.pages} pagini • {(previewDoc.textLength / 1000).toFixed(0)}k caractere</div>
        </div>
        <ReadAloud text={previewDoc.text} T={T} label="Citește documentul" />
      </div>
      <div style={{ marginBottom: 12 }}>
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Caută în document..."
          style={{ width: "100%", padding: "10px 14px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, background: T.surface, color: T.text }} />
      </div>
      <div style={{ padding: 16, background: T.surfaceAlt, borderRadius: 10, border: `1px solid ${T.border}`, maxHeight: "60vh", overflowY: "auto", fontSize: 13, lineHeight: 1.7, color: T.text, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
        {filteredPreview || "Niciun rezultat pentru căutare."}
      </div>
    </div>);
  }

  // ─── MAIN VIEW ───
  return (<div>
    <h2 style={{ fontSize: 18, color: T.text, marginBottom: 6 }}>Documentație & Manuale</h2>
    <div style={{ fontSize: 13, color: T.textSec, marginBottom: 10 }}>
      Încărcați manuale PDF — textul se extrage automat și este folosit de Asistentul AI.
    </div>

    {/* Cloud status */}
    <div style={{ padding: "8px 14px", borderRadius: 8, marginBottom: 14, fontSize: 12, display: "flex", alignItems: "center", gap: 8,
      background: cloudStatus === "ok" ? T.okBg : cloudStatus === "error" ? T.nokBg : cloudStatus === "offline" ? T.warnBg : T.surfaceAlt,
      color: cloudStatus === "ok" ? T.ok : cloudStatus === "error" ? T.nok : cloudStatus === "offline" ? T.warn : T.textMuted,
      border: `1px solid ${cloudStatus === "ok" ? T.ok+"33" : cloudStatus === "error" ? T.nok+"33" : T.border}`
    }}>
      {cloudStatus === "checking" && "⏳ Se verifică conexiunea cloud..."}
      {cloudStatus === "ok" && "☁️ Cloud activ — documentele se salvează online, vizibile pentru toți"}
      {cloudStatus === "error" && <>❌ Tabelul <code style={{background:"rgba(0,0,0,0.1)",padding:"1px 4px",borderRadius:3}}>knowledge_docs</code> nu e accesibil. Verificați SQL-ul în Supabase. Documentele se salvează doar local.</>}
      {cloudStatus === "offline" && "💾 Mod offline — documentele se salvează local în browser"}
    </div>

    {/* Upload */}
    <button onClick={() => fileRef.current?.click()} disabled={uploading}
      style={{ width: "100%", padding: "24px", border: `2px dashed ${T.border}`, borderRadius: 12, background: T.surfaceAlt, cursor: uploading ? "wait" : "pointer", marginBottom: 14, textAlign: "center" }}>
      <BookOpen size={36} color={T.accent} style={{ display: "block", margin: "0 auto 8px" }} />
      <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{uploading ? "Se procesează..." : "Încarcă manuale PDF"}</div>
      <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>Manuale Senvion, instrucțiuni tehnice, TO-uri, fișe tehnice — PDF cu text selectabil</div>
    </button>
    <input ref={fileRef} type="file" accept="application/pdf" multiple
      onChange={e => { if (e.target.files) handleUpload(e.target.files); e.target.value = ""; }}
      style={{ display: "none" }} />

    {uploadProgress && (
      <div style={{ padding: 12, background: T.surfaceAlt, borderRadius: 8, fontSize: 13, color: T.textSec, marginBottom: 14 }}>
        {uploadProgress}
      </div>
    )}

    {/* Stats */}
    {kb.length > 0 && (
      <div style={{ display: "flex", gap: 14, marginBottom: 16, padding: "12px 16px", background: T.accentLight, borderRadius: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>{kb.length} documente</div>
        <div style={{ fontSize: 13, color: T.text }}>{totalPages} pagini totale</div>
        <div style={{ fontSize: 13, color: T.text }}>{(totalChars / 1000).toFixed(0)}k caractere indexate</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: T.textMuted }}>Asistentul AI folosește automat aceste documente</div>
      </div>
    )}

    {/* Document list */}
    {kb.length === 0 && (
      <div style={{ padding: 28, textAlign: "center", color: T.textMuted, fontSize: 14, background: T.surfaceAlt, borderRadius: 10 }}>
        Nu sunt documente încărcate. Asistentul AI va funcționa doar cu cunoștințe generale despre Senvion MM92.
      </div>
    )}

    {kb.map(doc => (
      <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: T.surfaceAlt, borderRadius: 10, border: `1px solid ${T.border}`, marginBottom: 8, cursor: "pointer" }}
        onClick={() => setPreviewDoc(doc)}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: T.accent + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FileText size={22} color={T.accent} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>{doc.pages} pagini • {doc.size} KB • {(doc.textLength / 1000).toFixed(0)}k caractere • {doc.addedAt}{doc.cloud?" • ☁️ Cloud":""}</div>
        </div>
        <button onClick={e => { e.stopPropagation(); deleteDoc(doc.id); }}
          style={{ width: 38, height: 38, borderRadius: 8, border: `1px solid ${T.nok}44`, background: T.nokBg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.nok} strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
        </button>
      </div>
    ))}

    {/* Tips */}
    <div style={{ marginTop: 20, padding: 16, background: T.surfaceAlt, borderRadius: 10, border: `1px solid ${T.border}` }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 8 }}>💡 Sfaturi</div>
      <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>
        • PDF-urile trebuie să aibă <strong>text selectabil</strong> (nu scanări fără OCR)<br/>
        • Încărcați: manuale Senvion, PowerWind, instrucțiuni de lucru, fișe tehnice<br/>
        • Cu Supabase configurat: manualele se salvează <strong>în cloud ☁️</strong> — toți tehnicienii le văd automat<br/>
        • Fără Supabase: textul se stochează local în browser<br/>
        • Click pe un document pentru a vizualiza și căuta în textul extras<br/>
        • Asistentul AI caută automat secțiunile relevante la fiecare analiză
      </div>
    </div>
  </div>);
}
