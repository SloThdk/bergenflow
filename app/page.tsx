"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("bf_member")) router.push("/dashboard");
    } catch {}
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) { setError("Fyll inn alle felt."); return; }
    if (authMode === "signup" && !name.trim()) { setError("Skriv inn ditt navn."); return; }
    if (password.length < 4) { setError("Passordet må være minst 4 tegn."); return; }
    setLoading(true);
    setTimeout(() => {
      try {
        sessionStorage.setItem("bf_member", JSON.stringify({
          name: authMode === "signup" ? name.trim() : email.split("@")[0],
          email: email.trim(),
          plan: "Elite",
        }));
        router.push("/dashboard");
      } catch {}
    }, 500);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>

      {/* Left brand panel */}
      <div className="brand-panel" style={{ width: "42%", background: "linear-gradient(160deg, #0A1520 0%, #1A2E45 100%)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px", borderRight: "1px solid var(--border-strong)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "15%", left: "-20%", width: "400px", height: "400px", background: "radial-gradient(ellipse, rgba(232,93,4,0.06) 0%, transparent 70%)", pointerEvents: "none" }}/>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", background: "var(--orange)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9h4l2-6 2 12 2-6h4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontFamily: "var(--font-syne)", fontSize: "18px", fontWeight: 800, letterSpacing: "-0.02em" }}>Bergen<span style={{ color: "var(--orange)" }}>Flow</span></span>
        </div>

        <div>
          <div style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(32px, 3.5vw, 42px)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.03em", marginBottom: "18px" }}>Tren smartere.</div>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: "300px" }}>Book neste økt, se din fremgang og hold oversikt over abonnementet.</p>
        </div>

        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { icon: "M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6a5 5 0 0 1 10 0H3z", label: "Book gruppetimer", desc: "Velg dag, kategori og tidspunkt" },
              { icon: "M3 3h10v2H3zm0 4h10v2H3zm0 4h7v2H3z",                       label: "Se dine bestillinger", desc: "Kommende og tidligere timer" },
              { icon: "M9 2a7 7 0 1 0 0 14A7 7 0 0 0 9 2zm1 10H8V8h2zm0-6H8V4h2z", label: "Administrer abonnement", desc: "Abonnementstype og fakturering" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(232,93,4,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ color: "var(--orange)" }}>
                    <path d={item.icon} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "1px" }}>{item.label}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "20px", padding: "10px 14px", background: "rgba(232,93,4,0.06)", border: "1px solid rgba(232,93,4,0.15)", borderRadius: "8px" }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.6 }}>
              <span style={{ color: "var(--orange)", fontWeight: 600 }}>Demo — </span>
              Bruk valgfritt navn, e-post og passord.
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>

          {/* Signup / Login tabs */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "28px", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "10px", padding: "4px" }}>
            {(["signup", "login"] as const).map(m => (
              <button key={m} onClick={() => { setAuthMode(m); setError(""); }}
                style={{ flex: 1, padding: "9px", borderRadius: "7px", fontSize: "13px", fontWeight: 600, background: authMode === m ? "var(--orange)" : "transparent", color: authMode === m ? "#fff" : "var(--text-muted)", border: "none", transition: "all 0.12s" }}>
                {m === "signup" ? "Ny konto" : "Logg inn"}
              </button>
            ))}
          </div>

          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "22px", fontWeight: 700, marginBottom: "6px" }}>
            {authMode === "signup" ? "Opprett konto" : "Logg inn"}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "26px" }}>
            {authMode === "signup" ? "Begynn din treningsreise hos Bergen Fitness." : "Velkommen tilbake — hva trener du i dag?"}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {authMode === "signup" && (
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "7px" }}>Fullt navn</label>
                <input type="text" placeholder="Ditt navn" value={name} onChange={e => { setName(e.target.value); setError(""); }} />
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "7px" }}>E-postadresse</label>
              <input type="email" placeholder="din@epost.no" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "7px" }}>Passord</label>
              <input type="password" placeholder="Minst 4 tegn" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} />
            </div>
            {error && (
              <p style={{ fontSize: "12px", color: "#f87171", padding: "8px 12px", background: "rgba(248,113,113,0.08)", borderRadius: "6px", border: "1px solid rgba(248,113,113,0.2)" }}>{error}</p>
            )}
            <button type="submit" disabled={loading}
              style={{ background: loading ? "var(--surface-2)" : "var(--orange)", color: loading ? "var(--text-muted)" : "#fff", borderRadius: "9px", padding: "13px", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.15s", marginTop: "4px" }}>
              {loading
                ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.7s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round"/></svg>Venter...</>
                : authMode === "signup" ? "Opprett konto" : "Logg inn"}
            </button>
          </form>

          {authMode === "signup" && (
            <p style={{ color: "var(--text-muted)", fontSize: "12px", textAlign: "center", marginTop: "12px" }}>7 dager gratis · Ingen bindingstid</p>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .brand-panel { display: none !important; } }
      `}</style>
    </div>
  );
}
