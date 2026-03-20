// src/components/Welcome.jsx — Welcome dashboard with quick access to all features
import { useState } from "react";
import { Wind, ClipboardList, FileText, Camera, Zap, BookOpen, CalendarDays, Monitor, AlertTriangle, Bell, ChevronDown, ChevronUp } from "lucide-react";

export default function Welcome({ T, onNavigate, stats = {}, alerts = [] }) {
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const criticalCount = alerts.filter(a => a.type === "critical").length;
  const warningCount = alerts.filter(a => a.type === "warning").length;
  const visibleAlerts = showAllAlerts ? alerts : alerts.slice(0, 5);

  const cards = [
    { id: "interventii_local", tab: "interventii", icon: CalendarDays, color: "#2563eb", label: "Intervenții Locale", desc: "Raportare intervenții pe teren", stat: stats.localCount },
    { id: "interventii_remote", tab: "interventii_remote", icon: Monitor, color: "#7c3aed", label: "Intervenții Remote", desc: "Monitorizare și reset SCADA", stat: stats.remoteCount },
    { id: "mm92", tab: "mentenanta", icon: Wind, color: "#0891b2", label: "Senvion MM92", desc: "Protocol mentenanță MM92", stat: stats.mm92Progress },
    { id: "pw56", tab: "pw56", icon: Wind, color: "#059669", label: "PowerWind PW56", desc: "Protocol mentenanță PW56", stat: stats.pw56Progress },
    { id: "docs", tab: "documentatie", icon: BookOpen, color: "#d97706", label: "Documentație", desc: "Manuale și referințe tehnice", stat: stats.docsCount ? `${stats.docsCount} docs` : null },
    { id: "gallery", tab: "documentatie_gallery", icon: Camera, color: "#db2777", label: "Galerie Vizuală", desc: "Referințe foto componente", stat: stats.galleryCount ? `${stats.galleryCount} ref` : null },
    { id: "ai", tab: "ai", icon: Zap, color: "#6366f1", label: "Asistent AI", desc: "Analiză, recunoaștere, sugestii" },
    { id: "reports", tab: "mentenanta_history", icon: FileText, color: "#64748b", label: "Istoric Rapoarte", desc: "Rapoarte salvate MM92/PW56" }
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Hero */}
        <div style={{
          textAlign: "center", padding: "40px 20px 32px", marginBottom: 24,
          background: `linear-gradient(135deg, ${T.surface} 0%, ${T.surfaceAlt} 100%)`,
          borderRadius: 16, border: `1px solid ${T.border}`,
          position: "relative", overflow: "hidden"
        }}>
          {/* Subtle grid pattern */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: `repeating-linear-gradient(0deg,${T.text} 0 1px,transparent 1px 40px),repeating-linear-gradient(90deg,${T.text} 0 1px,transparent 1px 40px)` }} />

          <img src="/logo.png" alt="Blue Line Energy" style={{ height: 48, marginBottom: 16, position: "relative" }} />

          <h1 style={{ fontSize: 28, fontWeight: 700, color: T.text, margin: "0 0 6px", position: "relative", letterSpacing: "-0.5px" }}>
            Service Management Platform
          </h1>
          <p style={{ fontSize: 14, color: T.textMuted, margin: 0, position: "relative" }}>
            Wind Turbine Maintenance — Senvion MM92 & PowerWind PW56
          </p>

          {/* Status bar */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20, position: "relative", flexWrap: "wrap" }}>
            {[
              { label: "Turbine", value: "7", color: T.accent },
              { label: "Parcuri", value: "3", color: T.ok },
              { label: "Intervenții", value: stats.totalInterventions || "0", color: "#d97706" }
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: "'IBM Plex Mono', monospace" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Insights */}
        {alerts.length > 0 && <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Bell size={18} color={criticalCount > 0 ? T.nok : T.warn} />
            <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Alerte & Recomandări</span>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: criticalCount > 0 ? `${T.nok}22` : `${T.warn}22`, color: criticalCount > 0 ? T.nok : T.warn, fontWeight: 600 }}>
              {criticalCount > 0 ? `${criticalCount} critice` : ""}{criticalCount > 0 && warningCount > 0 ? " · " : ""}{warningCount > 0 ? `${warningCount} atenționări` : ""}
              {criticalCount === 0 && warningCount === 0 ? `${alerts.length} info` : ""}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {visibleAlerts.map((alert, i) => {
              const colors = { critical: { bg: `${T.nok}12`, border: T.nok, icon: T.nok, text: T.nok }, warning: { bg: `${T.warn}12`, border: T.warn, icon: T.warn, text: T.warn }, info: { bg: `${T.accent}08`, border: T.accent, icon: T.accent, text: T.accent } };
              const c = colors[alert.type] || colors.info;
              return (
                <div key={i} style={{ padding: "10px 14px", background: c.bg, borderLeft: `3px solid ${c.border}`, borderRadius: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <AlertTriangle size={16} color={c.icon} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: `${c.border}22`, color: c.text, fontWeight: 700, textTransform: "uppercase" }}>{alert.category}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{alert.title}</span>
                    </div>
                    <div style={{ fontSize: 12, color: T.textSec, marginTop: 3, lineHeight: 1.5 }}>{alert.message}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {alerts.length > 5 && (
            <button onClick={() => setShowAllAlerts(p => !p)} style={{ width: "100%", padding: "8px", marginTop: 6, border: `1px solid ${T.border}`, borderRadius: 8, background: T.surface, color: T.textSec, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              {showAllAlerts ? <><ChevronUp size={14} /> Afișează mai puțin</> : <><ChevronDown size={14} /> Toate alertele ({alerts.length})</>}
            </button>
          )}
        </div>}

        {/* Quick access grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {cards.map(card => {
            const Icon = card.icon;
            return (
              <button key={card.id} onClick={() => onNavigate(card.tab)} style={{
                padding: "20px 16px", background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 12, cursor: "pointer", textAlign: "left",
                display: "flex", flexDirection: "column", gap: 10,
                transition: "all 0.2s", position: "relative", overflow: "hidden"
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = card.color; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${card.color}22`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${card.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={20} color={card.color} />
                  </div>
                  {card.stat && <span style={{ marginLeft: "auto", fontSize: 11, padding: "2px 8px", borderRadius: 6, background: `${card.color}15`, color: card.color, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>{card.stat}</span>}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{card.label}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{card.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "24px 0 8px", color: T.textMuted, fontSize: 11 }}>
          Blue Line Energy © {new Date().getFullYear()} — Service Management Platform v2.0
        </div>
      </div>
    </div>
  );
}
