// src/lib/ai.js — Multi-API: Claude (Anthropic) + Gemini (Google)

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
async function callClaude(messages, { maxTokens = 2000, system } = {}) {
  const key = getClaudeKey();
  if (!key) throw new Error("Claude API key lipsă");
  const body = { model: "claude-sonnet-4-20250514", max_tokens: maxTokens, messages };
  if (system) body.system = system;
  const res = await fetch(CLAUDE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify(body)
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message || `Claude error: ${res.status}`); }
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// ─── GEMINI API ───
async function callGemini(prompt, { imageData, system, maxTokens = 2000 } = {}) {
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

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.3 }
    })
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message || `Gemini error: ${res.status}`); }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// ─── UNIFIED CALL ───
async function callAI(prompt, { imageData, system, maxTokens = 2000 } = {}) {
  const provider = getActiveProvider();
  if (!provider) throw new Error("Niciun API key configurat. Adăugați VITE_GEMINI_API_KEY sau VITE_ANTHROPIC_API_KEY în .env");
  
  if (provider === "gemini") {
    return await callGemini(prompt, { imageData, system, maxTokens });
  } else {
    // Claude needs structured messages
    const content = [];
    if (imageData) {
      const match = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) content.push({ type: "image", source: { type: "base64", media_type: match[1], data: match[2] } });
    }
    content.push({ type: "text", text: prompt });
    return await callClaude([{ role: "user", content }], { system, maxTokens });
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
    imageData,
    system: "Ești expert mentenanță turbine eoliene Senvion MM92 și PowerWind PW56. Răspunzi concis, practic, în română. Folosești informațiile din istoric și manuale." + (context ? "\n\n" + context : ""),
    maxTokens: 3000
  });
}

// ─── INLINE CHAT (context-aware) ───
export async function chatInline(message, sectionContext = "", knowledgeContext = "", imageData = null) {
  const system = `Ești asistentul AI integrat pentru mentenanța turbinelor eoliene (Senvion MM92 / PowerWind PW56).
Tehnicianul se află pe secțiunea: ${sectionContext || "generală"}.
Răspunzi concis și practic, în limba română. Când e relevant, citezi din manuale.
Dacă primești o imagine, o analizezi în context tehnic.
${knowledgeContext}`;

  return await callAI(message, { imageData, system, maxTokens: 2000 });
}
