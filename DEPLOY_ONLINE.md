# 🌐 Ghid Deploy Online — MM92 Service Protocol
## Supabase + Vercel (ambele gratuite)

---

## Arhitectura

```
┌─────────────────────────────────────────────────┐
│  Tehnician 1 (tabletă)                          │
│  Tehnician 2 (laptop)         ← Browser →       │
│  Tehnician 3 (telefon)                          │
└──────────────┬──────────────────────────────────┘
               │ HTTPS
               ▼
┌──────────────────────────────┐
│  Vercel (hosting gratuit)    │
│  React App (frontend)        │
│  mm92.vercel.app             │
└──────────────┬───────────────┘
               │ API
               ▼
┌──────────────────────────────────────────────┐
│  Supabase (backend gratuit)                  │
│  ┌─────────────┐ ┌──────────┐ ┌───────────┐ │
│  │ PostgreSQL   │ │  Auth    │ │  Storage  │ │
│  │ (date)       │ │ (login)  │ │ (poze/pdf)│ │
│  └─────────────┘ └──────────┘ └───────────┘ │
└──────────────────────────────────────────────┘
```

**Limite gratuite (suficiente pentru voi):**
- Supabase: 500MB bază de date, 1GB storage, 50.000 useri
- Vercel: bandwidth nelimitat, deploy automat din Git

---

## PASUL 1 — Creare cont Supabase (5 minute)

1. Mergi la **https://supabase.com** → "Start your project"
2. Creează cont cu GitHub sau email
3. Click "New Project"
   - Organization: Blue Line Energy
   - Project name: `mm92-service`
   - Database password: *alege o parolă puternică și noteaz-o*
   - Region: **EU West (Ireland)** ← cel mai aproape de România
4. Așteaptă 1-2 minute pentru creare

---

## PASUL 2 — Creare tabele în baza de date (5 minute)

1. În Supabase Dashboard → **SQL Editor** (meniu stânga)
2. Click "New Query"
3. Copiază și rulează acest SQL:

```sql
-- ============================================
-- MM92 Service Protocol — Schema bază de date
-- ============================================

-- Tabel turbine (fiecare turbină = un set separat de date)
CREATE TABLE turbines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,                    -- ex: "WTG 3 (92692)"
  park TEXT NOT NULL,                    -- ex: "Cee Caierac (Blue 2)"
  location TEXT,
  commissioning_date TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel sesiuni service (un raport per vizită)
CREATE TABLE service_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  turbine_id UUID REFERENCES turbines(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'in_progress',     -- in_progress, completed, reviewed
  interval_type TEXT,                    -- '6 luni', '1 an', etc.
  report_data JSONB DEFAULT '{}',        -- date raport (ore, producție, etc.)
  check_data JSONB DEFAULT '{}',         -- toate checklisturile
  issues JSONB DEFAULT '[]',             -- puncte nerezolvate
  bolt_data JSONB DEFAULT '{}',          -- buloane pale
  inspection_data JSONB DEFAULT '{}',    -- inspecție pale
  signatures JSONB DEFAULT '{}',         -- semnături (base64)
  technician1 TEXT,
  technician2 TEXT,
  technician3 TEXT,
  verifier TEXT
);

-- Tabel fotografii (separate pentru performanță)
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES service_sessions(id) ON DELETE CASCADE,
  item_id TEXT,                          -- punctul de verificare asociat (ex: "4.1")
  section_id TEXT,                       -- secțiunea asociată
  caption TEXT,
  file_path TEXT,                        -- calea în Supabase Storage
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabel proceduri (PDF-uri partajate între toți)
CREATE TABLE procedures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,               -- calea în Supabase Storage
  file_size INTEGER,
  sections TEXT[] DEFAULT '{}',          -- secțiunile asociate
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabel bază de cunoștințe (text extras din manuale PDF)
CREATE TABLE knowledge_docs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,                    -- numele fișierului PDF
  size INTEGER,                          -- dimensiune KB
  pages INTEGER,                         -- număr pagini
  text_length INTEGER,                   -- lungime text extras
  text TEXT NOT NULL,                    -- textul complet extras din PDF
  added_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabel profil utilizator
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'technician',        -- technician, verifier, admin
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Politici de securitate (RLS)
-- ============================================

ALTER TABLE turbines ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Toți utilizatorii autentificați pot citi totul
CREATE POLICY "Authenticated read" ON turbines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read" ON service_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read" ON photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read" ON procedures FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read" ON knowledge_docs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read" ON profiles FOR SELECT TO authenticated USING (true);

-- Toți pot insera și actualiza
CREATE POLICY "Authenticated insert" ON turbines FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update" ON turbines FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated insert" ON service_sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update" ON service_sessions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated insert" ON photos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert" ON procedures FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update" ON procedures FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated insert" ON knowledge_docs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated delete" ON knowledge_docs FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated insert" ON profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update" ON profiles FOR UPDATE TO authenticated USING (true);

-- Funcție auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_turbines_updated_at
  BEFORE UPDATE ON turbines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON service_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

4. Click "Run" (sau Ctrl+Enter)

---

## PASUL 3 — Configurare Storage (2 minute)

1. Supabase Dashboard → **Storage** (meniu stânga)
2. Click "New Bucket"
   - Name: `photos` → Create
   - Public: **OFF**
3. Încă un bucket:
   - Name: `procedures` → Create
   - Public: **OFF**
4. Pentru fiecare bucket, tab "Policies" → "New Policy" → "For full customization":
   - Policy name: `Authenticated access`
   - Allowed operations: SELECT, INSERT, UPDATE, DELETE
   - Target roles: `authenticated`
   - USING expression: `true`
   - WITH CHECK expression: `true`

---

## PASUL 4 — Configurare Auth (2 minute)

1. Supabase Dashboard → **Authentication** → **Providers**
2. Email provider este activat default ✓
3. **Settings** → dezactivează "Confirm email" (pentru simplitate la început)
4. Creează utilizatorii manual:
   - **Authentication** → **Users** → "Add User"
   - Email: `tehnician1@bluelineenergy.ro`
   - Password: `parolaputernica123`
   - Repetă pentru fiecare tehnician

---

## PASUL 5 — Notează cheile API (1 minut)

1. Supabase Dashboard → **Settings** → **API**
2. Copiază:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon / public key**: `eyJhbGci...` (cheia lungă)

---

## PASUL 6 — Configurare proiect local (2 minute)

1. În folderul `mm92-app`, creează fișierul `.env`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci.....cheia_ta_aici
```

2. Instalează Supabase client:

```bash
cd mm92-app
npm install @supabase/supabase-js
```

---

## PASUL 7 — Deploy pe Vercel (5 minute)

### Varianta A: Cu GitHub (recomandat)

1. Creează cont pe **https://github.com** (dacă nu ai)
2. Creează un repository nou: `mm92-service`
3. Upload proiectul:
```bash
cd mm92-app
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/mm92-service.git
git push -u origin main
```
4. Mergi la **https://vercel.com** → "Import Project" → selectează repo-ul
5. La "Environment Variables" adaugă:
   - `VITE_SUPABASE_URL` = valoarea ta
   - `VITE_SUPABASE_ANON_KEY` = valoarea ta
6. Click "Deploy" → gata!

### Varianta B: Fără GitHub (upload direct)

1. Instalează Vercel CLI:
```bash
npm install -g vercel
```
2. Deploy:
```bash
cd mm92-app
vercel
```
3. Urmează instrucțiunile din terminal
4. Setează variabilele de mediu pe vercel.com → Settings

---

## PASUL 8 — Utilizare

Aplicația e live la adresa Vercel (ex: `mm92-service.vercel.app`).

Fiecare tehnician:
1. Deschide link-ul pe tabletă/laptop
2. Se autentifică cu email + parolă
3. Selectează turbina
4. Completează checklistul
5. Datele se sincronizează automat

---

## Întreținere

**Adăugare turbină nouă:** din aplicație sau din Supabase Dashboard → Table Editor → turbines → Insert Row

**Adăugare utilizator:** Supabase → Authentication → Users → Add User

**Backup:** Supabase Dashboard → Settings → Database → Download backup

**Monitorizare:** Supabase Dashboard arată utilizare storage, nr. requesturi, etc.

---

## Costuri

| Serviciu | Plan gratuit | Când plătești |
|----------|-------------|---------------|
| Supabase | 500MB DB, 1GB storage, 50k MAU | >500MB sau >1GB storage |
| Vercel | Nelimitat pentru proiecte personale | Dacă ai echipă >1 pe Vercel |

**Pentru 1-5 tehnicieni cu câteva turbine, planul gratuit e mai mult decât suficient.**

---

## Structura fișierelor noi

```
mm92-app/
├── .env                      ← cheile Supabase (NU se pune în Git!)
├── src/
│   ├── App.jsx               ← aplicația principală (modificată)
│   ├── main.jsx
│   ├── lib/
│   │   └── supabase.js       ← client Supabase
│   ├── hooks/
│   │   ├── useAuth.js        ← hook autentificare
│   │   └── useSession.js     ← hook sincronizare date
│   └── components/
│       └── Login.jsx         ← pagina de login
```
