"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Mode = "member" | "trainer" | "owner";

const MODES: { key: Mode; label: string; icon: string; color: string; hint: string; cred: string }[] = [
  { key: "member",  label: "Kunde",    icon: "M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6a5 5 0 0 1 10 0H3z", color: "#E85D04", hint: "Book timer, se dine bestillinger og abonnement",   cred: "Valgfri e-post og passord" },
  { key: "trainer", label: "Trener",   icon: "M6 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-4.5 6a4.5 4.5 0 0 1 9 0H1.5zm7-4.5a1.5 1.5 0 1 0 2.12 2.12 1.5 1.5 0 0 0-2.12-2.12zM11 9.5a2 2 0 1 1 2 2", color: "#7BA3C4", hint: "Timeplan, deltakerlister og ukeoversikt",           cred: "Valgfri e-post og passord" },
  { key: "owner",   label: "Eier",     icon: "M5 1a4 4 0 0 1 4 4v2h2a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h2V5a4 4 0 0 1 4-4zm0 1.5A2.5 2.5 0 0 0 2.5 5v2h5V5A2.5 2.5 0 0 0 5 2.5z", color: "#B8985A", hint: "Omsetning, besokstall og trenerstatistikk",         cred: "owner@bergenfitness.no · valgfritt passord" },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode]         = useState<Mode>("member");
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("bf_member"))    router.push("/dashboard");
      if (sessionStorage.getItem("bf_trainer"))   router.push("/trainer");
      if (sessionStorage.getItem("bf_owner_bf"))  router.push("/owner");
    } catch {}
  }, [router]);

  const cfg = MODES.find(m => m.key === mode)!;

  function reset() { setError(""); setName(""); setEmail(""); setPassword(""); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "owner" && email.trim().toLowerCase() !== "owner@bergenfitness.no") {
      setError("Eier-konto: bruk owner@bergenfitness.no");
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
    }, 500);
  }

  const headings: Record<Mode, { title: string; sub: string }> = {
    member:  { title: "Tren smartere.",  sub: "Book neste økt, se din fremgang og hold oversikt over abonnementet." },
    trainer: { title: "Din plan.",        sub: "Alle dine klasser, deltakerlister og timeplan på ett sted." },
    owner:   { title: "Full oversikt.",   sub: "Besøkstall, inntekter og klassestatistikk — alt i sanntid." },
  };

  const { title, sub } = headings[mode];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>

      {/* ── Access level picker (always visible top bar) ── */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", padding: "0" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", alignItems: "stretch" }}>
          {MODES.map(m => (
            <button key={m.key} onClick={() => { setMode(m.key); reset(); }}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: "5px", padding: "14px 12px", background: "none", border: "none",
                borderBottom: mode === m.key ? `2px solid ${m.color}` : "2px solid transparent",
                cursor: "pointer", transition: "all 0.12s",
              }}>
              <svg width="20" height="20" viewBox="0 0 14 14" fill="none" style={{ color: mode === m.key ? m.color : "rgba(255,255,255,0.3)", transition: "color 0.12s" }}>
                <path d={m.icon} stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <span style={{ fontSize: "12px", fontWeight: 600, color: mode === m.key ? m.color : "rgba(255,255,255,0.4)", letterSpacing: "0.02em" }}>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left brand panel */}
        <div style={{ width: "44%", background: "linear-gradient(160deg, #0A1520 0%, #1A2E45 100%)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "56px 48px", borderRight: "1px solid var(--border-strong)", position: "relative", overflow: "hidden" }}
          className="hidden-mobile">
          <div style={{ position: "absolute", top: "10%", left: "-15%", width: "380px", height: "380px", background: `radial-gradient(ellipse, ${cfg.color}0A 0%, transparent 70%)`, pointerEvents: "none", transition: "background 0.3s" }}/>
          <div style={{ marginBottom: "40px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "48px" }}>
              <div style={{ width: "32px", height: "32px", background: "var(--orange)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9h4l2-6 2 12 2-6h4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontFamily: "var(--font-syne)", fontSize: "18px", fontWeight: 800, letterSpacing: "-0.02em" }}>Bergen<span style={{ color: "var(--orange)" }}>Flow</span></span>
            </div>
            <div style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(30px, 3vw, 40px)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.03em", marginBottom: "16px" }}>{title}</div>
            <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: "300px" }}>{sub}</p>
          </div>

          {/* Access level cards on left */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {MODES.map(m => (
              <button key={m.key} onClick={() => { setMode(m.key); reset(); }}
                style={{
                  display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 16px",
                  background: mode === m.key ? `${m.color}12` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${mode === m.key ? m.color + "40" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: "10px", cursor: "pointer", textAlign: "left", transition: "all 0.12s",
                }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: mode === m.key ? `${m.color}20` : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: mode === m.key ? m.color : "rgba(255,255,255,0.3)" }}>
                    <path d={m.icon} stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: mode === m.key ? m.color : "rgba(255,255,255,0.55)", marginBottom: "2px" }}>{m.label}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>{m.hint}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right form panel */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px", overflowY: "auto" }}>
          <div style={{ width: "100%", maxWidth: "380px" }}>

            {/* Mode hint */}
            <div style={{ background: `${cfg.color}0E`, border: `1px solid ${cfg.color}28`, borderRadius: "8px", padding: "10px 14px", marginBottom: "24px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: cfg.color, marginTop: "5px", flexShrink: 0 }}/>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: cfg.color, marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Demo — {cfg.label}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.55 }}>{cfg.cred}</div>
              </div>
            </div>

            {/* Signup / Login tabs (member only) */}
            {mode === "member" && (
              <div style={{ display: "flex", gap: "4px", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "9px", padding: "3px", marginBottom: "22px" }}>
                {(["signup", "login"] as const).map(m => (
                  <button key={m} onClick={() => { setAuthMode(m); setError(""); }}
                    style={{ flex: 1, padding: "9px", borderRadius: "6px", fontSize: "13px", fontWeight: 600, background: authMode === m ? "var(--orange)" : "transparent", color: authMode === m ? "#fff" : "var(--text-muted)", border: "none", transition: "all 0.12s" }}>
                    {m === "signup" ? "Ny konto" : "Logg inn"}
                  </button>
                ))}
              </div>
            )}

            <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>
              {mode === "member" && authMode === "signup" ? "Opprett konto" :
               mode === "member" ? "Logg inn" :
               mode === "trainer" ? "Trener-innlogging" : "Eier-innlogging"}
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "22px" }}>
              {mode === "member" && authMode === "signup" ? "Begynn din treningsreise hos Bergen Fitness." :
               mode === "member" ? "Velkommen tilbake." :
               mode === "trainer" ? "Se dine klasser og deltakerlister." :
               "Full oversikt over treningssenteret."}
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {mode === "member" && authMode === "signup" && (
                <div>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Fullt navn</label>
                  <input type="text" placeholder="Ditt navn" value={name} onChange={e => { setName(e.target.value); setError(""); }} />
                </div>
              )}
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>E-postadresse</label>
                <input type="email" placeholder={mode === "owner" ? "owner@bergenfitness.no" : "din@epost.no"} value={email} onChange={e => { setEmail(e.target.value); setError(""); }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Passord</label>
                <input type="password" placeholder="Minst 4 tegn" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} />
              </div>

              {error && (
                <div style={{ fontSize: "12px", color: "#f87171", padding: "9px 12px", background: "rgba(248,113,113,0.08)", borderRadius: "6px", border: "1px solid rgba(248,113,113,0.2)" }}>{error}</div>
              )}

              <button type="submit" disabled={loading}
                style={{ background: loading ? "var(--surface-2)" : cfg.color, color: loading ? "var(--text-muted)" : "#fff", borderRadius: "9px", padding: "13px", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "4px", transition: "all 0.15s" }}>
                {loading
                  ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.7s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round"/></svg>Venter...</>
                  : mode === "member" && authMode === "signup" ? "Opprett konto"
                  : mode === "member" ? "Logg inn"
                  : mode === "trainer" ? "Gå til timeplan"
                  : "Gå til oversikt"}
              </button>
            </form>

            {mode === "member" && (
              <p style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginTop: "14px" }}>7 dager gratis &middot; Ingen bindingstid</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
