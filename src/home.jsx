import { useEffect, useRef, useState } from "react";
import ShaderBackground from "./ShaderBackground";

const GLASS_MAP = "data:image/webp;base64,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";

function useInView(t=0.1){const r=useRef(null);const[v,s]=useState(false);useEffect(()=>{const o=new IntersectionObserver(([e])=>{if(e.isIntersecting)s(true)},{threshold:t});if(r.current)o.observe(r.current);return()=>o.disconnect();},[]);return[r,v];}

function FadeIn({children,delay=0,direction="up",style={}}){
  const[r,v]=useInView();
  const tr=direction==="up"?"translateY(24px)":direction==="right"?"translateX(24px)":"translateY(0)";
  return <div ref={r} style={{opacity:v?1:0,transform:v?"translate(0)":tr,transition:`opacity 0.7s ease ${delay}s,transform 0.7s ease ${delay}s`,...style}}>{children}</div>;
}

function Ico({d,size=20}){
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
}

function IPhone(){
  const[sc,setSc]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setSc(s=>(s+1)%2),4500);return()=>clearInterval(t);},[]);
  const accent="#6c5ce7",green="#00b894",textMain="#1e1b3a",textSoft="#4a4580",textMuted="#9b96c8",border="#e0dcff",card="#fff",bg="#f4f3ff";

  return(
    <div style={{position:"relative",width:280,flexShrink:0}}>
      <div style={{width:280,height:580,background:"linear-gradient(145deg,#2a2a2a 0%,#1a1a1a 40%,#2a2a2a 100%)",borderRadius:50,padding:"8px",boxShadow:"0 0 0 1px #3a3a3a,inset 0 0 0 1px #444,0 40px 100px rgba(0,0,0,0.7),0 0 80px rgba(108,92,231,0.2)",position:"relative"}}>
        <div style={{position:"absolute",left:-3,top:100,width:3,height:32,background:"#333",borderRadius:"2px 0 0 2px"}}/>
        <div style={{position:"absolute",left:-3,top:145,width:3,height:56,background:"#333",borderRadius:"2px 0 0 2px"}}/>
        <div style={{position:"absolute",left:-3,top:215,width:3,height:56,background:"#333",borderRadius:"2px 0 0 2px"}}/>
        <div style={{position:"absolute",right:-3,top:160,width:3,height:80,background:"#333",borderRadius:"0 2px 2px 0"}}/>

        <div style={{width:"100%",height:"100%",background:bg,borderRadius:44,overflow:"hidden",position:"relative"}}>
          {/* Dynamic Island */}
          <div style={{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",width:100,height:30,background:"#000",borderRadius:20,zIndex:10,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 10px"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#1a1a1a",border:"1px solid #333"}}/>
            <div style={{width:10,height:10,borderRadius:"50%",background:"#1a1a1a",border:"1px solid #333"}}/>
          </div>

          {/* ── SCREEN A: Dashboard Titolare ── */}
          <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,opacity:sc===0?1:0,transition:"opacity 0.8s ease",overflow:"hidden"}}>
            {/* Header */}
            <div style={{marginTop:50,background:card,borderBottom:`1px solid ${border}`,padding:"6px 11px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:26,height:26,borderRadius:8,overflow:"hidden",background:`linear-gradient(135deg,#6c5ce7,#a29bfe)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:11,color:"#fff",fontWeight:700}}>A</span>
                </div>
                <div style={{fontSize:8.5,fontWeight:700,color:textMain,lineHeight:1}}>Atelier Bellezza</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:20,height:20,borderRadius:"50%",border:`1px solid ${border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={textSoft} strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                </div>
                <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(108,92,231,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </div>
              </div>
            </div>

            {/* Tab nav */}
            <div style={{background:card,borderBottom:`1px solid ${border}`,display:"flex",overflowX:"hidden"}}>
              {[["Agenda",true],["Clienti",false],["Servizi",false],["Staff",false],["Recensioni",false],["Report",false]].map(([lbl,on])=>(
                <div key={lbl} style={{padding:"5px 7px",fontSize:6.5,fontWeight:on?600:400,color:on?accent:textMuted,borderBottom:on?`2px solid ${accent}`:"2px solid transparent",letterSpacing:"0.03em",flexShrink:0}}>{lbl}</div>
              ))}
            </div>

            {/* Stats 2×2 */}
            <div style={{padding:"7px 9px 0",display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
              <div style={{background:accent,borderRadius:10,padding:"7px 9px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                  <div style={{width:15,height:15,background:"rgba(255,255,255,0.2)",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>
                  </div>
                  <span style={{fontSize:5.5,color:"rgba(255,255,255,0.75)",letterSpacing:0.5}}>OGGI</span>
                </div>
                <div style={{fontSize:19,fontWeight:700,color:"#fff",lineHeight:1}}>7</div>
                <div style={{fontSize:6.5,color:"rgba(255,255,255,0.75)",marginTop:1}}>appuntamenti</div>
              </div>
              <div style={{background:green,borderRadius:10,padding:"7px 9px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                  <div style={{width:15,height:15,background:"rgba(255,255,255,0.2)",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <span style={{fontSize:5.5,color:"rgba(255,255,255,0.75)",letterSpacing:0.5}}>OGGI</span>
                </div>
                <div style={{fontSize:19,fontWeight:700,color:"#fff",lineHeight:1}}>€135</div>
                <div style={{fontSize:6.5,color:"rgba(255,255,255,0.75)",marginTop:1}}>incasso previsto</div>
              </div>
              <div style={{background:card,border:`1px solid ${border}`,borderRadius:10,padding:"7px 9px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                  <div style={{width:15,height:15,background:"rgba(108,92,231,0.1)",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                  </div>
                  <span style={{fontSize:5.5,color:textMuted,letterSpacing:0.5}}>MESE</span>
                </div>
                <div style={{fontSize:17,fontWeight:700,color:textMain,lineHeight:1}}>€225</div>
                <div style={{fontSize:6.5,color:textMuted,marginTop:1}}>confermate</div>
              </div>
              <div style={{background:card,border:`1px solid ${border}`,borderRadius:10,padding:"7px 9px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                  <div style={{width:15,height:15,background:"rgba(108,92,231,0.1)",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  </div>
                  <span style={{fontSize:5,color:textMuted,letterSpacing:0.3}}>PAGATO ONLINE</span>
                </div>
                <div style={{fontSize:17,fontWeight:700,color:textMain,lineHeight:1}}>€0</div>
                <div style={{fontSize:6.5,color:textMuted,marginTop:1}}>ricevuto oggi</div>
              </div>
            </div>

            {/* Lista prenotazioni */}
            <div style={{margin:"6px 9px 0",background:card,border:`1px solid ${border}`,borderRadius:10,overflow:"hidden"}}>
              <div style={{padding:"4px 9px",borderBottom:`1px solid ${border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:6.5,fontWeight:600,color:textMuted,letterSpacing:"0.1em"}}>PRENOTAZIONI (7)</span>
                <div style={{display:"flex",gap:2}}>
                  {["OGGI","SETTIMANA","TUTTI"].map((v,i)=>(
                    <span key={v} style={{fontSize:5.5,padding:"2px 4px",borderRadius:3,background:i===0?"#1e1b3a":"transparent",color:i===0?"#fff":textMuted}}>{v}</span>
                  ))}
                </div>
              </div>
              <div style={{padding:"2px 9px",background:bg,borderBottom:`1px solid ${border}`}}>
                <span style={{fontSize:6,color:textMuted,letterSpacing:"0.1em"}}>MAR 12 MAG</span>
              </div>
              {[
                {ora:"08:00",dur:"30m",nome:"Valentina R.",serv:"Taglio Donna · Sao",prezzo:"€35",pagato:false},
                {ora:"09:00",dur:"90m",nome:"Maria B.",serv:"Colore · Sao",prezzo:"€65",pagato:true},
                {ora:"10:30",dur:"60m",nome:"Elena F.",serv:"Taglio + Piega · Sao",prezzo:"€50",pagato:false},
                {ora:"11:00",dur:"30m",nome:"Sara E.",serv:"Piega · Sao",prezzo:"€25",pagato:true},
              ].map(({ora,dur,nome,serv,prezzo,pagato})=>(
                <div key={ora} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 9px",borderBottom:`1px solid ${border}`}}>
                  <div style={{textAlign:"right",minWidth:24,flexShrink:0}}>
                    <div style={{fontSize:7.5,fontWeight:600,color:textMain}}>{ora}</div>
                    <div style={{fontSize:5.5,color:textMuted}}>{dur}</div>
                  </div>
                  <div style={{width:2,alignSelf:"stretch",background:accent,borderRadius:2,flexShrink:0,opacity:0.5}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:7.5,fontWeight:600,color:textMain,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{nome}</div>
                    <div style={{fontSize:6,color:textSoft,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{serv}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:8,fontWeight:600,color:accent}}>{prezzo}</div>
                    <div style={{fontSize:5.5,color:pagato?green:textMuted}}>{pagato?"✓ Pagato":"In salone"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── SCREEN B: App Cliente con cover + galleria ── */}
          <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,opacity:sc===1?1:0,transition:"opacity 0.8s ease",overflow:"hidden",fontFamily:"Georgia,'Times New Roman',serif",background:card}}>
            {/* Header PWA */}
            <div style={{marginTop:50,background:card,borderBottom:`1px solid ${border}`,padding:"5px 11px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:5,border:`1px solid ${border}`,borderRadius:20,padding:"3px 8px"}}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                <span style={{fontSize:7,color:textSoft}}>Aggiungi home</span>
              </div>
              <div style={{display:"flex",gap:3}}>
                <div style={{width:22,height:22,borderRadius:"50%",border:`1px solid ${border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={textSoft} strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                </div>
                <div style={{width:22,height:22,borderRadius:"50%",border:`1px solid ${border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={textSoft} strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                </div>
              </div>
            </div>
            {/* Cover photo */}
            <div style={{padding:"0 11px"}}>
              <div style={{height:80,position:"relative",overflow:"hidden",borderRadius:8}}>
                <img src="/cover.jpg" style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.3) 100%)"}}/>
              </div>
            </div>
            {/* Profile */}
            <div style={{textAlign:"center",padding:"8px 12px 6px"}}>
              <div style={{width:40,height:40,borderRadius:13,background:"linear-gradient(135deg,#6c5ce7,#a29bfe)",display:"flex",alignItems:"center",justifyContent:"center",margin:"-24px auto 6px",color:"#fff",fontSize:15,fontWeight:700,border:`2px solid ${card}`,position:"relative",zIndex:1}}>A</div>
              <div style={{fontSize:13,fontWeight:600,color:textMain,letterSpacing:"0.02em",marginBottom:2}}>Atelier Bellezza</div>
              <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:2,marginBottom:2}}>
                {[1,2,3,4,5].map(i=><span key={i} style={{fontSize:8,color:"#f9ca24"}}>★</span>)}
                <span style={{fontSize:6.5,color:textSoft,marginLeft:2}}>4.9 · 48 recensioni</span>
              </div>
              <p style={{fontSize:6.5,color:textMuted,margin:"0 0 7px"}}>Siamo i migliori a Genova, vieni a trovarci!</p>
              <button style={{background:textMain,color:"#fff",border:"none",padding:"7px 22px",fontSize:7.5,letterSpacing:"0.18em",cursor:"pointer",borderRadius:2,width:"80%"}}>PRENOTA ORA</button>
            </div>
            {/* Galleria */}
            <div style={{padding:"6px 11px 0"}}>
              <div style={{fontSize:6.5,color:textMuted,letterSpacing:"0.18em",marginBottom:5}}>GALLERIA</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3,padding:"0 8px"}}>
                {[
                  "/gallery/gallery1.jpg",
                  "/gallery/gallery2.jpg",
                  "/gallery/gallery3.jpg",
                  "/gallery/gallery4.jpg",
                  "/gallery/gallery5.jpg",
                  "/gallery/gallery6.jpg",
                ].map((url,i)=>(
                  <div key={i} style={{aspectRatio:"1",borderRadius:6,overflow:"hidden"}}>
                    <img src={url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                  </div>
                ))}
              </div>
            </div>
            {/* Servizi preview */}
            <div style={{padding:"7px 11px 0"}}>
              <div style={{fontSize:6.5,color:textMuted,letterSpacing:"0.18em",marginBottom:4}}>I NOSTRI SERVIZI</div>
              {[
                {n:"Taglio",d:"30 min",p:"€15"},
                {n:"Colore",d:"60 min",p:"€45"},
              ].map(({n,d,p})=>(
                <div key={n} style={{background:bg,border:`1px solid ${border}`,padding:"5px 9px",marginBottom:3,display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:4}}>
                  <div>
                    <div style={{fontSize:8,color:textMain}}>{n}</div>
                    <div style={{fontSize:6,color:textMuted}}>{d}</div>
                  </div>
                  <div style={{fontSize:8,color:accent,fontWeight:600}}>{p}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div style={{position:"absolute",bottom:14,left:"50%",transform:"translateX(-50%)",display:"flex",gap:6}}>
            {[0,1].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:sc===i?accent:"rgba(108,92,231,0.2)",transition:"background 0.5s"}}/>)}
          </div>
        </div>
      </div>
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
  const urls=["prenoty.com/dashboard","prenoty.com/dashboard","prenoty.com/atelier-bellezza"];
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
                      <div style={{width:2,alignSelf:"stretch",background:nuovo?accent:border,borderRadius:2,flexShrink:0}}/>
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
                    {n:"Colore",d:"90 min",p:"€65",col:"#e17055"},
                    {n:"Piega",d:"30 min",p:"€25",col:"#00b894"},
                    {n:"Taglio + Piega",d:"60 min",p:"€50",col:"#fdcb6e"},
                    {n:"Trattamento",d:"45 min",p:"€40",col:"#74b9ff"},
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

export default function Home(){
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

      {/* ── Sfondo WebGL aurora — palette Prenoty ── */}
      <ShaderBackground/>

      {/* Contenuto sopra il canvas shader */}
      <div style={{position:"relative",zIndex:1}}>
      <style>{`
        *{box-sizing:border-box;}
        html,body{
          background:#0f0d24!important;
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

        /* Ghost neutro */
        .btn-glass-ghost{ color:rgba(255,255,255,0.88) !important; }
        .btn-glass-ghost .btn-glass-lens{ background:rgba(255,255,255,0.07); }
        .btn-glass-ghost:hover .btn-glass-lens{ background:rgba(255,255,255,0.13); }

        /* Viola (nav Registrati) */
        .btn-glass-purple{ color:#fff !important; }
        .btn-glass-purple .btn-glass-lens{ background:rgba(108,92,231,0.35); }
        .btn-glass-purple:hover .btn-glass-lens{ background:rgba(108,92,231,0.48); }

        @media(max-width:960px){
          .hero-inner{flex-direction:column!important;padding:48px 24px 64px!important;min-height:auto!important;align-items:center!important;text-align:center;}
          .hero-h1{font-size:58px!important;letter-spacing:-1px!important;}
          .hero-btns{justify-content:center!important;}
          .hero-cats{justify-content:center!important;}
          .feat-grid{grid-template-columns:1fr 1fr!important;}
          .steps-grid{grid-template-columns:1fr!important;gap:24px!important;}
          .nav-wrap{padding:14px 24px!important;}
          .sec-pad{padding:56px 24px!important;}
        }
        @media(max-width:600px){
          .feat-grid{grid-template-columns:1fr!important;}
          .hero-h1{font-size:50px!important;}
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
        /* Cellulare hero: desktop scale 1.28, mobile più piccolo */
        .hero-phone-scale{ transform:scale(1.28); transform-origin:top left; position:absolute; top:0; left:0; }
        .hero-phone-wrap{ position:relative; width:358px; height:742px; flex-shrink:0; }
        @media(max-width:960px){
          .hero-phone-scale{ transform:scale(0.82)!important; }
          .hero-phone-wrap{ width:230px!important; height:476px!important; }
        }
      `}</style>

      <nav style={{borderBottom:"0.5px solid rgba(108,92,231,0.15)",position:"sticky",top:0,zIndex:100,background:"rgba(26,23,48,0.92)",backdropFilter:"blur(20px)"}}>
        <div className="nav-wrap" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 56px"}}>
          <a href="/" style={{display:"inline-block"}}><img src="/Prenoty_Bianco.png" alt="Prenoty" style={{height:22,objectFit:"contain"}}/></a>
          <div style={{display:"flex",gap:10}}>
            <a href="/login" className="btn-glass btn-glass-ghost" style={{fontSize:13,padding:"8px 18px",borderRadius:10,textDecoration:"none"}}>
              <span className="btn-glass-lens"/>
              <span className="btn-glass-text">Accedi</span>
            </a>
            <a href="/registrazione" className="btn-glass btn-glass-purple" style={{fontSize:13,fontWeight:600,padding:"8px 20px",borderRadius:10,textDecoration:"none"}}>
              <span className="btn-glass-lens"/>
              <span className="btn-glass-text">Registrati</span>
            </a>
          </div>
        </div>
      </nav>

      <section style={{background:"transparent",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"rgba(108,92,231,0.06)",filter:"blur(80px)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>
        <div className="hero-inner" style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"80px 56px",minHeight:"90vh",minHeight:"90svh",gap:72,position:"relative",zIndex:1}}>
          <div style={{flex:1,maxWidth:500}}>
            <FadeIn delay={0.05}>
              <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(108,92,231,0.12)",border:"0.5px solid rgba(108,92,231,0.3)",borderRadius:8,padding:"5px 14px",marginBottom:24}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:"#5de279"}}/>
                <span style={{fontSize:11,color:"#9b96c8",letterSpacing:1,textTransform:"uppercase"}}>30 giorni gratis — nessuna carta</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="hero-h1" style={{fontSize:76,fontWeight:800,color:"#fff",lineHeight:1.05,letterSpacing:-2,marginBottom:20}}>
                Gestisci le<br/>prenotazioni.<br/><span style={{color:"#5de279"}}>Senza Stress.</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.18}>
              <p style={{fontSize:16,color:"#9b96c8",lineHeight:1.8,maxWidth:400,marginBottom:32}}>
                Un link. I tuoi clienti prenotano da soli. Tu ricevi tutto organizzato in tempo reale.
              </p>
            </FadeIn>
            <FadeIn delay={0.25}>
              <div className="hero-btns" style={{display:"flex",gap:12,marginBottom:32,flexWrap:"wrap"}}>
                <a href="/registrazione" className="btn-glass btn-glass-green" style={{padding:"14px 32px",borderRadius:12,fontSize:15,fontWeight:700,textDecoration:"none"}}>
                  <span className="btn-glass-lens"/>
                  <span className="btn-glass-text">Inizia gratis</span>
                </a>
                <a href="#come-funziona" className="btn-glass btn-glass-ghost" style={{padding:"14px 24px",borderRadius:12,fontSize:15,textDecoration:"none"}}>
                  <span className="btn-glass-lens"/>
                  <span className="btn-glass-text">Come funziona</span>
                </a>
              </div>
            </FadeIn>
            <FadeIn delay={0.32}>
              <div className="hero-cats" style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                {["Parrucchieri","Estetiste","Spa & benessere","Insegnanti & coach","Studi medici","Fotografi","Personal trainer"].map(c=>(
                  <span key={c} style={{background:"rgba(108,92,231,0.08)",border:"0.5px solid rgba(108,92,231,0.2)",borderRadius:7,padding:"4px 12px",fontSize:11,color:"#9b96c8"}}>{c}</span>
                ))}
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.15} direction="right">
            <div className="hero-phone-wrap">
              <div className="hero-phone-scale">
                <IPhone/>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Sezione Desktop Mockup ── */}
      <section className="sec-pad" style={{padding:"80px 56px",background:"#0f0d24",borderTop:"0.5px solid rgba(108,92,231,0.1)"}}>
        <FadeIn>
          <p style={{fontSize:11,letterSpacing:3,color:"#6c5ce7",textTransform:"uppercase",marginBottom:12}}>Dashboard completa</p>
          <h2 style={{fontSize:36,fontWeight:700,color:"#fff",letterSpacing:-1,marginBottom:12,lineHeight:1.15}}>Anche su desktop,<br/>tutto sotto controllo.</h2>
          <p style={{fontSize:15,color:"#9b96c8",marginBottom:44,maxWidth:480}}>Gestisci agenda, servizi e clienti da computer. Stesso account, stesso dato in tempo reale.</p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <Desktop/>
        </FadeIn>
      </section>

      <section className="sec-pad" style={{padding:"80px 56px",background:"#13112b",borderTop:"0.5px solid rgba(108,92,231,0.12)"}}>
        <FadeIn>
          <p style={{fontSize:11,letterSpacing:3,color:"#6c5ce7",textTransform:"uppercase",marginBottom:12}}>Perché scegliere Prenoty?</p>
          <h2 style={{fontSize:36,fontWeight:700,color:"#fff",letterSpacing:-1,marginBottom:48,lineHeight:1.15}}>Tutto quello che ti serve.<br/>Niente di più.</h2>
        </FadeIn>
        <div className="feat-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {[
            {d:<><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M3 10h18M8 2v3M16 2v3"/></>,t:"Prenotazioni 24/7",s:"I clienti prenotano quando vogliono. Niente telefonate, niente messaggi su WhatsApp."},
            {d:<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,t:"Il tuo link unico",s:"Ogni attività ha la sua pagina personale. Condividila sui social o in bio."},
            {d:<><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>,t:"Dashboard in tempo reale",s:"Vedi tutte le prenotazioni del giorno, confermi o sposti con un tap."},
            {d:<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,t:"Promemoria automatici",s:"I clienti ricevono notifiche automatiche. Zero no-show, zero dimentichi."},
            {d:<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,t:"Personalizza tutto",s:"Servizi, durata, prezzi, orari. Configuri tutto in pochi minuti."},
            {d:<><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></>,t:"Primo mese gratis",s:"Nessuna carta richiesta. Provi, e solo se ti piace decidi di continuare."},
          ].map(({d,t,s},i)=>(
            <FadeIn key={t} delay={i*0.07} style={{height:"100%"}}>
              <div style={{borderRadius:17,padding:"1.5px",background:"linear-gradient(135deg,rgba(108,92,231,0.7) 0%,rgba(93,226,121,0.35) 50%,rgba(108,92,231,0.5) 100%)",height:"100%",boxSizing:"border-box"}}>
                <div style={{background:"#13112b",borderRadius:16,padding:"28px 24px",height:"100%",boxSizing:"border-box"}}>
                  <div style={{marginBottom:16}}><Ico d={d} size={22}/></div>
                  <h3 style={{fontSize:15,fontWeight:600,color:"#fff",marginBottom:8}}>{t}</h3>
                  <p style={{fontSize:14,color:"#9b96c8",lineHeight:1.7,margin:0}}>{s}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section id="come-funziona" className="sec-pad" style={{padding:"80px 56px",background:"#1a1730"}}>
        <FadeIn>
          <p style={{fontSize:11,letterSpacing:3,color:"#6c5ce7",textTransform:"uppercase",marginBottom:12}}>Come funziona</p>
          <h2 style={{fontSize:36,fontWeight:700,color:"#fff",letterSpacing:-1,marginBottom:56,lineHeight:1.15}}>Tre passi e sei operativo.</h2>
        </FadeIn>
        <div className="steps-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:32}}>
          {[
            {n:"01",t:"Registrati",s:"Crea il tuo account in 2 minuti. Solo email e password."},
            {n:"02",t:"Personalizza",s:"Aggiungi i tuoi servizi, orari e prezzi. La tua pagina è pronta."},
            {n:"03",t:"Condividi e incassa",s:"Manda il link ai tuoi clienti. Le prenotazioni arrivano da sole."},
          ].map(({n,t,s},i)=>(
            <FadeIn key={n} delay={i*0.12}>
              <div style={{borderTop:"1.5px solid rgba(108,92,231,0.3)",paddingTop:24}}>
                <div style={{fontSize:48,fontWeight:800,color:"rgba(108,92,231,0.15)",letterSpacing:-2,marginBottom:14,lineHeight:1}}>{n}</div>
                <h3 style={{fontSize:20,fontWeight:700,color:"#fff",marginBottom:10}}>{t}</h3>
                <p style={{fontSize:14,color:"#9b96c8",lineHeight:1.75,margin:0}}>{s}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Sezione Prezzo ── */}
      <section className="sec-pad" style={{padding:"80px 56px",background:"#1a1730",borderTop:"0.5px solid rgba(108,92,231,0.12)",textAlign:"center"}}>
        <FadeIn>
          <p style={{fontSize:11,letterSpacing:3,color:"#6c5ce7",textTransform:"uppercase",marginBottom:12}}>Prezzo</p>
          <h2 style={{fontSize:36,fontWeight:700,color:"#fff",letterSpacing:-1,marginBottom:12,lineHeight:1.15}}>Semplice e trasparente.</h2>
          <p style={{fontSize:16,color:"#9b96c8",marginBottom:48}}>30 giorni gratis, poi un unico pagamento.<br/>Nessun abbonamento mensile.</p>
        </FadeIn>

        <FadeIn delay={0.12}>
          <div style={{
            position:"relative",
            maxWidth:400,
            margin:"0 auto",
            borderRadius:20,
            padding:"2px",
            background:"linear-gradient(135deg, rgba(108,92,231,0.8) 0%, rgba(93,226,121,0.4) 50%, rgba(108,92,231,0.6) 100%)",
            boxShadow:"0 0 80px rgba(108,92,231,0.25)",
          }}>
            {/* Card interna */}
            <div style={{
              borderRadius:18,
              padding:"36px 32px",
              background:"linear-gradient(160deg, rgba(30,27,60,0.98) 0%, rgba(20,18,45,0.99) 100%)",
              position:"relative",
              overflow:"hidden",
            }}>
              {/* Glow bg */}
              <div style={{position:"absolute",width:300,height:300,borderRadius:"50%",background:"rgba(108,92,231,0.07)",filter:"blur(60px)",top:-80,right:-80,pointerEvents:"none"}}/>
              <div style={{position:"absolute",width:200,height:200,borderRadius:"50%",background:"rgba(93,226,121,0.05)",filter:"blur(50px)",bottom:-60,left:-60,pointerEvents:"none"}}/>

              {/* Badge 30 giorni gratis */}
              <div style={{
                display:"inline-flex",alignItems:"center",gap:6,
                background:"linear-gradient(135deg,rgba(93,226,121,0.15),rgba(93,226,121,0.08))",
                border:"1px solid rgba(93,226,121,0.35)",
                borderRadius:20,padding:"5px 16px",marginBottom:24,
              }}>
                <div style={{width:6,height:6,borderRadius:"50%",background:"#5de279"}}/>
                <span style={{fontSize:11,fontWeight:700,color:"#5de279",letterSpacing:1,textTransform:"uppercase"}}>30 giorni gratis — nessuna carta</span>
              </div>

              {/* Header */}
              <div style={{marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                  <div style={{width:36,height:36,borderRadius:10,background:"rgba(108,92,231,0.2)",border:"1px solid rgba(108,92,231,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="1.8"><path d="M6 2v4M18 2v4M2 9h20M4 4h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>
                  </div>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:2}}>Piano Prenoty</div>
                    <div style={{fontSize:12,color:"rgba(155,150,200,0.6)"}}>Accesso completo alla piattaforma</div>
                  </div>
                </div>
              </div>

              {/* Divisore */}
              <div style={{height:"1px",background:"rgba(108,92,231,0.2)",margin:"20px 0"}}/>

              {/* Prezzo */}
              <div style={{marginBottom:28,textAlign:"left"}}>
                <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
                  <span style={{fontSize:64,fontWeight:800,color:"#fff",letterSpacing:2,lineHeight:1}}>€299</span>
                  <span style={{fontSize:15,color:"#9b96c8",fontWeight:500}}>pagamento unico</span>
                </div>
                <p style={{fontSize:13,color:"rgba(155,150,200,0.55)"}}>Senza canoni mensili — paghi una volta sola</p>
              </div>

              {/* Features */}
              <ul style={{listStyle:"none",padding:0,margin:"0 0 32px",display:"flex",flexDirection:"column",gap:11}}>
                {[
                  "Prenotazioni illimitate",
                  "Link personalizzato",
                  "Notifiche in tempo reale",
                  "Report mensili",
                  "Supporto prioritario",
                ].map(f=>(
                  <li key={f} style={{display:"flex",alignItems:"center",gap:10,textAlign:"left"}}>
                    <div style={{width:18,height:18,borderRadius:"50%",background:"rgba(93,226,121,0.12)",border:"1px solid rgba(93,226,121,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#5de279" strokeWidth="3" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                    <span style={{fontSize:14,color:"rgba(255,255,255,0.82)"}}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a href="/registrazione" className="btn-glass btn-glass-green" style={{display:"flex",padding:"15px",borderRadius:12,fontSize:15,fontWeight:700,textDecoration:"none"}}>
                <span className="btn-glass-lens"/>
                <span className="btn-glass-text" style={{width:"100%",justifyContent:"center"}}>Inizia gratis — 30 giorni</span>
              </a>
              <p style={{textAlign:"center",fontSize:11,color:"rgba(155,150,200,0.4)",marginTop:10}}>
                Nessuna carta di credito richiesta
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="sec-pad" style={{padding:"80px 56px",textAlign:"center",background:"#13112b",borderTop:"0.5px solid rgba(108,92,231,0.12)"}}>
        <FadeIn>
          <img src="/P_prenoty_Viola.png" alt="P" style={{width:52,height:52,objectFit:"contain",display:"block",margin:"0 auto 20px"}}/>
          <h2 style={{fontSize:46,fontWeight:800,color:"#fff",letterSpacing:-2,marginBottom:12,lineHeight:1.05}}>Inizia oggi.<br/>È gratis.</h2>
          <p style={{fontSize:16,color:"#9b96c8",marginBottom:36}}>30 giorni senza limitazioni. Poi decidi tu.</p>
          <a href="/registrazione" className="btn-glass btn-glass-green" style={{padding:"16px 48px",borderRadius:14,fontSize:16,fontWeight:700,textDecoration:"none"}}>
            <span className="btn-glass-lens"/>
            <span className="btn-glass-text">Registrati gratis</span>
          </a>
        </FadeIn>
      </section>

      <footer style={{background:"#0f0d24",borderTop:"0.5px solid rgba(108,92,231,0.1)"}}>
        <div className="nav-wrap" style={{padding:"24px 56px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <img src="/Prenoty_Bianco.png" alt="Prenoty" style={{height:18,objectFit:"contain",opacity:0.4}}/>
          <div style={{display:"flex",alignItems:"center",gap:18}}>
            {/* Instagram — stile outline rounded square */}
            <a href="https://www.instagram.com/prenotyofficial" target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",opacity:0.75,transition:"opacity 0.2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.75}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a29bfe" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            {/* Facebook — stile cerchio pieno con "f" */}
            <a href="https://www.facebook.com/prenotyapp" target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",opacity:0.75,transition:"opacity 0.2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.75}>
              <svg width="26" height="26" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#a29bfe"/>
                <path d="M13.5 7H15V5h-1.5C12.1 5 11 6.1 11 7.5V9.5H9.5V12H11v7h2v-7h2l.5-2.5H13V7.5c0-.28.22-.5.5-.5z" fill="#0f0d24"/>
              </svg>
            </a>
          </div>
          <span style={{color:"rgba(155,150,200,0.3)",fontSize:12}}>© 2026 Prenoty — Genova, Italia</span>
        </div>
      </footer>
      </div>{/* fine wrapper zIndex:1 */}
    </div>
  );
}
