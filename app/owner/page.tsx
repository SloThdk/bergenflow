"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Period = "uke" | "mnd" | "ar";

const REVENUE: Record<Period, { labels: string[]; values: number[]; total: string; members: string; fill: string; classes: string; newMembers: string }> = {
  uke: { labels:["Man","Tir","Ons","Tor","Fre","Lør","Søn"], values:[18400,22100,19800,24500,26300,12800,8600], total:"kr 132.500", members:"487",  fill:"82%", classes:"48",    newMembers:"12" },
  mnd: { labels:["Uke 1","Uke 2","Uke 3","Uke 4"],            values:[128000,134500,141200,132500],             total:"kr 536.200", members:"512",  fill:"79%", classes:"192",   newMembers:"38" },
  ar:  { labels:["Jan","Feb","Mar","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Des"], values:[498000,512000,534000,548000,562000,510000,420000,545000,578000,592000,536000,520000], total:"kr 6.355.000", members:"548", fill:"76%", classes:"2.304", newMembers:"287" },
};

const TODAY_SCHEDULE = [
  { time:"06:00", name:"HIIT-Økt",     trainer:"Erik Hansen",  trainerPhoto:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face", booked:17, max:20, color:"#EF4444" },
  { time:"09:00", name:"Morgen-Yoga",  trainer:"Lise Dahl",    trainerPhoto:"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=40&h=40&fit=crop&crop=face", booked:10, max:18, color:"#8B5CF6" },
  { time:"12:00", name:"Styrkesirkel", trainer:"Mads Berg",    trainerPhoto:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=40&h=40&fit=crop",           booked:16, max:16, color:"#F97316" },
  { time:"18:00", name:"Spinning",     trainer:"Sara Moe",     trainerPhoto:"https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=40&h=40&fit=crop&crop=face", booked:17, max:22, color:"#06B6D4" },
  { time:"19:30", name:"Boksing",      trainer:"Erik Hansen",  trainerPhoto:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face", booked:12, max:14, color:"#DC2626" },
];

const TOP_CLASSES = [
  { name:"HIIT-Økt",     fill:92, sessions:12, color:"#EF4444" },
  { name:"CrossFit",     fill:88, sessions:8,  color:"#EAB308" },
  { name:"Boksing",      fill:85, sessions:10, color:"#DC2626" },
  { name:"Spinning",     fill:78, sessions:12, color:"#06B6D4" },
  { name:"Styrke",       fill:75, sessions:8,  color:"#F97316" },
  { name:"Yoga",         fill:68, sessions:10, color:"#8B5CF6" },
];

const TRAINERS_PERF = [
  { name:"Erik Hansen",  photo:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face", classes:22, avgFill:91, rating:4.9, speciality:"HIIT & Boksing",     accent:"#EF4444" },
  { name:"Mads Berg",    photo:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=80&h=80&fit=crop",           classes:18, avgFill:86, rating:4.8, speciality:"Styrke & CrossFit",   accent:"#F97316" },
  { name:"Sara Moe",     photo:"https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=80&h=80&fit=crop&crop=face", classes:20, avgFill:78, rating:4.7, speciality:"Spinning & Kondisjon",accent:"#06B6D4" },
  { name:"Lise Dahl",    photo:"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face", classes:18, avgFill:72, rating:4.9, speciality:"Yoga & Pilates",      accent:"#8B5CF6" },
];

const RECENT_MEMBERS = [
  { name:"Tobias Larsen",   plan:"Elite",   joined:"I dag",      avatar:"TL" },
  { name:"Emilie Haugen",   plan:"Pro",     joined:"I dag",      avatar:"EH" },
  { name:"Sander Nygård",   plan:"Starter", joined:"I går",      avatar:"SN" },
  { name:"Kristine Bakke",  plan:"Elite",   joined:"I går",      avatar:"KB" },
  { name:"Jonas Berg",      plan:"Elite",   joined:"2 dager",    avatar:"JB" },
  { name:"Maja Christensen",plan:"Starter", joined:"2 dager",    avatar:"MC" },
  { name:"Axel Strand",     plan:"Pro",     joined:"3 dager",    avatar:"AS" },
  { name:"Nora Moen",       plan:"Elite",   joined:"3 dager",    avatar:"NM" },
];

const PLAN_BREAKDOWN = [
  { plan:"Elite",   count:241, pct:49, color:"#E85D04" },
  { plan:"Starter", count:157, pct:32, color:"#22c55e"  },
  { plan:"Pro",     count:89,  pct:18, color:"#B8985A"  },
];

const planColor: Record<string,string> = { Elite:"#E85D04", Pro:"#B8985A", Starter:"#22c55e" };

export default function OwnerPage() {
  const router = useRouter();
  const [authed, setAuthed]   = useState(false);
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [period, setPeriod]   = useState<Period>("uke");
  const today = useMemo(() => new Date(), []);

  useEffect(() => { try { if (sessionStorage.getItem("bf_owner_bf")==="1") setAuthed(true); } catch {} }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim().toLowerCase() !== "owner@bergenfitness.no") { setError("Bruk owner@bergenfitness.no for demo."); return; }
    try { sessionStorage.setItem("bf_owner_bf","1"); } catch {}
    setAuthed(true);
  }

  const rev = REVENUE[period];
  const maxVal = Math.max(...rev.values);

  if (!authed) {
    return (
      <div style={{minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px"}}>
        <div style={{width:"100%", maxWidth:"400px"}}>
          <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"36px"}}>
            <div style={{width:"36px", height:"36px", background:"#B8985A", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center"}}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9h4l2-6 2 12 2-6h4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div style={{fontFamily:"var(--font-syne)", fontWeight:800, fontSize:"16px"}}>Eierportal</div>
              <div style={{fontSize:"11px", color:"var(--text-muted)"}}>Bergen Fitness</div>
            </div>
          </div>
          <h1 style={{fontSize:"22px", fontWeight:700, marginBottom:"6px"}}>Logg inn som eier</h1>
          <p style={{color:"var(--text-muted)", fontSize:"13px", marginBottom:"24px"}}>Full oversikt over Bergen Fitness.</p>
          <form onSubmit={handleLogin} style={{display:"flex", flexDirection:"column", gap:"14px"}}>
            <input type="email" placeholder="owner@bergenfitness.no" value={email} onChange={e=>{setEmail(e.target.value);setError("");}}/>
            <input type="password" placeholder="Valgfritt passord" value={password} onChange={e=>setPassword(e.target.value)}/>
            {error && <p style={{fontSize:"12px", color:"#f87171", padding:"8px 12px", background:"rgba(248,113,113,0.08)", borderRadius:"6px"}}>{error}</p>}
            <button type="submit" style={{background:"#B8985A", color:"#fff", borderRadius:"9px", padding:"13px", fontSize:"14px", fontWeight:700}}>Gå til oversikt</button>
          </form>
          <div style={{marginTop:"14px", padding:"10px 14px", background:"rgba(184,152,90,0.06)", border:"1px solid rgba(184,152,90,0.15)", borderRadius:"7px"}}>
            <p style={{fontSize:"11px", color:"var(--text-muted)"}}><span style={{color:"#B8985A", fontWeight:600}}>Demo</span> — E-post: owner@bergenfitness.no · valgfritt passord</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:"var(--bg)", minHeight:"100vh", color:"var(--text)"}}>
      <header style={{background:"rgba(13,27,42,0.97)", borderBottom:"1px solid var(--border)", backdropFilter:"blur(16px)", position:"sticky", top:0, zIndex:50}}>
        <div style={{maxWidth:"1280px", margin:"0 auto", padding:"0 24px", height:"60px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
            <div style={{width:"28px", height:"28px", background:"#B8985A", borderRadius:"6px", display:"flex", alignItems:"center", justifyContent:"center"}}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M2 9h4l2-6 2 12 2-6h4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{fontFamily:"var(--font-syne)", fontWeight:800, fontSize:"15px"}}>Bergen<span style={{color:"#B8985A"}}>Flow</span> <span style={{fontSize:"11px", fontWeight:500, color:"var(--text-muted)"}}>Eierportal</span></span>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
            <span style={{fontSize:"10px", fontWeight:700, color:"#B8985A", background:"rgba(184,152,90,0.1)", border:"1px solid rgba(184,152,90,0.2)", padding:"4px 10px", borderRadius:"4px"}}>Demo</span>
            <button onClick={()=>{try{sessionStorage.removeItem("bf_owner_bf");}catch{} router.push("/");}} style={{color:"var(--text-muted)", fontSize:"13px", padding:"6px 12px", border:"1px solid var(--border-strong)", borderRadius:"6px"}}>Logg ut</button>
          </div>
        </div>
      </header>

      <div style={{maxWidth:"1280px", margin:"0 auto", padding:"28px 24px"}}>

        {/* DEMO BANNER */}
        <div style={{background:"rgba(184,152,90,0.06)", border:"1px solid rgba(184,152,90,0.18)", borderRadius:"8px", padding:"10px 16px", marginBottom:"24px", display:"flex", alignItems:"center", gap:"10px"}}>
          <span style={{fontSize:"10px", fontWeight:800, color:"#B8985A", flexShrink:0}}>DEMO</span>
          <p style={{fontSize:"12px", color:"var(--text-muted)"}}>I produksjon kobles dette til ekte betalinger, bookinger og medlemsdata i sanntid.</p>
        </div>

        {/* PAGE TITLE */}
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px"}}>
          <div>
            <h1 style={{fontSize:"26px", fontWeight:800, letterSpacing:"-0.02em", marginBottom:"3px"}}>Oversikt</h1>
            <p style={{color:"var(--text-muted)", fontSize:"13px"}}>{today.toLocaleDateString("no-NO",{weekday:"long", day:"numeric", month:"long", year:"numeric"})}</p>
          </div>
        </div>

        {/* KPI STRIP */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:"10px", marginBottom:"24px"}}>
          {[
            {label:"Omsetning",            value:rev.total,       accent:"#22c55e",  icon:"M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 14.5V18h-2v-1.5c-1.4-.3-2.5-1.3-2.5-2.5h2c0 .6.7 1 1.5 1s1.5-.4 1.5-1-.5-1-1.5-1.3C10.2 12.2 9 11.2 9 9.5c0-1.2 1.1-2.2 2.5-2.5V5.5h2V7c1.4.3 2.5 1.3 2.5 2.5h-2c0-.6-.7-1-1.5-1s-1.5.4-1.5 1 .5 1 1.5 1.3c1.8.5 3 1.5 3 3.2 0 1.2-1.1 2.2-2.5 2.5z"},
            {label:"Aktive medlemmer",     value:rev.members,     accent:"#E85D04",  icon:"M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"},
            {label:"Nye dette uke",        value:`+${rev.newMembers}`, accent:"#7BA3C4", icon:"M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM3 20a6 6 0 0 1 12 0v1H3v-1z"},
            {label:"Gjn. fyllgrad",        value:rev.fill,        accent:"#f59e0b",  icon:"M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"},
            {label:"Timer avholdt",        value:rev.classes,     accent:"#8B5CF6",  icon:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"},
          ].map(kpi => (
            <div key={kpi.label} style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"18px"}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px"}}>
                <div style={{fontSize:"10px", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.09em"}}>{kpi.label}</div>
                <div style={{width:"28px", height:"28px", borderRadius:"7px", background:`${kpi.accent}15`, display:"flex", alignItems:"center", justifyContent:"center"}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{color:kpi.accent}}><path d={kpi.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
              <div style={{fontFamily:"var(--font-syne)", fontSize:"26px", fontWeight:800, color:kpi.accent, letterSpacing:"-0.02em"}}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* REVENUE CHART */}
        <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"24px", marginBottom:"20px"}}>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px"}}>
            <h2 style={{fontSize:"15px", fontWeight:700}}>Omsetning</h2>
            <div style={{display:"flex", gap:"4px", background:"var(--surface-2)", borderRadius:"8px", padding:"3px"}}>
              {(["uke","mnd","ar"] as Period[]).map(p => (
                <button key={p} onClick={()=>setPeriod(p)} style={{padding:"6px 14px", borderRadius:"5px", fontSize:"12px", fontWeight:600, background:period===p?"#B8985A":"transparent", color:period===p?"#fff":"var(--text-muted)", border:"none", transition:"all 0.12s"}}>
                  {p==="uke"?"Uke":p==="mnd"?"Måned":"År"}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"flex", alignItems:"flex-end", gap:period==="ar"?"4px":"8px", height:"160px"}}>
            {rev.values.map((val,i)=>(
              <div key={i} style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"5px"}}>
                <div style={{fontSize:"9px", color:"var(--text-muted)", fontWeight:500}}>{val>=1000?`${(val/1000).toFixed(0)}k`:val}</div>
                <div style={{width:"100%", height:`${(val/maxVal)*130}px`, background:`linear-gradient(to top, #B8985A, #D4B47A)`, borderRadius:"4px 4px 0 0", transition:"height 0.3s", minHeight:"4px"}}/>
                <div style={{fontSize:"9px", color:"var(--text-muted)", textAlign:"center"}}>{rev.labels[i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ROW 2: Today schedule + Top classes */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", marginBottom:"20px"}}>

          {/* TODAY'S SCHEDULE */}
          <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"22px"}}>
            <h2 style={{fontSize:"15px", fontWeight:700, marginBottom:"16px"}}>Dagens timeplan</h2>
            <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
              {TODAY_SCHEDULE.map((cls,i)=>{
                const fill = Math.round((cls.booked/cls.max)*100);
                const isFull = cls.booked >= cls.max;
                return (
                  <div key={i} style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:"var(--surface-2)", borderRadius:"8px"}}>
                    <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
                      <div style={{width:"3px", height:"36px", background:cls.color, borderRadius:"1.5px", flexShrink:0}}/>
                      <div style={{position:"relative", width:"28px", height:"28px", borderRadius:"50%", overflow:"hidden", flexShrink:0}}>
                        <Image src={cls.trainerPhoto} alt={cls.trainer} fill style={{objectFit:"cover"}}/>
                      </div>
                      <div>
                        <div style={{fontWeight:600, fontSize:"13px", marginBottom:"1px"}}>{cls.name}</div>
                        <div style={{fontSize:"11px", color:"var(--text-muted)"}}>kl. {cls.time} · {cls.trainer}</div>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:"13px", fontWeight:700, color:isFull?"#f87171":"var(--text)"}}>{cls.booked}/{cls.max}</div>
                      <div style={{width:"48px", height:"3px", background:"rgba(255,255,255,0.08)", borderRadius:"2px", overflow:"hidden", marginTop:"3px", marginLeft:"auto"}}>
                        <div style={{width:`${fill}%`, height:"100%", background:isFull?"#f87171":cls.color}}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TOP CLASSES + PLAN BREAKDOWN */}
          <div style={{display:"flex", flexDirection:"column", gap:"12px"}}>
            <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"22px", flex:1}}>
              <h2 style={{fontSize:"15px", fontWeight:700, marginBottom:"14px"}}>Populære klasser</h2>
              <div style={{display:"flex", flexDirection:"column", gap:"7px"}}>
                {TOP_CLASSES.map(cls=>(
                  <div key={cls.name} style={{display:"flex", alignItems:"center", gap:"10px"}}>
                    <div style={{width:"8px", height:"8px", borderRadius:"2px", background:cls.color, flexShrink:0}}/>
                    <span style={{fontSize:"12px", fontWeight:500, flex:1}}>{cls.name}</span>
                    <div style={{flex:2, height:"5px", background:"rgba(255,255,255,0.06)", borderRadius:"3px", overflow:"hidden"}}>
                      <div style={{width:`${cls.fill}%`, height:"100%", background:cls.color, borderRadius:"3px"}}/>
                    </div>
                    <span style={{fontSize:"12px", fontWeight:700, color:cls.fill>=85?"#22c55e":cls.fill>=70?"#f59e0b":"var(--text-secondary)", minWidth:"36px", textAlign:"right"}}>{cls.fill}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PLAN BREAKDOWN */}
            <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"22px"}}>
              <h2 style={{fontSize:"15px", fontWeight:700, marginBottom:"14px"}}>Abonnementsfordeling</h2>
              <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
                {PLAN_BREAKDOWN.map(p=>(
                  <div key={p.plan} style={{display:"flex", alignItems:"center", gap:"10px"}}>
                    <span style={{fontSize:"11px", fontWeight:700, color:p.color, minWidth:"52px"}}>{p.plan}</span>
                    <div style={{flex:1, height:"6px", background:"rgba(255,255,255,0.06)", borderRadius:"3px", overflow:"hidden"}}>
                      <div style={{width:`${p.pct}%`, height:"100%", background:p.color, borderRadius:"3px"}}/>
                    </div>
                    <span style={{fontSize:"12px", fontWeight:600, color:"var(--text-secondary)", minWidth:"56px", textAlign:"right"}}>{p.count} ({p.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: Recent sign-ups + Trainer performance */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", marginBottom:"20px"}}>

          {/* RECENT SIGN-UPS */}
          <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"22px"}}>
            <h2 style={{fontSize:"15px", fontWeight:700, marginBottom:"16px"}}>Nye medlemmer</h2>
            <div style={{display:"flex", flexDirection:"column", gap:"7px"}}>
              {RECENT_MEMBERS.map((m,i)=>(
                <div key={i} style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 13px", background:"var(--surface-2)", borderRadius:"8px"}}>
                  <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                    <div style={{width:"32px", height:"32px", borderRadius:"50%", background:`${planColor[m.plan]}20`, border:`1px solid ${planColor[m.plan]}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", fontWeight:800, color:planColor[m.plan], flexShrink:0}}>
                      {m.avatar}
                    </div>
                    <div>
                      <div style={{fontSize:"13px", fontWeight:600, marginBottom:"1px"}}>{m.name}</div>
                      <span style={{fontSize:"10px", fontWeight:700, color:planColor[m.plan], background:`${planColor[m.plan]}15`, padding:"1px 6px", borderRadius:"3px"}}>{m.plan}</span>
                    </div>
                  </div>
                  <span style={{fontSize:"11px", color:"var(--text-muted)"}}>{m.joined}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TRAINER PERFORMANCE */}
          <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"22px"}}>
            <h2 style={{fontSize:"15px", fontWeight:700, marginBottom:"16px"}}>Treneroversikt</h2>
            <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
              {TRAINERS_PERF.map(t=>(
                <div key={t.name} style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 13px", background:"var(--surface-2)", borderRadius:"8px"}}>
                  <div style={{display:"flex", alignItems:"center", gap:"11px"}}>
                    <div style={{position:"relative", width:"36px", height:"36px", borderRadius:"50%", overflow:"hidden", border:`1.5px solid ${t.accent}40`, flexShrink:0}}>
                      <Image src={t.photo} alt={t.name} fill style={{objectFit:"cover"}}/>
                    </div>
                    <div>
                      <div style={{fontSize:"13px", fontWeight:600, marginBottom:"1px"}}>{t.name}</div>
                      <div style={{fontSize:"10px", color:"var(--text-muted)"}}>{t.speciality}</div>
                    </div>
                  </div>
                  <div style={{display:"flex", gap:"20px", textAlign:"right"}}>
                    <div>
                      <div style={{fontSize:"14px", fontWeight:800, fontFamily:"var(--font-syne)", color:t.accent}}>{t.avgFill}%</div>
                      <div style={{fontSize:"9px", color:"var(--text-muted)"}}>fyllgrad</div>
                    </div>
                    <div>
                      <div style={{fontSize:"14px", fontWeight:800, fontFamily:"var(--font-syne)", color:"#f59e0b"}}>{t.rating}</div>
                      <div style={{fontSize:"9px", color:"var(--text-muted)"}}>vurdering</div>
                    </div>
                    <div>
                      <div style={{fontSize:"14px", fontWeight:800, fontFamily:"var(--font-syne)", color:"var(--text)"}}>{t.classes}</div>
                      <div style={{fontSize:"9px", color:"var(--text-muted)"}}>timer</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer"
        style={{position:"fixed", bottom:"24px", right:"24px", background:"var(--orange)", color:"#fff", borderRadius:"100px", padding:"10px 18px", fontSize:"12px", fontWeight:700, boxShadow:"0 4px 20px rgba(232,93,4,0.4)", zIndex:50, textDecoration:"none"}}>
        Bygget av Sloth Studio →
      </a>
    </div>
  );
}
