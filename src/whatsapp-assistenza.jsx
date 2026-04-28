import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export default function WhatsAppAssistenza({ tema = "chiaro", numero = "393331234567", pubblico = false }) {
  const [aperto, setAperto] = useState(false);
  const T = tema === "chiaro" ? {
    card: "#ffffff", border: "#e0dcff",
    text: "#1e1b3a", textSoft: "#4a4580", accent: "#6c5ce7",
  } : {
    card: "#1c1a35", border: "#2e2a52",
    text: "#f0eeff", textSoft: "#a29bfe", accent: "#a29bfe",
  };
  const verdeWA = "#25D366";
  const messaggi = pubblico
    ? [
        { titolo: "Voglio prenotare", testo: "Ciao, vorrei prenotare un appuntamento." },
        { titolo: "Modifica appuntamento", testo: "Ciao, vorrei modificare un appuntamento già prenotato." },
        { titolo: "Informazioni", testo: "Ciao, vorrei avere informazioni su un servizio." },
      ]
    : [
        { titolo: "Ho un problema tecnico", testo: "Ciao, ho un problema con la dashboard e ho bisogno di aiuto." },
        { titolo: "Domanda sull'abbonamento", testo: "Ciao, ho una domanda sul mio abbonamento." },
        { titolo: "Suggerimento o richiesta", testo: "Ciao, ho un suggerimento per migliorare l'app." },
      ];
  const apriChat = (testo) => {
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(testo)}`, "_blank");
    setAperto(false);
  };
  return (
    <>
      {aperto && (
        <div style={{ position: "fixed", bottom: 90, right: 20, width: 300, background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", zIndex: 9999, fontFamily: "Georgia, 'Times New Roman', serif", overflow: "hidden" }}>
          <div style={{ background: verdeWA, color: "#fff", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Assistenza</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Risposta entro 1 ora</div>
            </div>
            <button onClick={() => setAperto(false)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", padding: 4, display: "flex" }}><X size={18} /></button>
          </div>
          <div style={{ padding: 12 }}>
            <p style={{ fontSize: 12, color: T.textSoft, margin: "4px 8px 12px", fontStyle: "italic" }}>Tocca un argomento per scriverci subito:</p>
            {messaggi.map((m, i) => (
              <button key={i} onClick={() => apriChat(m.testo)} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 14px", marginBottom: 6, background: "transparent", border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, fontFamily: "inherit", fontSize: 14, cursor: "pointer" }}>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>{m.titolo}</div>
                <div style={{ fontSize: 12, color: T.textSoft }}>{m.testo}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      <button onClick={() => setAperto(!aperto)} style={{ position: "fixed", bottom: 20, right: 20, width: 56, height: 56, borderRadius: "50%", background: verdeWA, color: "#fff", border: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 4px 16px rgba(37,211,102,0.4)", zIndex: 9998 }} title="Assistenza WhatsApp">
        {aperto ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  );
}
