"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

type Period = "uke" | "mnd" | "ar";

const REVENUE: Record<Period, { labels: string[]; values: number[]; total: string; members: string; fill: string; classes: string }> = {
  uke: { labels: ["Man", "Tir", "Ons", "Tor", "Fre", "Lor", "Son"], values: [18400, 22100, 19800, 24500, 26300, 12800, 8600], total: "kr 132.500", members: "487", fill: "82%", classes: "48" },
  mnd: { labels: ["Uke 1", "Uke 2", "Uke 3", "Uke 4"], values: [128000, 134500, 141200, 132500], total: "kr 536.200", members: "512", fill: "79%", classes: "192" },
  ar: { labels: ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"], values: [498000, 512000, 534000, 548000, 562000, 510000, 420000, 545000, 578000, 592000, 536000, 520000], total: "kr 6.355.000", members: "548", fill: "76%", classes: "2.304" },
};

const TODAY_SCHEDULE = [
  { time: "06:00", name: "HIIT-Okt", trainer: "Erik Hansen", booked: 17, max: 20, color: "#EF4444" },
  { time: "09:00", name: "Morgen-Yoga", trainer: "Lise Dahl", booked: 10, max: 18, color: "#8B5CF6" },
  { time: "12:00", name: "Styrkesirkel", trainer: "Mads Berg", booked: 16, max: 16, color: "#F97316" },
  { time: "18:00", name: "Spinning", trainer: "Sara Moe", booked: 17, max: 22, color: "#06B6D4" },
  { time: "19:30", name: "Boksing", trainer: "Erik Hansen", booked: 12, max: 14, color: "#DC2626" },
];

const TOP_CLASSES = [
  { name: "HIIT-Okt", fill: 92, sessions: 12, color: "#EF4444" },
  { name: "CrossFit", fill: 88, sessions: 8, color: "#EAB308" },
  { name: "Boksing", fill: 85, sessions: 10, color: "#DC2626" },
  { name: "Spinning", fill: 78, sessions: 12, color: "#06B6D4" },
  { name: "Styrke", fill: 75, sessions: 8, color: "#F97316" },
  { name: "Yoga", fill: 68, sessions: 10, color: "#8B5CF6" },
  { name: "Pilates", fill: 62, sessions: 8, color: "#EC4899" },
  { name: "Kondisjon", fill: 55, sessions: 4, color: "#14B8A6" },
];

const TRAINERS_PERF = [
  { name: "Erik Hansen", classes: 22, avgFill: 91, speciality: "HIIT / Boksing" },
  { name: "Mads Berg", classes: 18, avgFill: 86, speciality: "Styrke / CrossFit" },
  { name: "Sara Moe", classes: 20, avgFill: 78, speciality: "Spinning / Kondisjon" },
  { name: "Lise Dahl", classes: 18, avgFill: 72, speciality: "Yoga / Pilates" },
];

export default function OwnerPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [period, setPeriod] = useState<Period>("uke");
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    try { if (sessionStorage.getItem("bf_owner_bf") === "1") setAuthed(true); } catch {}
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim().toLowerCase() !== "owner@bergenfitness.no") {
      setError("Bruk owner@bergenfitness.no for demo-tilgang.");
      return;
    }
    try { sessionStorage.setItem("bf_owner_bf", "1"); } catch {}
    setAuthed(true);
  }

  const rev = REVENUE[period];
  const maxVal = Math.max(...rev.values);

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
            <div style={{ width: "32px", height: "32px", background: "#B8985A", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M2 9h4l2-6 2 12 2-6h4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "18px" }}>Eierportal</span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "6px" }}>Logg inn som eier</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "24px" }}>Full oversikt over Bergen Fitness.</p>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <input type="email" placeholder="owner@bergenfitness.no" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} />
            <input type="password" placeholder="Valgfritt passord" value={password} onChange={e => setPassword(e.target.value)} />
            {error && <p style={{ fontSize: "12px", color: "#ef4444", padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: "6px" }}>{error}</p>}
            <button type="submit" style={{ background: "#B8985A", color: "#fff", borderRadius: "9px", padding: "13px", fontSize: "14px", fontWeight: 700 }}>Ga til oversikt</button>
          </form>
          <div style={{ marginTop: "16px", padding: "10px 14px", background: "rgba(184,152,90,0.06)", border: "1px solid rgba(184,152,90,0.15)", borderRadius: "8px" }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}><span style={{ color: "#B8985A", fontWeight: 600 }}>Demo</span> — E-post: owner@bergenfitness.no, valgfritt passord.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      <header style={{ background: "rgba(13,27,42,0.97)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "28px", height: "28px", background: "#B8985A", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M2 9h4l2-6 2 12 2-6h4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "16px" }}>Bergen<span style={{ color: "#B8985A" }}>Flow</span> <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-muted)" }}>Eierportal</span></span>
          </div>
          <button onClick={() => { try { sessionStorage.removeItem("bf_owner_bf"); } catch {} router.push("/"); }} style={{ color: "var(--text-muted)", fontSize: "13px" }}>Logg ut</button>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "4px" }}>Oversikt</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Bergen Fitness — {today.toLocaleDateString("no-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#B8985A", background: "rgba(184,152,90,0.1)", border: "1px solid rgba(184,152,90,0.2)", padding: "4px 10px", borderRadius: "4px" }}>Demo</span>
        </div>

        {/* KPI STRIP */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" }}>
          {[
            { label: "Omsetning", value: rev.total, accent: "#22c55e" },
            { label: "Aktive medlemmer", value: rev.members, accent: "var(--orange)" },
            { label: "Gjennomsnittlig fyllgrad", value: rev.fill, accent: "#7BA3C4" },
            { label: "Timer avholdt", value: rev.classes, accent: "#B8985A" },
          ].map(kpi => (
            <div key={kpi.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>{kpi.label}</div>
              <div style={{ fontFamily: "var(--font-syne)", fontSize: "28px", fontWeight: 800, color: kpi.accent, letterSpacing: "-0.02em" }}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* REVENUE CHART */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700 }}>Omsetning</h2>
            <div style={{ display: "flex", gap: "4px", background: "var(--surface-2)", borderRadius: "8px", padding: "3px" }}>
              {(["uke", "mnd", "ar"] as Period[]).map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
                  background: period === p ? "var(--orange)" : "transparent",
                  color: period === p ? "#fff" : "var(--text-muted)",
                }}>{p === "uke" ? "Uke" : p === "mnd" ? "Maned" : "Ar"}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "180px" }}>
            {rev.values.map((val, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 500 }}>
                  {val >= 1000 ? `${Math.round(val / 1000)}k` : val}
                </div>
                <div style={{ width: "100%", maxWidth: "48px", height: `${(val / maxVal) * 140}px`, background: `linear-gradient(to top, var(--orange), var(--orange-light))`, borderRadius: "4px 4px 0 0", transition: "height 0.3s" }}/>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{rev.labels[i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          {/* TODAY'S SCHEDULE */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Dagens timeplan</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {TODAY_SCHEDULE.map((cls, i) => {
                const fill = Math.round((cls.booked / cls.max) * 100);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--surface-2)", borderRadius: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "3px", height: "32px", background: cls.color, borderRadius: "1.5px" }}/>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "13px" }}>{cls.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>kl. {cls.time} &middot; {cls.trainer}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "13px", fontWeight: 600 }}>{cls.booked}/{cls.max}</div>
                      <div style={{ width: "48px", height: "3px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden", marginTop: "3px" }}>
                        <div style={{ width: `${fill}%`, height: "100%", background: fill >= 90 ? "#f87171" : cls.color, borderRadius: "2px" }}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TOP CLASSES */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Populaere klasser</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {TOP_CLASSES.map(cls => (
                <div key={cls.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--surface-2)", borderRadius: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: cls.color }}/>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>{cls.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{cls.sessions} okter</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: cls.fill >= 85 ? "#22c55e" : cls.fill >= 70 ? "var(--orange-light)" : "var(--text-secondary)" }}>{cls.fill}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TRAINER PERFORMANCE */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Treneroversikt</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            {TRAINERS_PERF.map(t => (
              <div key={t.name} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "18px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>{t.name}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "12px" }}>{t.speciality}</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "var(--font-syne)", color: "var(--orange)" }}>{t.classes}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>timer</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "var(--font-syne)", color: t.avgFill >= 85 ? "#22c55e" : "var(--text)" }}>{t.avgFill}%</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>fyllgrad</div>
                  </div>
                </div>
              </div>
            ))}
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
