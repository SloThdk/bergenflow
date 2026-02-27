"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Mode = "member" | "trainer" | "owner";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode]       = useState<Mode>("member");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login"|"signup">("signup");

  useEffect(() => {
    try {
      if (sessionStorage.getItem("bf_member")) router.push("/dashboard");
      if (sessionStorage.getItem("bf_trainer")) router.push("/trainer");
      if (sessionStorage.getItem("bf_owner_bf")) router.push("/owner");
    } catch {}
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "owner" && email.trim().toLowerCase() !== "owner@bergenfitness.no") {
      setError("Ugyldig eierkonto. Bruk owner@bergenfitness.no");
      return;
    }
    if (!email.trim() || !password.trim()) { setError("Fyll inn alle felt."); return; }
    if (mode === "member" && authMode === "signup" && !name.trim()) { setError("Skriv inn ditt navn."); return; }
    if (password.length < 4) { setError("Passordet ma vaere minst 4 tegn."); return; }
    setLoading(true);
    setTimeout(() => {
      try {
        if (mode === "member") {
          sessionStorage.setItem("bf_member", JSON.stringify({ name: authMode === "signup" ? name.trim() : email.split("@")[0], email: email.trim(), plan: "Elite" }));
          router.push("/dashboard");
        } else if (mode === "trainer") {
          sessionStorage.setItem("bf_trainer", email.split("@")[0]);
          router.push("/trainer");
        } else {
          sessionStorage.setItem("bf_owner_bf", "1");
          router.push("/owner");
        }
      } catch {}
    }, 600);
  }

  const modeConfig = {
    member:  { label: "Medlem",  desc: "Book timer og administrer ditt abonnement",    color: "var(--orange)" },
    trainer: { label: "Trener",  desc: "Se timeplan og klasselistene dine",             color: "#7BA3C4" },
    owner:   { label: "Eier",    desc: "Overvak treningssenter, inntekter og besokende", color: "#B8985A" },
  };

  const headlineMap = {
    member:  { title: "Tren smartere.", sub: "Book neste okt, se din fremgang og hold oversikt over abonnementet." },
    trainer: { title: "Din plan.", sub: "Alle dine klasser, deltakerlister og timeplan pa ett sted." },
    owner:   { title: "Full oversikt.", sub: "Besokstall, inntekter og klassestatistikk ÔÇö alt i sanntid." },
  };

  const { title, sub } = headlineMap[mode];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>
      {/* Left brand panel */}
      <div className="brand-panel" style={{ width: "42%", background: "linear-gradient(160deg, #0A1520 0%, #1A2E45 100%)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px", borderRight: "1px solid var(--border-strong)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "15%", left: "-20%", width: "400px", height: "400px", background: "radial-gradient(ellipse, rgba(232,93,4,0.06) 0%, transparent 70%)", pointerEvents: "none" }}/>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "60px" }}>
            <div style={{ width: "32px", height: "32px", background: "var(--orange)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9h4l2-6 2 12 2-6h4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontFamily: "var(--font-syne)", fontSize: "18px", fontWeight: 800, letterSpacing: "-0.02em" }}>Bergen<span style={{ color: "var(--orange)" }}>Flow</span></span>
          </div>
          <div style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(32px, 3.5vw, 42px)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.03em", marginBottom: "18px", color: "var(--text)" }}>{title}</div>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: "300px" }}>{sub}</p>
        </div>
        <div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
            {(Object.entries(modeConfig) as [Mode, typeof modeConfig[Mode]][]).map(([key, cfg]) => (
              <button key={key} onClick={() => { setMode(key); setError(""); }} style={{
                padding: "8px 16px", borderRadius: "7px", fontSize: "12px", fontWeight: 600,
                background: mode === key ? `${cfg.color}18` : "var(--surface)",
                border: `1px solid ${mode === key ? cfg.color + "44" : "var(--border-strong)"}`,
                color: mode === key ? cfg.color : "var(--text-muted)",
                transition: "all 0.12s", cursor: "pointer",
              }}>{cfg.label}</button>
            ))}
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{modeConfig[mode].desc}</p>
          <div style={{ marginTop: "24px", padding: "12px 16px", background: "rgba(232,93,4,0.06)", border: "1px solid rgba(232,93,4,0.15)", borderRadius: "8px" }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.6 }}>
              <span style={{ color: "var(--orange)", fontWeight: 600 }}>Demo ÔÇö </span>
              {mode === "owner" ? "E-post: owner@bergenfitness.no, valgfritt passord." : "Bruk valgfritt navn, e-post og passord."}
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          {mode === "member" && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "28px", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "10px", padding: "4px" }}>
              {(["signup","login"] as const).map(m => (
                <button key={m} onClick={() => { setAuthMode(m); setError(""); }} style={{
                  flex: 1, padding: "9px", borderRadius: "7px", fontSize: "13px", fontWeight: 600,
                  background: authMode === m ? "var(--orange)" : "transparent",
                  color: authMode === m ? "#fff" : "var(--text-muted)", border: "none", transition: "all 0.12s",
                }}>
                  {m === "signup" ? "Ny konto" : "Logg inn"}
                </button>
              ))}
            </div>
          )}

          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "22px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
            {mode === "member" ? (authMode === "signup" ? "Opprett konto" : "Logg inn") : mode === "trainer" ? "Trener-innlogging" : "Eier-innlogging"}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "26px" }}>
            {mode === "member" && authMode === "signup" ? "Begynn din treningsreise hos Bergen Fitness." :
             mode === "member" ? "Velkommen tilbake ÔÇö hva trener du i dag?" :
             mode === "trainer" ? "Se dine klasser og deltakerlistene." :
             "Full oversikt over treningssenteret."}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {mode === "member" && authMode === "signup" && (
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "7px" }}>Fullt navn</label>
                <input type="text" placeholder="Ditt navn" value={name} onChange={e => { setName(e.target.value); setError(""); }}/>
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "7px" }}>E-postadresse</label>
              <input type="email" placeholder={mode === "owner" ? "owner@bergenfitness.no" : "din@epost.no"} value={email} onChange={e => { setEmail(e.target.value); setError(""); }}/>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "7px" }}>Passord</label>
              <input type="password" placeholder="Minst 4 tegn" value={password} onChange={e => { setPassword(e.target.value); setError(""); }}/>
            </div>
            {error && <p style={{ fontSize: "12px", color: "#ef4444", padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</p>}
            <button type="submit" disabled={loading} style={{
              background: loading ? "var(--surface-2)" : "var(--orange)", color: loading ? "var(--text-muted)" : "#fff",
              borderRadius: "9px", padding: "13px", fontSize: "14px", fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              transition: "all 0.15s", marginTop: "4px",
            }}>
              {loading ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.7s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round"/></svg>Venter...</> :
               mode === "member" && authMode === "signup" ? "Opprett konto" :
               mode === "member" ? "Logg inn" :
               mode === "trainer" ? "G├Ñ til timeplan" : "G├Ñ til oversikt"}
            </button>
          </form>

          {mode === "member" && (
            <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={() => { setMode("trainer"); setError(""); }} style={{ fontSize: "11px", color: "var(--text-muted)", padding: "5px 10px", borderRadius: "5px", border: "1px solid var(--border-strong)", display: "flex", alignItems: "center", gap: "5px" }}>
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 13c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10 7c.8.3 1.5 1.1 1.5 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M11.5 5a1.5 1.5 0 0 1 0 2.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
                Trener-innlogging
              </button>
              <button onClick={() => { setMode("owner"); setError(""); }} style={{ fontSize: "11px", color: "var(--text-muted)", padding: "5px 10px", borderRadius: "5px", border: "1px solid var(--border-strong)", display: "flex", alignItems: "center", gap: "5px" }}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><rect x="1" y="5" width="10" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M3.5 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                Eier-innlogging
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile logo */}
      <style>{`
        @media (max-width: 768px) { .brand-panel { display: none !important; } }
      `}</style>
    </div>
  );
}
