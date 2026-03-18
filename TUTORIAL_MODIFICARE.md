# 🔧 Tutorial: Cum modific aplicația MM92

Acest ghid explică pas cu pas cum să modifici meniuri, secțiuni, puncte de verificare 
și alte elemente — fără cunoștințe avansate de programare.

**Fișierul pe care îl modifici: `src/App.jsx`**

Deschide-l cu orice editor de text (Notepad++, VS Code, sau chiar Notepad).

---

## 1. Structura meniurilor (SECTIONS)

Toate secțiunile din sidebar sunt definite la începutul fișierului `App.jsx` 
în array-ul `SECTIONS`. Căutați textul:

```
const SECTIONS=[
```

Fiecare secțiune arată astfel:

```javascript
{
  id: "s1",                    // ID unic (folosit intern)
  title: "1 · Controale generale",   // Ce apare în meniu
  icon: "🔍",                 // Icon (folosit doar în PDF)
  items: [...]                 // Punctele de verificare
}
```

### Adăugare secțiune nouă

Adăugați un nou obiect în array, **înainte de** `blade_bolts`:

```javascript
{id:"s_nou", title:"35 · Secțiunea Mea", icon:"🆕", items:[
  {id:"35.1", name:"Primul punct de verificare", interval:"sem"},
  {id:"35.2", name:"Al doilea punct", interval:"anual", note:"O notă importantă"},
]},
```

### Ștergere secțiune

Ștergeți blocul `{id:"...", title:"...", items:[...]}` inclusiv virgula de după.

### Redenumire secțiune

Modificați câmpul `title`:
```javascript
// Înainte:
{id:"s1", title:"1 · Controale generale", ...}

// După:
{id:"s1", title:"1 · Verificări generale de stare", ...}
```

---

## 2. Punctele de verificare (items)

Fiecare `item` din array-ul `items` al unei secțiuni are aceste câmpuri:

```javascript
{
  id: "4.1",           // OBLIGATORIU: cod unic (apare în app și PDF)
  name: "Verificare vizuală rulmenți",  // OBLIGATORIU: text afișat
  interval: "anual",   // Interval de service (vezi mai jos)
  note: "Text ajutător",  // Opțional: apare italic sub nume
  
  // Câmpuri speciale (opționale — adaugă doar ce ai nevoie):
  hasResult: true,         // Selector "În regulă" / "Probleme"
  hasValueField: true,     // Câmp text pentru valoare numerică
  valueLabel: "kg",        // Eticheta câmpului de valoare
  hasTextField: true,      // Câmp text liber
  hasDateField: true,      // Selector de dată
  hasRCD: true,            // 3 câmpuri: mA, V, ms
  
  // Sub-puncte (opțional):
  subs: [
    {id: "4.1a", name: "Sub-punct 1", hasResult: true},
    {id: "4.1b", name: "Sub-punct 2", hasValueField: true, valueLabel: "mm"}
  ]
}
```

### Valori posibile pentru `interval`:

| Valoare     | Ce apare    | Culoare |
|-------------|-------------|---------|
| `"sem"`     | 6 luni      | Albastru |
| `"anual"`   | Anual       | Verde   |
| `"2ani"`    | 2 ani       | Portocaliu |
| `"3ani"`    | 3 ani       | Portocaliu |
| `"5ani"`    | 5 ani       | Roșu    |
| `"10ani"`   | 10 ani      | Violet  |
| `"prim"`    | Prim serv.  | Roz     |
| `"necesitate"` | Necesitate | Gri   |

### Exemple practice

**Adăugare punct simplu (doar checkbox + observații):**
```javascript
{id:"9.16", name:"Verificare temperatură reductor", interval:"sem"}
```

**Punct cu valoare numerică:**
```javascript
{id:"9.17", name:"Nivel ulei hidraulic", interval:"sem", 
 hasValueField:true, valueLabel:"litri"}
```

**Punct cu rezultat + notă:**
```javascript
{id:"9.18", name:"Test funcțional pompă", interval:"anual", 
 hasResult:true, note:"Verificare la 50% și 100% sarcină"}
```

**Punct cu sub-puncte:**
```javascript
{id:"9.19", name:"Verificare senzori temperatură", interval:"sem",
 subs:[
   {id:"9.19a", name:"Senzor T1 (rulment)", hasValueField:true, valueLabel:"°C"},
   {id:"9.19b", name:"Senzor T2 (ulei)", hasValueField:true, valueLabel:"°C"},
   {id:"9.19c", name:"Senzor T3 (bobinaj)", hasValueField:true, valueLabel:"°C"}
 ]
}
```

**Punct cu măsurare RCD:**
```javascript
{id:"23.7", name:"RCD priză serviciu nivel 3", interval:"anual", hasRCD:true}
```

---

## 3. Modificare icoane

Icoanele sunt definite în două locuri:

### Icoane în aplicație (Lucide React + SVG custom)

Căutați `ICON_MAP`:

```javascript
const ICON_MAP = {
  s1: Search,        // Lucide icon
  s2: BladeIcon,     // SVG custom
  // ...
};
```

**Icoane Lucide disponibile** (deja importate):
- ClipboardList, AlertTriangle, BarChart3, ShieldCheck, Search
- Wrench, Settings, RotateCcw, Lock, Link2, Box
- Droplets, Wind, Compass, ArrowUpDown, Plug
- Home, Building, ArrowUp, Server, Thermometer
- FileCheck, Eye, Camera, PenTool, FileText, BookOpen

Pentru secțiuni noi, adăugați linia:
```javascript
s_nou: Wrench,   // sau orice icon din lista de mai sus
```

### Icoane în PDF (emoji-uri)

Căutați `ICON_PDF`:
```javascript
const ICON_PDF = {
  s1: "🔍",
  s_nou: "🆕",   // adăugați aici
};
```

---

## 4. Adăugare interval nou

Dacă aveți nevoie de un interval care nu există (ex: "4 ani"):

### Pas 1: Adăugați în etichetele de interval
Căutați `const IL=` și adăugați:
```javascript
const IL={sem:"6 luni", anual:"Anual", "2ani":"2 ani", "4ani":"4 ani", ...};
```

### Pas 2: Adăugați culoarea
Căutați `const IC=` și adăugați:
```javascript
const IC={sem:"#2563eb", anual:"#059669", "4ani":"#8b5cf6", ...};
```

### Pas 3: Folosiți în items
```javascript
{id:"99.1", name:"Test special", interval:"4ani"}
```

---

## 5. Modificare teme de culoare

Căutați `const THEMES = {` pentru a vedea toate temele.

### Adăugare temă nouă

Adăugați un nou obiect în `THEMES`:

```javascript
industrial: { 
  name:"Industrial", label:"🏭 Industrial",
  bg:"#f5f0e8",         // fundal principal
  surface:"#fffef8",     // carduri
  surfaceAlt:"#f0ebe0",  // fundal alternativ
  sidebar:"#2a2520",     // sidebar
  sidebarActive:"#4a3f35", // sidebar activ
  sidebarText:"#8a7f70", // text sidebar
  sidebarActiveText:"#e8d8c0", // text activ sidebar
  text:"#2a2520",        // text principal
  textSec:"#5a5040",     // text secundar
  textMuted:"#8a7f70",   // text slab
  border:"#d8d0c0",      // borduri
  accent:"#c07020",      // culoare accent
  accentLight:"#f8e8d0", // accent deschis
  ok:"#3a8a30",          // verde OK
  okBg:"#e8f8e0",        // fundal OK
  nok:"#c03020",         // roșu NOK
  nokBg:"#f8e0e0",       // fundal NOK
  warn:"#b08020",        // galben avertisment
  warnBg:"#f8f0d8",      // fundal avertisment
  cardShadow:"0 1px 4px rgba(0,0,0,0.08)"
},
```

---

## 6. Adăugare pagină specială (fără checklist)

Secțiunile cu `items:[]` (array gol) sunt pagini speciale. 
Exemplu: "Raport", "Fotografii", "Semnături".

### Pas 1: Adăugați secțiunea
```javascript
{id:"my_page", title:"Pagina mea", icon:"📌", items:[]},
```

### Pas 2: Adăugați icoanele
```javascript
// În ICON_MAP:
my_page: ClipboardList,
// În ICON_PDF:
my_page: "📌",
```

### Pas 3: Adăugați componenta de randare

În funcția `App`, căutați blocul cu `{as==="signatures"&&...}` și 
adăugați imediat după:

```javascript
{as==="my_page"&&<div>
  <h2 style={{fontSize:18,color:T.text}}>Titlu pagină</h2>
  <p style={{color:T.textSec}}>Conținut aici...</p>
</div>}
```

---

## 7. Modificare Raport de Service (câmpurile din prima pagină)

Căutați `{as==="report"&&` pentru a găsi formularul.

### Adăugare câmp nou:
```javascript
<Fld label="Nr. inventar" k="nrInventar"/>
```

Câmpul `k` este cheia internă — poate fi orice text fără spații.
Valoarea se salvează automat în `rp.nrInventar`.

---

## 8. Modificare text PDF export

Căutați `function genPDF` pentru funcția de generare PDF.

### Header PDF:
```javascript
h+=`<div class="logo">BLUE LINE ENERGY</div>`
```
Modificați textul direct.

### Adăugare câmpuri noi în PDF:
Căutați array-ul cu `[["Parc",rp.parc],` și adăugați:
```javascript
["Nr.inventar",rp.nrInventar],
```

---

## 9. Structura completă a unui item (referință)

```javascript
{
  // === Obligatorii ===
  id: "X.Y",              // String - cod unic
  name: "Nume operațiune", // String - text afișat

  // === Opționale ===
  interval: "sem",         // String - interval service
  note: "Text ajutător",   // String - notă tehnică

  // === Câmpuri interactive (true/false) ===
  hasResult: true,         // Dropdown: OK / Probleme
  hasValueField: true,     // Input text + label
  valueLabel: "unitate",   // Label pentru valueField
  hasTextField: true,      // Input text liber
  hasDateField: true,      // Input date picker
  hasRCD: true,            // 3 inputuri: mA, V, ms
  hasBoltCheck: true,      // Marker pentru secțiune buloane

  // === Sub-puncte ===
  subs: [                  // Array de items (aceeași structură)
    {id: "X.Ya", name: "Sub-punct", ...},
  ]
}
```

---

## 10. Workflow: Editare → Test → Deploy

### 1. Editați fișierul
Deschideți `src/App.jsx` în editor.

### 2. Testați local
```bash
npm start
```
Browserul se reîncarcă automat la salvare (hot reload).

### 3. Verificați
- Navigați la secțiunea modificată
- Testați checkboxurile, câmpurile
- Testați Export PDF
- Testați pe tabletă (folosiți adresa Network din terminal)

### 4. Deploy
Dacă folosiți Vercel + GitHub:
```bash
git add .
git commit -m "Adaugat sectiune noua"
git push
```
Vercel face deploy automat în 1-2 minute.

---

## Exemple complete: Copiere & modificare

### Exemplu: Adaug secțiune "Sistem SCADA"

1. În `SECTIONS`, înainte de `blade_bolts`, adaug:
```javascript
{id:"s_scada", title:"35 · Sistem SCADA", icon:"💻", items:[
  {id:"35.1",name:"Verificare conectivitate",interval:"sem",hasResult:true},
  {id:"35.2",name:"Backup configurație",interval:"anual"},
  {id:"35.3",name:"Verificare alarme active",interval:"sem",note:"Documentați alarmele nerezolvate"},
  {id:"35.4",name:"Actualizare software",interval:"anual",hasTextField:true},
  {id:"35.5",name:"Verificare senzori CMS",interval:"sem",
    subs:[
      {id:"35.5a",name:"Senzor vibrații nacelle",hasResult:true},
      {id:"35.5b",name:"Senzor temperatură ulei",hasValueField:true,valueLabel:"°C"},
      {id:"35.5c",name:"Senzor turație rotor",hasResult:true}
    ]
  }
]},
```

2. În `ICON_MAP` adaug:
```javascript
s_scada: Plug,
```

3. În `ICON_PDF` adaug:
```javascript
s_scada: "💻",
```

Gata! Secțiunea apare imediat în sidebar cu 8 puncte de verificare.

---

## Sfaturi

- **Nu ștergeți virgulele** între elemente — JavaScript dă eroare
- **Testați după fiecare modificare** — salvați fișierul și verificați în browser
- **Backup**: copiați `App.jsx` înainte de modificări majore
- **ID-uri unice**: fiecare item trebuie să aibă un `id` diferit
- Dacă aplicația nu pornește, verificați consola browser (F12) pentru erori
