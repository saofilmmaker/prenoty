import { useState, useEffect } from "react";
import { supabaseAdmin as supabase } from "./supabase";

export default function AdminGuard({ children }) {
  const [stato, setStato] = useState("caricamento"); // caricamento | login | ok | negato
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setStato("login"); return; }
      const { data } = await supabase.from("admins").select("id").eq("id", session.user.id).maybeSingle();
      setStato(data ? "ok" : "negato");
    });
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setErrore("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setErrore("Email o password errati"); setLoading(false); return; }
    const { data: adminData } = await supabase.from("admins").select("id").eq("id", data.user.id).maybeSingle();
    if (adminData) setStato("ok");
    else { setErrore("Account non autorizzato come admin"); await supabase.auth.signOut(); }
    setLoading(false);
  };

  if (stato === "caricamento") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1730" }}>
      <div style={{ color: "#9b96c8", fontSize: 14 }}>Verifica in corso...</div>
    </div>
  );

  if (stato === "ok") return children;

  if (stato === "negato") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1730" }}>
      <div style={{ background: "#13112b", border: "0.5px solid rgba(231,76,60,0.3)", borderRadius: 16, padding: 40, width: 340, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🚫</div>
        <div style={{ color: "#e74c3c", fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Accesso negato</div>
        <div style={{ color: "#9b96c8", fontSize: 13, marginBottom: 24 }}>
          Sei loggato con un account che non è admin.<br />Fai logout e accedi con le credenziali admin.
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            setStato("login");
            setEmail("");
            setPassword("");
            setErrore("");
          }}
          style={{ width: "100%", background: "#6c5ce7", color: "#fff", border: "none", borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          Esci e accedi come admin
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1730" }}>
      <div style={{ background: "#13112b", border: "0.5px solid rgba(108,92,231,0.2)", borderRadius: 16, padding: 40, width: 340, textAlign: "center" }}>
        <img src="/P_prenoty_Viola.png" alt="P" style={{ width: 40, marginBottom: 16 }} />
        <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Area Admin</h2>
        <p style={{ color: "#9b96c8", fontSize: 13, marginBottom: 24 }}>Accesso riservato</p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(108,92,231,0.3)", background: "rgba(108,92,231,0.05)", color: "#fff", fontSize: 14, marginBottom: 10, boxSizing: "border-box", outline: "none" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => { setPassword(e.target.value); setErrore(""); }}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: errore ? "1px solid #e74c3c" : "1px solid rgba(108,92,231,0.3)", background: "rgba(108,92,231,0.05)", color: "#fff", fontSize: 14, marginBottom: 12, boxSizing: "border-box", outline: "none" }}
        />
        {errore && <p style={{ color: "#e74c3c", fontSize: 12, marginBottom: 12 }}>{errore}</p>}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: "100%", background: "#6c5ce7", color: "#fff", border: "none", borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          {loading ? "Accesso..." : "Entra"}
        </button>
      </div>
    </div>
  );
}
