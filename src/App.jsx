import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { ClipboardList, AlertTriangle, BarChart3, ShieldCheck, Search, Wrench, Settings, RotateCcw, CircleDot, Circle, Lock, Cog, Zap, Link2, Box, Droplets, Wind, Compass, ArrowUpDown, Plug, Home, Building, ArrowUp, Building2, Server, Thermometer, FileCheck, Eye, Camera, PenTool, Disc, RefreshCw, FileText, BookOpen, CalendarDays } from "lucide-react";
import { SECTIONS_PW56 } from "./data/sectionsPW56";
import { FLEET, getAllTurbines, getParks } from "./data/fleet";
import { syncMM92, syncPW56, syncDailyLog, syncHistoryMM92, syncHistoryPW56, syncCustomNames, loadAllFromCloud, onSyncStatusChange, KEYS } from "./lib/cloudSync";

const AIAssistantLazy = lazy(() => import("./components/AIAssistant"));
function AIAssistantView({T,dailyLog}){
  return <Suspense fallback={<div style={{padding:20,color:T.textMuted}}>Se încarcă...</div>}><AIAssistantLazy T={T} dailyLog={dailyLog}/></Suspense>;
}

const FloatingAILazy = lazy(() => import("./components/FloatingAI"));
function FloatingAIChat({T,sectionContext,dailyLog}){
  return <Suspense fallback={null}><FloatingAILazy T={T} sectionContext={sectionContext} dailyLog={dailyLog}/></Suspense>;
}

const DocumentationLazy = lazy(() => import("./components/Documentation"));
function DocumentationView({T}){
  return <Suspense fallback={<div style={{padding:20,color:T.textMuted}}>Se încarcă...</div>}><DocumentationLazy T={T}/></Suspense>;
}

const VisualGalleryLazy = lazy(() => import("./components/VisualGallery"));
function VisualGalleryView({T}){
  return <Suspense fallback={<div style={{padding:20,color:T.textMuted}}>Se încarcă...</div>}><VisualGalleryLazy T={T}/></Suspense>;
}

const DailyLogLazy = lazy(() => import("./components/DailyLog"));
function DailyLogView({T,dailyLog,setDailyLog}){
  return <Suspense fallback={<div style={{padding:20,color:T.textMuted}}>Se încarcă...</div>}><DailyLogLazy T={T} dailyLog={dailyLog} setDailyLog={setDailyLog}/></Suspense>;
}

/* ─── CUSTOM SVG ICONS ─── */
const TurbineIcon = ({size=16,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="10" r="2"/>
    <path d="M12 8V2.5c0-.3.2-.5.4-.4l4.5 2.6c.3.2.3.6 0 .7L12 8z"/>
    <path d="M10.3 11l-4.8 2.8c-.3.2-.6 0-.6-.3l0-5.2c0-.3.4-.5.6-.3L10.3 11z"/>
    <path d="M13.7 11l4.8 2.8c.3.2.2.6-.1.6l-4.5-.1c-.3 0-.5-.3-.4-.5L13.7 11z"/>
    <line x1="12" y1="12" x2="12" y2="22"/>
    <line x1="9" y1="22" x2="15" y2="22"/>
  </svg>
);

const BladeIcon = ({size=16,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 12c0-6-1.5-10-3-10s-1.5 4.5 0 10"/>
    <path d="M12 12c5.2 3 9.2 3.5 9.5 2s-3.5-3-9.5-5"/>
    <path d="M12 12c-5.2 3-9.2 3.5-9.5 2s3.5-3 9.5-5"/>
    <circle cx="12" cy="12" r="1.5"/>
  </svg>
);

const GearboxIcon = ({size=16,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="12" r="4"/><circle cx="17" cy="12" r="3"/>
    <circle cx="9" cy="12" r="1"/><circle cx="17" cy="12" r="1"/>
  </svg>
);

const BrakeIcon = ({size=16,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>
    <line x1="12" y1="3" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="21"/>
    <line x1="3" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="21" y2="12"/>
  </svg>
);

const BearingIcon = ({size=16,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>
    <circle cx="12" cy="4" r="1"/><circle cx="12" cy="20" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="20" cy="12" r="1"/>
  </svg>
);

const NacelleIcon = ({size=16,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 16h18l-2-6H7l-2 6z"/><path d="M7 10V8c0-1 1-2 2-2h6c1 0 2 1 2 2v2"/>
    <line x1="12" y1="16" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
);

const TowerIcon = ({size=16,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2h4l1.5 20h-7L10 2z"/><line x1="7" y1="22" x2="17" y2="22"/>
    <line x1="9.5" y1="8" x2="14.5" y2="8"/><line x1="9" y1="14" x2="15" y2="14"/>
  </svg>
);

const HubIcon = ({size=16,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/>
    <line x1="12" y1="5" x2="12" y2="3"/><line x1="17" y1="15.5" x2="18.7" y2="16.5"/><line x1="7" y1="15.5" x2="5.3" y2="16.5"/>
  </svg>
);

const GeneratorIcon = ({size=16,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="6" width="16" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>
    <path d="M12 9v-3m0 12v-3"/><path d="M9 12H4m16 0h-5"/>
    <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
  </svg>
);

const SlipRingIcon = ({size=16,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="2"/>
    <path d="M20 12h2M2 12h2"/>
  </svg>
);

/* ─── ICON MAP ─── */
const ICON_MAP = {
  report: ClipboardList, issues: AlertTriangle, progress: BarChart3,
  s0: ShieldCheck, s1: Search, s2: BladeIcon, s3: Wrench,
  s4: BearingIcon, s5: RotateCcw, s6b: HubIcon, s7b: BearingIcon,
  s8: Lock, s9: GearboxIcon, s10: SlipRingIcon, s11: BrakeIcon,
  s12: Link2, s13: Box, s14: GeneratorIcon, s15: Droplets,
  s16: Wind, s17: BrakeIcon, s18: BearingIcon, s19: Compass,
  s20: ArrowUpDown, s21: Plug, s22: NacelleIcon, s23: TowerIcon,
  s24: ArrowUp, s25: TowerIcon, s26: Server, s27_34: Thermometer,
  blade_bolts: FileCheck, blade_inspection: Eye, photos: Camera, procedures: BookOpen, signatures: PenTool
};

const ICON_PDF = {
  report:"📋",issues:"⚠️",progress:"📊",s0:"🛡️",s1:"🔍",s2:"🌀",s3:"🔩",
  s4:"⚙️",s5:"🔄",s6b:"🎯",s7b:"🔵",s8:"🔒",s9:"⚙️",s10:"💫",s11:"🛑",
  s12:"🔗",s13:"🏗️",s14:"⚡",s15:"💧",s16:"🌬️",s17:"🔧",s18:"🔃",s19:"🧭",
  s20:"🏋️",s21:"🔌",s22:"🏠",s23:"🗼",s24:"🛗",s25:"🏛️",s26:"📦",s27_34:"🌡️",
  blade_bolts:"📝",blade_inspection:"🔎",photos:"📸",procedures:"📖",signatures:"✍️"
};

function SectionIcon({id, size=16, color="currentColor"}) {
  const Comp = ICON_MAP[id] || ClipboardList;
  return <Comp size={size} color={color} />;
}

const THEMES = {
  industrial: { name:"Industrial", label:"⚙️ Industrial",
    bg:"#0f1419",surface:"#1a2028",surfaceAlt:"#212a34",sidebar:"#0a0f14",
    sidebarHover:"#151d26",sidebarActive:"#1c2a38",sidebarText:"#6b7f95",
    sidebarActiveText:"#4fc3f7",text:"#e8edf2",textSec:"#9aabb8",textMuted:"#566573",
    border:"#2a3744",borderLight:"#212a34",accent:"#4fc3f7",accentLight:"#0d2a3d",
    ok:"#66bb6a",okBg:"#1b2e1b",nok:"#ef5350",nokBg:"#2e1515",
    warn:"#ffa726",warnBg:"#2e2210",cardShadow:"0 2px 12px rgba(0,0,0,0.4)"
  },
  arctic: { name:"Arctic", label:"❄️ Arctic",
    bg:"#f4f7fa",surface:"#ffffff",surfaceAlt:"#f0f4f8",sidebar:"#1b2838",
    sidebarHover:"#243447",sidebarActive:"#2d4156",sidebarText:"#8899aa",
    sidebarActiveText:"#64b5f6",text:"#1a2535",textSec:"#546578",textMuted:"#8899aa",
    border:"#dce4ec",borderLight:"#edf2f7",accent:"#1976d2",accentLight:"#e3f0fc",
    ok:"#2e7d32",okBg:"#e8f5e9",nok:"#c62828",nokBg:"#ffebee",
    warn:"#ef6c00",warnBg:"#fff3e0",cardShadow:"0 1px 8px rgba(25,50,80,0.08)"
  },
  midnight: { name:"Midnight", label:"🌑 Midnight",
    bg:"#0a0a12",surface:"#12121e",surfaceAlt:"#1a1a2a",sidebar:"#06060e",
    sidebarHover:"#14142a",sidebarActive:"#1e1e3a",sidebarText:"#5a5a8a",
    sidebarActiveText:"#9c8cff",text:"#e0e0f0",textSec:"#9090b0",textMuted:"#505070",
    border:"#2a2a40",borderLight:"#1e1e30",accent:"#7c6cf7",accentLight:"#1e1a3a",
    ok:"#4caf50",okBg:"#1a2e1a",nok:"#ff5252",nokBg:"#2e1414",
    warn:"#ffab40",warnBg:"#2e2414",cardShadow:"0 2px 16px rgba(0,0,0,0.5)"
  },
  turbine: { name:"Turbine", label:"🌊 Turbine",
    bg:"#091a2a",surface:"#0e2438",surfaceAlt:"#132e45",sidebar:"#05101c",
    sidebarHover:"#0e2438",sidebarActive:"#163550",sidebarText:"#4a7a9f",
    sidebarActiveText:"#4dd0e1",text:"#d0e8f5",textSec:"#7ab0cc",textMuted:"#3d6a85",
    border:"#1a3d5a",borderLight:"#132e45",accent:"#00acc1",accentLight:"#0a2a35",
    ok:"#66bb6a",okBg:"#0a2a14",nok:"#ef5350",nokBg:"#2a1010",
    warn:"#ffb74d",warnBg:"#2a2010",cardShadow:"0 2px 12px rgba(0,40,80,0.35)"
  },
  field: { name:"Field", label:"🌿 Teren",
    bg:"#f2f7f2",surface:"#ffffff",surfaceAlt:"#f5faf5",sidebar:"#182418",
    sidebarHover:"#223022",sidebarActive:"#2c4a2c",sidebarText:"#6a8a6a",
    sidebarActiveText:"#81c784",text:"#1a2e1a",textSec:"#3d5a3d",textMuted:"#6a8a6a",
    border:"#c0d8c0",borderLight:"#ddf0dd",accent:"#388e3c",accentLight:"#c8e6c9",
    ok:"#2e7d32",okBg:"#e8f5e9",nok:"#c62828",nokBg:"#ffebee",
    warn:"#e65100",warnBg:"#fff3e0",cardShadow:"0 1px 6px rgba(0,40,0,0.08)"
  },
  highContrast: { name:"High Contrast", label:"🔆 Contrast",
    bg:"#000000",surface:"#0a0a0a",surfaceAlt:"#141414",sidebar:"#000000",
    sidebarHover:"#1a1a1a",sidebarActive:"#222222",sidebarText:"#aaaaaa",
    sidebarActiveText:"#ffffff",text:"#ffffff",textSec:"#cccccc",textMuted:"#888888",
    border:"#444444",borderLight:"#222222",accent:"#00aaff",accentLight:"#002244",
    ok:"#00ff66",okBg:"#003311",nok:"#ff3333",nokBg:"#330000",
    warn:"#ffcc00",warnBg:"#332200",cardShadow:"0 1px 4px rgba(255,255,255,0.05)"
  }
};
const THEME_KEYS = Object.keys(THEMES);

const SECTIONS=[
{id:"report",title:"Raport de Service",icon:"📋",items:[]},
{id:"issues",title:"Puncte nerezolvate",icon:"⚠️",items:[]},
{id:"progress",title:"Progres global",icon:"📊",items:[]},
{id:"s0",title:"0 · Siguranță",icon:"🛡️",items:[
{id:"0.1",name:"Control, autotest",interval:"sem",hasResult:true},
{id:"0.2",name:"Buton întrerupere urgență",interval:"sem",hasResult:true,subs:[{id:"0.2a",name:"Invertor/cutie pardoseală",hasResult:true},{id:"0.2b",name:"Cutia superioară",hasResult:true},{id:"0.2c",name:"Unitate mobilă",hasResult:true}]},
{id:"0.3",name:"Iluminare",interval:"sem",hasResult:true,subs:[{id:"0.3a",name:"Iluminat exterior",hasResult:true},{id:"0.3b",name:"Interior turn",hasResult:true},{id:"0.3c",name:"Urgență",hasResult:true},{id:"0.3d",name:"Nacelă",hasResult:true},{id:"0.3e",name:"Butuc rotor",hasResult:true}]},
{id:"0.4",name:"Termene controale",interval:"anual",subs:[{id:"0.4a",name:"Stingător nacelă (2x)",hasDateField:true},{id:"0.4b",name:"Stingător turn",hasDateField:true},{id:"0.4c",name:"Echipament protecție",hasDateField:true},{id:"0.4d",name:"Trusă prim ajutor nacelă",hasDateField:true},{id:"0.4e",name:"Trusă prim ajutor turn",hasDateField:true},{id:"0.4f",name:"Aparat salvare",hasDateField:true},{id:"0.4g",name:"Scări/protecție cădere",hasDateField:true},{id:"0.4h",name:"Scripete/troliu",hasDateField:true},{id:"0.4i",name:"Lift serviciu",hasDateField:true}]}]},
{id:"s1",title:"1 · Controale generale",icon:"🔍",items:[
{id:"1.1",name:"Fisuri / defecțiuni",interval:"anual",note:"Opriți la fisuri în structuri!"},
{id:"1.2",name:"Scurgere / penetrare apă",interval:"sem"},{id:"1.3",name:"Zgomote neobișnuite",interval:"sem"},{id:"1.4",name:"Coroziune",interval:"anual"},{id:"1.5",name:"Inspecție vizuală generală",interval:"sem"}]},
{id:"s2",title:"2 · Pale rotor",icon:"🌀",items:[
{id:"2.1",name:"Suprafață pală/vârf/receptor",interval:"anual",note:"Verificare binoclu",subs:[{id:"2.1a",name:"Pala 1:",hasTextField:true,hasResult:true},{id:"2.1b",name:"Pala 2:",hasTextField:true,hasResult:true},{id:"2.1c",name:"Pala 3:",hasTextField:true,hasResult:true}]},
{id:"2.2",name:"Evolution Package LM",interval:"sem"},{id:"2.3",name:"Etanșare bază-flanșă",interval:"anual"},{id:"2.4",name:"Capac închidere interior",interval:"anual"},{id:"2.5",name:"Platforma închidere",interval:"anual"},{id:"2.6",name:"Lipire nervuri",interval:"anual"},{id:"2.7",name:"Paratrăsnet",interval:"anual"},{id:"2.8",name:"Cartele trăsnete (3x)",interval:"anual"}]},
{id:"s3",title:"3 · Buloane pală",icon:"🔩",items:[
{id:"3.5",name:"Pală LM45.3P 3×80",interval:"sem",note:"M30-10, 235Nm+170°"},{id:"3.6",name:"Pală RE45.2 3×80",interval:"sem",note:"M30-10, 235Nm+160°"}]},
{id:"s4",title:"4 · Rulment pală",icon:"⚙️",items:[
{id:"4.1",name:"Verificare vizuală rulmenți",interval:"anual"},{id:"4.2",name:"Etanșări int./ext.",interval:"sem"},{id:"4.3",name:"Unsoare ieșită",interval:"necesitate"},{id:"4.6",name:"Dantura/capac",interval:"sem"},{id:"4.7d",name:"Rulment pală-butuc",interval:"2ani",note:"1340/1470Nm"},{id:"4.8",name:"Pompă lubrifiere",interval:"5ani"},{id:"4.9a",name:"Căi rulare (auto)",interval:"sem",hasValueField:true,valueLabel:"kg"},{id:"4.9b",name:"Căi rulare (manual)",interval:"sem"},{id:"4.10a",name:"Dantura (auto)",interval:"sem"},{id:"4.10b",name:"Dantura (pinion)",interval:"sem"},{id:"4.11",name:"Pinion lubrifiere",interval:"sem"},{id:"4.12a",name:"Recipienți lubrifiant",interval:"sem",hasValueField:true,valueLabel:"Nr.sticle"},{id:"4.12b",name:"Pungă colectoare",interval:"sem",hasValueField:true,valueLabel:"Nr.saci"}]},
{id:"s5",title:"5 · Reglare pas pală",icon:"🔄",items:[
{id:"5.1",name:"Nivel ulei mecanism",interval:"anual",hasValueField:true,valueLabel:"Litri"},{id:"5.2",name:"Schimb ulei pitch",interval:"5ani"},{id:"5.3",name:"Etanșare",interval:"sem"},{id:"5.4",name:"Perii cărbune",interval:"2ani"},{id:"5.5",name:"Motor-mecanism",interval:"prim",note:"M12-8.8, 56/61Nm"},{id:"5.6",name:"Circuit baterie",interval:"sem"},{id:"5.7",name:"Conexiuni/cabluri",interval:"sem"},{id:"5.9",name:"Cutii hub",interval:"sem"},{id:"5.10",name:"Componente butuc",interval:"sem"},{id:"5.11",name:"Control acumulatori",interval:"anual"},{id:"5.12",name:"Bancuri baterii",interval:"sem",note:"Max 0.3V DC"},{id:"5.13",name:"Protecție supratensiune",interval:"sem"},{id:"5.14",name:"Încălzire cutie",interval:"anual"},{id:"5.15",name:"RCD hub",interval:"anual",hasRCD:true},{id:"5.16",name:"Întrerupător cursă hub",interval:"sem"},{id:"5.17",name:"Setare 91°/92°/95°",interval:"anual"},{id:"5.18",name:"Funcție 95°",interval:"sem"},{id:"5.19",name:"Suport îmbinare pală",interval:"sem"},{id:"5.20",name:"Senzor B",interval:"sem"},{id:"5.21",name:"Rotire pală ~330°",interval:"sem"},{id:"5.22",name:"Watchdog",interval:"anual"},{id:"5.23",name:"Setare pală (calibru)",interval:"anual",subs:[{id:"5.23a",name:"Axa 1:",hasTextField:true},{id:"5.23b",name:"Axa 2:",hasTextField:true},{id:"5.23c",name:"Axa 3:",hasTextField:true}]}]},
{id:"s6b",title:"6B · Butuc rotor",icon:"🎯",items:[
{id:"6B.1",name:"Mecanism-butuc",interval:"prim",note:"M16-10.9, 200/220Nm"},{id:"6B.2",name:"Cutie-butuc",interval:"prim",note:"150/165Nm"},{id:"6B.3",name:"Cutie control",interval:"prim"},{id:"6B.4",name:"Stea orientare",interval:"prim",note:"275/300Nm"},{id:"6B.5",name:"Unghi orientare",interval:"prim"},{id:"6B.6",name:"Suport sub vânt",interval:"prim"},{id:"6B.7",name:"Capac rulment",interval:"prim"},{id:"6B.8",name:"Butuc-ax rotor",interval:"prim",note:"2320/2550Nm"},{id:"6B.9",name:"Piese desprinse",interval:"sem"},{id:"6B.10",name:"Deviere apă",interval:"sem"}]},
{id:"s7b",title:"7B · Rulment principal",icon:"🔵",items:[
{id:"7B.1",name:"Colectare unsoare",interval:"sem",hasValueField:true,valueLabel:"kg"},{id:"7B.2",name:"Lubrifiere rulment",interval:"sem",hasValueField:true,valueLabel:"kg"},{id:"7B.3",name:"Racorduri/cabluri",interval:"anual"},{id:"7B.4",name:"Senzori turație",interval:"sem",note:"3mm (±2/-1)"},{id:"7B.5",name:"Protecție trăsnet",interval:"sem",note:"Perii min 20mm"},{id:"7B.6",name:"Carcasă-sasiu",interval:"prim",note:"2850/3130Nm"},{id:"7B.7",name:"Piulița arbore",interval:"sem"}]},
{id:"s8",title:"8 · Blocare rotor",icon:"🔒",items:[{id:"8.1",name:"Bulon blocare",interval:"anual"},{id:"8.2",name:"Avertisment acustică",interval:"sem"}]},
{id:"s9",title:"9 · Gearbox",icon:"⚡",items:[
{id:"9.1",name:"Scurgeri ulei",interval:"sem"},{id:"9.2",name:"Nivel ulei",interval:"sem",hasValueField:true,valueLabel:"litri"},{id:"9.3",name:"Schimb ulei",interval:"5ani"},{id:"9.4",name:"Probă ulei",interval:"sem"},{id:"9.5",name:"Senzor nivel",interval:"sem"},{id:"9.6",name:"Filtru ventilație",interval:"anual"},{id:"9.7",name:"Reazem elastomeric",interval:"sem"},{id:"9.8",name:"Cutie angrenaje",interval:"sem"},{id:"9.9",name:"Senzori/transductor",interval:"sem"},{id:"9.10",name:"Legare pământ",interval:"sem"},{id:"9.11",name:"Senzori/cabluri",interval:"sem"},{id:"9.12",name:"Marcaj glisare",interval:"sem"},{id:"9.13",name:"Fixare ax-reductor",interval:"sem"},{id:"9.14",name:"Suport elastomer",interval:"prim",note:"2320/2550Nm"},{id:"9.15a",name:"Filtru ulei",interval:"anual"},{id:"9.15b",name:"Furtunuri/țevi",interval:"sem"},{id:"9.15c",name:"Scurgeri răcire",interval:"sem"},{id:"9.15e",name:"Ventilator/radiator",interval:"sem"},{id:"9.15f",name:"Furtune radiator",interval:"anual"},{id:"9.15g",name:"Încălzire ulei",interval:"anual"}]},
{id:"s10",title:"10 · Inele contact",icon:"💫",items:[{id:"10.2",name:"Schleifring MM92",interval:"anual"},{id:"10.3",name:"Mersen MM92",interval:"anual"}]},
{id:"s11",title:"11 · Frână rotor",icon:"🛑",items:[
{id:"11.1",name:"Suprafață disc",interval:"sem"},{id:"11.2",name:"Unsoare pe disc",interval:"sem"},{id:"11.3",name:"Plăcuțe frână",interval:"sem"},{id:"11.4",name:"Fantă plăcuțe-disc",interval:"sem",note:"1.0±0.2mm"},{id:"11.5",name:"Uzură garnitură",interval:"sem",hasValueField:true,valueLabel:"mm"},{id:"11.6",name:"Etrier/scurgere",interval:"sem"},{id:"11.7",name:"Indicator uzură",interval:"anual"},{id:"11.8",name:"Frână-transmisie",interval:"prim",note:"2320/2550Nm"}]},
{id:"s12",title:"12 · Cuplaj elastic",icon:"🔗",items:[{id:"12.1",name:"Lamele oțel",interval:"sem"},{id:"12.2",name:"Cuplaj fricțiune",interval:"sem",hasValueField:true,valueLabel:"mm"},{id:"12.3",name:"Rondelă izolație",interval:"sem"}]},
{id:"s13",title:"13 · Sasiu nacelă",icon:"🏗️",items:[{id:"13.1",name:"Suport-generator",interval:"prim",note:"2600/2860Nm"}]},
{id:"s14",title:"14 · Generator",icon:"⚡",items:[
{id:"14.1",name:"Generalități/cutii",interval:"sem"},{id:"14.2",name:"Legare pământ",interval:"anual"},{id:"14.3",name:"Prinderi cabluri",interval:"anual"},{id:"14.4",name:"Senzori proximitate",interval:"anual"},{id:"14.5",name:"Senzori/cabluri",interval:"anual"},{id:"14.6",name:"Protecție trăsnet",interval:"anual"},{id:"14.7",name:"Perii carbon",interval:"sem"},{id:"14.8",name:"Lungime perii",interval:"sem"},{id:"14.9",name:"Indicator uzură",interval:"sem"},{id:"14.10",name:"Suport perii",interval:"sem"},{id:"14.11",name:"Resorturi/presare",interval:"sem"},{id:"14.12",name:"Stare inel contact",interval:"anual"},{id:"14.13",name:"Curățare inel",interval:"sem"},{id:"14.14",name:"Rezistență izolație",interval:"anual",subs:[{id:"14.14a",name:"Izolație rulment",hasValueField:true,valueLabel:"Ohm"},{id:"14.14b",name:"ISO stator",hasValueField:true,valueLabel:"Ohm"},{id:"14.14c",name:"ISO rotor",hasValueField:true,valueLabel:"Ohm"}]},{id:"14.15",name:"Cutii filtre",interval:"anual"},{id:"14.16",name:"Ventilator ext.",interval:"sem"},{id:"14.17",name:"Aliniere generator",interval:"sem"},{id:"14.22",name:"Umplere rulmenți",interval:"sem"}]},
{id:"s15",title:"15 · Hidraulic",icon:"💧",items:[
{id:"15.1",name:"Nivel unsoare",interval:"sem"},{id:"15.2",name:"Schimb ulei",interval:"2ani"},{id:"15.3",name:"Filtru ulei",interval:"sem"},{id:"15.4",name:"Înlocuire filtru",interval:"2ani"},{id:"15.5",name:"Scurgeri",interval:"sem"},{id:"15.6",name:"Filtru ventilație",interval:"sem"},{id:"15.7",name:"Acumulator presiune",interval:"sem",hasValueField:true,valueLabel:"bar"},{id:"15.8",name:"Furtunuri/țevi",interval:"anual"},{id:"15.9",name:"Senzor nivel",interval:"anual"},{id:"15.10",name:"Presiune pornire/oprire",interval:"anual",subs:[{id:"15.10a",name:"P_pornit:",hasValueField:true,valueLabel:"bar"},{id:"15.10b",name:"P_oprit:",hasValueField:true,valueLabel:"bar"}]},{id:"15.11",name:"Supapă azimut",interval:"anual",hasValueField:true,valueLabel:"bar"},{id:"15.12",name:"Frână blocare",interval:"anual",hasValueField:true,valueLabel:"bar"},{id:"15.14",name:"Rezervor frână",interval:"anual"},{id:"15.16",name:"Racorduri/cabluri",interval:"anual"}]},
{id:"s16",title:"16 · Anemometru",icon:"🌬️",items:[
{id:"16.1",name:"Fixare stație meteo",interval:"sem"},{id:"16.2",name:"Pământ stație",interval:"sem"},{id:"16.3",name:"Anemometru",interval:"sem"},{id:"16.4",name:"Giruetă",interval:"sem"},{id:"16.5",name:"Direcție giruetă",interval:"anual"},{id:"16.6",name:"Direcție instalație",interval:"anual"},{id:"16.7",name:"Cabluri",interval:"sem"},{id:"16.8",name:"Încălzire anemo",interval:"anual"},{id:"16.9",name:"Balizaj",interval:"anual"}]},
{id:"s17",title:"17 · Frâne orientare",icon:"🔧",items:[
{id:"17.1",name:"Unsoare/ulei disc",interval:"sem"},{id:"17.2",name:"Suprafață disc",interval:"anual"},{id:"17.3",name:"Plăcuțe frână",interval:"anual"},{id:"17.4b",name:"Uzură plăcuțe",interval:"anual",hasValueField:true,valueLabel:"mm"},{id:"17.5",name:"Scârțâituri",interval:"sem"},{id:"17.6",name:"Inspecție/scurgeri",interval:"sem"},{id:"17.7",name:"Ulei scurs",interval:"sem"},{id:"17.8",name:"Frâne-suport",interval:"prim",note:"1100/1210Nm"}]},
{id:"s18",title:"18 · Rulment orientare",icon:"🔃",items:[
{id:"18.1",name:"Test rotire 360°",interval:"sem"},{id:"18.2",name:"Etanșare ext.",interval:"sem"},{id:"18.3",name:"Dantura",interval:"sem"},{id:"18.4",name:"Impurități",interval:"sem"},{id:"18.5",name:"Protecție trăsnet",interval:"sem"},{id:"18.6",name:"Lubrifiere rulment",interval:"sem"},{id:"18.7",name:"Lubrifiere dantura",interval:"sem"},{id:"18.8",name:"Rulment-suport",interval:"prim",note:"990/1090Nm"},{id:"18.9",name:"Cap turn-rulment",interval:"prim"}]},
{id:"s19",title:"19 · Orientare (yaw)",icon:"🧭",items:[
{id:"19.1",name:"Nivel ulei",interval:"anual",hasValueField:true,valueLabel:"litri"},{id:"19.2",name:"Schimb ulei",interval:"5ani"},{id:"19.3",name:"Motoare",interval:"sem"},{id:"19.4",name:"Disp. frânare",interval:"sem"},{id:"19.5",name:"Senzori prox.",interval:"sem"},{id:"19.6",name:"Camă/înfășurare",interval:"sem"},{id:"19.7",name:"Cabluri",interval:"anual"},{id:"19.8",name:"Etanșare",interval:"sem"},{id:"19.9",name:"Mecanism-suport",interval:"prim",note:"200/220Nm"},{id:"19.10",name:"Motor-mecanism",interval:"prim",note:"56/61Nm"}]},
{id:"s20",title:"20 · Scripete/Troliu",icon:"🏋️",items:[
{id:"20.1",name:"Control autorizat",interval:"sem"},{id:"20.2",name:"Funcție generală",interval:"sem"},{id:"20.3",name:"Lanț/frânghie",interval:"sem"},{id:"20.4",name:"Sac lanț/tambur",interval:"sem"},{id:"20.5",name:"Cablu alimentare",interval:"sem"},{id:"20.6",name:"RCD priză",interval:"anual",hasRCD:true}]},
{id:"s21",title:"21 · Sistem electric",icon:"🔌",items:[
{id:"21.1",name:"Tablou superior",interval:"sem"},{id:"21.2",name:"RCD cutie sup.",interval:"anual",hasRCD:true},{id:"21.3b",name:"Test supraviteză",interval:"sem",subs:[{id:"21.3a1",name:"Turații rotor:",hasTextField:true},{id:"21.3a2",name:"Turații transmisie:",hasTextField:true}]},{id:"21.4",name:"Senzori",interval:"sem"},{id:"21.5",name:"Vibrații transmisie",interval:"sem"},{id:"21.6",name:"Vibrații turn",interval:"sem"},{id:"21.7",name:"Comutator vibrații",interval:"sem"},{id:"21.11",name:"CMS",interval:"sem"},{id:"21.12",name:"Cablu comandă",interval:"sem"},{id:"21.13",name:"Fixare cabluri",interval:"sem"}]},
{id:"s22",title:"22 · Nacelă",icon:"🏠",items:[
{id:"22.1",name:"Iluminare",interval:"sem"},{id:"22.2",name:"Stingător (2x)",interval:"sem"},{id:"22.3",name:"Trusă prim ajutor",interval:"sem"},{id:"22.4",name:"Disp. salvare",interval:"sem"},{id:"22.5",name:"Pământ cofrete",interval:"sem"},{id:"22.6",name:"Înveliș nacelă",interval:"sem"},{id:"22.12",name:"Finalizare nacelă",interval:"sem"}]},
{id:"s23",title:"23 · Elemente turn",icon:"🗼",items:[
{id:"23.1",name:"Scară/protecție",interval:"sem"},{id:"23.2",name:"Cabluri",interval:"sem"},{id:"23.3",name:"Iluminare",interval:"sem"},{id:"23.4",name:"Stingător turn",interval:"sem"},{id:"23.5",name:"Trusă turn",interval:"sem"},{id:"23.6",name:"RCD turn",interval:"anual",hasRCD:true},{id:"23.7",name:"Curățenie",interval:"sem"},{id:"23.8",name:"Ușă/balamale",interval:"sem"},{id:"23.11",name:"BUS BAR",interval:"sem",subs:[{id:"23.11a",name:"ISO rotor:",hasValueField:true,valueLabel:"MOhm"},{id:"23.11b",name:"ISO stator:",hasValueField:true,valueLabel:"MOhm"}]},{id:"23.14",name:"Fixare cablu forță",interval:"sem"},{id:"23.16",name:"Pământ turn",interval:"sem"}]},
{id:"s24",title:"24 · Lift",icon:"🛗",items:[{id:"24.1",name:"Lifturi serviciu",interval:"sem"},{id:"24.3",name:"Avanti tip 5",interval:"sem"},{id:"24.4",name:"Ridicare sarcini",interval:"sem"}]},
{id:"s25",title:"25 · Turn",icon:"🏛️",items:[
{id:"25.1",name:"Cordoane sudură",interval:"sem"},{id:"25.2",name:"Îmbinări flanșe",interval:"sem"},{id:"25.3",name:"Suport ușă",interval:"anual"},{id:"25.4",name:"Baza turnului",interval:"sem",subs:[{id:"25.4a",name:"Scară acces"},{id:"25.4b",name:"Iluminat ext."},{id:"25.4c",name:"Video"},{id:"25.4d",name:"Alarmă"},{id:"25.4e",name:"Trotuar beton"},{id:"25.4f",name:"Mastic"},{id:"25.4g",name:"Comunicații"},{id:"25.4h",name:"UPS"},{id:"25.4i",name:"Ușă"}]},{id:"25.19",name:"Flanșe turn 80m",interval:"prim",subs:[{id:"25.19a",name:"Fundație 140×M42",note:"4500/4950Nm"},{id:"25.19b",name:"Conexiune 1 140×M36",note:"2800/3080Nm"},{id:"25.19c",name:"Conexiune 2 84×M42",note:"4500/4950Nm"}]},{id:"25.31",name:"Flanșă sup.",interval:"sem"}]},
{id:"s26",title:"26 · Tablou/Convertizor",icon:"📦",items:[
{id:"26.1",name:"Tablou pardoseală",interval:"sem"},{id:"26.2",name:"RCD 230V",interval:"anual",hasRCD:true},{id:"26.3",name:"Încălzire/ventilator",interval:"sem"},{id:"26.4",name:"Întreținere convertizor",interval:"anual"},{id:"26.5",name:"Inspecție generală",interval:"sem"},{id:"26.6",name:"RCD invertor",interval:"anual",hasRCD:true},{id:"26.7",name:"Cablu comandă",interval:"sem"},{id:"26.8",name:"Curenți vagabonzi",interval:"sem"},{id:"26.9",name:"UPS",interval:"sem"},{id:"26.11",name:"Întrerupător circuit",interval:"sem"},{id:"26.12",name:"Transformator",interval:"sem"},{id:"26.13",name:"Riglete",interval:"sem"}]},
{id:"s27_34",title:"27-34 · Răcire/Fundație",icon:"🌡️",items:[
{id:"27.1",name:"Răcire convertizor",interval:"sem"},{id:"28.1",name:"Curățenie/deșeuri",interval:"sem"},{id:"29.1",name:"Rost turn-fundament",interval:"sem"},{id:"29.2",name:"Fisuri fundament",interval:"sem"},{id:"29.3",name:"Pământ fundament",interval:"sem"},{id:"29.4",name:"Scurgere fundație",interval:"sem"},{id:"30.1",name:"Mediu înconjurător",interval:"sem"},{id:"31A",name:"Trafo uscat",interval:"anual"},{id:"31B",name:"Trafo extern ulei",interval:"anual"},{id:"32",name:"Comutare TM",interval:"sem"},{id:"33",name:"Cabluri TJ/TM",interval:"anual"},{id:"34",name:"Distribuție TM",interval:"anual"}]},
{id:"blade_bolts",title:"Buloane pale",icon:"📝",items:[]},
{id:"blade_inspection",title:"Inspecție pale",icon:"🔎",items:[]},
{id:"photos",title:"Fotografii",icon:"📸",items:[]},
{id:"procedures",title:"Proceduri",icon:"📖",items:[]},
{id:"signatures",title:"Semnături",icon:"✍️",items:[]}
];

const IL={sem:"6 luni",anual:"Anual","2ani":"2 ani","5ani":"5 ani",prim:"Prim serv.",necesitate:"Neces.","3ani":"3 ani","10ani":"10 ani"};
const IC={sem:"#2563eb",anual:"#059669","2ani":"#d97706","5ani":"#dc2626","10ani":"#7c3aed",prim:"#db2777",necesitate:"#6b7280","3ani":"#d97706"};

function SignatureCanvas({label,sigData,onChange,T}){
  const ref=useRef(null);const[dr,setDr]=useState(false);
  useEffect(()=>{if(sigData&&ref.current){const img=new Image();img.onload=()=>ref.current.getContext("2d").drawImage(img,0,0);img.src=sigData;}},[]);
  const gp=e=>{const r=ref.current.getBoundingClientRect();const t=e.touches?e.touches[0]:e;return{x:t.clientX-r.left,y:t.clientY-r.top}};
  const st=e=>{e.preventDefault();setDr(true);const c=ref.current.getContext("2d"),p=gp(e);c.beginPath();c.moveTo(p.x,p.y);c.strokeStyle=T.text;c.lineWidth=2.5;c.lineCap="round"};
  const mv=e=>{if(!dr)return;e.preventDefault();const c=ref.current.getContext("2d"),p=gp(e);c.lineTo(p.x,p.y);c.stroke()};
  const en=()=>{setDr(false);if(ref.current)onChange(ref.current.toDataURL())};
  const cl=()=>{const c=ref.current;c.getContext("2d").clearRect(0,0,c.width,c.height);onChange(null)};
  return(<div style={{marginBottom:16}}>
    <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:6}}>{label}</div>
    <canvas ref={ref} width={320} height={110} onMouseDown={st} onMouseMove={mv} onMouseUp={en} onMouseLeave={en}
      onTouchStart={st} onTouchMove={mv} onTouchEnd={en}
      style={{border:`2px dashed ${T.border}`,borderRadius:8,background:T.surface,cursor:"crosshair",touchAction:"none",maxWidth:"100%",display:"block"}}/>
    <button onClick={cl} style={{marginTop:6,fontSize:12,padding:"6px 14px",background:T.nokBg,color:T.nok,border:`1px solid ${T.nok}44`,borderRadius:6,cursor:"pointer",minHeight:36}}>Șterge</button>
  </div>);
}

/* ─── VOICE DICTATION ─── */
const SpeechRec = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

function VoiceMic({onResult,T}){
  const[active,setActive]=useState(false);
  const recRef=useRef(null);

  const toggle=()=>{
    if(!SpeechRec){alert("Browserul nu suportă recunoaștere vocală. Folosiți Chrome sau Edge.");return}
    if(active){recRef.current?.stop();setActive(false);return}
    const rec=new SpeechRec();rec.lang="ro-RO";rec.continuous=true;rec.interimResults=false;
    rec.onresult=(e)=>{let txt="";for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)txt+=e.results[i][0].transcript+" "}if(txt.trim())onResult(txt.trim())};
    rec.onerror=()=>setActive(false);rec.onend=()=>setActive(false);
    rec.start();recRef.current=rec;setActive(true);
  };

  return(<button onClick={toggle} title={active?"Oprire dictare":"Dictare vocală"} style={{
    width:34,height:34,borderRadius:"50%",border:`2px solid ${active?T.nok:T.border}`,
    background:active?T.nokBg:T.surface,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
    flexShrink:0,transition:"all 0.15s",animation:active?"pulse 1.2s infinite":"none"
  }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill={active?T.nok:"none"} stroke={active?T.nok:T.textMuted} strokeWidth="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  </button>);
}

/* ─── ITEM MEDIA (photos + video per checklist item) ─── */
function ItemMedia({itemId,photos,onAdd,onRemove,T}){
  const cameraRef=useRef(null);
  const videoRef=useRef(null);
  const galleryRef=useRef(null);
  const[showMenu,setShowMenu]=useState(false);
  const myMedia=(photos||[]).filter(p=>p.itemId===itemId);

  const handleFiles=(files)=>{
    Array.from(files).forEach(f=>{
      const isVideo=f.type.startsWith("video/");
      const isImage=f.type.startsWith("image/");
      if(!isImage&&!isVideo)return;
      if(isVideo&&f.size>100*1024*1024){alert("Fișierul video este prea mare (max 100MB).");return}

      if(isVideo){
        // For video: store as base64 (offline) or upload (online)
        const reader=new FileReader();
        reader.onload=(e)=>onAdd({
          id:Date.now()+Math.random(),itemId,name:f.name,data:e.target.result,
          type:"video",mimeType:f.type,size:Math.round(f.size/1024),
          timestamp:new Date().toLocaleString("ro-RO")
        });
        reader.readAsDataURL(f);
      }else{
        // For images: generate thumbnail + store
        const reader=new FileReader();
        reader.onload=(e)=>{
          // Compress image for thumbnail
          const img=new Image();
          img.onload=()=>{
            const canvas=document.createElement("canvas");
            const MAX=1200;
            let w=img.width,h=img.height;
            if(w>MAX||h>MAX){const r=Math.min(MAX/w,MAX/h);w*=r;h*=r}
            canvas.width=w;canvas.height=h;
            canvas.getContext("2d").drawImage(img,0,0,w,h);
            const compressed=canvas.toDataURL("image/jpeg",0.85);
            onAdd({
              id:Date.now()+Math.random(),itemId,name:f.name,data:compressed,
              type:"image",size:Math.round(f.size/1024),
              timestamp:new Date().toLocaleString("ro-RO")
            });
          };
          img.src=e.target.result;
        };
        reader.readAsDataURL(f);
      }
    });
  };

  return(<div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap",marginTop:4}}>
    <div style={{position:"relative"}}>
      <button onClick={()=>setShowMenu(p=>!p)} title="Adaugă foto/video" style={{
        width:36,height:36,borderRadius:"50%",border:`1px solid ${T.border}`,background:T.surface,
        cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0
      }}>
        <Camera size={15} color={T.textMuted}/>
        {myMedia.length>0&&<span style={{position:"absolute",top:-4,right:-4,width:18,height:18,borderRadius:"50%",background:T.accent,color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{myMedia.length}</span>}
      </button>
      {showMenu&&<>
        <div onClick={()=>setShowMenu(false)} style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:98}}/>
        <div style={{position:"absolute",bottom:"110%",left:0,zIndex:99,background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,boxShadow:"0 4px 16px rgba(0,0,0,0.15)",padding:4,minWidth:150}}>
          <button onClick={()=>{cameraRef.current?.click();setShowMenu(false)}} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 10px",border:"none",borderRadius:6,background:"transparent",cursor:"pointer",fontSize:13,color:T.text,textAlign:"left"}}>
            <Camera size={16} color={T.accent}/> Cameră foto
          </button>
          <button onClick={()=>{videoRef.current?.click();setShowMenu(false)}} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 10px",border:"none",borderRadius:6,background:"transparent",cursor:"pointer",fontSize:13,color:T.text,textAlign:"left"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
            Cameră video
          </button>
          <button onClick={()=>{galleryRef.current?.click();setShowMenu(false)}} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 10px",border:"none",borderRadius:6,background:"transparent",cursor:"pointer",fontSize:13,color:T.text,textAlign:"left"}}>
            <Eye size={16} color={T.accent}/> Din galerie
          </button>
        </div>
      </>}
    </div>
    {/* Hidden inputs */}
    <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={e=>{if(e.target.files)handleFiles(e.target.files);e.target.value=""}} style={{display:"none"}}/>
    <input ref={videoRef} type="file" accept="video/*" capture="environment" onChange={e=>{if(e.target.files)handleFiles(e.target.files);e.target.value=""}} style={{display:"none"}}/>
    <input ref={galleryRef} type="file" accept="image/*,video/*" multiple onChange={e=>{if(e.target.files)handleFiles(e.target.files);e.target.value=""}} style={{display:"none"}}/>
    {/* Thumbnails */}
    {myMedia.map(ph=>(
      <div key={ph.id} style={{position:"relative",width:42,height:42,borderRadius:6,overflow:"hidden",border:`1px solid ${ph.type==="video"?T.accent:T.border}`,flexShrink:0}}>
        {ph.type==="video"?(
          <div style={{width:"100%",height:"100%",background:T.surfaceAlt,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}
            onClick={()=>{const w=window.open();w.document.write(`<video src="${ph.data}" controls autoplay style="max-width:100%;max-height:100vh;margin:auto;display:block"/>`);w.document.title=ph.name}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={T.accent} stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        ):(
          <img src={ph.data} alt="" style={{width:"100%",height:"100%",objectFit:"cover",cursor:"pointer"}}
            onClick={()=>{const w=window.open();w.document.write(`<img src="${ph.data}" style="max-width:100%;max-height:100vh;margin:auto;display:block"/>`);w.document.title=ph.name}}/>
        )}
        <button onClick={()=>onRemove(ph.id)} style={{position:"absolute",top:-2,right:-2,width:16,height:16,borderRadius:"50%",background:T.nok,color:"#fff",border:"none",cursor:"pointer",fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>✕</button>
        {ph.type==="video"&&<span style={{position:"absolute",bottom:1,left:1,fontSize:7,background:"rgba(0,0,0,0.6)",color:"#fff",padding:"0 3px",borderRadius:2}}>VID</span>}
      </div>
    ))}
  </div>);
}

function CheckItem({item,data,onChange,depth=0,T,itemPhotos,onAddPhoto,onRemovePhoto,onEditItem,customNames}){
  const v=data[item.id]||{};const u=(f,val)=>onChange(item.id,{...v,[f]:val});
  const editBtn=(title,cb)=>(<button onClick={e=>{e.stopPropagation();cb()}} title={title} style={{width:20,height:20,border:"none",background:"transparent",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",padding:0,flexShrink:0,opacity:0.4}}>
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  </button>);
  return(<div style={{marginLeft:depth*14,marginBottom:3}}>
    <div style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 14px",
      background:v.ok?T.okBg:v.ok===false?T.nokBg:(depth===0?T.surfaceAlt:T.surface),
      borderLeft:`4px solid ${v.ok?T.ok:v.ok===false?T.nok:(IC[item.interval]||T.border)}`,borderRadius:6}}>
      <input type="checkbox" checked={v.ok||false} onChange={e=>u("ok",e.target.checked)}
        style={{marginTop:2,accentColor:T.accent,width:22,height:22,flexShrink:0,cursor:"pointer"}}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
          <span style={{fontWeight:700,color:T.accent,fontSize:13}}>{item.id}</span>
          <span style={{color:T.text,fontSize:14,fontWeight:500}}>{item.name}</span>
          {onEditItem&&editBtn("Editare nume",()=>{const n=prompt("Denumire:",item.name);if(n!==null)onEditItem(item.id,"name",n)})}
          {item.interval&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:(IC[item.interval]||"#666")+"22",color:IC[item.interval]||"#666",fontWeight:700,cursor:onEditItem?"pointer":"default"}}
            onClick={onEditItem?()=>{const n=prompt("Interval (sem, anual, 2ani, 3ani, 5ani, 10ani, prim, necesitate):",item.interval);if(n!==null)onEditItem(item.id,"interval",n)}:undefined}>{IL[item.interval]||item.interval}</span>}
        </div>
        {item.note&&<div style={{fontSize:12,color:T.textMuted,marginTop:2,fontStyle:"italic",display:"flex",alignItems:"flex-start",gap:2}}>
          <span style={{flex:1}}>{item.note}</span>
          {onEditItem&&editBtn("Editare notă",()=>{const n=prompt("Notă/instrucțiuni:",item.note);if(n!==null)onEditItem(item.id,"note",n)})}
        </div>}
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:5,alignItems:"center"}}>
          {item.hasResult&&<select value={v.result||""} onChange={e=>u("result",e.target.value)} style={{fontSize:13,padding:"6px 10px",border:`1px solid ${T.border}`,borderRadius:5,background:T.surface,color:T.text,minHeight:36}}><option value="">—Rezultat—</option><option value="ok">✓ OK</option><option value="nok">✗ Probleme</option></select>}
          {item.hasValueField&&<div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:12,color:T.textSec}}>{item.valueLabel}:</span><input type="text" value={v.value||""} onChange={e=>u("value",e.target.value)} style={{width:80,fontSize:13,padding:"6px 8px",border:`1px solid ${T.border}`,borderRadius:5,background:T.surface,color:T.text,minHeight:36}}/></div>}
          {item.hasTextField&&<input type="text" value={v.text||""} onChange={e=>u("text",e.target.value)} placeholder="..." style={{width:120,fontSize:13,padding:"6px 8px",border:`1px solid ${T.border}`,borderRadius:5,background:T.surface,color:T.text,minHeight:36}}/>}
          {item.hasDateField&&<input type="date" value={v.date||""} onChange={e=>u("date",e.target.value)} style={{fontSize:13,padding:"6px 8px",border:`1px solid ${T.border}`,borderRadius:5,background:T.surface,color:T.text,minHeight:36}}/>}
          {item.hasRCD&&<div style={{display:"flex",gap:4}}>{["mA","V","ms"].map(x=><input key={x} placeholder={x} value={v[`rcd_${x.toLowerCase()}`]||""} onChange={e=>u(`rcd_${x.toLowerCase()}`,e.target.value)} style={{width:54,fontSize:13,padding:"6px",border:`1px solid ${T.border}`,borderRadius:5,background:T.surface,color:T.text,minHeight:36}}/>)}</div>}
        </div>
        <div style={{display:"flex",gap:6,marginTop:5,alignItems:"flex-start"}}>
          <textarea value={v.obs||""} onChange={e=>u("obs",e.target.value)} placeholder="Observații..." rows={1}
            style={{flex:1,fontSize:13,padding:"6px 8px",border:`1px solid ${T.border}`,borderRadius:5,resize:"vertical",fontFamily:"inherit",background:T.surface,color:T.text,minHeight:36}}/>
          <VoiceMic T={T} onResult={txt=>u("obs",(v.obs||"")+(v.obs?" ":"")+txt)}/>
        </div>
        <ItemMedia itemId={item.id} photos={itemPhotos} onAdd={onAddPhoto} onRemove={onRemovePhoto} T={T}/>
      </div>
    </div>
    {item.subs?.map(s=>{
      const so={...s,name:customNames?.[`item_${s.id}`]||s.name,interval:customNames?.[`interval_${s.id}`]||s.interval,note:customNames?.[`note_${s.id}`]||s.note};
      return <CheckItem key={s.id} item={so} data={data} onChange={onChange} depth={depth+1} T={T} itemPhotos={itemPhotos} onAddPhoto={onAddPhoto} onRemovePhoto={onRemovePhoto} onEditItem={onEditItem} customNames={customNames}/>;
    })}
  </div>);
}

function BladeBoltsView({T,bd,setBd}){
  const[bl,setBl]=useState(1);
  const bolts=Array.from({length:80},(_,i)=>i+1);
  const tog=b=>{const k=`${bl}-${b}`;setBd(p=>({...p,[k]:p[k]==="ok"?"nok":p[k]==="nok"?undefined:"ok"}))};
  const stats=blade=>{const ok=Object.entries(bd).filter(([k,v])=>k.startsWith(blade+"-")&&v==="ok").length;const nk=Object.entries(bd).filter(([k,v])=>k.startsWith(blade+"-")&&v==="nok").length;return{ok,nk,empty:80-ok-nk}};
  return(<div>
    <h2 style={{fontSize:18,color:T.text,margin:"0 0 8px 0"}}>Buloane pale — procedură strângere</h2>
    <div style={{fontSize:13,color:T.textMuted,marginBottom:12}}>Click: <span style={{color:T.ok,fontWeight:700}}>OK</span> → <span style={{color:T.nok,fontWeight:700}}>Problemă</span> → Gol. Bulon nr.1 = lângă motor reglare pas pală.</div>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      {[1,2,3].map(b=>{const st=stats(b);return(
        <button key={b} onClick={()=>setBl(b)} style={{padding:"10px 20px",border:bl===b?`2px solid ${T.accent}`:`1px solid ${T.border}`,borderRadius:8,background:bl===b?T.accentLight:T.surface,fontWeight:700,cursor:"pointer",fontSize:15,color:T.text,minHeight:44,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <span>Pala {b}</span>
          <span style={{fontSize:10,fontWeight:400,color:T.textSec}}>{st.ok}✓ {st.nk}✗ {st.empty}—</span>
        </button>)})}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:4}}>
      {bolts.map(b=>{const v=bd[`${bl}-${b}`];return(
        <button key={b} onClick={()=>tog(b)} style={{width:"100%",aspectRatio:"1",border:`1px solid ${v==="ok"?T.ok:v==="nok"?T.nok:T.border}`,borderRadius:6,background:v==="ok"?T.ok:v==="nok"?T.nok:T.surfaceAlt,color:v?"#fff":T.textMuted,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",minHeight:36}}>{b}</button>)})}
    </div>
    <div style={{display:"flex",gap:16,marginTop:14,fontSize:13}}>
      <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:18,height:18,background:T.ok,borderRadius:4}}/><span style={{color:T.text}}>În regulă</span></div>
      <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:18,height:18,background:T.nok,borderRadius:4}}/><span style={{color:T.text}}>Problemă</span></div>
      <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:18,height:18,background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:4}}/><span style={{color:T.text}}>Neverificat</span></div>
    </div>
  </div>);
}

function PhotosView({T,photos,setPhotos}){
  const cameraRef=useRef(null);
  const videoRef=useRef(null);
  const galleryRef=useRef(null);
  const[dragOver,setDragOver]=useState(false);

  const addMedia=(files)=>{
    Array.from(files).forEach(file=>{
      const isVideo=file.type.startsWith("video/");
      const isImage=file.type.startsWith("image/");
      if(!isImage&&!isVideo)return;
      if(isVideo&&file.size>100*1024*1024){alert("Video prea mare (max 100MB): "+file.name);return}

      const reader=new FileReader();
      reader.onload=(e)=>{
        if(isImage){
          // Compress large images
          const img=new Image();
          img.onload=()=>{
            const canvas=document.createElement("canvas");
            const MAX=1600;
            let w=img.width,h=img.height;
            if(w>MAX||h>MAX){const r=Math.min(MAX/w,MAX/h);w*=r;h*=r}
            canvas.width=w;canvas.height=h;
            canvas.getContext("2d").drawImage(img,0,0,w,h);
            setPhotos(p=>[...p,{
              id:Date.now()+Math.random(),name:file.name,
              data:canvas.toDataURL("image/jpeg",0.85),
              type:"image",size:Math.round(file.size/1024),
              caption:"",section:"",timestamp:new Date().toLocaleString("ro-RO")
            }]);
          };
          img.src=e.target.result;
        }else{
          setPhotos(p=>[...p,{
            id:Date.now()+Math.random(),name:file.name,data:e.target.result,
            type:"video",mimeType:file.type,size:Math.round(file.size/1024),
            caption:"",section:"",timestamp:new Date().toLocaleString("ro-RO")
          }]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop=(e)=>{e.preventDefault();setDragOver(false);if(e.dataTransfer.files)addMedia(e.dataTransfer.files)};
  const handleDragOver=(e)=>{e.preventDefault();setDragOver(true)};
  const handleDragLeave=()=>setDragOver(false);
  const delPhoto=(id)=>setPhotos(p=>p.filter(x=>x.id!==id));
  const updPhoto=(id,k,v)=>setPhotos(p=>p.map(x=>x.id===id?{...x,[k]:v}:x));
  const openMedia=(ph)=>{
    const w=window.open();
    if(ph.type==="video") w.document.write(`<video src="${ph.data}" controls autoplay style="max-width:100%;max-height:100vh;margin:auto;display:block"/>`);
    else w.document.write(`<img src="${ph.data}" style="max-width:100%;max-height:100vh;margin:auto;display:block"/>`);
    w.document.title=ph.name;
  };

  const sectionOptions=SECTIONS.filter(s=>s.id!=="report"&&s.id!=="issues"&&s.id!=="progress"&&s.id!=="photos"&&s.id!=="procedures"&&s.id!=="signatures"&&s.id!=="blade_bolts"&&s.id!=="blade_inspection");
  const imgCount=photos.filter(p=>p.type!=="video").length;
  const vidCount=photos.filter(p=>p.type==="video").length;

  return(<div>
    <h2 style={{fontSize:18,color:T.text,margin:"0 0 6px 0"}}>Fotografii și videoclipuri</h2>
    <div style={{fontSize:13,color:T.textSec,marginBottom:14}}>
      Documentați starea componentelor cu poze și video. Fotografiile se includ în PDF.
      {photos.length>0&&<span style={{fontWeight:600}}> Total: {imgCount} foto{vidCount>0?`, ${vidCount} video`:""}</span>}
    </div>

    {/* Upload buttons */}
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <button onClick={()=>cameraRef.current?.click()} style={{flex:1,minWidth:120,padding:"14px 12px",border:`2px dashed ${T.border}`,borderRadius:10,background:T.surfaceAlt,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
        <Camera size={28} color={T.accent}/><span style={{fontSize:13,fontWeight:600,color:T.text}}>Cameră foto</span>
      </button>
      <button onClick={()=>videoRef.current?.click()} style={{flex:1,minWidth:120,padding:"14px 12px",border:`2px dashed ${T.border}`,borderRadius:10,background:T.surfaceAlt,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
        <span style={{fontSize:13,fontWeight:600,color:T.text}}>Cameră video</span>
      </button>
      <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
        onClick={()=>galleryRef.current?.click()}
        style={{flex:1,minWidth:120,padding:"14px 12px",border:`2px dashed ${dragOver?T.accent:T.border}`,borderRadius:10,background:dragOver?T.accentLight:T.surfaceAlt,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6,transition:"all 0.15s"}}>
        <Eye size={28} color={T.textMuted}/><span style={{fontSize:13,fontWeight:600,color:T.text}}>Din galerie</span>
        <span style={{fontSize:10,color:T.textMuted}}>sau drag & drop</span>
      </div>
    </div>
    {/* Hidden inputs */}
    <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={e=>{if(e.target.files)addMedia(e.target.files);e.target.value=""}} style={{display:"none"}}/>
    <input ref={videoRef} type="file" accept="video/*" capture="environment" onChange={e=>{if(e.target.files)addMedia(e.target.files);e.target.value=""}} style={{display:"none"}}/>
    <input ref={galleryRef} type="file" accept="image/*,video/*" multiple onChange={e=>{if(e.target.files)addMedia(e.target.files);e.target.value=""}} style={{display:"none"}}/>

    {photos.length===0&&<div style={{padding:20,textAlign:"center",color:T.textMuted,fontSize:14}}>Nu sunt fișiere media adăugate încă.</div>}

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280,1fr))",gap:12}}>
      {photos.map(ph=>(<div key={ph.id} style={{background:T.surfaceAlt,borderRadius:8,overflow:"hidden",border:`1px solid ${ph.type==="video"?T.accent:T.border}`}}>
        <div style={{position:"relative",cursor:"pointer"}} onClick={()=>openMedia(ph)}>
          {ph.type==="video"?(
            <div style={{width:"100%",height:180,background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill={T.accent+"44"} stroke={T.accent} strokeWidth="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span style={{fontSize:12,color:T.textSec,fontWeight:600}}>{ph.name}</span>
              <span style={{fontSize:11,color:T.textMuted}}>{ph.size>1024?(ph.size/1024).toFixed(1)+" MB":ph.size+" KB"}</span>
            </div>
          ):(
            <img src={ph.data} alt={ph.name} style={{width:"100%",height:180,objectFit:"cover",display:"block"}}/>
          )}
          <button onClick={e=>{e.stopPropagation();delPhoto(ph.id)}} style={{position:"absolute",top:6,right:6,width:30,height:30,borderRadius:"50%",background:"rgba(0,0,0,0.6)",color:"#fff",border:"none",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          {ph.type==="video"&&<span style={{position:"absolute",top:6,left:6,padding:"2px 8px",borderRadius:4,background:T.accent,color:"#fff",fontSize:10,fontWeight:700}}>VIDEO</span>}
        </div>
        <div style={{padding:10}}>
          <div style={{fontSize:11,color:T.textMuted,marginBottom:6}}>{ph.name} • {ph.timestamp} • {ph.size>1024?(ph.size/1024).toFixed(1)+" MB":ph.size+" KB"}</div>
          <select value={ph.section||""} onChange={e=>updPhoto(ph.id,"section",e.target.value)}
            style={{width:"100%",fontSize:13,padding:"6px 8px",border:`1px solid ${T.border}`,borderRadius:5,background:T.surface,color:T.text,minHeight:36,marginBottom:6}}>
            <option value="">— Asociază la secțiune —</option>
            {sectionOptions.map(s=>(<option key={s.id} value={s.id}>{ICON_PDF[s.id]||""} {s.title}</option>))}
          </select>
          <input value={ph.caption||""} onChange={e=>updPhoto(ph.id,"caption",e.target.value)} placeholder="Descriere / legendă..."
            style={{width:"100%",fontSize:13,padding:"6px 8px",border:`1px solid ${T.border}`,borderRadius:5,background:T.surface,color:T.text,minHeight:36}}/>
        </div>
      </div>))}
    </div>
  </div>);
}

function gp(s,cd){if(!s.items.length)return null;const a=s.items.flatMap(i=>[i,...(i.subs||[])]);return{c:a.filter(i=>cd[i.id]?.ok).length,t:a.length}}

/* ─── PROCEDURES ─── */
function ProceduresView({T,procedures,setProcedures,uploadToCloud}){
  const fileRef=useRef(null);
  const[uploading,setUploading]=useState(false);
  const sectionOptions=SECTIONS.filter(s=>s.items.length>0);

  const addFile=async(files)=>{
    for(const file of Array.from(files)){
      if(file.type!=="application/pdf"){alert("Doar fișiere PDF sunt acceptate.");continue}
      setUploading(true);
      try{
        if(uploadToCloud){
          // Online: upload to Supabase Storage
          const record=await uploadToCloud(file,"",[]);
          if(record) setProcedures(p=>[...p,{...record,data:null}]);
        }else{
          // Offline: store as base64
          const data=await new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>res(e.target.result);r.onerror=rej;r.readAsDataURL(file)});
          setProcedures(p=>[...p,{
            id:Date.now()+Math.random(),name:file.name,
            data,size:Math.round(file.size/1024),file_size:Math.round(file.size/1024),
            sections:[],description:"",timestamp:new Date().toLocaleString("ro-RO")
          }]);
        }
      }catch(e){alert("Eroare la încărcare: "+e.message)}
      setUploading(false);
    }
  };

  const upd=(id,k,v)=>setProcedures(p=>p.map(x=>x.id===id?{...x,[k]:v}:x));
  const del=(id)=>setProcedures(p=>p.filter(x=>x.id!==id));

  const openPdf=(proc)=>{
    if(proc.data){
      // Offline: base64 data
      const w=window.open();w.document.write(`<iframe src="${proc.data}" style="width:100%;height:100%;border:none;position:fixed;top:0;left:0" />`);w.document.title=proc.name;
    }else if(proc.file_path){
      // Online: get signed URL from Supabase Storage (private bucket)
      import('./lib/supabase').then(async({supabase})=>{
        if(!supabase)return;
        const{data,error}=await supabase.storage.from('procedures').createSignedUrl(proc.file_path,3600);
        if(data?.signedUrl) window.open(data.signedUrl,'_blank');
        else if(error) alert("Eroare la deschidere PDF: "+error.message);
      });
    }
  };
  const toggleSection=(procId,secId)=>{
    setProcedures(p=>p.map(x=>{
      if(x.id!==procId)return x;
      const has=(x.sections||[]).includes(secId);
      return{...x,sections:has?x.sections.filter(s=>s!==secId):[...(x.sections||[]),secId]};
    }));
  };

  return(<div>
    <h2 style={{fontSize:18,color:T.text,margin:"0 0 6px 0"}}>Proceduri de mentenanță</h2>
    <div style={{fontSize:13,color:T.textSec,marginBottom:14}}>Încărcați fișiere PDF cu proceduri. Asociați-le secțiunilor relevante — vor apărea ca buton rapid pe fiecare secțiune.</div>

    <div onClick={()=>!uploading&&fileRef.current?.click()} style={{
      border:`2px dashed ${uploading?T.accent:T.border}`,borderRadius:10,padding:"24px 20px",textAlign:"center",
      cursor:uploading?"wait":"pointer",background:T.surfaceAlt,marginBottom:16,transition:"border-color 0.15s",
      opacity:uploading?0.7:1
    }}>
      <div style={{marginBottom:6,display:"flex",justifyContent:"center"}}><FileText size={36} color={uploading?T.accent:T.textMuted}/></div>
      <div style={{fontSize:14,fontWeight:600,color:T.text}}>{uploading?"Se încarcă...":"Click pentru a încărca proceduri PDF"}</div>
      <div style={{fontSize:12,color:T.textMuted,marginTop:4}}>Fișiere .pdf — proceduri Senvion, instrucțiuni de lucru, TO-uri</div>
      <input ref={fileRef} type="file" accept="application/pdf" multiple onChange={e=>{if(e.target.files)addFile(e.target.files);e.target.value=""}} style={{display:"none"}}/>
    </div>

    {procedures.length===0&&<div style={{padding:24,textAlign:"center",color:T.textMuted,fontSize:14,background:T.surfaceAlt,borderRadius:8}}>
      Nu sunt proceduri încărcate. Adăugați PDF-uri cu proceduri de mentenanță.
    </div>}

    {procedures.map(proc=>(<div key={proc.id} style={{background:T.surfaceAlt,borderRadius:8,border:`1px solid ${T.border}`,marginBottom:10,overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px"}}>
        <div style={{width:40,height:40,borderRadius:8,background:T.accent+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <FileText size={20} color={T.accent}/>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:600,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{proc.name}</div>
          <div style={{fontSize:11,color:T.textMuted}}>{proc.file_size||proc.size} KB • {proc.timestamp||new Date(proc.created_at).toLocaleString("ro-RO")}{proc.file_path?" • ☁️ Cloud":""}</div>
        </div>
        <button onClick={()=>openPdf(proc)} title="Deschide PDF" style={{
          width:38,height:38,borderRadius:8,border:`1px solid ${T.accent}44`,background:T.accent+"12",
          cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0
        }}>
          <Eye size={16} color={T.accent}/>
        </button>
        <button onClick={()=>del(proc.id)} title="Șterge" style={{
          width:38,height:38,borderRadius:8,border:`1px solid ${T.nok}44`,background:T.nokBg,
          cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.nok} strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>

      <div style={{padding:"0 14px 10px"}}>
        <input value={proc.description||""} onChange={e=>upd(proc.id,"description",e.target.value)}
          placeholder="Descriere procedură (opțional)..."
          style={{width:"100%",fontSize:13,padding:"6px 8px",border:`1px solid ${T.border}`,borderRadius:5,background:T.surface,color:T.text,minHeight:36,marginBottom:8}}/>
        <div style={{fontSize:12,fontWeight:600,color:T.textSec,marginBottom:6}}>Asociere secțiuni:</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          {sectionOptions.map(s=>(<button key={s.id} onClick={()=>toggleSection(proc.id,s.id)} style={{
            padding:"4px 10px",borderRadius:5,fontSize:11,fontWeight:600,cursor:"pointer",
            border:(proc.sections||[]).includes(s.id)?`2px solid ${T.accent}`:`1px solid ${T.border}`,
            background:(proc.sections||[]).includes(s.id)?T.accentLight:T.surface,
            color:(proc.sections||[]).includes(s.id)?T.accent:T.textMuted
          }}>
            <SectionIcon id={s.id} size={11} color={(proc.sections||[]).includes(s.id)?T.accent:T.textMuted}/> {s.title}
          </button>))}
        </div>
      </div>
    </div>))}
  </div>);
}

function ProcedureBadge({sectionId,procedures,T}){
  const procs=(procedures||[]).filter(p=>(p.sections||[]).includes(sectionId));
  const[open,setOpen]=useState(false);
  if(!procs.length)return null;
  const openPdf=(proc)=>{
    if(proc.data){
      const w=window.open();w.document.write(`<iframe src="${proc.data}" style="width:100%;height:100%;border:none;position:fixed;top:0;left:0" />`);w.document.title=proc.name;
    }else if(proc.file_path){
      import('./lib/supabase').then(async({supabase})=>{
        if(!supabase)return;
        const{data}=await supabase.storage.from('procedures').createSignedUrl(proc.file_path,3600);
        if(data?.signedUrl) window.open(data.signedUrl,'_blank');
      });
    }
  };

  return(<div style={{position:"relative"}}>
    <button onClick={()=>setOpen(p=>!p)} title={`${procs.length} procedur${procs.length>1?"i":"ă"} disponibil${procs.length>1?"e":"ă"}`} style={{
      display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,
      border:`1px solid ${T.accent}44`,background:T.accentLight,cursor:"pointer",fontSize:12,fontWeight:600,color:T.accent,minHeight:32
    }}>
      <BookOpen size={14} color={T.accent}/> {procs.length} PDF
    </button>
    {open&&<><div onClick={()=>setOpen(false)} style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:99}}/><div style={{position:"absolute",top:"100%",right:0,marginTop:4,zIndex:100,
      background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,
      boxShadow:"0 8px 24px rgba(0,0,0,0.15)",padding:6,minWidth:240,maxWidth:320
    }}>
      {procs.map(p=>(<button key={p.id} onClick={()=>{openPdf(p);setOpen(false)}} style={{
        width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 10px",
        border:"none",borderRadius:6,background:"transparent",cursor:"pointer",textAlign:"left",
        fontSize:13,color:T.text
      }}
        onMouseEnter={e=>e.currentTarget.style.background=T.surfaceAlt}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}
      >
        <FileText size={16} color={T.accent} style={{flexShrink:0}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
          {p.description&&<div style={{fontSize:11,color:T.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.description}</div>}
        </div>
      </button>))}
    </div></>}
  </div>);
}

function genPDF(rp,cd,iss,bd,id,sg,photos,itemPhotos,dailyLog,sections){
  const SECS=sections||SECTIONS;
  const now=new Date().toLocaleDateString("ro-RO");const e=s=>(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;");
  let h=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>MM92 ${e(rp.serie)}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;font-size:11px;color:#1a1a1a;padding:18px}
h1{font-size:17px;color:#0c1929;border-bottom:3px solid #2563eb;padding-bottom:5px;margin-bottom:10px}
h2{font-size:13px;color:#2563eb;margin:14px 0 6px;border-bottom:1px solid #e2e8f0;padding-bottom:3px}
.hd{display:flex;justify-content:space-between;margin-bottom:14px}.logo{font-size:15px;font-weight:800;color:#2563eb}
.ig{display:grid;grid-template-columns:1fr 1fr;gap:3px 14px;margin-bottom:10px}.ig div{display:flex;gap:4px}
.ig .l{font-weight:700;color:#475569;min-width:110px}
table{width:100%;border-collapse:collapse;margin-bottom:10px}th{background:#f1f5f9;font-weight:700;text-align:left;padding:4px 6px;border:1px solid #cbd5e1;font-size:10px}
td{padding:3px 6px;border:1px solid #e2e8f0;font-size:10px;vertical-align:top}tr:nth-child(even){background:#f8fafc}
.ok{color:#16a34a;font-weight:700}.nk{color:#dc2626;font-weight:700}.em{color:#94a3b8}
.sb{border:1px solid #cbd5e1;height:70px;width:240px;margin:3px 0}.si{max-height:66px;max-width:236px}
.pb{page-break-before:always}@media print{body{padding:8px}}</style></head><body>`;
  h+=`<div class="hd"><div><div class="logo">BLUE LINE ENERGY</div><div style="font-size:11px;color:#64748b">Protocol mentenanță Senvion MM92</div></div><div style="text-align:right;font-size:9px;color:#64748b">T-2.1-GP.WA.02-A<br>${now}</div></div>`;
  h+=`<h1>Raport de Service</h1><div class="ig">`;
  [["Parc",rp.parc],["Nr.serie",rp.serie],["Data PIF",rp.dataPIF],["Locație",rp.locatie],["Ore total",rp.oreTotal],["Ore an",rp.oreCurent],["Prod.total",rp.prodTotal],["Prod.an",rp.prodCurent],["Interval",rp.interval],["Data",rp.dataService],["Tehn.1",rp.tech1],["Tehn.2",rp.tech2],["Tehn.3",rp.tech3],["Verificator",rp.verificator]].forEach(([l,v])=>{h+=`<div><span class="l">${l}:</span><span>${e(v)||"—"}</span></div>`});
  h+=`</div>`;
  SECS.filter(s=>s.items.length>0).forEach(sec=>{
    h+=`<h2>${ICON_PDF[sec.id]||""} ${e(sec.title)}</h2><table><tr><th style="width:45px">Cod</th><th>Operațiune</th><th style="width:55px">Interval</th><th style="width:40px">OK</th><th>Valori</th><th>Observații</th></tr>`;
    const rr=(it,d)=>{const dd=cd[it.id]||{};const st=dd.ok?`<span class="ok">✓</span>`:dd.ok===false?`<span class="nk">✗</span>`:`<span class="em">—</span>`;
    const hasPhotos=itemPhotos&&itemPhotos.some(p=>p.itemId===it.id);
    let vv=[];if(dd.value)vv.push(dd.value);if(dd.text)vv.push(dd.text);if(dd.date)vv.push(dd.date);if(dd.rcd_ma)vv.push(dd.rcd_ma+"mA");if(dd.rcd_v)vv.push(dd.rcd_v+"V");if(dd.rcd_ms)vv.push(dd.rcd_ms+"ms");
    h+=`<tr><td>${d?"  ":""}${e(it.id)}</td><td>${d?"↳ ":""}${e(it.name)}${it.note?`<br><i style="color:#888;font-size:9px">${e(it.note)}</i>`:""}</td><td style="font-size:9px">${IL[it.interval]||""}</td><td>${st}</td><td style="font-size:9px">${vv.join(", ")||""}</td><td style="font-size:9px">${e(dd.obs)||""}${hasPhotos?" 📷":""}</td></tr>`;
    it.subs?.forEach(s=>rr(s,1))};sec.items.forEach(i=>rr(i,0));h+=`</table>`});
  if(iss.length){h+=`<h2 class="pb">⚠️ Puncte nerezolvate</h2><table><tr><th>#</th><th>Descriere</th><th>Foto</th><th>Rez.</th><th>Obs.</th></tr>`;iss.forEach((x,i)=>{h+=`<tr><td>${i+1}</td><td>${e(x.desc)}</td><td>${x.photo?"Da":""}</td><td>${x.resolved?"Da":""}</td><td>${e(x.obs)}</td></tr>`});h+=`</table>`}
  const be=Object.entries(bd).filter(([,v])=>v);
  if(be.length){h+=`<h2>📝 Buloane pale</h2>`;[1,2,3].forEach(b=>{const ok=Object.entries(bd).filter(([k,v])=>k.startsWith(b+"-")&&v==="ok").length;const nk=Object.entries(bd).filter(([k,v])=>k.startsWith(b+"-")&&v==="nok").length;h+=`<p><b>Pala ${b}:</b> <span class="ok">${ok} OK</span> / <span class="nk">${nk} NOK</span> / ${80-ok-nk} necks</p>`;if(nk){const ns=Object.entries(bd).filter(([k,v])=>k.startsWith(b+"-")&&v==="nok").map(([k])=>k.split("-")[1]);h+=`<p style="color:red;font-size:10px">Bul.: ${ns.join(", ")}</p>`}})}
  if(id.defects?.length){h+=`<h2>🔎 Inspecție pale</h2><table><tr><th>#</th><th>Desc.</th><th>Dim.</th><th>Loc.</th><th>Z</th><th>Foto</th></tr>`;id.defects.forEach((d,i)=>{h+=`<tr><td>${i+1}</td><td>${e(d.desc)}</td><td>${e(d.dim)}</td><td>${e(d.loc)}</td><td>${e(d.z)}</td><td>${e(d.files)}</td></tr>`});h+=`</table>`}
  if(photos&&photos.length){h+=`<h2 class="pb">📸 Fotografii documentare (${photos.length})</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">`;
    photos.forEach((ph,i)=>{const secName=SECS.find(s=>s.id===ph.section);h+=`<div style="border:1px solid #cbd5e1;border-radius:6px;overflow:hidden"><img src="${ph.data}" style="width:100%;height:160px;object-fit:cover;display:block"/><div style="padding:6px;font-size:10px"><b>${e(ph.caption)||"Fără descriere"}</b><br/>${secName?(ICON_PDF[secName.id]||"")+" "+e(secName.title):""}<br/><span style="color:#888">${e(ph.name)} • ${e(ph.timestamp)}</span></div></div>`});
    h+=`</div>`}
  if(itemPhotos&&itemPhotos.length){h+=`<h2 class="pb">📷 Fotografii per punct verificare (${itemPhotos.length})</h2><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">`;
    itemPhotos.forEach(ph=>{h+=`<div style="border:1px solid #cbd5e1;border-radius:4px;overflow:hidden"><img src="${ph.data}" style="width:100%;height:100px;object-fit:cover;display:block"/><div style="padding:4px;font-size:9px"><b>${e(ph.itemId)}</b> • ${e(ph.name)}<br/>${e(ph.timestamp)}</div></div>`});
    h+=`</div>`}
  if(dailyLog&&dailyLog.length){
    h+=`<h2 class="pb">📅 Intervenții zilnice (${dailyLog.length})</h2>`;
    h+=`<table><tr><th>Data</th><th>Ora</th><th>Tip</th><th>Status</th><th>Turbina</th><th>Descriere</th><th>Acțiuni</th><th>Ore</th><th>Tehnician</th><th>Piese</th></tr>`;
    const TI={"corrective":"Corectivă","preventive":"Preventivă","inspection":"Inspecție","repair":"Reparație","replacement":"Înlocuire","lubrication":"Lubrifiere","electrical":"Electrică","scada":"SCADA","other":"Altele"};
    const SI={"completed":"✓ Finalizat","in_progress":"⏳ În lucru","pending_parts":"🔧 Așt. piese","postponed":"⏸ Amânat","escalated":"⬆ Escaladat"};
    dailyLog.forEach(dl=>{h+=`<tr><td>${e(dl.date)}</td><td>${e(dl.time)}</td><td>${TI[dl.type]||dl.type}</td><td>${SI[dl.status]||dl.status}</td><td>${e(dl.turbine)}</td><td style="max-width:150px">${e(dl.description)}</td><td style="max-width:150px">${e(dl.actions)}</td><td>${e(dl.duration)}</td><td>${e(dl.technician)}</td><td>${e(dl.parts)}</td></tr>`});
    h+=`</table>`;
    const totalH=dailyLog.reduce((s,x)=>s+(parseFloat(x.duration)||0),0);
    h+=`<p style="font-size:11px;margin-top:4px"><b>Total ore: ${totalH.toFixed(1)}</b></p>`;
  }
  h+=`<h2 class="pb">✍️ Semnături</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">`;
  ["Tehnician 1","Tehnician 2","Tehnician 3","Verificator"].forEach(l=>{const k=l.toLowerCase().replace(/ /g,"_");h+=`<div><b>${l}</b>`;h+=sg[k]?`<div class="sb"><img class="si" src="${sg[k]}"/></div>`:`<div class="sb" style="display:flex;align-items:center;justify-content:center;color:#aaa">—</div>`;h+=`</div>`});
  h+=`</div><div style="margin-top:20px;text-align:center;color:#aaa;font-size:8px;border-top:1px solid #ddd;padding-top:6px">Blue Line Energy — Senvion MM92 — ${now}</div></body></html>`;
  const w=window.open("","_blank");w.document.write(h);w.document.close();setTimeout(()=>w.print(),500);
}

/* ─── PERSISTENCE ─── */
const STORAGE_KEY = "mm92_service_data";

function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    return data[key] !== undefined ? data[key] : fallback;
  } catch { return fallback; }
}

function saveAllToStorage(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) { console.warn("Save failed:", e); }
}

export default function App({ session, user, profile, signOut, onChangeTurbine, isOnlineMode } = {}){
  const online = !!isOnlineMode && !!session;

  // Always call hooks (React rules). Use session data when online, local data when offline.
  const[_themeId,_setThemeId]=useState(()=>loadState("themeId","industrial"));
  const[as,setAs]=useState("report");
  const[_cd,_setCd]=useState(()=>loadState("cd",{}));
  const[_rp,_setRp]=useState(()=>loadState("rp",{parc:"",serie:""}));
  const[_iss,_setIss]=useState(()=>loadState("iss",[]));
  const[_bd,_setBd]=useState(()=>loadState("bd",{}));
  const[_id,_setId]=useState(()=>loadState("id",{defects:[]}));
  const[_sg,_setSg]=useState(()=>loadState("sg",{}));
  const[_photos,_setPhotos]=useState(()=>loadState("photos",[]));
  const[_itemPhotos,_setItemPhotos]=useState(()=>loadState("itemPhotos",[]));
  const[_procedures,_setProcedures]=useState(()=>loadState("procedures",[]));
  const[_dailyLog,_setDailyLog]=useState(()=>loadState("dailyLog",[]));

  // PW56 state (separate localStorage key)
  const PW_KEY="mm92_pw56_data";
  const loadPW=(k,fb)=>{try{const r=localStorage.getItem(PW_KEY);if(!r)return fb;const d=JSON.parse(r);return d[k]!==undefined?d[k]:fb}catch{return fb}};
  const[pwCd,setPwCd]=useState(()=>loadPW("cd",{}));
  const[pwRp,setPwRp]=useState(()=>loadPW("rp",{parc:"",serie:""}));
  const[pwIss,setPwIss]=useState(()=>loadPW("iss",[]));
  const[pwBd,setPwBd]=useState(()=>loadPW("bd",{}));
  const[pwSg,setPwSg]=useState(()=>loadPW("sg",{}));
  const[pwPhotos,setPwPhotos]=useState(()=>loadPW("photos",[]));
  const[pwItemPhotos,setPwItemPhotos]=useState(()=>loadPW("itemPhotos",[]));
  const[pwProcedures,setPwProcedures]=useState(()=>loadPW("procedures",[]));

  const[so,setSo]=useState(true);
  const[lastSaved,setLastSaved]=useState(null);
  const[cloudSync,setCloudSync]=useState(""); // sync status display
  const loadFileRef=useRef(null);

  // ─── CLOUD LOAD ON MOUNT ───
  useEffect(()=>{
    if(!online) return;
    loadAllFromCloud().then(cloud=>{
      if(!cloud) return;
      // MM92
      if(cloud[KEYS.MM92]){
        const d=cloud[KEYS.MM92];
        if(d.cd) _setCd(d.cd); if(d.rp) _setRp(d.rp); if(d.iss) _setIss(d.iss);
        if(d.bd) _setBd(d.bd); if(d.sg) _setSg(d.sg);
        if(d.photos) _setPhotos(d.photos); if(d.itemPhotos) _setItemPhotos(d.itemPhotos);
        if(d.procedures) _setProcedures(d.procedures);
        if(d.themeId) _setThemeId(d.themeId);
      }
      // PW56
      if(cloud[KEYS.PW56]){
        const d=cloud[KEYS.PW56];
        if(d.cd) setPwCd(d.cd); if(d.rp) setPwRp(d.rp); if(d.iss) setPwIss(d.iss);
        if(d.bd) setPwBd(d.bd); if(d.sg) setPwSg(d.sg);
        if(d.photos) setPwPhotos(d.photos); if(d.itemPhotos) setPwItemPhotos(d.itemPhotos);
        if(d.procedures) setPwProcedures(d.procedures);
      }
      // Daily log
      if(cloud[KEYS.DAILY]) _setDailyLog(cloud[KEYS.DAILY]);
      // Histories
      if(cloud[KEYS.HIST_MM92]) setMm92History(cloud[KEYS.HIST_MM92]);
      if(cloud[KEYS.HIST_PW56]) setPw56History(cloud[KEYS.HIST_PW56]);
      // Custom names
      if(cloud[KEYS.CUSTOM_NAMES]) setCustomNames(cloud[KEYS.CUSTOM_NAMES]);
      setCloudSync("☁️ Date sincronizate");
    }).catch(()=>{});
    // Listen for sync status
    onSyncStatusChange(s=>{
      if(s==="saving") setCloudSync("☁️ Se sincronizează...");
      else if(s==="saved") setCloudSync("☁️ Salvat "+new Date().toLocaleTimeString("ro-RO"));
      else if(s==="error") setCloudSync("⚠️ Eroare sync");
    });
  },[]);
  const[mainTab,setMainTab]=useState("interventii");
  const isPW=mainTab==="pw56";
  const[customNames,setCustomNames]=useState(()=>{try{return JSON.parse(localStorage.getItem("mm92_custom_names")||"{}") }catch{return{}}});
  const[showHistory,setShowHistory]=useState(false);

  // Report history
  const HIST_MM92="mm92_report_history";
  const HIST_PW56="pw56_report_history";
  const[mm92History,setMm92History]=useState(()=>{try{return JSON.parse(localStorage.getItem(HIST_MM92)||"[]")}catch{return[]}});
  const[pw56History,setPw56History]=useState(()=>{try{return JSON.parse(localStorage.getItem(HIST_PW56)||"[]")}catch{return[]}});
  const reportHistory=isPW?pw56History:mm92History;
  const setReportHistory=isPW?setPw56History:setMm92History;
  const histKey=isPW?HIST_PW56:HIST_MM92;

  // Save history to localStorage
  useEffect(()=>{try{localStorage.setItem(HIST_MM92,JSON.stringify(mm92History))}catch{};syncHistoryMM92(mm92History)},[mm92History]);
  useEffect(()=>{try{localStorage.setItem(HIST_PW56,JSON.stringify(pw56History))}catch{};syncHistoryPW56(pw56History)},[pw56History]);

  // Save current report to history
  const saveReportToHistory=()=>{
    const label=prompt("Denumire raport (ex: Service 6 luni - WTG3):",
      `${pRp.interval||"Service"} — ${pRp.serie||"Turbină"} — ${new Date().toLocaleDateString("ro-RO")}`);
    if(!label)return;
    const snapshot={
      id:Date.now(),date:new Date().toISOString(),label,
      rp:{...pRp},cd:{...pCd},iss:[...pIss],bd:{...pBd},
      sg:{...pSg},photos:[...pPhotos],itemPhotos:[...pItemPhotos]
    };
    setReportHistory(p=>[snapshot,...p]);
    try{localStorage.setItem(histKey,JSON.stringify([snapshot,...reportHistory]))}catch{}
    setLastSaved("Raport salvat în istoric: "+new Date().toLocaleTimeString("ro-RO"));
  };

  // Load report from history
  const loadReport=(entry)=>{
    if(!confirm(`Încărcați raportul "${entry.label}"? Datele curente nesalvate se vor pierde.`))return;
    pSetRp(entry.rp||{});pSetCd(entry.cd||{});pSetIss(entry.iss||[]);
    pSetBd(entry.bd||{});pSetSg(entry.sg||{});
    pSetPhotos(entry.photos||[]);pSetItemPhotos(entry.itemPhotos||[]);
    setShowHistory(false);
    setAs(isPW?"pw_report":"report");
  };

  // New empty report
  const newReport=()=>{
    if(!confirm("Creați un raport nou? Salvați raportul curent în istoric înainte dacă e nevoie."))return;
    pSetRp({parc:"",serie:""});pSetCd({});pSetIss([]);
    pSetBd({});pSetSg({});pSetPhotos([]);pSetItemPhotos([]);
    setAs(isPW?"pw_report":"report");
  };

  // Delete from history
  const deleteFromHistory=(id)=>{
    if(!confirm("Ștergeți acest raport din istoric?"))return;
    setReportHistory(p=>p.filter(x=>x.id!==id));
  };

  // Save custom names
  const saveCustomName=(id,name)=>{
    const next={...customNames,[id]:name.trim()};
    if(!name.trim()) delete next[id];
    setCustomNames(next);
    try{localStorage.setItem("mm92_custom_names",JSON.stringify(next))}catch{}
    syncCustomNames(next);
  };
  const getName=(section)=>customNames[section.id]||section.title;
  const getItemName=(item)=>customNames[`item_${item.id}`]||item.name;
  const getItemInterval=(item)=>customNames[`interval_${item.id}`]||item.interval;
  const getItemNote=(item)=>customNames[`note_${item.id}`]||item.note;

  // Edit item properties (name, interval, note)
  const editItem=(itemId,field,value)=>{
    const key=field==="name"?`item_${itemId}`:field==="interval"?`interval_${itemId}`:`note_${itemId}`;
    saveCustomName(key,value);
  };

  // Pick source: online → session, offline → local state
  const themeId = online ? session.themeId : _themeId;
  const setThemeId = online ? session.setThemeId : _setThemeId;
  const cd = online ? session.cd : _cd;
  const setCd = online ? session.setCd : _setCd;
  const rp = online ? session.rp : _rp;
  const setRp = online ? session.setRp : _setRp;
  const iss = online ? session.iss : _iss;
  const setIss = online ? session.setIss : _setIss;
  const bd = online ? session.bd : _bd;
  const setBd = online ? session.setBd : _setBd;
  const id = online ? session.id : _id;
  const setId = online ? session.setId : _setId;
  const sg = online ? session.sg : _sg;
  const setSg = online ? session.setSg : _setSg;
  const photos = online ? session.photos : _photos;
  const setPhotos = online ? session.setPhotos : _setPhotos;
  const itemPhotos = online ? session.itemPhotos : _itemPhotos;
  const setItemPhotos = online ? session.setItemPhotos : _setItemPhotos;
  const procedures = online ? session.procedures : _procedures;
  const setProcedures = online ? session.setProcedures : _setProcedures;
  const dailyLog = _dailyLog;
  const setDailyLog = _setDailyLog;

  // Auto-save
  useEffect(()=>{
    if (online) {
      if (session.syncStatus === 'saved') setLastSaved("Sincronizat ☁️ " + new Date().toLocaleTimeString("ro-RO"));
      else if (session.syncStatus === 'saving') setLastSaved("Se sincronizează...");
      else if (session.syncStatus === 'error') setLastSaved("⚠️ Eroare sincronizare");
      return;
    }
    const state={themeId:_themeId,cd:_cd,rp:_rp,iss:_iss,bd:_bd,id:_id,sg:_sg,photos:_photos,itemPhotos:_itemPhotos,procedures:_procedures,dailyLog:_dailyLog};
    const timer=setTimeout(()=>{
      saveAllToStorage(state);
      setLastSaved(new Date().toLocaleTimeString("ro-RO"));
      // Cloud sync
      syncMM92(state);
      syncDailyLog(state.dailyLog);
    },500);
    return()=>clearTimeout(timer);
  },[_themeId,_cd,_rp,_iss,_bd,_id,_sg,_photos,_itemPhotos,_procedures,_dailyLog, online, session?.syncStatus]);

  // Auto-save PW56 data
  useEffect(()=>{
    const state={cd:pwCd,rp:pwRp,iss:pwIss,bd:pwBd,sg:pwSg,photos:pwPhotos,itemPhotos:pwItemPhotos,procedures:pwProcedures};
    const timer=setTimeout(()=>{
      try{localStorage.setItem(PW_KEY,JSON.stringify(state))}catch{}
      syncPW56(state);
    },500);
    return()=>clearTimeout(timer);
  },[pwCd,pwRp,pwIss,pwBd,pwSg,pwPhotos,pwItemPhotos,pwProcedures]);

  const T=THEMES[themeId]||THEMES.light;
  // Active protocol sections depend on mainTab
  const activeSections=isPW?SECTIONS_PW56:SECTIONS;
  const sec=activeSections.find(s=>s.id===as);
  // Protocol-specific state routing
  const pCd=isPW?pwCd:cd; const pSetCd=isPW?setPwCd:setCd;
  const pRp=isPW?pwRp:rp; const pSetRp=isPW?setPwRp:setRp;
  const pIss=isPW?pwIss:iss; const pSetIss=isPW?setPwIss:setIss;
  const pBd=isPW?pwBd:bd; const pSetBd=isPW?setPwBd:setBd;
  const pSg=isPW?pwSg:sg; const pSetSg=isPW?setPwSg:setSg;
  const pPhotos=isPW?pwPhotos:photos; const pSetPhotos=isPW?setPwPhotos:setPhotos;
  const pItemPhotos=isPW?pwItemPhotos:itemPhotos; const pSetItemPhotos=isPW?setPwItemPhotos:setItemPhotos;
  const pProcedures=isPW?pwProcedures:procedures; const pSetProcedures=isPW?setPwProcedures:setProcedures;

  const hc=useCallback((k,v)=>pSetCd(p=>({...p,[k]:v})),[isPW]);
  const addItemPhoto=useCallback((ph)=>pSetItemPhotos(p=>[...p,ph]),[isPW]);
  const removeItemPhoto=useCallback((phId)=>pSetItemPhotos(p=>p.filter(x=>x.id!==phId)),[isPW]);

  // Save complete data to folder as JSON
  const saveToFolder = async () => {
    const payload = {
      exportDate: new Date().toISOString(),
      protocol: isPW ? "PW56" : "MM92",
      turbine: pRp.serie || (isPW?"PW56":"MM92"),
      report: pRp, checkData: pCd, issues: pIss, boltData: pBd,
      inspData: id, signatures: pSg, photos: pPhotos, itemPhotos: pItemPhotos, procedures: pProcedures, dailyLog,
      themeId
    };
    const json = JSON.stringify(payload, null, 2);
    const filename = `${isPW?"PW56":"MM92"}_${(pRp.serie||"export").replace(/[^a-zA-Z0-9]/g,"_")}_${new Date().toISOString().slice(0,10)}.json`;

    // Try File System Access API (Chrome/Edge)
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: "JSON Data", accept: { "application/json": [".json"] } }]
        });
        const writable = await handle.createWritable();
        await writable.write(json);
        await writable.close();
        setLastSaved("Salvat în folder: " + new Date().toLocaleTimeString("ro-RO"));
        return;
      } catch(e) { if (e.name === "AbortError") return; }
    }
    // Fallback: download
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    setLastSaved("Descărcat: " + new Date().toLocaleTimeString("ro-RO"));
  };

  // Load data from JSON file
  const loadFromFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.report) setRp(data.report);
        if (data.checkData) setCd(data.checkData);
        if (data.issues) setIss(data.issues);
        if (data.boltData) setBd(data.boltData);
        if (data.inspData) setId(data.inspData);
        if (data.signatures) setSg(data.signatures);
        if (data.photos) setPhotos(data.photos);
        if (data.itemPhotos) setItemPhotos(data.itemPhotos);
        if (data.procedures) setProcedures(data.procedures);
        if (data.dailyLog) setDailyLog(data.dailyLog);
        if (data.themeId) setThemeId(data.themeId);
        setLastSaved("Încărcat din fișier: " + new Date().toLocaleTimeString("ro-RO"));
        setAs("report");
      } catch { alert("Fișier invalid. Selectați un JSON exportat anterior."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Clear all data
  const clearAll = () => {
    if (!confirm("Ștergeți TOATE datele? Această acțiune nu poate fi anulată.")) return;
    setCd({}); setRp({parc:"",serie:""}); setIss([]); setBd({});
    setId({defects:[]}); setSg({}); setPhotos([]); setItemPhotos([]);
    setProcedures([]); setDailyLog([]); localStorage.removeItem(STORAGE_KEY);
    setLastSaved("Date șterse: " + new Date().toLocaleTimeString("ro-RO"));
  };

  const Fld=({label,k})=>(<div style={{display:"flex",flexDirection:"column",gap:3,flex:1}}>
    <label style={{fontSize:12,color:T.textSec,fontWeight:700}}>{label}</label>
    <input value={pRp[k]||""} onChange={e=>pSetRp(r=>({...r,[k]:e.target.value}))}
      style={{padding:"8px 10px",border:`1px solid ${T.border}`,borderRadius:6,fontSize:14,fontFamily:"inherit",background:T.surface,color:T.text,minHeight:42}}/></div>);

  const MAIN_TABS=[
    {id:"interventii",label:"Intervenții",labelFull:"Intervenții Zilnice",icon:"📅"},
    {id:"mentenanta",label:"MM92",labelFull:"Senvion MM92",icon:"📋"},
    {id:"pw56",label:"PW56",labelFull:"PowerWind PW56",icon:"🌬️"},
    {id:"documentatie",label:"Docs",labelFull:"Documentație",icon:"📖"},
    {id:"ai",label:"AI",labelFull:"Asistent AI",icon:"🤖"}
  ];

  return(<div style={{display:"flex",flexDirection:"column",height:"100vh",fontFamily:"'IBM Plex Sans','Segoe UI',system-ui,sans-serif",background:T.bg,color:T.text}}>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
    <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(1.1)}}
*{box-sizing:border-box;scrollbar-width:thin;scrollbar-color:${T.border} transparent}
::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}
input,select,textarea,button{font-family:inherit}
@media(max-width:768px){.topbar-logo{display:none!important}.topbar-user{display:none!important}.topbar-label-full{display:none!important}.topbar-label-short{display:inline!important}.mm92-sidebar{width:52px!important}.mm92-sidebar .sb-text{display:none!important}}
@media(min-width:769px){.topbar-label-short{display:none!important}.topbar-label-full{display:inline!important}}`}</style>

    {/* ─── TOP TAB BAR ─── */}
    <div style={{display:"flex",alignItems:"center",background:T.sidebar,padding:"0 6px",minHeight:52,flexShrink:0,gap:0,overflowX:"auto",WebkitOverflowScrolling:"touch",borderBottom:`1px solid ${T.border}`,backdropFilter:"blur(12px)"}}>
      <div className="topbar-logo" style={{display:"flex",alignItems:"center",gap:8,marginRight:12,paddingLeft:8,flexShrink:0}}>
        <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${T.accent},${T.ok})`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <TurbineIcon size={18} color="#fff"/>
        </div>
        <div style={{display:"flex",flexDirection:"column"}}>
          <span style={{fontSize:13,fontWeight:700,color:"#fff",letterSpacing:"0.5px"}}>BLUE LINE</span>
          <span style={{fontSize:9,color:T.sidebarText,letterSpacing:"1px",textTransform:"uppercase"}}>Energy Service</span>
        </div>
      </div>
      {MAIN_TABS.map(t=>(<button key={t.id} onClick={()=>{setMainTab(t.id);if(t.id==="mentenanta")setAs("report");if(t.id==="pw56")setAs("pw_report")}} style={{
        padding:"10px 14px",border:"none",borderBottom:mainTab===t.id?`2px solid ${T.accent}`:"2px solid transparent",
        background:mainTab===t.id?`${T.accent}15`:"transparent",color:mainTab===t.id?T.accent:T.sidebarText,
        cursor:"pointer",fontSize:12,fontWeight:mainTab===t.id?600:400,display:"flex",alignItems:"center",gap:5,
        whiteSpace:"nowrap",minHeight:52,transition:"all 0.2s",flexShrink:0,letterSpacing:"0.2px"
      }}><span style={{fontSize:15}}>{t.icon}</span><span className="topbar-label-full">{t.labelFull}</span><span className="topbar-label-short">{t.label}</span>
        {t.id==="interventii"&&dailyLog.length>0&&<span style={{fontSize:9,fontWeight:600,background:T.accent,color:"#fff",padding:"2px 6px",borderRadius:10,minWidth:16,textAlign:"center"}}>{dailyLog.length}</span>}
      </button>))}
      <div style={{flex:1}}/>
      <div className="topbar-user" style={{fontSize:11,color:T.sidebarText,paddingRight:8,flexShrink:0,display:"flex",alignItems:"center",gap:8}}>
        {online&&<div style={{width:6,height:6,borderRadius:"50%",background:T.ok,flexShrink:0}}/>}
        <span>{online&&(profile?.full_name||user?.email)}</span>
        {online&&signOut&&<button onClick={signOut} style={{fontSize:10,padding:"4px 10px",background:`${T.nok}22`,color:T.nok,border:`1px solid ${T.nok}33`,borderRadius:6,cursor:"pointer",fontWeight:600}}>Ieșire</button>}
      </div>
    </div>

    {/* ─── CONTENT AREA ─── */}
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>

    {/* ─── TAB: MENTENANȚĂ (MM92 or PW56 — sidebar + content) ─── */}
    {(mainTab==="mentenanta"||mainTab==="pw56")&&<>
    <div className="mm92-sidebar" style={{width:so?260:52,transition:"width 0.2s",background:T.sidebar,overflowY:"auto",overflowX:"hidden",flexShrink:0,display:"flex",flexDirection:"column",borderRight:`1px solid ${T.border}`}}>
      <div style={{padding:10,display:"flex",alignItems:"center",gap:8,borderBottom:`1px solid ${T.border}`,minHeight:42}}>
        <button onClick={()=>setSo(p=>!p)} style={{background:"none",border:"none",color:T.sidebarText,cursor:"pointer",fontSize:20,padding:4,minWidth:32,minHeight:32}}>☰</button>
        {so&&<span className="sb-text" style={{fontSize:12,fontWeight:700,color:T.sidebarActiveText}}>{isPW?"PowerWind PW56":"Senvion MM92"}</span>}
      </div>
      {so&&<div style={{padding:"4px 0",flex:1}}>{activeSections.map(s=>{const p=gp(s,pCd);const act=as===s.id;
        return(<div key={s.id} style={{display:"flex",alignItems:"center",gap:0}}>
        <button onClick={()=>setAs(s.id)} style={{flex:1,display:"flex",alignItems:"center",gap:8,padding:"9px 12px",border:"none",textAlign:"left",background:act?T.sidebarActive:"transparent",color:act?T.sidebarActiveText:T.sidebarText,cursor:"pointer",fontSize:13,fontWeight:act?700:400,borderLeft:act?`3px solid ${T.accent}`:"3px solid transparent",minHeight:40,minWidth:0}}>
          <span style={{width:22,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><SectionIcon id={s.id} size={16} color={act?T.sidebarActiveText:T.sidebarText}/></span>
          <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{getName(s)}</span>
          {p&&<span style={{fontSize:10,fontWeight:700,color:p.c===p.t&&p.t>0?T.ok:T.sidebarText}}>{p.c}/{p.t}</span>}
          {s.id==="photos"&&pPhotos.length>0&&<span style={{fontSize:10,fontWeight:700,color:T.accent,background:T.accentLight,padding:"1px 6px",borderRadius:8}}>{pPhotos.length}</span>}
          {(s.id==="pw_photos")&&pPhotos.length>0&&<span style={{fontSize:10,fontWeight:700,color:T.accent,background:T.accentLight,padding:"1px 6px",borderRadius:8}}>{pPhotos.length}</span>}
          {(s.id==="procedures"||s.id==="pw_procedures")&&pProcedures.length>0&&<span style={{fontSize:10,fontWeight:700,color:T.accent,background:T.accentLight,padding:"1px 6px",borderRadius:8}}>{pProcedures.length}</span>}
        </button>
        {act&&<button onClick={e=>{e.stopPropagation();const n=prompt("Redenumire secțiune:",getName(s));if(n!==null)saveCustomName(s.id,n)}} style={{width:28,height:28,border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:0}}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.sidebarText} strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>}
        </div>)})}</div>}
      {so&&<div style={{padding:10,borderTop:`1px solid ${T.border}`,display:"flex",flexDirection:"column",gap:6}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
          {THEME_KEYS.map(k=>(<button key={k} onClick={()=>setThemeId(k)} style={{
            padding:"6px 4px",border:themeId===k?`2px solid ${THEMES[k].accent}`:`1px solid ${T.border}`,
            borderRadius:6,background:THEMES[k].bg,color:THEMES[k].text,cursor:"pointer",fontSize:10,
            fontWeight:themeId===k?700:500,minHeight:32,textAlign:"center"
          }}>{THEMES[k].label}</button>))}
        </div>
        <button onClick={saveToFolder} style={{width:"100%",padding:"10px",background:T.accent,color:"#fff",border:"none",borderRadius:6,cursor:"pointer",fontWeight:700,fontSize:13,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Salvează în folder
        </button>
        <button onClick={()=>genPDF(pRp,pCd,pIss,pBd,id,pSg,pPhotos,pItemPhotos,dailyLog,activeSections)} style={{width:"100%",padding:"10px",background:"#7c3aed",color:"#fff",border:"none",borderRadius:6,cursor:"pointer",fontWeight:700,fontSize:13,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Export PDF
        </button>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
          <button onClick={()=>loadFileRef.current?.click()} style={{padding:"8px",background:"#059669",color:"#fff",border:"none",borderRadius:6,cursor:"pointer",fontWeight:600,fontSize:11,minHeight:38,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Încarcă
          </button>
          <button onClick={clearAll} style={{padding:"8px",background:T.nokBg,color:T.nok,border:`1px solid ${T.nok}44`,borderRadius:6,cursor:"pointer",fontWeight:600,fontSize:11,minHeight:38,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Resetare
          </button>
        </div>
        <input ref={loadFileRef} type="file" accept=".json" onChange={loadFromFile} style={{display:"none"}}/>
        {lastSaved&&<div style={{fontSize:10,color:T.ok,textAlign:"center",padding:"2px 0"}}>✓ Local: {lastSaved}</div>}
        {cloudSync&&<div style={{fontSize:10,color:cloudSync.includes("⚠️")?T.warn:T.accent,textAlign:"center",padding:"2px 0"}}>{cloudSync}</div>}
        <div style={{fontSize:9,color:T.textMuted,textAlign:"center"}}>{online?"☁️ Mod online — sincronizare automată":"💾 Mod offline — auto-save local"}</div>
      </div>}
    </div>

    <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
      {/* Report History Bar */}
      <div style={{maxWidth:920,margin:"0 auto 10px",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <button onClick={newReport} style={{padding:"8px 14px",background:T.accent,color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,minHeight:36,display:"flex",alignItems:"center",gap:5}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Raport nou
        </button>
        <button onClick={saveReportToHistory} style={{padding:"8px 14px",background:"#059669",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,minHeight:36,display:"flex",alignItems:"center",gap:5}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
          Salvează în istoric
        </button>
        <button onClick={()=>setShowHistory(p=>!p)} style={{padding:"8px 14px",border:`1px solid ${showHistory?T.accent:T.border}`,background:showHistory?T.accentLight:T.surface,color:showHistory?T.accent:T.text,borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:12,minHeight:36,display:"flex",alignItems:"center",gap:5}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Istoric ({reportHistory.length})
        </button>
        {pRp.serie&&<span style={{fontSize:12,color:T.textMuted,marginLeft:"auto"}}>{pRp.serie}{pRp.interval?` • ${pRp.interval}`:""}{pRp.dataService?` • ${pRp.dataService}`:""}</span>}
      </div>

      {/* History Panel */}
      {showHistory&&<div style={{maxWidth:920,margin:"0 auto 14px",background:T.surface,borderRadius:10,border:`1px solid ${T.border}`,boxShadow:T.cardShadow,overflow:"hidden"}}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center"}}>
          <span style={{fontSize:15,fontWeight:700,color:T.text}}>Istoric rapoarte — {isPW?"PowerWind PW56":"Senvion MM92"}</span>
          <span style={{flex:1}}/>
          <button onClick={()=>setShowHistory(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:T.textMuted,padding:4}}>✕</button>
        </div>
        {reportHistory.length===0&&<div style={{padding:20,textAlign:"center",color:T.textMuted,fontSize:13}}>Nu sunt rapoarte salvate. Folosiți butonul "Salvează în istoric" pentru a arhiva raportul curent.</div>}
        <div style={{maxHeight:300,overflowY:"auto"}}>
        {reportHistory.map(entry=>{
          const d=new Date(entry.date);
          const itemCount=Object.keys(entry.cd||{}).filter(k=>(entry.cd[k]?.ok)).length;
          const totalItems=Object.keys(entry.cd||{}).length;
          return(<div key={entry.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderBottom:`1px solid ${T.border}`,cursor:"pointer"}}
            onClick={()=>loadReport(entry)}>
            <div style={{width:40,height:40,borderRadius:8,background:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:600,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{entry.label}</div>
              <div style={{fontSize:11,color:T.textMuted}}>
                {d.toLocaleDateString("ro-RO")} {d.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"})}
                {entry.rp?.serie?` • ${entry.rp.serie}`:""}
                {entry.rp?.interval?` • ${entry.rp.interval}`:""}
                {totalItems>0?` • ${itemCount}/${totalItems} completat`:""}
                {(entry.iss||[]).length>0?` • ${entry.iss.length} puncte nerezolvate`:""}
              </div>
            </div>
            <button onClick={e=>{e.stopPropagation();deleteFromHistory(entry.id)}} style={{width:32,height:32,borderRadius:6,border:`1px solid ${T.nok}44`,background:T.nokBg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.nok} strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>);
        })}
        </div>
      </div>}

      <div style={{maxWidth:920,margin:"0 auto",background:T.surface,borderRadius:10,padding:"20px 24px",boxShadow:T.cardShadow}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,paddingBottom:12,borderBottom:`2px solid ${T.border}`}}>
          <div style={{fontSize:20,fontWeight:800,color:T.text,display:"flex",alignItems:"center",gap:10}}>
            <SectionIcon id={sec?.id} size={24} color={T.accent}/>
            <span>{sec?getName(sec):""}</span>
            {sec&&<button onClick={()=>{const n=prompt("Redenumire secțiune:",getName(sec));if(n!==null)saveCustomName(sec.id,n)}} title="Redenumește secțiunea" style={{width:30,height:30,borderRadius:6,border:`1px solid ${T.accent}44`,background:T.accentLight,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>}
          </div>
          {sec&&<ProcedureBadge sectionId={sec.id} procedures={pProcedures} T={T}/>}
          {sec&&(()=>{const p=gp(sec,pCd);if(!p)return null;const pc=Math.round(p.c/p.t*100);
            return(<div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:120,height:8,background:T.border,borderRadius:4}}><div style={{width:`${pc}%`,height:"100%",background:pc===100?T.ok:T.accent,borderRadius:4,transition:"width 0.3s"}}/></div>
              <span style={{fontSize:14,fontWeight:700,color:pc===100?T.ok:T.textSec}}>{pc}%</span></div>)})()}
        </div>

        {(as==="report"||as==="pw_report")&&(()=>{
          const typeKey=isPW?"pw56":"mm92";
          const parks=getParks(typeKey);
          const selectedPark=parks.find(p=>p.name===pRp.parc);
          const turbines=selectedPark?.turbines||[];
          const selStyle={width:"100%",padding:"8px 10px",border:`1px solid ${T.border}`,borderRadius:6,fontSize:14,background:T.surface,color:T.text,minHeight:42};
          const lblStyle={fontSize:12,color:T.textSec,fontWeight:700};
          return(<div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* Park / Turbine / Serial selectors */}
          <div style={{padding:14,background:T.accentLight,borderRadius:10,border:`1px solid ${T.accent}33`}}>
            <div style={{fontSize:13,fontWeight:700,color:T.accent,marginBottom:10}}>Identificare turbină — {FLEET[typeKey].type}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              <div><label style={lblStyle}>Parc eolian</label>
                <select value={pRp.parc||""} onChange={e=>{
                  const park=parks.find(p=>p.name===e.target.value);
                  pSetRp(r=>({...r,parc:e.target.value,serie:"",turbina:"",dataPIF:park?.commissioning||""}));
                }} style={selStyle}>
                  <option value="">— Selectează parc —</option>
                  {parks.map(p=>(<option key={p.id} value={p.name}>{p.name}</option>))}
                </select>
              </div>
              <div><label style={lblStyle}>Turbina</label>
                <select value={pRp.turbina||""} onChange={e=>{
                  const t=turbines.find(x=>x.label===e.target.value);
                  pSetRp(r=>({...r,turbina:e.target.value,serie:t?.serial||""}));
                }} style={selStyle} disabled={!selectedPark}>
                  <option value="">— Selectează turbina —</option>
                  {turbines.map(t=>(<option key={t.id} value={t.label}>{t.label} (S/N: {t.serial})</option>))}
                </select>
              </div>
              <div><label style={lblStyle}>Nr. serie</label>
                <input value={pRp.serie||""} readOnly style={{...selStyle,background:T.surfaceAlt,fontWeight:700,fontSize:16}}/>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}>
              <div><label style={lblStyle}>Data punere în funcțiune</label>
                <input value={pRp.dataPIF||""} readOnly style={{...selStyle,background:T.surfaceAlt}}/>
              </div>
              <Fld label="Locație" k="locatie"/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Fld label="Ore funcț.(Total)" k="oreTotal"/><Fld label="Ore funcț.(An)" k="oreCurent"/>
            <Fld label="Producție kWh(Total)" k="prodTotal"/><Fld label="Producție kWh(An)" k="prodCurent"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Fld label="Interval service" k="interval"/>
            <Fld label="Data service" k="dataService"/>
            <Fld label="Tehnician 1" k="tech1"/><Fld label="Tehnician 2" k="tech2"/>
            <Fld label="Tehnician 3" k="tech3"/><Fld label="Verificator" k="verificator"/>
          </div>
        </div>)})()}

        {(as==="progress"||as==="pw_progress")&&<div>{activeSections.filter(s=>s.items.length>0).map(s=>{const p=gp(s,pCd);if(!p)return null;const pc=Math.round(p.c/p.t*100);
          return(<div key={s.id} onClick={()=>setAs(s.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:T.surfaceAlt,borderRadius:8,marginBottom:6,cursor:"pointer"}}>
            <span style={{width:24,display:"flex",alignItems:"center",justifyContent:"center"}}><SectionIcon id={s.id} size={20} color={T.accent}/></span><span style={{flex:1,fontSize:14,fontWeight:500,color:T.text}}>{getName(s)}</span>
            <div style={{width:100,height:8,background:T.border,borderRadius:4}}><div style={{width:`${pc}%`,height:"100%",background:pc===100?T.ok:T.accent,borderRadius:4}}/></div>
            <span style={{fontSize:13,fontWeight:700,width:55,textAlign:"right",color:pc===100?T.ok:T.textSec}}>{p.c}/{p.t}</span></div>)})}</div>}

        {(as==="issues"||as==="pw_issues")&&<div>
          {pIss.map((x,i)=>(<div key={x.id} style={{padding:14,background:T.warnBg,borderLeft:`4px solid ${T.warn}`,borderRadius:8,marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",marginBottom:8}}><span style={{fontWeight:800,color:T.warn,fontSize:15}}>#{i+1}</span>
              <button onClick={()=>pSetIss(p=>p.filter((_,j)=>j!==i))} style={{marginLeft:"auto",fontSize:12,color:T.nok,background:"none",border:"none",cursor:"pointer",padding:"6px 10px",minHeight:36}}>✕</button></div>
            <textarea value={x.desc} onChange={e=>pSetIss(p=>p.map((q,j)=>j===i?{...q,desc:e.target.value}:q))} placeholder="Descriere..." rows={2}
              style={{width:"100%",fontSize:14,padding:"8px",border:`1px solid ${T.warn}33`,borderRadius:6,fontFamily:"inherit",background:T.surface,color:T.text,minHeight:56}}/>
            <div style={{display:"flex",gap:14,marginTop:8,flexWrap:"wrap"}}>
              {[["photo","Foto"],["resolved","Rezolvat"],["next","Următ.întreț."]].map(([k,l])=>(
                <label key={k} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13,color:T.text}}>
                  <input type="checkbox" checked={x[k]} onChange={e=>pSetIss(p=>p.map((q,j)=>j===i?{...q,[k]:e.target.checked}:q))} style={{width:20,height:20,accentColor:T.accent}}/>{l}</label>))}
            </div>
            <input value={x.obs} onChange={e=>pSetIss(p=>p.map((q,j)=>j===i?{...q,obs:e.target.value}:q))} placeholder="Observații..."
              style={{width:"100%",marginTop:8,fontSize:13,padding:"8px",border:`1px solid ${T.warn}33`,borderRadius:6,background:T.surface,color:T.text,minHeight:40}}/>
          </div>))}
          <button onClick={()=>pSetIss(p=>[...p,{id:Date.now(),desc:"",photo:false,resolved:false,obs:"",next:false}])}
            style={{padding:"12px 20px",background:T.warn,color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:14,minHeight:44}}>+ Adaugă punct</button>
        </div>}

        {(as==="blade_bolts"||as==="pw_blade_bolts")&&<BladeBoltsView T={T} bd={pBd} setBd={pSetBd}/>}

        {as==="blade_inspection"&&<div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            {[["Sistem","sistem"],["Parc","parc"],["Nr.pală","nrPala"],["Tip","tipPala"],["Data","data"],["Meteo","meteo"],["Inspector","inspector"]].map(([l,k])=>(
              <div key={k} style={{display:"flex",flexDirection:"column",gap:3}}>
                <label style={{fontSize:12,color:T.textSec,fontWeight:700}}>{l}</label>
                <input value={id[k]||""} onChange={e=>setId(r=>({...r,[k]:e.target.value}))} style={{padding:"8px",border:`1px solid ${T.border}`,borderRadius:6,fontSize:14,background:T.surface,color:T.text,minHeight:40}}/></div>))}
          </div>
          <div style={{fontWeight:700,fontSize:15,color:T.text,marginBottom:8}}>Defecțiuni:</div>
          {(id.defects||[]).map((d,i)=>(<div key={d.id} style={{padding:8,background:T.nokBg,borderRadius:6,marginBottom:6,display:"grid",gridTemplateColumns:"2fr 1fr 1fr 50px 1fr",gap:6}}>
            {[["desc","Descriere"],["dim","Dim"],["loc","Localizare"],["z","Z(m)"],["files","Foto"]].map(([k,p])=>(
              <input key={k} value={d[k]} onChange={e=>setId(r=>({...r,defects:r.defects.map((q,j)=>j===i?{...q,[k]:e.target.value}:q)}))} placeholder={p}
                style={{padding:"6px",border:`1px solid ${T.nok}33`,borderRadius:5,fontSize:13,background:T.surface,color:T.text,minHeight:36}}/>))}
          </div>))}
          <button onClick={()=>setId(r=>({...r,defects:[...(r.defects||[]),{id:Date.now(),desc:"",dim:"",loc:"",z:"",files:""}]}))}
            style={{padding:"10px 18px",background:T.nok,color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,minHeight:44}}>+ Defecțiune</button>
        </div>}

        {(as==="signatures"||as==="pw_signatures")&&<div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            {["Tehnician 1","Tehnician 2","Tehnician 3","Verificator"].map(l=>{const k=l.toLowerCase().replace(/ /g,"_");
              return <SignatureCanvas key={k} label={l} sigData={pSg[k]} onChange={d=>pSetSg(p=>({...p,[k]:d}))} T={T}/>})}
          </div>
        </div>}

        {(as==="photos"||as==="pw_photos")&&<PhotosView T={T} photos={pPhotos} setPhotos={pSetPhotos}/>}

        {(as==="procedures"||as==="pw_procedures")&&<ProceduresView T={T} procedures={pProcedures} setProcedures={pSetProcedures} uploadToCloud={online?session.uploadProcedure:null}/>}

        {sec?.items?.length>0&&<div style={{display:"flex",flexDirection:"column",gap:4}}>
          {sec.items.map(item=><CheckItem key={item.id} item={{...item,name:getItemName(item),interval:getItemInterval(item),note:getItemNote(item)}} data={pCd} onChange={hc} T={T} itemPhotos={pItemPhotos} onAddPhoto={addItemPhoto} onRemovePhoto={removeItemPhoto} onEditItem={editItem} customNames={customNames}/>)}</div>}
      </div>
    </div>
    </>}

    {/* ─── TAB: INTERVENȚII ZILNICE ─── */}
    {mainTab==="interventii"&&<div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
      <div style={{maxWidth:1000,margin:"0 auto",background:T.surface,borderRadius:10,padding:"20px 24px",boxShadow:T.cardShadow}}>
        <DailyLogView T={T} dailyLog={dailyLog} setDailyLog={setDailyLog}/>
      </div>
    </div>}

    {/* ─── TAB: DOCUMENTAȚIE ─── */}
    {mainTab==="documentatie"&&<div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        {/* Sub-tabs */}
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[["docs","📖 Manuale PDF"],["gallery","📷 Referințe Vizuale"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setAs(id)} style={{
              flex:1,padding:"10px 14px",border:as===id?`2px solid ${T.accent}`:`1px solid ${T.border}`,
              background:as===id?`${T.accent}12`:T.surface,color:as===id?T.accent:T.text,
              borderRadius:10,cursor:"pointer",fontWeight:600,fontSize:13
            }}>{lbl}</button>
          ))}
        </div>
        <div style={{background:T.surface,borderRadius:10,padding:"20px 24px",boxShadow:T.cardShadow}}>
          {as!=="gallery"?<DocumentationView T={T}/>:<VisualGalleryView T={T}/>}
        </div>
      </div>
    </div>}

    {/* ─── TAB: ASISTENT AI ─── */}
    {mainTab==="ai"&&<div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
      <div style={{maxWidth:900,margin:"0 auto",background:T.surface,borderRadius:10,padding:"20px 24px",boxShadow:T.cardShadow}}>
        <AIAssistantView T={T} dailyLog={dailyLog}/>
      </div>
    </div>}

    </div>

    {/* ─── FLOATING AI CHAT (all pages) ─── */}
    <FloatingAIChat T={T} dailyLog={dailyLog} sectionContext={
      mainTab==="interventii"?"Intervenții zilnice":
      mainTab==="documentatie"?"Documentație":
      mainTab==="ai"?"Asistent AI":
      sec?getName(sec)+" ("+(isPW?"PW56":"MM92")+")":
      (isPW?"PowerWind PW56":"Senvion MM92")
    }/>
  </div>);
}
