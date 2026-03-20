// src/components/VisualGallery.jsx — Visual reference gallery for AI component recognition
import { useState, useRef, useEffect } from "react";
import { Camera, Eye, Trash2, Tag, Search } from "lucide-react";
import { supabase, isOnline } from "../lib/supabase";

const GALLERY_KEY = "mm92_visual_gallery";
const CATEGORIES = [
  "Gearbox", "Generator", "Rulment principal", "Sistem hidraulic",
  "Frâne", "Cuplaj", "Cutie viteze", "Sistem pitch",
  "Sistem yaw", "Convertor", "Tablou electric", "Nacela",
  "Turn", "Pale", "Hub/Butuc", "Transformator",
  "Senzori", "Cabluri", "Filtru ulei", "Răcire",
  "Altele"
];

export default function VisualGallery({ T }) {
  const [images, setImages] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const camRef = useRef(null);
  const galRef = useRef(null);

  // Load from cloud or local
  useEffect(() => {
    (async () => {
      if (isOnline() && supabase) {
        try {
          const { data } = await supabase.from('cloud_data').select('data').eq('id', GALLERY_KEY).single();
          if (data?.data) { setImages(data.data); setLoading(false); return; }
        } catch {}
      }
      try { const d = JSON.parse(localStorage.getItem(GALLERY_KEY) || "[]"); setImages(d); } catch {}
      setLoading(false);
    })();
  }, []);

  // Save
  const save = (newImages) => {
    setImages(newImages);
    try { localStorage.setItem(GALLERY_KEY, JSON.stringify(newImages)); } catch {}
    if (isOnline() && supabase) {
      supabase.from('cloud_data').upsert({ id: GALLERY_KEY, data: newImages, updated_at: new Date().toISOString() }, { onConflict: 'id' }).catch(() => {});
    }
  };

  // Add image
  const handleFiles = (files) => {
    Array.from(files).forEach(f => {
      if (!f.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image(); img.onload = () => {
          const c = document.createElement("canvas"); const M = 800; let w = img.width, h = img.height;
          if (w > M || h > M) { const r = Math.min(M / w, M / h); w *= r; h *= r; }
          c.width = w; c.height = h; c.getContext("2d").drawImage(img, 0, 0, w, h);
          const newImg = {
            id: Date.now() + Math.random(),
            data: c.toDataURL("image/jpeg", 0.8),
            name: f.name,
            label: "",
            category: "Altele",
            description: "",
            turbineType: "",
            date: new Date().toLocaleDateString("ro-RO")
          };
          setEditing(newImg);
        }; img.src = ev.target.result;
      }; reader.readAsDataURL(f);
    });
  };

  const saveImage = (img) => { save([img, ...images.filter(x => x.id !== img.id)]); setEditing(null); };
  const deleteImage = (id) => { if (confirm("Ștergeți imaginea de referință?")) save(images.filter(x => x.id !== id)); };

  // Filter
  const filtered = images.filter(img => {
    if (filter && img.category !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (img.label + img.description + img.category + img.turbineType).toLowerCase().includes(q);
    }
    return true;
  });

  // ─── EDIT DIALOG ───
  if (editing) {
    const E = editing;
    const U = (k, v) => setEditing({ ...E, [k]: v });
    const inp = { width: "100%", padding: "10px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, background: T.surface, color: T.text, fontFamily: "inherit" };
    return (
      <div>
        <h2 style={{ fontSize: 18, color: T.text, marginBottom: 12 }}>Adaugă referință vizuală</h2>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ width: 260, flexShrink: 0 }}>
            <img src={E.data} alt="" style={{ width: "100%", borderRadius: 10, border: `1px solid ${T.border}` }} />
          </div>
          <div style={{ flex: 1, minWidth: 240, display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: T.textSec, textTransform: "uppercase", letterSpacing: "0.5px" }}>Denumire componentă</label>
              <input value={E.label} onChange={e => U("label", e.target.value)} placeholder="ex: Gearbox Hansen - vedere laterală" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: T.textSec, textTransform: "uppercase", letterSpacing: "0.5px" }}>Categorie</label>
              <select value={E.category} onChange={e => U("category", e.target.value)} style={inp}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: T.textSec, textTransform: "uppercase", letterSpacing: "0.5px" }}>Tip turbină</label>
              <select value={E.turbineType} onChange={e => U("turbineType", e.target.value)} style={inp}>
                <option value="">— Ambele —</option>
                <option value="MM92">Senvion MM92</option>
                <option value="PW56">PowerWind PW56</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: T.textSec, textTransform: "uppercase", letterSpacing: "0.5px" }}>Descriere / detalii tehnice</label>
              <textarea value={E.description} onChange={e => U("description", e.target.value)} rows={3} placeholder="ex: Vedere din partea stângă, vizibil filtru ulei și pompă lubrifiere. Producător Hansen, model P4. Capacitate 185l ulei." style={{ ...inp, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button onClick={() => saveImage(E)} disabled={!E.label} style={{ flex: 1, padding: "12px", background: E.label ? T.accent : T.border, color: "#fff", border: "none", borderRadius: 8, cursor: E.label ? "pointer" : "not-allowed", fontWeight: 600, fontSize: 14 }}>Salvează referință</button>
              <button onClick={() => setEditing(null)} style={{ padding: "12px 20px", border: `1px solid ${T.border}`, borderRadius: 8, background: T.surface, color: T.text, cursor: "pointer" }}>Anulează</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN VIEW ───
  return (
    <div>
      <h2 style={{ fontSize: 18, color: T.text, marginBottom: 4 }}>Galerie Referință Vizuală</h2>
      <div style={{ fontSize: 13, color: T.textSec, marginBottom: 14 }}>
        Încărcați poze etichetate cu componente — AI-ul le folosește pentru recunoaștere mai precisă.
      </div>

      {/* Upload */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button onClick={() => camRef.current?.click()} style={{ padding: "10px 18px", border: `2px dashed ${T.accent}44`, borderRadius: 10, background: `${T.accent}08`, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: T.accent }}>
          <Camera size={18} /> Cameră
        </button>
        <button onClick={() => galRef.current?.click()} style={{ padding: "10px 18px", border: `2px dashed ${T.border}`, borderRadius: 10, background: T.surfaceAlt, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: T.text }}>
          <Eye size={18} /> Din galerie
        </button>
        <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={e => { if (e.target.files) handleFiles(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
        <input ref={galRef} type="file" accept="image/*" multiple onChange={e => { if (e.target.files) handleFiles(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}><Tag size={14} /> {images.length} referințe</span>
      </div>

      {/* Filters */}
      {images.length > 0 && <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <Search size={16} color={T.textMuted} style={{ position: "absolute", left: 10, top: 11 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Caută componente..."
            style={{ width: "100%", padding: "8px 10px 8px 34px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, background: T.surface, color: T.text }} />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, background: T.surface, color: T.text }}>
          <option value="">Toate categoriile</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>}

      {/* Grid */}
      {loading && <div style={{ padding: 20, textAlign: "center", color: T.textMuted }}>Se încarcă...</div>}
      {!loading && filtered.length === 0 && <div style={{ padding: 28, textAlign: "center", color: T.textMuted, background: T.surfaceAlt, borderRadius: 10, fontSize: 14 }}>
        {images.length === 0 ? "Fără referințe vizuale. Fotografiați componente și etichetați-le." : "Nicio potrivire pentru filtrul selectat."}
      </div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200,1fr))", gap: 10 }}>
        {filtered.map(img => (
          <div key={img.id} style={{ background: T.surfaceAlt, borderRadius: 10, overflow: "hidden", border: `1px solid ${T.border}`, transition: "transform 0.15s", cursor: "pointer" }}
            onClick={() => setEditing(img)}>
            <img src={img.data} alt={img.label} style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
            <div style={{ padding: "8px 10px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.label || "Fără etichetă"}</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: `${T.accent}18`, color: T.accent, fontWeight: 600 }}>{img.category}</span>
                {img.turbineType && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: `${T.ok}18`, color: T.ok, fontWeight: 600 }}>{img.turbineType}</span>}
              </div>
              {img.description && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{img.description}</div>}
            </div>
            <button onClick={e => { e.stopPropagation(); deleteImage(img.id); }} style={{ width: "100%", padding: "6px", border: "none", borderTop: `1px solid ${T.border}`, background: "transparent", cursor: "pointer", color: T.nok, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Trash2 size={12} /> Șterge
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Export for AI context building
export function buildVisualContext() {
  try {
    const images = JSON.parse(localStorage.getItem(GALLERY_KEY) || "[]");
    if (!images.length) return "";
    let ctx = "\n\n=== GALERIE REFERINȚĂ VIZUALĂ ===\n";
    ctx += `${images.length} imagini de referință disponibile:\n`;
    images.forEach((img, i) => {
      ctx += `\n#${i + 1} [${img.category}] ${img.label}`;
      if (img.turbineType) ctx += ` (${img.turbineType})`;
      if (img.description) ctx += `\n  ${img.description}`;
    });
    return ctx;
  } catch { return ""; }
}
