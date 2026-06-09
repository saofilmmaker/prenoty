import { useState, useEffect } from "react";
import { Lock, Sun, Moon, LogOut, MessageSquare, CheckCircle, Calendar, Scissors } from "lucide-react";
import { supabase } from "./supabase";

export default function BloccoAbbonamento() {
  const [tema, setTema] = useState("chiaro");
  const [inCaricamento, setInCaricamento] = useState(false);
  const [saloneId, setSaloneId] = useState(null);
  const [nomeS, setNomeS] = useState("il tuo salone");
  const [logoS, setLogoS] = useState(null);
  const [emailS, setEmailS] = useState("");

  const T = tema === "chiaro" ? {
    bg: "#f4f3ff", card: "#ffffff", border: "#e0dcff",
    text: "#1e1b3a", textSoft: "#4a4580", textMuted: "#9b96c8",
    accent: "#6c5ce7", accentSoft: "#ede9ff",
    green: "#00b894", greenSoft: "#e6faf6",
  } : {
    bg: "#12102a", card: "#1c1a35", border: "#2e2a52",
    text: "#f0eeff", textSoft: "#a29bfe", textMuted: "#6c6a9e",
    accent: "#a29bfe", accentSoft: "#2a2550",
    green: "#00cec9", greenSoft: "#0d2e2c",
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data?.session?.user?.id;
      if (!uid) return;
      const { data: s } = await supabase.from("saloni").select("id,nome,logo,email").eq("user_id", uid).maybeSingle();
      if (s) { setSaloneId(s.id); setNomeS(s.nome); setLogoS(s.logo); setEmailS(s.email || ""); }
    });
  }, []);

  const acquista = async () => {
    if (!saloneId) return;
    setInCaricamento(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saloneId, email: emailS, nomeNegozio: nomeS }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Errore nel pagamento. Riprova o contattaci.");
    } finally {
      setInCaricamento(false);
    }
  };

  const contattaAssistenza = () => {
    const testo = encodeURIComponent(`Ciao, sono ${nomeS} e ho bisogno di assistenza su Prenoty.`);
    window.open(`https://wa.me/393489259863?text=${testo}`, "_blank");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      color: T.text,
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* HEADER */}
      <header style={{
        padding: "20px 24px",
        borderBottom: `1px solid ${T.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: T.card,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {logoS ? (
            <img src={logoS} alt="Logo" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 12, flexShrink: 0 }} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${T.accent}, ${T.accent}99)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Scissors size={20} color="#fff" />
            </div>
          )}
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: 0.5 }}>{nomeS}</div>
            <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: 1 }}>POWERED BY PRENOTY</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setTema(t => t === "chiaro" ? "scuro" : "chiaro")} style={iconBtn(T)}>
            {tema === "chiaro" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={logout} style={iconBtn(T)} title="Esci">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* CORPO */}
      <main style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 24px" }}>
        <div style={{
          maxWidth: 480,
          width: "100%",
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: 20,
          padding: "48px 36px",
          textAlign: "center",
          boxShadow: tema === "chiaro" ? "0 4px 32px rgba(108,92,231,0.08)" : "0 4px 32px rgba(0,0,0,0.3)",
        }}>
          {/* Icona */}
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: T.accentSoft,
            display: "flex", justifyContent: "center", alignItems: "center",
            margin: "0 auto 24px",
          }}>
            <Lock size={32} color={T.accent} />
          </div>

          {/* Titolo */}
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 12px", letterSpacing: 0.2 }}>
            Il tuo periodo di prova è finito
          </h1>
          <p style={{ fontSize: 15, color: T.textSoft, margin: "0 0 32px", lineHeight: 1.6 }}>
            Acquista Prenoty per continuare a gestire il tuo salone senza interruzioni.
          </p>

          {/* Box prezzo */}
          <div style={{
            background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
            borderRadius: 16,
            padding: "24px 20px",
            marginBottom: 24,
            textAlign: "left",
            color: "#fff",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, opacity: 0.8, marginBottom: 12 }}>
              ✦ PIANO PRENOTY — ACCESSO COMPLETO
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 48, fontWeight: 800, lineHeight: 1 }}>€299</span>
              <span style={{ fontSize: 14, opacity: 0.85 }}>pagamento unico</span>
            </div>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 16 }}>
              Prezzo di lancio · riservato ai primi 100 professionisti
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Prenotazioni illimitate",
                "Link personalizzato",
                "Notifiche in tempo reale",
                "Report mensili",
                "Supporto prioritario ✦",
              ].map((v, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                  <CheckCircle size={15} color="#a8f5c8" style={{ flexShrink: 0 }} />
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottone acquista */}
          <button
            onClick={acquista}
            disabled={inCaricamento}
            style={{
              width: "100%",
              padding: "17px",
              fontSize: 16,
              fontFamily: "inherit",
              fontWeight: 700,
              background: inCaricamento ? "#ccc" : "linear-gradient(135deg, #00b894, #00cec9)",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              cursor: inCaricamento ? "wait" : "pointer",
              letterSpacing: 0.3,
              transition: "opacity 0.2s",
            }}
          >
            {inCaricamento ? "Attendere..." : "Acquista ora — €299"}
          </button>

          <button
            onClick={contattaAssistenza}
            style={{
              width: "100%",
              padding: "14px",
              marginTop: 12,
              fontSize: 14,
              fontFamily: "inherit",
              background: "transparent",
              color: T.textSoft,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
            }}
          >
            <MessageSquare size={16} />
            Ho bisogno di aiuto
          </button>

          <p style={{ marginTop: 24, fontSize: 12, color: T.textMuted, lineHeight: 1.6 }}>
            I tuoi dati (clienti, agenda, servizi) sono conservati in sicurezza.<br />
            Li ritrovi intatti appena attivi l'accesso.
          </p>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{
        padding: "16px 24px",
        borderTop: `1px solid ${T.border}`,
        background: T.card,
        textAlign: "center",
        fontSize: 12,
        color: T.textMuted,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
      }}>
        <Calendar size={14} />
        <span>La pagina di prenotazione pubblica è temporaneamente disattivata</span>
      </footer>
    </div>
  );
}

const iconBtn = (T) => ({
  width: 36, height: 36,
  display: "flex", justifyContent: "center", alignItems: "center",
  background: "transparent",
  color: T.text,
  border: `1px solid ${T.border}`,
  borderRadius: 10,
  cursor: "pointer",
});
