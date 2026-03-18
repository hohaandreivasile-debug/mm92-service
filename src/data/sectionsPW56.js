// src/data/sectionsPW56.js — PowerWind PW56 Maintenance Protocol (Romanian)

export const SECTIONS_PW56 = [
{id:"pw_report",title:"Raport de service",icon:"📋",items:[]},
{id:"pw_issues",title:"Puncte nerezolvate",icon:"⚠️",items:[]},
{id:"pw_progress",title:"Progres global",icon:"📊",items:[]},

{id:"pw1",title:"1 · Acces turbină",icon:"🚪",items:[
{id:"PW1.1",name:"Acces la turbină",interval:"sem",note:"Vegetație, accesibilitate"},
{id:"PW1.2",name:"Drum acces",interval:"sem",note:"Starea drumului"},
{id:"PW1.3",name:"Scări și trepte",interval:"sem",hasResult:true,note:"Rugină, verificare fixare"}
]},

{id:"pw2",title:"2 · Fundație",icon:"🏗️",items:[
{id:"PW2.1",name:"Fundație exterioară",interval:"anual",hasResult:true,note:"Stare generală, fisuri. >0.3mm = notificare defect"},
{id:"PW2.2",name:"Rost construcție elastic",interval:"anual",hasResult:true,note:"Stare, etanșeitate. Înlocuire dacă nu e etanș"},
{id:"PW2.3",name:"Sol",interval:"anual",note:"Stare, gropi în sol"},
{id:"PW2.4",name:"Cavități",interval:"anual",note:"Etanșare deteriorată?"},
{id:"PW2.5",name:"Fundație interioară",interval:"anual",hasResult:true,note:"Umiditate, urme rugină, fisuri. Verificare priză pământ"},
{id:"PW2.6",name:"Canal cabluri / conducte",interval:"anual",note:"Etanșeitate, intrare apă, deteriorare rozătoare"}
]},

{id:"pw3",title:"3 · Zona intrare",icon:"🚪",items:[
{id:"PW3.1",name:"Lumină ușă",interval:"sem",hasResult:true,note:"Test funcțional, verificare fixare"},
{id:"PW3.2",name:"Detector mișcare",interval:"sem",hasResult:true,note:"Test funcțional, verificare fixare"},
{id:"PW3.3",name:"Ușă intrare",interval:"sem",hasResult:true,note:"Mecanism închidere, lubrifiere dacă e rigidă"},
{id:"PW3.3b",name:"Opritor ușă",interval:"sem",hasResult:true,note:"Test funcțional securizare ușă"},
{id:"PW3.4",name:"Filtru ușă",interval:"necesitate",note:"Înlocuire filtru dacă e necesar"},
{id:"PW3.5",name:"Trusă prim ajutor / stingătoare",interval:"anual",note:"Data expirare, etichetă inspecție"}
]},

{id:"pw4",title:"4 · Tablou principal",icon:"📦",items:[
{id:"PW4.1",name:"Curățenie tablou",interval:"sem",note:"Mizerie, insecte. Curățare"},
{id:"PW4.1b",name:"Conexiuni șuruburi",interval:"sem",note:"Verificare fixare"},
{id:"PW4.1c",name:"Fisuri",interval:"anual"},
{id:"PW4.1d",name:"Uși tablou, încuietoare",interval:"sem",note:"Verificare funcționare lină"},
{id:"PW4.1e",name:"Priză pământ",interval:"sem",note:"Verificare fixare"},
{id:"PW4.2",name:"Componente electrice",interval:"sem",note:"Reziduuri fum, verificare fixare"},
{id:"PW4.2b",name:"Cablare",interval:"anual",note:"Sondaj terminal"},
{id:"PW4.2c",name:"Întrerupător motor",interval:"anual",note:"Verificare siguranță și valori nominale"},
{id:"PW4.2d",name:"Priză pământ componente",interval:"sem",note:"Verificare fixare"},
{id:"PW4.3",name:"RCD (dispozitiv curent rezidual)",interval:"sem",hasRCD:true,note:"Test cu tester RCD sau buton test"},
{id:"PW4.4",name:"UPS",interval:"anual",hasResult:true,note:"Verificare baterie. Oprire turbină, dezactivare 230V, măsurare timp bridging. Min 10 minute"},
{id:"PW4.5",name:"Filtru tablou",interval:"necesitate",note:"Înlocuire PSB 275 S EU"},
{id:"PW4.6",name:"Ventilator și încălzire tablou",interval:"sem",hasResult:true,note:"Test funcțional conform schemă"}
]},

{id:"pw5",title:"5 · Unitate comandă",icon:"🖥️",items:[
{id:"PW5.1",name:"Memorie erori",interval:"sem",note:"Verificare și citire memorie erori"},
{id:"PW5.2",name:"Control Mita",interval:"sem",note:"Verificare fixare, sondaj cablare"},
{id:"PW5.3",name:"Software / sistem operare",interval:"necesitate",note:"Actualizare dacă e necesar, documentare revizie"}
]},

{id:"pw6",title:"6 · Convertizor",icon:"⚡",items:[
{id:"PW6.1",name:"Curățenie convertizor",interval:"sem",note:"Curățare, verificare fisuri, reziduuri fum"},
{id:"PW6.1b",name:"Uzură cabluri la presgarnituri",interval:"sem"},
{id:"PW6.1c",name:"Conexiuni cabluri forță",interval:"sem",hasResult:true,note:"PERICOL! Terminale sub tensiune! Deconectare MCB înainte"},
{id:"PW6.1d",name:"Terminale cabluri",interval:"anual",note:"Sondaj fixare terminale"},
{id:"PW6.1e",name:"Lanț siguranță",interval:"sem",hasResult:true,note:"Test funcțional"},
{id:"PW6.1f",name:"Priză pământ convertizor",interval:"sem",note:"Verificare fixare"},
{id:"PW6.2",name:"Răcire convertizor",interval:"sem",hasResult:true,note:"Fisuri, etanșeitate conexiuni furtun"},
{id:"PW6.2b",name:"Presiune pompă",interval:"sem",hasValueField:true,valueLabel:"bar",note:"ABB: 1.5-2 bar, THE SWITCH: 2-2.5 bar"},
{id:"PW6.2c",name:"Pompă răcire",interval:"sem",hasResult:true,note:"Test funcțional"},
{id:"PW6.2d",name:"Furtunuri, etanșeitate",interval:"sem",note:"Verificare fixare"},
{id:"PW6.2e",name:"Ventilatoare interne",interval:"sem",hasResult:true,note:"Test funcțional"},
{id:"PW6.2f",name:"Răcire externă / grilă ventilație",interval:"sem",note:"Curățare temeinică cu perie/aer comprimat"},
{id:"PW6.3",name:"Baterii backup (ABB)",interval:"anual",note:"Verificare 2 baterii. Înlocuire după 6 ani"}
]},

{id:"pw7",title:"7 · Turn",icon:"🗼",items:[
{id:"PW7.1",name:"Curățenie turn",interval:"sem",note:"Curățare mizerie, insecte"},
{id:"PW7.2",name:"Scară / șină scară",interval:"sem",hasResult:true,note:"Aliniere, fisuri, denivelări. Verificare mișcare lină"},
{id:"PW7.2b",name:"Conectori scară / protecție cădere",interval:"sem",note:"M12 SW19=86Nm, M16 SW24=210Nm. 100% la IM, 10% anual"},
{id:"PW7.3",name:"Perete turn",interval:"sem",note:"Coroziune, vopsea, fisuri, suduri. Grunduire/reparare"},
{id:"PW7.3b",name:"Prize / lumini turn",interval:"sem",hasResult:true,note:"Test funcțional"},
{id:"PW7.4",name:"Platforme și trape",interval:"sem",hasResult:true,note:"Rugină, deteriorare, mișcare liberă trape"},
{id:"PW7.5",name:"Cabluri forță și comandă",interval:"sem",note:"Inspecție la urcare: izolație, traseu. Turbina OPRITĂ!"},
{id:"PW7.6",name:"Buclă cabluri",interval:"sem",note:"Uzură cabluri la coliere, centrare buclă"},
{id:"PW7.7",name:"Iluminat urgență turn",interval:"sem",hasResult:true,note:"Test: oprire/pornire siguranță"},
{id:"PW7.8",name:"Flanșe turn",interval:"sem",note:"Coroziune, fisuri, suduri. M36 SW60=2800Nm, M30 SW50=1650Nm. 100% IM, 10% anual"},
{id:"PW7.9",name:"Flanșă superioară turn",interval:"sem",note:"M27 SW50/46=1250Nm, M30 SW50/46=1650Nm. 100% IM, 10% anual"}
]},

{id:"pw8",title:"8 · Nacelă",icon:"🏠",items:[
{id:"PW8.1",name:"Fixare capotă nacelă",interval:"sem",note:"Fisuri, deteriorare, etanșeitate. M12 SW19=68Nm"},
{id:"PW8.2",name:"Plăci podea",interval:"sem",note:"Stare, fixare"},
{id:"PW8.3",name:"Canale cabluri",interval:"sem",note:"Capace, verificare fixare"},
{id:"PW8.4",name:"Iluminare nacelă",interval:"sem",hasResult:true},
{id:"PW8.5",name:"Trapă capotă nacelă",interval:"sem",note:"Fixare"},
{id:"PW8.6",name:"Trapă macara",interval:"sem"},
{id:"PW8.7",name:"Priză pământ / bandă",interval:"sem",note:"Verificare fixare"},
{id:"PW8.8",name:"Anemometru și giruetă",interval:"sem",note:"Verificare fixare și orientare giruetă (marcaj spre spate)"},
{id:"PW8.9",name:"Lumini aviație",interval:"sem",hasResult:true}
]},

{id:"pw9",title:"9 · Tablou superior",icon:"📦",items:[
{id:"PW9.1",name:"Tablou superior",interval:"sem",note:"Fisuri, punct intrare cabluri, verificare fixare"},
{id:"PW9.2",name:"Componente în tablou",interval:"sem",note:"Reziduuri fum, conexiuni, cablare, strângere terminale"},
{id:"PW9.3",name:"Întrerupător motor",interval:"anual",note:"Comparare valori setare cu schema electrică"},
{id:"PW9.4",name:"Curățenie",interval:"sem",note:"Mizerie, insecte"},
{id:"PW9.5",name:"Covorașe filtru",interval:"sem",note:"Înlocuire dacă e necesar. PSB 275 S EU"},
{id:"PW9.6",name:"Ventilator și încălzire",interval:"sem",hasResult:true,note:"Test funcțional conform schemă"}
]},

{id:"pw10",title:"10 · Dispozitive siguranță",icon:"🛡️",items:[
{id:"PW10.1",name:"Buton oprire urgență",interval:"sem",hasResult:true,note:"Test funcțional, verificare fixare"},
{id:"PW10.2",name:"Comutator vibrații",interval:"sem",hasResult:true,note:"Test funcțional, verificare fixare"},
{id:"PW10.3",name:"Funcție supraviteză (WP2035)",interval:"anual",hasResult:true,note:"K34.6: 170Hz→30Hz(=300rpm)→activare. K34.2: 11.0Hz→1.6Hz→activare"},
{id:"PW10.4",name:"Limitator orientare (cable twist)",interval:"sem",hasResult:true,note:"Test funcțional, verificare fixare"}
]},

{id:"pw11",title:"11 · Sistem orientare (yaw)",icon:"🧭",items:[
{id:"PW11.1",name:"Sistem frână orientare",interval:"sem",hasResult:true,note:"Verificare zgomot în funcționare"},
{id:"PW11.1b",name:"Plăcuțe frână orientare",interval:"sem",hasValueField:true,valueLabel:"mm",note:"Măsurare grosime. Slăbire piulițe, strângere la 50/100Nm + 270°/495°"},
{id:"PW11.2",name:"Rulment fricțiune frână yaw",interval:"sem",note:"Lubrifiere STABYL EOS E2 (2×400g = 800g)"},
{id:"PW11.3",name:"Mecanism orientare",interval:"sem",hasResult:true,note:"Etanșeitate, nivel ulei, model contact pinion"},
{id:"PW11.3b",name:"Schimb ulei orientare",interval:"3ani",note:"Bonfiglioli: Shell Omala HD320 15l. Comer: Mobil SHC630 17.5l"},
{id:"PW11.4",name:"Motor orientare",interval:"sem",note:"Cutie terminale, ventilator. Verificare joc frână motor"},
{id:"PW11.5",name:"Rulment orientare",interval:"sem",hasResult:true,note:"Rugină, uzură, model contact, etanșări. Verificare preîncărcare buloane"},
{id:"PW11.5b",name:"Lubrifiere rulment orientare",interval:"sem",note:"Fuchs STABYL EOS E2, cale rulare: 500g"},
{id:"PW11.6",name:"Coroană orientare",interval:"sem",note:"Rugină, fisuri margine. Lubrifiere Ceplattyn BL 1kg manual"},
{id:"PW11.7",name:"Senzori proximitate",interval:"sem",note:"Curățare, degresare. Distanță 5mm"},
{id:"PW11.8",name:"Senzori inductivi coroană",interval:"sem",note:"Curățare, degresare. Distanță 7mm"}
]},

{id:"pw12",title:"12 · Tren de antrenare",icon:"⚙️",items:[
{id:"PW12.1",name:"Rulment principal",interval:"sem",hasResult:true,note:"Etanșări, vopsea antimanipulare. Zgomot?"},
{id:"PW12.1b",name:"Lubrifiere rulment principal",interval:"sem",hasValueField:true,valueLabel:"kg",note:"NTN: Fuchs STABYL EOS E2, 2.355kg"},
{id:"PW12.1c",name:"Probă unsoare rulment",interval:"2ani",note:"După 24 luni"},
{id:"PW12.2",name:"Tavă colectare unsoare",interval:"sem",note:"Curățare"},
{id:"PW12.3",name:"Inel strângere",interval:"sem",note:"Vopsea antimanipulare la conexiuni"},
{id:"PW12.4",name:"Senzori turație rotor",interval:"sem",note:"Test funcțional, verificare fixare, distanță 5mm"}
]},

{id:"pw13",title:"13 · Cutie viteze (Gearbox)",icon:"⚡",items:[
{id:"PW13.1",name:"Gearbox - etanșeitate",interval:"sem",note:"Murdărie, reziduuri ulei la ieșire arbori"},
{id:"PW13.1b",name:"Șuruburi îmbinări laterale",interval:"prim",note:"M30 8.8=1450Nm(8buc), M20 8.8=363Nm(15buc)"},
{id:"PW13.1c",name:"Șuruburi coroană dintată",interval:"prim",note:"Generator: M30 10.9=1750Nm(14). Rotor: M30 12.9=2100Nm(28)"},
{id:"PW13.1d",name:"Șuruburi disc contracție",interval:"prim",note:"M27 12.9=1450Nm"},
{id:"PW13.2",name:"Filtru ulei",interval:"sem",hasResult:true,note:"Etanșeitate, LED indicator colmatare. Hydac 1300 R 010 BN4HC"},
{id:"PW13.3",name:"Probă ulei",interval:"sem",note:"PERICOL: Blocare rotor înainte de deschidere!"},
{id:"PW13.4",name:"Nivel ulei",interval:"sem",hasValueField:true,valueLabel:"litri",note:"Citire doar cu turbina oprită, după înlocuire filtru"},
{id:"PW13.5",name:"Schimb ulei",interval:"5ani",note:"Fuchs Renolin Unisyn CLP 320, ~185l. Doar uleiuri aprobate!"},
{id:"PW13.6",name:"Pompă lubrifiere gearbox",interval:"sem",hasResult:true,note:"Etanșeitate, test funcțional"},
{id:"PW13.6b",name:"Filtru respirație",interval:"3ani",note:"Curățare"},
{id:"PW13.7",name:"Răcitor ulei",interval:"sem",hasResult:true,note:"Etanșeitate, test funcțional motor"},
{id:"PW13.8",name:"Roți dințate gearbox",interval:"anual",note:"Demontare capac, verificare la turație redusă. Dinți rupți, fisuri margine"},
{id:"PW13.9",name:"Cutie terminale gearbox",interval:"sem",note:"Traseu cabluri, sondaj terminale"},
{id:"PW13.10",name:"Încălzire ulei gearbox",interval:"anual",hasResult:true,note:"Test funcțional, verificare creștere temperatură"},
{id:"PW13.11",name:"Reazem cuplu",interval:"sem",note:"Verificare fisuri, deformări manșon interior. Vopsea antimanipulare"}
]},

{id:"pw14",title:"14 · Cuplaj",icon:"🔗",items:[
{id:"PW14.1",name:"Capac protecție cuplaj",interval:"sem",note:"Verificare fixare. Nu călcați pe capac!"},
{id:"PW14.2",name:"Cuplaj",interval:"sem",hasResult:true,note:"Discuri defecte, rugină între discuri. Aliniere laser gearbox/generator"},
{id:"PW14.3",name:"Senzor inductiv cuplaj",interval:"sem",note:"Verificare fixare, curățare, degresare. Distanță 7mm"}
]},

{id:"pw15",title:"15 · Generator",icon:"🔌",items:[
{id:"PW15.1",name:"Rulmenți generator",interval:"sem",hasResult:true,note:"Etanșeitate, vibrații, zgomot"},
{id:"PW15.1b",name:"Lubrifiere rulmenți",interval:"anual",note:"ABB: Klüberplex BEM41-132, A=140g B=120g. The Switch: SKF LAGD125/WA2"},
{id:"PW15.2",name:"Tavă ulei generator",interval:"sem",note:"Curățare"},
{id:"PW15.3",name:"Conexiuni cabluri forță",interval:"sem",note:"PERICOL tensiune! Rotor staționar și blocat! Verificare conexiuni"},
{id:"PW15.4",name:"Buclă cabluri forță",interval:"sem",note:"Izolație, uzură cabluri, fixare"},
{id:"PW15.5",name:"Conexiuni cutie terminale",interval:"sem",note:"Doar cabluri comandă, strângere terminale"},
{id:"PW15.6",name:"Ventilator răcire generator",interval:"sem",hasResult:true,note:"Direcție rotație, pale ventilator, test funcțional"},
{id:"PW15.7",name:"Amortizor vibrații ESM",interval:"sem",note:"Fisuri, uzură. M16 SW24=210Nm"},
{id:"PW15.8",name:"Priză pământ generator",interval:"sem",note:"Verificare fixare"},
{id:"PW15.9",name:"Răcire cu apă",interval:"sem",hasValueField:true,valueLabel:"bar",note:"ABB: 1.5-2 bar. Test funcțional pompă"},
{id:"PW15.11",name:"Ventilator răcire (The Switch)",interval:"anual",note:"Înlocuire filtru 500854 A"},
{id:"PW15.12",name:"Snubber (The Switch)",interval:"anual",note:"Măsurare rezistență: 7ohm±10%. Capacitate: 3×136nF (stea)"}
]},

{id:"pw16",title:"16 · Ansamblu inele colectoare",icon:"💫",items:[
{id:"PW16.1",name:"Inel colector mecanic",interval:"sem",note:"Cablare"},
{id:"PW16.2",name:"Inel colector electric",interval:"sem",note:"PERICOL 400V! Deconectare, verificare absență tensiune. Sondaj terminale, curățare"},
{id:"PW16.3",name:"Perii aur Stemmann",interval:"sem",note:"Ulei contact? Curățare cu Klüberalfa XZ3-1, lubrifiere cu YM3-30. Înlocuire perii dacă uzate/rupte"}
]},

{id:"pw17",title:"17 · Cadru generator",icon:"🔩",items:[
{id:"PW17.1",name:"Conexiune cadru principal",interval:"sem",hasResult:true,note:"Vopsea antimanipulare la buloane. Documentare rezultate! Raportare fisuri imediat!"},
{id:"PW17.1b",name:"Cadru principal",interval:"sem",note:"Fisuri, coroziune, deteriorări, suduri"},
{id:"PW17.2",name:"Priză pământ cadru",interval:"sem",note:"Deteriorare, verificare fixare"}
]},

{id:"pw18",title:"18 · Frână",icon:"🛑",items:[
{id:"PW18.1",name:"Sistem general frână",interval:"sem",hasResult:true,note:"Test funcțional"},
{id:"PW18.1b",name:"Disc frână",interval:"sem",note:"Decolorare, deteriorare, denivelări"},
{id:"PW18.2",name:"Frână Svendborg",interval:"sem",note:"Etanșeitate, murdărie, vopsea antimanipulare"},
{id:"PW18.3",name:"Plăcuțe frână etrier",interval:"sem",hasValueField:true,valueLabel:"mm",note:"Joc aer 1mm. Înlocuire: <19mm(BSFH3xx), <27mm(BSFI/BSAK)"},
{id:"PW18.3b",name:"Înlocuire plăcuțe frână",interval:"necesitate",note:"Stromag: organic ES3-5. Svendborg: organic BE3521"}
]},

{id:"pw19",title:"19 · Hidraulic",icon:"💧",items:[
{id:"PW19.1",name:"Furtunuri hidraulice",interval:"sem",note:"Deteriorare, fragilitate, deformare, etanșeitate"},
{id:"PW19.2",name:"Unitate hidraulică și bloc valve",interval:"sem",hasResult:true,note:"ATENȚIE ochelari+mănuși! Nivel ulei, test funcțional, presiune"},
{id:"PW19.2b",name:"Schimb ulei hidraulic",interval:"2ani",note:"Mobil SHC 524, 3l"},
{id:"PW19.2c",name:"Înlocuire filtru ulei",interval:"2ani",note:"AVN: 137795-HP. Svendborg: 1701-2024-003"},
{id:"PW19.3",name:"Acumulator presiune",interval:"sem",hasValueField:true,valueLabel:"bar",note:"Test presiune. Înlocuire la 5 ani"}
]},

{id:"pw20",title:"20 · Butuc (Hub)",icon:"🎯",items:[
{id:"PW20.1",name:"Acces butuc",interval:"sem",note:"PERICOL! Blocare hub înainte de intrare! Frână activată! Max 8m/s vânt"},
{id:"PW20.2",name:"Blocare rotor",interval:"sem",hasResult:true,note:"Rugină, deteriorare, mișcare liberă"},
{id:"PW20.3",name:"Senzor blocare rotor",interval:"sem",hasResult:true,note:"Test funcțional"},
{id:"PW20.4",name:"Iluminare hub",interval:"sem",hasResult:true},
{id:"PW20.5",name:"Cutie centrală exterior",interval:"sem",note:"Fisuri, rugină, deteriorare, puncte intrare cabluri"},
{id:"PW20.6",name:"Cutie centrală interior",interval:"sem",note:"Cablare, reziduuri fum, strângere terminale"},
{id:"PW20.7",name:"Cutii axe interior",interval:"sem",note:"Cablare, reziduuri fum. Măsurare tensiune baterie >30V",hasValueField:true,valueLabel:"V"},
{id:"PW20.8",name:"Cutii axe 1,2,3 exterior",interval:"sem",note:"Fisuri, rugină. Hub: M16 SW24=210Nm. Suport: M12 SW19=86Nm"},
{id:"PW20.9",name:"Mecanism pitch",interval:"sem",hasResult:true,note:"Etanșeitate, nivel ulei, model contact pinion, vopsea antimanipulare"},
{id:"PW20.10",name:"Rulment pală",interval:"sem",note:"Coroziune, uzură, etanșări. Cuplu 1650Nm"},
{id:"PW20.10b",name:"Lubrifiere rulment pală",interval:"sem",note:"Cale rulare: 200g/pală. Fuchs Gleitmo 585K"},
{id:"PW20.10c",name:"Lubrifiere dantura pitch",interval:"sem",note:"500g/pală. Fuchs Gleitmo 585K. Înlocuire baterii sistem lubrifiere"}
]},

{id:"pw21",title:"21 · Pale rotor",icon:"🌀",items:[
{id:"PW21.1",name:"Pale exterior",interval:"anual",hasResult:true,note:"Fisuri, trăsnete, etanșare, rugină, delaminare. Binoclu"},
{id:"PW21.2",name:"Pale interior",interval:"anual",note:"Fisuri, umiditate, rugină. Platformă pală, paratrăsnet, conexiuni"},
{id:"PW21.3",name:"Setare unghi pală",interval:"anual",note:"Conform Manual Mentenanță Cap.4"},
{id:"PW21.4",name:"Buloane pale",interval:"sem",note:"Rugină. C27: M30 SW46=1150Nm. 100% IM, 10% anual. Cheie hidraulică"},
{id:"PW21.5",name:"Structură pală",interval:"2ani",note:"Inspecție expert după 24 luni"},
{id:"PW21.6",name:"Senzor poziție motor pitch",interval:"sem",note:"Curățare. Test semnal: 89°=STOP, 90°=URGENȚĂ"},
{id:"PW21.7",name:"Rulment pală - buloane",interval:"sem",note:"M30 10.9 SW46=1650Nm. 100% IM, 10% anual"}
]},

{id:"pw22",title:"22 · Arbore rotor",icon:"🔄",items:[
{id:"PW22.1",name:"Arbore rotor",interval:"sem",note:"Coroziune. M36 SW55=2950Nm. 100% IM, 10% anual. >20% rotire = 100%"},
{id:"PW22.2",name:"Senzori inductivi arbore",interval:"sem",note:"Verificare fixare, curățare, degresare. Distanță 7mm"}
]},

{id:"pw23",title:"23 · Transformator",icon:"🔋",items:[
{id:"PW23.1",name:"Transformator",interval:"anual",hasResult:true,note:"PERICOL tensiune! Deconectare doar de electricieni autorizați. Curățenie, scurgeri ulei"}
]},

{id:"pw_blade_bolts",title:"Buloane pale",icon:"📝",items:[]},
{id:"pw_photos",title:"Fotografii",icon:"📸",items:[]},
{id:"pw_procedures",title:"Proceduri",icon:"📖",items:[]},
{id:"pw_signatures",title:"Semnături",icon:"✍️",items:[]}
];
