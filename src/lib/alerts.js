// src/lib/alerts.js — Proactive maintenance alerts & pattern detection

import { getAllTurbines } from "../data/fleet";

// ─── ALERT TYPES ───
// critical: acțiune imediată necesară
// warning: atenționare, acțiune în curând
// info: informativ, pattern detectat

export function generateAlerts(dailyLog = [], mm92Cd = {}, pw56Cd = {}, mm92Rp = {}, pw56Rp = {}) {
  const alerts = [];
  const now = new Date();
  const allTurbines = getAllTurbines();

  // ─── 1. RECURRING ERRORS (same error code on same turbine) ───
  const errorMap = {};
  dailyLog.filter(e => e.mode === "remote" && e.errorCode).forEach(e => {
    const key = `${e.park}|${e.turbine}|${e.errorCode}`;
    if (!errorMap[key]) errorMap[key] = [];
    errorMap[key].push(e);
  });
  Object.entries(errorMap).forEach(([key, entries]) => {
    if (entries.length >= 2) {
      const [park, turbine, code] = key.split("|");
      const lastDate = entries.sort((a, b) => b.date.localeCompare(a.date))[0].date;
      const failedResets = entries.filter(e => e.resetStatus === "reset_failed").length;
      alerts.push({
        type: failedResets > 0 ? "critical" : "warning",
        category: "Eroare recurentă",
        title: `${code} — ${turbine} (${park})`,
        message: `Eroarea ${code} a apărut de ${entries.length} ori${failedResets > 0 ? `, ${failedResets} reseturi eșuate` : ""}. Ultima: ${lastDate}. Investigare recomandată.`,
        turbine, park, code, count: entries.length
      });
    }
  });

  // ─── 2. OIL CHANGE INTERVALS ───
  const oilItems = [
    { id: "19.1", name: "Nivel ulei gearbox", interval: "anual", protocol: "MM92" },
    { id: "19.2", name: "Schimb ulei gearbox", interval: "5ani", protocol: "MM92" },
    { id: "PW13.5", name: "Schimb ulei gearbox", interval: "5ani", protocol: "PW56" },
    { id: "PW13.4", name: "Nivel ulei", interval: "sem", protocol: "PW56" },
    { id: "PW11.3b", name: "Schimb ulei orientare", interval: "3ani", protocol: "PW56" },
    { id: "PW19.2b", name: "Schimb ulei hidraulic", interval: "2ani", protocol: "PW56" }
  ];
  oilItems.forEach(item => {
    const cd = item.protocol === "MM92" ? mm92Cd : pw56Cd;
    const d = cd[item.id];
    if (d && d.ok && d.date) {
      const doneDate = new Date(d.date);
      const months = (now - doneDate) / (1000 * 60 * 60 * 24 * 30);
      const intervalMonths = item.interval === "5ani" ? 60 : item.interval === "3ani" ? 36 : item.interval === "2ani" ? 24 : item.interval === "anual" ? 12 : 6;
      const remaining = intervalMonths - months;
      if (remaining < 2 && remaining > -6) {
        alerts.push({
          type: remaining < 0 ? "critical" : "warning",
          category: "Schimb ulei",
          title: `${item.name} — ${item.protocol}`,
          message: remaining < 0
            ? `Schimbul de ulei este depășit cu ${Math.abs(Math.round(remaining))} luni! Programați urgent.`
            : `Schimbul de ulei se apropie — mai sunt ~${Math.round(remaining)} luni. Planificați.`
        });
      }
    }
  });

  // ─── 3. BATTERY CHECKS ───
  const batteryItems = [
    { id: "PW4.4", name: "UPS baterie", protocol: "PW56" },
    { id: "PW6.3", name: "Baterii backup ABB", protocol: "PW56", replaceYears: 6 },
    { id: "PW20.7", name: "Tensiune baterie axe", protocol: "PW56" }
  ];
  batteryItems.forEach(item => {
    const cd = item.protocol === "MM92" ? mm92Cd : pw56Cd;
    const d = cd[item.id];
    if (d && d.ok && d.value) {
      const val = parseFloat(d.value);
      if (item.id === "PW20.7" && val < 30) {
        alerts.push({ type: "critical", category: "Baterie", title: `${item.name} — tensiune scăzută`, message: `Tensiune baterie: ${val}V (minim 30V). Înlocuire necesară.` });
      }
    }
    if (!d || !d.ok) {
      alerts.push({ type: "info", category: "Baterie", title: `${item.name} — neverificat`, message: `Verificarea ${item.name} nu a fost efectuată. Includeți în următorul service.` });
    }
  });

  // ─── 4. UNRESOLVED ISSUES ───
  const mm92Issues = Array.isArray(mm92Rp) ? mm92Rp : [];
  const pw56Issues = Array.isArray(pw56Rp) ? pw56Rp : [];
  // These are actually iss (issues arrays), not rp
  // Will be passed correctly from App

  // ─── 5. STALE INTERVENTIONS (in_progress for more than 7 days) ───
  dailyLog.filter(e => e.status === "in_progress").forEach(e => {
    const entryDate = new Date(e.date);
    const days = (now - entryDate) / (1000 * 60 * 60 * 24);
    if (days > 7) {
      alerts.push({
        type: "warning",
        category: "Intervenție deschisă",
        title: `${e.date} — ${e.turbine || "Nespecificat"} (${e.park || ""})`,
        message: `Intervenția din ${e.date} este în lucru de ${Math.round(days)} zile. Actualizați statusul sau finalizați.`
      });
    }
  });

  // ─── 6. PARTS PENDING ───
  dailyLog.filter(e => e.status === "pending_parts").forEach(e => {
    alerts.push({
      type: "warning",
      category: "Piese în așteptare",
      title: `${e.turbine || "Turbină"} — ${e.parts || "piese nespecificate"}`,
      message: `Intervenția din ${e.date} așteaptă piese${e.parts ? ": " + e.parts : ""}. Verificați disponibilitatea.`
    });
  });

  // ─── 7. FREQUENT TURBINE (most interventions in last 30 days) ───
  const last30 = dailyLog.filter(e => {
    const d = new Date(e.date);
    return (now - d) / (1000 * 60 * 60 * 24) < 30;
  });
  const turbineCount = {};
  last30.forEach(e => {
    const key = `${e.park}|${e.turbine}`;
    if (e.turbine) turbineCount[key] = (turbineCount[key] || 0) + 1;
  });
  Object.entries(turbineCount).forEach(([key, count]) => {
    if (count >= 4) {
      const [park, turbine] = key.split("|");
      alerts.push({
        type: "info",
        category: "Frecvență ridicată",
        title: `${turbine} (${park}) — ${count} intervenții/lună`,
        message: `Turbina ${turbine} a avut ${count} intervenții în ultimele 30 zile. Poate necesita inspecție aprofundată.`
      });
    }
  });

  // Sort: critical first, then warning, then info
  const order = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => order[a.type] - order[b.type]);

  return alerts;
}
