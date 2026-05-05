import { useState } from "react";
import { supabase } from "./supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setErrore("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrore("Email o password errati");
    else window.location.href = "/dashboard";
    setLoading(false);
  };

  const bullets = [
    { dot:"#5de279", testo:"Prenotazioni aggiornate in tempo reale" },
    { dot:"#6c5ce7", testo:"I clienti prenotano mentre sei al lavoro" },
    { dot:"#5de279", testo:"Zero chiamate, zero WhatsApp" },
  ];

  return (
    <div style={{ minHeight:"100vh", backgroundColor:"#1a1730" }}>
      <style>{`
        .login-wrap{display:flex;align-items:center;gap:56px;max-width:820px;width:100%}
        .login-left{flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:28px}
        .login-form{width:340px;flex-shrink:0;background:#f4f3ff;padding:40px;border-radius:20px;border:0.5px solid #e0dcff}
        .login-input{width:100%;padding:11px 14px;border-radius:10px;border:1px solid #e0dcff;background:#fff;color:#1e1b3a;font-size:14px;margin-top:4px;box-sizing:border-box;outline:none}
        .login-input::placeholder{color:#9b96c8}
        .bullets-desktop{display:flex;flex-direction:column;gap:14px;width:100%;max-width:360px}
        .bullets-mobile{display:none}
        @media(max-width:720px){
          .login-wrap{flex-direction:column;gap:20px}
          .login-left{order:1;width:100%;align-items:center;text-align:center;gap:12px}
          .login-form{order:2;width:100%;box-sizing:border-box}
          .bullets-desktop{display:none}
          .bullets-mobile{display:flex;flex-direction:column;gap:10px;width:100%;order:3}
        }
      `}</style>

      {/* LOGO — nel flusso normale, non fixed */}
      <div style={{ padding:"28px 32px" }}>
        <a href="/" style={{ display:"inline-block" }}>
          <img src="/Prenoty_Bianco.png" alt="Prenoty" style={{ height:22, objectFit:"contain" }} />
        </a>
      </div>

      {/* CONTENUTO */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"0 24px 48px" }}>
        <div className="login-wrap">

          <div className="login-left">
            <div>
              <h1 style={{ fontSize:42, fontWeight:800, color:"#fff", lineHeight:1.15, letterSpacing:-1, marginBottom:16 }}>
                Bentornato.<br/><span style={{ color:"#5de279" }}>La tua attività<br/>ti aspetta.</span>
              </h1>
              <p style={{ fontSize:17, color:"#9b96c8", lineHeight:1.75, maxWidth:360 }}>
                Accedi e gestisci tutto in tempo reale.
              </p>
            </div>
            <div className="bullets-desktop">
              {bullets.map(({ dot, testo }) => (
                <div key={testo} style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:dot, flexShrink:0 }} />
                  <span style={{ fontSize:16, color:"#9b96c8" }}>{testo}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="login-form">
            <img src="/Prenoty_Viola.png" alt="Prenoty" style={{ height:28, objectFit:"contain", display:"block", margin:"0 auto 20px" }} />
            <h2 style={{ fontSize:18, fontWeight:700, color:"#4a3cb5", textAlign:"center", marginBottom:4 }}>Accedi al tuo pannello</h2>
            <p style={{ color:"#9b96c8", fontSize:12, textAlign:"center", marginBottom:28 }}>Inserisci le tue credenziali</p>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:10, color:"#9b96c8", letterSpacing:1, textTransform:"uppercase" }}>Email</label>
              <input type="email" placeholder="la-tua@email.com" value={email}
                onChange={e => setEmail(e.target.value)}
                className="login-input" />
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:10, color:"#9b96c8", letterSpacing:1, textTransform:"uppercase" }}>Password</label>
              <input type="password" placeholder="La tua password" value={password}
                onChange={e => { setPassword(e.target.value); setErrore(""); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                className="login-input" />
            </div>
            {errore && <div style={{ background:"rgba(231,76,60,0.08)", color:"#e74c3c", padding:"10px 14px", borderRadius:8, fontSize:13, marginBottom:14 }}>{errore}</div>}
            <button onClick={handleLogin} disabled={loading}
              style={{ width:"100%", padding:"12px", background:"#6c5ce7", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:14 }}>
              {loading ? "Accesso..." : "Accedi"}
            </button>
            <p style={{ textAlign:"center", fontSize:12, color:"#9b96c8" }}>
              Non hai un account? <a href="/registrazione" style={{ color:"#6c5ce7", fontWeight:600 }}>Registrati gratis</a>
            </p>
          </div>

          <div className="bullets-mobile">
            {bullets.map(({ dot, testo }) => (
              <div key={testo} style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:dot, flexShrink:0 }} />
                <span style={{ fontSize:13, color:"#9b96c8" }}>{testo}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
