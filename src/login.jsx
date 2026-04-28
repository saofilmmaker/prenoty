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
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f4f3ff" }}>
      <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "16px", width: "360px", boxShadow: "0 4px 24px rgba(108,92,231,0.15)" }}>
        <h1 style={{ fontFamily: "Georgia, serif", color: "#6c5ce7", marginBottom: "8px" }}>Prenoty</h1>
        <p style={{ color: "#9b96c8", marginBottom: "32px" }}>Accedi al tuo pannello</p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e0dcff", marginBottom: "12px", fontSize: "14px", boxSizing: "border-box" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e0dcff", marginBottom: "16px", fontSize: "14px", boxSizing: "border-box" }}
        />
        {errore && <p style={{ color: "red", fontSize: "13px", marginBottom: "12px" }}>{errore}</p>}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: "100%", padding: "12px", backgroundColor: "#6c5ce7", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", cursor: "pointer" }}
        >
          {loading ? "Accesso..." : "Accedi"}
        </button>
      </div>
    </div>
  );
}
