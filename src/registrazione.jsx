import { useState } from "react";
import { supabase } from "./supabase";

function Ico({ d, color = "#6c5ce7" }){
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
}

// Icone stile lucide — stesse della dashboard
const ICO_SCISSORS = <><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></>;
const ICO_SPARKLES = <><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></>;
const ICO_FLOWER  = <><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3H9m7.5 0H15m-3 4.5V15"/><circle cx="12" cy="12" r="3"/><path d="m8 16 1.5-1.5"/><path d="M14.5 9.5 16 8"/><path d="m8 8 1.5 1.5"/><path d="M14.5 14.5 16 16"/></>;
const ICO_USERS   = <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>;

const benefit = [
  { ico:<><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M3 10h18M8 2v3M16 2v3"/></>, titolo:"Prenotazioni 24/7", testo:"I clienti prenotano quando vogliono, anche di notte." },
  { ico:<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>, titolo:"Il tuo link unico", testo:"Condividi una pagina personalizzata con i tuoi clienti." },
  { ico:<><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>, titolo:"Dashboard in tempo reale", testo:"Gestisci tutto da un unico pannello, ovunque tu sia." },
  { ico:<><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></>, titolo:"30 giorni gratis", testo:"Nessuna carta richiesta. Provi senza impegno." },
];

const TIPI_ATTIVITA = [
  { key: "parrucchiere", label: "Parrucchiere", ico: ICO_SCISSORS },
  { key: "estetista",    label: "Estetista",    ico: ICO_SPARKLES },
  { key: "spa",          label: "SPA",           ico: ICO_FLOWER   },
  { key: "generico",     label: "Altro",         ico: ICO_USERS    },
];

export default function Registrazione() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tipoAttivita, setTipoAttivita] = useState("parrucchiere");
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
    const nomeDefault = tipoAttivita === "generico" ? "La mia attività" : "Il mio salone";
    await supabase.from("saloni").insert({ user_id: data.user.id, nome: nomeDefault, slug, email, tipo: tipoAttivita });

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
                <div style={{ marginBottom:16, display:"flex", justifyContent:"center" }}>
                  <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(93,226,121,0.12)", border:"1.5px solid rgba(93,226,121,0.35)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5de279" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                      <path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>
                    </svg>
                  </div>
                </div>
                <h3 style={{ color:"#4a3cb5", fontWeight:700, marginBottom:8 }}>Benvenuto!</h3>
                <p style={{ color:"#9b96c8", fontSize:13, marginBottom:20 }}>Account creato. Accedi per personalizzare {tipoAttivita === "generico" ? "la tua attività" : "il tuo salone"}.</p>
                <a href="/login" style={{ display:"block", background:"#6c5ce7", color:"#fff", padding:"12px", borderRadius:10, textDecoration:"none", fontWeight:600, fontSize:14 }}>Vai alla dashboard →</a>
              </div>
            ) : (
              <>
                {/* Tipo attività */}
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:10, color:"#9b96c8", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:8 }}>Tipo di attività</label>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                    {TIPI_ATTIVITA.map(({ key, label, ico }) => {
                      const attivo = tipoAttivita === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setTipoAttivita(key)}
                          style={{
                            display:"flex", alignItems:"center", gap:7,
                            padding:"9px 12px",
                            borderRadius:8,
                            border: attivo ? "2px solid #6c5ce7" : "1px solid #e0dcff",
                            background: attivo ? "rgba(108,92,231,0.08)" : "#fff",
                            color: attivo ? "#4a3cb5" : "#9b96c8",
                            fontWeight: attivo ? 700 : 500,
                            fontSize:13,
                            cursor:"pointer",
                            transition:"all 0.15s",
                          }}
                        >
                          <Ico d={ico} color={attivo ? "#4a3cb5" : "#9b96c8"} />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

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
