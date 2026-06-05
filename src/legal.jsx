import React from "react";
import { useNavigate } from "react-router-dom";

function LegalPage({ title, lastUpdate }) {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: "#f4f3ff", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: "#f4f3ff", borderBottom: "1px solid rgba(108,92,231,0.1)", padding: "16px 56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ display: "flex", alignItems: "center" }}>
          <img src="/Prenoty_Viola.png" alt="Prenoty" style={{ height: 20, objectFit: "contain" }} />
        </a>
        <button
          onClick={() => navigate(-1)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1.5px solid rgba(108,92,231,0.25)", borderRadius: 50, padding: "8px 18px", fontSize: 13, fontWeight: 600, color: "#6c5ce7", cursor: "pointer" }}
        >
          ← Torna indietro
        </button>
      </nav>

      {/* Contenuto */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 32px 80px" }}>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "#6c5ce7", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>Prenoty · Legale</p>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: "#1e1b3a", letterSpacing: -1, marginBottom: 8, lineHeight: 1.15 }}>{title}</h1>
        {lastUpdate && (
          <p style={{ fontSize: 13, color: "#9b96c8", marginBottom: 48 }}>Ultimo aggiornamento: {lastUpdate}</p>
        )}

        {/* Placeholder */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e0dcff", padding: "48px 40px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(108,92,231,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14 2z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <line x1="10" y1="9" x2="8" y2="9"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e1b3a", marginBottom: 10 }}>Pagina in preparazione</h2>
          <p style={{ fontSize: 14, color: "#7a748a", lineHeight: 1.7, maxWidth: 420, margin: "0 auto 28px" }}>
            Stiamo finalizzando il documento. Sarà disponibile a breve.<br />
            Per informazioni urgenti scrivi a{" "}
            <a href="mailto:prenoty.official@gmail.com" style={{ color: "#6c5ce7", fontWeight: 600, textDecoration: "none" }}>
              prenoty.official@gmail.com
            </a>
          </p>
          <a href="/" style={{ display: "inline-block", background: "#6c5ce7", color: "#fff", borderRadius: 50, padding: "12px 28px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
            Torna alla home
          </a>
        </div>
      </div>

      {/* Footer mini */}
      <div style={{ borderTop: "1px solid rgba(108,92,231,0.12)", padding: "20px 56px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f4f3ff" }}>
        <span style={{ fontSize: 12, color: "#9b96c8" }}>© 2026 Prenoty — P.IVA 02957190990</span>
        <span style={{ fontSize: 12, color: "#9b96c8" }}>Via Teresio Mario Canepari, 14 — Genova</span>
      </div>
    </div>
  );
}

export function PrivacyPolicy() {
  return <LegalPage title="Privacy Policy" lastUpdate="Maggio 2026" />;
}

export function TerminiServizio() {
  const navigate = useNavigate();
  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.iubenda.com/iubenda.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f4f3ff", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: "#f4f3ff", borderBottom: "1px solid rgba(108,92,231,0.1)", padding: "16px 56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ display: "flex", alignItems: "center" }}>
          <img src="/Prenoty_Viola.png" alt="Prenoty" style={{ height: 20, objectFit: "contain" }} />
        </a>
        <button
          onClick={() => navigate(-1)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1.5px solid rgba(108,92,231,0.25)", borderRadius: 50, padding: "8px 18px", fontSize: 13, fontWeight: 600, color: "#6c5ce7", cursor: "pointer" }}
        >
          ← Torna indietro
        </button>
      </nav>

      {/* Contenuto iubenda */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 32px 80px" }}>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "#6c5ce7", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>Prenoty · Legale</p>
        <a
          href="https://www.iubenda.com/termini-e-condizioni/22917278"
          className="iubenda-white iubenda-noiframe iubenda-embed"
          title="Termini e Condizioni"
          style={{ display: "block" }}
        >
          Termini e Condizioni
        </a>
      </div>

      {/* Footer mini */}
      <div style={{ borderTop: "1px solid rgba(108,92,231,0.12)", padding: "20px 56px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f4f3ff" }}>
        <span style={{ fontSize: 12, color: "#9b96c8" }}>© 2026 Prenoty — P.IVA 02957190990</span>
        <span style={{ fontSize: 12, color: "#9b96c8" }}>Via Teresio Mario Canepari, 14 — Genova</span>
      </div>
    </div>
  );
}

export function CookiePolicy() {
  return <LegalPage title="Cookie Policy" lastUpdate="Maggio 2026" />;
}
