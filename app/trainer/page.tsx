"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function fmtDate(d: Date) { return d.toLocaleDateString("no-NO", { weekday: "long", day: "numeric", month: "long" }); }

const TRAINER_DATA: Record<string, { name: string; role: string; speciality: string; email: string; phone: string; bio: string; photo: string; accent: string }> = {
  "Erik Hansen":  { name: "Erik Hansen",  role: "Sjefstrener", speciality: "HIIT & Boksing",      email: "erik@bergenfitness.no",  phone: "+47 901 23 456", bio: "10 års erfaring. Tidligere norsk boksemester. Spesialiserer seg på intensiv funksjonell trening.", photo: "https://images.pexels.com/photos/5209197/pexels-photo-5209197.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop", accent: "#EF4444" },
  "Lise Dahl":    { name: "Lise Dahl",    role: "Yoga & Pilates",  speciality: "Yoga & Pilates",  email: "lise@bergenfitness.no",  phone: "+47 902 34 567", bio: "Sertifisert i Hatha og Vinyasa yoga. Ekspert på bevisst bevegelse og kjernerehabiltering.",      photo: "https://images.pexels.com/photos/6916300/pexels-photo-6916300.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop", accent: "#8B5CF6" },
  "Mads Berg":    { name: "Mads Berg",    role: "Styrke & CrossFit", speciality: "Styrke & CrossFit", email: "mads@bergenfitness.no", phone: "+47 903 45 678", bio: "CrossFit Level 3-trener med styrkløftbakgrunn. Hjelper utøvere med å bygge raskstyrke og utholdenhet.", photo: "https://images.pexels.com/photos/14762174/pexels-photo-14762174.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop", accent: "#F97316" },
  "Sara Moe":     { name: "Sara Moe",     role: "Spinning & Kondisjon", speciality: "Spinning & Kondisjon", email: "sara@bergenfitness.no",  phone: "+47 904 56 789", bio: "Sertifisert for innendørs sykling, 7 års erfaring med konkurransesyklister og mosjonister.",   photo: "https://images.pexels.com/photos/5669172/pexels-photo-5669172.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop", accent: "#06B6D4" },
};

const NR = ["Anna Hansen","Kari Johansen","Lars Olsen","Emma Berg","Ole Andersen","Ingrid Larsen","Thomas Eriksen","Sofie Dahl","Magnus Christensen","Marte Pedersen","Henrik Nielsen","Nina Svensson","Andreas Haugen","Ida Krog","Jonas Solberg","Hilde Bakke","Martin Strand","Camilla Lie","Sander Lund","Line Vold","Kristian Holm","Silje Bøe","Daniel Aas","Eva Hagen","Petter Nygård","Tuva Moen","Eirik Waage","Malin Thorsen","Stian Kvam","Frida Moe","Jørgen Hansen","Lene Berg","Tobias Olsen","Astrid Johansen","Rasmus Larsen","Helene Andersen","Sebastian Eriksen","Maren Dahl","Lukas Christensen","Emilie Pedersen","Karl Nielsen","Thea Svensson","Axel Haugen","Julie Krog","Sven Solberg","Mathilde Bakke","Per Strand","Sara Lie","Rolf Lund","Amalie Vold","Dag Holm","Hedda Bøe","Hans Aas","Maja Hagen","Gunnar Nygård","Sigrid Moen","Vegard Waage","Oda Thorsen","Espen Kvam","Nora Moe","Even Hansen","Kristine Berg","Joakim Olsen","Tone Johansen","Mikael Larsen","Live Andersen","Rune Eriksen","Eline Dahl","Nikolai Christensen","Guro Pedersen"];
function ns(from: number, count: number) { return Array.from({length: count}, (_, i) => NR[(from + i) % NR.length]); }

interface ClassEntry { id: string; name: string; time: string; duration: number; dayOffset: number; category: string; color: string; maxSpots: number; attendees: string[]; instructor: string; }

const ALL_CLASSES: ClassEntry[] = [
  { id:"c1",  name:"HIIT-Økt",      instructor:"Erik Hansen", time:"06:00", duration:45,  dayOffset:0, category:"HIIT",      color:"#EF4444", maxSpots:20, attendees:ns(0,17)  },
  { id:"c5",  name:"Boksing",       instructor:"Erik Hansen", time:"19:30", duration:60,  dayOffset:0, category:"Boksing",   color:"#DC2626", maxSpots:14, attendees:ns(17,12) },
  { id:"c12", name:"Boksing",       instructor:"Erik Hansen", time:"12:00", duration:60,  dayOffset:2, category:"Boksing",   color:"#DC2626", maxSpots:14, attendees:ns(3,13)  },
  { id:"c17", name:"HIIT-Økt",      instructor:"Erik Hansen", time:"18:00", duration:45,  dayOffset:3, category:"HIIT",      color:"#EF4444", maxSpots:20, attendees:ns(29,20) },
  { id:"c20", name:"Boksing",       instructor:"Erik Hansen", time:"18:00", duration:60,  dayOffset:4, category:"Boksing",   color:"#DC2626", maxSpots:14, attendees:ns(10,11) },
  { id:"c2",  name:"Morgen-Yoga",   instructor:"Lise Dahl",   time:"09:00", duration:60,  dayOffset:0, category:"Yoga",      color:"#8B5CF6", maxSpots:18, attendees:ns(5,10)  },
  { id:"c6",  name:"Pilates",       instructor:"Lise Dahl",   time:"07:00", duration:50,  dayOffset:1, category:"Pilates",   color:"#EC4899", maxSpots:16, attendees:ns(20,5)  },
  { id:"c9",  name:"Yin Yoga",      instructor:"Lise Dahl",   time:"19:00", duration:60,  dayOffset:1, category:"Yoga",      color:"#8B5CF6", maxSpots:18, attendees:ns(40,4)  },
  { id:"c14", name:"Pilates",       instructor:"Lise Dahl",   time:"19:30", duration:50,  dayOffset:2, category:"Pilates",   color:"#EC4899", maxSpots:16, attendees:ns(25,6)  },
  { id:"c16", name:"Yoga",          instructor:"Lise Dahl",   time:"10:00", duration:60,  dayOffset:3, category:"Yoga",      color:"#8B5CF6", maxSpots:18, attendees:ns(44,12) },
  { id:"c3",  name:"Styrkesirkel",  instructor:"Mads Berg",   time:"12:00", duration:50,  dayOffset:0, category:"Styrke",    color:"#F97316", maxSpots:16, attendees:ns(8,16)  },
  { id:"c7",  name:"CrossFit",      instructor:"Mads Berg",   time:"12:00", duration:60,  dayOffset:1, category:"CrossFit",  color:"#EAB308", maxSpots:18, attendees:ns(0,18)  },
  { id:"c11", name:"Styrke",        instructor:"Mads Berg",   time:"09:30", duration:50,  dayOffset:2, category:"Styrke",    color:"#F97316", maxSpots:16, attendees:ns(33,11) },
  { id:"c13", name:"CrossFit",      instructor:"Mads Berg",   time:"18:00", duration:60,  dayOffset:2, category:"CrossFit",  color:"#EAB308", maxSpots:18, attendees:ns(14,14) },
  { id:"c18", name:"Styrke",        instructor:"Mads Berg",   time:"07:00", duration:60,  dayOffset:4, category:"Styrke",    color:"#F97316", maxSpots:14, attendees:ns(56,6)  },
  { id:"c4",  name:"Spinning",      instructor:"Sara Moe",    time:"18:00", duration:45,  dayOffset:0, category:"Spinning",  color:"#06B6D4", maxSpots:22, attendees:ns(2,17)  },
  { id:"c8",  name:"HIIT-Økt",      instructor:"Sara Moe",    time:"17:30", duration:45,  dayOffset:1, category:"HIIT",      color:"#EF4444", maxSpots:20, attendees:ns(22,13) },
  { id:"c10", name:"Spinning",      instructor:"Sara Moe",    time:"06:00", duration:45,  dayOffset:2, category:"Spinning",  color:"#06B6D4", maxSpots:22, attendees:ns(37,13) },
  { id:"c15", name:"Kondisjon",     instructor:"Sara Moe",    time:"06:30", duration:40,  dayOffset:3, category:"Kondisjon", color:"#14B8A6", maxSpots:20, attendees:ns(50,8)  },
  { id:"c19", name:"Spinning",      instructor:"Sara Moe",    time:"12:00", duration:45,  dayOffset:4, category:"Spinning",  color:"#06B6D4", maxSpots:22, attendees:ns(60,7)  },
];

const DAYS_NO = ["Man","Tir","Ons","Tor","Fre","Lør","Søn"];
const HOURS = ["06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21"];

function TrainerLogin({ onLogin }: { onLogin: (name: string) => void }) {
  const [sel, setSel] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const trainers = Object.values(TRAINER_DATA);
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ width: "32px", height: "32px", background: "var(--orange)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9h4l2-6 2 12 2-6h4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontFamily: "var(--font-syne)", fontSize: "20px", fontWeight: 800 }}>Bergen<span style={{ color: "var(--orange)" }}>Flow</span></span>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(232,93,4,0.1)", border: "1px solid rgba(232,93,4,0.25)", borderRadius: "4px", padding: "3px 10px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--orange)" }} />
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--orange)" }}>Trenerportal</span>
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "14px", padding: "28px" }}>
          <h1 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>Logg inn som trener</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>Velg ditt navn og skriv pinkoden din.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginBottom: "18px" }}>
            {trainers.map(t => (
              <button key={t.name} onClick={() => setSel(t.name)} style={{ padding: "12px 8px", borderRadius: "10px", cursor: "pointer", background: sel === t.name ? `${t.accent}15` : "transparent", border: `1px solid ${sel === t.name ? t.accent + "55" : "var(--border-strong)"}`, display: "flex", alignItems: "center", gap: "10px", transition: "all 0.12s" }}>
                <img src={t.photo} alt={t.name} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${sel === t.name ? t.accent : "var(--border)"}`, opacity: sel === t.name ? 1 : 0.6 }} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "12px", fontWeight: sel === t.name ? 700 : 500, color: sel === t.name ? "var(--text)" : "var(--text-secondary)" }}>{t.name}</div>
                  <div style={{ fontSize: "10px", color: t.accent, opacity: sel === t.name ? 1 : 0.5 }}>{t.role}</div>
                </div>
              </button>
            ))}
          </div>
          <form onSubmit={e => { e.preventDefault(); if (!sel) return; setLoading(true); setTimeout(() => { try { sessionStorage.setItem("bf_trainer", sel); } catch {} setLoading(false); onLogin(sel); }, 600); }} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input type="password" placeholder="Pinkode" value={pin} onChange={e => setPin(e.target.value)} style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "8px", padding: "10px 14px", color: "var(--text)", fontSize: "16px", letterSpacing: "0.3em", outline: "none", boxSizing: "border-box" as const }} />
            <button type="submit" disabled={!sel || loading} style={{ background: !sel ? "var(--surface-2)" : "var(--orange)", color: !sel ? "var(--text-muted)" : "#fff", border: "none", borderRadius: "8px", padding: "12px", fontSize: "14px", fontWeight: 700, cursor: !sel ? "default" : "pointer" }}>{loading ? "Logger inn..." : "Logg inn"}</button>
          </form>
          <div style={{ marginTop: "12px", padding: "10px 12px", background: "rgba(232,93,4,0.05)", border: "1px solid rgba(232,93,4,0.12)", borderRadius: "8px" }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}><span style={{ color: "var(--orange)", fontWeight: 600 }}>Demo</span> — velg et navn og skriv en vilkaarlig pinkode.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrainerPage() {
  const router = useRouter();
  const [trainer, setTrainer]           = useState<typeof TRAINER_DATA[string] | null>(null);
  const [selectedDay, setSelectedDay]   = useState(0);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab]   = useState<"profil"|"tilgjengelighet"|"varsler"|"passord">("profil");
  const [saved, setSaved]               = useState(false);
  const [availability, setAvailability] = useState<Record<string,boolean>>({});
  const [notifications, setNotifications] = useState({ booking: true, cancel: true, change: false, report: true, reminder: true });
  const [profileForm, setProfileForm]   = useState({ name:"", email:"", phone:"", speciality:"", bio:"" });
  const [loggedIn, setLoggedIn]         = useState(false);
  const [checking, setChecking]         = useState(true);
  const [toast, setToast]               = useState("");
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("bf_trainer");
      if (!raw) { setChecking(false); return; }
      const match = Object.values(TRAINER_DATA).find(t => t.name.toLowerCase().includes(raw.toLowerCase()) || t.email.includes(raw.toLowerCase())) || Object.values(TRAINER_DATA)[0];
      setTrainer(match);
      setProfileForm({ name: match.name, email: match.email, phone: match.phone, speciality: match.speciality, bio: match.bio });
      const initAv: Record<string,boolean> = {};
      DAYS_NO.forEach((d,di) => HOURS.forEach(h => { initAv[`${di}-${h}`] = di < 5 && parseInt(h) >= 6 && parseInt(h) <= 19; }));
      setAvailability(initAv);
      setLoggedIn(true);
    } catch {}
    setChecking(false);
  }, [router]);

  function handleLogin(name: string) {
    const match = Object.values(TRAINER_DATA).find(t => t.name === name) || Object.values(TRAINER_DATA)[0];
    setTrainer(match);
    setProfileForm({ name: match.name, email: match.email, phone: match.phone, speciality: match.speciality, bio: match.bio });
    const initAv: Record<string,boolean> = {};
    DAYS_NO.forEach((d,di) => HOURS.forEach(h => { initAv[`${di}-${h}`] = di < 5 && parseInt(h) >= 6 && parseInt(h) <= 19; }));
    setAvailability(initAv);
    setLoggedIn(true);
    setToast(`Logget inn som ${match.name}`);
    setTimeout(() => setToast(""), 2500);
  }

  if (checking) return null;
  if (!loggedIn) return <TrainerLogin onLogin={handleLogin} />;

  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2200); }

  const days = Array.from({length:7}, (_,i) => i);
  const myClasses = trainer ? ALL_CLASSES.filter(c => c.instructor === trainer.name) : [];
  const todaysClasses = myClasses.filter(c => c.dayOffset === selectedDay);
  const totalWeek = myClasses.length;
  const totalAttendees = myClasses.reduce((s,c) => s + c.attendees.length, 0);
  const avgFill = myClasses.length > 0 ? Math.round(myClasses.reduce((s,c) => s + (c.attendees.length/c.maxSpots)*100, 0)/myClasses.length) : 0;
  const nextClass = myClasses.filter(c => c.dayOffset >= 0).sort((a,b) => a.dayOffset - b.dayOffset || a.time.localeCompare(b.time))[0];

  if (!trainer) return null;

  return (
    <div style={{background:"var(--bg)", minHeight:"100vh", color:"var(--text)"}}>

      {/* SETTINGS DRAWER */}
      {settingsOpen && (
        <div style={{position:"fixed", inset:0, zIndex:200}} onClick={e => e.target === e.currentTarget && setSettingsOpen(false)}>
          <div className="drawer" style={{position:"absolute", right:0, top:0, bottom:0, width:"440px", background:"var(--surface)", borderLeft:"1px solid var(--border-strong)", display:"flex", flexDirection:"column", animation:"slideIn 0.18s ease-out"}}>
            <style>{`@keyframes slideIn { from { transform: translateX(30px); opacity: 0 } to { transform: none; opacity: 1 } }`}</style>

            {/* Drawer header */}
            <div style={{padding:"20px 24px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0}}>
              <div style={{fontFamily:"var(--font-syne)", fontSize:"16px", fontWeight:700}}>Innstillinger</div>
              <button onClick={() => setSettingsOpen(false)} style={{color:"var(--text-muted)", fontSize:"18px", lineHeight:1, width:"28px", height:"28px", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"6px"}}>×</button>
            </div>

            {/* Tabs */}
            <div style={{display:"flex", borderBottom:"1px solid var(--border)", flexShrink:0}}>
              {(["profil","tilgjengelighet","varsler","passord"] as const).map(tab => (
                <button key={tab} onClick={() => setSettingsTab(tab)} style={{flex:1, padding:"12px 4px", fontSize:"11px", fontWeight:600, textTransform:"capitalize", background:"none", color:settingsTab===tab ? trainer.accent : "var(--text-muted)", borderBottom:`2px solid ${settingsTab===tab ? trainer.accent : "transparent"}`, transition:"all 0.12s"}}>
                  {tab === "tilgjengelighet" ? "Tilgjeng." : tab.charAt(0).toUpperCase()+tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{flex:1, overflowY:"auto", padding:"24px"}}>

              {settingsTab === "profil" && (
                <div style={{display:"flex", flexDirection:"column", gap:"16px"}}>
                  <div style={{display:"flex", alignItems:"center", gap:"16px", padding:"16px", background:"var(--surface-2)", borderRadius:"12px"}}>
                    <div style={{position:"relative", width:"64px", height:"64px", borderRadius:"50%", overflow:"hidden", border:`2px solid ${trainer.accent}40`, flexShrink:0}}>
                      <Image src={trainer.photo} alt={trainer.name} fill style={{objectFit:"cover"}}/>
                    </div>
                    <div>
                      <div style={{fontWeight:700, fontSize:"15px", marginBottom:"2px"}}>{trainer.name}</div>
                      <div style={{fontSize:"12px", color:"var(--text-muted)"}}>{trainer.role}</div>
                      <button style={{marginTop:"6px", fontSize:"11px", color:trainer.accent, fontWeight:600, textDecoration:"underline"}}>Bytt profilbilde</button>
                    </div>
                  </div>
                  {[
                    {label:"Fullt navn",     key:"name",       type:"text",  ph:"Erik Hansen"},
                    {label:"E-post",          key:"email",      type:"email", ph:"erik@bergenfitness.no"},
                    {label:"Telefon",         key:"phone",      type:"tel",   ph:"+47 900 00 000"},
                    {label:"Spesialitet",     key:"speciality", type:"text",  ph:"HIIT, Boksing"},
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{display:"block", fontSize:"10px", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"6px"}}>{f.label}</label>
                      <input type={f.type} placeholder={f.ph} value={(profileForm as Record<string,string>)[f.key]} onChange={e => setProfileForm(p => ({...p, [f.key]: e.target.value}))}/>
                    </div>
                  ))}
                  <div>
                    <label style={{display:"block", fontSize:"10px", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"6px"}}>Bio</label>
                    <textarea rows={3} value={profileForm.bio} onChange={e => setProfileForm(p => ({...p, bio:e.target.value}))} style={{resize:"vertical"}}/>
                  </div>
                </div>
              )}

              {settingsTab === "tilgjengelighet" && (
                <div>
                  <p style={{fontSize:"12px", color:"var(--text-muted)", marginBottom:"16px", lineHeight:1.6}}>Merk timene du er tilgjengelig for klasser og PT. Administrasjonen ser dette ved oppsett av timeplanen.</p>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%", borderCollapse:"collapse", fontSize:"11px"}}>
                      <thead>
                        <tr>
                          <th style={{padding:"4px 8px", color:"var(--text-muted)", fontWeight:600, textAlign:"left", width:"40px"}}>Kl.</th>
                          {DAYS_NO.map(d => <th key={d} style={{padding:"4px 6px", color:"var(--text-muted)", fontWeight:600, textAlign:"center", width:"36px"}}>{d}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {HOURS.map(h => (
                          <tr key={h}>
                            <td style={{padding:"2px 8px", color:"var(--text-muted)", fontSize:"10px"}}>{h}:00</td>
                            {DAYS_NO.map((_,di) => {
                              const key = `${di}-${h}`;
                              const on = availability[key];
                              return (
                                <td key={di} style={{padding:"2px", textAlign:"center"}}>
                                  <button onClick={() => setAvailability(a => ({...a, [key]:!on}))} style={{width:"28px", height:"28px", borderRadius:"5px", background:on ? `${trainer.accent}20` : "var(--surface-2)", border:`1px solid ${on ? trainer.accent+"50" : "var(--border)"}`, transition:"all 0.1s"}}/>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {settingsTab === "varsler" && (
                <div style={{display:"flex", flexDirection:"column", gap:"2px"}}>
                  <p style={{fontSize:"12px", color:"var(--text-muted)", marginBottom:"16px", lineHeight:1.6}}>Velg hva du ønsker å bli varslet om per e-post og push.</p>
                  {[
                    {key:"booking",  label:"Ny timebestilling",       desc:"Når en deltaker melder seg på din klasse"},
                    {key:"cancel",   label:"Avbestilling",             desc:"Når en deltaker trekker seg fra din klasse"},
                    {key:"change",   label:"Timeplanendringer",        desc:"Hvis din time flyttes eller avlyses"},
                    {key:"reminder", label:"Påminnelse 1 time før",   desc:"Automatisk påminnelse om forestående klasse"},
                    {key:"report",   label:"Ukentlig rapport",         desc:"Oppsummering av dine klasser og fremmøte"},
                  ].map(n => (
                    <div key={n.key} style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background:"var(--surface-2)", borderRadius:"8px", marginBottom:"6px"}}>
                      <div>
                        <div style={{fontSize:"13px", fontWeight:600, marginBottom:"2px"}}>{n.label}</div>
                        <div style={{fontSize:"11px", color:"var(--text-muted)"}}>{n.desc}</div>
                      </div>
                      <button onClick={() => setNotifications(prev => ({...prev, [n.key]: !prev[n.key as keyof typeof prev]}))}
                        style={{width:"40px", height:"22px", borderRadius:"11px", background:(notifications as Record<string,boolean>)[n.key] ? trainer.accent : "rgba(255,255,255,0.1)", border:"none", position:"relative", flexShrink:0, transition:"background 0.2s"}}>
                        <div style={{position:"absolute", top:"2px", left:(notifications as Record<string,boolean>)[n.key] ? "20px" : "2px", width:"18px", height:"18px", borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {settingsTab === "passord" && (
                <div style={{display:"flex", flexDirection:"column", gap:"14px"}}>
                  <p style={{fontSize:"12px", color:"var(--text-muted)", marginBottom:"4px", lineHeight:1.6}}>Passordet må være minst 8 tegn og inneholde én stor bokstav og ett tall.</p>
                  {[
                    {label:"Nåværende passord", ph:"••••••••"},
                    {label:"Nytt passord",       ph:"Minst 8 tegn"},
                    {label:"Bekreft passord",    ph:"Gjenta nytt passord"},
                  ].map(f => (
                    <div key={f.label}>
                      <label style={{display:"block", fontSize:"10px", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"6px"}}>{f.label}</label>
                      <input type="password" placeholder={f.ph}/>
                    </div>
                  ))}
                  <div style={{padding:"10px 14px", background:"rgba(232,93,4,0.06)", border:"1px solid rgba(232,93,4,0.15)", borderRadius:"7px"}}>
                    <p style={{fontSize:"11px", color:"var(--text-muted)"}}>
                      <span style={{color:"var(--orange)", fontWeight:600}}>Demo — </span>
                      Passordet lagres ikke. I produksjon oppdateres det sikkert via e-postbekreftelse.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Save footer */}
            <div style={{padding:"16px 24px", borderTop:"1px solid var(--border)", flexShrink:0, display:"flex", gap:"10px"}}>
              <button onClick={() => setSettingsOpen(false)} style={{flex:1, padding:"11px", borderRadius:"8px", border:"1px solid var(--border-strong)", color:"var(--text-secondary)", fontWeight:600, fontSize:"13px"}}>Avbryt</button>
              <button onClick={handleSave} style={{flex:2, padding:"11px", borderRadius:"8px", background:trainer.accent, color:"#fff", fontWeight:700, fontSize:"13px", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px"}}>
                {saved ? <>✓ Lagret!</> : "Lagre endringer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{background:"rgba(13,27,42,0.97)", borderBottom:"1px solid var(--border)", backdropFilter:"blur(16px)", position:"sticky", top:0, zIndex:50}}>
        <div style={{maxWidth:"1200px", margin:"0 auto", padding:"0 24px", height:"64px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
            <div style={{width:"28px", height:"28px", background:trainer.accent, borderRadius:"6px", display:"flex", alignItems:"center", justifyContent:"center"}}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M2 9h4l2-6 2 12 2-6h4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <span style={{fontFamily:"var(--font-syne)", fontWeight:800, fontSize:"15px"}}>Bergen<span style={{color:trainer.accent}}>Flow</span></span>
              <span style={{fontSize:"11px", color:"var(--text-muted)", marginLeft:"8px", fontWeight:500}}>Trenerportal</span>
            </div>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:"14px"}}>
            {/* Trainer profile chip — clickable for settings */}
            <button onClick={() => setSettingsOpen(true)} style={{display:"flex", alignItems:"center", gap:"10px", padding:"6px 14px 6px 6px", background:"var(--surface)", border:"1px solid var(--border-strong)", borderRadius:"100px", cursor:"pointer", transition:"border-color 0.15s"}}>
              <div style={{position:"relative", width:"32px", height:"32px", borderRadius:"50%", overflow:"hidden", border:`2px solid ${trainer.accent}`}}>
                <Image src={trainer.photo} alt={trainer.name} fill style={{objectFit:"cover"}}/>
              </div>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:"13px", fontWeight:600, lineHeight:1.2, color:"var(--text)"}}>{trainer.name}</div>
                <div style={{fontSize:"10px", color:"var(--text-muted)"}}>{trainer.speciality}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{color:"var(--text-muted)", marginLeft:"4px"}}><path d="M10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="1.5"/><path d="M8.2 2.5l-.4-1.1a.9.9 0 00-.8-.6H5.8a.9.9 0 00-.8.6l-.4 1.1-1 .5L2.5 2.8a.9.9 0 00-1 .2L.6 4a.9.9 0 00-.2 1l.2 1.1-.5 1-1.1.4a.9.9 0 00-.6.8v1.5c0 .4.2.7.6.8l1.1.4.5 1-.2 1.1c-.1.3 0 .7.2 1l.9.9c.3.3.7.3 1 .2l1.1-.2 1 .5.4 1.1c.1.4.4.6.8.6h1.2c.4 0 .7-.2.8-.6l.4-1.1 1-.5 1.1.2c.3.1.7 0 1-.2l.9-.9c.3-.3.3-.7.2-1l-.2-1.1.5-1 1.1-.4c.4-.1.6-.4.6-.8V5.8a.9.9 0 00-.6-.8l-1.1-.4-.5-1 .2-1.1c.1-.3 0-.7-.2-1l-.9-.9a.9.9 0 00-1-.2l-1.1.2-1-.5z" stroke="currentColor" strokeWidth="1.2" transform="translate(3 3) scale(0.7)"/></svg>
            </button>
            <button onClick={() => {try{sessionStorage.removeItem("bf_trainer");}catch{} window.location.href = "https://bergen-fitness.pages.dev";}} style={{background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", color:"#f87171", fontSize:"13px", fontWeight:600, padding:"7px 14px", borderRadius:"6px", cursor:"pointer"}}>Logg ut</button>
          </div>
        </div>
      </header>

      <div style={{maxWidth:"1200px", margin:"0 auto", padding:"32px 24px"}}>

        {/* DEMO BANNER */}
        <div style={{background:`${trainer.accent}0D`, border:`1px solid ${trainer.accent}25`, borderRadius:"8px", padding:"10px 16px", marginBottom:"24px", display:"flex", alignItems:"center", gap:"10px"}}>
          <span style={{fontSize:"10px", fontWeight:800, color:trainer.accent, background:`${trainer.accent}18`, padding:"2px 7px", borderRadius:"3px", letterSpacing:"0.08em", flexShrink:0}}>DEMO</span>
          <p style={{fontSize:"12px", color:"var(--text-muted)", lineHeight:1.5}}>I produksjon vises dine faktiske klasser og deltakerlister her. Deltakere melder seg på via kundeporten — du ser navnene i sanntid.</p>
        </div>

        {/* GREETING */}
        <div style={{display:"flex", alignItems:"center", gap:"16px", marginBottom:"28px"}}>
          <div style={{position:"relative", width:"52px", height:"52px", borderRadius:"50%", overflow:"hidden", border:`2px solid ${trainer.accent}50`, flexShrink:0}}>
            <Image src={trainer.photo} alt={trainer.name} fill style={{objectFit:"cover"}}/>
          </div>
          <div>
            <h1 style={{fontSize:"24px", fontWeight:800, letterSpacing:"-0.02em", marginBottom:"2px"}}>Hei, {trainer.name.split(" ")[0]}</h1>
            <p style={{color:"var(--text-muted)", fontSize:"13px"}}>{fmtDate(today)} · {trainer.role}</p>
          </div>
          {nextClass && (
            <div style={{marginLeft:"auto", padding:"10px 18px", background:"var(--surface)", border:`1px solid ${trainer.accent}30`, borderRadius:"10px", textAlign:"right"}}>
              <div style={{fontSize:"10px", fontWeight:700, color:trainer.accent, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"3px"}}>Neste klasse</div>
              <div style={{fontSize:"14px", fontWeight:700}}>{nextClass.name} kl. {nextClass.time}</div>
              <div style={{fontSize:"11px", color:"var(--text-muted)"}}>{nextClass.attendees.length}/{nextClass.maxSpots} påmeldte</div>
            </div>
          )}
        </div>

        {/* KPI STRIP */}
        <div className="kpi-4" style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"12px", marginBottom:"28px"}}>
          {[
            {label:"Timer denne uken", value:String(totalWeek),        accent:trainer.accent},
            {label:"Påmeldte totalt",  value:String(totalAttendees),   accent:"var(--orange)"},
            {label:"Gjennomsnittlig fyllgrad", value:`${avgFill}%`,   accent:"#22c55e"},
            {label:"Vurdering",        value:"4.9 / 5",                accent:"#f59e0b"},
          ].map(kpi => (
            <div key={kpi.label} style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"18px 20px"}}>
              <div style={{fontSize:"10px", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px"}}>{kpi.label}</div>
              <div style={{fontFamily:"var(--font-syne)", fontSize:"28px", fontWeight:800, color:kpi.accent}}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* DAY PICKER */}
        <div style={{display:"flex", gap:"8px", overflowX:"auto", marginBottom:"24px", paddingBottom:"4px"}}>
          {days.map(d => {
            const date = addDays(today, d);
            const count = myClasses.filter(c => c.dayOffset === d).length;
            const isSel = selectedDay === d;
            return (
              <button key={d} onClick={() => setSelectedDay(d)} style={{minWidth:"80px", padding:"12px 10px", borderRadius:"10px", textAlign:"center", background:isSel ? trainer.accent : "var(--surface)", border:isSel?"none":"1px solid var(--border-strong)", color:"#fff", flexShrink:0}}>
                <div style={{fontSize:"11px", color:isSel?"rgba(255,255,255,0.7)":"var(--text-muted)", textTransform:"capitalize"}}>
                  {d===0?"I dag":d===1?"I morgen":date.toLocaleDateString("no-NO",{weekday:"short"})}
                </div>
                <div style={{fontSize:"20px", fontWeight:800, fontFamily:"var(--font-syne)"}}>{date.getDate()}</div>
                <div style={{fontSize:"10px", color:isSel?"rgba(255,255,255,0.6)":"var(--text-muted)"}}>{count>0?`${count} time${count>1?"r":""}`:"Fri"}</div>
              </button>
            );
          })}
        </div>

        {/* CLASS LIST */}
        {todaysClasses.length === 0 ? (
          <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"48px", textAlign:"center"}}>
            <p style={{color:"var(--text-muted)", fontSize:"15px"}}>Ingen timer denne dagen. Nyt fridagen!</p>
          </div>
        ) : (
          <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
            {todaysClasses.map(cls => {
              const isExpanded = expandedClass === cls.id;
              const fillPct = Math.round((cls.attendees.length/cls.maxSpots)*100);
              const isFull = cls.attendees.length >= cls.maxSpots;
              return (
                <div key={cls.id} style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", overflow:"hidden"}}>
                  <button onClick={() => setExpandedClass(isExpanded ? null : cls.id)}
                    style={{width:"100%", padding:"18px 22px", display:"flex", alignItems:"center", justifyContent:"space-between", textAlign:"left"}}>
                    <div style={{display:"flex", alignItems:"center", gap:"16px"}}>
                      <div style={{width:"4px", height:"44px", background:cls.color, borderRadius:"2px"}}/>
                      <div>
                        <div style={{display:"flex", alignItems:"center", gap:"8px", marginBottom:"3px"}}>
                          <span style={{fontWeight:700, fontSize:"16px", color:"var(--text)"}}>{cls.name}</span>
                          <span style={{fontSize:"10px", fontWeight:700, color:cls.color, background:`${cls.color}15`, padding:"2px 7px", borderRadius:"4px"}}>{cls.category}</span>
                          {isFull && <span style={{fontSize:"10px", fontWeight:700, color:"#f87171", background:"rgba(248,113,113,0.1)", padding:"2px 7px", borderRadius:"4px"}}>FULLT</span>}
                        </div>
                        <div style={{color:"var(--text-muted)", fontSize:"12px"}}>kl. {cls.time} · {cls.duration} min · {fmtDate(addDays(today, cls.dayOffset))}</div>
                      </div>
                    </div>
                    <div style={{display:"flex", alignItems:"center", gap:"16px"}}>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:"15px", fontWeight:700}}>{cls.attendees.length}/{cls.maxSpots}</div>
                        <div style={{width:"64px", height:"4px", background:"rgba(255,255,255,0.08)", borderRadius:"2px", overflow:"hidden", marginTop:"4px"}}>
                          <div style={{width:`${fillPct}%`, height:"100%", background:isFull?"#f87171":cls.color, borderRadius:"2px"}}/>
                        </div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{transform:isExpanded?"rotate(180deg)":"rotate(0)", transition:"transform 0.15s", color:"var(--text-muted)"}}>
                        <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </button>
                  {isExpanded && (
                    <div style={{borderTop:"1px solid var(--border)", padding:"18px 22px"}}>
                      <div style={{fontSize:"11px", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"12px"}}>Deltakerliste ({cls.attendees.length})</div>
                      <div className="att-grid" style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:"6px"}}>
                        {cls.attendees.map((name, i) => (
                          <div key={i} style={{display:"flex", alignItems:"center", gap:"9px", padding:"9px 12px", background:"var(--surface-2)", borderRadius:"7px", fontSize:"13px"}}>
                            <div style={{width:"26px", height:"26px", borderRadius:"50%", background:`${cls.color}20`, border:`1px solid ${cls.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", fontWeight:700, color:cls.color, flexShrink:0}}>
                              {name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                            </div>
                            <span style={{fontSize:"13px", fontWeight:500}}>{name}</span>
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
        style={{position:"fixed", bottom:"24px", right:"24px", background:"var(--orange)", color:"#fff", borderRadius:"100px", padding:"10px 18px", fontSize:"12px", fontWeight:700, boxShadow:"0 4px 20px rgba(232,93,4,0.4)", zIndex:40, textDecoration:"none"}}>
        Bygget av Sloth Studio →
      </a>
      {toast && <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: "10px", padding: "12px 24px", color: "#86efac", fontSize: "14px", fontWeight: 600, zIndex: 300, whiteSpace: "nowrap", backdropFilter: "blur(8px)" }}>{toast}</div>}
    </div>
  );
}
