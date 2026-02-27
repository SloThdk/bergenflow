"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Period = "uke" | "mnd" | "ar";

const REVENUE: Record<Period, { labels: string[]; values: number[]; total: string; members: string; fill: string; classes: string; newMembers: string; deltas: [string,string,string,string,string] }> = {
  uke: { labels:["Man","Tir","Ons","Tor","Fre","L\u00f8r","S\u00f8n"], values:[18400,22100,19800,24500,26300,12800,8600], total:"kr 132.500", members:"487", fill:"82%", classes:"48", newMembers:"12", deltas:["+8,2%","+3,1%","+12","+4pp","+6"] },
  mnd: { labels:["Uke 1","Uke 2","Uke 3","Uke 4"], values:[128000,134500,141200,132500], total:"kr 536.200", members:"512", fill:"79%", classes:"192", newMembers:"38", deltas:["+12,4%","+5,2%","+38","+2pp","+18"] },
  ar:  { labels:["Jan","Feb","Mar","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Des"], values:[498000,512000,534000,548000,562000,510000,420000,545000,578000,592000,536000,520000], total:"kr 6.355.000", members:"548", fill:"76%", classes:"2.304", newMembers:"287", deltas:["+14,8%","+9,6%","+287","-1pp","+204"] },
};

const TODAY_SCHEDULE = [
  { time:"06:00", name:"HIIT-\u00d8kt",     trainer:"Erik Hansen",  trainerPhoto:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face", booked:17, max:20, color:"#EF4444" },
  { time:"09:00", name:"Morgen-Yoga",  trainer:"Lise Dahl",    trainerPhoto:"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=40&h=40&fit=crop&crop=face", booked:10, max:18, color:"#8B5CF6" },
  { time:"12:00", name:"Styrkesirkel", trainer:"Mads Berg",    trainerPhoto:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=40&h=40&fit=crop",           booked:16, max:16, color:"#F97316" },
  { time:"18:00", name:"Spinning",     trainer:"Sara Moe",     trainerPhoto:"https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=40&h=40&fit=crop&crop=face", booked:17, max:22, color:"#06B6D4" },
  { time:"19:30", name:"Boksing",      trainer:"Erik Hansen",  trainerPhoto:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face", booked:12, max:14, color:"#DC2626" },
];

const TOP_CLASSES = [
  { name:"HIIT-\u00d8kt",     fill:92, sessions:12, color:"#EF4444" },
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
  { name:"Sander Nyg\u00e5rd",   plan:"Starter", joined:"I g\u00e5r",      avatar:"SN" },
  { name:"Kristine Bakke",  plan:"Elite",   joined:"I g\u00e5r",      avatar:"KB" },
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

function StarRating({ rating, color }: { rating: number; color: string }) {
  return (
    <svg width="70" height="14" viewBox="0 0 70 14">
      {[0,1,2,3,4].map(i => {
        const fill = Math.min(1, Math.max(0, rating - i));
        const id = `star-${color.replace('#','')}-${i}`;
        return (
          <g key={i} transform={`translate(${i * 14.5}, 0)`}>
            <defs>
              <linearGradient id={id}>
                <stop offset={`${fill * 100}%`} stopColor={color} />
                <stop offset={`${fill * 100}%`} stopColor="rgba(255,255,255,0.1)" />
              </linearGradient>
            </defs>
            <path d="M6.5 1l1.8 3.7L12.5 5.3 9.5 8.2l.7 4.3L6.5 10.5 2.8 12.5l.7-4.3L.5 5.3l4.2-.6z" fill={`url(#${id})`} />
          </g>
        );
      })}
    </svg>
  );
}

function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,${h} ${points.join(" ")} ${w},${h}`} fill={`${color}20`} stroke="none" />
    </svg>
  );
}

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
            <button type="submit" style={{background:"#B8985A", color:"#fff", borderRadius:"9px", padding:"13px", fontSize:"14px", fontWeight:700}}>G\u00e5 til oversikt</button>
          </form>
          <div style={{marginTop:"14px", padding:"10px 14px", background:"rgba(184,152,90,0.06)", border:"1px solid rgba(184,152,90,0.15)", borderRadius:"7px"}}>
            <p style={{fontSize:"11px", color:"var(--text-muted)"}}><span style={{color:"#B8985A", fontWeight:600}}>Demo</span> -- E-post: owner@bergenfitness.no -- valgfritt passord</p>
          </div>
        </div>
      </div>
    );
  }

  // Revenue SVG area chart
  const chartW = 700;
  const chartH = 180;
  const chartPadL = 55;
  const chartPadR = 20;
  const chartPadT = 20;
  const chartPadB = 30;
  const plotW = chartW - chartPadL - chartPadR;
  const plotH = chartH - chartPadT - chartPadB;
  const peakIdx = rev.values.indexOf(maxVal);
  const gridLines = 4;
  const chartPoints = rev.values.map((v, i) => {
    const x = chartPadL + (i / (rev.values.length - 1)) * plotW;
    const y = chartPadT + plotH - (v / maxVal) * plotH;
    return { x, y };
  });
  const linePath = chartPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${chartPoints[chartPoints.length-1].x},${chartPadT + plotH} L${chartPoints[0].x},${chartPadT + plotH} Z`;

  const kpis = [
    { label:"Omsetning", value:rev.total, accent:"#22c55e", delta:rev.deltas[0], up:true },
    { label:"Aktive medlemmer", value:rev.members, accent:"#E85D04", delta:rev.deltas[1], up:true },
    { label:"Nye denne perioden", value:`+${rev.newMembers}`, accent:"#7BA3C4", delta:rev.deltas[2], up:true },
    { label:"Gjn. fyllgrad", value:rev.fill, accent:"#f59e0b", delta:rev.deltas[3], up:!rev.deltas[3].startsWith("-") },
    { label:"Timer avholdt", value:rev.classes, accent:"#8B5CF6", delta:rev.deltas[4], up:true },
  ];

  return (
    <div style={{background:"var(--bg)", minHeight:"100vh", color:"var(--text)"}}>
      {/* STICKY HEADER */}
      <header style={{background:"rgba(13,27,42,0.97)", backdropFilter:"blur(16px)", position:"sticky", top:0, zIndex:50, borderBottom:"none"}}>
        <div style={{maxWidth:"1280px", margin:"0 auto", padding:"0 24px", height:"60px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <span style={{fontFamily:"var(--font-syne)", fontWeight:800, fontSize:"18px"}}>Bergen Fitness</span>
          <span style={{fontSize:"13px", color:"var(--text-secondary)"}}>{today.toLocaleDateString("no-NO",{weekday:"long", day:"numeric", month:"long", year:"numeric"})}</span>
          <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
            <span style={{fontSize:"10px", fontWeight:700, color:"#B8985A", background:"rgba(184,152,90,0.1)", border:"1px solid rgba(184,152,90,0.2)", padding:"4px 10px", borderRadius:"4px"}}>DEMO</span>
            <button onClick={()=>{try{sessionStorage.removeItem("bf_owner_bf");}catch{} router.push("/");}} style={{color:"var(--text-muted)", fontSize:"13px", padding:"6px 14px", border:"1px solid var(--border-strong)", borderRadius:"6px", background:"transparent", cursor:"pointer"}}>Logg ut</button>
          </div>
        </div>
        <div style={{height:"2px", background:"linear-gradient(90deg, transparent, #E85D04, transparent)"}} />
      </header>

      <div style={{maxWidth:"1280px", margin:"0 auto", padding:"32px 24px"}}>

        {/* DEMO BANNER */}
        <div style={{background:"rgba(184,152,90,0.06)", border:"1px solid rgba(184,152,90,0.18)", borderRadius:"8px", padding:"10px 16px", marginBottom:"32px", display:"flex", alignItems:"center", gap:"10px"}}>
          <span style={{fontSize:"10px", fontWeight:800, color:"#B8985A", flexShrink:0}}>DEMO</span>
          <p style={{fontSize:"12px", color:"var(--text-muted)", margin:0}}>I produksjon kobles dette til ekte betalinger, bookinger og medlemsdata i sanntid.</p>
        </div>

        {/* PAGE TITLE */}
        <div style={{marginBottom:"32px"}}>
          <div style={{fontSize:"10px", fontWeight:700, color:"#E85D04", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:"6px"}}>EIERPORTAL</div>
          <h1 style={{fontSize:"28px", fontWeight:800, letterSpacing:"-0.02em", fontFamily:"var(--font-syne)", margin:0}}>Oversikt</h1>
        </div>

        {/* PERIOD TABS */}
        <div style={{display:"flex", gap:"4px", background:"var(--surface)", borderRadius:"10px", padding:"4px", marginBottom:"24px", width:"fit-content"}}>
          {(["uke","mnd","ar"] as Period[]).map(p => (
            <button key={p} onClick={()=>setPeriod(p)} style={{padding:"8px 20px", borderRadius:"7px", fontSize:"13px", fontWeight:600, background:period===p?"#E85D04":"transparent", color:period===p?"#fff":"var(--text-muted)", border:"none", cursor:"pointer", transition:"all 0.15s", fontFamily:"var(--font-syne)"}}>
              {p==="uke"?"Uke":p==="mnd"?"M\u00e5ned":"\u00c5r"}
            </button>
          ))}
        </div>

        {/* KPI STRIP */}
        <div className="kpi-5" style={{display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:"12px", marginBottom:"40px"}}>
          {kpis.map(kpi => (
            <div key={kpi.label} style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"20px 20px 16px 20px", boxShadow:"0 1px 3px rgba(0,0,0,0.3)", position:"relative", overflow:"hidden"}}>
              <div style={{position:"absolute", left:0, top:0, bottom:0, width:"3px", background:kpi.accent}} />
              <div style={{fontSize:"10px", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px"}}>{kpi.label}</div>
              <div style={{display:"flex", alignItems:"baseline", gap:"8px", marginBottom:"8px"}}>
                <div style={{fontFamily:"var(--font-syne)", fontSize:"26px", fontWeight:800, letterSpacing:"-0.02em"}}>{kpi.value}</div>
                <span style={{fontSize:"11px", fontWeight:700, color:kpi.up?"#22c55e":"#f87171", background:kpi.up?"rgba(34,197,94,0.1)":"rgba(248,113,113,0.1)", padding:"2px 6px", borderRadius:"4px"}}>
                  {kpi.up?"\u2191":"\u2193"} {kpi.delta}
                </span>
              </div>
              <MiniSparkline values={rev.values} color={kpi.accent} />
            </div>
          ))}
        </div>

        {/* REVENUE CHART */}
        <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"24px", marginBottom:"40px", boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}}>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px"}}>
            <div>
              <div style={{fontSize:"10px", fontWeight:700, color:"#E85D04", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:"4px"}}>INNTEKTER</div>
              <h2 style={{fontSize:"16px", fontWeight:700, margin:0}}>Omsetning over tid</h2>
            </div>
          </div>
          <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} style={{display:"block"}}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E85D04" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#E85D04" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            {Array.from({length: gridLines + 1}).map((_, i) => {
              const y = chartPadT + (i / gridLines) * plotH;
              const val = maxVal - (i / gridLines) * maxVal;
              return (
                <g key={i}>
                  <line x1={chartPadL} y1={y} x2={chartW - chartPadR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <text x={chartPadL - 8} y={y + 4} textAnchor="end" fill="rgba(241,245,249,0.38)" fontSize="10" fontFamily="DM Sans, sans-serif">
                    {val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${Math.round(val/1000)}k` : val.toString()} kr
                  </text>
                </g>
              );
            })}
            {/* X labels */}
            {rev.labels.map((label, i) => {
              const x = chartPadL + (i / (rev.labels.length - 1)) * plotW;
              return <text key={i} x={x} y={chartH - 6} textAnchor="middle" fill="rgba(241,245,249,0.38)" fontSize="10" fontFamily="DM Sans, sans-serif">{label}</text>;
            })}
            {/* Area */}
            <path d={areaPath} fill="url(#areaGrad)" />
            {/* Line */}
            <path d={linePath} fill="none" stroke="#E85D04" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Current endpoint dashed line */}
            <line x1={chartPoints[chartPoints.length-1].x} y1={chartPadT} x2={chartPoints[chartPoints.length-1].x} y2={chartPadT + plotH} stroke="rgba(232,93,4,0.3)" strokeWidth="1" strokeDasharray="4,4" />
            {/* Peak callout */}
            <circle cx={chartPoints[peakIdx].x} cy={chartPoints[peakIdx].y} r="4" fill="#E85D04" stroke="#0D1B2A" strokeWidth="2" />
            <rect x={chartPoints[peakIdx].x - 28} y={chartPoints[peakIdx].y - 22} width="56" height="16" rx="4" fill="#E85D04" />
            <text x={chartPoints[peakIdx].x} y={chartPoints[peakIdx].y - 11} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="DM Sans, sans-serif">
              {maxVal >= 1000 ? `${Math.round(maxVal/1000)}k kr` : `${maxVal} kr`}
            </text>
            {/* Dots */}
            {chartPoints.map((p, i) => i !== peakIdx && (
              <circle key={i} cx={p.x} cy={p.y} r="3" fill="#E85D04" fillOpacity="0.6" />
            ))}
          </svg>
        </div>

        {/* ROW 2: Today schedule + Top classes */}
        <div className="two-col" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", marginBottom:"40px"}}>

          {/* TODAY'S SCHEDULE — timeline */}
          <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"24px", boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}}>
            <div style={{fontSize:"10px", fontWeight:700, color:"#E85D04", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:"4px"}}>DAGLIG OVERSIKT</div>
            <h2 style={{fontSize:"16px", fontWeight:700, marginBottom:"20px", margin:"0 0 20px 0"}}>Dagens timeplan</h2>
            <div style={{display:"flex", flexDirection:"column", gap:"0"}}>
              {TODAY_SCHEDULE.map((cls,i)=>{
                const fillPct = Math.round((cls.booked/cls.max)*100);
                const isFull = cls.booked >= cls.max;
                const isLast = i === TODAY_SCHEDULE.length - 1;
                return (
                  <div key={i} style={{display:"flex", gap:"16px", minHeight:"64px"}}>
                    {/* Timeline left */}
                    <div style={{display:"flex", flexDirection:"column", alignItems:"center", width:"48px", flexShrink:0}}>
                      <span style={{fontSize:"12px", fontWeight:700, color:"var(--text-secondary)", fontFamily:"var(--font-syne)"}}>{cls.time}</span>
                      <div style={{width:"8px", height:"8px", borderRadius:"50%", background:"#E85D04", margin:"6px 0 4px 0", flexShrink:0}} />
                      {!isLast && <div style={{width:"2px", flex:1, background:"rgba(232,93,4,0.25)", borderRadius:"1px"}} />}
                    </div>
                    {/* Class info right */}
                    <div style={{flex:1, paddingBottom:isLast?"0":"12px"}}>
                      <div style={{display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px"}}>
                        <div style={{width:"8px", height:"8px", borderRadius:"50%", background:cls.color, flexShrink:0}} />
                        <span style={{fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"14px"}}>{cls.name}</span>
                      </div>
                      <div style={{display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px"}}>
                        <div style={{position:"relative", width:"24px", height:"24px", borderRadius:"50%", overflow:"hidden", flexShrink:0}}>
                          <Image src={cls.trainerPhoto} alt={cls.trainer} fill style={{objectFit:"cover"}} />
                        </div>
                        <span style={{fontSize:"12px", color:"var(--text-secondary)"}}>{cls.trainer}</span>
                      </div>
                      <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
                        <span style={{fontSize:"12px", fontWeight:600, color:isFull?"#f87171":"var(--text)"}}>{cls.booked}/{cls.max}</span>
                        <div style={{width:"60px", height:"4px", background:"rgba(255,255,255,0.08)", borderRadius:"2px", overflow:"hidden"}}>
                          <div style={{width:`${fillPct}%`, height:"100%", background:isFull?"#f87171":cls.color, borderRadius:"2px"}} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Top classes + Plan breakdown */}
          <div style={{display:"flex", flexDirection:"column", gap:"20px"}}>
            {/* TOP CLASSES — bar chart */}
            <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"24px", boxShadow:"0 1px 3px rgba(0,0,0,0.3)", flex:1}}>
              <div style={{fontSize:"10px", fontWeight:700, color:"#E85D04", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:"4px"}}>TOPPTIMER</div>
              <h2 style={{fontSize:"16px", fontWeight:700, marginBottom:"16px", margin:"0 0 16px 0"}}>Popul\u00e6re klasser</h2>
              <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
                {TOP_CLASSES.map(cls=>(
                  <div key={cls.name} style={{display:"flex", alignItems:"center", gap:"12px"}}>
                    <span style={{fontSize:"12px", fontWeight:600, minWidth:"72px", color:"var(--text)"}}>{cls.name}</span>
                    <div style={{flex:1, height:"22px", background:"rgba(255,255,255,0.04)", borderRadius:"4px", overflow:"hidden", position:"relative"}}>
                      <div style={{width:`${cls.fill}%`, height:"100%", background:cls.color, borderRadius:"4px", display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:"8px"}}>
                        {cls.fill >= 40 && <span style={{fontSize:"11px", fontWeight:700, color:"#fff"}}>{cls.fill}%</span>}
                      </div>
                      {cls.fill < 40 && <span style={{position:"absolute", right:"8px", top:"50%", transform:"translateY(-50%)", fontSize:"11px", fontWeight:700, color:"var(--text-secondary)"}}>{cls.fill}%</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PLAN BREAKDOWN — stacked bar */}
            <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"24px", boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}}>
              <div style={{fontSize:"10px", fontWeight:700, color:"#E85D04", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:"4px"}}>ABONNEMENT</div>
              <h2 style={{fontSize:"16px", fontWeight:700, marginBottom:"16px", margin:"0 0 16px 0"}}>Fordeling</h2>
              {/* Percentage labels above */}
              <div style={{display:"flex", marginBottom:"6px"}}>
                {PLAN_BREAKDOWN.map(p => (
                  <div key={p.plan} style={{width:`${p.pct}%`, textAlign:"center"}}>
                    <span style={{fontSize:"12px", fontWeight:700, color:p.color}}>{p.pct}%</span>
                  </div>
                ))}
              </div>
              {/* Stacked bar */}
              <div style={{display:"flex", height:"28px", borderRadius:"6px", overflow:"hidden", marginBottom:"10px"}}>
                {PLAN_BREAKDOWN.map(p => (
                  <div key={p.plan} style={{width:`${p.pct}%`, background:p.color, display:"flex", alignItems:"center", justifyContent:"center"}}>
                    <span style={{fontSize:"10px", fontWeight:700, color:"#fff"}}>{p.count}</span>
                  </div>
                ))}
              </div>
              {/* Labels below */}
              <div style={{display:"flex"}}>
                {PLAN_BREAKDOWN.map(p => (
                  <div key={p.plan} style={{width:`${p.pct}%`, textAlign:"center"}}>
                    <span style={{fontSize:"11px", fontWeight:600, color:"var(--text-secondary)"}}>{p.plan}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: Recent members + Trainers */}
        <div className="two-col" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", marginBottom:"40px"}}>

          {/* RECENT MEMBERS */}
          <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"24px", boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}}>
            <div style={{fontSize:"10px", fontWeight:700, color:"#E85D04", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:"4px"}}>MEDLEMMER</div>
            <h2 style={{fontSize:"16px", fontWeight:700, marginBottom:"16px", margin:"0 0 16px 0"}}>Nylig registrerte</h2>
            <div style={{display:"flex", flexDirection:"column", gap:"2px"}}>
              {RECENT_MEMBERS.map((m,i)=>(
                <div key={i} style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom: i < RECENT_MEMBERS.length - 1 ? "1px solid var(--border)" : "none"}}>
                  <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
                    <div style={{width:"34px", height:"34px", borderRadius:"50%", background:`${planColor[m.plan]}15`, border:`2px solid ${planColor[m.plan]}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:800, color:planColor[m.plan], flexShrink:0}}>
                      {m.avatar}
                    </div>
                    <div>
                      <div style={{fontSize:"13px", fontWeight:600}}>{m.name}</div>
                      <span style={{fontSize:"10px", fontWeight:700, color:planColor[m.plan], background:`${planColor[m.plan]}15`, padding:"2px 8px", borderRadius:"10px"}}>{m.plan}</span>
                    </div>
                  </div>
                  <span style={{fontSize:"11px", color:"var(--text-muted)"}}>{m.joined}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TRAINER PERFORMANCE */}
          <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"24px", boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}}>
            <div style={{fontSize:"10px", fontWeight:700, color:"#E85D04", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:"4px"}}>TRENERE</div>
            <h2 style={{fontSize:"16px", fontWeight:700, marginBottom:"16px", margin:"0 0 16px 0"}}>Treneroversikt</h2>
            <div style={{display:"flex", flexDirection:"column", gap:"12px"}}>
              {TRAINERS_PERF.map(t=>(
                <div key={t.name} style={{background:"var(--surface-2)", borderRadius:"10px", borderTop:`3px solid ${t.accent}`, padding:"16px", display:"flex", alignItems:"center", gap:"16px"}}>
                  <div style={{width:"72px", height:"72px", borderRadius:"50%", padding:"3px", background:`conic-gradient(${t.accent} 0%, ${t.accent} ${t.avgFill}%, rgba(255,255,255,0.08) ${t.avgFill}%)`, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
                    <div style={{position:"relative", width:"64px", height:"64px", borderRadius:"50%", overflow:"hidden"}}>
                      <Image src={t.photo} alt={t.name} fill style={{objectFit:"cover"}} />
                    </div>
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontFamily:"var(--font-syne)", fontSize:"15px", fontWeight:700, marginBottom:"2px"}}>{t.name}</div>
                    <div style={{fontSize:"11px", color:"var(--text-muted)", marginBottom:"8px"}}>{t.speciality}</div>
                    <div style={{display:"flex", alignItems:"center", gap:"16px"}}>
                      {/* Fill rate bar */}
                      <div style={{display:"flex", alignItems:"center", gap:"6px"}}>
                        <div style={{width:"48px", height:"5px", background:"rgba(255,255,255,0.08)", borderRadius:"3px", overflow:"hidden"}}>
                          <div style={{width:`${t.avgFill}%`, height:"100%", background:t.accent, borderRadius:"3px"}} />
                        </div>
                        <span style={{fontSize:"11px", fontWeight:700, color:t.accent}}>{t.avgFill}%</span>
                      </div>
                      {/* Star rating */}
                      <StarRating rating={t.rating} color="#f59e0b" />
                      {/* Class count */}
                      <span style={{fontSize:"11px", color:"var(--text-secondary)"}}>{t.classes} timer</span>
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
        Bygget av Sloth Studio
      </a>
    </div>
  );
}
