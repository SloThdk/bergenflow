"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function fmtDate(d: Date) { return d.toLocaleDateString("no-NO", { weekday: "long", day: "numeric", month: "long" }); }

interface ClassEntry {
  id: string; name: string; time: string; duration: number; dayOffset: number;
  category: string; color: string; maxSpots: number; attendees: string[];
}

const TRAINERS = ["Erik Hansen", "Lise Dahl", "Mads Berg", "Sara Moe"];

const ALL_CLASSES: (ClassEntry & { instructor: string })[] = [
  { id: "c1", name: "HIIT-Okt", instructor: "Erik Hansen", time: "06:00", duration: 45, dayOffset: 0, category: "HIIT", color: "#EF4444", maxSpots: 20, attendees: ["Anna K.", "Thomas B.", "Nina S.", "Ole J.", "Maria L.", "Henrik F.", "Kari R.", "Per A.", "Ingrid M.", "Lars H.", "Camilla O.", "Anders T.", "Sofie W.", "Jon D.", "Kristin E.", "Eirik B.", "Hanna G."] },
  { id: "c5", name: "Boksing", instructor: "Erik Hansen", time: "19:30", duration: 60, dayOffset: 0, category: "Boksing", color: "#DC2626", maxSpots: 14, attendees: ["Magnus V.", "Emma L.", "Jakob R.", "Silje N.", "Trond K.", "Live M.", "Petter O.", "Ida B.", "Martin S.", "Tuva H.", "Sander J.", "Nora F."] },
  { id: "c12", name: "Boksing", instructor: "Erik Hansen", time: "12:00", duration: 60, dayOffset: 2, category: "Boksing", color: "#DC2626", maxSpots: 14, attendees: ["Ola N.", "Mette K.", "Bjorn H.", "Ane S.", "Fredrik L.", "Randi M.", "Steinar O.", "Guro P.", "Espen R.", "Vibeke T.", "Harald B.", "Lena W.", "Dag A."] },
  { id: "c17", name: "HIIT-Okt", instructor: "Erik Hansen", time: "18:00", duration: 45, dayOffset: 3, category: "HIIT", color: "#EF4444", maxSpots: 20, attendees: Array.from({ length: 20 }, (_, i) => `Medlem ${i + 1}`) },
  { id: "c20", name: "Boksing", instructor: "Erik Hansen", time: "18:00", duration: 60, dayOffset: 4, category: "Boksing", color: "#DC2626", maxSpots: 14, attendees: ["Mats G.", "Hilde V.", "Roar S.", "Ellen K.", "Svein J.", "Greta B.", "Asbjorn L.", "Tone N.", "Arvid P.", "Monica R.", "Ivar T."] },
  { id: "c2", name: "Morgen-Yoga", instructor: "Lise Dahl", time: "09:00", duration: 60, dayOffset: 0, category: "Yoga", color: "#8B5CF6", maxSpots: 18, attendees: ["Solveig K.", "Karen M.", "Ruth B.", "Astrid L.", "Berit N.", "Gunhild O.", "Marit P.", "Sigrid R.", "Torill S.", "Wenche T."] },
  { id: "c6", name: "Pilates", instructor: "Lise Dahl", time: "07:00", duration: 50, dayOffset: 1, category: "Pilates", color: "#EC4899", maxSpots: 16, attendees: ["Heidi A.", "Cathrine B.", "Anette C.", "Birgit D.", "Eva F."] },
  { id: "c9", name: "Yin Yoga", instructor: "Lise Dahl", time: "19:00", duration: 60, dayOffset: 1, category: "Yoga", color: "#8B5CF6", maxSpots: 18, attendees: ["Marianne G.", "Ragnhild H.", "Synnove I.", "Jorunn J."] },
  { id: "c14", name: "Pilates", instructor: "Lise Dahl", time: "19:30", duration: 50, dayOffset: 2, category: "Pilates", color: "#EC4899", maxSpots: 16, attendees: ["Lisa K.", "Trine L.", "Bente M.", "Helene N.", "Grethe O.", "Siv P."] },
  { id: "c16", name: "Yoga", instructor: "Lise Dahl", time: "10:00", duration: 60, dayOffset: 3, category: "Yoga", color: "#8B5CF6", maxSpots: 18, attendees: Array.from({ length: 12 }, (_, i) => `Yogadeltaker ${i + 1}`) },
  { id: "c3", name: "Styrkesirkel", instructor: "Mads Berg", time: "12:00", duration: 50, dayOffset: 0, category: "Styrke", color: "#F97316", maxSpots: 16, attendees: Array.from({ length: 16 }, (_, i) => `Deltaker ${i + 1}`) },
  { id: "c7", name: "CrossFit", instructor: "Mads Berg", time: "12:00", duration: 60, dayOffset: 1, category: "CrossFit", color: "#EAB308", maxSpots: 18, attendees: Array.from({ length: 18 }, (_, i) => `WOD-deltaker ${i + 1}`) },
  { id: "c11", name: "Styrke", instructor: "Mads Berg", time: "09:30", duration: 50, dayOffset: 2, category: "Styrke", color: "#F97316", maxSpots: 16, attendees: Array.from({ length: 11 }, (_, i) => `Styrkelofter ${i + 1}`) },
  { id: "c13", name: "CrossFit", instructor: "Mads Berg", time: "18:00", duration: 60, dayOffset: 2, category: "CrossFit", color: "#EAB308", maxSpots: 18, attendees: Array.from({ length: 14 }, (_, i) => `CrossFitter ${i + 1}`) },
  { id: "c18", name: "Styrke", instructor: "Mads Berg", time: "07:00", duration: 60, dayOffset: 4, category: "Styrke", color: "#F97316", maxSpots: 14, attendees: Array.from({ length: 6 }, (_, i) => `Morgentrener ${i + 1}`) },
  { id: "c4", name: "Spinning", instructor: "Sara Moe", time: "18:00", duration: 45, dayOffset: 0, category: "Spinning", color: "#06B6D4", maxSpots: 22, attendees: Array.from({ length: 17 }, (_, i) => `Syklist ${i + 1}`) },
  { id: "c8", name: "HIIT-Okt", instructor: "Sara Moe", time: "17:30", duration: 45, dayOffset: 1, category: "HIIT", color: "#EF4444", maxSpots: 20, attendees: Array.from({ length: 13 }, (_, i) => `HIIT-medlem ${i + 1}`) },
  { id: "c10", name: "Spinning", instructor: "Sara Moe", time: "06:00", duration: 45, dayOffset: 2, category: "Spinning", color: "#06B6D4", maxSpots: 22, attendees: Array.from({ length: 13 }, (_, i) => `Morgensyklist ${i + 1}`) },
  { id: "c15", name: "Kondisjon", instructor: "Sara Moe", time: "06:30", duration: 40, dayOffset: 3, category: "Kondisjon", color: "#14B8A6", maxSpots: 20, attendees: Array.from({ length: 8 }, (_, i) => `Loper ${i + 1}`) },
  { id: "c19", name: "Spinning", instructor: "Sara Moe", time: "12:00", duration: 45, dayOffset: 4, category: "Spinning", color: "#06B6D4", maxSpots: 22, attendees: Array.from({ length: 7 }, (_, i) => `Lunsj-syklist ${i + 1}`) },
];

export default function TrainerPage() {
  const router = useRouter();
  const [trainer, setTrainer] = useState("");
  const [selectedDay, setSelectedDay] = useState(0);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("bf_trainer");
      if (!raw) { router.push("/"); return; }
      // find closest matching trainer
      const match = TRAINERS.find(t => t.toLowerCase().includes(raw.toLowerCase())) || TRAINERS[0];
      setTrainer(match);
    } catch { router.push("/"); }
  }, [router]);

  const days = Array.from({ length: 7 }, (_, i) => i);
  const myClasses = ALL_CLASSES.filter(c => c.instructor === trainer);
  const todaysClasses = myClasses.filter(c => c.dayOffset === selectedDay);

  const totalWeek = myClasses.length;
  const totalAttendees = myClasses.reduce((s, c) => s + c.attendees.length, 0);
  const avgFill = myClasses.length > 0 ? Math.round(myClasses.reduce((s, c) => s + (c.attendees.length / c.maxSpots) * 100, 0) / myClasses.length) : 0;

  if (!trainer) return null;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      <header style={{ background: "rgba(13,27,42,0.97)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "28px", height: "28px", background: "#7BA3C4", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M2 9h4l2-6 2 12 2-6h4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "16px" }}>Bergen<span style={{ color: "#7BA3C4" }}>Flow</span> <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-muted)", marginLeft: "4px" }}>Trenerportal</span></span>
          </div>
          <button onClick={() => { try { sessionStorage.removeItem("bf_trainer"); } catch {} router.push("/"); }} style={{ color: "var(--text-muted)", fontSize: "13px" }}>Logg ut</button>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "4px" }}>Hei, {trainer.split(" ")[0]}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Din ukentlige timeplan og deltakerlister.</p>
        </div>

        {/* WEEKLY KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "28px" }}>
          {[
            { label: "Timer denne uken", value: String(totalWeek), accent: "#7BA3C4" },
            { label: "Pamedte totalt", value: String(totalAttendees), accent: "var(--orange)" },
            { label: "Gjennomsnittlig fyllgrad", value: `${avgFill}%`, accent: "#22c55e" },
          ].map(kpi => (
            <div key={kpi.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>{kpi.label}</div>
              <div style={{ fontFamily: "var(--font-syne)", fontSize: "32px", fontWeight: 800, color: kpi.accent }}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* DAY PICKER */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "24px", paddingBottom: "4px" }}>
          {days.map(d => {
            const date = addDays(today, d);
            const count = myClasses.filter(c => c.dayOffset === d).length;
            const isSelected = selectedDay === d;
            return (
              <button key={d} onClick={() => setSelectedDay(d)} style={{
                minWidth: "80px", padding: "12px 10px", borderRadius: "10px", textAlign: "center",
                background: isSelected ? "#7BA3C4" : "var(--surface)",
                border: isSelected ? "none" : "1px solid var(--border-strong)",
                color: "#fff", flexShrink: 0,
              }}>
                <div style={{ fontSize: "11px", color: isSelected ? "rgba(255,255,255,0.7)" : "var(--text-muted)", textTransform: "capitalize" }}>
                  {d === 0 ? "I dag" : d === 1 ? "I morgen" : date.toLocaleDateString("no-NO", { weekday: "short" })}
                </div>
                <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "var(--font-syne)" }}>{date.getDate()}</div>
                <div style={{ fontSize: "10px", color: isSelected ? "rgba(255,255,255,0.6)" : "var(--text-muted)" }}>
                  {count > 0 ? `${count} time${count > 1 ? "r" : ""}` : "Fri"}
                </div>
              </button>
            );
          })}
        </div>

        {/* CLASS LIST */}
        {todaysClasses.length === 0 ? (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "48px", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>Ingen timer denne dagen. Nyt fridagen!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {todaysClasses.map(cls => {
              const isExpanded = expandedClass === cls.id;
              const fillPercent = Math.round((cls.attendees.length / cls.maxSpots) * 100);
              const isFull = cls.attendees.length >= cls.maxSpots;
              return (
                <div key={cls.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
                  <button onClick={() => setExpandedClass(isExpanded ? null : cls.id)}
                    style={{ width: "100%", padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: "4px", height: "42px", background: cls.color, borderRadius: "2px" }}/>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                          <span style={{ fontWeight: 700, fontSize: "16px", color: "var(--text)" }}>{cls.name}</span>
                          <span style={{ fontSize: "10px", fontWeight: 700, color: cls.color, background: `${cls.color}15`, padding: "2px 7px", borderRadius: "4px" }}>{cls.category}</span>
                          {isFull && <span style={{ fontSize: "10px", fontWeight: 700, color: "#f87171", background: "rgba(248,113,113,0.1)", padding: "2px 7px", borderRadius: "4px" }}>FULLT</span>}
                        </div>
                        <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>kl. {cls.time} &middot; {cls.duration} min &middot; {fmtDate(addDays(today, cls.dayOffset))}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{cls.attendees.length}/{cls.maxSpots}</div>
                        <div style={{ width: "60px", height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden", marginTop: "4px" }}>
                          <div style={{ width: `${fillPercent}%`, height: "100%", background: isFull ? "#f87171" : cls.color, borderRadius: "2px" }}/>
                        </div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.15s", color: "var(--text-muted)" }}>
                        <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </button>
                  {isExpanded && (
                    <div style={{ borderTop: "1px solid var(--border)", padding: "18px 22px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
                        Deltakerliste ({cls.attendees.length})
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "6px" }}>
                        {cls.attendees.map((name, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "var(--surface-2)", borderRadius: "6px", fontSize: "13px" }}>
                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", flexShrink: 0 }}/>
                            {name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer"
        style={{ position: "fixed", bottom: "24px", right: "24px", background: "var(--orange)", color: "#fff", borderRadius: "100px", padding: "10px 18px", fontSize: "12px", fontWeight: 700, boxShadow: "0 4px 20px rgba(232,93,4,0.4)", zIndex: 50, textDecoration: "none" }}>
        Bygget av Sloth Studio &rarr;
      </a>
    </div>
  );
}
