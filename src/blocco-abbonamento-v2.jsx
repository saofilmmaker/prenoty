import { useState } from "react";
import { Lock, CreditCard, Sun, Moon, LogOut, MessageSquare, CheckCircle, AlertCircle, Calendar, Scissors } from "lucide-react";

export default function BloccoAbbonamento() {
  // TEMA — stessa palette degli altri file
  const [tema, setTema] = useState("chiaro");
  const T = tema === "chiaro" ? {
    bg: "#f4f3ff", card: "#ffffff", border: "#e0dcff", borderStrong: "#c4bdf8",
    text: "#1e1b3a", textSoft: "#4a4580", textMuted: "#9b96c8",
    accent: "#6c5ce7", accentSoft: "#ede9ff",
    dark: "#1e1b3a", hover: "#f0edff", danger: "#c0392b", dangerSoft: "#fdecea",
  } : {
    bg: "#12102a", card: "#1c1a35", border: "#2e2a52", borderStrong: "#3f3a6e",
    text: "#f0eeff", textSoft: "#a29bfe", textMuted: "#6c6a9e",
    accent: "#a29bfe", accentSoft: "#2a2550",
    dark: "#f0eeff", hover: "#252248", danger: "#e74c3c", dangerSoft: "#3a1a1a",
  };

  // STATO ABBONAMENTO (in produzione verrà letto da Supabase/Stripe)
  // "trial_scaduto"   → 30 giorni gratis finiti e pagamento non andato a buon fine
  // "pagamento_fallito" → abbonamento attivo ma ultimo rinnovo fallito (carta scaduta ecc.)
  // "annullato"       → il parrucchiere ha disdetto volontariamente
  const [motivo, setMotivo] = useState("trial_scaduto");

  // Dati del salone bloccato (da Supabase in produzione)
  const salone = {
    nome: "Atelier Bellezza",
    email: "marco@atelierbellezza.it",
    prezzoMensile: 29,
    giorniTrialUsati: 30,
    dataScadenza: "24 aprile 2026",
  };

  // Stato del bottone "Rinnova adesso" → simula il redirect a Stripe Checkout
  const [inCaricamento, setInCaricamento] = useState(false);

  const messaggi = {
    trial_scaduto: {
      titolo: "Il tuo periodo di prova è finito",
      sottotitolo: "Per continuare a usare l'app, attiva l'abbonamento.",
      icona: Lock,
    },
    pagamento_fallito: {
      titolo: "Pagamento non riuscito",
      sottotitolo: "Non siamo riusciti ad addebitare il rinnovo. Aggiorna il metodo di pagamento.",
      icona: AlertCircle,
    },
    annullato: {
      titolo: "Abbonamento annullato",
      sottotitolo: "Riattivalo quando vuoi: i tuoi dati sono al sicuro.",
      icona: Lock,
    },
  };

  const msg = messaggi[motivo];
  const Icona = msg.icona;

  // Cosa succede quando clicca "Rinnova adesso":
  // 1. Chiamata al tuo backend → crea sessione Stripe Checkout
  // 2. Redirect dell'utente su checkout.stripe.com
  // 3. Dopo il pagamento Stripe rimanda sulla dashboard, stato abbonamento aggiornato via webhook
  const rinnova = () => {
    setInCaricamento(true);
    // Simulazione: in produzione qui c'è fetch('/api/stripe/checkout') + window.location = url
    setTimeout(() => {
      alert("In produzione qui parte Stripe Checkout per il pagamento.");
      setInCaricamento(false);
    }, 800);
  };

  const logout = () => {
    alert("Logout effettuato. In produzione qui torni alla pagina di login.");
  };

  const contattaAssistenza = () => {
    // Apre WhatsApp con messaggio precompilato
    const numero = "393331234567"; // tuo numero WhatsApp business
    const testo = encodeURIComponent(`Ciao, sono ${salone.nome} e ho un problema con l'abbonamento.`);
    window.open(`https://wa.me/${numero}?text=${testo}`, "_blank");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      color: T.text,
      fontFamily: "Georgia, 'Times New Roman', serif",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* HEADER minimale — solo logo e switch tema */}
      <header style={{
        padding: "20px 24px",
        borderBottom: `1px solid ${T.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: T.card,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Scissors size={20} color={T.accent} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: 0.5 }}>
              {salone.nome}
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: 1 }}>
              POWERED BY PRENOTY
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setTema(tema === "chiaro" ? "scuro" : "chiaro")}
            style={iconBtn(T)}
            title={tema === "chiaro" ? "Passa a scuro" : "Passa a chiaro"}
          >
            {tema === "chiaro" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={logout} style={iconBtn(T)} title="Esci">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* DEMO SELECTOR — solo per vedere le 3 varianti, da rimuovere in produzione */}
      <div style={{
        padding: "12px 24px",
        background: T.accentSoft,
        borderBottom: `1px solid ${T.border}`,
        fontSize: 13,
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
      }}>
        <span style={{ color: T.textSoft, fontStyle: "italic" }}>Demo — prova i 3 stati:</span>
        {["trial_scaduto", "pagamento_fallito", "annullato"].map(m => (
          <button
            key={m}
            onClick={() => setMotivo(m)}
            style={{
              padding: "4px 10px",
              fontSize: 12,
              fontFamily: "inherit",
              border: `1px solid ${motivo === m ? T.accent : T.border}`,
              background: motivo === m ? T.accent : "transparent",
              color: motivo === m ? "#fff" : T.text,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            {m.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* CONTENUTO PRINCIPALE */}
      <main style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 24px",
      }}>
        <div style={{
          maxWidth: 560,
          width: "100%",
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          padding: "48px 40px",
          textAlign: "center",
          boxShadow: tema === "chiaro" ? "0 4px 24px rgba(0,0,0,0.04)" : "0 4px 24px rgba(0,0,0,0.3)",
        }}>
          {/* Icona tondo */}
          <div style={{
            width: 72, height: 72,
            borderRadius: "50%",
            background: motivo === "pagamento_fallito" ? T.dangerSoft : T.accentSoft,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto 24px",
          }}>
            <Icona size={32} color={motivo === "pagamento_fallito" ? T.danger : T.accent} />
          </div>

          {/* Titolo + sottotitolo */}
          <h1 style={{
            fontSize: 28,
            fontWeight: 400,
            margin: "0 0 12px",
            letterSpacing: 0.3,
          }}>
            {msg.titolo}
          </h1>
          <p style={{
            fontSize: 16,
            color: T.textSoft,
            margin: "0 0 32px",
            lineHeight: 1.6,
          }}>
            {msg.sottotitolo}
          </p>

          {/* BOX riepilogo piano */}
          <div style={{
            background: T.accentSoft,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: "20px",
            marginBottom: 28,
            textAlign: "left",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}>
              <span style={{ fontSize: 13, color: T.textSoft, textTransform: "uppercase", letterSpacing: 1 }}>
                Piano Salone
              </span>
              <span style={{
                fontSize: 22,
                fontWeight: 600,
                color: T.accent,
              }}>
                {salone.prezzoMensile}€<span style={{ fontSize: 13, color: T.textSoft, fontWeight: 400 }}>/mese</span>
              </span>
            </div>

            <div style={{ fontSize: 14, color: T.text, lineHeight: 1.8 }}>
              {[
                "Prenotazioni online 24/7",
                "Clienti e agenda illimitati",
                "Pagamenti con carta, PayPal, in salone",
                "Email automatiche di conferma e promemoria",
                "Disdici quando vuoi, senza vincoli",
              ].map((v, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle size={15} color={T.accent} style={{ flexShrink: 0 }} />
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTONI */}
          <button
            onClick={rinnova}
            disabled={inCaricamento}
            style={{
              width: "100%",
              padding: "16px",
              fontSize: 16,
              fontFamily: "inherit",
              background: T.accent,
              color: "#fff",
              border: "none",
              borderRadius: 14,
              cursor: inCaricamento ? "wait" : "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
              fontWeight: 500,
              letterSpacing: 0.3,
              opacity: inCaricamento ? 0.7 : 1,
              transition: "opacity 0.2s",
            }}
          >
            <CreditCard size={18} />
            {inCaricamento
              ? "Attendere..."
              : motivo === "pagamento_fallito"
                ? "Aggiorna metodo di pagamento"
                : `Rinnova ora — ${salone.prezzoMensile}€/mese`}
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

          {/* Info dati sicuri */}
          <p style={{
            marginTop: 28,
            fontSize: 12,
            color: T.textMuted,
            lineHeight: 1.6,
          }}>
            I tuoi dati (clienti, agenda, servizi) sono conservati in sicurezza.<br />
            Li ritrovi intatti appena riattivi l'abbonamento.
          </p>
        </div>
      </main>

      {/* FOOTER con info link pubblico disattivato */}
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

// Stile riutilizzabile per i bottoni icona in alto
const iconBtn = (T) => ({
  width: 36, height: 36,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "transparent",
  color: T.text,
  border: `1px solid ${T.border}`,
  borderRadius: 10,
  cursor: "pointer",
});
