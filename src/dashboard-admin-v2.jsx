import React from 'react';
import { useState, useEffect } from "react";
import { supabaseAdmin as supabase } from "./supabase";
import { Users, Euro, TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle, Clock, Search, Sun, Moon, Mail, Phone, Calendar, MoreVertical, Download, ArrowUpRight, ArrowDownRight, Shield, Bell, Star, MessageSquare, X, Trash2, LogOut } from "lucide-react";

// =============================================================
// DASHBOARD ADMIN — solo per il proprietario del SaaS (tu)
// URL previsto: prenoty.com/admin (protetto da login con email autorizzata)
// =============================================================


function CambioPasswordAdmin({ T }) {
  const [nuova, setNuova] = React.useState("");
  const [conferma, setConferma] = React.useState("");
  const [msg, setMsg] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleCambio = async () => {
    if (nuova !== conferma) { setMsg({ tipo: "errore", testo: "Le password non coincidono" }); return; }
    if (nuova.length < 8) { setMsg({ tipo: "errore", testo: "Minimo 8 caratteri" }); return; }
    setLoading(true);
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient("https://lievvbydmynrdrmgxljm.supabase.co", "sb_publishable_5F_dQ3i8fsEuNmS9kXazcA_CWONTYqF");
      const { error } = await sb.auth.updateUser({ password: nuova });
      if (error) setMsg({ tipo: "errore", testo: error.message });
      else { setMsg({ tipo: "ok", testo: "Password aggiornata!" }); setNuova(""); setConferma(""); }
    } catch(e) { setMsg({ tipo: "errore", testo: "Errore imprevisto" }); }
    setLoading(false);
  };

  return (
    <div style={{ background: T?.card || "#fff", border: "1px solid " + (T?.border || "#e0dcff"), borderRadius: 12, padding: 24, marginTop: 24 }}>
      <h3 style={{ fontSize: 12, letterSpacing: 2, color: T?.textMuted || "#9b96c8", marginBottom: 4 }}>SICUREZZA</h3>
      <p style={{ fontSize: 12, color: T?.textMuted || "#9b96c8", marginBottom: 16 }}>Cambia la password dell'account admin</p>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, color: T?.textMuted || "#9b96c8", letterSpacing: 1 }}>NUOVA PASSWORD</label>
        <input type="password" value={nuova} onChange={e => setNuova(e.target.value)} placeholder="Minimo 8 caratteri" style={{ width: "100%", marginTop: 4, padding: "10px 12px", border: "1px solid " + (T?.border || "#e0dcff"), borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: T?.bg || "#f4f3ff", color: T?.text || "#1e1b3a" }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, color: T?.textMuted || "#9b96c8", letterSpacing: 1 }}>CONFERMA PASSWORD</label>
        <input type="password" value={conferma} onChange={e => setConferma(e.target.value)} placeholder="Ripeti la nuova password" style={{ width: "100%", marginTop: 4, padding: "10px 12px", border: "1px solid " + (T?.border || "#e0dcff"), borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: T?.bg || "#f4f3ff", color: T?.text || "#1e1b3a" }} />
      </div>
      {msg && <div style={{ padding: "10px 12px", borderRadius: 8, marginBottom: 12, fontSize: 13, background: msg.tipo === "ok" ? "rgba(93,226,121,0.1)" : "rgba(231,76,60,0.1)", color: msg.tipo === "ok" ? "#27ae60" : "#e74c3c" }}>{msg.testo}</div>}
      <button onClick={handleCambio} disabled={loading} style={{ width: "100%", padding: "11px", background: "#6c5ce7", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
        {loading ? "Aggiornamento..." : "Aggiorna password"}
      </button>
    </div>
  );
}

export default function DashboardAdmin() {
  const [tema, setTema] = useState(() => localStorage.getItem("prenoty-tema") || "chiaro");
  useEffect(() => { localStorage.setItem("prenoty-tema", tema); }, [tema]);
  const T = tema === "chiaro" ? {
    bg: "#f4f3ff", card: "#ffffff", border: "#e0dcff", borderStrong: "#c4bdf8",
    text: "#1e1b3a", textSoft: "#4a4580", textMuted: "#9b96c8",
    accent: "#6c5ce7", accentSoft: "#ede9ff",
    success: "#00b894", successSoft: "#e6faf6",
    danger: "#c0392b", dangerSoft: "#fdecea",
    warning: "#e17055", warningSoft: "#fff0ec",
    hover: "#f0edff",
  } : {
    bg: "#12102a", card: "#1c1a35", border: "#2e2a52", borderStrong: "#3f3a6e",
    text: "#f0eeff", textSoft: "#a29bfe", textMuted: "#6c6a9e",
    accent: "#a29bfe", accentSoft: "#2a2550",
    success: "#00cec9", successSoft: "#0a2020",
    danger: "#e74c3c", dangerSoft: "#3a1a1a",
    warning: "#fdcb6e", warningSoft: "#2a2010",
    hover: "#252248",
  };

  const [sezione, setSezione] = useState("panoramica");
  const [filtro, setFiltro] = useState("");
  const [filtroStato, setFiltroStato] = useState("tutti");

  const [saloni, setSaloni] = useState([]);
  const [recensioniSegnalate, setRecensioniSegnalate] = useState([]);

  useEffect(() => {
    const carica = async () => {
      const { data } = await supabase
        .from("saloni")
        .select("id, nome, email, telefono, indirizzo, tipo, created_at, piano, stato_abbonamento, abbonamento_scadenza, recensioni, piano_speciale, prova_scade_il, abbonamento_attivo")
        .order("created_at", { ascending: false });
      if (data) {
        // Estrai tutte le recensioni segnalate da tutti i saloni
        const segnalate = [];
        data.forEach(s => {
          if (Array.isArray(s.recensioni)) {
            s.recensioni.filter(r => r.segnalata).forEach(r => {
              segnalate.push({
                ...r,
                saloneNome: s.nome,
                saloneId: s.id,
                clienteNome: r.nome,          // campo nome cliente dalla recensione
                segnalataIl: r.segnalataIl || r.data || "—",
                motivo: r.motivo || "Nessun motivo specificato",
              });
            });
          }
        });
        setRecensioniSegnalate(segnalate);

        // Carica conteggio prenotazioni per ogni salone
        const idSaloni = data.map(s => s.id);
        const { data: prenData } = await supabase
          .from("prenotazioni")
          .select("salone_id")
          .in("salone_id", idSaloni);

        const countPren = {};
        if (prenData) prenData.forEach(p => {
          countPren[p.salone_id] = (countPren[p.salone_id] || 0) + 1;
        });

        // Prezzi per piano (€/mese) — aggiorna quando definisci i piani Stripe
        const prezziPiano = { base: 19, pro: 29 };
        // Mappatura stato Supabase → stato UI
        const statoMap = { attivo: "pagante", trial: "trial", sospeso: "pagamento_fallito", cancellato: "annullato" };
        setSaloni(data.map(s => ({
          id: s.id,
          nome: s.nome || "—",
          email: s.email || "—",
          tel: s.telefono || "—",
          citta: s.indirizzo ? s.indirizzo.split(",").slice(-2).join(",").trim() : "—",
          tipo: s.tipo || "parrucchiere",
          iscritto: s.created_at?.slice(0, 10) || "—",
          piano: prezziPiano[s.piano] ?? 0,
          pianoNome: s.piano || "trial",
          pianoSpeciale: s.piano_speciale || null,
          stato: statoMap[s.stato_abbonamento] ?? "trial",
          ultimoPagamento: null,
          prossimoRinnovo: s.abbonamento_scadenza ? s.abbonamento_scadenza.slice(0, 10) : null,
          provaScadeIl: s.prova_scade_il ? s.prova_scade_il.slice(0, 10) : null,
          abbonamentoAttivo: s.abbonamento_attivo ?? false,
          prenotazioni: countPren[s.id] || 0,
        })));
      }
    };
    carica();
  }, []);

  // Drawer dettaglio salone
  const [saloneScelto, setSaloneScelto] = useState(null);
  const [prenDettaglio, setPrenDettaglio] = useState([]);

  useEffect(() => {
    if (!saloneScelto) { setPrenDettaglio([]); return; }
    supabase
      .from("prenotazioni")
      .select("nome_cliente, data, ora, nomi_servizi, prezzo, stato")
      .eq("salone_id", saloneScelto.id)
      .order("data", { ascending: false })
      .limit(10)
      .then(({ data }) => setPrenDettaglio(data || []));
  }, [saloneScelto]);

  // Dropdown menu azioni salone (i 3 puntini)
  const [menuSaloneAperto, setMenuSaloneAperto] = useState(null); // id del salone con menu aperto
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [modalUsoGratis, setModalUsoGratis] = useState(null); // { salone, durata }

  const azioniSalone = [
    { lbl: "Vedi dettagli", azione: (s) => setSaloneScelto(s) },
    { lbl: "Invia email al titolare", azione: (s) => window.open(`mailto:${s.email}?subject=Prenoty - Comunicazione importante`, "_blank") },
    { lbl: "Chiama titolare", azione: (s) => window.open(`tel:${s.tel}`, "_blank") },
    { lbl: "🎁 Concedi uso gratis", azione: (s) => setModalUsoGratis({ salone: s, durata: "lifetime" }), gratis: true },
    { lbl: "Sospendi account", azione: (s) => alert(`Sospensione account di ${s.nome}\n\nIn produzione: blocca login, mostra schermata "abbonamento sospeso", da Supabase aggiorni il campo stato.`), pericoloso: true },
  ];

  const concediUsoGratis = async () => {
    if (!modalUsoGratis) return;
    const { salone: s, durata } = modalUsoGratis;

    const { error } = await supabase
      .from("saloni")
      .update({ piano_speciale: durata })
      .eq("id", s.id);

    if (error) {
      alert(`Errore: ${error.message}`);
      return;
    }

    setModalUsoGratis(null);
    setMenuSaloneAperto(null);
  };

  // Modal conferma azioni moderazione (in-app, funziona ovunque)
  const [confermaAzione, setConfermaAzione] = useState(null); // { tipo: "mantieni"|"nascondi", id: number }

  // Passa l'oggetto recensione completo (con saloneId già incluso)
  const mantieniPubblicata = (r) => {
    setConfermaAzione({ tipo: "mantieni", reviewId: r.id, saloneId: r.saloneId });
  };

  const nascondiRecensione = (r) => {
    setConfermaAzione({ tipo: "nascondi", reviewId: r.id, saloneId: r.saloneId });
  };

  const eseguiAzioneRecensione = async () => {
    if (!confermaAzione) return;
    const { tipo, reviewId, saloneId } = confermaAzione;

    if (saloneId) {
      // Carica l'array recensioni attuale del salone da Supabase
      const { data: saloneData, error: fetchErr } = await supabase
        .from("saloni")
        .select("recensioni")
        .eq("id", saloneId)
        .single();

      if (fetchErr) {
        console.error("Errore fetch recensioni:", fetchErr);
      } else if (Array.isArray(saloneData?.recensioni)) {
        const nuovaLista = saloneData.recensioni.map(r => {
          if (String(r.id) !== String(reviewId)) return r;
          return tipo === "nascondi"
            ? { ...r, nascosta: true, segnalata: false, segnalataIl: null }
            : { ...r, segnalata: false, segnalataIl: null };
        });

        const { error: updateErr } = await supabase
          .from("saloni")
          .update({ recensioni: nuovaLista })
          .eq("id", saloneId);

        if (updateErr) console.error("Errore update recensioni:", updateErr);
      }
    }

    setRecensioniSegnalate(prev => prev.filter(r => String(r.id) !== String(reviewId)));
    setConfermaAzione(null);
  };

  // ============================================================
  // CALCOLI DERIVATI — le metriche chiave del business
  // ============================================================

  const paganti = saloni.filter(s => s.stato === "pagante").length;
  const inTrial = saloni.filter(s => s.stato === "trial").length;
  const problemi = saloni.filter(s => s.stato === "pagamento_fallito").length;
  const annullati = saloni.filter(s => s.stato === "annullato").length;

  // MRR = Monthly Recurring Revenue — somma dei piani attivi
  const mrr = saloni.filter(s => s.stato === "pagante").reduce((tot, s) => tot + s.piano, 0);
  // ARR = Annual Recurring Revenue
  const arr = mrr * 12;

  // Tasso di conversione trial → pagante (reale: paganti / totale)
  const tassoConversione = saloni.length > 0
    ? Math.round((paganti / saloni.length) * 100)
    : 0;
  // Churn: disponibile dopo integrazione Stripe (webhook)
  const churn = null;

  // ============================================================
  // FILTRI per la tabella saloni
  // ============================================================

  let saloniMostrati = saloni;
  if (filtro) {
    const f = filtro.toLowerCase();
    saloniMostrati = saloniMostrati.filter(s =>
      s.nome.toLowerCase().includes(f) ||
      s.email.toLowerCase().includes(f) ||
      s.citta.toLowerCase().includes(f)
    );
  }
  if (filtroStato !== "tutti") {
    saloniMostrati = saloniMostrati.filter(s => s.stato === filtroStato);
  }

  // Etichetta + colore per ogni stato
  const badgeStato = (stato) => {
    const map = {
      pagante:           { lbl: "Pagante",       bg: T.successSoft, color: T.success, icon: CheckCircle },
      trial:             { lbl: "In prova",      bg: T.accentSoft,  color: T.accent,  icon: Clock },
      pagamento_fallito: { lbl: "Pagamento KO",  bg: T.dangerSoft,  color: T.danger,  icon: AlertCircle },
      annullato:         { lbl: "Annullato",     bg: T.hover,       color: T.textMuted, icon: XCircle },
    };
    return map[stato] || map.pagante;
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      color: T.text,
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    }}>
      {/* HEADER */}
      <header style={{
        background: T.card,
        borderBottom: `1px solid ${T.border}`,
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundImage: `linear-gradient(135deg, ${T.accent}12 0%, ${T.card} 60%)`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${T.accent}, ${T.accent}bb)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: 0.3 }}></div><a href="/" style={{display:"inline-block"}}><img src={tema === "SCURO" ? "/Prenoty_Bianco.png" : "/Prenoty_Viola.png"} alt="Prenoty" style={{height:22,objectFit:"contain"}} /></a>
            <div style={{ fontSize: 11, color: T.accent, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600 }}>
              Pannello di controllo
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* CAMPANELLA NOTIFICHE (recensioni segnalate) */}
          <button
            onClick={() => setSezione("moderazione")}
            style={{
              ...iconBtn(T),
              position: "relative",
            }}
            title="Recensioni segnalate"
          >
            <Bell size={18} />
            {recensioniSegnalate.length > 0 && (
              <span style={{
                position: "absolute",
                top: -4,
                right: -4,
                background: T.danger || "#dc2626",
                color: "#fff",
                fontSize: 10,
                fontWeight: 600,
                width: 18,
                height: 18,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "system-ui, sans-serif",
              }}>
                {recensioniSegnalate.length}
              </span>
            )}
          </button>

          {/* TOGGLE TEMA — icona luna/sole */}
          <button
            onClick={() => setTema(tema === "chiaro" ? "scuro" : "chiaro")}
            title={tema === "chiaro" ? "Tema scuro" : "Tema chiaro"}
            style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: "50%", cursor: "pointer", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: T.textSoft }}
          >
            {tema === "chiaro" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            )}
          </button>

          {/* BOTTONE ESCI */}
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload();
            }}
            title="Esci dall'area admin"
            style={{
              ...iconBtn(T),
              color: T.danger,
              borderColor: T.danger + "55",
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* TABS */}
      <div style={{
        background: T.card,
        borderBottom: `1px solid ${T.border}`,
        padding: "0 24px",
        display: "flex",
        gap: 4,
        overflowX: "auto",
      }}>
        {[
          { k: "panoramica", lbl: "Panoramica" },
          { k: "saloni", lbl: `Saloni (${saloni.length})` },
          { k: "incassi", lbl: "Incassi" },
          { k: "impostazioni", label: "Impostazioni" },
    { k: "moderazione", lbl: `Moderazione${recensioniSegnalate.length > 0 ? ` (${recensioniSegnalate.length})` : ""}` },
        ].map(t => (
          <button
            key={t.k}
            onClick={() => setSezione(t.k)}
            style={{
              padding: "14px 18px",
              fontSize: 14,
              fontFamily: "inherit",
              background: "transparent",
              color: sezione === t.k ? T.text : T.textSoft,
              border: "none",
              borderBottom: `2px solid ${sezione === t.k ? T.accent : "transparent"}`,
              cursor: "pointer",
              fontWeight: sezione === t.k ? 600 : 400,
              whiteSpace: "nowrap",
            }}
          >
            {t.lbl}
          </button>
        ))}
      </div>

      <main style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>

        {/* ============================================
            PANORAMICA — vista d'insieme con metriche chiave
            ============================================ */}
        {sezione === "panoramica" && (
          <div>
            {/* Card metriche chiave */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}>
              <CardMetrica T={T} icon={Euro} label="Entrate mensili (MRR)" valore={`${mrr}€`} sub={`${arr}€/anno proiettato`} trend="+18%" trendUp />
              <CardMetrica T={T} icon={Users} label="Saloni paganti" valore={paganti} sub={`su ${saloni.length} totali`} trend="+2 questo mese" trendUp />
              <CardMetrica T={T} icon={Clock} label="In prova" valore={inTrial} sub="trial in corso" trend={paganti > 0 ? `${tassoConversione}% conv.` : undefined} />
              <CardMetrica T={T} icon={TrendingDown} label="Tasso disdetta" valore={churn !== null ? `${churn}%` : "—"} sub={churn !== null ? "ultimi 30 giorni" : "disponibile con Stripe"} />
            </div>

            {/* Avvisi importanti */}
            {(problemi > 0 || inTrial > 0) && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 13, color: T.textSoft, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 12px" }}>
                  Da gestire
                </h3>

                {problemi > 0 && (
                  <Avviso
                    T={T}
                    tipo="danger"
                    icona={AlertCircle}
                    titolo={`${problemi} salone con pagamento fallito`}
                    testo="Contatta i titolari per aggiornare il metodo di pagamento prima della disattivazione."
                    azione={() => { setSezione("saloni"); setFiltroStato("pagamento_fallito"); }}
                    azioneLbl="Vedi"
                  />
                )}

                {inTrial > 0 && (
                  <Avviso
                    T={T}
                    tipo="warning"
                    icona={Clock}
                    titolo={`${inTrial} saloni in prova gratuita`}
                    testo="Monitora la conversione: invia un'email di check-in al 20° giorno per aumentare la conversione."
                    azione={() => { setSezione("saloni"); setFiltroStato("trial"); }}
                    azioneLbl="Vedi"
                  />
                )}
              </div>
            )}

            {/* Ultimi iscritti */}
            <div style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
              overflow: "hidden",
            }}>
              <div style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${T.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <h3 style={{ fontSize: 15, margin: 0, fontWeight: 600 }}>Ultimi iscritti</h3>
                <button
                  onClick={() => setSezione("saloni")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: T.accent,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Vedi tutti →
                </button>
              </div>
              <div>
                {saloni.slice().reverse().slice(0, 4).map(s => {
                  const b = badgeStato(s.stato);
                  const Icon = b.icon;
                  return (
                    <div key={s.id} style={{
                      padding: "14px 20px",
                      borderBottom: `1px solid ${T.border}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <div>
                        <div style={{ fontSize: 15, marginBottom: 2 }}>{s.nome}</div>
                        <div style={{ fontSize: 12, color: T.textSoft }}>
                          {s.citta} · iscritto il {s.iscritto}
                        </div>
                      </div>
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 10px",
                        background: b.bg,
                        color: b.color,
                        borderRadius: 8,
                        fontSize: 12,
                      }}>
                        <Icon size={12} />
                        {b.lbl}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================
            SALONI — tabella con filtri e ricerca
            ============================================ */}
        {sezione === "saloni" && (
          <div>
            {/* Barra filtri */}
            <div style={{
              display: "flex",
              gap: 12,
              marginBottom: 16,
              flexWrap: "wrap",
            }}>
              <div style={{ position: "relative", flex: "1 1 240px" }}>
                <Search size={16} style={{ position: "absolute", left: 12, top: 11, color: T.textMuted }} />
                <input
                  type="text"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  placeholder="Cerca nome, titolare, email, città..."
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 36px",
                    fontSize: 14,
                    fontFamily: "inherit",
                    background: T.card,
                    color: T.text,
                    border: `1px solid ${T.border}`,
                    borderRadius: 10,
                    outline: "none",
                  }}
                />
              </div>

              <select
                value={filtroStato}
                onChange={(e) => setFiltroStato(e.target.value)}
                style={{
                  padding: "10px 14px",
                  fontSize: 14,
                  fontFamily: "inherit",
                  background: T.card,
                  color: T.text,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                <option value="tutti">Tutti gli stati</option>
                <option value="pagante">Solo paganti</option>
                <option value="trial">In prova</option>
                <option value="pagamento_fallito">Pagamento fallito</option>
                <option value="annullato">Annullati</option>
              </select>

              <button
                onClick={() => {
                  // Genero CSV in memoria e lo scarico (no backend, no upload)
                  const headers = ["ID", "Nome Salone", "Titolare", "Email", "Telefono", "Citta", "Iscritto", "Piano (€/mese)", "Stato", "Ultimo Pagamento", "Prossimo Rinnovo", "Prenotazioni Totali"];
                  const rows = saloniMostrati.map(s => [
                    s.id,
                    `"${s.nome}"`,
                    `"${s.titolare}"`,
                    s.email,
                    s.tel,
                    s.citta,
                    s.iscritto,
                    s.piano,
                    s.stato,
                    s.ultimoPagamento || "—",
                    s.prossimoRinnovo || "—",
                    s.prenotazioni,
                  ]);
                  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `prenoty-saloni-${new Date().toISOString().split("T")[0]}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                style={{
                  padding: "10px 14px",
                  fontSize: 13,
                  fontFamily: "inherit",
                  background: T.text,
                  color: T.bg,
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Download size={15} /> Esporta CSV
              </button>
            </div>

            {/* Tabella */}
            <div style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
              overflow: "hidden",
            }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 720 }}>
                  <thead>
                    <tr style={{ background: T.hover, fontSize: 11, color: T.textSoft, letterSpacing: 1, textTransform: "uppercase" }}>
                      <th style={th}>Salone</th>
                      <th style={th}>Stato</th>
                      <th style={th}>Piano</th>
                      <th style={th}>Iscritto</th>
                      <th style={th}>Prenotazioni</th>
                      <th style={th}>Scadenza trial</th>
                      <th style={th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {saloniMostrati.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: 40, textAlign: "center", color: T.textMuted, fontStyle: "italic" }}>
                          Nessun salone trovato con questi filtri.
                        </td>
                      </tr>
                    )}
                    {saloniMostrati.map(s => {
                      const b = badgeStato(s.stato);
                      const Icon = b.icon;
                      return (
                        <tr key={s.id} style={{ borderTop: `1px solid ${T.border}` }}>
                          <td style={td}>
                            <div style={{ fontWeight: 500 }}>{s.nome}</div>
                            <div style={{ fontSize: 12, color: T.textSoft, display: "flex", gap: 8, marginTop: 2 }}>
                              <span>{s.citta}</span>
                            </div>
                            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={11} />{s.email}</span>
                              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={11} />{s.tel}</span>
                            </div>
                          </td>
                          <td style={td}>
                            <div style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "4px 10px",
                              background: b.bg,
                              color: b.color,
                              borderRadius: 8,
                              fontSize: 12,
                              whiteSpace: "nowrap",
                            }}>
                              <Icon size={12} />
                              {b.lbl}
                            </div>
                          </td>
                          <td style={td}>
                            {s.piano === 0 ? (
                              <span style={{ color: T.textMuted, fontStyle: "italic", textTransform: "capitalize" }}>{s.pianoNome || "Trial"}</span>
                            ) : (
                              <span style={{ color: T.accent, fontWeight: 500 }}>
                                {s.piano}€/m
                                <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 4, textTransform: "capitalize" }}>({s.pianoNome})</span>
                              </span>
                            )}
                            {s.pianoSpeciale && (
                              <div style={{ marginTop: 4, display: "inline-flex", alignItems: "center", gap: 5, background: T.successSoft, color: T.success, borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: 600 }}>
                                <CheckCircle size={12} />
                                {s.pianoSpeciale === "lifetime" ? "Gratis a vita" : `Gratis ${s.pianoSpeciale}`}
                              </div>
                            )}
                          </td>
                          <td style={{ ...td, fontSize: 13, color: T.textSoft }}>{s.iscritto}</td>
                          <td style={td}>
                            <span style={{ fontWeight: 500 }}>{s.prenotazioni}</span>
                            <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 4 }}>tot.</span>
                          </td>
                          <td style={td}>
                            {s.abbonamentoAttivo ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.success, background: T.successSoft, borderRadius: 20, padding: "4px 10px" }}>
                                <CheckCircle size={12} /> Pagante
                              </span>
                            ) : s.provaScadeIl ? (() => {
                              const giorni = Math.ceil((new Date(s.provaScadeIl) - new Date()) / (1000 * 60 * 60 * 24));
                              const colore = giorni <= 0 ? T.danger : giorni <= 3 ? "#c0392b" : giorni <= 7 ? "#e67e22" : T.accent;
                              const bg = giorni <= 0 ? T.dangerSoft : giorni <= 3 ? "#fdecea" : giorni <= 7 ? "#fef3e2" : T.accentSoft;
                              const IconScad = giorni <= 0 ? AlertCircle : Clock;
                              return (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: colore, background: bg, borderRadius: 20, padding: "4px 10px" }}>
                                  <IconScad size={12} />
                                  {giorni <= 0 ? "Scaduto" : `${giorni}gg`}
                                </span>
                              );
                            })() : (
                              <span style={{ fontSize: 11, color: T.textMuted }}>—</span>
                            )}
                          </td>
                          <td style={{ ...td }}>
                            <button
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                                setMenuSaloneAperto(menuSaloneAperto === s.id ? null : s.id);
                              }}
                              style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: T.textSoft,
                                padding: 6,
                                display: "flex",
                              }}
                              title="Azioni"
                            >
                              <MoreVertical size={16} />
                            </button>
                            {menuSaloneAperto === s.id && (
                              <>
                                {/* Click fuori chiude */}
                                <div
                                  onClick={() => setMenuSaloneAperto(null)}
                                  style={{ position: "fixed", inset: 0, zIndex: 50 }}
                                />
                                <div
                                  style={{
                                    position: "fixed",
                                    right: menuPos.right,
                                    top: menuPos.top,
                                    background: T.card,
                                    border: `1px solid ${T.border}`,
                                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                                    minWidth: 200,
                                    zIndex: 51,
                                    borderRadius: 10,
                                  }}
                                >
                                  {azioniSalone.map((az, i) => (
                                    <button
                                      key={i}
                                      onClick={() => { az.azione(s); setMenuSaloneAperto(null); }}
                                      style={{
                                        display: "block",
                                        width: "100%",
                                        padding: "10px 14px",
                                        background: "transparent",
                                        border: "none",
                                        borderBottom: i < azioniSalone.length - 1 ? `1px solid ${T.border}` : "none",
                                        textAlign: "left",
                                        fontSize: 13,
                                        fontFamily: "inherit",
                                        color: az.pericoloso ? T.danger : (az.gratis ? T.accent : T.text),
                                        fontWeight: az.gratis ? 600 : 400,
                                        cursor: "pointer",
                                      }}
                                    >
                                      {az.lbl}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <p style={{ fontSize: 12, color: T.textMuted, marginTop: 12, fontStyle: "italic" }}>
              Mostrati {saloniMostrati.length} di {saloni.length} saloni totali
            </p>
          </div>
        )}

        {/* ============================================
            INCASSI — riepilogo finanziario
            ============================================ */}
        {sezione === "incassi" && (
          <div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}>
              <CardMetrica T={T} icon={Euro} label="Questo mese" valore={`${mrr}€`} sub="MRR attuale" trend="+18%" trendUp />
              <CardMetrica T={T} icon={TrendingUp} label="Anno in corso" valore={`${arr}€`} sub="ARR proiettato" />
              <CardMetrica T={T} icon={Users} label="Valore per cliente" valore={`${Math.round(mrr/Math.max(paganti,1))}€`} sub="ARPU mensile" />
              <CardMetrica T={T} icon={Calendar} label="Prossimi rinnovi" valore={paganti} sub="nei prossimi 30 gg" />
            </div>

            {/* Lista pagamenti */}
            <div style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
              overflow: "hidden",
            }}>
              <div style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${T.border}`,
              }}>
                <h3 style={{ fontSize: 15, margin: 0, fontWeight: 600 }}>Ultimi pagamenti ricevuti</h3>
                <p style={{ fontSize: 12, color: T.textSoft, margin: "4px 0 0" }}>
                  In produzione questi dati arriveranno via webhook da Stripe
                </p>
              </div>
              {saloni.filter(s => s.ultimoPagamento).map(s => (
                <div key={s.id} style={{
                  padding: "14px 20px",
                  borderBottom: `1px solid ${T.border}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 14, marginBottom: 2 }}>{s.nome}</div>
                    <div style={{ fontSize: 12, color: T.textSoft }}>
                      {s.ultimoPagamento} · prossimo rinnovo {s.prossimoRinnovo || "—"}
                    </div>
                  </div>
                  <div style={{ fontSize: 16, color: T.accent, fontWeight: 500 }}>
                    +{s.piano}€
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================
            MODERAZIONE — recensioni segnalate dai titolari
        ============================================ */}
        {sezione === "impostazioni" && (
          <div style={{ maxWidth: 480 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: sezione === "impostazioni" ? "#1e1b3a" : "#fff" }}>Impostazioni Admin</h2>
            <CambioPasswordAdmin />
          </div>
        )}
        {sezione === "moderazione" && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 400, margin: "0 0 6px" }}>Recensioni segnalate</h2>
            <p style={{ fontSize: 13, color: T.textSoft, margin: "0 0 20px" }}>
              Recensioni che i titolari ti hanno segnalato come offensive, false o spam. Decidi se mantenerle pubbliche o nasconderle.
            </p>

            {recensioniSegnalate.length === 0 ? (
              <div style={{ padding: "60px 24px", textAlign: "center", background: T.card, border: `1px solid ${T.border}` }}>
                <CheckCircle size={32} color={T.accent} style={{ margin: "0 auto 12px", display: "block" }} />
                <div style={{ fontSize: 16, marginBottom: 4 }}>Tutto in ordine!</div>
                <div style={{ fontSize: 13, color: T.textMuted }}>Nessuna recensione in attesa di moderazione.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {recensioniSegnalate.map(r => (
                  <div
                    key={r.id}
                    style={{
                      background: T.card,
                      border: `2px solid ${T.danger || "#dc2626"}`,
                      padding: 20,
                    }}
                  >
                    {/* Header con info salone */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{r.saloneNome}</div>
                        <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>
                          Segnalata il {r.segnalataIl}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} size={14} style={{ fill: n <= r.stelle ? T.accent : "transparent", color: T.accent }} />
                        ))}
                      </div>
                    </div>

                    {/* Testo recensione */}
                    <div style={{ background: T.bg, padding: 14, marginBottom: 12, border: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6 }}>
                        Da <strong style={{ color: T.text }}>{r.clienteNome}</strong> · {r.data}
                      </div>
                      <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: T.textSoft, fontStyle: "italic" }}>
                        "{r.testo}"
                      </p>
                    </div>

                    {/* Motivo segnalazione */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
                        Motivo segnalazione del titolare
                      </div>
                      <div style={{ fontSize: 13, color: T.text }}>
                        {r.motivo}
                      </div>
                    </div>

                    {/* Azioni */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        onClick={() => mantieniPubblicata(r)}
                        style={{
                          flex: 1,
                          minWidth: 140,
                          padding: 10,
                          background: "transparent",
                          border: `1px solid ${T.border}`,
                          color: T.textSoft,
                          fontFamily: "inherit",
                          fontSize: 12,
                          letterSpacing: "0.15em",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <CheckCircle size={14} /> MANTIENI PUBBLICATA
                      </button>
                      <button
                        onClick={() => nascondiRecensione(r)}
                        style={{
                          flex: 1,
                          minWidth: 140,
                          padding: 10,
                          background: T.danger || "#dc2626",
                          border: "none",
                          color: "#fff",
                          fontFamily: "inherit",
                          fontSize: 12,
                          letterSpacing: "0.15em",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <Trash2 size={14} /> NASCONDI RECENSIONE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* MODAL CONCEDI USO GRATIS */}
      {modalUsoGratis && (
        <div onClick={() => setModalUsoGratis(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "32px 28px", maxWidth: 500, width: "100%", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: T.text }}>
            <h3 style={{ fontSize: 22, fontWeight: 400, margin: "0 0 6px" }}>🎁 Concedi uso gratis</h3>
            <p style={{ fontSize: 13, color: T.textSoft, margin: "0 0 20px" }}>
              <strong style={{ color: T.text }}>{modalUsoGratis.salone.nome}</strong> userà Prenoty senza addebiti per il periodo scelto. Il titolare riceverà un'email con la buona notizia.
            </p>

            <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.15em", marginBottom: 8 }}>SCEGLI LA DURATA</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
              {[
                { k: "1mese", lbl: "1 mese", sub: "Periodo aggiuntivo" },
                { k: "3mesi", lbl: "3 mesi", sub: "Test esteso" },
                { k: "6mesi", lbl: "6 mesi", sub: "Lancio in zona" },
                { k: "lifetime", lbl: "A vita", sub: "Mai più addebiti", evidenzia: true },
              ].map(opt => (
                <button
                  key={opt.k}
                  onClick={() => setModalUsoGratis({ ...modalUsoGratis, durata: opt.k })}
                  style={{
                    padding: "12px",
                    background: modalUsoGratis.durata === opt.k ? T.accentSoft : "transparent",
                    border: `${modalUsoGratis.durata === opt.k ? "2px" : "1px"} solid ${modalUsoGratis.durata === opt.k ? T.accent : T.border}`,
                    color: T.text,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: opt.evidenzia ? 600 : 400, color: opt.evidenzia ? T.accent : T.text }}>{opt.lbl}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{opt.sub}</div>
                </button>
              ))}
            </div>

            <div style={{ padding: 12, background: T.accentSoft, border: `1px solid ${T.border}`, fontSize: 12, color: T.textSoft, lineHeight: 1.6, marginBottom: 20 }}>
              💡 <strong style={{ color: T.text }}>Quando usarlo:</strong> tester (es. amici), partnership, lanci promozionali, ringraziamenti per casi speciali.
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setModalUsoGratis(null)} style={{ flex: 1, padding: 12, background: "transparent", border: `1px solid ${T.border}`, color: T.textSoft, fontFamily: "inherit", fontSize: 13, letterSpacing: "0.15em", cursor: "pointer" }}>ANNULLA</button>
              <button onClick={concediUsoGratis} style={{ flex: 1, padding: 12, background: T.accent, border: "none", color: "#fff", fontFamily: "inherit", fontSize: 13, letterSpacing: "0.15em", cursor: "pointer" }}>CONCEDI</button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER DETTAGLIO SALONE */}
      {saloneScelto && (
        <>
          <div onClick={() => setSaloneScelto(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9998 }} />
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, width: 420, maxWidth: "100vw",
            background: T.card, borderLeft: `1px solid ${T.border}`,
            zIndex: 9999, overflowY: "auto", padding: "28px 24px",
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 600, color: T.text }}>{saloneScelto.nome}</div>
                <div style={{ fontSize: 13, color: T.textSoft, marginTop: 2, textTransform: "capitalize" }}>{saloneScelto.tipo} · {saloneScelto.citta}</div>
              </div>
              <button onClick={() => setSaloneScelto(null)} style={{ background: "none", border: "none", cursor: "pointer", color: T.textSoft, padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            {/* Piano speciale badge */}
            {saloneScelto.pianoSpeciale && (
              <div style={{ background: "#1a3a1a", color: "#4caf50", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                🎁 Piano speciale: {saloneScelto.pianoSpeciale === "lifetime" ? "Gratis a vita" : `Gratis ${saloneScelto.pianoSpeciale}`}
              </div>
            )}

            {/* Contatti */}
            <div style={{ background: T.bg, borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.1em", marginBottom: 10 }}>CONTATTI</div>
              {[
                { icon: Mail, label: saloneScelto.email },
                { icon: Phone, label: saloneScelto.tel },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.text, marginBottom: 6 }}>
                  <Icon size={13} color={T.textMuted} /> {label}
                </div>
              ))}
            </div>

            {/* Abbonamento */}
            <div style={{ background: T.bg, borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.1em", marginBottom: 10 }}>ABBONAMENTO</div>
              {[
                { lbl: "Stato", val: saloneScelto.stato },
                { lbl: "Piano", val: saloneScelto.piano === 0 ? saloneScelto.pianoNome : `${saloneScelto.piano}€/mese` },
                { lbl: "Iscritto il", val: saloneScelto.iscritto },
                { lbl: "Prossimo rinnovo", val: saloneScelto.prossimoRinnovo || "—" },
                { lbl: "Prenotazioni totali", val: saloneScelto.prenotazioni },
              ].map(({ lbl, val }) => (
                <div key={lbl} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: T.textSoft }}>{lbl}</span>
                  <span style={{ color: T.text, fontWeight: 500, textTransform: "capitalize" }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Ultime prenotazioni */}
            <div>
              <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.1em", marginBottom: 10 }}>ULTIME PRENOTAZIONI</div>
              {prenDettaglio.length === 0 ? (
                <div style={{ fontSize: 13, color: T.textMuted, fontStyle: "italic" }}>Nessuna prenotazione.</div>
              ) : prenDettaglio.map((p, i) => (
                <div key={i} style={{ borderBottom: `1px solid ${T.border}`, paddingBottom: 10, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ fontWeight: 500, color: T.text }}>{p.nome_cliente || "—"}</span>
                    <span style={{ color: T.textSoft }}>{p.data} {p.ora?.slice(0,5) || ""}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textSoft, marginTop: 2 }}>
                    <span>{p.nomi_servizi || "—"}</span>
                    <span>{p.prezzo ? `${p.prezzo}€` : ""}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* MODAL CONFERMA AZIONE MODERAZIONE */}
      {confermaAzione && (
        <div onClick={() => setConfermaAzione(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "32px 28px", maxWidth: 460, width: "100%", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: T.text }}>
            <h3 style={{ fontSize: 20, fontWeight: 400, margin: "0 0 12px" }}>
              {confermaAzione.tipo === "mantieni" ? "Mantenere la recensione pubblicata?" : "Nascondere la recensione?"}
            </h3>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.6, margin: "0 0 24px" }}>
              {confermaAzione.tipo === "mantieni"
                ? "La recensione resterà visibile nella vetrina del salone. Il titolare verrà avvisato via email che la sua segnalazione è stata respinta."
                : "La recensione verrà rimossa dalla vetrina pubblica del salone. Il cliente verrà avvisato via email."}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfermaAzione(null)} style={{ flex: 1, padding: 12, background: "transparent", border: `1px solid ${T.border}`, color: T.textSoft, fontFamily: "inherit", fontSize: 13, letterSpacing: "0.15em", cursor: "pointer" }}>ANNULLA</button>
              <button
                onClick={eseguiAzioneRecensione}
                style={{
                  flex: 1, padding: 12,
                  background: confermaAzione.tipo === "mantieni" ? T.accent : T.danger,
                  border: "none", color: "#fff", fontFamily: "inherit", fontSize: 13, letterSpacing: "0.15em", cursor: "pointer"
                }}
              >
                {confermaAzione.tipo === "mantieni" ? "CONFERMA" : "NASCONDI"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// COMPONENTI INTERNI
// =============================================================

// Card metrica grande in alto
function CardMetrica({ T, icon: Icon, label, valore, sub, trend, trendUp }) {
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      padding: 20,
      boxShadow: "0 2px 8px rgba(108,92,231,0.06)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40,
          background: T.accentSoft,
          borderRadius: 10,
          display: "flex", justifyContent: "center", alignItems: "center",
        }}>
          <Icon size={20} color={T.accent} />
        </div>
        {trend && (
          <div style={{
            fontSize: 11,
            color: trendUp ? T.success : T.textSoft,
            display: "flex",
            alignItems: "center",
            gap: 2,
            background: trendUp ? T.successSoft : T.hover,
            padding: "3px 8px",
            borderRadius: 20,
          }}>
            {trendUp && <ArrowUpRight size={12} />}
            {trend}
          </div>
        )}
      </div>
      <div style={{ fontSize: 11, color: T.textSoft, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>
        {valore}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// Riga avviso
function Avviso({ T, tipo, icona: Icona, titolo, testo, azione, azioneLbl }) {
  const colori = tipo === "danger"
    ? { bg: T.dangerSoft, border: T.danger, color: T.danger }
    : { bg: T.warningSoft, border: T.warning, color: T.warning };

  return (
    <div style={{
      background: colori.bg,
      borderLeft: `3px solid ${colori.border}`,
      padding: "14px 16px",
      borderRadius: 10,
      marginBottom: 8,
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
    }}>
      <Icona size={20} color={colori.color} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2 }}>
          {titolo}
        </div>
        <div style={{ fontSize: 13, color: T.textSoft }}>
          {testo}
        </div>
      </div>
      {azione && (
        <button
          onClick={azione}
          style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            color: T.text,
            padding: "6px 12px",
            borderRadius: 8,
            fontFamily: "inherit",
            fontSize: 13,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {azioneLbl}
        </button>
      )}
    </div>
  );
}

// Stili tabella
const th = { padding: "12px 16px", textAlign: "left", fontWeight: 500 };
const td = { padding: "14px 16px", verticalAlign: "top" };

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
