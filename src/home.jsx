import { useEffect, useRef, useState } from "react";

const GLASS_MAP = "data:image/webp;base64,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";

function useInView(t=0.1){const r=useRef(null);const[v,s]=useState(false);useEffect(()=>{const o=new IntersectionObserver(([e])=>{if(e.isIntersecting)s(true)},{threshold:t});if(r.current)o.observe(r.current);return()=>o.disconnect();},[]);return[r,v];}

function FadeIn({children,delay=0,direction="up",style={}}){
  const[r,v]=useInView();
  const tr=direction==="up"?"translateY(24px)":direction==="right"?"translateX(24px)":"translateY(0)";
  return <div ref={r} style={{opacity:v?1:0,transform:v?"translate(0)":tr,transition:`opacity 0.7s ease ${delay}s,transform 0.7s ease ${delay}s`,...style}}>{children}</div>;
}

function GlowCard({children}){
  const ref=useRef(null);
  useEffect(()=>{
    const el=ref.current;
    if(!el) return;
    const move=(e)=>{
      const r=el.getBoundingClientRect();
      el.style.setProperty('--mx',(e.clientX-r.left).toFixed(1)+'px');
      el.style.setProperty('--my',(e.clientY-r.top).toFixed(1)+'px');
    };
    const show=()=>el.style.setProperty('--glow-opacity','1');
    const hide=()=>el.style.setProperty('--glow-opacity','0');
    el.addEventListener('pointermove',move);
    el.addEventListener('pointerenter',show);
    el.addEventListener('pointerleave',hide);
    return()=>{
      el.removeEventListener('pointermove',move);
      el.removeEventListener('pointerenter',show);
      el.removeEventListener('pointerleave',hide);
    };
  },[]);
  return(
    <div ref={ref} data-glow className="lg-card" style={{
      '--glow-opacity':'0',
      backgroundColor:'rgba(108,92,231,0.06)',
      border:'2px solid rgba(108,92,231,0.18)',
    }}>
      {children}
    </div>
  );
}

function Ico({d,size=20,color="#6c5ce7"}){
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
}

function IPhone(){
  return(
    <div style={{position:"relative",width:280,height:502,flexShrink:0}}>
      <img src="/Iphone17neroconombra.png" alt="iPhone mockup"
        style={{width:"100%",height:"100%",display:"block",pointerEvents:"none"}}
      />
    </div>
  );
}

const SB_BG="#1c1a35", SB_ACCENT="#6c5ce7";
function DesktopSidebar({activeItem}){
  const items=[
    {id:"agenda",label:"Agenda",svg:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>},
    {id:"clienti",label:"Clienti",svg:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>},
    {id:"servizi",label:"Servizi",svg:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>},
    {id:"staff",label:"Staff",svg:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>},
    {id:"recensioni",label:"Recensioni",svg:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>},
    {id:"report",label:"Report",svg:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>},
    {id:"impostazioni",label:"Impostazioni",svg:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>},
  ];
  return(
    <div style={{width:140,background:SB_BG,display:"flex",flexDirection:"column",flexShrink:0,height:"100%"}}>
      <div style={{padding:"14px 14px 10px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <img src="/Prenoty_Bianco.png" alt="Prenoty" style={{height:13,objectFit:"contain"}}/>
      </div>
      {items.map(({id,label,svg})=>{
        const on=id===activeItem;
        return(
          <div key={id} style={{padding:"8px 14px",display:"flex",alignItems:"center",gap:8,background:on?"rgba(108,92,231,0.18)":"transparent",borderLeft:on?`2px solid ${SB_ACCENT}`:"2px solid transparent",color:on?"#fff":"rgba(255,255,255,0.6)"}}>
            {svg}
            <span style={{fontSize:11,fontWeight:on?600:400}}>{label}</span>
          </div>
        );
      })}
      <div style={{marginTop:"auto",padding:"10px 14px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:7}}>
        <div style={{width:22,height:22,borderRadius:"50%",background:SB_ACCENT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",fontWeight:700,flexShrink:0}}>A</div>
        <span style={{fontSize:9.5,color:"rgba(255,255,255,0.6)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Atelier Bellezza</span>
      </div>
    </div>
  );
}

function Desktop(){
  const[sc,setSc]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setSc(s=>(s+1)%3),4500);return()=>clearInterval(t);},[]);
  const accent="#6c5ce7",green="#00b894",textMain="#1e1b3a",textSoft="#4a4580",textMuted="#9b96c8",border="#e0dcff",card="#fff",bg="#f4f3ff",dark="#1e1b3a";
  const urls=["prenoty.com/dashboard","prenoty.com/dashboard","prenoty.com/sao-salone"];
  return(
    <div style={{maxWidth:860,margin:"0 auto",position:"relative"}}>
      <div className="desktop-outer">
      <div className="desktop-inner">
      {/* Browser frame */}
      <div style={{background:"#16142a",borderRadius:14,overflow:"hidden",boxShadow:"0 0 0 1px rgba(108,92,231,0.25),0 32px 80px rgba(0,0,0,0.55),0 0 60px rgba(108,92,231,0.12)"}}>
        {/* Chrome bar */}
        <div style={{background:"#0f0d24",padding:"9px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid rgba(108,92,231,0.12)"}}>
          <div style={{display:"flex",gap:5,flexShrink:0}}>
            {["#ff5f57","#febc2e","#28c840"].map(c=><div key={c} style={{width:11,height:11,borderRadius:"50%",background:c}}/>)}
          </div>
          <div style={{flex:1,display:"flex",justifyContent:"center"}}>
            <div style={{background:"rgba(255,255,255,0.05)",borderRadius:6,padding:"4px 14px",display:"flex",alignItems:"center",gap:7,width:"100%",maxWidth:340}}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span style={{fontSize:10.5,color:"rgba(255,255,255,0.55)",letterSpacing:"0.02em",flex:1,textAlign:"center",transition:"all 0.4s"}}>{urls[sc]}</span>
            </div>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" style={{flexShrink:0}}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        </div>

        {/* Screen */}
        <div className="desktop-screen" style={{position:"relative",background:bg,overflow:"hidden"}}>

          {/* ── SCREEN 1: Agenda ── */}
          <div style={{position:"absolute",inset:0,opacity:sc===0?1:0,transition:"opacity 0.8s ease",display:"flex"}}>
            <DesktopSidebar activeItem="agenda"/>
            <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
              <div style={{background:card,borderBottom:`1px solid ${border}`,padding:"10px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
                <span style={{fontSize:12,color:textMain,letterSpacing:"0.08em",fontWeight:600}}>AGENDA</span>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(108,92,231,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  </div>
                  <span style={{fontSize:10,color:textSoft,border:`1px solid ${border}`,borderRadius:6,padding:"3px 10px",cursor:"pointer"}}>Esci</span>
                </div>
              </div>
              <div style={{flex:1,padding:"14px 18px",overflow:"hidden"}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
                  {[
                    {bg:accent,lbl:"OGGI",val:"7",sub:"appuntamenti",light:false},
                    {bg:green,lbl:"OGGI",val:"€135",sub:"incasso previsto",light:false},
                    {bg:card,lbl:"MESE",val:"€225",sub:"prenotazioni confermate",light:true},
                    {bg:card,lbl:"PAGATO ONLINE",val:"€0",sub:"ricevuto oggi online",light:true},
                  ].map((s,i)=>(
                    <div key={i} style={{background:s.bg,border:s.light?`1.5px solid ${border}`:"none",borderRadius:10,padding:"10px 12px",boxShadow:s.light?"none":"0 4px 14px rgba(0,0,0,0.18)"}}>
                      <div style={{fontSize:7,color:s.light?textMuted:"rgba(255,255,255,0.7)",letterSpacing:"0.1em",marginBottom:3}}>{s.lbl}</div>
                      <div style={{fontSize:18,fontWeight:700,color:s.light?textMain:"#fff",lineHeight:1}}>{s.val}</div>
                      <div style={{fontSize:8.5,color:s.light?textMuted:"rgba(255,255,255,0.75)",marginTop:3}}>{s.sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:card,border:`1px solid ${border}`,borderRadius:10,overflow:"hidden"}}>
                  <div style={{padding:"7px 14px",borderBottom:`1px solid ${border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:8.5,fontWeight:600,color:textMuted,letterSpacing:"0.14em"}}>PRENOTAZIONI (3)</span>
                    <div style={{display:"flex",gap:3}}>
                      {["OGGI","SETTIMANA","TUTTI"].map((v,i)=>(
                        <span key={v} style={{fontSize:8,padding:"2px 7px",borderRadius:4,background:i===0?dark:"transparent",color:i===0?"#fff":textMuted,letterSpacing:"0.06em"}}>{v}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{padding:"4px 14px",background:bg,borderBottom:`1px solid ${border}`}}>
                    <span style={{fontSize:8,color:textMuted,letterSpacing:"0.12em"}}>MAR 12 MAG</span>
                  </div>
                  {[
                    {ora:"08:00",dur:"30m",nome:"Valentina R.",serv:"Taglio Donna · Sao",prezzo:"€35",pagato:false,nuovo:false},
                    {ora:"08:30",dur:"30m",nome:"Maria B.",serv:"Taglio · Sao",prezzo:"€15",pagato:false,nuovo:true},
                    {ora:"09:00",dur:"60m",nome:"Elena F.",serv:"Taglio + Barba · Sao",prezzo:"€25",pagato:false,nuovo:false},
                    {ora:"11:00",dur:"90m",nome:"Sara E.",serv:"Colore · Sao",prezzo:"€65",pagato:true,nuovo:true},
                  ].map(({ora,dur,nome,serv,prezzo,pagato,nuovo})=>(
                    <div key={ora} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",borderBottom:`1px solid ${border}`}}>
                      <div style={{textAlign:"right",minWidth:36,flexShrink:0}}>
                        <div style={{fontSize:11,fontWeight:600,color:textMain}}>{ora}</div>
                        <div style={{fontSize:8,color:textMuted}}>{dur}</div>
                      </div>
                      <div style={{width:2,alignSelf:"stretch",background:accent,borderRadius:2,flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <span style={{fontSize:12,fontWeight:600,color:textMain}}>{nome}</span>
                          {nuovo&&<span style={{fontSize:7.5,background:accent,color:"#fff",padding:"1px 5px",borderRadius:4,letterSpacing:"0.05em",flexShrink:0}}>NUOVO</span>}
                        </div>
                        <div style={{fontSize:10,color:textSoft}}>{serv}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:accent}}>{prezzo}</div>
                        <div style={{fontSize:9,color:pagato?green:textMuted}}>{pagato?"✓ Pagato":"In salone"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── SCREEN 2: Servizi ── */}
          <div style={{position:"absolute",inset:0,opacity:sc===1?1:0,transition:"opacity 0.8s ease",display:"flex"}}>
            <DesktopSidebar activeItem="servizi"/>
            <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
              <div style={{background:card,borderBottom:`1px solid ${border}`,padding:"10px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
                <span style={{fontSize:12,color:textMain,letterSpacing:"0.08em",fontWeight:600}}>SERVIZI</span>
                <button style={{background:accent,color:"#fff",border:"none",borderRadius:7,padding:"5px 14px",fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Nuovo servizio
                </button>
              </div>
              <div style={{flex:1,padding:"14px 18px",overflow:"hidden"}}>
                <p style={{fontSize:10,color:textMuted,marginBottom:14}}>Configura i servizi che offri. I clienti li vedranno sulla tua pagina di prenotazione.</p>
                <div style={{background:card,border:`1px solid ${border}`,borderRadius:10,overflow:"hidden"}}>
                  <div style={{padding:"7px 14px",borderBottom:`1px solid ${border}`}}>
                    <span style={{fontSize:8.5,fontWeight:600,color:textMuted,letterSpacing:"0.14em"}}>5 SERVIZI ATTIVI</span>
                  </div>
                  {[
                    {n:"Taglio Donna",d:"45 min",p:"€35",col:"#6c5ce7"},
                    {n:"Colore",d:"90 min",p:"€65",col:"#6c5ce7"},
                    {n:"Piega",d:"30 min",p:"€25",col:"#6c5ce7"},
                    {n:"Taglio + Piega",d:"60 min",p:"€50",col:"#6c5ce7"},
                    {n:"Trattamento",d:"45 min",p:"€40",col:"#6c5ce7"},
                  ].map(({n,d,p,col})=>(
                    <div key={n} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderBottom:`1px solid ${border}`}}>
                      <div style={{width:3,height:36,background:col,borderRadius:2,flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:600,color:textMain}}>{n}</div>
                        <div style={{fontSize:9.5,color:textMuted,marginTop:1}}>{d} · {p}</div>
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        <div style={{width:26,height:26,borderRadius:6,border:`1px solid ${border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={textSoft} strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </div>
                        <div style={{width:26,height:26,borderRadius:6,border:"1px solid rgba(231,76,60,0.25)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── SCREEN 3: App Cliente con cover + galleria ── */}
          <div style={{position:"absolute",inset:0,opacity:sc===2?1:0,transition:"opacity 0.8s ease",background:card,overflow:"hidden",fontFamily:"Georgia,'Times New Roman',serif"}}>
            {/* Header PWA */}
            <div style={{background:card,borderBottom:`1px solid ${border}`,padding:"8px 20px",display:"flex",alignItems:"center",justifyContent:"flex-end",flexShrink:0}}>
              <div style={{display:"flex",gap:5}}>
                <div style={{width:26,height:26,borderRadius:"50%",border:`1px solid ${border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={textSoft} strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                </div>
                <div style={{width:26,height:26,borderRadius:"50%",border:`1px solid ${border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={textSoft} strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                </div>
              </div>
            </div>
            {/* Cover photo */}
            <div style={{maxWidth:560,margin:"0 auto",padding:"10px 28px 0",flexShrink:0}}>
              <div style={{height:85,position:"relative",overflow:"hidden",borderRadius:10}}>
                <img src="/cover.jpg" style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.35) 100%)"}}/>
              </div>
            </div>
            {/* Profile section */}
            <div style={{maxWidth:560,margin:"0 auto",padding:"0 28px"}}>
              <div style={{textAlign:"center",padding:"6px 0 6px"}}>
                <div style={{width:44,height:44,borderRadius:14,background:"linear-gradient(135deg,#6c5ce7,#a29bfe)",display:"flex",alignItems:"center",justifyContent:"center",margin:"-28px auto 6px",color:"#fff",fontSize:16,fontWeight:700,border:`3px solid ${card}`,position:"relative",zIndex:1}}>A</div>
                <h1 style={{fontSize:16,fontWeight:400,color:textMain,margin:"0 0 4px",letterSpacing:"0.02em"}}>Atelier Bellezza</h1>
                <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:3,marginBottom:3}}>
                  {[1,2,3,4,5].map(i=><span key={i} style={{fontSize:9,color:"#f9ca24"}}>★</span>)}
                  <span style={{fontSize:8,color:textSoft,marginLeft:3}}>4.9 · 48 recensioni</span>
                </div>
                <p style={{fontSize:8,color:textSoft,marginBottom:8,lineHeight:1.4}}>Siamo i migliori a Genova, vieni a trovarci!</p>
                <button style={{background:dark,color:"#fff",border:"none",padding:"7px 28px",fontSize:8,letterSpacing:"0.2em",cursor:"pointer",borderRadius:3}}>PRENOTA ORA</button>
              </div>
              {/* Galleria */}
              <div style={{marginTop:10}}>
                <div style={{fontSize:7.5,color:textMuted,letterSpacing:"0.18em",marginBottom:6}}>GALLERIA</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:4}}>
                  {[
                    "/gallery/gallery1.jpg",
                    "/gallery/gallery2.jpg",
                    "/gallery/gallery3.jpg",
                    "/gallery/gallery4.jpg",
                    "/gallery/gallery5.jpg",
                    "/gallery/gallery6.jpg",
                  ].map((url,i)=>(
                    <div key={i} style={{height:85,borderRadius:7,overflow:"hidden"}}>
                      <img src={url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                    </div>
                  ))}
                </div>
              </div>
              {/* I nostri servizi */}
              <div style={{marginTop:10}}>
                <div style={{fontSize:7.5,color:textMuted,letterSpacing:"0.18em",marginBottom:6}}>I NOSTRI SERVIZI</div>
                {[
                  {n:"Taglio",d:"30 min",p:"€15"},
                  {n:"Colore",d:"60 min",p:"€45"},
                ].map(({n,d,p})=>(
                  <div key={n} style={{background:card,border:`1px solid ${border}`,padding:"7px 12px",marginBottom:4,display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:4}}>
                    <div>
                      <div style={{fontSize:10,color:textMain}}>{n}</div>
                      <div style={{fontSize:7.5,color:textMuted,marginTop:1}}>{d}</div>
                    </div>
                    <div style={{fontSize:10,color:accent,fontWeight:600}}>{p}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      </div>{/* /desktop-inner */}
      </div>{/* /desktop-outer */}
      {/* Dots */}
      <div style={{display:"flex",gap:7,justifyContent:"center",marginTop:22}}>
        {[0,1,2].map(i=>(
          <div key={i} onClick={()=>setSc(i)} style={{width:i===sc?20:7,height:7,borderRadius:4,background:i===sc?accent:"rgba(108,92,231,0.25)",transition:"all 0.4s",cursor:"pointer"}}/>
        ))}
      </div>
    </div>
  );
}

function CookieBanner(){
  const[visible,setVisible]=useState(false);
  const[modal,setModal]=useState(false);
  const[analisi,setAnalisi]=useState(false);
  const[marketing,setMarketing]=useState(false);

  useEffect(()=>{
    try{ if(!localStorage.getItem("prenoty_cookie_consent")) setVisible(true); }catch(e){}
  },[]);

  const save=(value)=>{
    try{ localStorage.setItem("prenoty_cookie_consent",value); }catch(e){}
    setVisible(false); setModal(false);
  };
  const acceptAll=()=>save("accepted");
  const rejectAll=()=>{ setAnalisi(false); setMarketing(false); save("rejected"); };
  const savePrefs=()=>save(JSON.stringify({necessari:true,analisi,marketing}));

  if(!visible)return null;

  const rowStyle={borderBottom:"1px solid rgba(108,92,231,0.15)",paddingBottom:16,marginBottom:16};
  const toggleStyle=(on)=>({
    width:40,height:22,borderRadius:11,border:"none",cursor:"pointer",position:"relative",
    background:on?"#6c5ce7":"rgba(108,92,231,0.2)",transition:"background 0.2s",flexShrink:0,
  });
  const dotStyle=(on)=>({
    position:"absolute",top:3,left:on?20:3,width:16,height:16,borderRadius:"50%",
    background:"#fff",transition:"left 0.2s",
  });

  return(
    <>
      {/* OVERLAY modale */}
      {modal && (
        <div style={{position:"fixed",inset:0,zIndex:10000,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"#0f0d24",border:"1px solid rgba(108,92,231,0.3)",borderRadius:20,width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto",padding:32,boxShadow:"0 24px 80px rgba(0,0,0,0.7)"}}>
            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <div style={{color:"#fff",fontSize:18,fontWeight:700}}>Preferenze cookie</div>
              <button onClick={()=>setModal(false)} style={{background:"transparent",border:"none",cursor:"pointer",color:"rgba(200,196,255,0.5)",fontSize:22,lineHeight:1}}>✕</button>
            </div>
            <p style={{color:"rgba(200,196,255,0.65)",fontSize:13,lineHeight:1.7,marginBottom:24}}>
              Scegli quali cookie accettare. I cookie necessari sono sempre attivi perché indispensabili al funzionamento del sito.{" "}
              <a href="/privacy" style={{color:"#a29bfe",textDecoration:"underline"}}>Privacy policy</a>
            </p>

            {/* Necessari — sempre attivi */}
            <div style={rowStyle}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{color:"#fff",fontSize:14,fontWeight:600}}>Necessari</div>
                <span style={{fontSize:12,color:"#a29bfe",fontWeight:600}}>Sempre attivi</span>
              </div>
              <div style={{color:"rgba(200,196,255,0.55)",fontSize:13,lineHeight:1.6}}>Cookie indispensabili per il funzionamento del sito, come la sessione di accesso.</div>
            </div>

            {/* Analisi */}
            <div style={rowStyle}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{color:"#fff",fontSize:14,fontWeight:600}}>Analisi</div>
                <button onClick={()=>setAnalisi(v=>!v)} style={toggleStyle(analisi)}>
                  <div style={dotStyle(analisi)}/>
                </button>
              </div>
              <div style={{color:"rgba(200,196,255,0.55)",fontSize:13,lineHeight:1.6}}>Ci aiutano a capire come gli utenti interagiscono con il sito, per migliorarne il funzionamento.</div>
            </div>

            {/* Marketing */}
            <div style={{...rowStyle,borderBottom:"none",marginBottom:0,paddingBottom:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{color:"#fff",fontSize:14,fontWeight:600}}>Marketing</div>
                <button onClick={()=>setMarketing(v=>!v)} style={toggleStyle(marketing)}>
                  <div style={dotStyle(marketing)}/>
                </button>
              </div>
              <div style={{color:"rgba(200,196,255,0.55)",fontSize:13,lineHeight:1.6}}>Cookie usati per mostrare contenuti e annunci pertinenti in base ai tuoi interessi.</div>
            </div>

            {/* Bottoni modal */}
            <div style={{display:"flex",gap:10,marginTop:28,flexWrap:"wrap"}}>
              <button onClick={rejectAll} style={{flex:1,padding:"11px 16px",borderRadius:10,border:"1px solid rgba(108,92,231,0.35)",background:"transparent",color:"rgba(200,196,255,0.8)",fontSize:13,fontWeight:600,cursor:"pointer"}}>Rifiuta tutto</button>
              <button onClick={savePrefs} style={{flex:1,padding:"11px 16px",borderRadius:10,border:"1px solid rgba(108,92,231,0.35)",background:"transparent",color:"#a29bfe",fontSize:13,fontWeight:600,cursor:"pointer"}}>Salva le mie scelte</button>
              <button onClick={acceptAll} style={{flex:1,padding:"11px 16px",borderRadius:10,border:"none",background:"#6c5ce7",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Accetta tutto</button>
            </div>
          </div>
        </div>
      )}

      {/* BANNER */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:9999,padding:"0 16px 16px",display:"flex",justifyContent:"center",pointerEvents:"none"}}>
        <div style={{background:"rgba(13,11,28,0.97)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",border:"1px solid rgba(108,92,231,0.25)",borderRadius:16,padding:"20px 24px",maxWidth:680,width:"100%",display:"flex",gap:20,alignItems:"center",flexWrap:"wrap",pointerEvents:"all",boxShadow:"0 8px 40px rgba(0,0,0,0.5)"}}>
          <div style={{flex:1,minWidth:200}}>
            <div style={{color:"#fff",fontSize:14,fontWeight:600,marginBottom:4}}>Utilizziamo i cookie</div>
            <div style={{color:"rgba(200,196,255,0.65)",fontSize:13,lineHeight:1.6}}>
              Usiamo cookie tecnici per il corretto funzionamento del sito.{" "}
              <a href="/privacy" style={{color:"#a29bfe",textDecoration:"underline"}}>Privacy policy</a>
            </div>
          </div>
          <div style={{display:"flex",gap:10,flexShrink:0,flexWrap:"wrap"}}>
            <button onClick={()=>setModal(true)} style={{padding:"10px 16px",borderRadius:8,border:"1px solid rgba(108,92,231,0.3)",background:"transparent",color:"rgba(200,196,255,0.65)",fontSize:13,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap"}}>
              Gestisci preferenze
            </button>
            <button onClick={rejectAll} style={{padding:"10px 18px",borderRadius:8,border:"1px solid rgba(108,92,231,0.4)",background:"transparent",color:"rgba(200,196,255,0.8)",fontSize:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
              Rifiuta
            </button>
            <button onClick={acceptAll} style={{padding:"10px 20px",borderRadius:8,border:"none",background:"#6c5ce7",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
              Accetta
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const HERO_SLIDES = [
  {
    src: "/hero-woman.png",
    mobileSrc: "/MOBILE/hero-womanmobile.png",
    pos: "center top",
    notifica: { testo: "Appuntamento confermato", sub: "Oggi alle 11:30 · Colorazione", side: "right" },
  },
  {
    src: "/hero-mancell.png",
    mobileSrc: "/MOBILE/hero-mancellmobile.png",
    pos: "center 100%",
    notifica: { testo: "Appuntamento confermato", sub: "Domani alle 10:00 · Taglio", side: "left" },
  },
  {
    src: "/hero-woman2.png",
    mobileSrc: "/MOBILE/hero-woman2mobile.png",
    pos: "center 100%",
  },
  {
    src: "/hero-man2.png",
    mobileSrc: "/MOBILE/hero-man2mobile.png",
    pos: "center 100%",
  },
  {
    src: "/hero-woman3.png",
    mobileSrc: "/MOBILE/hero-woman3mobile.png",
    pos: "center 100%",
  },
];

function GradDivider(){
  return <div style={{height:"1.5px",background:"linear-gradient(90deg,rgba(108,92,231,0.15) 0%,rgba(108,92,231,0.7) 25%,rgba(93,226,121,0.5) 50%,rgba(108,92,231,0.7) 75%,rgba(108,92,231,0.15) 100%)"}}/>
}

function FaqItem({q,a}){
  const[open,setOpen]=useState(false);
  return(
    <div onClick={()=>setOpen(o=>!o)} style={{borderBottom:"1px solid rgba(108,92,231,0.12)",padding:"20px 0",cursor:"pointer",userSelect:"none"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
        <span style={{fontSize:17,fontWeight:700,color:"#13112a",lineHeight:1.35}}>{q}</span>
        <div style={{width:28,height:28,borderRadius:"50%",background:open?"#6c5ce7":"rgba(108,92,231,0.1)",border:"1.5px solid rgba(108,92,231,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.2s"}}>
          <span style={{fontSize:18,lineHeight:1,color:open?"#fff":"#6c5ce7",fontWeight:400,marginTop:open?-1:-1}}>{open?"×":"+"}</span>
        </div>
      </div>
      {open&&<p style={{fontSize:15,color:"#7a748a",lineHeight:1.7,marginTop:12,marginBottom:0}}>{a}</p>}
    </div>
  );
}

export default function Home(){
  const [chiSiamoOpen, setChiSiamoOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 960);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 960);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide(i => (i + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://cdn.iubenda.com/iubenda.js";
    s.async = true;
    document.body.appendChild(s);
    return () => { document.body.removeChild(s); };
  }, []);
  return(
    <div style={{background:"transparent",minHeight:"100vh",fontFamily:"'DM Sans','Helvetica Neue',sans-serif",overflowX:"hidden"}}>
      {/* ── SVG filter per liquid glass displacement ── */}
      <svg style={{position:"absolute",width:0,height:0,overflow:"hidden",pointerEvents:"none"}} aria-hidden="true">
        <filter id="lg-prenoty" primitiveUnits="objectBoundingBox">
          <feImage result="map" width="100%" height="100%" x="0" y="0" href={GLASS_MAP} preserveAspectRatio="none"/>
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.01" result="blur"/>
          <feDisplacementMap in="blur" in2="map" scale="0.5" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </svg>

      {/* Contenuto */}
      <div style={{position:"relative",zIndex:1}}>
      <style>{`
        *{box-sizing:border-box;}
        html,body{
          background:#f4f3ff!important;
          overscroll-behavior-x:none;
          -webkit-overflow-scrolling:touch;
        }

        /* ── Liquid Glass Buttons ── */
        .btn-glass{
          position:relative; cursor:pointer; text-decoration:none;
          isolation:isolate; overflow:hidden; border:none !important; background:transparent !important;
          display:inline-flex; align-items:center; justify-content:center;
          transition:transform .3s cubic-bezier(.34,1.56,.64,1);
          -webkit-tap-highlight-color:transparent;
          touch-action:manipulation;
        }
        @media(hover:hover){
          .btn-glass:hover{ transform:translateY(-2px) scale(1.02); }
        }
        .btn-glass:active{ transform:scale(0.97); }

        /* Lens layer — VUOTO, solo backdrop-filter
           Fallback (Android / tutti): blur+saturate
           Desktop Chrome con SVG filter: aggiunge displacement refraction */
        .btn-glass-lens{
          position:absolute; inset:0; z-index:-1; border-radius:inherit; pointer-events:none;
          -webkit-backdrop-filter:blur(8px) saturate(150%);
          backdrop-filter:blur(8px) saturate(150%);
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.10),
            inset 1.8px 3px 0px -2px rgba(255,255,255,0.90),
            inset -2px -2px 0px -2px rgba(255,255,255,0.80),
            inset -3px -8px 1px -6px rgba(255,255,255,0.60),
            inset -0.3px -1px 4px 0px rgba(0,0,0,0.12),
            inset -1.5px 2.5px 0px -2px rgba(0,0,0,0.20),
            inset 0px 3px 4px -2px rgba(0,0,0,0.20),
            inset 2px -6.5px 1px -4px rgba(0,0,0,0.10),
            0px 1px 5px 0px rgba(0,0,0,0.10),
            0px 6px 16px 0px rgba(0,0,0,0.08);
          transition:background-color 400ms cubic-bezier(1,0,0.4,1), box-shadow 400ms cubic-bezier(1,0,0.4,1);
        }
        /* Solo su browser che supportano SVG filter in backdrop-filter (Chrome desktop) */
        @supports (backdrop-filter: url(#x)) {
          .btn-glass-lens{
            backdrop-filter:blur(8px) url(#lg-prenoty) saturate(150%);
          }
        }

        /* Testo galleggia sopra il vetro */
        .btn-glass-text{
          position:relative; z-index:1;
          text-shadow:0 1px 2px rgba(0,0,0,0.28);
          display:flex; align-items:center; justify-content:center; gap:8px;
          user-select:none;
        }

        /* Verde */
        .btn-glass-green{ color:#fff !important; }
        .btn-glass-green .btn-glass-lens{ background:rgba(56,200,90,0.22); }
        .btn-glass-green:hover .btn-glass-lens{ background:rgba(56,200,90,0.32); }

        /* Social tooltip icons */
        .soc-wrap{position:relative;list-style:none;}
        .soc-btn{position:relative;display:flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:50%;background:#f4f3ff;overflow:hidden;border:1.5px solid rgba(108,92,231,0.2);transition:box-shadow 0.3s ease;cursor:pointer;text-decoration:none;}
        .soc-wrap:hover .soc-btn{box-shadow:0 6px 22px rgba(108,92,231,0.28);}
        .soc-fill{position:absolute;bottom:0;left:0;width:100%;height:0;transition:height 0.32s cubic-bezier(.4,0,.2,1);}
        .soc-wrap:hover .soc-fill{height:100%;}
        .soc-icon{position:relative;z-index:1;transition:stroke 0.28s ease,color 0.28s ease;stroke:#6c5ce7;color:#6c5ce7;}
        .soc-wrap:hover .soc-icon{stroke:#fff;color:#fff;}
        .soc-tip{position:absolute;bottom:-38px;left:50%;transform:translateX(-50%);padding:4px 11px;font-size:12px;font-weight:600;color:#fff;white-space:nowrap;border-radius:7px;opacity:0;visibility:hidden;transition:opacity 0.25s ease,bottom 0.25s ease,visibility 0.25s;}
        .soc-wrap:hover .soc-tip{opacity:1;visibility:visible;bottom:-46px;}

        /* Liquid glass + spotlight cards — Come funziona */
        .lg-card{
          position:relative;
          border-radius:20px;
          padding:32px 24px 36px;
          text-align:center;
          cursor:default;
          transition:transform 0.35s cubic-bezier(.4,0,.2,1);
          backdrop-filter:blur(10px) url(#lg-filter) saturate(140%);
          -webkit-backdrop-filter:blur(10px) saturate(140%);
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.07),
            inset 1.8px 3px 0px -2px rgba(255,255,255,0.5),
            inset -2px -2px 0px -2px rgba(255,255,255,0.4),
            inset -0.3px -1px 4px 0px rgba(0,0,0,0.18),
            inset 0px 3px 4px -2px rgba(0,0,0,0.22),
            0px 2px 8px 0px rgba(0,0,0,0.2),
            0px 8px 24px 0px rgba(0,0,0,0.15);
        }
        @media(hover:hover){ .lg-card:hover{ transform:translateY(-6px); } }

        /* Spotlight border glow */
        [data-glow]::before{
          content:"";
          pointer-events:none;
          position:absolute;
          inset:-2px;
          border-radius:22px;
          padding:2px;
          background:radial-gradient(
            220px 220px at var(--mx,50%) var(--my,50%),
            hsl(260 90% 75% / 0.95) 0%,
            hsl(260 70% 60% / 0.4) 40%,
            transparent 70%
          );
          -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
          -webkit-mask-composite:destination-out;
          mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
          mask-composite:exclude;
          opacity:var(--glow-opacity,0);
          transition:opacity 0.35s ease;
          z-index:1;
        }

        /* Ghost neutro */
        .btn-glass-ghost{ color:rgba(255,255,255,0.88) !important; }
        .btn-glass-ghost .btn-glass-lens{ background:rgba(255,255,255,0.07); }
        .btn-glass-ghost:hover .btn-glass-lens{ background:rgba(255,255,255,0.13); }

        /* Viola (nav Registrati) */
        .btn-glass-purple{ color:#fff !important; }
        .btn-glass-purple .btn-glass-lens{ background:rgba(108,92,231,0.92); }
        .btn-glass-purple:hover .btn-glass-lens{ background:rgba(108,92,231,1); }

        /* Dark — hero su sfondo chiaro */
        .btn-glass-dark{ color:#fff !important; }
        .btn-glass-dark .btn-glass-lens{ background:rgba(18,16,44,0.90); }
        .btn-glass-dark:hover .btn-glass-lens{ background:rgba(18,16,44,0.97); }

        /* Green — CTA principale */
        .btn-glass-green-cta{ color:#fff !important; font-weight:700 !important; }
        .btn-glass-green-cta .btn-glass-lens{ background:rgba(93,226,121,0.92); }
        .btn-glass-green-cta:hover .btn-glass-lens{ background:rgba(93,226,121,1); }

        /* Ghost su sfondo chiaro */
        .btn-glass-light{ color:#3d35a8 !important; }
        .btn-glass-light .btn-glass-lens{ background:rgba(108,92,231,0.06); border:1.5px solid rgba(108,92,231,0.22); }
        .btn-glass-light:hover .btn-glass-lens{ background:rgba(108,92,231,0.12); }
        .btn-glass-light .btn-glass-text{ text-shadow:none; }

        /* Hero card */
        .hero-card{ display:flex; align-items:stretch; overflow:hidden; }
        .hero-left-panel{ flex:0 0 56%; padding:56px 52px; display:flex; flex-direction:column; justify-content:space-between; background:#fff; }
        .hero-photo-panel{ flex:0 0 44%; position:relative; overflow:hidden; min-height:540px; }
        .hero-h1{ font-size:58px; font-weight:800; color:#13112a; line-height:1.08; letter-spacing:-1.5px; margin-bottom:16px; }
        .hero-btns{ display:flex; gap:12px; flex-wrap:wrap; align-items:center; margin-bottom:0; }
        @media(max-width:960px){
          .hero-card{flex-direction:column!important;}
          .hero-left-panel{flex:none!important;width:100%!important;padding:40px 32px!important;order:2;}
          .hero-photo-panel{flex:none!important;width:100%!important;min-height:260px!important;order:1;border-radius:0!important;}
          .hero-h1{font-size:46px!important;letter-spacing:-1px!important;}
          .hero-btns{justify-content:flex-start!important;}
          .feat-grid{grid-template-columns:1fr 1fr!important;grid-template-areas:"preno dash" "link prom" "pers primo"!important;}
          .feat-grid>*{min-width:0;}
          .steps-flow{grid-template-columns:1fr!important;gap:20px!important;}
          .nav-wrap{padding:12px 24px!important;}
        }
        .hamburger-btn{display:none;}
        .nav-cta-btns{}
        .nav-gradient-border{ border:none!important; border-image:none!important; }
        @media(max-width:960px){
          .nav-links{display:none!important;}
          .hamburger-btn{display:flex!important;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;padding:6px;margin-left:auto;}
          .nav-cta-btns{display:none!important;}
          .nav-gradient-border{ border:none!important; border-image:none!important; }
          .sec-pad{padding:56px 24px!important;}
          .hero-section{padding-top:16px!important;padding-left:20px!important;padding-right:20px!important;}
        }
        .feat-molto-altro{font-size:16px;color:rgba(155,150,200,0.85);margin:10px 0 0;text-align:right;font-style:italic;}
        @media(max-width:600px){
          .feat-molto-altro{font-size:14px!important;}
          .feat-grid{grid-template-columns:minmax(0,1fr)!important;grid-template-areas:"preno" "dash" "link" "prom" "pers" "primo"!important;}
          .feat-booking-row{flex-wrap:wrap!important;gap:6px!important;}
          .feat-booking-row .booking-time{display:none!important;}
          .feat-booking-row .booking-badge{margin-left:auto;}
          .hero-h1{font-size:40px!important;}
          .hero-left-panel{padding:32px 24px!important;}
          .hero-photo-panel{min-height:200px!important;}
          .footer-main{flex-direction:column!important;gap:16px!important;padding:24px 20px 16px!important;}
          .footer-main>div:first-child{text-align:center!important;align-items:center!important;gap:8px!important;flex:none!important;width:100%!important;}
          .footer-main>div:first-child img{margin:0 auto!important;}
          .footer-main>div:first-child p{text-align:center!important;margin:4px auto 0!important;font-size:13px!important;}
          .footer-main>div:first-child ul{justify-content:center!important;margin-top:0!important;}
          .footer-cols{grid-template-columns:1fr 1fr!important;gap:8px 16px!important;}
          .footer-cols>div:nth-child(3){grid-column:2!important;grid-row:2!important;margin-top:-16px!important;}
          .footer-cols h3{font-size:11px!important;text-transform:uppercase!important;letter-spacing:0.6px!important;margin-bottom:10px!important;}
          .footer-cols ul{gap:8px!important;}
          .footer-bottom{flex-direction:column!important;align-items:center!important;gap:3px!important;text-align:center!important;padding:12px 20px!important;}
          .footer-bottom-links{flex-direction:column!important;gap:3px!important;align-items:center!important;}
        }
        /* Desktop mockup — scala su schermi piccoli senza taglio */
        .desktop-screen{ height:580px; }
        .desktop-outer{ width:100%; overflow:hidden; position:relative; }
        .desktop-inner{ width:860px; transform-origin:top left; }
        @media(max-width:960px){
          .desktop-outer{ height:calc(622px * 0.65); }
          .desktop-inner{ transform:scale(0.65); }
          .desktop-screen{ height:580px; }
        }
        @media(max-width:600px){
          /* 375px - 48px padding = 327px available; scale = 327/860 ≈ 0.38 */
          .desktop-outer{ height:calc(622px * 0.38); }
          .desktop-inner{ transform:scale(0.38); }
          .desktop-screen{ height:580px; }
        }
        /* Dashboard section — testo sinistra + composizione destra */
        .dash-layout{ display:flex; align-items:center; gap:8px; }
        .dash-text-col{ flex:0 0 44%; max-width:44%; }
        .dash-mockup-col{ flex:1; min-width:0; display:flex; justify-content:center; }
        .dash-combo-img{ width:100%; display:block; }
        .dash-mobile-only{ display:none; }
        .dash-label{ font-size:13px; letter-spacing:3px; color:#6c5ce7; text-transform:uppercase; margin-bottom:18px; }
        .dash-h2{ font-size:64px; font-weight:700; color:#1e1b3a; letter-spacing:-2.5px; margin-bottom:22px; line-height:1.06; }
        .dash-desc{ font-size:19px; color:#7a748a; line-height:1.6; max-width:460px; margin:0; }
        @media(max-width:960px){
          .dash-layout{ flex-direction:column; gap:36px; }
          .dash-text-col{ flex:none; max-width:100%; }
          .dash-mockup-col{ width:100%; }
          .dash-combo-img{ display:none; }
          .dash-mobile-only{ display:block; }
          .dash-label{ font-size:11px; }
          .dash-h2{ font-size:32px; letter-spacing:-1px; }
          .dash-desc{ font-size:15px; }
          .hero-bottom-divider{margin-top:24px!important;}
          .desktop-mockup-row{flex-direction:column!important;}
          .desktop-mockup-text{flex:unset!important;max-width:100%!important;}
          .desktop-h2{ white-space:nowrap; }
        .mobile-img-stack{ display:none; }
        .desktop-section{overflow:visible!important;}
        .desktop-row{flex-direction:column!important;gap:32px!important;}
          .desktop-text{flex:unset!important;max-width:100%!important;text-align:left;}
          .desktop-h2{white-space:normal!important;}
          .desktop-text h2{font-size:40px!important;letter-spacing:-1px!important;}
          .desktop-text p{font-size:19px!important;}
          .desktop-img-wrap{justify-content:center!important;}
          .desktop-img-combined{display:none!important;}
          .mobile-img-stack{display:block;width:100%;}
        }
        /* Glass button verde pricing */
        .prenoty-glass-btn-wrap {
          position: relative;
          display: inline-block;
          border-radius: 100px;
        }
        .prenoty-glass-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 13px 40px;
          border-radius: 100px;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          text-decoration: none;
          cursor: pointer;
          background: rgba(93,226,121,0.18);
          backdrop-filter: blur(12px) saturate(160%);
          -webkit-backdrop-filter: blur(12px) saturate(160%);
          border: 1px solid rgba(93,226,121,0.45);
          box-shadow:
            inset 0 1.5px 0 rgba(255,255,255,0.35),
            inset 0 -1px 0 rgba(93,226,121,0.2),
            inset 1px 0 0 rgba(255,255,255,0.1),
            inset -1px 0 0 rgba(255,255,255,0.1),
            0 0 0 1px rgba(93,226,121,0.15),
            0 8px 32px rgba(93,226,121,0.25);
          text-shadow: 0 1px 8px rgba(93,226,121,0.4);
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
          overflow: hidden;
        }
        .prenoty-glass-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 8%;
          width: 84%;
          height: 45%;
          background: linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 100%);
          border-radius: 100px 100px 60% 60%;
          pointer-events: none;
        }
        .prenoty-glass-btn:hover {
          background: rgba(93,226,121,0.26);
          transform: translateY(-2px);
          box-shadow:
            inset 0 1.5px 0 rgba(255,255,255,0.35),
            inset 0 -1px 0 rgba(93,226,121,0.2),
            0 0 0 1px rgba(93,226,121,0.25),
            0 12px 40px rgba(93,226,121,0.35);
        }
        .prenoty-glass-btn:active { transform: translateY(0) scale(0.97); }
        .prenoty-glass-btn-shadow {
          position: absolute;
          bottom: -10px;
          left: 12%;
          width: 76%;
          height: 16px;
          background: rgba(93,226,121,0.4);
          filter: blur(12px);
          border-radius: 50%;
          pointer-events: none;
        }
        @keyframes prenoty-rotate { to { transform: rotate(360deg); } }
        @property --prenoty-border-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes prenoty-border-spin {
          from { --prenoty-border-angle: 0deg; }
          to   { --prenoty-border-angle: 360deg; }
        }
        .prenoty-pricing-anim-border {
          border: 2px solid transparent;
          background-image:
            linear-gradient(160deg, #6c5ce7 0%, #4a3cb5 100%),
            conic-gradient(
              from var(--prenoty-border-angle),
              rgba(93,226,121,0.12) 0%,
              #5de279 35%,
              #c8ffda 38%,
              #5de279 41%,
              rgba(93,226,121,0.12) 50%,
              rgba(93,226,121,0.12) 75%,
              #5de279 78%,
              #c8ffda 81%,
              #5de279 84%,
              rgba(93,226,121,0.12) 92%
            );
          background-clip: padding-box, border-box;
          background-origin: padding-box, border-box;
          animation: prenoty-border-spin 5s linear infinite;
        }
        .prenoty-pricing-border {
          overflow: hidden;
          pointer-events: none;
          position: absolute;
          z-index: 0;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: calc(100% + 2px);
          height: calc(100% + 2px);
          border-radius: 21px;
        }
        .prenoty-pricing-border::before {
          content: '';
          display: block;
          position: absolute;
          top: 50%;
          left: 50%;
          margin-top: -150%;
          margin-left: -150%;
          width: 300%;
          height: 300%;
          background: conic-gradient(
            rgba(108,92,231,0) 0deg,
            rgba(108,92,231,1) 40deg,
            rgba(162,155,254,0.9) 80deg,
            rgba(93,226,121,0.7) 120deg,
            rgba(108,92,231,0) 160deg,
            rgba(108,92,231,0) 200deg,
            rgba(108,92,231,1) 240deg,
            rgba(162,155,254,0.9) 280deg,
            rgba(93,226,121,0.7) 320deg,
            rgba(108,92,231,0) 360deg
          );
          animation: prenoty-rotate 6s linear infinite;
        }
      `}</style>

      <nav className="nav-gradient-border" style={{position:"sticky",top:0,zIndex:100,background:"#f4f3ff"}}>
        <div className="nav-wrap" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 56px",position:"relative"}}>

          {/* Logo */}
          <a href="/" style={{display:"inline-block",flexShrink:0}}>
            <img src="/Prenoty_Viola.png" alt="Prenoty" style={{height:24,objectFit:"contain"}}/>
          </a>

          {/* Link centrali — solo desktop */}
          <div className="nav-links" style={{display:"flex",gap:32,position:"absolute",left:"50%",transform:"translateX(-50%)"}}>
            <a href="#prezzi" style={{fontSize:14,color:"#13112a",textDecoration:"none",fontWeight:500,transition:"color 0.2s"}}
              onMouseEnter={e=>e.target.style.color="#6c5ce7"}
              onMouseLeave={e=>e.target.style.color="#13112a"}>Prezzi</a>
            <button onClick={()=>setChiSiamoOpen(true)}
              style={{fontSize:14,color:"#13112a",fontWeight:500,background:"none",border:"none",cursor:"pointer",padding:0,transition:"color 0.2s"}}
              onMouseEnter={e=>e.target.style.color="#6c5ce7"}
              onMouseLeave={e=>e.target.style.color="#13112a"}>Chi siamo</button>
          </div>

          {/* Lato destro */}
          <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
            {/* Bottoni CTA — solo desktop */}
            <div className="nav-cta-btns" style={{display:"flex",gap:8}}>
              <a href="/login" className="btn-glass btn-glass-light" style={{fontSize:13,padding:"8px 18px",borderRadius:10,textDecoration:"none"}}>
                <span className="btn-glass-lens"/>
                <span className="btn-glass-text">Accedi</span>
              </a>
              <a href="/registrazione" className="btn-glass btn-glass-purple" style={{fontSize:13,fontWeight:600,padding:"8px 20px",borderRadius:10,textDecoration:"none"}}>
                <span className="btn-glass-lens"/>
                <span className="btn-glass-text">Registrati</span>
              </a>
            </div>
            {/* Hamburger — solo mobile */}
            <button className="hamburger-btn" onClick={()=>setMenuOpen(o=>!o)} aria-label="Menu">
              {menuOpen
                ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          </div>

        </div>

        {/* Dropdown mobile — solo quando menuOpen */}
        <div className="mobile-menu" style={{display: menuOpen ? "flex" : "none",flexDirection:"column",gap:4,padding:"12px 24px 20px",background:"#f4f3ff",borderTop:"1px solid rgba(108,92,231,0.1)"}}>
          {/* Chi siamo e Prezzi — testo semplice */}
          <button onClick={()=>{setChiSiamoOpen(true);setMenuOpen(false);}}
            style={{background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:"14px 4px",fontSize:16,fontWeight:500,color:"#13112a",width:"100%"}}>
            Chi siamo
          </button>
          <a href="#prezzi" onClick={()=>setMenuOpen(false)}
            style={{textDecoration:"none",padding:"14px 4px",fontSize:16,fontWeight:500,color:"#13112a",display:"block"}}>
            Prezzi
          </a>
          <div style={{height:1,background:"rgba(108,92,231,0.12)",margin:"8px 0"}}/>
          {/* Accedi e Registrati — effetto glass */}
          <a href="/login" onClick={()=>setMenuOpen(false)}
            className="btn-glass btn-glass-light"
            style={{padding:"14px 20px",borderRadius:14,fontSize:15,fontWeight:500,textDecoration:"none",width:"100%",justifyContent:"flex-start",marginBottom:2}}>
            <span className="btn-glass-lens"/>
            <span className="btn-glass-text" style={{justifyContent:"flex-start"}}>Accedi</span>
          </a>
          <a href="/registrazione" onClick={()=>setMenuOpen(false)}
            className="btn-glass btn-glass-purple"
            style={{padding:"14px 20px",borderRadius:14,fontSize:15,fontWeight:700,textDecoration:"none",width:"100%",justifyContent:"flex-start"}}>
            <span className="btn-glass-lens"/>
            <span className="btn-glass-text" style={{justifyContent:"flex-start"}}>Registrati</span>
          </a>
        </div>

      </nav>

      <section className="hero-section" style={{background:"transparent",position:"relative",overflow:"hidden",padding:"56px 32px 80px"}}>
        <FadeIn delay={0.05}>
          <div style={{maxWidth:1100,margin:"0 auto",borderRadius:33.5,padding:"1.5px",background:"linear-gradient(135deg,rgba(108,92,231,0.7) 0%,rgba(93,226,121,0.35) 50%,rgba(108,92,231,0.5) 100%)",boxShadow:"0 32px 80px rgba(108,92,231,0.14)"}}>
          <div className="hero-card" style={{borderRadius:32}}>

            {/* ── Pannello sinistro — testo ── */}
            <div className="hero-left-panel">

              {/* Top: badge + titolo + subtitle + CTA */}
              <div>
                <FadeIn delay={0.1}>
                  <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(108,92,231,0.06)",border:"1px solid rgba(108,92,231,0.16)",borderRadius:8,padding:"5px 14px",marginBottom:22}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:"#5de279"}}/>
                    <span style={{fontSize:11,color:"#6c5ce7",letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>30 giorni gratis — nessuna carta</span>
                  </div>
                </FadeIn>
                <FadeIn delay={0.15}>
                  <h1 className="hero-h1">
                    Gestisci le prenotazioni.<br/><span style={{color:"#6c5ce7"}}>Senza stress.</span>
                  </h1>
                </FadeIn>
                <FadeIn delay={0.18}>
                  <p style={{fontSize:17,fontWeight:700,color:"#7a748a",margin:"14px 0 0"}}>Semplice, veloce, senza commissioni.</p>
                </FadeIn>
                <FadeIn delay={0.21}>
                  <p style={{fontSize:16,color:"#7a748a",lineHeight:1.75,maxWidth:400,marginBottom:32}}>
                    Prenoty semplifica la gestione degli appuntamenti per professionisti e saloni. Tutto in un posto, tutto automatico.
                  </p>
                </FadeIn>
                <FadeIn delay={0.27}>
                  <div className="hero-btns">
                    <a href="/registrazione" className="btn-glass btn-glass-green-cta" style={{padding:"13px 30px",borderRadius:50,fontSize:15,fontWeight:700,textDecoration:"none"}}>
                      <span className="btn-glass-lens"/>
                      <span className="btn-glass-text">Inizia gratis</span>
                    </a>
                    <a href="#come-funziona" className="btn-glass btn-glass-light" style={{padding:"13px 26px",borderRadius:50,fontSize:15,fontWeight:500,textDecoration:"none"}}>
                      <span className="btn-glass-lens"/>
                      <span className="btn-glass-text">Scopri come funziona</span>
                    </a>
                  </div>
                </FadeIn>
              </div>

              {/* Bottom: LANCIO UFFICIALE + checkmarks */}
              <FadeIn delay={0.33}>
                <div className="hero-bottom-divider" style={{borderTop:"1px solid rgba(108,92,231,0.1)",paddingTop:24,display:"flex",gap:24,justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap"}}>
                  <div>
                    <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(93,226,121,0.1)",border:"1px solid rgba(93,226,121,0.35)",borderRadius:20,padding:"3px 12px",marginBottom:10}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:"#5de279",boxShadow:"0 0 6px #5de279"}}/>
                      <span style={{fontSize:10,color:"#1e8a40",fontWeight:700,letterSpacing:0.8,textTransform:"uppercase"}}>Lancio Ufficiale</span>
                    </div>
                    <div style={{fontSize:19,fontWeight:700,color:"#13112a",marginBottom:5}}>Sei tra i primi.</div>
                    <div style={{fontSize:13,color:"#9b96c8",lineHeight:1.6}}>Prezzo di lancio attivo.<br/>Posti limitati a 100 professionisti.</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8,paddingTop:4}}>
                    {["Primo anno incluso","Setup in 2 minuti","Supporto in italiano"].map(item=>(
                      <div key={item} style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(108,92,231,0.07)",borderRadius:20,padding:"6px 14px"}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <span style={{fontSize:13,color:"#6c5ce7",fontWeight:500}}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

            </div>

            {/* ── Pannello destro — foto con carosello ── */}
            <div className="hero-photo-panel" style={{position:"relative"}}>
              {/* Placeholder invisibile per mantenere le dimensioni originali */}
              <img
                src="/hero-woman.png"
                alt=""
                aria-hidden="true"
                style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",display:"block",visibility:"hidden"}}
              />
              {/* Slides sovrapposti */}
              {HERO_SLIDES.map((slide, i) => (
                <img
                  key={slide.src}
                  src={isMobile && slide.mobileSrc ? slide.mobileSrc : slide.src}
                  alt="Professionista che usa Prenoty"
                  style={{
                    position:"absolute",top:0,left:0,
                    width:"100%",height:"100%",
                    objectFit:"cover",objectPosition:slide.pos,
                    display:"block",
                    opacity: i === heroSlide ? 1 : 0,
                    transition:"opacity 0.9s ease-in-out",
                  }}
                />
              ))}
              {/* Chip notifica — solo per le slide con notifica definita */}
              {HERO_SLIDES.map((slide, i) => slide.notifica ? (
                <div
                  key={i}
                  style={{
                    position:"absolute",bottom:20,
                    [slide.notifica.side]: 20,
                    background:"rgba(245,245,247,0.82)",
                    borderRadius:16,padding:"11px 16px",
                    boxShadow:"0 2px 16px rgba(0,0,0,0.08)",
                    display:"flex",alignItems:"center",gap:10,
                    backdropFilter:"blur(20px) saturate(160%)",
                    WebkitBackdropFilter:"blur(20px) saturate(160%)",
                    border:"1px solid rgba(255,255,255,0.6)",
                    opacity: i === heroSlide ? 1 : 0,
                    transition:"opacity 0.9s ease-in-out",
                    pointerEvents:"none",
                  }}
                >
                  <div style={{width:9,height:9,borderRadius:"50%",background:"#5de279",boxShadow:"0 0 0 2px rgba(93,226,121,0.3)",flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#13112a",lineHeight:1.3}}>{slide.notifica.testo}</div>
                    <div style={{fontSize:11,color:"#9b9faa",marginTop:2,fontWeight:400}}>{slide.notifica.sub}</div>
                  </div>
                </div>
              ) : null)}
            </div>

          </div>
          </div>{/* fine wrapper gradiente hero-card */}
        </FadeIn>
      </section>

      {/* ── Sezione Desktop Mockup ── */}
      <GradDivider/>
      <section className="sec-pad desktop-section" style={{padding:"80px 56px 80px 0px",background:"#f4f3ff",overflow:"hidden"}}>
        <FadeIn>
          <div className="desktop-row" style={{display:"flex",alignItems:"center",gap:32,maxWidth:1400,margin:"0 auto"}}>
            <div className="desktop-text" style={{flex:1,maxWidth:"none"}}>
              <p style={{fontSize:15,letterSpacing:3,color:"#6c5ce7",textTransform:"uppercase",marginBottom:20,fontWeight:700}}>Ovunque, sempre</p>
              <h2 style={{fontSize:56,fontWeight:800,color:"#13112a",letterSpacing:-2,marginBottom:24,lineHeight:1.08,whiteSpace:isMobile?"normal":"nowrap"}}>Ovunque tu sia,<br/>tutto sotto controllo.</h2>
              <p style={{fontSize:19,color:"#9b96c8",lineHeight:1.7,margin:0}}>{"Gestisci agenda, servizi e clienti da computer o da smartphone."}<br/>{"Stesso account, tutto in tempo reale."}</p>
            </div>
            <div className="desktop-img-wrap" style={{flex:1,display:"flex",justifyContent:"flex-end",alignItems:"center",minWidth:0}}>
              {/* Desktop: immagine combinata */}
              <img
                src="/laptopeiphoneinsieme.png"
                alt="Dashboard Prenoty su desktop e mobile"
                className="desktop-img-combined"
                style={{width:"1756px",maxWidth:"none",height:"auto",objectFit:"contain",marginRight:"-200px",marginLeft:"-400px"}}
              />
              {/* Mobile: laptop + iPhone separati */}
              <div className="mobile-img-stack" style={{overflow:"hidden",margin:"0 -24px"}}>
                <img src="/laptopmockupsprenotyconombra2.png" alt="Dashboard Prenoty su laptop" style={{width:"160%",display:"block",marginBottom:24,marginLeft:"0%"}}/>
                <img src="/Iphone17neroconombra.png" alt="App Prenoty su iPhone" style={{width:"72%",display:"block",margin:"0 auto"}}/>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      <GradDivider/>
      <section id="perche-prenoty" className="sec-pad" style={{padding:"80px 56px",background:"#13112a"}}>
        <FadeIn>
          <p style={{fontSize:15,letterSpacing:3,color:"#6c5ce7",textTransform:"uppercase",marginBottom:12,fontWeight:700}}>Perché scegliere Prenoty?</p>
          <h2 style={{fontSize:40,fontWeight:800,color:"#fff",letterSpacing:-1,marginBottom:48,lineHeight:1.15}}>Tutto quello che ti serve.<br/>Niente di più.</h2>
        </FadeIn>
        <div className="feat-grid" style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:16,gridTemplateAreas:'"preno preno link link dash dash" "prom prom primo primo pers pers"'}}>

          {/* Prenotazioni 24/7 — card principale con mini lista */}
          <FadeIn delay={0} style={{gridArea:"preno",height:"100%"}}>
            <div style={{borderRadius:17,padding:"1.5px",background:"linear-gradient(135deg,rgba(108,92,231,0.7) 0%,rgba(93,226,121,0.35) 50%,rgba(108,92,231,0.5) 100%)",height:"100%",boxSizing:"border-box"}}>
              <div style={{background:"#1a1730",borderRadius:16,padding:"28px",height:"100%",boxSizing:"border-box"}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11,fontWeight:600,color:"#5de279",background:"rgba(93,226,121,0.1)",borderRadius:20,padding:"4px 12px",marginBottom:22}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:"#5de279",flexShrink:0,display:"inline-block"}}/>Funziona mentre dormi
                </span>
                <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:22}}>
                  <div style={{background:"rgba(108,92,231,0.15)",borderRadius:12,padding:"10px",flexShrink:0}}>
                    <Ico d={<><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M3 10h18M8 2v3M16 2v3"/></>} size={22}/>
                  </div>
                  <div>
                    <h3 style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:5}}>Prenotazioni 24/7</h3>
                    <p style={{fontSize:13,color:"#9b96c8",lineHeight:1.65,margin:0}}>I clienti prenotano quando vogliono. Niente telefonate, niente messaggi su WhatsApp.</p>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {[
                    {dot:"#5de279",name:"Valentina R.",serv:"Taglio",time:"Oggi 09:00",badge:"Confermata",bc:"rgba(93,226,121,0.12)",tc:"#5de279"},
                    {dot:"#f59e0b",name:"Marco B.",serv:"Barba",time:"Domani 11:30",badge:"In attesa",bc:"rgba(245,158,11,0.12)",tc:"#f59e0b"},
                    {dot:"#5de279",name:"Sara E.",serv:"Colore",time:"Ven 14:00",badge:"Confermata",bc:"rgba(93,226,121,0.12)",tc:"#5de279"},
                  ].map(({dot,name,serv,time,badge,bc,tc})=>(
                    <div key={name} className="feat-booking-row" style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,overflow:"hidden"}}>
                      <span style={{width:7,height:7,borderRadius:"50%",background:dot,flexShrink:0,display:"inline-block"}}/>
                      <span style={{flex:1,fontSize:13,fontWeight:500,color:"#e8e5ff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0}}>{name} <span style={{color:"#9b96c8",fontWeight:400}}>— {serv}</span></span>
                      <span className="booking-time" style={{fontSize:11,color:"#9b96c8",marginRight:6,whiteSpace:"nowrap",flexShrink:0}}>{time}</span>
                      <span className="booking-badge" style={{fontSize:11,fontWeight:600,color:tc,background:bc,borderRadius:6,padding:"3px 8px",whiteSpace:"nowrap",flexShrink:0}}>{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Dashboard in tempo reale — con stats */}
          <FadeIn delay={0.07} style={{gridArea:"dash",height:"100%"}}>
            <div style={{borderRadius:17,padding:"1.5px",background:"linear-gradient(135deg,rgba(108,92,231,0.7) 0%,rgba(93,226,121,0.35) 50%,rgba(108,92,231,0.5) 100%)",height:"100%",boxSizing:"border-box"}}>
              <div style={{background:"#1a1730",borderRadius:16,padding:"24px",height:"100%",boxSizing:"border-box"}}>
                <div style={{background:"rgba(108,92,231,0.15)",borderRadius:12,padding:"10px",display:"inline-flex",marginBottom:16}}>
                  <Ico d={<><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>} size={20}/>
                </div>
                <h3 style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:6}}>Dashboard in tempo reale</h3>
                <p style={{fontSize:13,color:"#9b96c8",lineHeight:1.65,margin:"0 0 20px"}}>Vedi chi arriva, a che ora e quanto incassi oggi.</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                  {[{v:"7",l:"Oggi"},{v:"€135",l:"Incasso"}].map(({v,l})=>(
                    <div key={l} style={{background:"rgba(255,255,255,0.05)",borderRadius:10,padding:"12px",textAlign:"center"}}>
                      <div style={{fontSize:22,fontWeight:800,color:"#fff",letterSpacing:-0.5}}>{v}</div>
                      <div style={{fontSize:11,color:"#9b96c8",marginTop:3}}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:"rgba(93,226,121,0.07)",border:"1px solid rgba(93,226,121,0.18)",borderRadius:10,padding:"12px",textAlign:"center"}}>
                  <div style={{fontSize:20,fontWeight:800,color:"#5de279",letterSpacing:-0.5}}>€225</div>
                  <div style={{fontSize:11,color:"#9b96c8",marginTop:3}}>Questo mese</div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Il tuo link unico — con URL preview */}
          <FadeIn delay={0.14} style={{gridArea:"link",height:"100%"}}>
            <div style={{borderRadius:17,padding:"1.5px",background:"linear-gradient(135deg,rgba(108,92,231,0.7) 0%,rgba(93,226,121,0.35) 50%,rgba(108,92,231,0.5) 100%)",height:"100%",boxSizing:"border-box"}}>
              <div style={{background:"#1a1730",borderRadius:16,padding:"24px",height:"100%",boxSizing:"border-box"}}>
                <div style={{background:"rgba(108,92,231,0.15)",borderRadius:12,padding:"10px",display:"inline-flex",marginBottom:16}}>
                  <Ico d={<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>} size={20}/>
                </div>
                <h3 style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:6}}>Il tuo link unico</h3>
                <p style={{fontSize:13,color:"#9b96c8",lineHeight:1.65,margin:"0 0 16px"}}>Ogni attività ha la sua pagina personale. Condividila sui social o in bio.</p>
                <div style={{background:"rgba(108,92,231,0.1)",border:"1px solid rgba(108,92,231,0.22)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#a89ff0",marginBottom:10,fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>prenoty.com/sao-salone</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {["Instagram","WhatsApp","Bio"].map(c=>(
                    <span key={c} style={{fontSize:11,fontWeight:500,color:"#9b96c8",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:6,padding:"4px 10px"}}>{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Promemoria automatici — con mini notifiche dark */}
          <FadeIn delay={0.21} style={{gridArea:"prom",height:"100%"}}>
            <div style={{borderRadius:17,padding:"1.5px",background:"linear-gradient(135deg,rgba(108,92,231,0.7) 0%,rgba(93,226,121,0.35) 50%,rgba(108,92,231,0.5) 100%)",height:"100%",boxSizing:"border-box"}}>
              <div style={{background:"#1a1730",borderRadius:16,padding:"24px",height:"100%",boxSizing:"border-box"}}>
                <div style={{background:"rgba(93,226,121,0.12)",borderRadius:12,padding:"10px",display:"inline-flex",marginBottom:16}}>
                  <Ico d={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>} size={20} color="#5de279"/>
                </div>
                <h3 style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:6}}>Promemoria automatici</h3>
                <p style={{fontSize:13,color:"#9b96c8",lineHeight:1.65,margin:"0 0 18px"}}>I clienti ricevono email automatiche. Zero no-show, zero dimentichi.</p>
                {/* Notifica 1: Conferma */}
                <div style={{borderRadius:12,overflow:"hidden",marginBottom:10,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
                  <div style={{padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:26,height:26,borderRadius:"50%",background:"#6c5ce7",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontSize:12,fontWeight:800,color:"#fff"}}>P</span>
                      </div>
                      <span style={{fontWeight:700,color:"#fff",fontSize:13}}>Prenoty</span>
                    </div>
                    <span style={{fontSize:11,fontWeight:600,color:"#5de279",background:"rgba(93,226,121,0.1)",border:"1px solid rgba(93,226,121,0.28)",borderRadius:20,padding:"3px 10px"}}>✓ Confermato</span>
                  </div>
                  <div style={{padding:"12px 14px"}}>
                    <p style={{fontSize:13,fontWeight:700,color:"#fff",margin:"0 0 10px"}}>Appuntamento confermato!</p>
                    {[["Salone","Sao Salone"],["Servizio","Taglio + Barba"],["Quando","Sab 16 maggio"],["Ora","09:00",true]].map(([l,v,purple])=>(
                      <div key={l} style={{display:"flex",gap:12,padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,0.06)",alignItems:"center"}}>
                        <span style={{fontSize:11,color:"#9b96c8",width:52,flexShrink:0}}>{l}</span>
                        <span style={{fontSize:12,fontWeight:600,color:purple?"#6c5ce7":"#e8e5ff"}}>{v}</span>
                      </div>
                    ))}
                    <div style={{marginTop:10,background:"rgba(93,226,121,0.08)",border:"1px solid rgba(93,226,121,0.22)",borderRadius:8,padding:"6px 12px",display:"inline-flex",alignItems:"center",gap:6}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5de279" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                      <span style={{fontSize:11,color:"#5de279",fontWeight:500}}>Riceverai un promemoria 24h prima</span>
                    </div>
                  </div>
                </div>
                {/* Notifica 2: Promemoria */}
                <div style={{borderRadius:12,overflow:"hidden",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
                  <div style={{padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:26,height:26,borderRadius:"50%",background:"#6c5ce7",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontSize:12,fontWeight:800,color:"#fff"}}>P</span>
                      </div>
                      <span style={{fontWeight:700,color:"#fff",fontSize:13}}>Prenoty</span>
                    </div>
                    <span style={{fontSize:11,fontWeight:600,color:"#a89ff0",background:"rgba(108,92,231,0.15)",border:"1px solid rgba(108,92,231,0.3)",borderRadius:20,padding:"3px 10px"}}>Promemoria</span>
                  </div>
                  <div style={{padding:"12px 14px"}}>
                    <p style={{fontSize:13,fontWeight:700,color:"#fff",margin:"0 0 10px"}}>Il tuo appuntamento è domani!</p>
                    {[["Salone","Sao Salone"],["Ora","09:00",true]].map(([l,v,purple])=>(
                      <div key={l} style={{display:"flex",gap:12,padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,0.06)",alignItems:"center"}}>
                        <span style={{fontSize:11,color:"#9b96c8",width:52,flexShrink:0}}>{l}</span>
                        <span style={{fontSize:12,fontWeight:600,color:purple?"#6c5ce7":"#e8e5ff"}}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Personalizza tutto */}
          <FadeIn delay={0.28} style={{gridArea:"pers",height:"100%"}}>
            <div style={{borderRadius:17,padding:"1.5px",background:"linear-gradient(135deg,rgba(108,92,231,0.7) 0%,rgba(93,226,121,0.35) 50%,rgba(108,92,231,0.5) 100%)",height:"100%",boxSizing:"border-box"}}>
              <div style={{background:"#1a1730",borderRadius:16,padding:"24px",height:"100%",boxSizing:"border-box"}}>
                <div style={{background:"rgba(245,158,11,0.12)",borderRadius:12,padding:"10px",display:"inline-flex",marginBottom:16}}>
                  <Ico d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>} size={20} color="#f59e0b"/>
                </div>
                <h3 style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:6}}>Personalizza tutto</h3>
                <p style={{fontSize:13,color:"#9b96c8",lineHeight:1.65,margin:"0 0 18px"}}>Servizi, durata, prezzi, orari. Configuri tutto in pochi minuti.</p>
                <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,overflow:"hidden"}}>
                  {[
                    {l:"Servizio", v:"Taglio + Piega", style:{color:"#a89ff0",fontWeight:700}},
                    {l:"Durata",   v:"60 min",         style:{color:"#e8e5ff",fontWeight:700}},
                    {l:"Prezzo",   v:"€45",            style:{color:"#5de279",fontWeight:700}},
                  ].map(({l,v,style:vs},i,arr)=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,0.07)":"none"}}>
                      <span style={{fontSize:12,color:"#9b96c8"}}>{l}</span>
                      <span style={{fontSize:13,...vs}}>{v}</span>
                    </div>
                  ))}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
                    <span style={{fontSize:12,color:"#9b96c8"}}>Disponibilità</span>
                    <span style={{fontSize:12,fontWeight:600,color:"#e8e5ff",background:"rgba(108,92,231,0.2)",border:"1px solid rgba(108,92,231,0.35)",borderRadius:20,padding:"3px 12px"}}>Lun – Sab</span>
                  </div>
                </div>
                {/* Toggles notifiche */}
                <div style={{marginTop:16}}>
                  {[
                    {icon:<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>,    label:"Email cancellazione"},
                    {icon:<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,                                         label:"Promemoria 24h"},
                    {icon:<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>,            label:"Nuova prenotazione"},
                  ].map(({icon,label},i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:i<2?"1px solid rgba(255,255,255,0.06)":"none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <Ico d={icon} size={14} color="#a89ff0"/>
                        <span style={{fontSize:12,color:"#9b96c8"}}>{label}</span>
                      </div>
                      <div style={{width:32,height:17,borderRadius:9,background:"rgba(93,226,121,0.2)",border:"1px solid rgba(93,226,121,0.35)",display:"flex",alignItems:"center",justifyContent:"flex-end",padding:"0 2px",boxSizing:"border-box"}}>
                        <div style={{width:12,height:12,borderRadius:"50%",background:"#5de279"}}/>
                      </div>
                    </div>
                  ))}
                  <p className="feat-molto-altro">e molto altro...</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Primo mese gratis — card viola hero */}
          <FadeIn delay={0.35} style={{gridArea:"primo",height:"100%"}}>
            <div style={{borderRadius:17,padding:"1.5px",background:"linear-gradient(135deg,rgba(108,92,231,0.7) 0%,rgba(93,226,121,0.5) 50%,rgba(108,92,231,0.7) 100%)",height:"100%",boxSizing:"border-box"}}>
            <div style={{borderRadius:16,background:"#6c5ce7",height:"100%",boxSizing:"border-box",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 32px",textAlign:"center"}}>
              {/* logo */}
              <img src="/Prenoty_Bianco.png" alt="Prenoty" style={{width:280,height:"auto",marginBottom:22}}/>
              {/* tagline */}
              <p style={{fontSize:26,fontWeight:700,color:"rgba(255,255,255,0.95)",margin:"0 0 28px",lineHeight:1.3}}>Semplice, veloce, senza commissioni.</p>
              {/* icona + testo */}
              <div style={{marginBottom:16}}>
                <div style={{background:"rgba(93,226,121,0.2)",border:"1px solid rgba(93,226,121,0.35)",borderRadius:14,padding:"12px",display:"inline-flex",marginBottom:10}}>
                  <Ico d={<><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></>} size={24} color="#5de279"/>
                </div>
                <p style={{fontSize:15,fontWeight:700,color:"#5de279",margin:"0 0 4px"}}>Primo mese gratis</p>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.72)",margin:"0 0 20px",lineHeight:1.5}}>Nessuna carta richiesta.<br/>Provi, e solo se ti piace decidi di continuare.</p>
              </div>
              <a href="/registrazione" className="btn-glass btn-glass-green-cta" style={{padding:"13px 30px",borderRadius:50,fontSize:15,fontWeight:700,textDecoration:"none"}}>
                <span className="btn-glass-lens"/>
                <span className="btn-glass-text">Inizia gratis</span>
              </a>
            </div>
            </div>
          </FadeIn>

        </div>
      </section>

      <section id="come-funziona" style={{padding:"100px 56px",background:"#13112a",overflow:"hidden",position:"relative"}}>
        <div style={{position:"absolute",width:700,height:700,borderRadius:"50%",background:"rgba(108,92,231,0.05)",filter:"blur(120px)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>
        <FadeIn>
          <div style={{textAlign:"center",marginBottom:72}}>
            <p style={{fontSize:15,letterSpacing:3,color:"#6c5ce7",textTransform:"uppercase",marginBottom:12,fontWeight:700}}>Come funziona</p>
            <h2 style={{fontSize:40,fontWeight:800,color:"#fff",letterSpacing:-1.5,lineHeight:1.1,margin:0}}>Tre passi e sei operativo.</h2>
          </div>
        </FadeIn>
        <div className="steps-flow" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:28,maxWidth:1100,margin:"0 auto"}}>
          {[
            {t:"Registrati",          s:"Crea il tuo account in 2 minuti. Solo email e password.",
              img:"/comefunziona1.png",
              border:"linear-gradient(160deg,#00c9a7 0%,#6c5ce7 60%,#4a3cb5 100%)",
              glow:"0 0 40px 8px rgba(0,201,167,0.28),0 0 80px 24px rgba(108,92,231,0.18)",
              stepColor:"#5de279",
              icon:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>},
            {t:"Personalizza",        s:"Aggiungi i tuoi servizi, orari e prezzi. La tua pagina è pronta.",
              img:"/comefunziona2.png",
              border:"linear-gradient(160deg,#6c5ce7 0%,#4a3cb5 100%)",
              glow:"0 0 40px 10px rgba(108,92,231,0.38),0 0 80px 28px rgba(74,60,181,0.22)",
              stepColor:"#5de279",
              icon:<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>},
            {t:"Condividi e incassa", s:"Manda il link ai tuoi clienti. Le prenotazioni arrivano da sole.",
              img:"/comefunziona3.png",
              border:"linear-gradient(160deg,#6c5ce7 0%,#a855f7 50%,#f9ca24 100%)",
              glow:"0 0 40px 8px rgba(108,92,231,0.25),0 0 80px 24px rgba(249,202,36,0.2)",
              stepColor:"#5de279",
              icon:<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>},
          ].map(({t,s,img,border,glow,stepColor,icon},i)=>(
            <FadeIn key={t} delay={i*0.13} style={{height:"100%"}}>
              {/* Outer: bordo gradiente sottile + glow neon */}
              <div style={{borderRadius:20,background:border,boxShadow:glow,padding:2,height:"100%",boxSizing:"border-box"}}>
                {/* Inner scuro #16132e */}
                <div style={{borderRadius:18,background:"#16132e",padding:8,display:"flex",flexDirection:"column",height:"100%",boxSizing:"border-box"}}>
                  {/* Immagine: aspetto naturale, MAI ritagliata, angoli arrotondati su tutti e 4 i lati */}
                  <img src={img} alt={t} style={{width:"100%",height:"auto",display:"block",borderRadius:12,flexShrink:0}}/>
                  {/* Contenuto */}
                  <div style={{padding:"16px 10px 8px",display:"flex",flexDirection:"column",flexGrow:1}}>
                    {/* Riga icona + step */}
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                      <div style={{
                        width:44,height:44,borderRadius:10,flexShrink:0,
                        background:"rgba(108,92,231,0.15)",
                        border:"1px solid rgba(108,92,231,0.35)",
                        display:"flex",alignItems:"center",justifyContent:"center",
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a29bfe" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                      </div>
                      <span style={{fontSize:11,fontWeight:700,letterSpacing:3,color:stepColor,textTransform:"uppercase"}}>Step 0{i+1}</span>
                    </div>
                    <h3 style={{fontSize:20,fontWeight:700,color:"#fff",marginBottom:10,letterSpacing:-0.3}}>{t}</h3>
                    <p style={{fontSize:14,color:"#9b96c8",lineHeight:1.75,margin:0}}>{s}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Sezione App Home Screen ── */}
      <section className="sec-pad" style={{padding:"80px 56px",background:"#13112a",overflow:"hidden"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",gap:64,flexWrap:"wrap"}}>
          {/* Colonna sinistra */}
          <FadeIn delay={0.1} style={{flex:"1 1 340px",minWidth:0}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:7,marginBottom:20}}>
              <span style={{fontSize:15,fontWeight:700,color:"#5de279",letterSpacing:1,textTransform:"uppercase"}}>Per i tuoi clienti</span>
            </div>
            <h2 style={{fontSize:40,fontWeight:800,color:"#fff",letterSpacing:-1,lineHeight:1.1,marginBottom:20}}>Funziona come un'app.<br/>Senza scaricare nulla.</h2>
            <p style={{fontSize:16,color:"rgba(255,255,255,0.55)",lineHeight:1.75,marginBottom:32,maxWidth:460}}>I tuoi clienti aprono il link dal telefono e prenotano in pochi secondi. Possono anche aggiungere Prenoty alla schermata home, esattamente come un'app vera.</p>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {["Nessuna app da installare","Funziona su iPhone e Android","Si aggiunge alla schermata home"].map(item=>(
                <div key={item} style={{display:"flex",alignItems:"center",gap:12}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5de279" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span style={{fontSize:15,color:"rgba(255,255,255,0.8)",fontWeight:500}}>{item}</span>
                </div>
              ))}
            </div>
          </FadeIn>
          {/* Colonna destra — immagine */}
          <FadeIn delay={0.2} style={{flex:"1 1 300px",display:"flex",justifyContent:"center"}}>
            <div style={{borderRadius:26,padding:"3px",background:"linear-gradient(135deg,rgba(108,92,231,0.7) 0%,rgba(93,226,121,0.35) 50%,rgba(108,92,231,0.5) 100%)",width:"100%",maxWidth:isMobile?340:500}}>
              <img src="/prenoty iphone app icon2.png" alt="Prenoty sulla schermata home" style={{width:"100%",borderRadius:25,objectFit:"contain",display:"block"}}/>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Sezione Prezzo ── */}
      <GradDivider/>
      <section id="prezzi" className="sec-pad" style={{padding:"80px 56px",background:"#f4f3ff",textAlign:"center"}}>
        <FadeIn>
          <p style={{fontSize:15,letterSpacing:3,color:"#6c5ce7",textTransform:"uppercase",marginBottom:12,fontWeight:700}}>Prezzo</p>
          <h2 style={{fontSize:40,fontWeight:800,color:"#13112a",letterSpacing:-1,marginBottom:12,lineHeight:1.15}}>Semplice e trasparente.</h2>
          <p style={{fontSize:19,color:"#6b6488",marginBottom:48}}>30 giorni gratis,{isMobile&&<br/>} poi un unico pagamento per tutto l'anno.<br/>Poi scegli il tuo abbonamento.</p>
        </FadeIn>

        <FadeIn delay={0.12}>
          <div style={{position:"relative",maxWidth:400,margin:"0 auto"}}>
            {/* Gradient border wrapper */}
            <div style={{
              borderRadius:23,
              padding:3,
              background:"#5de279",
            }}>
            {/* Card */}
            <div style={{
              position:"relative",
              zIndex:1,
              borderRadius:20,
              padding:"36px 32px",
              background:"linear-gradient(160deg, #6c5ce7 0%, #4a3cb5 100%)",
              boxShadow:"0px -16px 24px 0px rgba(255,255,255,0.12) inset",
            }}>
              {/* Badge 30 giorni gratis */}
              <div style={{
                display:"inline-flex",alignItems:"center",gap:6,
                background:"rgba(93,226,121,0.18)",
                border:"1px solid rgba(93,226,121,0.5)",
                borderRadius:20,padding:"5px 16px",marginBottom:24,
              }}>
                <div style={{width:6,height:6,borderRadius:"50%",background:"#5de279"}}/>
                <span style={{fontSize:11,fontWeight:700,color:"#5de279",letterSpacing:1,textTransform:"uppercase"}}>30 giorni gratis — nessuna carta</span>
              </div>

              {/* Header */}
              <div style={{marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                  <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",border:"1px solid rgba(224,220,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e0dcff" strokeWidth="1.8"><path d="M6 2v4M18 2v4M2 9h20M4 4h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>
                  </div>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#fff",textTransform:"uppercase",letterSpacing:2}}>Piano Prenoty</div>
                    <div style={{fontSize:12,color:"rgba(224,220,255,0.65)"}}>Accesso completo alla piattaforma</div>
                  </div>
                </div>
              </div>

              {/* Divisore */}
              <div style={{height:"1px",background:"rgba(224,220,255,0.2)",margin:"20px 0"}}/>

              {/* Prezzo */}
              <div style={{marginBottom:28,textAlign:"left"}}>
                <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
                  <span style={{fontSize:64,fontWeight:800,color:"#fff",letterSpacing:2,lineHeight:1}}>€299</span>
                  <span style={{fontSize:15,color:"rgba(224,220,255,0.7)",fontWeight:500}}>pagamento unico per il primo anno</span>
                </div>
                <p style={{fontSize:13,color:"rgba(224,220,255,0.5)",margin:0,lineHeight:1.6}}>Prezzo di lancio, riservato ai primi 100 professionisti.<br/>Poi passeremo all'abbonamento.</p>
              </div>

              {/* Features */}
              <ul style={{listStyle:"none",padding:0,margin:"0 0 32px",display:"flex",flexDirection:"column",gap:11}}>
                {[
                  {label:"Prenotazioni illimitate"},
                  {label:"Link personalizzato"},
                  {label:"Notifiche in tempo reale"},
                  {label:"Report mensili"},
                  {label:"Supporto prioritario", star:true},
                ].map(({label,star})=>(
                  <li key={label} style={{display:"flex",alignItems:"center",gap:10,textAlign:"left"}}>
                    <div style={{width:18,height:18,borderRadius:"50%",background:"rgba(93,226,121,0.18)",border:"1px solid rgba(93,226,121,0.5)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#5de279" strokeWidth="3" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                    <span style={{fontSize:14,color:"rgba(255,255,255,0.9)"}}>{label}</span>
                    {star && <svg width="13" height="13" viewBox="0 0 24 24" fill="#f9ca24" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div style={{display:"flex",justifyContent:"center"}}>
                <a href="/registrazione" className="btn-glass btn-glass-green-cta" style={{padding:"13px 36px",borderRadius:50,fontSize:15,fontWeight:700,textDecoration:"none"}}>
                  <span className="btn-glass-lens"/>
                  <span className="btn-glass-text">Inizia gratis — 30 giorni</span>
                </a>
              </div>
              <p style={{textAlign:"center",fontSize:11,color:"rgba(224,220,255,0.4)",marginTop:10}}>
                Nessuna carta di credito richiesta
              </p>
            </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── Sezione FAQ ── */}
      <section className="sec-pad" style={{padding:"80px 56px",background:"#f4f3ff"}}>
        <FadeIn>
          <div style={{textAlign:"center",marginBottom:48}}>
            <span style={{fontSize:15,fontWeight:700,color:"#6c5ce7",letterSpacing:1,textTransform:"uppercase"}}>Domande frequenti</span>
            <h2 style={{fontSize:40,fontWeight:800,color:"#13112a",letterSpacing:-1,marginBottom:0,marginTop:10,lineHeight:1.1}}>Hai qualche dubbio?</h2>
          </div>
          <div style={{maxWidth:760,margin:"0 auto"}}>
            {[
              {q:"Perché pagamento unico e non abbonamento?", a:"Siamo in fase di lancio e vogliamo premiare chi ci crede da subito. Chi acquista ora paga €299 una volta sola e mantiene l'accesso completo per tutto il primo anno, poi si passa a un abbonamento mensile o annuale."},
              {q:"Cosa succede dopo i 30 giorni gratis?", a:"Puoi scegliere se acquistare Prenoty a €299 oppure smettere di usarlo, senza penali, senza carte di credito richieste per iniziare."},
              {q:"I miei clienti devono scaricare un'app?", a:"No. I tuoi clienti prenotano direttamente dal link della tua pagina, dal browser del telefono. Nessuna app da installare."},
              {q:"È difficile configurare?", a:"No. In meno di 10 minuti aggiungi i tuoi servizi, gli orari e il gioco è fatto. La tua pagina prenotazioni è subito online."},
              {q:"Posso gestire più servizi e dipendenti?", a:"Sì. Puoi aggiungere tutti i servizi che offri e tutti i collaboratori del tuo staff, ognuno con foto e ruolo. I clienti scelgono l'operatore preferito al momento della prenotazione."},
              {q:"Gli aggiornamenti futuri sono inclusi?", a:"Sì, per il piano attuale. Chi acquista oggi a €299 mantiene per sempre tutte le funzionalità incluse oggi, senza pagare nulla in più. In futuro lanceremo una versione Pro con funzionalità aggiuntive, disponibile in abbonamento. Chi ha già acquistato potrà scegliere se restare sul piano attuale o passare alla Pro."},
              {q:"E se ho bisogno di aiuto?", a:<>Siamo raggiungibili via email a <a href="mailto:prenoty.official@gmail.com" style={{color:"#6c5ce7",fontWeight:600,textDecoration:"none"}}>prenoty.official@gmail.com</a>. Rispondiamo entro 24 ore.</>},
            ].map(({q,a},i)=><FaqItem key={i} q={q} a={a}/>)}
            <div style={{textAlign:"center",marginTop:40,fontSize:15,color:"#7a748a"}}>
              Non hai trovato risposta?{" "}
              <a href="mailto:prenoty.official@gmail.com" style={{color:"#6c5ce7",fontWeight:600,textDecoration:"none"}}>Scrivici direttamente</a>
            </div>
          </div>
        </FadeIn>
      </section>

      <GradDivider/>
      <section className="sec-pad" style={{padding:"80px 56px",textAlign:"center",background:"#13112a"}}>
        <FadeIn>
          <img src="/P_prenoty_Viola.png" alt="P" style={{width:52,height:52,objectFit:"contain",display:"block",margin:"0 auto 20px"}}/>
          <h2 style={{fontSize:46,fontWeight:800,color:"#fff",letterSpacing:-2,marginBottom:12,lineHeight:1.05}}>Inizia oggi.<br/>È gratis.</h2>
          <p style={{fontSize:16,color:"#9b96c8",marginBottom:36,lineHeight:1.7}}>Prezzo di lancio attivo.<br/>Posti limitati a 100 professionisti.</p>
          <a href="/registrazione" className="btn-glass btn-glass-green-cta" style={{padding:"13px 36px",borderRadius:50,fontSize:15,fontWeight:700,textDecoration:"none"}}>
            <span className="btn-glass-lens"/>
            <span className="btn-glass-text">Registrati gratis</span>
          </a>
        </FadeIn>
      </section>

      <GradDivider/>
      <footer style={{background:"#13112a"}}>
        {/* Fascia principale */}
        <div className="footer-main" style={{maxWidth:1200,margin:"0 auto",padding:"64px 56px 40px",display:"flex",justifyContent:"space-between",gap:48,alignItems:"flex-start"}}>
          {/* Colonna sinistra: logo + tagline + social */}
          <div style={{display:"flex",flexDirection:"column",gap:20,flex:"0 0 260px"}}>
            <img src="/Prenoty_Bianco.png" alt="Prenoty" style={{height:22,objectFit:"contain",objectPosition:"left"}}/>
            <p style={{fontSize:14,color:"rgba(255,255,255,0.45)",lineHeight:1.75,maxWidth:230,margin:0}}>Il sistema di prenotazioni online per professionisti. Semplice, veloce, senza commissioni.</p>
            <ul style={{display:"flex",gap:14,alignItems:"center",padding:0,margin:0}}>
              {[
                {href:"https://www.instagram.com/prenotyofficial", label:"Instagram", color:"#962FBF",
                  svg:<svg className="soc-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>},
                {href:"https://www.facebook.com/prenotyapp",         label:"Facebook",  color:"#4a3cb5",
                  svg:<svg className="soc-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>},
              ].map(({href,label,color,svg})=>(
                <li key={label} className="soc-wrap">
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="soc-btn">
                    <div className="soc-fill" style={{background:color}}/>
                    {svg}
                  </a>
                  <div className="soc-tip" style={{background:color}}>{label}</div>
                </li>
              ))}
            </ul>
          </div>
          {/* Colonne link */}
          <div className="footer-cols" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:48,flex:1}}>
            {[
              {title:"Prodotto", links:[
                {name:"Perché scegliere Prenoty?", href:"#perche-prenoty"},
                {name:"Come funziona",             href:"#come-funziona"},
                {name:"Prezzi",                    href:"#prezzi"},
              ]},
              {title:"Supporto", links:[
                {name:"prenoty.official@gmail.com", href:"mailto:prenoty.official@gmail.com"},
              ]},
              {title:"Legale", links:[
                {name:"Privacy Policy",        href:"https://www.iubenda.com/privacy-policy/22917278"},
                {name:"Termini di servizio",   href:"https://www.iubenda.com/termini-e-condizioni/22917278"},
                {name:"Cookie Policy",         href:"https://www.iubenda.com/privacy-policy/22917278/cookie-policy"},
              ]},
            ].map(({title,links})=>(
              <div key={title}>
                <h3 style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.9)",marginBottom:16,letterSpacing:0.2}}>{title}</h3>
                <ul style={{listStyle:"none",padding:0,margin:0,display:"flex",flexDirection:"column",gap:12}}>
                  {links.map(({name,href})=>(
                    <li key={name}>
                      <a href={href} target={href.startsWith("http")?"_blank":undefined} rel={href.startsWith("http")?"noopener noreferrer":undefined} style={{fontSize:13,color:"rgba(255,255,255,0.45)",textDecoration:"none",transition:"color 0.2s",fontWeight:500}} onMouseEnter={e=>e.currentTarget.style.color="#a29bfe"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.45)"}>{name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        {/* Fascia bottom: dati legali */}
        <div className="footer-bottom" style={{borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 56px",maxWidth:1200,margin:"0 auto",boxSizing:"border-box",width:"100%"}}>
          <span style={{fontSize:12,color:"rgba(255,255,255,0.3)",fontWeight:500}}>© 2026 Prenoty</span>
          <div className="footer-bottom-links" style={{display:"flex",gap:20,alignItems:"center"}}>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>P.IVA 02957190990</span>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.15)"}}>·</span>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>Via Teresio Mario Canepari, 14 — Genova</span>
          </div>
        </div>
      </footer>
      </div>{/* fine wrapper zIndex:1 */}
      {/* CookieBanner sostituito da iubenda Cookie Solution */}

      {/* ── Modal Chi Siamo ── */}
      {chiSiamoOpen && (
        <div onClick={()=>setChiSiamoOpen(false)} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(30,27,58,0.55)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#f4f3ff",borderRadius:24,maxWidth:900,width:"100%",maxHeight:"90vh",overflowY:"auto",padding:"48px 52px",position:"relative",boxShadow:"0 32px 80px rgba(30,27,58,0.25)"}}>

            {/* Chiudi */}
            <button onClick={()=>setChiSiamoOpen(false)} style={{position:"absolute",top:20,right:20,background:"rgba(108,92,231,0.08)",border:"none",borderRadius:"50%",width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <div style={{display:"flex",gap:48,alignItems:"flex-start",flexWrap:"wrap"}}>

              {/* Colonna sinistra */}
              <div style={{flex:"1 1 340px",minWidth:0}}>
                <div style={{marginBottom:20}}>
                  <span style={{fontSize:11,fontWeight:700,color:"#6c5ce7",letterSpacing:2,textTransform:"uppercase"}}>Chi siamo</span>
                </div>
                <h2 style={{fontSize:36,fontWeight:800,color:"#13112a",lineHeight:1.1,letterSpacing:-1,marginBottom:20}}>
                  Da Genova,<br/>per i <span style={{color:"#6c5ce7"}}>professionisti.</span>
                </h2>
                <p style={{fontSize:15,color:"#7a748a",lineHeight:1.75,marginBottom:14}}>
                  Prenoty nasce dall'idea semplice che un parrucchiere, un'estetista o un personal trainer non dovrebbe perdere tempo con chiamate e messaggi per gestire gli appuntamenti.
                </p>
                <p style={{fontSize:15,color:"#7a748a",lineHeight:1.75,marginBottom:32}}>
                  Siamo un piccolo team con un obiettivo grande: dare a ogni professionista uno strumento semplice, bello e che funziona davvero.
                </p>

                {/* Feature list */}
                {[
                  {
                    bg:"rgba(108,92,231,0.10)", color:"#6c5ce7",
                    icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
                    t:"Semplicità prima di tutto",s:"Setup in 5 minuti, nessuna formazione necessaria."
                  },
                  {
                    bg:"rgba(93,226,121,0.12)", color:"#27ae60",
                    icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
                    t:"Supporto in italiano",s:"Siamo raggiungibili su Whatsapp o via email, e risponderemo a ogni tua richiesta in meno di 24 ore."
                  },
                  {
                    bg:"rgba(108,92,231,0.08)", color:"#6c5ce7",
                    icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
                    t:"In continua evoluzione",s:"Ogni aggiornamento nasce dai feedback reali dei nostri utenti."
                  },
                ].map(({icon,bg,t,s})=>(
                  <div key={t} style={{display:"flex",gap:14,marginBottom:22}}>
                    <div style={{width:44,height:44,borderRadius:13,background:bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>{icon}</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:"#13112a",marginBottom:3}}>{t}</div>
                      <div style={{fontSize:13,color:"#9b96c8",lineHeight:1.6}}>{s}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Colonna destra */}
              <div style={{flex:"1 1 260px",minWidth:0,display:"flex",flexDirection:"column",gap:12}}>
                {/* Team card */}
                <div style={{background:"#fff",borderRadius:18,padding:"28px 24px",textAlign:"center",boxShadow:"0 4px 24px rgba(108,92,231,0.08)",border:"1px solid rgba(108,92,231,0.08)"}}>
                  <img src="/team-photo2.png" alt="Il Team Prenoty" style={{width:96,height:96,borderRadius:"50%",objectFit:"cover",margin:"0 auto 14px",display:"block"}}/>
                  <div style={{fontSize:15,fontWeight:700,color:"#13112a",marginBottom:4}}>Il Team Prenoty</div>
                  <div style={{fontSize:13,color:"#9b96c8",marginBottom:16}}>Genova, Italia</div>
                  <div style={{fontSize:13,color:"#6c5ce7",fontStyle:"italic",lineHeight:1.65}}>"Vogliamo che ogni professionista possa dedicarsi al suo lavoro, non alla burocrazia degli appuntamenti."</div>
                </div>

                {/* Stats 2×2 */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[
                    {v:"2026",c:"#6c5ce7",label:"Anno di fondazione"},
                    {v:"🇮🇹",c:"#1e1b3a",label:"100% italiano"},
                    {v:"24h",c:"#6c5ce7",label:"Risposta supporto"},
                    {v:"30gg",c:"#5de279",label:"Gratis, senza carta"},
                  ].map(({v,c,label})=>(
                    <div key={label} style={{background:"#fff",borderRadius:14,padding:"16px 14px",textAlign:"center",border:"1px solid rgba(108,92,231,0.08)"}}>
                      <div style={{fontSize:22,fontWeight:800,color:c,marginBottom:4}}>{v}</div>
                      <div style={{fontSize:11,color:"#9b96c8"}}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
