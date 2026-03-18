// src/lib/knowledgeBase.js — Knowledge base with cloud (Supabase) + local fallback
import { supabase, isOnline } from './supabase';

const LOCAL_KEY = "mm92_knowledge_base";
let _cache = null;

// ─── LOCAL STORAGE ───
function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); } catch { return []; }
}
function saveLocal(docs) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(docs)); } catch {}
}

// ─── SUPABASE TABLE: knowledge_docs ───
// Schema (add via SQL Editor):
// CREATE TABLE knowledge_docs (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   name TEXT NOT NULL,
//   size INTEGER,
//   pages INTEGER,
//   text_length INTEGER,
//   text TEXT NOT NULL,
//   added_at TIMESTAMPTZ DEFAULT now(),
//   created_by UUID REFERENCES auth.users(id)
// );
// ALTER TABLE knowledge_docs ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Authenticated read" ON knowledge_docs FOR SELECT TO authenticated USING (true);
// CREATE POLICY "Authenticated insert" ON knowledge_docs FOR INSERT TO authenticated WITH CHECK (true);
// CREATE POLICY "Authenticated delete" ON knowledge_docs FOR DELETE TO authenticated USING (true);

// ─── LOAD ───
export async function loadKnowledgeBase() {
  if (isOnline() && supabase) {
    try {
      const { data, error } = await supabase
        .from('knowledge_docs')
        .select('id, name, size, pages, text_length, added_at, text')
        .order('added_at', { ascending: false });
      if (!error && data) {
        const docs = data.map(d => ({
          id: d.id, name: d.name, size: d.size, pages: d.pages,
          textLength: d.text_length, text: d.text,
          addedAt: new Date(d.added_at).toLocaleString("ro-RO"),
          cloud: true
        }));
        _cache = docs;
        // Also cache locally for offline access
        saveLocal(docs);
        return docs;
      }
    } catch (e) { console.warn("KB cloud load failed, using local:", e); }
  }
  // Fallback to local
  const local = loadLocal();
  _cache = local;
  return local;
}

// Synchronous version (uses cache)
export function loadKnowledgeBaseSync() {
  if (_cache) return _cache;
  _cache = loadLocal();
  return _cache;
}

// ─── SAVE ───
export function saveKnowledgeBase(docs) {
  _cache = docs;
  saveLocal(docs);
}

// ─── EXTRACT TEXT FROM PDF ───
let pdfjsLoaded = false;
async function ensurePdfJs() {
  if (pdfjsLoaded) return;
  if (!window.pdfjsLib) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  pdfjsLoaded = true;
}

export async function extractPdfText(file, onProgress) {
  await ensurePdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  let fullText = "";
  for (let i = 1; i <= totalPages; i++) {
    if (onProgress) onProgress(i, totalPages);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(" ");
    if (pageText.trim()) fullText += `\n--- Pagina ${i} ---\n${pageText}\n`;
  }
  return fullText.trim();
}

// ─── ADD DOCUMENT ───
export async function addDocument(file, onProgress) {
  const text = await extractPdfText(file, onProgress);
  if (!text || text.length < 50) {
    throw new Error("Nu s-a putut extrage text din PDF. Fișierul poate fi scanat (imagini). Încercați un PDF cu text selectabil.");
  }

  const doc = {
    name: file.name,
    size: Math.round(file.size / 1024),
    pages: (text.match(/--- Pagina/g) || []).length,
    textLength: text.length,
    text: text,
    addedAt: new Date().toLocaleString("ro-RO")
  };

  // Try cloud first
  if (isOnline() && supabase) {
    try {
      const { data, error } = await supabase
        .from('knowledge_docs')
        .insert({
          name: doc.name,
          size: doc.size,
          pages: doc.pages,
          text_length: doc.textLength,
          text: doc.text
        })
        .select()
        .single();
      if (!error && data) {
        doc.id = data.id;
        doc.cloud = true;
        _cache = [doc, ...(_cache || [])];
        saveLocal(_cache);
        return doc;
      }
    } catch (e) { console.warn("KB cloud save failed, saving locally:", e); }
  }

  // Fallback: save locally
  doc.id = Date.now() + Math.random();
  const kb = loadLocal();
  kb.push(doc);
  saveLocal(kb);
  _cache = kb;
  return doc;
}

// ─── REMOVE DOCUMENT ───
export async function removeDocument(docId) {
  // Try cloud
  if (isOnline() && supabase) {
    try {
      await supabase.from('knowledge_docs').delete().eq('id', docId);
    } catch (e) { console.warn("KB cloud delete failed:", e); }
  }
  // Always remove locally too
  const kb = loadLocal().filter(d => d.id !== docId);
  saveLocal(kb);
  _cache = kb;
}

// ─── CONTEXT BUILDERS (for AI) ───
export function buildKnowledgeContext(maxChars = 80000) {
  const kb = _cache || loadLocal();
  if (!kb.length) return "";
  let context = "\n\n=== BAZĂ DE CUNOȘTINȚE — MANUALE ÎNCĂRCATE ===\n";
  let remaining = maxChars;
  for (const doc of kb) {
    const header = `\n📄 Document: ${doc.name} (${doc.pages} pagini)\n`;
    if (remaining < header.length + 200) break;
    context += header;
    remaining -= header.length;
    const textToAdd = doc.text.slice(0, remaining);
    context += textToAdd;
    remaining -= textToAdd.length;
    if (remaining < 200) { context += "\n[... trunchiat ...]\n"; break; }
  }
  return context;
}

export function buildHistoryContext(dailyLog, maxEntries = 50) {
  if (!dailyLog?.length) return "";
  const entries = dailyLog.slice(0, maxEntries);
  let context = "\n\n=== ISTORIC INTERVENȚII ===\n";
  entries.forEach((e, i) => {
    context += `\n#${i + 1} [${e.date} ${e.time}] ${e.mode === "remote" ? "REMOTE" : "LOCAL"} | Tip: ${e.type} | Status: ${e.status}`;
    if (e.park) context += ` | ${e.park}`;
    if (e.turbine) context += ` ${e.turbine}`;
    if (e.serial) context += ` (${e.serial})`;
    if (e.duration) context += ` | ${e.duration}h`;
    if (e.errorCode) context += ` | Err: ${e.errorCode}`;
    if (e.resetStatus && e.resetStatus !== "not_attempted") context += ` | Reset: ${e.resetStatus}`;
    if (e.description) context += `\n  Problemă: ${e.description}`;
    if (e.actions) context += `\n  Acțiuni: ${e.actions}`;
    if (e.parts) context += `\n  Piese: ${e.parts}`;
    context += "\n";
  });
  return context;
}

export function searchKnowledge(query, maxResults = 5, maxCharsPerResult = 2000) {
  const kb = _cache || loadLocal();
  if (!kb.length) return "";
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const results = [];
  for (const doc of kb) {
    const paragraphs = doc.text.split(/\n\s*\n/).filter(p => p.trim().length > 30);
    for (const para of paragraphs) {
      const paraLower = para.toLowerCase();
      const score = queryWords.reduce((s, w) => s + (paraLower.includes(w) ? 1 : 0), 0);
      if (score > 0) results.push({ text: para.trim().slice(0, maxCharsPerResult), score, doc: doc.name });
    }
  }
  results.sort((a, b) => b.score - a.score);
  const top = results.slice(0, maxResults);
  if (!top.length) return "";
  let context = "\n\n=== SECȚIUNI RELEVANTE DIN MANUALE ===\n";
  top.forEach(r => { context += `\n[Din: ${r.doc}]\n${r.text}\n`; });
  return context;
}
