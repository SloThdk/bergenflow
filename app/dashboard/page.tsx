"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function fmtDate(d: Date) { return d.toLocaleDateString("no-NO", { weekday: "long", day: "numeric", month: "long" }); }

interface Booking { id: string; name: string; category: string; instructor: string; time: string; duration: number; dayOffset: number; color: string; }

const DEMO_HISTORY: { name: string; date: string; instructor: string; }[] = [
  { name: "HIIT-Okt", date: "3 dager siden", instructor: "Erik Hansen" },
  { name: "Yoga", date: "5 dager siden", instructor: "Lise Dahl" },
  { name: "Spinning", date: "1 uke siden", instructor: "Sara Moe" },
  { name: "CrossFit", date: "1 uke siden", instructor: "Mads Berg" },
  { name: "Boksing", date: "2 uker siden", instructor: "Erik Hansen" },
];

const CLASS_MAP: Record<string, Booking> = {
  c1: { id: "c1", name: "HIIT-Okt", category: "HIIT", instructor: "Erik Hansen", time: "06:00", duration: 45, dayOffset: 0, color: "#EF4444" },
  c2: { id: "c2", name: "Morgen-Yoga", category: "Yoga", instructor: "Lise Dahl", time: "09:00", duration: 60, dayOffset: 0, color: "#8B5CF6" },
  c4: { id: "c4", name: "Spinning", category: "Spinning", instructor: "Sara Moe", time: "18:00", duration: 45, dayOffset: 0, color: "#06B6D4" },
  c5: { id: "c5", name: "Boksing", category: "Boksing", instructor: "Erik Hansen", time: "19:30", duration: 60, dayOffset: 0, color: "#DC2626" },
  c6: { id: "c6", name: "Pilates", category: "Pilates", instructor: "Lise Dahl", time: "07:00", duration: 50, dayOffset: 1, color: "#EC4899" },
  c8: { id: "c8", name: "HIIT-Okt", category: "HIIT", instructor: "Sara Moe", time: "17:30", duration: 45, dayOffset: 1, color: "#EF4444" },
  c9: { id: "c9", name: "Yin Yoga", category: "Yoga", instructor: "Lise Dahl", time: "19:00", duration: 60, dayOffset: 1, color: "#8B5CF6" },
  c10: { id: "c10", name: "Spinning", category: "Spinning", instructor: "Sara Moe", time: "06:00", duration: 45, dayOffset: 2, color: "#06B6D4" },
  c11: { id: "c11", name: "Styrke", category: "Styrke", instructor: "Mads Berg", time: "09:30", duration: 50, dayOffset: 2, color: "#F97316" },
  c13: { id: "c13", name: "CrossFit", category: "CrossFit", instructor: "Mads Berg", time: "18:00", duration: 60, dayOffset: 2, color: "#EAB308" },
  c15: { id: "c15", name: "Kondisjon", category: "Kondisjon", instructor: "Sara Moe", time: "06:30", duration: 40, dayOffset: 3, color: "#14B8A6" },
  c18: { id: "c18", name: "Styrke", category: "Styrke", instructor: "Mads Berg", time: "07:00", duration: 60, dayOffset: 4, color: "#F97316" },
  c20: { id: "c20", name: "Boksing", category: "Boksing", instructor: "Erik Hansen", time: "18:00", duration: 60, dayOffset: 4, color: "#DC2626" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [member, setMember] = useState<{ name: string; email: string; plan: string } | null>(null);
  const [bookedIds, setBookedIds] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("bf_member");
      if (!raw) { router.push("/"); return; }
      setMember(JSON.parse(raw));
      const b = sessionStorage.getItem("bf_bookings_flow");
      if (b) setBookedIds(JSON.parse(b));
    } catch { router.push("/"); }
  }, [router]);

  function cancelBooking(id: string) {
    const next = bookedIds.filter(b => b !== id);
    setBookedIds(next);
    try { sessionStorage.setItem("bf_bookings_flow", JSON.stringify(next)); } catch {}
    setToast("Bestillingen er kansellert.");
    setTimeout(() => setToast(""), 3500);
  }

  const bookings = bookedIds.map(id => CLASS_MAP[id]).filter(Boolean);
  const upcoming = bookings.sort((a, b) => a.dayOffset - b.dayOffset || a.time.localeCompare(b.time));

  if (!member) return null;

  const planPrices: Record<string, number> = { Starter: 299, Elite: 549, Pro: 899 };
  const planColor: Record<string, string> = { Starter: "#22c55e", Elite: "#E85D04", Pro: "#B8985A" };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      {toast && (
        <div style={{ position: "fixed", bottom: "32px", left: "50%", transform: "translateX(-50%)", background: "var(--surface)", border: "1px solid var(--orange-border)", borderRadius: "10px", padding: "12px 24px", color: "var(--orange-light)", fontSize: "14px", fontWeight: 600, zIndex: 300 }}>{toast}</div>
      )}

      <header style={{ background: "rgba(13,27,42,0.97)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "28px", height: "28px", background: "var(--orange)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M2 9h4l2-6 2 12 2-6h4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "16px" }}>Bergen<span style={{ color: "var(--orange)" }}>Flow</span></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={() => router.push("/book")} style={{ background: "var(--orange)", color: "#fff", borderRadius: "6px", padding: "7px 16px", fontSize: "13px", fontWeight: 700 }}>Book en time</button>
            <button onClick={() => { try { sessionStorage.removeItem("bf_member"); sessionStorage.removeItem("bf_bookings_flow"); } catch {} router.push("/"); }}
              style={{ color: "var(--text-muted)", fontSize: "13px" }}>Logg ut</button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ background: "rgba(232,93,4,0.06)", border: "1px solid rgba(232,93,4,0.18)", borderRadius: "8px", padding: "10px 16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--orange)", background: "rgba(232,93,4,0.12)", padding: "2px 7px", borderRadius: "3px", letterSpacing: "0.08em", flexShrink: 0 }}>DEMO</span>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>
            I produksjon vises dine faktiske bestillinger, treningshistorikk og abonnementsstatus her. Statistikk oppdateres i sanntid.
          </p>
        </div>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "4px" }}>Hei, {member.name}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Her er oversikten din.</p>
        </div>

        {/* KPI STRIP */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "32px" }}>
          {[
            { label: "Abonnement", value: member.plan, sub: `kr ${planPrices[member.plan] || 549}/mnd`, accent: planColor[member.plan] || "var(--orange)" },
            { label: "Kommende timer", value: String(upcoming.length), sub: "denne uken", accent: "var(--orange)" },
            { label: "Treninger totalt", value: "23", sub: "demo-data", accent: "#22c55e" },
            { label: "Streak", value: "4", sub: "uker pa rad", accent: "#f59e0b" },
          ].map(kpi => (
            <div key={kpi.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>{kpi.label}</div>
              <div style={{ fontFamily: "var(--font-syne)", fontSize: "28px", fontWeight: 800, color: kpi.accent, letterSpacing: "-0.02em" }}>{kpi.value}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* UPCOMING */}
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              Kommende timer
              <button onClick={() => router.push("/book")} style={{ fontSize: "12px", color: "var(--orange)", fontWeight: 600 }}>Se alle &rarr;</button>
            </h2>
            {upcoming.length === 0 ? (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "32px", textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "14px" }}>Ingen kommende bestillinger.</p>
                <button onClick={() => router.push("/book")} style={{ background: "var(--orange)", color: "#fff", borderRadius: "7px", padding: "10px 20px", fontSize: "13px", fontWeight: 700 }}>Finn en time</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {upcoming.map(b => (
                  <div key={b.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ width: "4px", height: "36px", background: b.color, borderRadius: "2px" }}/>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "2px" }}>{b.name}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                          {b.instructor} &middot; kl. {b.time} &middot; {fmtDate(addDays(today, b.dayOffset))}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => cancelBooking(b.id)} style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "underline" }}>Avbestill</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HISTORY */}
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "14px" }}>Treningshistorikk</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {DEMO_HISTORY.map((h, i) => (
                <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "2px" }}>{h.name}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>{h.instructor}</div>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{h.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer"
        style={{ position: "fixed", bottom: "24px", right: "24px", background: "var(--orange)", color: "#fff", borderRadius: "100px", padding: "10px 18px", fontSize: "12px", fontWeight: 700, boxShadow: "0 4px 20px rgba(232,93,4,0.4)", zIndex: 50, textDecoration: "none" }}>
        Bygget av Sloth Studio &rarr;
      </a>
    </div>
  );
}
