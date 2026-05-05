import { useEffect, useRef, useState } from "react";

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
  useEffect(()=>{const t=setInterval(()=>setSc(s=>(s+1)%2),4000);return()=>clearInterval(t);},[]);
  const accent="#6c5ce7", green="#5de279", textMain="#1e1b3a", textMuted="#9b96c8", border="#e0dcff", card="#fff", bg="#f4f3ff";

  return(
    <div style={{position:"relative",width:280,flexShrink:0}}>
      {/* iPhone frame */}
      <div style={{
        width:280, height:580,
        background:"linear-gradient(145deg,#2a2a2a 0%,#1a1a1a 40%,#2a2a2a 100%)",
        borderRadius:50,
        padding:"8px",
        boxShadow:"0 0 0 1px #3a3a3a, inset 0 0 0 1px #444, 0 40px 100px rgba(0,0,0,0.7), 0 0 80px rgba(108,92,231,0.2)",
        position:"relative",
      }}>
        {/* Tasti laterali sinistra */}
        <div style={{position:"absolute",left:-3,top:100,width:3,height:32,background:"#333",borderRadius:"2px 0 0 2px"}}/>
        <div style={{position:"absolute",left:-3,top:145,width:3,height:56,background:"#333",borderRadius:"2px 0 0 2px"}}/>
        <div style={{position:"absolute",left:-3,top:215,width:3,height:56,background:"#333",borderRadius:"2px 0 0 2px"}}/>
        {/* Tasto destra */}
        <div style={{position:"absolute",right:-3,top:160,width:3,height:80,background:"#333",borderRadius:"0 2px 2px 0"}}/>

        {/* Schermo */}
        <div style={{
          width:"100%", height:"100%",
          background:bg,
          borderRadius:44,
          overflow:"hidden",
          position:"relative",
        }}>
          {/* Dynamic Island */}
          <div style={{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",width:100,height:30,background:"#000",borderRadius:20,zIndex:10,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 10px"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#1a1a1a",border:"1px solid #333"}}/>
            <div style={{width:10,height:10,borderRadius:"50%",background:"#1a1a1a",border:"1px solid #333"}}/>
          </div>

          

          {/* Contenuto — Screen A: Dashboard titolare */}
          <div style={{position:"absolute",top:52,left:0,right:0,bottom:0,padding:"0 16px 16px",opacity:sc===0?1:0,transition:"opacity 0.8s ease",overflowY:"hidden"}}>
            {/* Header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:28,height:28,borderRadius:8,background:accent,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M6 2v4M18 2v4M2 9h20M4 4h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>
                </div>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:textMain}}>Atelier Bellezza</div>
                  <div style={{fontSize:8,color:textMuted}}>Powered by Prenoty</div>
                </div>
              </div>
              <div style={{width:24,height:24,borderRadius:"50%",background:"rgba(108,92,231,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
            </div>

            <div style={{fontSize:13,fontWeight:700,color:textMain,marginBottom:10}}>Agenda</div>

            {/* Stats cards */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div style={{background:accent,borderRadius:12,padding:"10px 12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <div style={{width:18,height:18,background:"rgba(255,255,255,0.2)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>
                  </div>
                  <span style={{fontSize:7,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:0.5}}>OGGI</span>
                </div>
                <div style={{fontSize:22,fontWeight:800,color:"#fff"}}>5</div>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.7)"}}>appuntamenti</div>
              </div>
              <div style={{background:"#00b894",borderRadius:12,padding:"10px 12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <div style={{width:18,height:18,background:"rgba(255,255,255,0.2)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  </div>
                  <span style={{fontSize:7,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:0.5}}>INCASSO</span>
                </div>
                <div style={{fontSize:22,fontWeight:800,color:"#fff"}}>€245</div>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.7)"}}>previsto</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              <div style={{background:card,border:`1px solid ${border}`,borderRadius:12,padding:"8px 12px"}}>
                <div style={{fontSize:7,color:textMuted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>PAGATO</div>
                <div style={{fontSize:18,fontWeight:700,color:textMain}}>€140</div>
                <div style={{fontSize:8,color:textMuted}}>online</div>
              </div>
              <div style={{background:card,border:`1px solid ${border}`,borderRadius:12,padding:"8px 12px"}}>
                <div style={{fontSize:7,color:textMuted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>NUOVE</div>
                <div style={{fontSize:18,fontWeight:700,color:textMain}}>3</div>
                <div style={{fontSize:8,color:textMuted}}>da vedere</div>
              </div>
            </div>

            {/* Lista prenotazioni */}
            <div style={{fontSize:8,fontWeight:600,color:textMuted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>PRENOTAZIONI (3)</div>
            <div style={{fontSize:7,color:textMuted,marginBottom:6}}>VEN 24 APR</div>
            {[
              {ora:"09:00",dur:"60m",nome:"Gialla Rossi",serv:"Colore · Gialla",prezzo:"€65",stato:"Pagato",new:true},
              {ora:"10:30",dur:"30m",nome:"Marco Bianchi",serv:"Taglio Uomo · Marco",prezzo:"€20",stato:"In salone",new:false},
              {ora:"11:30",dur:"60m",nome:"Sofia Esposito",serv:"Taglio + Piega · Leuro",prezzo:"€50",stato:"Pagato",new:true},
            ].map(({ora,dur,nome,serv,prezzo,stato,new:isNew})=>(
              <div key={ora} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`1px solid ${border}`}}>
                <div style={{textAlign:"right",width:32}}>
                  <div style={{fontSize:9,fontWeight:600,color:textMain}}>{ora}</div>
                  <div style={{fontSize:7,color:textMuted}}>{dur}</div>
                </div>
                <div style={{width:2,height:28,background:accent,borderRadius:2,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <span style={{fontSize:9,fontWeight:600,color:textMain}}>{nome}</span>
                    {isNew && <span style={{fontSize:6,background:accent,color:"#fff",padding:"1px 4px",borderRadius:4}}>NUOVO</span>}
                  </div>
                  <div style={{fontSize:7,color:textMuted}}>{serv}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:9,fontWeight:700,color:accent}}>{prezzo}</div>
                  <div style={{fontSize:7,color:stato==="Pagato"?green:textMuted}}>{stato}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Screen B: App cliente */}
          <div style={{position:"absolute",top:52,left:0,right:0,bottom:0,padding:"0 16px 16px",opacity:sc===1?1:0,transition:"opacity 0.8s ease",overflowY:"hidden"}}>
            <div style={{textAlign:"center",paddingTop:8,marginBottom:14}}>
              <div style={{width:48,height:48,borderRadius:16,background:accent,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:18,fontWeight:700,margin:"0 auto 8px"}}>A</div>
              <div style={{fontSize:13,fontWeight:700,color:textMain}}>Atelier Bellezza</div>
              <div style={{fontSize:8,color:textMuted,marginBottom:4}}>Via Roma 12, Genova</div>
              <div style={{display:"flex",justifyContent:"center",gap:2}}>
                {[1,2,3,4,5].map(i=><span key={i} style={{fontSize:9,color:"#f39c12"}}>★</span>)}
                <span style={{fontSize:8,color:textMuted,marginLeft:3}}>4.9 · 48 recensioni</span>
              </div>
            </div>
            <div style={{fontSize:9,fontWeight:600,color:textMain,marginBottom:8}}>Scegli il servizio</div>
            {[
              {n:"Taglio Donna",d:"45 min",p:"€35",sel:true},
              {n:"Colore",d:"90 min",p:"€65",sel:false},
              {n:"Piega",d:"30 min",p:"€25",sel:false},
              {n:"Taglio + Piega",d:"60 min",p:"€50",sel:false},
            ].map(({n,d,p,sel})=>(
              <div key={n} style={{background:sel?"rgba(108,92,231,0.08)":card,borderRadius:10,padding:"9px 12px",marginBottom:6,display:"flex",alignItems:"center",justifyContent:"space-between",border:`1px solid ${sel?accent:border}`}}>
                <div>
                  <div style={{fontSize:10,color:sel?accent:textMain,fontWeight:sel?600:500}}>{n}</div>
                  <div style={{fontSize:8,color:textMuted}}>{d}</div>
                </div>
                <div style={{fontSize:10,color:accent,fontWeight:700}}>{p}</div>
              </div>
            ))}
            <button style={{width:"100%",background:accent,border:"none",borderRadius:12,padding:"11px",color:"#fff",fontSize:11,fontWeight:600,marginTop:4,cursor:"pointer"}}>Scegli data e ora →</button>
            <div style={{textAlign:"center",marginTop:10}}>
              <div style={{fontSize:8,color:textMuted}}>prenoty.com/salone/atelier-bellezza</div>
            </div>
          </div>

          {/* Label */}
          <div style={{position:"absolute",bottom:16,left:"50%",transform:"translateX(-50%)",display:"flex",gap:6,alignItems:"center"}}>
            {[0,1].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:sc===i?accent:"rgba(108,92,231,0.2)",transition:"background 0.5s"}}/>)}
          </div>
        </div>
      </div>

      </div>
  );
}

export default function Home(){
  return(
    <div style={{background:"#1a1730",minHeight:"100vh",fontFamily:"'DM Sans','Helvetica Neue',sans-serif",overflowX:"hidden"}}>
      <style>{`
        *{box-sizing:border-box;}
        @media(max-width:960px){
          .hero-inner{flex-direction:column!important;padding:48px 24px 64px!important;min-height:auto!important;align-items:center!important;text-align:center;}
          .hero-h1{font-size:46px!important;letter-spacing:-1px!important;}
          .hero-btns{justify-content:center!important;}
          .hero-cats{justify-content:center!important;}
          .feat-grid{grid-template-columns:1fr 1fr!important;}
          .steps-grid{grid-template-columns:1fr!important;gap:24px!important;}
          .nav-wrap{padding:14px 24px!important;}
          .sec-pad{padding:56px 24px!important;}
        }
        @media(max-width:600px){
          .feat-grid{grid-template-columns:1fr!important;}
          .hero-h1{font-size:44px!important;}
        }
      `}</style>

      <nav style={{borderBottom:"0.5px solid rgba(108,92,231,0.15)",position:"sticky",top:0,zIndex:100,background:"rgba(26,23,48,0.92)",backdropFilter:"blur(20px)"}}>
        <div className="nav-wrap" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 56px"}}>
          <a href="/" style={{display:"inline-block"}}><img src="/Prenoty_Bianco.png" alt="Prenoty" style={{height:22,objectFit:"contain"}}/></a>
          <div style={{display:"flex",gap:10}}>
            <a href="/login" style={{background:"transparent",border:"0.5px solid rgba(224,220,255,0.2)",color:"#9b96c8",fontSize:13,padding:"8px 18px",borderRadius:10,textDecoration:"none"}}>Accedi</a>
            <a href="/registrazione" style={{background:"#6c5ce7",color:"#fff",fontSize:13,fontWeight:600,padding:"8px 20px",borderRadius:10,textDecoration:"none"}}>Registrati</a>
          </div>
        </div>
      </nav>

      <section style={{background:"linear-gradient(135deg,#2d2060 0%,#1a1730 50%,#0f0d24 100%)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"rgba(108,92,231,0.06)",filter:"blur(80px)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>
        <div className="hero-inner" style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"80px 56px",minHeight:"90vh",gap:72,position:"relative",zIndex:1}}>
          <div style={{flex:1,maxWidth:500}}>
            <FadeIn delay={0.05}>
              <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(108,92,231,0.12)",border:"0.5px solid rgba(108,92,231,0.3)",borderRadius:8,padding:"5px 14px",marginBottom:24}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:"#5de279"}}/>
                <span style={{fontSize:11,color:"#9b96c8",letterSpacing:1,textTransform:"uppercase"}}>30 giorni gratis — nessuna carta</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="hero-h1" style={{fontSize:56,fontWeight:800,color:"#fff",lineHeight:1.05,letterSpacing:-2,marginBottom:20}}>
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
                <a href="/registrazione" style={{background:"#5de279",color:"#0a2e14",padding:"14px 32px",borderRadius:12,fontSize:15,fontWeight:700,textDecoration:"none"}}>Inizia gratis</a>
                <a href="#come-funziona" style={{background:"transparent",border:"0.5px solid rgba(224,220,255,0.2)",color:"#9b96c8",padding:"14px 24px",borderRadius:12,fontSize:15,textDecoration:"none"}}>Come funziona</a>
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
            <IPhone/>
          </FadeIn>
        </div>
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
            <FadeIn key={t} delay={i*0.07}>
              <div style={{background:"rgba(108,92,231,0.05)",border:"0.5px solid rgba(108,92,231,0.15)",borderRadius:16,padding:"28px 24px",height:"100%",boxSizing:"border-box"}}>
                <div style={{marginBottom:16}}><Ico d={d} size={22}/></div>
                <h3 style={{fontSize:15,fontWeight:600,color:"#fff",marginBottom:8}}>{t}</h3>
                <p style={{fontSize:14,color:"#9b96c8",lineHeight:1.7,margin:0}}>{s}</p>
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

      <section className="sec-pad" style={{padding:"80px 56px",textAlign:"center",background:"#13112b",borderTop:"0.5px solid rgba(108,92,231,0.12)"}}>
        <FadeIn>
          <img src="/P_prenoty_Viola.png" alt="P" style={{width:52,height:52,objectFit:"contain",display:"block",margin:"0 auto 20px"}}/>
          <h2 style={{fontSize:46,fontWeight:800,color:"#fff",letterSpacing:-2,marginBottom:12,lineHeight:1.05}}>Inizia oggi.<br/>È gratis.</h2>
          <p style={{fontSize:16,color:"#9b96c8",marginBottom:36}}>30 giorni senza limitazioni. Poi decidi tu.</p>
          <a href="/registrazione" style={{display:"inline-block",background:"#5de279",color:"#0a2e14",padding:"16px 48px",borderRadius:14,fontSize:16,fontWeight:700,textDecoration:"none"}}>Registrati gratis</a>
        </FadeIn>
      </section>

      <footer style={{background:"#0f0d24",borderTop:"0.5px solid rgba(108,92,231,0.1)"}}>
        <div className="nav-wrap" style={{padding:"24px 56px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <img src="/Prenoty_Bianco.png" alt="Prenoty" style={{height:18,objectFit:"contain",opacity:0.4}}/>
          <span style={{color:"rgba(155,150,200,0.3)",fontSize:12}}>© 2026 Prenoty — Genova, Italia</span>
        </div>
      </footer>
    </div>
  );
}
