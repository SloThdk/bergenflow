"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

/* ─── helpers ─── */
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function fmtDate(d: Date) { return d.toLocaleDateString("no-NO", { weekday: "short", day: "numeric", month: "short" }); }
function fmtFull(d: Date) { return d.toLocaleDateString("no-NO", { weekday: "long", day: "numeric", month: "long" }); }

/* ─── types ─── */
type Category = "HIIT" | "Yoga" | "Styrke" | "CrossFit" | "Spinning" | "Boksing" | "Pilates" | "Kondisjon";

interface ClassItem {
  id: string; name: string; category: Category; instructor: string;
  dayOffset: number; time: string; duration: number; maxSpots: number; spotsLeft: number;
  description: string; intensity: 1 | 2 | 3; color: string;
}

/* ─── class data ─── */
const CLASSES: ClassItem[] = [
  { id: "c1", name: "HIIT-Okt", category: "HIIT", instructor: "Erik Hansen", dayOffset: 0, time: "06:00", duration: 45, maxSpots: 20, spotsLeft: 3, description: "Intensiv intervalltrening med full kropp. Bruk av ketlebells, tau og kroppsvekt.", intensity: 3, color: "#EF4444" },
  { id: "c2", name: "Morgen-Yoga", category: "Yoga", instructor: "Lise Dahl", dayOffset: 0, time: "09:00", duration: 60, maxSpots: 18, spotsLeft: 8, description: "Rolig start pa dagen med Vinyasa-basert flyt. Passer alle nivaer.", intensity: 1, color: "#8B5CF6" },
  { id: "c3", name: "Styrkesirkel", category: "Styrke", instructor: "Mads Berg", dayOffset: 0, time: "12:00", duration: 50, maxSpots: 16, spotsLeft: 0, description: "Sirkeltrening med fokus pa sammensatte lovft. Vektene tilpasses ditt niva.", intensity: 2, color: "#F97316" },
  { id: "c4", name: "Spinning", category: "Spinning", instructor: "Sara Moe", dayOffset: 0, time: "18:00", duration: 45, maxSpots: 22, spotsLeft: 5, description: "Energisk innendors sykling med musikk. Interval- og utholdenhetsblokker.", intensity: 2, color: "#06B6D4" },
  { id: "c5", name: "Boksing", category: "Boksing", instructor: "Erik Hansen", dayOffset: 0, time: "19:30", duration: 60, maxSpots: 14, spotsLeft: 2, description: "Teknikk- og kondisjonstrening med boksesekkene. Bygger styrke og utholdenhet.", intensity: 3, color: "#DC2626" },
  { id: "c6", name: "Pilates", category: "Pilates", instructor: "Lise Dahl", dayOffset: 1, time: "07:00", duration: 50, maxSpots: 16, spotsLeft: 11, description: "Kjernetrening og fleksibilitet. Reformer og matte. Ideelt for restitusjon.", intensity: 1, color: "#EC4899" },
  { id: "c7", name: "CrossFit", category: "CrossFit", instructor: "Mads Berg", dayOffset: 1, time: "12:00", duration: 60, maxSpots: 18, spotsLeft: 0, description: "Dagens WOD: styrke, gymnastikk og metcon i kombinasjon. Skalert for alle.", intensity: 3, color: "#EAB308" },
  { id: "c8", name: "HIIT-Okt", category: "HIIT", instructor: "Sara Moe", dayOffset: 1, time: "17:30", duration: 45, maxSpots: 20, spotsLeft: 7, description: "Full gass i 45 minutter. Tabata-protokoll med rotasjonsstasjoner.", intensity: 3, color: "#EF4444" },
  { id: "c9", name: "Yin Yoga", category: "Yoga", instructor: "Lise Dahl", dayOffset: 1, time: "19:00", duration: 60, maxSpots: 18, spotsLeft: 14, description: "Dype strekkstillinger holdt over tid. Perfekt etter en hard treningsuke.", intensity: 1, color: "#8B5CF6" },
  { id: "c10", name: "Spinning", category: "Spinning", instructor: "Sara Moe", dayOffset: 2, time: "06:00", duration: 45, maxSpots: 22, spotsLeft: 9, description: "Morgenspinning med fokus pa teknikk og steady-state utholdenhet.", intensity: 2, color: "#06B6D4" },
  { id: "c11", name: "Styrke", category: "Styrke", instructor: "Mads Berg", dayOffset: 2, time: "09:30", duration: 50, maxSpots: 16, spotsLeft: 5, description: "Tung grunntrening: kneboyd, marklovft, benkpress, roing. Progressiv overbelastning.", intensity: 3, color: "#F97316" },
  { id: "c12", name: "Boksing", category: "Boksing", instructor: "Erik Hansen", dayOffset: 2, time: "12:00", duration: 60, maxSpots: 14, spotsLeft: 1, description: "Teknikktimer med fokus pa slag, forsvar og fotarbeid. Pardrills inkludert.", intensity: 3, color: "#DC2626" },
  { id: "c13", name: "CrossFit", category: "CrossFit", instructor: "Mads Berg", dayOffset: 2, time: "18:00", duration: 60, maxSpots: 18, spotsLeft: 4, description: "Open Gym-format: velg mellom programmerte WODs eller egentrening med veiledning.", intensity: 2, color: "#EAB308" },
  { id: "c14", name: "Pilates", category: "Pilates", instructor: "Lise Dahl", dayOffset: 2, time: "19:30", duration: 50, maxSpots: 16, spotsLeft: 10, description: "Reformer-Pilates for viderekomne. Kontroll, balanse og presisjon.", intensity: 2, color: "#EC4899" },
  { id: "c15", name: "Kondisjon", category: "Kondisjon", instructor: "Sara Moe", dayOffset: 3, time: "06:30", duration: 40, maxSpots: 20, spotsLeft: 12, description: "Lopeband, romaskin og assault bike i rotasjon. Bygg VO2max.", intensity: 3, color: "#14B8A6" },
  { id: "c16", name: "Yoga", category: "Yoga", instructor: "Lise Dahl", dayOffset: 3, time: "10:00", duration: 60, maxSpots: 18, spotsLeft: 6, description: "Hatha-yoga med fokus pa pustekontroll og grunnleggende stillinger.", intensity: 1, color: "#8B5CF6" },
  { id: "c17", name: "HIIT-Okt", category: "HIIT", instructor: "Erik Hansen", dayOffset: 3, time: "18:00", duration: 45, maxSpots: 20, spotsLeft: 0, description: "Eriks signaturtime: 30/15 intervaller, 6 stasjoner. Krav: pulsbelte.", intensity: 3, color: "#EF4444" },
  { id: "c18", name: "Styrke", category: "Styrke", instructor: "Mads Berg", dayOffset: 4, time: "07:00", duration: 60, maxSpots: 14, spotsLeft: 8, description: "Ovrekropp-fokus: militaerpress, pull-ups, dips, roing. Periodisert program.", intensity: 2, color: "#F97316" },
  { id: "c19", name: "Spinning", category: "Spinning", instructor: "Sara Moe", dayOffset: 4, time: "12:00", duration: 45, maxSpots: 22, spotsLeft: 15, description: "Lunsj-spinning. 45 min effektiv okt med bade intervall og klatring.", intensity: 2, color: "#06B6D4" },
  { id: "c20", name: "Boksing", category: "Boksing", instructor: "Erik Hansen", dayOffset: 4, time: "18:00", duration: 60, maxSpots: 14, spotsLeft: 3, description: "Sparring-okt for viderekomne. Krever minst 3 mnd bokseerfaring.", intensity: 3, color: "#DC2626" },
];

const CATEGORIES: Category[] = ["HIIT", "Yoga", "Styrke", "CrossFit", "Spinning", "Boksing", "Pilates", "Kondisjon"];
const intensityLabel = (n: 1|2|3) => n === 1 ? "Lett" : n === 2 ? "Moderat" : "Intensiv";
const intensityColor = (n: 1|2|3) => n === 1 ? "#22c55e" : n === 2 ? "#f59e0b" : "#ef4444";

export default function BookPage() {
  const router = useRouter();
  const [member, setMember] = useState<{ name: string; email: string } | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedCat, setSelectedCat] = useState<Category | "Alle">("Alle");
  const [confirm, setConfirm] = useState<ClassItem | null>(null);
  const [booked, setBooked] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("bf_member");
      if (!raw) { router.push("/"); return; }
      setMember(JSON.parse(raw));
      const b = sessionStorage.getItem("bf_bookings_flow");
      if (b) setBooked(JSON.parse(b));
    } catch { router.push("/"); }
  }, [router]);

  const days = Array.from({ length: 7 }, (_, i) => i);

  const filtered = CLASSES.filter(c => c.dayOffset === selectedDay && (selectedCat === "Alle" || c.category === selectedCat));

  function handleBook(cls: ClassItem) {
    if (cls.spotsLeft === 0 || booked.includes(cls.id)) return;
    setConfirm(cls);
  }

  function confirmBooking() {
    if (!confirm) return;
    const next = [...booked, confirm.id];
    setBooked(next);
    try { sessionStorage.setItem("bf_bookings_flow", JSON.stringify(next)); } catch {}
    setToast(`Bestilt: ${confirm.name} kl. ${confirm.time}`);
    setConfirm(null);
    setTimeout(() => setToast(""), 3500);
  }

  function cancelBooking(id: string) {
    const next = booked.filter(b => b !== id);
    setBooked(next);
    try { sessionStorage.setItem("bf_bookings_flow", JSON.stringify(next)); } catch {}
    setToast("Bestillingen er kansellert.");
    setTimeout(() => setToast(""), 3500);
  }

  if (!member) return null;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>

      {/* CONFIRM MODAL */}
      {confirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
          onClick={e => e.target === e.currentTarget && setConfirm(null)}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "420px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "18px" }}>Bekreft bestilling</h3>
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "18px", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: confirm.color, background: `${confirm.color}18`, padding: "3px 8px", borderRadius: "4px" }}>{confirm.category}</span>
                <span style={{ fontSize: "11px", fontWeight: 600, color: intensityColor(confirm.intensity) }}>{intensityLabel(confirm.intensity)}</span>
              </div>
              <div style={{ fontSize: "17px", fontWeight: 700, marginBottom: "6px" }}>{confirm.name}</div>
              <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                {confirm.instructor} &middot; kl. {confirm.time} &middot; {confirm.duration} min &middot; {fmtFull(addDays(today, confirm.dayOffset))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setConfirm(null)} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid var(--border-strong)", color: "var(--text-secondary)", fontWeight: 600 }}>Avbryt</button>
              <button onClick={confirmBooking} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "var(--orange)", color: "#fff", fontWeight: 700, fontSize: "14px" }}>Bekreft</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: "32px", left: "50%", transform: "translateX(-50%)", background: "var(--surface)", border: "1px solid var(--orange-border)", borderRadius: "10px", padding: "12px 24px", color: "var(--orange-light)", fontSize: "14px", fontWeight: 600, zIndex: 300, whiteSpace: "nowrap" }}>{toast}</div>
      )}

      {/* HEADER */}
      <header style={{ background: "rgba(13,27,42,0.97)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "28px", height: "28px", background: "var(--orange)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M2 9h4l2-6 2 12 2-6h4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "16px" }}>Bergen<span style={{ color: "var(--orange)" }}>Flow</span></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={() => router.push("/dashboard")} style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: 500 }}>Mine bestillinger</button>
            <button onClick={() => { try { sessionStorage.removeItem("bf_member"); sessionStorage.removeItem("bf_bookings_flow"); } catch {} router.push("/"); }}
              style={{ color: "var(--text-muted)", fontSize: "13px" }}>Logg ut</button>
          </div>
        </div>
      </header>

      {/* PAGE */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "6px" }}>Book en time</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Velkommen, {member.name} — velg dag og kategori for a finne din neste okt.</p>
        </div>

        {/* DAY PICKER */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "16px", paddingBottom: "4px" }}>
          {days.map(d => {
            const date = addDays(today, d);
            const isSelected = selectedDay === d;
            return (
              <button key={d} onClick={() => setSelectedDay(d)} style={{
                minWidth: "80px", padding: "12px 10px", borderRadius: "10px", textAlign: "center",
                background: isSelected ? "var(--orange)" : "var(--surface)",
                border: isSelected ? "none" : "1px solid var(--border-strong)",
                color: "#fff", flexShrink: 0,
              }}>
                <div style={{ fontSize: "11px", fontWeight: 500, color: isSelected ? "rgba(255,255,255,0.7)" : "var(--text-muted)", textTransform: "capitalize" }}>
                  {d === 0 ? "I dag" : d === 1 ? "I morgen" : date.toLocaleDateString("no-NO", { weekday: "short" })}
                </div>
                <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "var(--font-syne)" }}>{date.getDate()}</div>
                <div style={{ fontSize: "10px", color: isSelected ? "rgba(255,255,255,0.6)" : "var(--text-muted)", textTransform: "capitalize" }}>{date.toLocaleDateString("no-NO", { month: "short" })}</div>
              </button>
            );
          })}
        </div>

        {/* CATEGORY FILTER */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "24px" }}>
          <button onClick={() => setSelectedCat("Alle")} style={{
            padding: "7px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
            background: selectedCat === "Alle" ? "var(--orange)" : "var(--surface)",
            border: selectedCat === "Alle" ? "none" : "1px solid var(--border-strong)",
            color: "#fff",
          }}>Alle</button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCat(cat)} style={{
              padding: "7px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
              background: selectedCat === cat ? "var(--orange)" : "var(--surface)",
              border: selectedCat === cat ? "none" : "1px solid var(--border-strong)",
              color: "#fff",
            }}>{cat}</button>
          ))}
        </div>

        {/* CLASS LIST */}
        {filtered.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "15px" }}>Ingen klasser funnet for denne dagen{selectedCat !== "Alle" ? ` i kategorien ${selectedCat}` : ""}.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map(cls => {
              const isFull = cls.spotsLeft === 0;
              const isBooked = booked.includes(cls.id);
              const spotsPercent = ((cls.maxSpots - cls.spotsLeft) / cls.maxSpots) * 100;
              return (
                <div key={cls.id} style={{
                  background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px",
                  padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexWrap: "wrap", gap: "14px", opacity: isFull && !isBooked ? 0.65 : 1,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "18px", flex: 1, minWidth: "240px" }}>
                    <div style={{ textAlign: "center", minWidth: "52px" }}>
                      <div style={{ fontFamily: "var(--font-syne)", fontSize: "18px", fontWeight: 800, color: "var(--text)" }}>{cls.time}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{cls.duration} min</div>
                    </div>
                    <div style={{ width: "4px", height: "40px", background: cls.color, borderRadius: "2px", flexShrink: 0 }}/>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 700, fontSize: "15px" }}>{cls.name}</span>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: intensityColor(cls.intensity), background: `${intensityColor(cls.intensity)}15`, padding: "2px 6px", borderRadius: "3px" }}>{intensityLabel(cls.intensity)}</span>
                      </div>
                      <div style={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: "4px" }}>{cls.instructor}</div>
                      <p style={{ color: "var(--text-secondary)", fontSize: "12px", lineHeight: 1.5, maxWidth: "420px" }}>{cls.description}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ textAlign: "right", minWidth: "100px" }}>
                      <div style={{ display: "flex", gap: "3px", justifyContent: "flex-end", marginBottom: "4px" }}>
                        {Array.from({ length: 10 }, (_, i) => (
                          <div key={i} style={{ width: "4px", height: "12px", borderRadius: "1px", background: i < Math.round(spotsPercent / 10) ? cls.color : "rgba(255,255,255,0.08)" }}/>
                        ))}
                      </div>
                      <div style={{ fontSize: "11px", color: isFull ? "#f87171" : cls.spotsLeft <= 3 ? "#fb923c" : "var(--text-muted)" }}>
                        {isFull ? "Fullt" : `${cls.spotsLeft} av ${cls.maxSpots} plasser`}
                      </div>
                    </div>
                    {isBooked ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#86efac", background: "rgba(74,222,128,0.1)", padding: "7px 16px", borderRadius: "6px", border: "1px solid rgba(74,222,128,0.25)" }}>Bestilt</span>
                        <button onClick={() => cancelBooking(cls.id)} style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "underline", background: "none" }}>Avbestill</button>
                      </div>
                    ) : (
                      <button onClick={() => isFull ? setToast("Fullt — du er satt pa ventelisten!") : handleBook(cls)}
                        style={{
                          padding: "9px 20px", borderRadius: "7px", fontSize: "13px", fontWeight: 600,
                          background: isFull ? "transparent" : "var(--orange)", color: isFull ? "var(--text-muted)" : "#fff",
                          border: isFull ? "1px solid var(--border-strong)" : "none",
                        }}>
                        {isFull ? "Venteliste" : "Bestill"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FLOATING BUILT BY */}
      <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer"
        style={{ position: "fixed", bottom: "24px", right: "24px", background: "var(--orange)", color: "#fff", borderRadius: "100px", padding: "10px 18px", fontSize: "12px", fontWeight: 700, boxShadow: "0 4px 20px rgba(232,93,4,0.4)", zIndex: 50, textDecoration: "none", whiteSpace: "nowrap" }}>
        Bygget av Sloth Studio &rarr;
      </a>
    </div>
  );
}
