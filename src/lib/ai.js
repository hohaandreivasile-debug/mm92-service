// src/lib/ai.js — Multi-API: Claude + Gemini, with web search

const CLAUDE_URL = "https://api.anthropic.com/v1/messages";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";

function getClaudeKey() { return import.meta.env.VITE_ANTHROPIC_API_KEY || null; }
function getGeminiKey() { return import.meta.env.VITE_GEMINI_API_KEY || null; }

export function isAIEnabled() { return !!(getClaudeKey() || getGeminiKey()); }
export function getActiveProvider() {
  if (getGeminiKey()) return "gemini";
  if (getClaudeKey()) return "claude";
  return null;
}

// ─── CLAUDE API ───
async function callClaude(messages, { maxTokens = 2000, system, webSearch = false } = {}) {
  const key = getClaudeKey();
  if (!key) throw new Error("Claude API key lipsă");
  const body = { model: "claude-sonnet-4-20250514", max_tokens: maxTokens, messages };
  if (system) body.system = system;
  if (webSearch) {
    body.tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }];
  }
  const res = await fetch(CLAUDE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify(body)
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message || `Claude error: ${res.status}`); }
  const data = await res.json();
  // Extract text from potentially mixed content blocks (text + search results)
  const textParts = (data.content || []).filter(b => b.type === "text").map(b => b.text);
  return textParts.join("\n") || "";
}

// ─── GEMINI API ───
async function callGemini(prompt, { imageData, system, maxTokens = 2000, webSearch = false } = {}) {
  const key = getGeminiKey();
  if (!key) throw new Error("Gemini API key lipsă");
  const model = "gemini-2.5-flash";
  const url = `${GEMINI_URL}/${model}:generateContent?key=${key}`;
  
  const parts = [];
  if (system) parts.push({ text: system + "\n\n" });
  if (imageData) {
    const match = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
    if (match) parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
  }
  parts.push({ text: prompt });

  const body = {
    contents: [{ parts }],
    generationConfig: { maxOutputTokens: maxTokens, temperature: 0.3 }
  };

  // Add Google Search grounding tool
  if (webSearch) {
    body.tools = [{ google_search: {} }];
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message || `Gemini error: ${res.status}`); }
  const data = await res.json();
  
  // Extract text from all parts (Gemini may return multiple parts with grounding)
  const candidate = data.candidates?.[0]?.content?.parts || [];
  const textParts = candidate.filter(p => p.text).map(p => p.text);
  
  // Add grounding sources if available
  const grounding = data.candidates?.[0]?.groundingMetadata;
  let result = textParts.join("\n");
  if (grounding?.groundingChunks?.length > 0) {
    result += "\n\n📎 Surse web:";
    const seen = new Set();
    grounding.groundingChunks.forEach(chunk => {
      const uri = chunk.web?.uri;
      const title = chunk.web?.title;
      if (uri && !seen.has(uri)) {
        seen.add(uri);
        result += `\n• ${title || uri}`;
      }
    });
  }
  return result;
}

// ─── UNIFIED CALL ───
async function callAI(prompt, { imageData, system, maxTokens = 2000, webSearch = false } = {}) {
  const provider = getActiveProvider();
  if (!provider) throw new Error("Niciun API key configurat. Adăugați VITE_GEMINI_API_KEY sau VITE_ANTHROPIC_API_KEY în .env");
  
  if (provider === "gemini") {
    return await callGemini(prompt, { imageData, system, maxTokens, webSearch });
  } else {
    const content = [];
    if (imageData) {
      const match = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) content.push({ type: "image", source: { type: "base64", media_type: match[1], data: match[2] } });
    }
    content.push({ type: "text", text: prompt });
    return await callClaude([{ role: "user", content }], { system, maxTokens, webSearch });
  }
}

function parseJSON(text) {
  try { return JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim()); }
  catch { return { _raw: text, _parseError: true }; }
}

function buildSystem(base, context = "") {
  let s = base;
  if (context) s += "\n\n" + context;
  s += "\n\nRăspunde doar în JSON valid, fără markdown backticks.";
  return s;
}

// ─── EXPORTED FUNCTIONS ───

export async function identifyComponent(imageData, context = "") {
  return parseJSON(await callAI(
    `Analizează fotografia și identifică componenta din turbina eoliană.\nJSON: {"component","model","section_id","section_name","location","description","maintenance_tips","history_note","manual_reference","confidence"}`,
    { imageData, system: buildSystem("Expert mentenanță turbine eoliene Senvion MM92 / PowerWind PW56.", context) }
  ));
}

export async function detectDefects(imageData, context = "", componentContext = "") {
  return parseJSON(await callAI(
    `${componentContext ? `Context: ${componentContext}.` : ""}Analizează pentru defecte: fisuri, coroziune, uzură, scurgeri.\nJSON: {"defects_found","severity","defects":[{"type","location","description","severity","action","manual_reference"}],"overall_condition","recommendation","recurring_pattern","urgent"}`,
    { imageData, system: buildSystem("Inspector tehnic turbine eoliene. Conservator — menționează defecte potențiale.", context) }
  ));
}

export async function readLabel(imageData, context = "") {
  return parseJSON(await callAI(
    `Citește textele și valorile de pe etichetă/plăcuță/instrument.\nJSON: {"type","readings":[{"label","value","unit"}],"manufacturer","model","serial_number","raw_text","manual_note","confidence"}`,
    { imageData, system: buildSystem("Specialist OCR echipamente industriale. [?] dacă neclar.", context) }
  ));
}

export async function generateReport(voiceText, context = "") {
  return parseJSON(await callAI(
    `Tehnician a dictat: "${voiceText}"\nTransformă în raport structurat. Verifică istoric + manuale.\nJSON: {"description","actions","type","status","priority","parts","duration_estimate","notes","warnings","similar_past_events","manual_procedure","preventive_suggestion"}`,
    { system: buildSystem("Inginer mentenanță Senvion MM92 / PW56. Rapoarte tehnice structurate din descrieri informale.", context), maxTokens: 3000 }
  ));
}

export async function getSuggestions(context = "", situation = "") {
  return parseJSON(await callAI(
    `${situation ? `Situație: ${situation}` : "Analizează istoricul general."}\nOferă sugestii proactive.\nJSON: {"patterns":[{"description","frequency","affected_component","risk_level","suggestion"}],"upcoming_maintenance":[{"component","reason","urgency","estimated_time"}],"parts_to_stock":[],"general_recommendations"}`,
    { system: buildSystem("Consultant mentenanță predictivă turbine eoliene.", context), maxTokens: 3000 }
  ));
}

export async function askQuestion(question, context = "", imageData = null) {
  return await callAI(question, {
    imageData, webSearch: true,
    system: "Ești expert mentenanță turbine eoliene Senvion MM92 și PowerWind PW56. Răspunzi concis, practic, în română. Folosești informațiile din istoric și manuale. Dacă nu găsești răspunsul în manuale, caută pe internet." + (context ? "\n\n" + context : ""),
    maxTokens: 3000
  });
}

// ─── INLINE CHAT (context-aware, with web search) ───
export async function chatInline(message, sectionContext = "", knowledgeContext = "", imageData = null) {
  // Detect if user is asking something that likely needs web search
  const needsWeb = /caut[aă]|găse[sș]te|internet|online|link|preț|pret|part.?number|specificați[ei]|catalog|furnizor|producător|manual online|actualizare|update|noutăți|nou[aă]|recent|ultim/i.test(message);
  
  const system = `Ești asistentul AI integrat pentru mentenanța turbinelor eoliene (Senvion MM92 / PowerWind PW56).
Tehnicianul se află pe secțiunea: ${sectionContext || "generală"}.
Răspunzi concis și practic, în limba română. Când e relevant, citezi din manuale.
Dacă primești o imagine, o analizezi în context tehnic.
${needsWeb ? "Ai acces la internet. Caută informații actuale când e relevant (part numbers, specificații, proceduri noi)." : ""}
Dacă nu ai răspunsul în manualele încărcate, spune clar și oferă-te să cauți pe internet.
${knowledgeContext}`;

  return await callAI(message, { imageData, system, maxTokens: 2000, webSearch: needsWeb });
}
