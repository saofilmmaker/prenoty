import React from 'react';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Scissors, Calendar, Clock, User, Phone, CheckCircle, XCircle, CreditCard, Euro, TrendingUp, Bell, Search, MoreVertical, Settings, Users, Package, BarChart3, Home, Sun, Moon, Plus, Edit2, Trash2, Star, MessageSquare, LogOut, ChevronLeft, ChevronRight, FileText, Gift, Image, Camera, Globe, MapPin, X, Mail, Sparkles, Heart, Flower2, Music2, Zap, Waves, Link, Copy, Check, AlertTriangle } from "lucide-react";
import WhatsAppAssistenza from "./whatsapp-assistenza";
import { supabase } from "./supabase";

// =============================================================
// CONFIGURAZIONE PER TIPO DI ATTIVITÀ
// In base al tipo scelto dal professionista cambiano:
// - servizi predefiniti
// - etichette ("operatore" vs "estetista" vs "terapista")
// - icone
// - tagline
// =============================================================
const CONFIG_ATTIVITA = {
  parrucchiere: {
    nome: "Parrucchiere",
    icona: Scissors,
    operatoreSing: "Operatore",
    operatorePlur: "Operatori",
    spazio: "Postazione",
    serviziDefault: [
      { id: 1, nome: "Taglio Donna", durata: 45, prezzo: 35 },
      { id: 2, nome: "Taglio Uomo", durata: 30, prezzo: 20 },
      { id: 3, nome: "Colore", durata: 90, prezzo: 65 },
      { id: 4, nome: "Piega", durata: 30, prezzo: 25 },
      { id: 5, nome: "Taglio + Piega", durata: 60, prezzo: 50 },
      { id: 6, nome: "Colpi di Sole", durata: 120, prezzo: 85 },
    ],
  },
  estetista: {
    nome: "Estetista",
    icona: Sparkles,
    operatoreSing: "Estetista",
    operatorePlur: "Estetiste",
    spazio: "Cabina",
    serviziDefault: [
      { id: 1, nome: "Manicure", durata: 45, prezzo: 25 },
      { id: 2, nome: "Pedicure", durata: 60, prezzo: 35 },
      { id: 3, nome: "Pulizia viso", durata: 60, prezzo: 50 },
      { id: 4, nome: "Ceretta gambe", durata: 45, prezzo: 30 },
      { id: 5, nome: "Massaggio viso", durata: 50, prezzo: 45 },
      { id: 6, nome: "Trucco", durata: 60, prezzo: 55 },
    ],
  },
  spa: {
    nome: "SPA",
    icona: Flower2,
    operatoreSing: "Terapista",
    operatorePlur: "Terapisti",
    spazio: "Cabina",
    serviziDefault: [
      { id: 1, nome: "Massaggio rilassante", durata: 60, prezzo: 70 },
      { id: 2, nome: "Massaggio decontratturante", durata: 60, prezzo: 75 },
      { id: 3, nome: "Sauna + Bagno turco", durata: 90, prezzo: 40 },
      { id: 4, nome: "Trattamento corpo", durata: 75, prezzo: 90 },
      { id: 5, nome: "Day SPA completo", durata: 180, prezzo: 150 },
      { id: 6, nome: "Massaggio di coppia", durata: 60, prezzo: 130 },
    ],
  },
  generico: {
    nome: "Altro",
    icona: Calendar,
    operatoreSing: "Operatore",
    operatorePlur: "Operatori",
    spazio: "Sala",
    serviziDefault: [
      { id: 1, nome: "Servizio 30 minuti", durata: 30, prezzo: 30 },
      { id: 2, nome: "Servizio 60 minuti", durata: 60, prezzo: 50 },
      { id: 3, nome: "Servizio 90 minuti", durata: 90, prezzo: 70 },
    ],
  },
};


function SalvaBottone({ onClick, label = "SALVA", T }) {
  const [stato, setStato] = React.useState("idle");
  const handle = async () => {
    setStato("salvataggio");
    try {
      await onClick();
      setStato("ok");
    } catch {
      setStato("errore");
    }
    setTimeout(() => setStato("idle"), 2500);
  };
  const bg = stato === "ok" ? "#16a34a" : stato === "errore" ? "#dc2626" : T.accent;
  const testo = stato === "salvataggio" ? "SALVATAGGIO..." : stato === "ok" ? "✓ SALVATO" : stato === "errore" ? "ERRORE — RIPROVA" : label;
  return (
    <button
      onClick={handle}
      disabled={stato === "salvataggio"}
      className="w-full py-3 text-sm tracking-widest mt-3"
      style={{ backgroundColor: bg, color: "#fff", border: "none", cursor: stato === "salvataggio" ? "wait" : "pointer", letterSpacing: "0.15em", transition: "background-color 0.3s" }}
    >
      {testo}
    </button>
  );
}

function CambioPassword({ T }) {
  const [vecchia, setVecchia] = React.useState("");
  const [nuova, setNuova] = React.useState("");
  const [conferma, setConferma] = React.useState("");
  const [msg, setMsg] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleCambio = async () => {
    if (nuova !== conferma) { setMsg({ tipo: "errore", testo: "Le password non coincidono" }); return; }
    if (nuova.length < 8) { setMsg({ tipo: "errore", testo: "La password deve avere almeno 8 caratteri" }); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: nuova });
      if (error) setMsg({ tipo: "errore", testo: error.message });
      else { setMsg({ tipo: "ok", testo: "Password aggiornata con successo!" }); setNuova(""); setConferma(""); }
    } catch(e) { setMsg({ tipo: "errore", testo: "Errore imprevisto" }); }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>NUOVA PASSWORD</label>
        <input type="password" value={nuova} onChange={e => setNuova(e.target.value)} placeholder="Minimo 8 caratteri" className="w-full mt-1 p-3 border outline-none" style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text }} />
      </div>
      <div>
        <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>CONFERMA PASSWORD</label>
        <input type="password" value={conferma} onChange={e => setConferma(e.target.value)} placeholder="Ripeti la nuova password" className="w-full mt-1 p-3 border outline-none" style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text }} />
      </div>
      {msg && <div className="text-sm p-3" style={{ background: msg.tipo === "ok" ? "rgba(93,226,121,0.1)" : "rgba(231,76,60,0.1)", color: msg.tipo === "ok" ? "#27ae60" : "#e74c3c", borderRadius: 8 }}>{msg.testo}</div>}
      <button onClick={handleCambio} disabled={loading} className="w-full p-3 text-sm font-semibold" style={{ background: T.accent, color: "#fff", border: "none", cursor: "pointer" }}>
        {loading ? "Aggiornamento..." : "Aggiorna password"}
      </button>
    </div>
  );
}

export default function DashboardPrenoty() {
  const navigate = useNavigate();

  // TEMA
  const [tema, setTema] = useState(() => localStorage.getItem("prenoty-tema") || "chiaro"); // chiaro | scuro
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

  const [sezione, setSezione] = useState("agenda"); // agenda, clienti, servizi, staff, report, impostazioni
  const [vista, setVista] = useState("oggi");
  const [filtro, setFiltro] = useState("");
  const [filtroCard, setFiltroCard] = useState(null); // null | "pagati"
  const [dettaglio, setDettaglio] = useState(null);
  const [menuAperto, setMenuAperto] = useState(false);

  // TIPO DI ATTIVITÀ (parrucchiere | estetista | spa)
  // Determina servizi predefiniti, etichette, icona, in tutta l'app.
  // In produzione viene salvato in Supabase al primo accesso.
  const [tipoAttivita, setTipoAttivita] = useState("parrucchiere");
  const config = CONFIG_ATTIVITA[tipoAttivita];
  const IconaAttivita = config.icona;

  // Persisti tema in localStorage
  useEffect(() => { localStorage.setItem("prenoty-tema", tema); }, [tema]);

useEffect(() => {
    const caricaDati = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const userId = session.user.id;
      setUserId(userId);

      // Carica dati salone
      const { data: saloneDb } = await supabase
        .from("saloni")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (saloneDb) {
        setSalone(prev => ({
          ...prev,
          nome: saloneDb.nome || prev.nome,
          indirizzo: saloneDb.indirizzo || prev.indirizzo,
          telefono: saloneDb.telefono || prev.telefono,
          email: saloneDb.email || prev.email,
          slug: saloneDb.slug || prev.slug,
          dbId: saloneDb.id,
          orari: saloneDb.orari || prev.orari,
          descrizione: saloneDb.descrizione || prev.descrizione,
          logo: saloneDb.logo || prev.logo,
          copertina: saloneDb.copertina || null,
          copertina_y: saloneDb.copertina_y ?? 50,
          galleria: saloneDb.galleria || [],
          social: saloneDb.social || prev.social,
          mostraRecensioni: saloneDb.mostra_recensioni ?? true,
          mostraMappa: saloneDb.mostra_mappa ?? true,
          mostraOrari: saloneDb.mostra_orari ?? true,
          mostraGalleria: saloneDb.mostra_galleria ?? true,
          mostraSocial: saloneDb.mostra_social ?? true,
          suonoNotifica: saloneDb.suono_notifica || "ding",
          abbonamentoAttivo: saloneDb.abbonamento_attivo ?? false,
          abbonamentoScade: saloneDb.abbonamento_scade_il || null,
          provaScadeIl: saloneDb.prova_scade_il || null,
        }));
        if (saloneDb.metodi_pagamento) {
          setMetodiPagamento(prev => ({
            ...prev,
            ...saloneDb.metodi_pagamento,
            bonifico: saloneDb.metodi_pagamento.bonifico ?? false,
            iban: saloneDb.metodi_pagamento.iban || "",
            intestatario: saloneDb.metodi_pagamento.intestatario || "",
            inSalone: saloneDb.metodi_pagamento.inSalone ?? true,
            stripe: saloneDb.metodi_pagamento.stripe ?? false,
            stripe_pk: saloneDb.metodi_pagamento.stripe_pk || "",
            stripe_sk: saloneDb.metodi_pagamento.stripe_sk || "",
          }));
        }
        if (saloneDb.tipo && CONFIG_ATTIVITA[saloneDb.tipo]) {
          setTipoAttivita(saloneDb.tipo);
        }
        if (saloneDb.staff && saloneDb.staff.length > 0) {
          setStaff(saloneDb.staff);
        }
        if (Array.isArray(saloneDb.recensioni) && saloneDb.recensioni.length > 0) {
          setRecensioni(saloneDb.recensioni);
        }
      }

      // ── Auto-crea record saloni se mancante (primo accesso dopo conferma email) ──
      // Il record non esiste perché alla registrazione l'utente non aveva ancora
      // confermato la mail, quindi l'insert era bloccato da RLS.
      // I dati di tipo/nome vengono letti dai metadati utente salvati al signup.
      if (!saloneDb) {
        const { data: { user } } = await supabase.auth.getUser();
        const meta   = user?.user_metadata || {};
        const tipo   = meta.tipo_attivita || "parrucchiere";
        const nome   = meta.nome_salone   || "Il mio salone";
        const slug   = "salone-" + userId.slice(0, 8);
        const { data: nuovoSalone, error: errIns } = await supabase
          .from("saloni")
          .insert({ user_id: userId, nome, slug, email: user.email, tipo })
          .select()
          .single();
        if (!errIns && nuovoSalone) {
          setSalone(prev => ({ ...prev, nome, slug, email: user.email, dbId: nuovoSalone.id }));
          setTipoAttivita(tipo);
          // Ricarica i dati ora che il record esiste
          caricaDati();
          return;
        }
      }

      if (!saloneDb?.id) return;

      // Carica servizi da Supabase usando salone_id
      const { data: serviziDb } = await supabase
        .from("servizi")
        .select("*")
        .eq("salone_id", saloneDb.id);

      setServizi(serviziDb && serviziDb.length > 0 ? serviziDb.map(s => ({
        id: s.id,
        nome: s.nome,
        durata: s.durata,
        prezzo: s.prezzo,
      })) : []);

      // Carica prenotazioni reali da Supabase
      if (saloneDb) {
        const { data: prenDb } = await supabase
          .from("prenotazioni")
          .select("*")
          .eq("salone_id", saloneDb.id)
          .order("created_at", { ascending: false });

        // Notifiche lette: da Supabase (cross-device) + localStorage (fallback offline)
        const letteDb = Array.isArray(saloneDb.notifiche_lette) ? saloneDb.notifiche_lette : [];
        const letteStorage = JSON.parse(localStorage.getItem("prenoty_notifiche_lette") || "[]");
        const letteSet = new Set([...letteDb, ...letteStorage]);

        setPrenotazioni(prenDb ? prenDb.map(p => ({
          id: p.id,
          cliente: p.nome_cliente,
          tel: p.telefono_cliente,
          email: p.email_cliente || "",
          servizio: p.nomi_servizi || serviziDb?.find(s => s.id === p.servizio_id)?.nome || "Servizio",
          durata: p.durata_totale || serviziDb?.find(s => s.id === p.servizio_id)?.durata || 30,
          prezzo: p.prezzo || serviziDb?.find(s => s.id === p.servizio_id)?.prezzo || 0,
          data: p.data,
          ora: p.ora?.slice(0, 5) || "",
          stato: p.stato || "confermato",
          pagamento: "salone",
          metodoPagamento: p.metodo_pagamento || "salone",
          codiceBonifico: p.codice_bonifico || null,
          staffId: p.staff_id || 1,
          nuovo: !letteSet.has(p.id),
          note: p.note || "",
          creatoIl: p.created_at || null,
        })) : []);
        if (saloneDb) caricaClienti(saloneDb.id);
      }
    };
    caricaDati();
  }, []);

  const [suggerimentiIndirizzo, setSuggerimentiIndirizzo] = useState([]);

  // DATI SALONE (modificabili in impostazioni → così l'app serve per qualsiasi attività beauty)
  const [salone, setSalone] = useState({
    nome: "Atelier Bellezza",
    indirizzo: "Via Roma 12, Milano",
    telefono: "+39 02 1234567",
    email: "info@atelierbellezza.it",
    logo: null, // URL dell'immagine del logo caricato dal parrucchiere
    copertina: null, // URL foto di copertina (banner in cima alla pagina cliente)
    copertina_y: 50, // Posizione verticale copertina (0=top, 50=center, 100=bottom)
    orari: { lun: "09:00-19:00", mar: "09:00-19:00", mer: "09:00-19:00", gio: "09:00-19:00", ven: "09:00-19:00", sab: "09:00-18:00", dom: "Chiuso" },

    // VETRINA — contenuti che il cliente vede sulla home pubblica
    descrizione: "Salone storico nel cuore di Milano. Specializzati in colore, taglio e cura della persona. Ti aspettiamo con un caffè.",
    galleria: [], // max 6 foto del salone/lavori (data URL)
    social: { instagram: "", facebook: "", tiktok: "", sito: "" },

    // INTERRUTTORI vetrina (il parrucchiere decide cosa mostrare al cliente)
    mostraRecensioni: true,
    mostraMappa: true,
    mostraOrari: true,
    mostraGalleria: true,
    mostraSocial: true,
    suonoNotifica: "ding",
    abbonamentoAttivo: false,
    abbonamentoScade: null,
    provaScadeIl: null,
  });

  // RECENSIONI (in produzione arriveranno da Supabase, qui mock per la demo)
  // RECENSIONI
  // - stelle 1-5
  // - testo: messaggio del cliente
  // - rispostaProprietario: testo (null se non ancora risposto)
  // - segnalata: boolean (proprietario può segnalare a admin Prenoty)
  // - nascosta: boolean (admin può nasconderla dopo segnalazione)
  const [recensioni, setRecensioni] = useState([]);

  // State per gestione risposte/segnalazioni
  const [risposteInCorso, setRisposteInCorso] = useState({}); // { recensioneId: "testo bozza" }

  const salvaRecensioni = async (nuovaLista) => {
    setRecensioni(nuovaLista);
    if (salone.dbId) {
      await supabase.from("saloni").update({ recensioni: nuovaLista }).eq("id", salone.dbId);
    }
  };

  const inviaRisposta = (recId) => {
    const testo = risposteInCorso[recId]?.trim();
    if (!testo) return;
    const nuovaLista = recensioni.map(r => r.id === recId ? { ...r, rispostaProprietario: testo } : r);
    salvaRecensioni(nuovaLista);
    setRisposteInCorso({ ...risposteInCorso, [recId]: "" });
  };

  const eliminaRisposta = (recId) => {
    const nuovaLista = recensioni.map(r => r.id === recId ? { ...r, rispostaProprietario: null } : r);
    salvaRecensioni(nuovaLista);
  };

  const segnalaRecensione = (recId) => {
    const oggi = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
    const nuovaLista = recensioni.map(r =>
      r.id === recId
        ? { ...r, segnalata: !r.segnalata, segnalataIl: !r.segnalata ? oggi : null }
        : r
    );
    salvaRecensioni(nuovaLista);
  };
  const mediaStelle = recensioni.length > 0
    ? (recensioni.reduce((s, r) => s + r.stelle, 0) / recensioni.length).toFixed(1)
    : 0;

  // METODI DI PAGAMENTO (il parrucchiere sceglie quali attivare)
  const [metodiPagamento, setMetodiPagamento] = useState({
    bonifico: false,       // Bonifico bancario (con IBAN)
    iban: "",              // IBAN del salone per il bonifico
    intestatario: "",      // Intestatario del conto
    inSalone: true,        // Paga direttamente in salone
    stripe: false,         // Pagamenti online con carta via Stripe
    stripe_pk: "",         // Chiave pubblica Stripe (pk_live_... o pk_test_...)
    stripe_sk: "",         // Chiave segreta Stripe (sk_live_... o sk_test_...)
  });

  // STAFF - ora con foto e max 5 operatori
  const [staff, setStaff] = useState([
    { id: 1, nome: "Titolare", ruolo: "Titolare", colore: "#6c5ce7", foto: null },
  ]);
  const MAX_STAFF = 15;

  // Modifica inline staff: { id: 2, campo: "nome" | "ruolo" }
  const [modificaStaff, setModificaStaff] = useState(null);

  const aggiornaStaff = async (id, campo, valore) => {
    const nuovoStaff = staff.map(s => s.id === id ? { ...s, [campo]: valore } : s);
    setStaff(nuovoStaff);
    if (salone.dbId) {
      await supabase.from("saloni").update({ staff: nuovoStaff }).eq("id", salone.dbId);
    }
  };

  // Modal eliminazione staff (in-app, funziona ovunque)
  const [confermaEliminaStaff, setConfermaEliminaStaff] = useState(null);

  const eliminaStaff = (id) => {
    if (staff.length <= 1) {
      alert("Non puoi eliminare l'ultimo operatore. Il salone deve avere almeno 1 persona.");
      return;
    }
    setConfermaEliminaStaff(id);
  };

  const eseguiEliminaStaff = async () => {
    if (!confermaEliminaStaff) return;
    const nuovoStaff = staff.filter(s => s.id !== confermaEliminaStaff);
    setStaff(nuovoStaff);
    if (salone.dbId) {
      await supabase.from("saloni").update({ staff: nuovoStaff }).eq("id", salone.dbId);
    }
    setConfermaEliminaStaff(null);
  };

  const nuovoStaff = async () => {
    if (staff.length >= MAX_STAFF) return;
    const nuovoId = Math.max(0, ...staff.map(s => s.id)) + 1;
    const coloriDisponibili = ["#6c5ce7", "#a29bfe", "#fd79a8", "#00cec9", "#fdcb6e"];
    const colore = coloriDisponibili[staff.length % coloriDisponibili.length];
    const nuovoMembro = { id: nuovoId, nome: "Nuovo operatore", ruolo: config.operatoreSing, colore, foto: null };
    const nuovoStaffList = [...staff, nuovoMembro];
    setStaff(nuovoStaffList);
    setModificaStaff({ id: nuovoId, campo: "nome" });
    if (salone.dbId) {
      await supabase.from("saloni").update({ staff: nuovoStaffList }).eq("id", salone.dbId);
    }
  };

  // Gestisce upload foto (logo salone o foto staff)
  const uploadFoto = (file, callback, maxSize = 1200) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
          else { w = Math.round(w * maxSize / h); h = maxSize; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL("image/jpeg", 0.80));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // USER ID (salvato per usarlo nelle operazioni Supabase sui servizi)
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
    });
  }, []);

  // SALVATAGGIO IMPOSTAZIONI SALONE
  const [salvataggioStato, setSalvataggioStato] = useState(null);
  const [salvataggioVetrinaStato, setSalvataggioVetrinaStato] = useState(null);
  const [linkCopiato, setLinkCopiato] = useState(false);
  const salvaSalone = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const uid = session.user.id;
    setUserId(uid);
    setSalvataggioStato("salvataggio");

    const payload = {
      user_id: uid,
      nome: salone.nome,
      slug: salone.slug || salone.nome.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"),
      indirizzo: salone.indirizzo,
      telefono: salone.telefono,
      email: salone.email,
      tipo: tipoAttivita,
      logo: salone.logo,
    };

    let error;
    if (salone.dbId) {
      const res = await supabase.from("saloni").update(payload).eq("id", salone.dbId);
      error = res.error;
    } else {
      const res = await supabase.from("saloni").insert(payload).select().single();
      error = res.error;
      if (res.data) setSalone(prev => ({ ...prev, dbId: res.data.id }));
    }

    setSalvataggioStato(error ? "errore" : "ok");
    setTimeout(() => setSalvataggioStato(null), 3000);
  };

  // SERVIZI — caricati da Supabase (vedi useEffect sopra), fallback ai default
  const [servizi, setServizi] = useState([]);

  // Modifica inline servizi: tiene traccia di quale servizio si sta modificando
  const [modificaServizio, setModificaServizio] = useState(null);

  // Modal di conferma per cambio tipo attività
  const [confermaCambioTipo, setConfermaCambioTipo] = useState(null);

  const cambiaTipoAttivita = (nuovoTipo) => {
    if (nuovoTipo === tipoAttivita) return;
    setConfermaCambioTipo(nuovoTipo);
  };

  const eseguiCambioTipo = async () => {
    if (!confermaCambioTipo) return;
    setTipoAttivita(confermaCambioTipo);
    setServizi([]);
    setConfermaCambioTipo(null);
    if (!userId) return;
    await supabase.from("saloni").update({ tipo: confermaCambioTipo }).eq("user_id", userId);
    await supabase.from("servizi").delete().eq("salone_id", salone.dbId);
  };

  const aggiornaServizio = async (id, campo, valore) => {
    const valoreFinale = campo === "nome" ? valore : Number(valore) || 0;
    setServizi(servizi.map(s => s.id === id ? { ...s, [campo]: valoreFinale } : s));
    if (!salone.dbId) return;
    await supabase.from("servizi").update({ [campo]: valoreFinale }).eq("id", id).eq("salone_id", salone.dbId);
  };

  // Modal eliminazione servizio
  const [confermaEliminaServizio, setConfermaEliminaServizio] = useState(null);

  const eliminaServizio = (id) => {
    setConfermaEliminaServizio(id);
  };

  const eseguiEliminaServizio = async () => {
    if (!confermaEliminaServizio) return;
    setServizi(servizi.filter(s => s.id !== confermaEliminaServizio));
    if (salone.dbId) {
      await supabase.from("servizi").delete().eq("id", confermaEliminaServizio).eq("salone_id", salone.dbId);
    }
    setConfermaEliminaServizio(null);
  };

  const nuovoServizio = async () => {
    const servizioTemp = { nome: "Nuovo servizio", durata: 30, prezzo: 0 };
    if (salone.dbId) {
      const { data } = await supabase.from("servizi")
        .insert({ ...servizioTemp, salone_id: salone.dbId })
        .select()
        .single();
      if (data) {
        setServizi(prev => [...prev, { id: data.id, nome: data.nome, durata: data.durata, prezzo: data.prezzo }]);
        setModificaServizio({ id: data.id, campo: "nome" });
        return;
      }
    }
    // Fallback offline
    const nuovoId = Math.max(0, ...servizi.map(s => s.id)) + 1;
    setServizi(prev => [...prev, { id: nuovoId, ...servizioTemp }]);
    setModificaServizio({ id: nuovoId, campo: "nome" });
  };

  // CLIENTI
  const [clienti, setClienti] = useState([]);

  const caricaClienti = async (saloneId) => {
    const oggi = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const [{ data: clientiDb }, { data: prenDb }] = await Promise.all([
      supabase.from("clienti").select("*").eq("salone_id", saloneId).order("ultima_visita", { ascending: false }),
      // Solo appuntamenti PASSATI (data < oggi) e NON annullati → visite effettive
      supabase.from("prenotazioni").select("telefono_cliente, data, prezzo").eq("salone_id", saloneId).neq("stato", "annullato").lt("data", oggi),
    ]);

    // Conta visite e spesa per numero di telefono
    const visitMap = {}, spesaMap = {};
    (prenDb || []).forEach(p => {
      const tel = p.telefono_cliente;
      if (!tel) return;
      visitMap[tel] = (visitMap[tel] || 0) + 1;
      spesaMap[tel] = (spesaMap[tel] || 0) + (p.prezzo || 0);
    });

    if (clientiDb) {
      setClienti(clientiDb.map(c => {
        const visite = visitMap[c.telefono] || 0;
        return {
          id: c.id,
          nome: c.nome || "",
          tel: c.telefono || "",
          email: c.email || "",
          visite,
          totaleSpeso: spesaMap[c.telefono] || 0,
          ultimaVisita: c.ultima_visita || null,
          note: c.note || "",
          fedelta: Math.floor(visite / 2),
        };
      }));
    }
  };

  // GESTIONE NUOVO CLIENTE / ELIMINA CLIENTE
  const [modalNuovoCliente, setModalNuovoCliente] = useState(false);
  const [nuovoCliente, setNuovoCliente] = useState({ nome: "", tel: "", note: "" });
  const [confermaEliminaCliente, setConfermaEliminaCliente] = useState(null);

  const aggiungiCliente = async () => {
    if (!nuovoCliente.nome.trim() || !nuovoCliente.tel.trim()) return;
    const saloneId = salone.dbId;
    if (saloneId) {
      const { data: ins } = await supabase.from("clienti").insert({
        salone_id: saloneId,
        nome: nuovoCliente.nome.trim(),
        telefono: nuovoCliente.tel.trim(),
        note: nuovoCliente.note.trim(),
        visite: 0,
      }).select().single();
      if (ins) {
        setClienti([{ id: ins.id, nome: ins.nome, tel: ins.telefono, email: ins.email || "", visite: 0, totaleSpeso: 0, ultimaVisita: null, note: ins.note || "", fedelta: 0 }, ...clienti]);
      }
    } else {
      setClienti([{ id: Date.now(), nome: nuovoCliente.nome.trim(), tel: nuovoCliente.tel.trim(), note: nuovoCliente.note.trim(), visite: 0, totaleSpeso: 0, ultimaVisita: null, fedelta: 0 }, ...clienti]);
    }
    setNuovoCliente({ nome: "", tel: "", note: "" });
    setModalNuovoCliente(false);
  };

  const eseguiEliminaCliente = async () => {
    if (!confermaEliminaCliente) return;
    await supabase.from("clienti").delete().eq("id", confermaEliminaCliente);
    setClienti(clienti.filter(c => c.id !== confermaEliminaCliente));
    setConfermaEliminaCliente(null);
  };

  // PRENOTAZIONI
  const [prenotazioni, setPrenotazioni] = useState([]);

  const oggiStr = new Date().toISOString().split("T")[0];

  const filtraPrenotazioni = () => {
    let f = prenotazioni;
    if (filtroCard === "pagati") { return f.filter(p => p.pagamento === "pagato").sort((a, b) => (a.data + a.ora).localeCompare(b.data + b.ora)); }
    if (vista === "oggi") f = f.filter(p => p.data === oggiStr);
    if (vista === "settimana") f = f.filter(p => p.data >= oggiStr);
    if (filtro) f = f.filter(p => p.cliente.toLowerCase().includes(filtro.toLowerCase()) || p.servizio.toLowerCase().includes(filtro.toLowerCase()));
    return f.sort((a, b) => (a.data + a.ora).localeCompare(b.data + b.ora));
  };

  const prenOggi = prenotazioni.filter(p => p.data === oggiStr);
  const incassoOggi = prenOggi.reduce((s, p) => s + p.prezzo, 0);
  const pagatiOggi = prenOggi.filter(p => p.pagamento === "pagato").reduce((s, p) => s + p.prezzo, 0);
  const nuoveNotifiche = prenotazioni.filter(p => p.nuovo).length;

  // Dropdown notifiche (campanella)
  const [notificheAperte, setNotificheAperte] = useState(false);

  // AudioContext persistente — sbloccato su click/touchstart e mantenuto vivo
  // iOS e Android auto-sospendono AudioContext dopo inattività; senza gesto
  // ctx.resume() fallisce silenziosamente → nessun suono alla notifica.
  // Fix: sblocca su touchstart (più affidabile di click su mobile),
  //      ri-sblocca quando l'app torna in foreground (visibilitychange),
  //      e manda un ping silenzioso ogni 25s per impedire la sospensione.
  const audioCtxRef = useRef(null);
  useEffect(() => {
    const sblocca = async () => {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtxRef.current.state === "suspended") {
          await audioCtxRef.current.resume();
        }
      } catch(e) {}
    };

    // Sblocca su primo gesto (touchstart = più reattivo su mobile rispetto a click)
    document.addEventListener("touchstart", sblocca, { passive: true });
    document.addEventListener("click", sblocca);

    // Ri-sblocca quando l'app torna in foreground (dopo lock screen / cambio app)
    const onVisible = () => { if (document.visibilityState === "visible") sblocca(); };
    document.addEventListener("visibilitychange", onVisible);

    // Ping silenzioso ogni 25s — impedisce a iOS/Android di sospendere il contesto
    const keepAlive = setInterval(() => {
      try {
        const ctx = audioCtxRef.current;
        if (ctx && ctx.state === "running") {
          const buf = ctx.createBuffer(1, 1, 22050);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.connect(ctx.destination);
          src.start();
        }
      } catch(e) {}
    }, 25000);

    return () => {
      document.removeEventListener("touchstart", sblocca);
      document.removeEventListener("click", sblocca);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(keepAlive);
    };
  }, []);

  // Suoni disponibili per le notifiche
  const SUONI = [
    { id: "ding",     label: "Ding ding",  Icon: Bell },
    { id: "singolo",  label: "Singolo",    Icon: Music2 },
    { id: "nova",     label: "Nova",       Icon: Sparkles },
    { id: "whatsapp", label: "Messaggio",  Icon: MessageSquare },
    { id: "matrix",   label: "Matrix",     Icon: Zap },
  ];

  const suonaCampanella = async (tipo) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") await ctx.resume();
      const t = ctx.currentTime;
      const suono = tipo || salone.suonoNotifica || "ding";

      const nota = (freq, start, dur, vol = 0.25, type = "sine") => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq; osc.type = type;
        gain.gain.setValueAtTime(0, t + start);
        gain.gain.linearRampToValueAtTime(vol, t + start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + start + dur);
        osc.start(t + start); osc.stop(t + start + dur);
      };

      if (suono === "ding")     { nota(880, 0, 0.5); nota(1100, 0.18, 0.5); }
      if (suono === "singolo")  { nota(1046, 0, 0.8); }
      if (suono === "nova")     { [523,659,784,1047].forEach((f,i) => nota(f, i*0.06, 0.5, 0.22, "triangle")); }
      if (suono === "whatsapp") { nota(800, 0, 0.12); nota(1000, 0.13, 0.12); nota(800, 0.26, 0.2); }
      if (suono === "matrix")   { [1400,1100,880,660,520,380].forEach((f,i) => nota(f, i*0.055, 0.12, 0.18)); }

      // Vibrazione Android (iOS la ignora silenziosamente)
      if (navigator.vibrate) navigator.vibrate([150, 80, 150]);
    } catch(e) {}
  };

  // Banner successo pagamento Stripe
  const [bannerStripe, setBannerStripe] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get("abbonamento") === "success" ? "success" : p.get("abbonamento") === "cancel" ? "cancel" : null;
  });
  useEffect(() => {
    if (bannerStripe) {
      // Pulisce il parametro dall'URL senza reload
      const url = new URL(window.location.href);
      url.searchParams.delete("abbonamento");
      window.history.replaceState({}, "", url.toString());
      const t = setTimeout(() => setBannerStripe(null), 6000);
      return () => clearTimeout(t);
    }
  }, [bannerStripe]);

  // PERIODO DI PROVA — calcola giorni rimasti e gestisce blocco/banner
  const giorniProvaRimasti = (() => {
    if (salone.abbonamentoAttivo) return null; // già pagato, non serve
    if (!salone.provaScadeIl) return null;
    const diff = new Date(salone.provaScadeIl) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  })();

  // Redirect a /blocco se la prova è scaduta e non ha pagato
  useEffect(() => {
    if (!salone.dbId) return; // aspetta che i dati siano caricati
    if (salone.abbonamentoAttivo) return; // ha pagato, ok
    if (giorniProvaRimasti !== null && giorniProvaRimasti <= 0) {
      navigate("/blocco");
    }
  }, [salone.dbId, salone.abbonamentoAttivo, giorniProvaRimasti, navigate]);

  // Ref per salone.dbId — usato in handler asincroni senza stale closure
  const saloneIdRef = useRef(null);
  useEffect(() => { saloneIdRef.current = salone.dbId; }, [salone.dbId]);

  // Ref per il suono selezionato — evita stale closure nel Realtime callback
  const suonoRef = useRef("ding");
  useEffect(() => {
    suonoRef.current = salone.suonoNotifica || "ding";
  }, [salone.suonoNotifica]);

  // Rilevamento nuove notifiche — solo conteggio badge, il suono lo fa il Realtime
  const prevNotifiche = useRef(null);
  useEffect(() => {
    if (prevNotifiche.current === null) {
      prevNotifiche.current = nuoveNotifiche;
      return;
    }
    prevNotifiche.current = nuoveNotifiche;
  }, [nuoveNotifiche]);

  // REALTIME — ascolta nuove prenotazioni senza ricaricare la pagina
  useEffect(() => {
    if (!salone.dbId) return;

    const channel = supabase
      .channel(`prenotazioni-salone-${salone.dbId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "prenotazioni",
          filter: `salone_id=eq.${salone.dbId}`,
        },
        (payload) => {
          const p = payload.new;
          const nuovaPren = {
            id: p.id,
            cliente: p.nome_cliente,
            tel: p.telefono_cliente,
            email: p.email_cliente || "",
            servizio: p.nomi_servizi || "Servizio",
            durata: p.durata_totale || 30,
            prezzo: p.prezzo || 0,
            data: p.data,
            ora: p.ora?.slice(0, 5) || "",
            stato: p.stato || "confermato",
            pagamento: "salone",
            metodoPagamento: p.metodo_pagamento || "salone",
            codiceBonifico: p.codice_bonifico || null,
            staffId: p.staff_id || 1,
            nuovo: true,
            note: p.note || "",
            creatoIl: p.created_at || null,
          };
          setPrenotazioni(prev => [nuovaPren, ...prev]);
          suonaCampanella(suonoRef.current);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [salone.dbId]);

  // REALTIME — ascolta nuove recensioni in tempo reale
  useEffect(() => {
    if (!salone.dbId) return;
    const channel = supabase
      .channel(`recensioni-salone-${salone.dbId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "saloni", filter: `id=eq.${salone.dbId}` },
        (payload) => {
          const nuoveRecensioni = payload.new?.recensioni;
          if (!Array.isArray(nuoveRecensioni)) return;
          setRecensioni(prev => {
            if (nuoveRecensioni.length > prev.length) {
              // setTimeout per uscire dal ciclo di render prima di suonare
              setTimeout(() => suonaCampanella(suonoRef.current), 0);
            }
            return nuoveRecensioni;
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [salone.dbId]);

  // iOS PWA — riconnette Realtime e ricarica prenotazioni quando l'app torna in foreground
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "visible") return;
      const dbId = saloneIdRef.current;
      if (!dbId) return;

      // 1. Rinnova la sessione (evita logout dopo background)
      await supabase.auth.getSession();

      // 2. Ricarica prenotazioni perse durante il background
      const { data: prenDb } = await supabase
        .from("prenotazioni").select("*").eq("salone_id", dbId).order("created_at", { ascending: false });
      if (prenDb) {
        const letteDb_raw = await supabase.from("saloni").select("notifiche_lette").eq("id", dbId).maybeSingle();
        const letteDb = Array.isArray(letteDb_raw.data?.notifiche_lette) ? letteDb_raw.data.notifiche_lette : [];
        const letteStorage = JSON.parse(localStorage.getItem("prenoty_notifiche_lette") || "[]");
        const letteSet = new Set([...letteDb, ...letteStorage]);
        setPrenotazioni(prenDb.map(p => ({
          id: p.id,
          cliente: p.nome_cliente,
          tel: p.telefono_cliente,
          email: p.email_cliente || "",
          servizio: p.nomi_servizi || "Servizio",
          durata: p.durata_totale || 30,
          prezzo: p.prezzo || 0,
          data: p.data,
          ora: p.ora?.slice(0, 5) || "",
          stato: p.stato || "confermato",
          pagamento: "salone",
          metodoPagamento: p.metodo_pagamento || "salone",
          codiceBonifico: p.codice_bonifico || null,
          staffId: p.staff_id || 1,
          nuovo: !letteSet.has(p.id),
          note: p.note || "",
          creatoIl: p.created_at || null,
        })));
      }

      // 3. Riconnette il canale Realtime se disconnesso
      supabase.getChannels().forEach(ch => {
        if (ch.state !== "joined") ch.subscribe();
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Pull-to-refresh per PWA mobile (iOS non ha pull-to-refresh nativo in standalone)
  useEffect(() => {
    const isPwa = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    if (!isPwa) return;

    let startY = 0;
    let pulling = false;
    let indicator = null;

    const onTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    };

    const onTouchMove = (e) => {
      if (!pulling) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 10 && window.scrollY === 0) {
        if (!indicator) {
          indicator = document.createElement("div");
          indicator.innerHTML = "↓ Rilascia per aggiornare";
          indicator.style.cssText = "position:fixed;top:60px;left:50%;transform:translateX(-50%);background:#6c5ce7;color:#fff;padding:8px 18px;border-radius:20px;font-size:13px;font-weight:600;z-index:99999;transition:opacity 0.2s;pointer-events:none";
          document.body.appendChild(indicator);
        }
        if (dy > 70) indicator.innerHTML = "↑ Rilascia per aggiornare";
      }
    };

    const onTouchEnd = (e) => {
      if (!pulling) return;
      const dy = e.changedTouches[0].clientY - startY;
      pulling = false;
      if (indicator) { indicator.remove(); indicator = null; }
      if (dy > 70) {
        window.location.reload();
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      if (indicator) indicator.remove();
    };
  }, []);

  // Segna notifica come letta — salva in saloni.notifiche_lette (cross-device) + localStorage
  const segnaLetta = async (id) => {
    setPrenotazioni(prenotazioni.map(p => p.id === id ? { ...p, nuovo: false } : p));

    // 1. localStorage: immediato, funziona offline
    const letteStorage = JSON.parse(localStorage.getItem("prenoty_notifiche_lette") || "[]");
    if (!letteStorage.includes(id)) {
      localStorage.setItem("prenoty_notifiche_lette", JSON.stringify([...letteStorage, id]));
    }

    // 2. Supabase su saloni.notifiche_lette: sincronizza tutti i dispositivi
    if (salone.dbId) {
      const { data: saloneAttuale } = await supabase
        .from("saloni").select("notifiche_lette").eq("id", salone.dbId).maybeSingle();
      const letteDb = Array.isArray(saloneAttuale?.notifiche_lette) ? saloneAttuale.notifiche_lette : [];
      if (!letteDb.includes(id)) {
        await supabase.from("saloni")
          .update({ notifiche_lette: [...letteDb, id] })
          .eq("id", salone.dbId);
      }
    }
  };

  const listaNotifiche = [
    ...prenotazioni.filter(p => p.nuovo).map(p => ({
      tipo: "prenotazione",
      icon: Calendar,
      titolo: `Nuova prenotazione: ${p.cliente}`,
      sottotitolo: `${p.servizio} · ${p.data} ore ${p.ora}`,
      data: p.data,
      onClick: () => { setSezione("agenda"); setNotificheAperte(false); setDettaglio(p); segnaLetta(p.id); },
    })),
    ...recensioni.filter(r => !r.rispostaProprietario).slice(0, 3).map(r => ({
      tipo: "recensione",
      icon: Star,
      titolo: `Nuova recensione da ${r.nome}`,
      sottotitolo: `${r.stelle} stelle · "${r.testo.slice(0, 50)}${r.testo.length > 50 ? '...' : ''}"`,
      data: r.data,
      onClick: () => { setSezione("recensioni"); setNotificheAperte(false); },
    })),
  ];
  const oggi = new Date();
  const incassoMese = prenotazioni
    .filter(p => { if (!p.data) return false; const d = new Date(p.data); return d.getMonth() === oggi.getMonth() && d.getFullYear() === oggi.getFullYear() && p.stato !== "annullato"; })
    .reduce((s, p) => s + (p.prezzo || 0), 0);

  // Stato navigazione mesi nel Report
  const [meseReport, setMeseReport] = useState({ mese: oggi.getMonth(), anno: oggi.getFullYear() });
  const nomiMesi = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
  const mesePrec = () => setMeseReport(m => m.mese === 0 ? { mese: 11, anno: m.anno - 1 } : { mese: m.mese - 1, anno: m.anno });
  const meseSucc = () => setMeseReport(m => m.mese === 11 ? { mese: 0, anno: m.anno + 1 } : { mese: m.mese + 1, anno: m.anno });
  const isMeseCorrente = meseReport.mese === oggi.getMonth() && meseReport.anno === oggi.getFullYear();

  const cancella = async (id) => {
    const pren = prenotazioni.find(p => p.id === id);
    // Rimuove subito dalla UI
    setPrenotazioni(prenotazioni.filter(p => p.id !== id));
    setDettaglio(null);
    // Invia email di cancellazione al cliente (fire-and-forget)
    if (pren?.email) {
      fetch("/api/send-cancellation-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailCliente: pren.email,
          nomeCliente: pren.cliente,
          nomeSalone: salone.nome,
          servizi: pren.servizio,
          data: pren.data,
          ora: pren.ora,
          slugSalone: salone.slug,
        }),
      }).catch(() => {});
    }
    // Elimina da Supabase (permanente)
    const { error } = await supabase.from("prenotazioni").delete().eq("id", id);
    if (error) {
      console.error("Errore cancellazione:", error);
      alert(`Errore: ${error.message}`);
    }
  };

  const fmtData = (d) => {
    const date = new Date(d);
    const g = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
    const m = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
    return `${g[date.getDay()]} ${date.getDate()} ${m[date.getMonth()]}`;
  };

  const staffDi = (id) => staff.find(s => s.id === id);
  const visibili = filtraPrenotazioni();

  const staffIconPerTipo = { parrucchiere: Scissors, estetista: Sparkles, spa: Flower2, generico: Users };
  const staffIcon = staffIconPerTipo[tipoAttivita] || Users;

  const menuItems = [
    { id: "agenda", label: "Agenda", icon: Calendar },
    { id: "clienti", label: "Clienti", icon: Users },
    { id: "servizi", label: "Servizi", icon: Package },
    { id: "staff", label: "Staff", icon: staffIcon },
    { id: "recensioni", label: "Recensioni", icon: Star },
    { id: "report", label: "Report", icon: BarChart3 },
    { id: "impostazioni", label: "Impostazioni", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: T.bg, fontFamily: "Georgia, 'Times New Roman', serif", color: T.text }}>
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-56 border-r" style={{ backgroundColor: T.card, borderColor: T.border }}>
        <div className="p-5 border-b" style={{ borderColor: T.border, background: `linear-gradient(135deg, ${T.accent}18 0%, ${T.card} 100%)` }}>
          <div className="flex items-center gap-2">
            {salone.logo ? (
              <img src={salone.logo} alt="Logo" className="w-10 h-10 object-contain rounded-xl" />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${T.accent}, ${T.accent}99)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <IconaAttivita className="w-4 h-4" style={{ color: "#fff" }} />
              </div>
            )}
            <div>
              <div className="text-sm font-semibold" style={{ color: T.text }}>{salone.nome}</div>
              <div className="text-xs" style={{ color: T.accent, fontWeight: 500 }}>Powered by Prenoty</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map(m => {
            const Icon = m.icon;
            const attivo = sezione === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSezione(m.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition"
                style={{
                  borderRadius: 10,
                  backgroundColor: attivo ? T.accent : "transparent",
                  color: attivo ? "#fff" : T.textSoft,
                  fontWeight: attivo ? 600 : 400,
                }}
              >
                <Icon className="w-4 h-4" />
                {m.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t space-y-1" style={{ borderColor: T.border }}>
          <div className="px-2 py-2">
            <div className="text-xs tracking-widest mb-2" style={{ color: T.textMuted, letterSpacing: "0.15em" }}>TEMA</div>
            <div className="flex border" style={{ borderColor: T.border, borderRadius: 14, overflow: "hidden" }}>
              <button
                onClick={() => setTema("chiaro")}
                className="flex-1 py-2 text-xs tracking-widest transition"
                style={{
                  backgroundColor: tema === "chiaro" ? T.accent : "transparent",
                  color: tema === "chiaro" ? "#fff" : T.textSoft,
                  letterSpacing: "0.15em",
                }}
              >
                CHIARO
              </button>
              <button
                onClick={() => setTema("scuro")}
                className="flex-1 py-2 text-xs tracking-widest transition"
                style={{
                  backgroundColor: tema === "scuro" ? T.accent : "transparent",
                  color: tema === "scuro" ? "#fff" : T.textSoft,
                  letterSpacing: "0.15em",
                }}
              >
                SCURO
              </button>
            </div>
          </div>
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition"
            style={{ color: T.textSoft, borderRadius: 10 }}
            onClick={async () => { await supabase.auth.signOut(); window.location.href = "/login"; }}
          >
            <LogOut className="w-4 h-4" />
            Esci
          </button>
          <div className="text-xs text-center pt-2 pb-1">
            <a href="https://prenoty.com" target="_blank" rel="noopener noreferrer" style={{ color: T.accent, letterSpacing: "0.2em", fontWeight: 700 }}>
              PRENOTY
            </a>
          </div>
        </div>
      </aside>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER mobile + notifiche */}
        <header className="border-b px-4 md:px-8 py-4 flex items-center justify-between" style={{ backgroundColor: T.card, borderColor: T.border, paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
          <div className="md:hidden flex items-center gap-2">
            {salone.logo ? (
              <img src={salone.logo} alt="Logo" style={{ width: 28, height: 28, objectFit: "contain", borderRadius: 8 }} />
            ) : (
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${T.accent}, ${T.accent}99)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <IconaAttivita className="w-4 h-4" style={{ color: "#fff" }} />
              </div>
            )}
            <span className="text-sm tracking-wider">{salone.nome.toUpperCase()}</span>
          </div>
          <h2 className="hidden md:block text-xl capitalize">{sezione}</h2>
          <div className="flex items-center gap-2">
            {/* TOGGLE TEMA mobile — mini pillola testuale */}
            <div className="md:hidden flex border text-xs" style={{ borderColor: T.border }}>
              <button
                onClick={() => setTema("chiaro")}
                className="px-2 py-1 tracking-widest transition"
                style={{
                  backgroundColor: tema === "chiaro" ? T.accent : "transparent",
                  color: tema === "chiaro" ? "#fff" : T.textSoft,
                  letterSpacing: "0.1em",
                  fontSize: 10,
                }}
              >
                CHIARO
              </button>
              <button
                onClick={() => setTema("scuro")}
                className="px-2 py-1 tracking-widest transition"
                style={{
                  backgroundColor: tema === "scuro" ? T.accent : "transparent",
                  color: tema === "scuro" ? "#fff" : T.textSoft,
                  letterSpacing: "0.1em",
                  fontSize: 10,
                }}
              >
                SCURO
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => setNotificheAperte(!notificheAperte)}
                className="relative p-2 rounded transition"
                style={{ color: T.textSoft }}
                title="Notifiche"
              >
                <Bell className="w-5 h-5" />
                {listaNotifiche.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 text-[10px] flex items-center justify-center rounded-full font-bold"
                    style={{
                      backgroundColor: tema === "scuro" ? "#5de279" : T.accent,
                      color: tema === "scuro" ? "#1a1730" : "#fff",
                    }}>
                    {listaNotifiche.length}
                  </span>
                )}
              </button>
              {notificheAperte && (
                <>
                  <div onClick={() => setNotificheAperte(false)} style={{ position: "fixed", inset: 0, zIndex: 50 }} />
                  <div
                    className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto"
                    style={{
                      background: T.card,
                      border: `1px solid ${T.border}`,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      zIndex: 51,
                    }}
                  >
                    <div className="p-3 border-b" style={{ borderColor: T.border }}>
                      <div className="text-sm font-medium">Notifiche</div>
                      <div className="text-xs" style={{ color: T.textMuted }}>{listaNotifiche.length} {listaNotifiche.length === 1 ? "nuova" : "nuove"}</div>
                    </div>
                    {listaNotifiche.length === 0 ? (
                      <div className="p-6 text-center text-sm" style={{ color: T.textMuted }}>
                        Nessuna nuova notifica
                      </div>
                    ) : (
                      <div className="divide-y" style={{ borderColor: T.border }}>
                        {listaNotifiche.map((n, i) => {
                          const Icona = n.icon;
                          const isPren = n.tipo === "prenotazione";
                          const colore  = isPren ? "#6c5ce7" : "#5de279";
                          const coloreSoft = isPren ? "rgba(108,92,231,0.12)" : "rgba(93,226,121,0.12)";
                          const coloreBordo = isPren ? "rgba(108,92,231,0.3)" : "rgba(93,226,121,0.3)";
                          return (
                            <button
                              key={i}
                              onClick={n.onClick}
                              className="w-full p-3 text-left transition"
                              style={{
                                borderColor: T.border,
                                backgroundColor: T.card,
                                borderLeft: `3px solid ${colore}`,
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: coloreSoft, border: `1px solid ${coloreBordo}` }}>
                                  <Icona className="w-4 h-4" style={{ color: colore }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium">{n.titolo}</div>
                                  <div className="text-xs mt-0.5 truncate" style={{ color: T.textMuted }}>{n.sottotitolo}</div>
                                </div>
                                <div style={{ width: 7, height: 7, borderRadius: "50%", background: colore, flexShrink: 0, marginTop: 4 }} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* TAB MENU mobile */}
        <div className="md:hidden border-b overflow-x-auto flex" style={{ backgroundColor: T.card, borderColor: T.border }}>
          {menuItems.map(m => {
            const Icon = m.icon;
            const attivo = sezione === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSezione(m.id)}
                className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 text-xs transition"
                style={{
                  color: attivo ? T.accent : T.textMuted,
                  borderBottom: attivo ? `2px solid ${T.accent}` : "2px solid transparent",
                }}
              >
                <Icon className="w-4 h-4" />
                {m.label}
              </button>
            );
          })}
          {/* Separatore + Supporto + Esci — in fondo, si raggiunge solo scorrendo */}
          <div className="flex-shrink-0 flex items-center px-2" style={{ borderLeft: `1px solid ${T.border}`, marginLeft: 4, gap: 0 }}>
            <a
              href="https://wa.me/393489259863?text=Ciao%2C+ho+bisogno+di+assistenza+con+Prenoty."
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 px-3 py-3 text-xs"
              style={{ color: "#25D366", textDecoration: "none" }}
              title="Supporto WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
              Supporto
            </a>
            <button
              onClick={async () => { await supabase.auth.signOut(); window.location.href = "/login"; }}
              className="flex flex-col items-center gap-1 px-3 py-3 text-xs"
              style={{ color: T.textMuted }}
              title="Esci"
            >
              <LogOut className="w-4 h-4" />
              Esci
            </button>
          </div>
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {/* AGENDA */}
          {sezione === "agenda" && (
            <div>
              {/* STATS */}
              {/* Animazione pulse per notifiche */}
              <style>{`@keyframes prenoty-glow{0%,100%{box-shadow:0 0 0 0 rgba(108,92,231,0)}50%{box-shadow:0 0 0 8px rgba(108,92,231,0.6)}}`}</style>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { lbl: "OGGI",     val: prenOggi.length,  sub: "appuntamenti",        icon: Calendar,   bg: T.accent,   light: false, onClick: null },
                  { lbl: "OGGI",     val: `€${incassoOggi}`,sub: "incasso previsto",    icon: Euro,       bg: "#00b894",  light: false, onClick: null },
                  { lbl: "MESE",     val: `€${incassoMese}`,sub: "prenotazioni confermate",icon: TrendingUp, bg: T.card,   light: true,  onClick: null },
                  { lbl: "PAGATO ONLINE", val: `€${pagatiOggi}`, sub: "ricevuto oggi online", icon: CreditCard, bg: filtroCard === "pagati" ? T.accentSoft : T.card, light: true, onClick: () => { setFiltroCard(f => f === "pagati" ? null : "pagati"); setVista("tutti"); } },
                ].map((s, i) => {
                  const Ic = s.icon;
                  return (
                    <div
                      key={i}
                      onClick={s.onClick || undefined}
                      className="p-4"
                      style={{
                        backgroundColor: s.bg,
                        borderRadius: 14,
                        border: s.light ? `1.5px solid ${filtroCard === "pagati" && i === 3 ? T.accent : s.pulse ? T.accent : T.border}` : "none",
                        boxShadow: s.light ? "none" : "0 4px 16px rgba(108,92,231,0.25)",
                        cursor: s.onClick ? "pointer" : "default",
                        animation: s.pulse ? "prenoty-glow 1.4s ease-in-out infinite" : "none",
                        transition: "background 0.2s",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div style={{ width: 32, height: 32, borderRadius: 14, background: s.light ? T.accentSoft : "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Ic className="w-4 h-4" style={{ color: s.light ? T.accent : "#fff" }} />
                        </div>
                        <span className="text-xs tracking-widest" style={{ color: s.light ? T.textMuted : "rgba(255,255,255,0.7)", letterSpacing: "0.12em", textAlign: "right" }}>{s.lbl}</span>
                      </div>
                      <div className="text-2xl md:text-3xl font-semibold" style={{ color: s.light ? T.text : "#fff" }}>{s.val}</div>
                      <div className="text-xs mt-1" style={{ color: s.light ? T.textMuted : "rgba(255,255,255,0.75)" }}>{i === 3 ? (filtroCard === "pagati" ? "▸ filtro attivo — clicca per togliere" : "ricevuto oggi online") : s.sub}</div>
                    </div>
                  );
                })}
              </div>

              {/* Banner filtro pagati attivo */}
              {/* Banner periodo di prova in scadenza */}
              {!salone.abbonamentoAttivo && giorniProvaRimasti !== null && giorniProvaRimasti > 0 && giorniProvaRimasti <= 7 && (
                <div className="flex items-center justify-between mb-3 px-4 py-3 text-sm" style={{
                  backgroundColor: giorniProvaRimasti <= 3 ? "#fff3e0" : "#fffde7",
                  border: `1px solid ${giorniProvaRimasti <= 3 ? "#e67e22" : "#f39c12"}`,
                  borderRadius: 10,
                  color: giorniProvaRimasti <= 3 ? "#e67e22" : "#f39c12"
                }}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {giorniProvaRimasti === 1
                        ? "⚠️ Ultimo giorno di prova! Acquista Prenoty per continuare ad usarlo."
                        : `⏳ Il tuo periodo di prova scade tra ${giorniProvaRimasti} giorni.`}
                    </span>
                  </div>
                  <button
                    onClick={() => setSezione("impostazioni")}
                    className="ml-3 text-xs font-semibold underline flex-shrink-0"
                  >
                    Acquista ora
                  </button>
                </div>
              )}

              {/* Banner Stripe success / cancel */}
              {bannerStripe === "success" && (
                <div className="flex items-center justify-between mb-3 px-4 py-3 text-sm" style={{ backgroundColor: "#e6faf6", border: "1px solid #00b894", borderRadius: 10, color: "#00b894" }}>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> 🎉 Pagamento completato! Benvenuto in Prenoty.
                  </div>
                  <button onClick={() => setBannerStripe(null)} className="text-xs opacity-60">✕</button>
                </div>
              )}
              {bannerStripe === "cancel" && (
                <div className="flex items-center justify-between mb-3 px-4 py-3 text-sm" style={{ backgroundColor: "#fdecea", border: "1px solid #c0392b", borderRadius: 10, color: "#c0392b" }}>
                  <div className="flex items-center gap-2">
                    ⚠️ Pagamento annullato. Puoi riprovare da Impostazioni → Piano Prenoty.
                  </div>
                  <button onClick={() => setBannerStripe(null)} className="text-xs opacity-60">✕</button>
                </div>
              )}

              {filtroCard === "pagati" && (
                <div className="flex items-center justify-between mb-3 px-4 py-2.5 text-sm" style={{ backgroundColor: T.accentSoft, border: `1px solid ${T.accent}`, borderRadius: 10 }}>
                  <div className="flex items-center gap-2" style={{ color: T.accent }}>
                    <CreditCard className="w-4 h-4" /> Stai vedendo solo chi ha pagato online
                  </div>
                  <button onClick={() => setFiltroCard(null)} className="text-xs" style={{ color: T.accent }}>✕ Rimuovi filtro</button>
                </div>
              )}

              {/* FILTRI */}
              <div className="flex flex-col md:flex-row gap-3 mb-5">
                <div className="flex gap-1 p-1" style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, borderRadius: 10 }}>
                  {["oggi", "settimana", "tutti"].map(v => (
                    <button
                      key={v}
                      onClick={() => { setVista(v); setFiltroCard(null); }}
                      className="px-4 py-2 text-xs tracking-widest transition"
                      style={{
                        backgroundColor: vista === v ? T.dark : "transparent",
                        color: vista === v ? "#fff" : T.textSoft,
                        letterSpacing: "0.15em",
                        borderRadius: 7,
                      }}
                    >
                      {v.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: T.textMuted }} />
                  <input
                    type="text"
                    placeholder="Cerca cliente o servizio..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 outline-none text-sm"
                    style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text }}
                  />
                </div>
              </div>

              {/* LISTA PRENOTAZIONI */}
              <div style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
                <div className="px-5 py-3 border-b" style={{ borderColor: T.border }}>
                  <h3 className="text-sm tracking-widest" style={{ color: T.textSoft, letterSpacing: "0.15em" }}>
                    PRENOTAZIONI ({visibili.length})
                  </h3>
                </div>

                {visibili.length === 0 ? (
                  <div className="py-16 text-center" style={{ color: T.textMuted }}>
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Nessuna prenotazione</p>
                  </div>
                ) : (
                  <div>
                    {visibili.map((p, idx) => {
                      const mostraData = idx === 0 || visibili[idx - 1].data !== p.data;
                      const s = staffDi(p.staffId);
                      return (
                        <div key={p.id}>
                          {mostraData && (
                            <div className="px-5 py-2 border-b text-xs tracking-widest" style={{ backgroundColor: T.bg, borderColor: T.border, color: T.textMuted, letterSpacing: "0.15em" }}>
                              {fmtData(p.data).toUpperCase()}
                            </div>
                          )}
                          <button
                            onClick={() => { setDettaglio(p); segnaLetta(p.id); }}
                            className="w-full px-5 py-4 border-b transition flex items-center gap-4 text-left hover:opacity-90"
                            style={{ borderColor: T.border }}
                          >
                            <div className="text-center min-w-[55px]">
                              <div className="text-lg md:text-xl">{p.ora}</div>
                              <div className="text-xs" style={{ color: T.textMuted }}>{p.durata}m</div>
                            </div>

                            <div className="w-0.5 self-stretch" style={{ backgroundColor: p.nuovo ? T.accent : (s?.colore || T.border), borderRadius: 2 }} />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="truncate">{p.cliente}</span>
                                {p.nuovo && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full text-white tracking-widest flex-shrink-0" style={{ backgroundColor: T.accent, letterSpacing: "0.1em" }}>
                                    NUOVO
                                  </span>
                                )}
                              </div>
                              <div className="text-sm mt-0.5 truncate" style={{ color: T.textSoft }}>
                                {p.servizio} {s && <span style={{ color: T.textMuted }}>· {s.nome.split(" ")[0]}</span>}
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <div className="text-lg font-semibold" style={{ color: T.accent }}>€{p.prezzo}</div>
                              <div className="text-xs flex items-center gap-1 justify-end mt-0.5">
                                {p.pagamento === "pagato" ? (
                                  <><CheckCircle className="w-3 h-3" style={{ color: "#00b894" }} /><span style={{ color: "#00b894" }}>Pagato</span></>
                                ) : (
                                  <span style={{ color: T.textMuted }}>In salone</span>
                                )}
                              </div>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CLIENTI */}
          {sezione === "clienti" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="text-sm tracking-widest" style={{ color: T.textSoft, letterSpacing: "0.15em" }}>
                  {clienti.length} CLIENTI IN ANAGRAFICA
                </div>
                <button
                  onClick={() => setModalNuovoCliente(true)}
                  className="flex items-center gap-2 px-4 py-2 text-xs tracking-widest text-white"
                  style={{ backgroundColor: T.dark, color: T.bg, letterSpacing: "0.15em" }}
                >
                  <Plus className="w-4 h-4" /> NUOVO
                </button>
              </div>

              <div className="border divide-y" style={{ backgroundColor: T.card, borderColor: T.border }}>
                {clienti.length === 0 ? (
                  <div className="p-12 text-center" style={{ color: T.textMuted }}>
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    <div>Nessun cliente in anagrafica.</div>
                    <button
                      onClick={() => setModalNuovoCliente(true)}
                      className="mt-3 px-4 py-2 text-xs tracking-widest"
                      style={{ backgroundColor: T.accent, color: "#fff", letterSpacing: "0.15em" }}
                    >
                      <Plus className="w-3 h-3 inline mr-1" /> AGGIUNGI IL PRIMO
                    </button>
                  </div>
                ) : clienti.map(c => (
                  <div key={c.id} className="p-5 flex items-center gap-4" style={{ borderColor: T.border }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: T.accentSoft, color: T.accent }}>
                      {c.nome.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>{c.nome}</span>
                        {c.fedelta >= 10 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full tracking-widest flex items-center gap-1" style={{ backgroundColor: T.accentSoft, color: T.accent, letterSpacing: "0.1em" }}>
                            <Star className="w-2.5 h-2.5 fill-current" /> VIP
                          </span>
                        )}
                      </div>
                      <div className="text-sm flex items-center gap-3 mt-1 flex-wrap" style={{ color: T.textSoft }}>
                        <a href={`tel:${c.tel}`} className="flex items-center gap-1 hover:opacity-70 transition" style={{ color: T.textSoft }}>
                          <Phone className="w-3 h-3" />{c.tel}
                        </a>
                        {c.email && (
                          <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:opacity-70 transition" style={{ color: T.textSoft }}>
                            <Mail className="w-3 h-3" />{c.email}
                          </a>
                        )}
                      </div>
                      {c.note && (
                        <div className="text-xs mt-1 italic" style={{ color: T.textMuted }}>{c.note}</div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 hidden md:block">
                      <div className="text-sm">{c.visite} visite</div>
                      <div className="text-xs" style={{ color: T.accent }}>€{c.totaleSpeso} totale</div>
                      <div className="text-xs" style={{ color: T.textMuted }}>{c.ultimaVisita ? `Ultima: ${fmtData(c.ultimaVisita)}` : "Mai venuto"}</div>
                    </div>
                    <button
                      onClick={() => setConfermaEliminaCliente(c.id)}
                      className="p-2 transition flex-shrink-0"
                      style={{ color: T.danger }}
                      title="Elimina cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SERVIZI */}
          {sezione === "servizi" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="text-sm tracking-widest" style={{ color: T.textSoft, letterSpacing: "0.15em" }}>
                  {servizi.length} SERVIZI ATTIVI · TOCCA PER MODIFICARE
                </div>
                <button
                  onClick={nuovoServizio}
                  className="flex items-center gap-2 px-4 py-2 text-xs tracking-widest"
                  style={{ backgroundColor: T.dark, color: T.bg, letterSpacing: "0.15em" }}
                >
                  <Plus className="w-4 h-4" /> NUOVO
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {servizi.map(s => {
                  const inMod = (campo) => modificaServizio?.id === s.id && modificaServizio?.campo === campo;

                  return (
                    <div
                      key={s.id}
                      className="p-5 border flex items-center justify-between"
                      style={{ backgroundColor: T.card, borderColor: T.border }}
                    >
                      <div style={{ flex: 1 }}>
                        {/* NOME — clic per modificare */}
                        {inMod("nome") ? (
                          <input
                            autoFocus
                            type="text"
                            value={s.nome}
                            onChange={(e) => aggiornaServizio(s.id, "nome", e.target.value)}
                            onBlur={() => setModificaServizio(null)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setModificaServizio(null); }}
                            style={{
                              fontSize: 18,
                              fontFamily: "inherit",
                              background: "transparent",
                              color: T.text,
                              border: "none",
                              borderBottom: `2px solid ${T.accent}`,
                              outline: "none",
                              width: "100%",
                              padding: "2px 0",
                            }}
                          />
                        ) : (
                          <div
                            onClick={() => setModificaServizio({ id: s.id, campo: "nome" })}
                            className="text-lg cursor-pointer"
                            style={{ borderBottom: `1px dashed ${T.border}` }}
                            title="Tocca per modificare"
                          >
                            {s.nome}
                          </div>
                        )}

                        <div className="text-sm flex items-center gap-3 mt-2" style={{ color: T.textSoft }}>
                          {/* DURATA — clic per modificare */}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {inMod("durata") ? (
                              <input
                                autoFocus
                                type="number"
                                min="5"
                                step="5"
                                value={s.durata}
                                onChange={(e) => aggiornaServizio(s.id, "durata", e.target.value)}
                                onBlur={() => setModificaServizio(null)}
                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setModificaServizio(null); }}
                                style={{
                                  fontFamily: "inherit",
                                  background: "transparent",
                                  color: T.text,
                                  border: `1px solid ${T.accent}`,
                                  outline: "none",
                                  width: 60,
                                  padding: "2px 6px",
                                  fontSize: 14,
                                }}
                              />
                            ) : (
                              <span
                                onClick={() => setModificaServizio({ id: s.id, campo: "durata" })}
                                className="cursor-pointer"
                                style={{ borderBottom: `1px dashed ${T.borderStrong}` }}
                              >
                                {s.durata} min
                              </span>
                            )}
                          </span>

                          {/* PREZZO — clic per modificare */}
                          {inMod("prezzo") ? (
                            <span style={{ color: T.accent, display: "flex", alignItems: "center", gap: 2 }}>
                              €
                              <input
                                autoFocus
                                type="number"
                                min="0"
                                step="1"
                                value={s.prezzo}
                                onChange={(e) => aggiornaServizio(s.id, "prezzo", e.target.value)}
                                onBlur={() => setModificaServizio(null)}
                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setModificaServizio(null); }}
                                style={{
                                  fontFamily: "inherit",
                                  background: "transparent",
                                  color: T.accent,
                                  border: `1px solid ${T.accent}`,
                                  outline: "none",
                                  width: 70,
                                  padding: "2px 6px",
                                  fontSize: 14,
                                }}
                              />
                            </span>
                          ) : (
                            <span
                              onClick={() => setModificaServizio({ id: s.id, campo: "prezzo" })}
                              className="cursor-pointer"
                              style={{ color: T.accent, borderBottom: `1px dashed ${T.accent}` }}
                            >
                              €{s.prezzo}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => eliminaServizio(s.id)}
                          className="p-2 rounded transition"
                          style={{ color: T.danger }}
                          title="Elimina"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs mt-4" style={{ color: T.textMuted, fontStyle: "italic" }}>
                💡 Tocca direttamente nome, durata o prezzo per modificarli. Premi Invio o tocca fuori per salvare.
              </p>
            </div>
          )}

          {/* STAFF */}
          {sezione === "staff" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="text-sm tracking-widest" style={{ color: T.textSoft, letterSpacing: "0.15em" }}>
                  {staff.length} / {MAX_STAFF} MEMBRI · TOCCA PER MODIFICARE
                </div>
                <button
                  onClick={nuovoStaff}
                  disabled={staff.length >= MAX_STAFF}
                  className="flex items-center gap-2 px-4 py-2 text-xs tracking-widest disabled:opacity-40"
                  style={{ backgroundColor: T.dark, color: T.bg, letterSpacing: "0.15em" }}
                >
                  <Plus className="w-4 h-4" /> NUOVO
                </button>
              </div>
              {staff.length >= MAX_STAFF && (
                <div className="mb-4 p-3 text-sm border" style={{ backgroundColor: T.accentSoft, borderColor: T.accent, color: T.textSoft }}>
                  Hai raggiunto il limite di {MAX_STAFF} operatori.
                </div>
              )}
              <div className="grid md:grid-cols-3 gap-3">
                {staff.map(s => {
                  const inMod = (campo) => modificaStaff?.id === s.id && modificaStaff?.campo === campo;

                  return (
                    <div key={s.id} className="p-5 border text-center relative" style={{ backgroundColor: T.card, borderColor: T.border }}>
                      {/* Bottone elimina (in alto a destra) */}
                      <button
                        onClick={(e) => { e.stopPropagation(); eliminaStaff(s.id); }}
                        className="absolute top-2 right-2 p-1.5 rounded transition"
                        style={{ color: T.danger, zIndex: 10 }}
                        title="Elimina operatore"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Foto o iniziali — clicca SOLO sul cerchio per caricare foto */}
                      <div className="flex justify-center mb-3">
                        <label className="cursor-pointer relative group" style={{ display: "inline-block" }}>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              uploadFoto(e.target.files[0], async (dataUrl) => {
                                const nuovoStaff = staff.map(x => x.id === s.id ? { ...x, foto: dataUrl } : x);
                                setStaff(nuovoStaff);
                                if (salone.dbId) {
                                  await supabase.from("saloni").update({ staff: nuovoStaff }).eq("id", salone.dbId);
                                }
                              });
                            }}
                          />
                          {s.foto ? (
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2" style={{ borderColor: s.colore }}>
                              <img src={s.foto} alt={s.nome} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl" style={{ backgroundColor: s.colore }}>
                              {s.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                          )}
                          {/* Overlay camera visibile solo su hover */}
                          <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.35)" }}>
                            <Camera className="w-5 h-5 text-white" />
                          </div>
                        </label>
                      </div>

                      {/* NOME — clic per modificare */}
                      {inMod("nome") ? (
                        <input
                          autoFocus
                          type="text"
                          value={s.nome}
                          onChange={(e) => aggiornaStaff(s.id, "nome", e.target.value)}
                          onBlur={() => setModificaStaff(null)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setModificaStaff(null); }}
                          style={{
                            fontSize: 16,
                            fontFamily: "inherit",
                            background: "transparent",
                            color: T.text,
                            border: "none",
                            borderBottom: `2px solid ${T.accent}`,
                            outline: "none",
                            width: "100%",
                            textAlign: "center",
                            padding: "2px 0",
                          }}
                        />
                      ) : (
                        <div
                          onClick={() => setModificaStaff({ id: s.id, campo: "nome" })}
                          className="cursor-pointer inline-block"
                          style={{ borderBottom: `1px dashed ${T.border}` }}
                          title="Tocca per modificare"
                        >
                          {s.nome}
                        </div>
                      )}

                      {/* RUOLO — clic per modificare */}
                      <div className="mt-1">
                        {inMod("ruolo") ? (
                          <input
                            autoFocus
                            type="text"
                            value={s.ruolo}
                            onChange={(e) => aggiornaStaff(s.id, "ruolo", e.target.value)}
                            onBlur={() => setModificaStaff(null)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setModificaStaff(null); }}
                            style={{
                              fontSize: 12,
                              fontFamily: "inherit",
                              background: "transparent",
                              color: T.textMuted,
                              border: "none",
                              borderBottom: `1px solid ${T.accent}`,
                              outline: "none",
                              width: "80%",
                              textAlign: "center",
                              padding: "2px 0",
                            }}
                          />
                        ) : (
                          <span
                            onClick={() => setModificaStaff({ id: s.id, campo: "ruolo" })}
                            className="text-xs cursor-pointer"
                            style={{ color: T.textMuted, borderBottom: `1px dashed ${T.borderStrong}` }}
                            title="Tocca per modificare"
                          >
                            {s.ruolo}
                          </span>
                        )}
                      </div>

                      {/* Bottone rimuovi foto (solo se c'è una foto) */}
                      {s.foto && (
                        <button
                          onClick={async () => {
                            const nuovoStaff = staff.map(x => x.id === s.id ? { ...x, foto: null } : x);
                            setStaff(nuovoStaff);
                            if (salone.dbId) {
                              await supabase.from("saloni").update({ staff: nuovoStaff }).eq("id", salone.dbId);
                            }
                          }}
                          className="text-xs tracking-widest mt-3"
                          style={{ color: T.textMuted, letterSpacing: "0.15em" }}
                        >
                          RIMUOVI FOTO
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs mt-4 text-center" style={{ color: T.textMuted, fontStyle: "italic" }}>
                💡 Tocca foto, nome o ruolo per modificarli. Premi Invio o tocca fuori per salvare.
              </p>
            </div>
          )}

          {/* RECENSIONI */}
          {sezione === "recensioni" && (
            <div>
              {/* Statistiche in alto */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="p-4 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                  <div className="text-xs tracking-widest" style={{ color: T.textMuted, letterSpacing: "0.15em" }}>MEDIA</div>
                  <div className="text-2xl mt-1 flex items-center gap-1">
                    {recensioni.length > 0 ? (recensioni.reduce((s, r) => s + r.stelle, 0) / recensioni.length).toFixed(1) : "—"}
                    <Star className="w-4 h-4" style={{ fill: T.accent, color: T.accent }} />
                  </div>
                </div>
                <div className="p-4 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                  <div className="text-xs tracking-widest" style={{ color: T.textMuted, letterSpacing: "0.15em" }}>TOTALI</div>
                  <div className="text-2xl mt-1">{recensioni.length}</div>
                </div>
                <div className="p-4 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                  <div className="text-xs tracking-widest" style={{ color: T.textMuted, letterSpacing: "0.15em" }}>DA RISPONDERE</div>
                  <div className="text-2xl mt-1" style={{ color: T.accent }}>{recensioni.filter(r => !r.rispostaProprietario).length}</div>
                </div>
                <div className="p-4 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                  <div className="text-xs tracking-widest" style={{ color: T.textMuted, letterSpacing: "0.15em" }}>SEGNALATE</div>
                  <div className="text-2xl mt-1" style={{ color: T.danger }}>{recensioni.filter(r => r.segnalata).length}</div>
                </div>
              </div>

              {/* Info sul funzionamento */}
              <div className="p-4 mb-5 border text-xs" style={{ backgroundColor: T.accentSoft, borderColor: T.accent, color: T.textSoft, lineHeight: 1.6 }}>
                💡 <strong style={{ color: T.text }}>Come funzionano le recensioni:</strong> sono <strong>pubblicate automaticamente</strong> appena il cliente le invia. Tu puoi <strong>rispondere pubblicamente</strong> per mostrare professionalità, oppure <strong>segnalarle</strong> a Prenoty se sono offensive, false o spam (Prenoty le valuterà).
              </div>

              {/* Lista recensioni */}
              <div className="space-y-3">
                {recensioni.length === 0 ? (
                  <div className="p-12 border text-center" style={{ backgroundColor: T.card, borderColor: T.border, color: T.textMuted }}>
                    <Star className="w-8 h-8 mx-auto mb-2" />
                    <div>Ancora nessuna recensione ricevuta.</div>
                  </div>
                ) : (
                  recensioni.map(r => (
                    <div key={r.id} className="p-5 border" style={{ backgroundColor: r.nascosta ? "rgba(150,150,150,0.05)" : T.card, borderColor: r.segnalata ? T.danger : T.border, borderWidth: r.segnalata ? "2px" : "1px", opacity: r.nascosta ? 0.65 : 1 }}>
                      {/* Header recensione */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-sm font-medium">{r.nome}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map(n => (
                                <Star key={n} className="w-3 h-3" style={{ fill: n <= r.stelle ? T.accent : "transparent", color: T.accent }} />
                              ))}
                            </div>
                            <span className="text-xs" style={{ color: T.textMuted }}>{r.data}</span>
                          </div>
                        </div>
                        {r.nascosta && (
                          <div className="text-xs px-2 py-1" style={{ backgroundColor: "rgba(100,100,100,0.1)", color: T.textMuted, border: `1px solid ${T.border}` }}>
                            🚫 NASCOSTA DA PRENOTY
                          </div>
                        )}
                        {r.segnalata && !r.nascosta && (
                          <div className="text-xs px-2 py-1" style={{ backgroundColor: T.dangerSoft, color: T.danger, border: `1px solid ${T.danger}` }}>
                            ⚠ SEGNALATA
                          </div>
                        )}
                      </div>

                      {/* Testo recensione */}
                      <p className="text-sm leading-relaxed mb-4" style={{ color: T.textSoft }}>"{r.testo}"</p>

                      {/* Risposta proprietario (se c'è) */}
                      {r.rispostaProprietario && (
                        <div className="p-3 mb-3 border-l-2" style={{ borderColor: T.accent, backgroundColor: T.accentSoft }}>
                          <div className="text-xs tracking-widest mb-1" style={{ color: T.accent, letterSpacing: "0.15em" }}>LA TUA RISPOSTA</div>
                          <p className="text-sm" style={{ color: T.text }}>{r.rispostaProprietario}</p>
                          <button
                            onClick={() => eliminaRisposta(r.id)}
                            className="text-xs mt-2 underline"
                            style={{ color: T.textMuted }}
                          >
                            Modifica/Elimina risposta
                          </button>
                        </div>
                      )}

                      {/* Form risposta (se non ha ancora risposto) */}
                      {!r.rispostaProprietario && (
                        <div className="space-y-2">
                          <textarea
                            value={risposteInCorso[r.id] || ""}
                            onChange={(e) => setRisposteInCorso({ ...risposteInCorso, [r.id]: e.target.value })}
                            placeholder="Scrivi una risposta pubblica..."
                            rows={2}
                            className="w-full p-2 border outline-none text-sm resize-none"
                            style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text, fontFamily: "inherit" }}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => inviaRisposta(r.id)}
                              disabled={!risposteInCorso[r.id]?.trim()}
                              className="px-4 py-2 text-xs tracking-widest disabled:opacity-30"
                              style={{ backgroundColor: T.accent, color: "#fff", letterSpacing: "0.15em" }}
                            >
                              PUBBLICA RISPOSTA
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Azioni inferiori */}
                      <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: `1px solid ${T.border}` }}>
                        <span className="text-xs" style={{ color: T.textMuted }}>
                          ✓ Pubblicata sulla vetrina
                        </span>
                        <button
                          onClick={() => segnalaRecensione(r.id)}
                          className="text-xs tracking-widest px-3 py-1 border"
                          style={{
                            borderColor: r.segnalata ? T.danger : T.border,
                            color: r.segnalata ? T.danger : T.textSoft,
                            letterSpacing: "0.15em",
                          }}
                        >
                          {r.segnalata ? "✓ SEGNALATA" : "🚩 SEGNALA"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* REPORT */}
          {sezione === "report" && (() => {
            // Filtra per mese selezionato (usa data appuntamento)
            const prenMese = prenotazioni.filter(p => {
              if (!p.data) return false;
              const d = new Date(p.data);
              return d.getMonth() === meseReport.mese && d.getFullYear() === meseReport.anno;
            });
            const incassoSelMese = prenMese.reduce((s, p) => s + (p.prezzo || 0), 0);
            const clientiMese = new Set(prenMese.map(p => p.tel)).size;

            const conteggioServizi = prenMese.reduce((acc, p) => {
              const nome = p.servizio || "—";
              acc[nome] = (acc[nome] || 0) + 1;
              return acc;
            }, {});
            const serviziOrdinati = Object.entries(conteggioServizi).sort((a, b) => b[1] - a[1]).slice(0, 5);
            const maxCount = serviziOrdinati[0]?.[1] || 1;

            return (
              <div className="space-y-6">
                {/* Navigazione mese */}
                <div className="flex flex-col gap-3">
                  {/* Selettori mese + anno */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={meseReport.mese}
                      onChange={e => setMeseReport(m => ({ ...m, mese: Number(e.target.value) }))}
                      className="flex-1 md:flex-none md:w-auto min-w-[130px] px-3 py-2 text-sm border outline-none"
                      style={{ borderColor: T.border, background: T.card, color: T.text, borderRadius: 8 }}
                    >
                      {nomiMesi.map((n, i) => <option key={i} value={i}>{n}</option>)}
                    </select>
                    <select
                      value={meseReport.anno}
                      onChange={e => setMeseReport(m => ({ ...m, anno: Number(e.target.value) }))}
                      className="px-3 py-2 text-sm border outline-none"
                      style={{ borderColor: T.border, background: T.card, color: T.text, borderRadius: 8 }}
                    >
                      {Array.from({ length: 5 }, (_, i) => oggi.getFullYear() - 4 + i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    {isMeseCorrente && <span className="text-xs px-2 py-1 rounded-full" style={{ background: T.accentSoft, color: T.accent }}>mese in corso</span>}
                  </div>
                  {/* Frecce navigazione */}
                  <div className="flex items-center justify-between">
                    <button onClick={mesePrec} className="flex items-center gap-2 px-4 py-2 border text-sm transition" style={{ borderColor: T.border, color: T.text, borderRadius: 8 }}>
                      <ChevronLeft className="w-4 h-4" /> Prec.
                    </button>
                    <div className="text-center">
                      <div className="text-lg font-semibold" style={{ color: T.text }}>{nomiMesi[meseReport.mese]} {meseReport.anno}</div>
                    </div>
                    <button onClick={meseSucc} disabled={isMeseCorrente} className="flex items-center gap-2 px-4 py-2 border text-sm transition disabled:opacity-30" style={{ borderColor: T.border, color: T.text, borderRadius: 8 }}>
                      Succ. <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* KPI mese selezionato */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { lbl: "INCASSO MESE", val: `€${incassoSelMese}`, icon: Euro },
                    { lbl: "APPUNTAMENTI", val: prenMese.length, icon: Calendar },
                    { lbl: "CLIENTI UNICI", val: clientiMese, icon: Users },
                  ].map((s, i) => {
                    const Ic = s.icon;
                    return (
                      <div key={i} className="p-5 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Ic className="w-4 h-4" style={{ color: T.accent }} />
                          <div className="text-xs tracking-widest" style={{ color: T.textMuted, letterSpacing: "0.15em" }}>{s.lbl}</div>
                        </div>
                        <div className="text-3xl font-semibold" style={{ color: T.accent }}>{s.val}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Servizi più richiesti nel mese */}
                <div className="p-6 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                  <h3 className="text-sm tracking-widest mb-4" style={{ color: T.textSoft, letterSpacing: "0.15em" }}>SERVIZI PIÙ RICHIESTI</h3>
                  <div className="space-y-3">
                    {serviziOrdinati.length === 0 ? (
                      <p className="text-sm text-center py-8" style={{ color: T.textMuted, fontStyle: "italic" }}>
                        Nessuna prenotazione in {nomiMesi[meseReport.mese]} {meseReport.anno}.
                      </p>
                    ) : (
                      serviziOrdinati.map(([nome, count]) => (
                        <div key={nome}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{nome}</span>
                            <span style={{ color: T.textMuted }}>{count} {count === 1 ? "prenotazione" : "prenotazioni"}</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: T.border }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${Math.round((count / maxCount) * 100)}%`, backgroundColor: T.accent }} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Confronto mesi — ultimi 6 */}
                {(() => {
                  const ultimi6 = Array.from({ length: 6 }, (_, i) => {
                    const d = new Date(oggi.getFullYear(), oggi.getMonth() - (5 - i), 1);
                    return { mese: d.getMonth(), anno: d.getFullYear(), label: nomiMesi[d.getMonth()].slice(0, 3) };
                  });
                  const maxInc = Math.max(...ultimi6.map(m => prenotazioni.filter(p => { if (!p.data) return false; const d = new Date(p.data); return d.getMonth() === m.mese && d.getFullYear() === m.anno; }).reduce((s, p) => s + (p.prezzo || 0), 0)), 1);
                  return (
                    <div className="p-6 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                      <h3 className="text-sm tracking-widest mb-5" style={{ color: T.textSoft, letterSpacing: "0.15em" }}>CONFRONTO ULTIMI 6 MESI</h3>
                      <div className="flex items-end gap-2 h-24">
                        {ultimi6.map((m, i) => {
                          const inc = prenotazioni.filter(p => { if (!p.data) return false; const d = new Date(p.data); return d.getMonth() === m.mese && d.getFullYear() === m.anno; }).reduce((s, p) => s + (p.prezzo || 0), 0);
                          const isSelected = m.mese === meseReport.mese && m.anno === meseReport.anno;
                          const h = Math.max(Math.round((inc / maxInc) * 80), inc > 0 ? 8 : 2);
                          return (
                            <button key={i} onClick={() => setMeseReport({ mese: m.mese, anno: m.anno })} className="flex-1 flex flex-col items-center gap-1" title={`${nomiMesi[m.mese]} ${m.anno}: €${inc}`}>
                              <span className="text-xs" style={{ color: T.textMuted }}>€{inc > 999 ? `${Math.round(inc/1000)}k` : inc}</span>
                              <div className="w-full rounded-t-sm transition-all" style={{ height: h, backgroundColor: isSelected ? T.accent : T.border }} />
                              <span className="text-xs" style={{ color: isSelected ? T.accent : T.textMuted, fontWeight: isSelected ? 700 : 400 }}>{m.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })()}

          {/* IMPOSTAZIONI */}
          {sezione === "impostazioni" && (
            <div className="space-y-6">

              {/* IL TUO LINK DI PRENOTAZIONE */}
              {salone.slug && (
                <div className="p-6 border" style={{ backgroundColor: T.card, borderColor: T.accent, borderWidth: 2, borderRadius: 14 }}>
                  <h3 className="text-sm tracking-widest mb-1 flex items-center gap-2" style={{ color: T.accent, letterSpacing: "0.15em" }}>
                    <Link className="w-4 h-4" /> IL TUO LINK DI PRENOTAZIONE
                  </h3>
                  <p className="text-xs mb-3" style={{ color: T.textMuted }}>Condividi questo link con i tuoi clienti per ricevere prenotazioni online</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 text-sm" style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.accent, fontFamily: "monospace", borderRadius: 8, wordBreak: "break-all" }}>
                      {`https://prenoty.com/${salone.slug}`}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://prenoty.com/${salone.slug}`);
                        setLinkCopiato(true);
                        setTimeout(() => setLinkCopiato(false), 2500);
                      }}
                      className="px-4 py-3 text-xs tracking-widest flex-shrink-0 flex items-center gap-1.5"
                      style={{ background: linkCopiato ? "#27ae60" : T.accent, color: "#fff", border: "none", cursor: "pointer", borderRadius: 8, letterSpacing: "0.15em", transition: "background 0.2s" }}
                    >
                      {linkCopiato ? <><Check className="w-3.5 h-3.5" /> COPIATO</> : <><Copy className="w-3.5 h-3.5" /> COPIA</>}
                    </button>
                  </div>
                </div>
              )}

              {/* TIPO DI ATTIVITÀ — primo blocco perché è la scelta più importante */}
              <div className="p-6 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                <h3 className="text-sm tracking-widest mb-1" style={{ color: T.textSoft, letterSpacing: "0.15em" }}>TIPO DI ATTIVITÀ</h3>
                <p className="text-xs mb-4" style={{ color: T.textMuted }}>Determina servizi predefiniti, etichette e tagline mostrate ai clienti</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(CONFIG_ATTIVITA).map(([key, conf]) => {
                    const Ic = conf.icona;
                    const attivo = tipoAttivita === key;
                    return (
                      <button
                        key={key}
                        onClick={() => cambiaTipoAttivita(key)}
                        className="p-4 border transition flex flex-col items-center gap-2"
                        style={{
                          backgroundColor: attivo ? T.accentSoft : T.card,
                          borderColor: attivo ? T.accent : T.border,
                          borderWidth: attivo ? "2px" : "1px",
                          color: T.text,
                        }}
                      >
                        <Ic className="w-6 h-6" style={{ color: attivo ? T.accent : T.textSoft }} />
                        <div className="text-sm">{conf.nome}</div>
                        {attivo && (
                          <div className="text-xs tracking-widest" style={{ color: T.accent, letterSpacing: "0.15em" }}>ATTIVO</div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs mt-3" style={{ color: T.textMuted, fontStyle: "italic" }}>
                  💡 Cambiando attività verranno ricaricati i servizi predefiniti. Le altre impostazioni restano invariate.
                </p>
              </div>

              <div className="p-6 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                <h3 className="text-sm tracking-widest mb-4" style={{ color: T.textSoft, letterSpacing: "0.15em" }}>{tipoAttivita === "generico" ? "DATI ATTIVITÀ" : "DATI SALONE"}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>{tipoAttivita === "generico" ? "NOME ATTIVITÀ" : "NOME SALONE"}</label>
                    <input
                      type="text"
                      value={salone.nome}
                      onChange={(e) => {
                        const nuovoNome = e.target.value;
                        const nuovoSlug = nuovoNome.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
                        setSalone({ ...salone, nome: nuovoNome, slug: nuovoSlug });
                      }}
                      className="w-full mt-1 p-3 border outline-none"
                      style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text }}
                    />
                  </div>
                  <div style={{ position: "relative" }}>
                    <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>INDIRIZZO</label>
                    <input
                      type="text"
                      value={salone.indirizzo}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSalone({ ...salone, indirizzo: val });
                        if (val.length < 3) { setSuggerimentiIndirizzo([]); return; }
                        clearTimeout(window._addrTimer);
                        window._addrTimer = setTimeout(async () => {
                          try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=5&addressdetails=1`, { headers: { "Accept-Language": "it" } });
                            const data = await res.json();
                            setSuggerimentiIndirizzo(data.map(d => d.display_name));
                          } catch {}
                        }, 400);
                      }}
                      onBlur={() => setTimeout(() => setSuggerimentiIndirizzo([]), 200)}
                      className="w-full mt-1 p-3 border outline-none"
                      style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text }}
                      placeholder="Es: Via Roma 12, Milano"
                      autoComplete="off"
                    />
                    {suggerimentiIndirizzo.length > 0 && (
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, background: T.card, border: `1px solid ${T.border}`, borderTop: "none", maxHeight: 220, overflowY: "auto" }}>
                        {suggerimentiIndirizzo.map((s, i) => (
                          <div
                            key={i}
                            onMouseDown={() => { setSalone(prev => ({ ...prev, indirizzo: s })); setSuggerimentiIndirizzo([]); }}
                            style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", borderBottom: `1px solid ${T.border}`, color: T.text, lineHeight: 1.4 }}
                            onMouseEnter={e => e.currentTarget.style.background = T.hover}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            {s}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>TELEFONO</label>
                    <input
                      type="tel"
                      value={salone.telefono}
                      onChange={(e) => setSalone({ ...salone, telefono: e.target.value })}
                      className="w-full mt-1 p-3 border outline-none"
                      style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text }}
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>LOGO</label>
                    <label className="mt-2 block cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          uploadFoto(e.target.files[0], (dataUrl) => {
                            setSalone({ ...salone, logo: dataUrl });
                          }, 400);
                        }}
                      />
                      {salone.logo ? (
                        <div className="flex items-center gap-4 p-4 border" style={{ borderColor: T.border, backgroundColor: T.bg }}>
                          <img src={salone.logo} alt="Logo" className="w-16 h-16 object-contain" />
                          <div className="flex-1">
                            <div className="text-sm">Logo caricato</div>
                            <div className="text-xs mt-1" style={{ color: T.accent }}>Clicca per cambiare</div>
                          </div>
                          <button
                            onClick={(e) => { e.preventDefault(); setSalone({ ...salone, logo: null }); }}
                            className="text-xs tracking-widest"
                            style={{ color: T.danger, letterSpacing: "0.15em" }}
                          >
                            RIMUOVI
                          </button>
                        </div>
                      ) : (
                        <div className="p-6 border-2 border-dashed text-center transition hover:opacity-70" style={{ borderColor: T.border, color: T.textMuted }}>
                          <div className="text-sm">Tocca qui per caricare il logo</div>
                          <div className="text-xs mt-1" style={{ color: T.textMuted }}>PNG, JPG · ottimizzato automaticamente</div>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* BOTTONE SALVA */}
                  <button
                    onClick={salvaSalone}
                    disabled={salvataggioStato === "salvataggio"}
                    className="w-full py-3 text-sm tracking-widest mt-2"
                    style={{
                      backgroundColor: salvataggioStato === "ok" ? "#27ae60" : T.accent,
                      color: "#fff",
                      border: "none",
                      cursor: salvataggioStato === "salvataggio" ? "wait" : "pointer",
                      letterSpacing: "0.15em",
                      opacity: salvataggioStato === "salvataggio" ? 0.7 : 1,
                    }}
                  >
                    {salvataggioStato === "salvataggio" ? "SALVATAGGIO..." : salvataggioStato === "ok" ? "✓ SALVATO" : salvataggioStato === "errore" ? "ERRORE — RIPROVA" : "SALVA IMPOSTAZIONI"}
                  </button>
                </div>
              </div>

              <div className="p-6 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                <h3 className="text-sm tracking-widest mb-1" style={{ color: T.textSoft, letterSpacing: "0.15em" }}>VETRINA PUBBLICA</h3>
                <p className="text-xs mb-4" style={{ color: T.textMuted }}>Tutto quello che il cliente vede sulla pagina di prenotazione</p>

                {/* DESCRIZIONE */}
                <div className="mb-5">
                  <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>DESCRIZIONE DEL SALONE</label>
                  <textarea
                    value={salone.descrizione}
                    onChange={(e) => setSalone({ ...salone, descrizione: e.target.value })}
                    rows={3}
                    placeholder="Racconta il tuo salone in 2-3 righe..."
                    className="w-full mt-1 p-3 border outline-none resize-none"
                    style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text, fontFamily: "inherit", fontSize: 14 }}
                  />
                  <div className="text-xs mt-1" style={{ color: T.textMuted }}>{salone.descrizione.length} / 300 caratteri</div>
                </div>

                {/* EMAIL */}
                <div className="mb-5">
                  <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>EMAIL DI CONTATTO</label>
                  <input
                    type="email"
                    value={salone.email}
                    onChange={(e) => setSalone({ ...salone, email: e.target.value })}
                    placeholder="info@tuosalone.it"
                    className="w-full mt-1 p-3 border outline-none"
                    style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text }}
                  />
                </div>

                {/* FOTO DI COPERTINA */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>FOTO DI COPERTINA</label>
                    {salone.copertina && (
                      <div className="flex gap-4">
                        <label className="cursor-pointer text-xs tracking-widest" style={{ color: T.accent, letterSpacing: "0.15em" }}>
                          <input type="file" accept="image/*" className="hidden"
                            onChange={(e) => {
                              uploadFoto(e.target.files[0], (dataUrl) => {
                                setSalone(prev => ({ ...prev, copertina: dataUrl }));
                              }, 1400);
                            }}
                          />
                          CAMBIA
                        </label>
                        <button
                          onClick={() => setSalone(prev => ({ ...prev, copertina: null, copertina_y: 50 }))}
                          className="text-xs tracking-widest"
                          style={{ color: T.danger, background: "none", border: "none", cursor: "pointer", letterSpacing: "0.15em" }}
                        >
                          RIMUOVI
                        </button>
                      </div>
                    )}
                  </div>

                  {salone.copertina ? (
                    <div
                      className="relative w-full overflow-hidden select-none border"
                      style={{ aspectRatio: "820 / 312", borderColor: T.border, cursor: "ns-resize" }}
                      onMouseDown={(e) => {
                        const startY = e.clientY;
                        const startVal = salone.copertina_y;
                        const h = e.currentTarget.getBoundingClientRect().height;
                        const onMove = (ev) => {
                          const delta = ((ev.clientY - startY) / h) * 100 * 2;
                          setSalone(prev => ({ ...prev, copertina_y: Math.min(100, Math.max(0, Math.round(startVal - delta))) }));
                        };
                        const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
                        window.addEventListener("mousemove", onMove);
                        window.addEventListener("mouseup", onUp);
                      }}
                      onTouchStart={(e) => {
                        const startY = e.touches[0].clientY;
                        const startVal = salone.copertina_y;
                        const h = e.currentTarget.getBoundingClientRect().height;
                        const onMove = (ev) => {
                          ev.preventDefault();
                          const delta = ((ev.touches[0].clientY - startY) / h) * 100 * 2;
                          setSalone(prev => ({ ...prev, copertina_y: Math.min(100, Math.max(0, Math.round(startVal - delta))) }));
                        };
                        const onEnd = () => { window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onEnd); };
                        window.addEventListener("touchmove", onMove, { passive: false });
                        window.addEventListener("touchend", onEnd);
                      }}
                    >
                      <img
                        src={salone.copertina}
                        alt="Copertina"
                        className="w-full h-full object-cover pointer-events-none"
                        style={{ objectPosition: `center ${salone.copertina_y}%` }}
                        draggable={false}
                      />
                      <div className="absolute bottom-2 left-3 text-xs pointer-events-none" style={{ color: "rgba(255,255,255,0.9)", letterSpacing: "0.05em", textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>
                        ↕ Trascina per riposizionare
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => {
                          uploadFoto(e.target.files[0], (dataUrl) => {
                            setSalone(prev => ({ ...prev, copertina: dataUrl, copertina_y: 50 }));
                          }, 1400);
                        }}
                      />
                      <div className="p-8 border-2 border-dashed text-center transition hover:opacity-70" style={{ borderColor: T.border, color: T.textMuted }}>
                        <div className="text-2xl mb-2">🖼</div>
                        <div className="text-sm">Tocca per caricare la foto di copertina</div>
                        <div className="text-xs mt-1">Formato orizzontale consigliato · ottimizzata automaticamente</div>
                      </div>
                    </label>
                  )}
                </div>

                {/* GALLERIA */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>GALLERIA FOTO ({salone.galleria.length}/6)</label>
                    {salone.galleria.length < 6 && (
                      <label className="cursor-pointer text-xs tracking-widest flex items-center gap-1" style={{ color: T.accent, letterSpacing: "0.15em" }}>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            uploadFoto(e.target.files[0], (dataUrl) => {
                              setSalone({ ...salone, galleria: [...salone.galleria, { url: dataUrl, y: 50 }] });
                            });
                          }}
                        />
                        <Plus className="w-3 h-3" /> AGGIUNGI
                      </label>
                    )}
                  </div>
                  {salone.galleria.length === 0 ? (
                    <div className="p-6 border-2 border-dashed text-center" style={{ borderColor: T.border, color: T.textMuted }}>
                      <Camera className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm">Nessuna foto caricata</div>
                      <div className="text-xs mt-1">Mostra il salone, i lavori, l'ambiente</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {salone.galleria.map((foto, i) => {
                        const fotoUrl = typeof foto === "string" ? foto : foto.url;
                        const fotoY = typeof foto === "object" ? (foto.y ?? 50) : 50;
                        return (
                          <div
                            key={i}
                            className="relative aspect-square overflow-hidden border select-none"
                            style={{ borderColor: T.border, cursor: "ns-resize" }}
                            onMouseDown={(e) => {
                              const startY = e.clientY;
                              const startVal = fotoY;
                              const h = e.currentTarget.getBoundingClientRect().height;
                              const onMove = (ev) => {
                                const delta = ((ev.clientY - startY) / h) * 100 * 2;
                                setSalone(prev => ({
                                  ...prev,
                                  galleria: prev.galleria.map((f, idx) => {
                                    if (idx !== i) return f;
                                    const obj = typeof f === "string" ? { url: f, y: 50 } : { ...f };
                                    return { ...obj, y: Math.min(100, Math.max(0, Math.round(startVal - delta))) };
                                  })
                                }));
                              };
                              const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
                              window.addEventListener("mousemove", onMove);
                              window.addEventListener("mouseup", onUp);
                            }}
                            onTouchStart={(e) => {
                              const startY = e.touches[0].clientY;
                              const startVal = fotoY;
                              const h = e.currentTarget.getBoundingClientRect().height;
                              const onMove = (ev) => {
                                ev.preventDefault();
                                const delta = ((ev.touches[0].clientY - startY) / h) * 100 * 2;
                                setSalone(prev => ({
                                  ...prev,
                                  galleria: prev.galleria.map((f, idx) => {
                                    if (idx !== i) return f;
                                    const obj = typeof f === "string" ? { url: f, y: 50 } : { ...f };
                                    return { ...obj, y: Math.min(100, Math.max(0, Math.round(startVal - delta))) };
                                  })
                                }));
                              };
                              const onEnd = () => { window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onEnd); };
                              window.addEventListener("touchmove", onMove, { passive: false });
                              window.addEventListener("touchend", onEnd);
                            }}
                          >
                            <img
                              src={fotoUrl}
                              alt={`Foto ${i + 1}`}
                              className="w-full h-full object-cover pointer-events-none"
                              style={{ objectPosition: `center ${fotoY}%` }}
                              draggable={false}
                            />
                            <button
                              onClick={(e) => { e.stopPropagation(); setSalone({ ...salone, galleria: salone.galleria.filter((_, idx) => idx !== i) }); }}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#fff" }}
                              title="Rimuovi"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <div className="absolute bottom-1 left-0 right-0 text-center pointer-events-none" style={{ color: "rgba(255,255,255,0.85)", textShadow: "0 1px 3px rgba(0,0,0,0.9)", fontSize: "10px" }}>↕</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* SOCIAL */}
                <div className="mb-5">
                  <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>LINK SOCIAL</label>
                  <div className="space-y-2 mt-2">
                    {[
                      { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/tuosalone", svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
                      { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/tuosalone", svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                      { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@tuosalone", svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z"/></svg> },
                      { key: "sito", label: "Sito web", placeholder: "https://tuosito.it", svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
                    ].map(s => (
                      <div key={s.key} className="flex items-center gap-2">
                        <span style={{ color: T.textMuted, flexShrink: 0 }}>{s.svg}</span>
                        <input
                          type="url"
                          value={salone.social?.[s.key] || ""}
                          onChange={(e) => setSalone({ ...salone, social: { ...salone.social, [s.key]: e.target.value } })}
                          placeholder={s.placeholder}
                          className="flex-1 p-2 border outline-none text-sm"
                          style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* SUONO NOTIFICHE */}
                <div>
                  <div className="text-xs tracking-widest mb-3" style={{ color: T.textMuted, letterSpacing: "0.15em" }}>SUONO NOTIFICHE</div>
                  <div className="grid grid-cols-5 gap-2">
                    {SUONI.map(s => {
                      const Icona = s.Icon;
                      const attivo = salone.suonoNotifica === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={async () => {
                            setSalone({ ...salone, suonoNotifica: s.id });
                            await suonaCampanella(s.id);
                            if (salone.dbId) {
                              await supabase.from("saloni").update({ suono_notifica: s.id }).eq("id", salone.dbId);
                            }
                          }}
                          className="flex flex-col items-center gap-2 py-3 border transition"
                          style={{
                            borderColor: attivo ? T.accent : T.border,
                            borderWidth: attivo ? 2 : 1,
                            backgroundColor: attivo ? T.accentSoft : T.card,
                            borderRadius: 10,
                          }}
                        >
                          <Icona className="w-4 h-4" style={{ color: attivo ? T.accent : T.textMuted }} />
                          <span style={{ fontSize: 11, color: attivo ? T.accent : T.textMuted }}>{s.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs mt-2" style={{ color: T.textMuted }}>Clicca per ascoltare l'anteprima · salvato automaticamente</p>
                </div>

                {/* INTERRUTTORI VISIBILITÀ */}
                <div>
                  <div className="text-xs tracking-widest mb-3" style={{ color: T.textMuted, letterSpacing: "0.15em" }}>COSA MOSTRARE AL CLIENTE</div>
                  <div className="space-y-1">
                    {[
                      { key: "mostraRecensioni", lbl: "Recensioni e valutazioni", sub: `Media ${mediaStelle} · ${recensioni.length} recensioni` },
                      { key: "mostraMappa", lbl: "Mappa e indirizzo", sub: salone.indirizzo },
                      { key: "mostraOrari", lbl: "Orari di apertura", sub: "Tutti i giorni della settimana" },
                      { key: "mostraGalleria", lbl: "Galleria foto", sub: `${salone.galleria.length} foto caricate` },
                      { key: "mostraSocial", lbl: "Link social", sub: "Camera, TikTok, Globe, sito" },
                    ].map(t => (
                      <label key={t.key} className="flex items-center justify-between cursor-pointer py-2">
                        <div className="flex-1 pr-3">
                          <div className="text-sm">{t.lbl}</div>
                          <div className="text-xs mt-0.5" style={{ color: T.textMuted }}>{t.sub}</div>
                        </div>
                        <button
                          onClick={() => setSalone({ ...salone, [t.key]: !salone[t.key] })}
                          className="w-10 h-6 rounded-full relative transition flex-shrink-0"
                          style={{ backgroundColor: salone[t.key] ? T.accent : T.border }}
                        >
                          <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition" style={{ left: salone[t.key] ? "calc(100% - 20px)" : "4px" }} />
                        </button>
                      </label>
                    ))}
                  </div>
                </div>

                {/* BOTTONE SALVA VETRINA */}
                <button
                  onClick={async () => {
                    const { data: { session: sess } } = await supabase.auth.getSession();
                    if (!sess) return;
                    setSalvataggioVetrinaStato("salvataggio");
                    const vetrinaPayload = {
                      descrizione: salone.descrizione,
                      email: salone.email,
                      logo: salone.logo,
                      copertina: salone.copertina,
                      copertina_y: salone.copertina_y,
                      galleria: salone.galleria,
                      social: salone.social,
                      mostra_recensioni: salone.mostraRecensioni,
                      mostra_mappa: salone.mostraMappa,
                      mostra_orari: salone.mostraOrari,
                      mostra_galleria: salone.mostraGalleria,
                      mostra_social: salone.mostraSocial,
                    };
                    const { error } = salone.dbId
                      ? await supabase.from("saloni").update(vetrinaPayload).eq("id", salone.dbId)
                      : await supabase.from("saloni").insert({ ...vetrinaPayload, user_id: sess.user.id, nome: salone.nome, slug: salone.slug || "salone" }).select().single();
                    setSalvataggioVetrinaStato(error ? "errore" : "ok");
                    setTimeout(() => setSalvataggioVetrinaStato(null), 3000);
                  }}
                  disabled={salvataggioVetrinaStato === "salvataggio"}
                  className="w-full py-3 text-sm tracking-widest"
                  style={{
                    backgroundColor: salvataggioVetrinaStato === "ok" ? "#27ae60" : T.accent,
                    color: "#fff",
                    border: "none",
                    cursor: salvataggioVetrinaStato === "salvataggio" ? "wait" : "pointer",
                    letterSpacing: "0.15em",
                    opacity: salvataggioVetrinaStato === "salvataggio" ? 0.7 : 1,
                    borderRadius: 0,
                  }}
                >
                  {salvataggioVetrinaStato === "salvataggio" ? "SALVATAGGIO..." : salvataggioVetrinaStato === "ok" ? "✓ SALVATO" : salvataggioVetrinaStato === "errore" ? "ERRORE — RIPROVA" : "SALVA VETRINA"}
                </button>
              </div>

              <div className="p-6 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                <h3 className="text-sm tracking-widest mb-4" style={{ color: T.textSoft, letterSpacing: "0.15em" }}>ORARI DI APERTURA</h3>
                <div className="space-y-2">
                  {["lun","mar","mer","gio","ven","sab","dom"].map((giorno) => {
                    const orario = (salone.orari && salone.orari[giorno]) || "Chiuso";
                    return (
                      <div key={giorno} className="flex items-center gap-3">
                        <div className="w-16 text-sm capitalize">{giorno}</div>
                        <input
                          type="text"
                          value={orario}
                          onChange={(e) => setSalone({ ...salone, orari: { ...salone.orari, [giorno]: e.target.value } })}
                          className="flex-1 p-2 border outline-none text-sm"
                          style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text }}
                        />
                      </div>
                    );
                  })}
                  <SalvaBottone
                    onClick={async () => {
                      if (!salone.dbId) throw new Error("dbId mancante");
                      await supabase.from("saloni").update({ orari: salone.orari }).eq("id", salone.dbId);
                    }}
                    label="SALVA ORARI"
                    T={T}
                  />
                </div>
              </div>


              <div className="p-6 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                <h3 className="text-sm tracking-widest mb-1" style={{ color: T.textSoft, letterSpacing: "0.15em" }}>NOTIFICHE EMAIL</h3>
                <p className="text-xs mb-4" style={{ color: T.textMuted }}>Tutte le comunicazioni al cliente avvengono via email</p>
                <div className="space-y-3">
                  {[
                    { lbl: "Email di conferma prenotazione", sub: "Inviata al cliente subito dopo la prenotazione", attivo: true },
                    { lbl: "Email promemoria 24h prima", sub: "Ricordo automatico il giorno prima dell'appuntamento", attivo: true },
                    { lbl: "Email in caso di cancellazione", sub: "Notifica al cliente se l'appuntamento viene annullato", attivo: true },
                    { lbl: "Notifica nuova prenotazione al salone", sub: "Avviso email quando arriva una nuova prenotazione", attivo: true },
                  ].map((n, i) => (
                    <label key={i} className="flex items-center justify-between cursor-pointer py-2">
                      <div className="flex-1 pr-3">
                        <div className="text-sm">{n.lbl}</div>
                        <div className="text-xs mt-0.5" style={{ color: T.textMuted }}>{n.sub}</div>
                      </div>
                      <div className="w-10 h-6 rounded-full relative transition flex-shrink-0" style={{ backgroundColor: n.attivo ? T.accent : T.border }}>
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition" style={{ left: n.attivo ? "calc(100% - 20px)" : "4px" }} />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-6 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                <h3 className="text-sm tracking-widest mb-1" style={{ color: T.textSoft, letterSpacing: "0.15em" }}>METODI DI PAGAMENTO</h3>
                <p className="text-xs mb-4" style={{ color: T.textMuted }}>Scegli come vuoi ricevere i pagamenti dai clienti</p>
                <div className="space-y-3">

                  {/* Paga in salone */}
                  <label className="flex items-center justify-between cursor-pointer py-2">
                    <div className="flex-1 pr-3">
                      <div className="text-sm">{tipoAttivita === "generico" ? "Paga di persona" : "Paga in salone"}</div>
                      <div className="text-xs mt-0.5" style={{ color: T.textMuted }}>
                        {tipoAttivita === "generico" ? "Il cliente paga al momento del servizio (contanti o POS)" : "Il cliente paga in salone al termine del servizio (contanti o POS)"}
                      </div>
                    </div>
                    <input type="checkbox" checked={metodiPagamento.inSalone} onChange={() => setMetodiPagamento({ ...metodiPagamento, inSalone: !metodiPagamento.inSalone })} className="sr-only" />
                    <div className="w-10 h-6 rounded-full relative transition flex-shrink-0" style={{ backgroundColor: metodiPagamento.inSalone ? T.accent : T.border }}>
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition" style={{ left: metodiPagamento.inSalone ? "calc(100% - 20px)" : "4px" }} />
                    </div>
                  </label>

                  {/* Bonifico bancario */}
                  <label className="flex items-center justify-between cursor-pointer py-2 border-t" style={{ borderColor: T.border }}>
                    <div className="flex-1 pr-3">
                      <div className="text-sm">Bonifico bancario</div>
                      <div className="text-xs mt-0.5" style={{ color: T.textMuted }}>Il cliente riceve IBAN e intestatario nell'email di conferma</div>
                    </div>
                    <input type="checkbox" checked={metodiPagamento.bonifico} onChange={() => setMetodiPagamento({ ...metodiPagamento, bonifico: !metodiPagamento.bonifico })} className="sr-only" />
                    <div className="w-10 h-6 rounded-full relative transition flex-shrink-0" style={{ backgroundColor: metodiPagamento.bonifico ? T.accent : T.border }}>
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition" style={{ left: metodiPagamento.bonifico ? "calc(100% - 20px)" : "4px" }} />
                    </div>
                  </label>

                  {/* Campi IBAN — visibili solo se bonifico è attivo */}
                  {metodiPagamento.bonifico && (
                    <div className="space-y-3 pt-3 pb-1 px-4 border-l-2" style={{ borderColor: T.accent }}>
                      <div>
                        <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>INTESTATARIO DEL CONTO *</label>
                        <input
                          type="text"
                          value={metodiPagamento.intestatario}
                          onChange={(e) => setMetodiPagamento({ ...metodiPagamento, intestatario: e.target.value })}
                          className="w-full mt-2 p-3 border outline-none"
                          style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text }}
                          placeholder="Nome e cognome o ragione sociale"
                        />
                      </div>
                      <div>
                        <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>IBAN DEL CONTO *</label>
                        <input
                          type="text"
                          value={metodiPagamento.iban}
                          onChange={(e) => setMetodiPagamento({ ...metodiPagamento, iban: e.target.value.toUpperCase().replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim() })}
                          className="w-full mt-2 p-3 border outline-none font-mono"
                          style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text }}
                          placeholder="IT60 X054 2811 1010 0000 0123 456"
                          maxLength={34}
                        />
                        <div className="text-xs mt-1" style={{ color: T.textMuted }}>Il cliente lo riceverà nell'email di conferma per effettuare il bonifico</div>
                      </div>
                    </div>
                  )}

                  {/* Stripe — pagamenti online con carta */}
                  <label className="flex items-center justify-between cursor-pointer py-2 border-t" style={{ borderColor: T.border }}>
                    <div className="flex-1 pr-3">
                      <div className="text-sm flex items-center gap-2">
                        Stripe
                        <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ backgroundColor: "#635bff", color: "#fff" }}>ONLINE</span>
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: T.textMuted }}>Il cliente paga con carta direttamente alla prenotazione</div>
                    </div>
                    <input type="checkbox" checked={metodiPagamento.stripe} onChange={() => setMetodiPagamento({ ...metodiPagamento, stripe: !metodiPagamento.stripe })} className="sr-only" />
                    <div className="w-10 h-6 rounded-full relative transition flex-shrink-0" style={{ backgroundColor: metodiPagamento.stripe ? T.accent : T.border }}>
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition" style={{ left: metodiPagamento.stripe ? "calc(100% - 20px)" : "4px" }} />
                    </div>
                  </label>

                  {/* Chiavi Stripe — visibili solo se Stripe è attivo */}
                  {metodiPagamento.stripe && (
                    <div className="space-y-4 pt-3 pb-1 px-4 border-l-2" style={{ borderColor: "#635bff" }}>
                      {/* Istruzioni */}
                      <div className="text-xs p-3 rounded" style={{ backgroundColor: T.accentSoft, color: T.accent }}>
                        <div className="font-semibold mb-1">Come collegare il tuo Stripe:</div>
                        <ol className="list-decimal pl-4 space-y-1" style={{ color: T.textSoft }}>
                          <li>Vai su <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" style={{ color: "#635bff", textDecoration: "underline" }}>dashboard.stripe.com/apikeys</a></li>
                          <li>Copia la <strong>Chiave pubblica</strong> (inizia con pk_)</li>
                          <li>Copia la <strong>Chiave segreta</strong> (inizia con sk_)</li>
                          <li>Incollale qui sotto e salva</li>
                        </ol>
                      </div>
                      <div>
                        <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>CHIAVE PUBBLICA (pk_live_... o pk_test_...) *</label>
                        <input
                          type="text"
                          value={metodiPagamento.stripe_pk}
                          onChange={(e) => setMetodiPagamento({ ...metodiPagamento, stripe_pk: e.target.value.trim() })}
                          className="w-full mt-2 p-3 border outline-none font-mono text-xs"
                          style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text }}
                          placeholder="pk_live_xxxxxxxxxxxxxxxxxxxxxx"
                          spellCheck={false}
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>CHIAVE SEGRETA (sk_live_... o sk_test_...) *</label>
                        <input
                          type="password"
                          value={metodiPagamento.stripe_sk}
                          onChange={(e) => setMetodiPagamento({ ...metodiPagamento, stripe_sk: e.target.value.trim() })}
                          className="w-full mt-2 p-3 border outline-none font-mono text-xs"
                          style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text }}
                          placeholder="sk_live_xxxxxxxxxxxxxxxxxxxxxx"
                          spellCheck={false}
                          autoComplete="off"
                        />
                        <div className="text-xs mt-1" style={{ color: T.textMuted }}>Tenuta al sicuro sui nostri server — non viene mai mostrata ai clienti</div>
                      </div>
                    </div>
                  )}
                </div>

                <SalvaBottone
                  onClick={async () => {
                    if (!salone.dbId) throw new Error("dbId mancante");
                    if (metodiPagamento.bonifico && (!metodiPagamento.iban || !metodiPagamento.intestatario)) {
                      throw new Error("Inserisci IBAN e intestatario per abilitare il bonifico");
                    }
                    if (metodiPagamento.stripe && (!metodiPagamento.stripe_pk || !metodiPagamento.stripe_sk)) {
                      throw new Error("Inserisci entrambe le chiavi Stripe per abilitare i pagamenti online");
                    }
                    if (metodiPagamento.stripe && (!metodiPagamento.stripe_pk.startsWith("pk_") || !metodiPagamento.stripe_sk.startsWith("sk_"))) {
                      throw new Error("Le chiavi Stripe non sembrano valide — controlla che inizino con pk_ e sk_");
                    }
                    await supabase.from("saloni").update({ metodi_pagamento: metodiPagamento }).eq("id", salone.dbId);
                  }}
                  label="SALVA METODI"
                  T={T}
                />
              </div>

              {/* PIANO PRENOTY */}
              <div className="p-6 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                <h3 className="text-sm tracking-widest mb-1 flex items-center gap-2" style={{ color: T.textSoft, letterSpacing: "0.15em" }}>
                  <CreditCard className="w-4 h-4" /> PIANO PRENOTY
                </h3>
                <p className="text-xs mb-4" style={{ color: T.textMuted }}>Attiva il tuo accesso completo a Prenoty</p>

                {salone.abbonamentoAttivo ? (
                  <div className="p-4 border flex items-center gap-3" style={{ backgroundColor: T.accentSoft, borderColor: T.accent, borderRadius: 10 }}>
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: T.accent }} />
                    <div>
                      <div className="text-sm font-medium" style={{ color: T.accent }}>Piano attivo ✓</div>
                      <div className="text-xs mt-0.5" style={{ color: T.textMuted }}>Accesso completo — pagamento unico effettuato</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 border" style={{ backgroundColor: T.bg, borderColor: T.border, borderRadius: 10 }}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold" style={{ color: T.text }}>€299</span>
                        <span className="text-sm" style={{ color: T.textMuted }}>pagamento unico</span>
                      </div>
                      <p className="text-xs mb-3" style={{ color: T.textMuted }}>Accesso completo alla piattaforma, senza canoni mensili</p>
                      <ul className="space-y-1 mt-3">
                        {["Prenotazioni illimitate","Link personalizzato","Notifiche in tempo reale","Report mensili","Supporto prioritario"].map(f => (
                          <li key={f} className="text-xs flex items-center gap-2" style={{ color: T.textSoft }}>
                            <CheckCircle className="w-3 h-3 flex-shrink-0" style={{ color: T.accent }} /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={() => {
                        window.open("https://buy.stripe.com/28E9AT5OO23kbTz73e7IY00", "_blank");
                      }}
                      className="w-full py-3 text-sm tracking-widest"
                      style={{ backgroundColor: T.accent, color: "#fff", border: "none", letterSpacing: "0.15em", borderRadius: 8, cursor: "pointer" }}
                    >
                      ACQUISTA ORA — €299
                    </button>
                  </div>
                )}
              </div>

              {/* SICUREZZA */}
              <div className="p-6 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                <h3 className="text-sm tracking-widest mb-1" style={{ color: T.textSoft, letterSpacing: "0.15em" }}>SICUREZZA</h3>
                <p className="text-xs mb-4" style={{ color: T.textMuted }}>Cambia la password del tuo account</p>
                <CambioPassword T={T} />
              </div>

            </div>
          )}
        </main>
      </div>

      {/* MODAL DETTAGLIO */}
      {dettaglio && (
        <div className="fixed inset-0 bg-black/50 z-20 flex items-end md:items-center justify-center p-0 md:p-6" onClick={() => setDettaglio(null)}>
          <div className="w-full md:max-w-lg md:border" style={{ backgroundColor: T.bg, borderColor: T.border }} onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b" style={{ backgroundColor: T.card, borderColor: T.border }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs tracking-widest mb-1" style={{ color: T.textMuted, letterSpacing: "0.15em" }}>DETTAGLIO APPUNTAMENTO</div>
                  <h3 className="text-2xl">{dettaglio.cliente}</h3>
                </div>
                <button onClick={() => setDettaglio(null)} className="text-2xl leading-none" style={{ color: T.textMuted }}>×</button>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: T.textSoft }}>
                <Phone className="w-4 h-4" />
                <a href={`tel:${dettaglio.tel}`} className="hover:underline">{dettaglio.tel}</a>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs tracking-widest mb-1" style={{ color: T.textMuted }}>DATA</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" style={{ color: T.textMuted }} />
                    {fmtData(dettaglio.data)}
                  </div>
                </div>
                <div>
                  <div className="text-xs tracking-widest mb-1" style={{ color: T.textMuted }}>ORARIO</div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: T.textMuted }} />
                    {dettaglio.ora} ({dettaglio.durata}m)
                  </div>
                </div>
              </div>
              {dettaglio.creatoIl && (
                <div>
                  <div className="text-xs tracking-widest mb-1" style={{ color: T.textMuted }}>PRENOTATO IL</div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: T.textSoft }}>
                    <Clock className="w-4 h-4" style={{ color: T.textMuted }} />
                    {(() => {
                      // Supabase restituisce created_at senza 'Z' → forziamo UTC
                      const raw = dettaglio.creatoIl.replace(" ", "T");
                      const d = new Date(raw.endsWith("Z") || raw.includes("+") ? raw : raw + "Z");
                      const giorni = ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"];
                      const mesi = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];
                      return `${giorni[d.getDay()]} ${d.getDate()} ${mesi[d.getMonth()]} alle ${d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`;
                    })()}
                  </div>
                </div>
              )}
              <div>
                <div className="text-xs tracking-widest mb-1" style={{ color: T.textMuted }}>SERVIZIO</div>
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4" style={{ color: T.textMuted }} />
                  {dettaglio.servizio}
                </div>
              </div>
              <div>
                <div className="text-xs tracking-widest mb-1" style={{ color: T.textMuted }}>OPERATORE</div>
                <div className="flex items-center gap-2">
                  {(() => {
                    const op = staffDi(dettaglio.staffId);
                    if (op) return (
                      <><div className="w-4 h-4 rounded-full" style={{ backgroundColor: op.colore }} /><span>{op.nome}</span></>
                    );
                    return <span style={{ color: T.textMuted }}>Chiunque disponibile</span>;
                  })()}
                </div>
              </div>
              {dettaglio.note && (
                <div>
                  <div className="text-xs tracking-widest mb-1" style={{ color: T.textMuted }}>NOTE</div>
                  <div className="italic text-sm" style={{ color: T.textSoft }}>{dettaglio.note}</div>
                </div>
              )}
              <div className="pt-4 border-t flex justify-between items-center" style={{ borderColor: T.border }}>
                <div>
                  <div className="text-xs tracking-widest mb-1" style={{ color: T.textMuted }}>PAGAMENTO</div>
                  <div className="flex items-center gap-2">
                    {dettaglio.pagamento === "pagato" ? (
                      <><CheckCircle className="w-4 h-4" style={{ color: "#16a34a" }} /><span style={{ color: "#16a34a" }}>Pagato online</span></>
                    ) : dettaglio.metodoPagamento === "bonifico" ? (
                      <div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" style={{ color: "#d97706" }} />
                          <span style={{ color: "#d97706", fontWeight: 600 }}>Bonifico bancario</span>
                        </div>
                        {dettaglio.codiceBonifico && (
                          <div className="text-xs mt-1 font-mono font-bold tracking-wider" style={{ color: T.textMuted }}>
                            {dettaglio.codiceBonifico}
                          </div>
                        )}
                      </div>
                    ) : (
                      <><CreditCard className="w-4 h-4" style={{ color: T.textMuted }} /><span>Paga in salone</span></>
                    )}
                  </div>
                </div>
                <div className="text-3xl" style={{ color: T.accent }}>€{dettaglio.prezzo}</div>
              </div>
            </div>

            <div className="p-6 border-t flex gap-3" style={{ backgroundColor: T.card, borderColor: T.border }}>
              <a href={`tel:${dettaglio.tel}`} className="flex-1 py-3 border tracking-widest text-sm transition flex items-center justify-center gap-2" style={{ borderColor: T.borderStrong, color: T.text, letterSpacing: "0.15em" }}>
                <Phone className="w-4 h-4" /> CHIAMA
              </a>
              <button onClick={() => cancella(dettaglio.id)} className="flex-1 py-3 tracking-widest text-sm text-white transition flex items-center justify-center gap-2" style={{ backgroundColor: T.danger, letterSpacing: "0.15em" }}>
                <XCircle className="w-4 h-4" /> ANNULLA
              </button>
            </div>
          </div>
        </div>
      )}
      {/* PULSANTE WHATSAPP DI ASSISTENZA — fluttuante in basso a destra */}
      {/* MODAL CONFERMA ELIMINA SERVIZIO */}
      {confermaEliminaServizio && (
        <div onClick={() => setConfermaEliminaServizio(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "32px 28px", maxWidth: 440, width: "100%", fontFamily: "Georgia, 'Times New Roman', serif", color: T.text }}>
            <h3 style={{ fontSize: 20, fontWeight: 400, margin: "0 0 12px" }}>Eliminare questo servizio?</h3>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.6, margin: "0 0 24px" }}>Le prenotazioni esistenti restano in agenda. I clienti non potranno più scegliere questo servizio.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfermaEliminaServizio(null)} style={{ flex: 1, padding: 12, background: "transparent", border: `1px solid ${T.border}`, color: T.textSoft, fontFamily: "inherit", fontSize: 13, letterSpacing: "0.15em", cursor: "pointer" }}>ANNULLA</button>
              <button onClick={eseguiEliminaServizio} style={{ flex: 1, padding: 12, background: T.danger, border: "none", color: "#fff", fontFamily: "inherit", fontSize: 13, letterSpacing: "0.15em", cursor: "pointer" }}>ELIMINA</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUOVO CLIENTE */}
      {modalNuovoCliente && (
        <div
          onClick={() => { setModalNuovoCliente(false); setNuovoCliente({ nome: "", tel: "", note: "" }); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "32px 28px", maxWidth: 480, width: "100%", fontFamily: "Georgia, 'Times New Roman', serif", color: T.text }}>
            <h3 style={{ fontSize: 22, fontWeight: 400, margin: "0 0 6px" }}>Nuovo cliente</h3>
            <p style={{ fontSize: 13, color: T.textSoft, margin: "0 0 20px" }}>Inserisci i dati del nuovo cliente nell'anagrafica.</p>

            <label style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.15em" }}>NOME E COGNOME</label>
            <input type="text" autoFocus value={nuovoCliente.nome} onChange={(e) => setNuovoCliente({ ...nuovoCliente, nome: e.target.value })} placeholder="Es: Mario Rossi" style={{ width: "100%", padding: 12, marginTop: 6, marginBottom: 16, background: T.bg, border: `1px solid ${T.border}`, color: T.text, fontFamily: "inherit", fontSize: 14, outline: "none" }} />

            <label style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.15em" }}>TELEFONO</label>
            <input type="tel" value={nuovoCliente.tel} onChange={(e) => setNuovoCliente({ ...nuovoCliente, tel: e.target.value })} placeholder="Es: +39 333 1234567" style={{ width: "100%", padding: 12, marginTop: 6, marginBottom: 16, background: T.bg, border: `1px solid ${T.border}`, color: T.text, fontFamily: "inherit", fontSize: 14, outline: "none" }} />

            <label style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.15em" }}>NOTE (opzionali)</label>
            <textarea value={nuovoCliente.note} onChange={(e) => setNuovoCliente({ ...nuovoCliente, note: e.target.value })} placeholder="Es: preferenze, allergie, ecc." rows={2} style={{ width: "100%", padding: 12, marginTop: 6, marginBottom: 24, background: T.bg, border: `1px solid ${T.border}`, color: T.text, fontFamily: "inherit", fontSize: 14, outline: "none", resize: "none" }} />

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setModalNuovoCliente(false); setNuovoCliente({ nome: "", tel: "", note: "" }); }} style={{ flex: 1, padding: 12, background: "transparent", border: `1px solid ${T.border}`, color: T.textSoft, fontFamily: "inherit", fontSize: 13, letterSpacing: "0.15em", cursor: "pointer" }}>ANNULLA</button>
              <button onClick={aggiungiCliente} disabled={!nuovoCliente.nome.trim() || !nuovoCliente.tel.trim()} style={{ flex: 1, padding: 12, background: T.accent, border: "none", color: "#fff", fontFamily: "inherit", fontSize: 13, letterSpacing: "0.15em", cursor: "pointer", opacity: (!nuovoCliente.nome.trim() || !nuovoCliente.tel.trim()) ? 0.4 : 1 }}>AGGIUNGI</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFERMA ELIMINA CLIENTE */}
      {confermaEliminaCliente && (
        <div onClick={() => setConfermaEliminaCliente(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "32px 28px", maxWidth: 440, width: "100%", fontFamily: "Georgia, 'Times New Roman', serif", color: T.text }}>
            <h3 style={{ fontSize: 20, fontWeight: 400, margin: "0 0 12px" }}>Eliminare questo cliente?</h3>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.6, margin: "0 0 24px" }}>Verrà rimosso dall'anagrafica. Le prenotazioni passate restano in agenda per i tuoi report.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfermaEliminaCliente(null)} style={{ flex: 1, padding: 12, background: "transparent", border: `1px solid ${T.border}`, color: T.textSoft, fontFamily: "inherit", fontSize: 13, letterSpacing: "0.15em", cursor: "pointer" }}>ANNULLA</button>
              <button onClick={eseguiEliminaCliente} style={{ flex: 1, padding: 12, background: T.danger, border: "none", color: "#fff", fontFamily: "inherit", fontSize: 13, letterSpacing: "0.15em", cursor: "pointer" }}>ELIMINA</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL conferma eliminazione staff */}
      {confermaEliminaStaff && (
        <div
          onClick={() => setConfermaEliminaStaff(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: "32px 28px",
              maxWidth: 440,
              width: "100%",
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: T.text,
            }}
          >
            <h3 style={{ fontSize: 20, fontWeight: 400, margin: "0 0 12px" }}>
              Eliminare questo operatore?
            </h3>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.6, margin: "0 0 24px" }}>
              Le prenotazioni esistenti resteranno in agenda ma senza operatore assegnato.<br />
              Potrai sempre aggiungere nuovi operatori dopo (max {MAX_STAFF}).
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setConfermaEliminaStaff(null)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "transparent",
                  border: `1px solid ${T.border}`,
                  color: T.textSoft,
                  fontFamily: "inherit",
                  fontSize: 13,
                  letterSpacing: "0.15em",
                  cursor: "pointer",
                }}
              >
                ANNULLA
              </button>
              <button
                onClick={eseguiEliminaStaff}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: T.danger,
                  border: "none",
                  color: "#fff",
                  fontFamily: "inherit",
                  fontSize: 13,
                  letterSpacing: "0.15em",
                  cursor: "pointer",
                }}
              >
                ELIMINA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL conferma cambio tipo attività (in-app, funziona ovunque) */}
      {confermaCambioTipo && (
        <div
          onClick={() => setConfermaCambioTipo(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: "32px 28px",
              maxWidth: 440,
              width: "100%",
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: T.text,
            }}
          >
            <h3 style={{ fontSize: 20, fontWeight: 400, margin: "0 0 12px" }}>
              Cambiare attività in "{CONFIG_ATTIVITA[confermaCambioTipo].nome}"?
            </h3>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.6, margin: "0 0 24px" }}>
              I servizi attuali verranno eliminati. Potrai aggiungere i tuoi servizi per <strong style={{ color: T.text }}>{CONFIG_ATTIVITA[confermaCambioTipo].nome}</strong> dalla sezione Servizi.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setConfermaCambioTipo(null)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "transparent",
                  border: `1px solid ${T.border}`,
                  color: T.textSoft,
                  fontFamily: "inherit",
                  fontSize: 13,
                  letterSpacing: "0.15em",
                  cursor: "pointer",
                }}
              >
                ANNULLA
              </button>
              <button
                onClick={eseguiCambioTipo}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: T.accent,
                  border: "none",
                  color: "#fff",
                  fontFamily: "inherit",
                  fontSize: 13,
                  letterSpacing: "0.15em",
                  cursor: "pointer",
                }}
              >
                CONFERMA
              </button>
            </div>
          </div>
        </div>
      )}

      <WhatsAppAssistenza tema={tema} numero="393489259863" />
    </div>
  );
}
