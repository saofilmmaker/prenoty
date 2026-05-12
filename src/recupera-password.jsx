import { useState } from "react";
import { supabase } from "./supabase";

export default function RecuperaPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviato, setInviato] = useState(false);
  const [errore, setErrore] = useState("");

  const handleInvia = async () => {
    if (!email) { setErrore("Inserisci la tua email"); return; }
    setLoading(true);
    setErrore("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://prenoty.com/nuova-password",
    });
    if (error) {
      setErrore("Errore nell'invio. Controlla l'email inserita.");
    } else {
      setInviato(true);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#1a1730" }}>
      <style>{`
        .rp-input{width:100%;padding:11px 14px;border-radius:10px;border:1px solid #e0dcff;background:#fff;color:#1e1b3a;font-size:14px;margin-top:4px;box-sizing:border-box;outline:none}
        .rp-input::placeholder{color:#9b96c8}
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

          {inviato ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(93,226,121,0.12)", border: "1.5px solid rgba(93,226,121,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5de279" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#4a3cb5", marginBottom: 8 }}>Email inviata!</h2>
              <p style={{ color: "#9b96c8", fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
                Controlla la tua casella di posta.<br />
                Clicca il link per impostare una nuova password.
              </p>
              <a href="/login" style={{ display: "block", background: "#6c5ce7", color: "#fff", padding: "12px", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 14, textAlign: "center" }}>
                Torna al login
              </a>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#4a3cb5", textAlign: "center", marginBottom: 4 }}>
                Recupera password
              </h2>
              <p style={{ color: "#9b96c8", fontSize: 12, textAlign: "center", marginBottom: 28 }}>
                Ti inviamo un link per reimpostarla
              </p>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 10, color: "#9b96c8", letterSpacing: 1, textTransform: "uppercase" }}>Email</label>
                <input
                  type="email"
                  placeholder="la-tua@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrore(""); }}
                  onKeyDown={e => e.key === "Enter" && handleInvia()}
                  className="rp-input"
                />
              </div>

              {errore && (
                <div style={{ background: "rgba(231,76,60,0.08)", color: "#e74c3c", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                  {errore}
                </div>
              )}

              <button
                onClick={handleInvia}
                disabled={loading}
                style={{ width: "100%", padding: "12px", background: "#6c5ce7", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 14 }}
              >
                {loading ? "Invio in corso..." : "Invia link di recupero"}
              </button>

              <p style={{ textAlign: "center", fontSize: 12, color: "#9b96c8" }}>
                Ricordi la password?{" "}
                <a href="/login" style={{ color: "#6c5ce7", fontWeight: 600 }}>Accedi</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
