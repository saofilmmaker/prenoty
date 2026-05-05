import { useState } from "react";
import { supabase } from "./supabase";

function Ico({d}){
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
}

const benefit = [
  { ico:<><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M3 10h18M8 2v3M16 2v3"/></>, titolo:"Prenotazioni 24/7", testo:"I clienti prenotano quando vogliono, anche di notte." },
  { ico:<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>, titolo:"Il tuo link unico", testo:"Condividi una pagina personalizzata con i tuoi clienti." },
  { ico:<><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>, titolo:"Dashboard in tempo reale", testo:"Gestisci tutto da un unico pannello, ovunque tu sia." },
  { ico:<><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></>, titolo:"30 giorni gratis", testo:"Nessuna carta richiesta. Provi senza impegno." },
];

export default function Registrazione() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");
  const [successo, setSuccesso] = useState(false);

  const handleRegistrazione = async () => {
    if (!email || !password) { setErrore("Compila tutti i campi"); return; }
    if (password.length < 8) { setErrore("Password minimo 8 caratteri"); return; }
    setLoading(true);
    setErrore("");
    // Controlla nella tabella saloni se email esiste già
    const { data: esistente } = await supabase.from("saloni").select("id").eq("email", email).single();
    if (esistente) { setErrore("Questa email è già registrata. Accedi invece di registrarti."); setLoading(false); return; }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setErrore(error.message.includes('already') ? 'Questa email è già registrata. Accedi invece di registrarti.' : error.message); setLoading(false); return; }
    if (!data.user) { setErrore('Questa email è già registrata. Accedi invece di registrarti.'); setLoading(false); return; }
    const slug = "salone-" + data.user.id.slice(0, 8);
    await supabase.from("saloni").insert({ user_id: data.user.id, nome: "Il mio salone", slug, email });
    setSuccesso(true);
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", backgroundColor:"#1a1730" }}>
      <style>{`
        .reg-wrap{display:flex;align-items:center;gap:56px;max-width:820px;width:100%}
        .reg-benefit{flex:1;display:flex;flex-direction:column;gap:28px}
        .reg-form{width:340px;flex-shrink:0;background:#f4f3ff;padding:40px;border-radius:20px;border:0.5px solid #e0dcff}
        .reg-input{width:100%;padding:11px 14px;border-radius:10px;border:1px solid #e0dcff;background:#fff;color:#1e1b3a;font-size:14px;margin-top:4px;box-sizing:border-box;outline:none}
        .reg-input::placeholder{color:#9b96c8}
        @media(max-width:720px){
          .reg-wrap{flex-direction:column;gap:20px}
          .reg-benefit{order:2;width:100%}
          .reg-form{order:1;width:100%;box-sizing:border-box}
        }
      `}</style>

      {/* LOGO */}
      <div style={{ padding:"28px 32px" }}>
        <a href="/" style={{ display:"inline-block" }}>
          <img src="/Prenoty_Bianco.png" alt="Prenoty" style={{ height:22, objectFit:"contain" }} />
        </a>
      </div>

      {/* CONTENUTO */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"0 24px 48px" }}>
        <div className="reg-wrap">

          <div className="reg-benefit">
            {benefit.map(({ ico, titolo, testo }) => (
              <div key={titolo} style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:"rgba(108,92,231,0.12)", border:"0.5px solid rgba(108,92,231,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Ico d={ico} />
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:"#e0dcff", marginBottom:3 }}>{titolo}</div>
                  <div style={{ fontSize:13, color:"#9b96c8", lineHeight:1.6 }}>{testo}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="reg-form">
            <img src="/Prenoty_Viola.png" alt="Prenoty" style={{ height:28, objectFit:"contain", display:"block", margin:"0 auto 20px" }} />
            <h2 style={{ fontSize:18, fontWeight:700, color:"#4a3cb5", textAlign:"center", marginBottom:4 }}>Crea il tuo account</h2>
            <p style={{ color:"#9b96c8", fontSize:12, textAlign:"center", marginBottom:28 }}>30 giorni gratis — nessuna carta richiesta</p>

            {successo ? (
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:36, marginBottom:12 }}>🎉</div>
                <h3 style={{ color:"#4a3cb5", fontWeight:700, marginBottom:8 }}>Benvenuto!</h3>
                <p style={{ color:"#9b96c8", fontSize:13, marginBottom:20 }}>Account creato. Accedi per personalizzare il tuo salone.</p>
                <a href="/login" style={{ display:"block", background:"#6c5ce7", color:"#fff", padding:"12px", borderRadius:10, textDecoration:"none", fontWeight:600, fontSize:14 }}>Vai alla dashboard →</a>
              </div>
            ) : (
              <>
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:10, color:"#9b96c8", letterSpacing:1, textTransform:"uppercase" }}>Email</label>
                  <input type="email" placeholder="la-tua@email.com" value={email} onChange={e => setEmail(e.target.value)} className="reg-input" />
                </div>
                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:10, color:"#9b96c8", letterSpacing:1, textTransform:"uppercase" }}>Password</label>
                  <input type="password" placeholder="Minimo 8 caratteri" value={password}
                    onChange={e => { setPassword(e.target.value); setErrore(""); }}
                    onKeyDown={e => e.key === "Enter" && handleRegistrazione()}
                    className="reg-input" />
                </div>
                {errore && <div style={{ background:"rgba(231,76,60,0.08)", color:"#e74c3c", padding:"10px 14px", borderRadius:8, fontSize:13, marginBottom:14 }}>{errore}</div>}
                <button onClick={handleRegistrazione} disabled={loading}
                  style={{ width:"100%", padding:"12px", background:"#6c5ce7", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:14 }}>
                  {loading ? "Creazione account..." : "Registrati gratis"}
                </button>
                <p style={{ textAlign:"center", fontSize:12, color:"#9b96c8" }}>
                  Hai già un account? <a href="/login" style={{ color:"#6c5ce7", fontWeight:600 }}>Accedi</a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
