import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function NuovaPassword() {
  const [password, setPassword] = useState("");
  const [conferma, setConferma] = useState("");
  const [loading, setLoading] = useState(false);
  const [salvato, setSalvato] = useState(false);
  const [errore, setErrore] = useState("");
  const [linkScaduto, setLinkScaduto] = useState(false);

  useEffect(() => {
    // Controlla se l'URL contiene un errore (link scaduto o già usato)
    const hash = window.location.hash;
    if (hash.includes("error=access_denied") || hash.includes("otp_expired") || hash.includes("error_code=otp")) {
      setLinkScaduto(true);
      return;
    }
    // Supabase gestisce automaticamente il token dall'URL
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // sessione pronta
      }
    });
  }, []);

  const handleSalva = async () => {
    if (!password || !conferma) { setErrore("Compila entrambi i campi"); return; }
    if (password.length < 8) { setErrore("La password deve essere di almeno 8 caratteri"); return; }
    if (password !== conferma) { setErrore("Le password non coincidono"); return; }

    setLoading(true);
    setErrore("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrore("Errore nel salvataggio. Riprova o richiedi un nuovo link.");
    } else {
      setSalvato(true);
      setTimeout(() => { window.location.href = "/dashboard"; }, 2500);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#1a1730" }}>
      <style>{`
        .np-input{width:100%;padding:11px 14px;border-radius:10px;border:1px solid #e0dcff;background:#fff;color:#1e1b3a;font-size:14px;margin-top:4px;box-sizing:border-box;outline:none}
        .np-input::placeholder{color:#9b96c8}
      `}</style>

      {/* LOGO */}
      <div style={{ padding: "28px 32px" }}>
        <a href="/" style={{ display: "inline-block" }}>
          <img src="/Prenoty_Bianco.png" alt="Prenoty" style={{ height: 22, objectFit: "contain" }} />
        </a>
      </div>

      {/* CONTENUTO */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px 48px", minHeight: "calc(100vh - 78px)" }}>
        <div style={{ width: 340, background: "#f4f3ff", padding: 40, borderRadius: 20, border: "0.5px solid #e0dcff" }}>
          <img src="/Prenoty_Viola.png" alt="Prenoty" style={{ height: 28, objectFit: "contain", display: "block", margin: "0 auto 20px" }} />

          {linkScaduto ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(231,76,60,0.08)", border: "1.5px solid rgba(231,76,60,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e74c3c", marginBottom: 8 }}>Link scaduto</h2>
              <p style={{ color: "#9b96c8", fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
                Il link per reimpostare la password è scaduto o già usato.<br />Richiedine uno nuovo.
              </p>
              <a href="/recupera-password" style={{ display: "block", background: "#6c5ce7", color: "#fff", padding: "12px", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 14, textAlign: "center" }}>
                Richiedi nuovo link
              </a>
            </div>
          ) : salvato ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(93,226,121,0.12)", border: "1.5px solid rgba(93,226,121,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5de279" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </div>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#4a3cb5", marginBottom: 8 }}>Password salvata!</h2>
              <p style={{ color: "#9b96c8", fontSize: 13, lineHeight: 1.6 }}>
                Accesso alla dashboard in corso...
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#4a3cb5", textAlign: "center", marginBottom: 4 }}>
                Nuova password
              </h2>
              <p style={{ color: "#9b96c8", fontSize: 12, textAlign: "center", marginBottom: 28 }}>
                Scegli una password sicura di almeno 8 caratteri
              </p>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, color: "#9b96c8", letterSpacing: 1, textTransform: "uppercase" }}>Nuova password</label>
                <input
                  type="password"
                  placeholder="Minimo 8 caratteri"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrore(""); }}
                  className="np-input"
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 10, color: "#9b96c8", letterSpacing: 1, textTransform: "uppercase" }}>Conferma password</label>
                <input
                  type="password"
                  placeholder="Ripeti la password"
                  value={conferma}
                  onChange={e => { setConferma(e.target.value); setErrore(""); }}
                  onKeyDown={e => e.key === "Enter" && handleSalva()}
                  className="np-input"
                />
              </div>

              {errore && (
                <div style={{ background: "rgba(231,76,60,0.08)", color: "#e74c3c", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                  {errore}
                </div>
              )}

              <button
                onClick={handleSalva}
                disabled={loading}
                style={{ width: "100%", padding: "12px", background: "#6c5ce7", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 14 }}
              >
                {loading ? "Salvataggio..." : "Salva nuova password"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
