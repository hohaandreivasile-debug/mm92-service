# 🌀 Protocol Mentenanță Senvion MM92
## Blue Line Energy — Aplicație Service Digitală

### Cerințe
- **Node.js** versiunea 18 sau mai nouă — descărcare: https://nodejs.org/
- Browser modern: Chrome, Edge, sau Firefox

---

### Instalare și pornire (3 pași)

**1. Deschide terminal/cmd în acest folder:**
```bash
cd mm92-app
```

**2. Instalează dependențele (o singură dată):**
```bash
npm install
```

**3. Pornește aplicația:**
```bash
npm start
```

Aplicația se deschide automat în browser la `http://localhost:3000`

---

### Utilizare pe tabletă / alt dispozitiv în rețeaua locală

La pornire, în terminal apare o adresă de tipul:
```
Network: http://192.168.x.x:3000
```
Deschide acea adresă pe tabletă/telefon (trebuie să fie în aceeași rețea WiFi).

---

### Salvarea datelor

- **Auto-save**: datele se salvează automat în browser (localStorage) la fiecare modificare
- **Salvează în folder**: buton în sidebar → alege locația pe disc → fișier .json complet
- **Încarcă**: buton în sidebar → selectează un fișier .json salvat anterior
- **Export PDF**: generează raportul complet pentru print/arhivare

---

### Structura fișierelor salvate

```
MM92_WTG_3__92692__2025-07-15.json    ← date complete, inclusiv poze și semnături
```

Fișierul JSON conține toate datele: raport, checklisturi, observații, buloane, fotografii (base64), semnături, proceduri.

---

### Build pentru offline (fără server)

```bash
npm run build
```

Creează folderul `dist/` cu fișiere statice. Deschide `dist/index.html` direct în browser — funcționează complet offline.

---

### Resetare date

Butonul "Resetare" din sidebar șterge toate datele. Salvați înainte!

---

### Structura proiectului

```
mm92-app/
├── package.json          ← dependențe
├── vite.config.js        ← configurare build
├── index.html            ← pagina principală
├── src/
│   ├── main.jsx          ← punct de intrare React
│   └── App.jsx           ← aplicația completă
├── start.bat             ← pornire Windows (dublu-click)
├── start.sh              ← pornire Linux/Mac
└── README.md             ← acest fișier
```
