// v5 — build 2026-05-11
import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { Scissors, Calendar, X, Clock, User, Check, CreditCard, ArrowLeft, ArrowRight, Sparkles, MapPin, Phone, Star, Mail, Camera, Globe, ChevronDown, Image as ImageIcon, Heart, Flower2, Share2, Smartphone } from "lucide-react";
import WhatsAppAssistenza from "./whatsapp-assistenza";
import { supabase } from "./supabase";

// Normalizza numero di telefono: rimuove +39, 0039, spazi, trattini
function normalizzaTel(tel) {
  if (!tel) return "";
  let n = tel.replace(/[\s\-().]/g, "");
  if (n.startsWith("+39")) n = n.slice(3);
  else if (n.startsWith("0039")) n = n.slice(4);
  else if (n.startsWith("39") && n.length > 10) n = n.slice(2);
  return n;
}

// =============================================================
// CONFIGURAZIONE PER TIPO DI ATTIVITÀ
// In produzione viene letta dal salone in Supabase
// =============================================================
const CONFIG_ATTIVITA = {
  parrucchiere: {
    nome: "Parrucchiere",
    icona: Scissors,
    operatoreSing: "Operatore",
    operatorePlur: "I nostri operatori",
    tagline: "Il tuo stile, prenotato",
    pagaInLoco: "Paga in salone",
    pagaInLocoSub: "Al termine del servizio",
  },
  estetista: {
    nome: "Estetista",
    icona: Sparkles,
    operatoreSing: "Estetista",
    operatorePlur: "Le nostre estetiste",
    tagline: "La tua bellezza, su misura",
    pagaInLoco: "Paga in centro",
    pagaInLocoSub: "Al termine del trattamento",
  },
  spa: {
    nome: "SPA",
    icona: Flower2,
    operatoreSing: "Terapista",
    operatorePlur: "I nostri terapisti",
    tagline: "Il tuo momento di puro relax",
    pagaInLoco: "Paga in struttura",
    pagaInLocoSub: "Al termine del trattamento",
  },
  generico: {
    nome: "Altro",
    icona: Calendar,
    operatoreSing: "Operatore",
    operatorePlur: "Il nostro team",
    tagline: "Il tuo appuntamento, semplice",
    pagaInLoco: "Paga in loco",
    pagaInLocoSub: "Al termine dell'appuntamento",
  },
};

export default function AppCliente() {
  // TEMA (il cliente può scegliere; il salone ha un default)
  const [tema, setTema] = useState(() => localStorage.getItem("prenoty-tema") || "chiaro");
  useEffect(() => { localStorage.setItem("prenoty-tema", tema); }, [tema]);

  // Modal "Aggiungi alla home" — banner istruzioni PWA su mobile
  const [pwaModalAperto, setPwaModalAperto] = useState(false);

  // LIGHTBOX galleria — naviga tra le foto
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [tutteLeGalleria, setTutteLeGalleria] = useState(false);
  const touchStartX = useRef(0);

  // Visualizzatore foto team (singola foto + nome/ruolo)
  const [teamFoto, setTeamFoto] = useState(null);

  const fotoUrlDa = (foto) => (typeof foto === "string" ? foto : foto?.url);
  const chiudiLightbox = () => setLightboxIndex(null);
  const lightboxPrev = () => setLightboxIndex(i => {
    const n = salone.galleria.length;
    return i === null ? null : (i - 1 + n) % n;
  });
  const lightboxNext = () => setLightboxIndex(i => {
    const n = salone.galleria.length;
    return i === null ? null : (i + 1) % n;
  });

  // Frecce tastiera per il lightbox (desktop)
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") chiudiLightbox();
      else if (e.key === "ArrowLeft") lightboxPrev();
      else if (e.key === "ArrowRight") lightboxNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex]); // eslint-disable-line

  // Modal e toast condivisione (con fallback)
  const [shareModalAperto, setShareModalAperto] = useState(false);
  const [linkCopiato, setLinkCopiato] = useState(false);

  // Funzione condividi — strategia a 3 livelli
  const condividiSalone = async () => {
    const url = `https://prenoty.com/${slug}`;
    const datiCondivisione = {
      title: salone.nome,
      text: `Prenota un appuntamento da ${salone.nome}`,
      url: url,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(datiCondivisione);
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        setLinkCopiato(true);
        setTimeout(() => setLinkCopiato(false), 2000);
        return;
      } catch (err) {}
    }

    setShareModalAperto(true);
  };

  // Rileva iOS per istruzioni PWA specifiche
  const isIOS = typeof window !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const T = tema === "chiaro" ? {
    bg: "#f4f3ff", card: "#ffffff", border: "#e0dcff", borderStrong: "#c4bdf8",
    text: "#1e1b3a", textSoft: "#4a4580", textMuted: "#9b96c8",
    accent: "#6c5ce7", accentSoft: "#ede9ff",
    dark: "#1e1b3a",
  } : {
    bg: "#12102a", card: "#1c1a35", border: "#2e2a52", borderStrong: "#3f3a6e",
    text: "#f0eeff", textSoft: "#a29bfe", textMuted: "#6c6a9e",
    accent: "#a29bfe", accentSoft: "#2a2550",
    dark: "#f0eeff",
  };

  const [step, setStep] = useState(0);
  const [serviziScelti, setServiziScelti] = useState([]);
  const [staffScelto, setStaffScelto] = useState(null);
  const [data, setData] = useState(null);
  const [ora, setOra] = useState(null);
  const [nome, setNome] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [paga, setPaga] = useState(null);
  const [codiceBonifico, setCodiceBonifico] = useState(null);
  const [causaleCopiata, setCausaleCopiata] = useState(false);
  const [ibanCopiato, setIbanCopiato] = useState(false);

  // Stripe
  const stripeRef = useRef(null);       // istanza Stripe
  const elementsRef = useRef(null);     // istanza Elements
  const [stripeIntent, setStripeIntent] = useState(null);   // { client_secret, stripe_pk }
  const [stripeReady, setStripeReady] = useState(false);    // Payment Element montato
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState(null);

  // DATI SALONE da Supabase
  const [salone, setSalone] = useState({
    nome: "", tipoAttivita: "generico", indirizzo: "", telefono: "", email: "",
    logo: null, copertina: null, copertina_y: 50, descrizione: "", galleria: [], social: { instagram: "", facebook: "", tiktok: "", sito: "" },
    orari: { lun: "09:00-19:00", mar: "09:00-19:00", mer: "09:00-19:00", gio: "09:00-19:00", ven: "09:00-19:00", sab: "09:00-18:00", dom: "Chiuso" },
    mostraRecensioni: true, mostraMappa: true, mostraOrari: true, mostraGalleria: true, mostraSocial: true,
    metodiPagamento: { stripe: false, bonifico: false, inSalone: true },
  });
  const [servizi, setServizi] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [nonTrovato, setNonTrovato] = useState(false);

  // Carica dati reali da Supabase usando lo slug dall'URL
  const { slug } = useParams();
  useEffect(() => {
    const carica = async () => {
      const { data: saloneDb } = await supabase
        .from("saloni").select("*").eq("slug", slug).single();
      if (!saloneDb) { setNonTrovato(true); setCaricamento(false); return; }
      setSalone(prev => ({ 
        ...prev, 
        ...saloneDb, 
        id: saloneDb.id,
        tipoAttivita: saloneDb.tipo || "generico",
        galleria: saloneDb.galleria || [],
        orari: saloneDb.orari || prev.orari,
        social: saloneDb.social || prev.social,
        logo: saloneDb.logo || null,
        copertina: saloneDb.copertina || null,
        copertina_y: saloneDb.copertina_y ?? 50,
        descrizione: saloneDb.descrizione || prev.descrizione,
        mostraRecensioni: saloneDb.mostra_recensioni ?? true,
        mostraMappa: saloneDb.mostra_mappa ?? true,
        mostraOrari: saloneDb.mostra_orari ?? true,
        mostraGalleria: saloneDb.mostra_galleria ?? true,
        mostraSocial: saloneDb.mostra_social ?? true,
        metodiPagamento: (() => {
          const mp = { ...(saloneDb.metodi_pagamento || prev.metodiPagamento) };
          delete mp.stripe_sk; // la chiave segreta non va mai al frontend
          return mp;
        })(),
      }));
      const { data: serviziDb } = await supabase
        .from("servizi").select("*").eq("salone_id", saloneDb.id).order("posizione", { ascending: true });
      if (serviziDb) setServizi(serviziDb);
      if (Array.isArray(saloneDb.recensioni)) setRecensioni(saloneDb.recensioni.filter(r => !r.nascosta));
      setCaricamento(false);
    };
    carica();
  }, [slug]);

  // GEOCODING indirizzo → coordinate per la mappa
  const [mapCoords, setMapCoords] = useState(null);
  useEffect(() => {
    if (!salone.indirizzo) return;
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(salone.indirizzo)}&format=json&limit=1`)
      .then(r => r.json())
      .then(data => {
        if (data && data[0]) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setMapCoords({ lat, lon });
        }
      })
      .catch(() => {});
  }, [salone.indirizzo]);

  // RECENSIONI
  const [recensioni, setRecensioni] = useState([]);
  const [mostraTutteRecensioni, setMostraTutteRecensioni] = useState(false);
  const mediaStelle = recensioni.length > 0
    ? (recensioni.reduce((s, r) => s + r.stelle, 0) / recensioni.length).toFixed(1) : 0;

  // Form "Scrivi recensione"
  const [modalRecensioneAperto, setModalRecensioneAperto] = useState(false);
  const [nuovaRecensione, setNuovaRecensione] = useState({ nome: "", stelle: 5, testo: "" });
  const [recensioneInviata, setRecensioneInviata] = useState(false);

  const inviaRecensione = async () => {
    const testo = nuovaRecensione.testo.trim();
    const nome = nuovaRecensione.nome.trim();
    if (!testo || !nome) return;
    const nuova = { id: Date.now(), nome, stelle: nuovaRecensione.stelle, testo, data: new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" }) };
    const nuovaLista = [nuova, ...recensioni];
    setRecensioni(nuovaLista);
    if (salone.id) {
      await supabase.from("saloni").update({ recensioni: nuovaLista }).eq("id", salone.id);
    }
    setRecensioneInviata(true);
    setTimeout(() => { setModalRecensioneAperto(false); setRecensioneInviata(false); setNuovaRecensione({ nome: "", stelle: 5, testo: "" }); }, 2000);
  };

  // Configurazione dinamica in base al tipo di attività del salone
  const config = CONFIG_ATTIVITA[salone.tipoAttivita] || CONFIG_ATTIVITA.generico;
  const IconaAttivita = config.icona;

  const staff = [
    { id: 0, nome: "Chiunque disponibile", ruolo: "Primo disponibile", colore: "#9b96c8", foto: null },
    ...(salone.staff || []),
  ];

  // Genera slot da 30 min dagli orari reali del salone per il giorno scelto
  // Supporta fasce multiple con pausa (es. "08:00-12:00 15:00-20:00")
  const generaSlot = (dataScelta) => {
    if (!dataScelta || !salone.orari) return [];
    const chiavi = ["dom","lun","mar","mer","gio","ven","sab"];
    const chiave = chiavi[dataScelta.getDay()];
    const orarioGiorno = salone.orari[chiave];
    if (!orarioGiorno || orarioGiorno === "Chiuso") return [];
    const fasce = orarioGiorno.trim().split(" ");
    const slots = [];
    for (const fascia of fasce) {
      const [inizio, fine] = fascia.split("-");
      if (!inizio || !fine) continue;
      const [hI, mI] = inizio.split(":").map(Number);
      const [hF, mF] = fine.split(":").map(Number);
      if (isNaN(hI) || isNaN(mI) || isNaN(hF) || isNaN(mF)) continue;
      let minuti = hI * 60 + mI;
      const fineMin = hF * 60 + mF;
      while (minuti < fineMin) {
        const h = String(Math.floor(minuti / 60)).padStart(2, "0");
        const m = String(minuti % 60).padStart(2, "0");
        slots.push(`${h}:${m}`);
        minuti += 30;
      }
    }
    return slots;
  };

  const orari = data ? generaSlot(data) : [];

  const chiavi = ["dom","lun","mar","mer","gio","ven","sab"];
  const giorni = [];
  const oggi = new Date();
  let i = 0;
  while (giorni.length < 14) {
    const g = new Date(oggi);
    g.setDate(oggi.getDate() + i);
    const chiave = chiavi[g.getDay()];
    const orarioGiorno = salone.orari?.[chiave];
    if (orarioGiorno && orarioGiorno !== "Chiuso") giorni.push(g);
    i++;
    if (i > 60) break; // safety
  }

  const fmtData = (d) => {
    const gs = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
    const ms = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
    return { gs: gs[d.getDay()], num: d.getDate(), mese: ms[d.getMonth()] };
  };

  const totale = serviziScelti.reduce((s, x) => s + x.prezzo, 0);
  const durataTotale = serviziScelti.reduce((s, x) => s + x.durata, 0);

  // Inizializza Stripe quando il cliente sceglie "carta"
  useEffect(() => {
    if (paga !== "carta" || !salone.metodiPagamento?.stripe || totale <= 0) {
      if (paga !== "carta") {
        setStripeIntent(null); setStripeReady(false); setStripeError(null);
        stripeRef.current = null; elementsRef.current = null;
      }
      return;
    }
    if (stripeIntent) return; // già inizializzato
    setStripeLoading(true);
    setStripeError(null);
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salone_id: salone.id, amount: totale }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setStripeError(data.error); setStripeLoading(false); return; }
        setStripeIntent(data);
        setStripeLoading(false);
      })
      .catch(e => { setStripeError(e.message); setStripeLoading(false); });
  }, [paga, salone.id, totale]); // eslint-disable-line

  // Monta Stripe Payment Element dopo aver ricevuto il client_secret
  useEffect(() => {
    if (!stripeIntent) return;
    let mounted = true;
    const init = async () => {
      // Carica Stripe.js se non è ancora presente
      if (!window.Stripe) {
        await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://js.stripe.com/v3/";
          s.onload = res; s.onerror = rej;
          document.head.appendChild(s);
        });
      }
      if (!mounted) return;
      stripeRef.current = window.Stripe(stripeIntent.stripe_pk);
      const elements = stripeRef.current.elements({ clientSecret: stripeIntent.client_secret, locale: "it" });
      elementsRef.current = elements;
      const pe = elements.create("payment");
      pe.mount("#stripe-payment-element");
      pe.on("ready", () => { if (mounted) setStripeReady(true); });
    };
    init().catch(e => { if (mounted) setStripeError(e.message); });
    return () => { mounted = false; };
  }, [stripeIntent]);

  const reset = () => {
    setStep(0); setServiziScelti([]); setStaffScelto(null); setData(null); setOra(null);
    setNome(""); setTelefono(""); setEmail(""); setNote(""); setPaga(null);
    setStripeIntent(null); setStripeReady(false); setStripeError(null);
  };

  const toggleServizio = (s) => {
    setServiziScelti(serviziScelti.find(x => x.id === s.id)
      ? serviziScelti.filter(x => x.id !== s.id)
      : [...serviziScelti, s]);
  };

  // ORARI OCCUPATI — caricati da Supabase quando il cliente sceglie la data
  const [orariOccupati, setOrariOccupati] = useState([]);
  const [invioInCorso, setInvioInCorso] = useState(false);

  const caricaOrariOccupati = async (dataScelta) => {
    if (!salone.id) return;
    const dataStr = `${dataScelta.getFullYear()}-${String(dataScelta.getMonth()+1).padStart(2,"0")}-${String(dataScelta.getDate()).padStart(2,"0")}`;
    const { data: prenotazioniDb } = await supabase
      .from("prenotazioni")
      .select("ora, servizio_id, durata_totale")
      .eq("salone_id", salone.id)
      .eq("data", dataStr)
      .neq("stato", "annullata");

    if (!prenotazioniDb) return;

    const slotList = generaSlot(dataScelta);
    const occupati = new Set();

    for (const pren of prenotazioniDb) {
      const oraInizio = pren.ora?.slice(0, 5);
      if (!oraInizio) continue;

      // usa durata_totale se disponibile, altrimenti cerca il servizio singolo
      let durata = pren.durata_totale || null;
      if (!durata) {
        const servizio = servizi.find(s => s.id === pren.servizio_id);
        durata = servizio?.durata || 30;
      }

      const slotsOccupati = Math.ceil(durata / 30);
      const idxInizio = slotList.indexOf(oraInizio);

      for (let i = 0; i < slotsOccupati; i++) {
        if (idxInizio + i < slotList.length) {
          occupati.add(slotList[idxInizio + i]);
        }
      }
    }

    setOrariOccupati([...occupati]);
  };

  // SALVA PRENOTAZIONE su Supabase
  const inviaPrenotazione = async () => {
    setInvioInCorso(true);

    // Se il cliente ha scelto carta → prima conferma il pagamento Stripe
    if (paga === "carta" && stripeRef.current && elementsRef.current && totale > 0) {
      const { error: stripeErr } = await stripeRef.current.confirmPayment({
        elements: elementsRef.current,
        confirmParams: {},
        redirect: "if_required",
      });
      if (stripeErr) {
        setStripeError(stripeErr.message);
        setInvioInCorso(false);
        return;
      }
    }

    const dataStr = `${data.getFullYear()}-${String(data.getMonth()+1).padStart(2,"0")}-${String(data.getDate()).padStart(2,"0")}`;
    const durataTot = serviziScelti.reduce((s, x) => s + x.durata, 0);
    const nomiServizi = serviziScelti.map(x => x.nome).join(", ");
    const { error } = await supabase.from("prenotazioni").insert({
      salone_id: salone.id,
      servizio_id: serviziScelti[0]?.id || null,
      staff_id: staffScelto?.id || null,
      nome_cliente: nome,
      telefono_cliente: normalizzaTel(telefono),
      email_cliente: email,
      data: dataStr,
      ora: ora,
      stato: "confermato",
      durata_totale: durataTot,
      nomi_servizi: nomiServizi,
      prezzo: totale,
      note: note || null,
      metodo_pagamento: paga || "salone",
      codice_bonifico: paga === "bonifico" ? codiceBonifico : null,
    });
    if (!error) {
      // Invia email di conferma al cliente (fire-and-forget, non blocca il flusso)
      if (email) {
        const dataStr2 = `${data.getFullYear()}-${String(data.getMonth()+1).padStart(2,"0")}-${String(data.getDate()).padStart(2,"0")}`;
        fetch("/api/send-booking-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailCliente: email,
            emailTitolare: salone.email || null,
            nomeCliente: nome,
            telefonoCliente: telefono,
            nomeSalone: salone.nome,
            servizi: serviziScelti.map(x => x.nome).join(", "),
            data: dataStr2,
            ora: ora,
            staff: staffScelto?.nome || null,
            prezzo: totale,
            slugSalone: salone.slug,
            metodoPagamento: paga,
            iban: paga === "bonifico" ? (salone.metodiPagamento?.iban || null) : null,
            intestatario: paga === "bonifico" ? (salone.metodiPagamento?.intestatario || null) : null,
            codiceBonifico: paga === "bonifico" ? codiceBonifico : null,
          }),
        }).catch(() => {}); // ignora errori email, la prenotazione è già salvata
      }

      // Salva/aggiorna cliente in anagrafica automaticamente
      const { data: esistente } = await supabase
        .from("clienti")
        .select("id, visite")
        .eq("salone_id", salone.id)
        .eq("telefono", telefono)
        .single();
      if (esistente) {
        await supabase.from("clienti").update({
          visite: (esistente.visite || 0) + 1,
          ultima_visita: dataStr,
          nome: nome,
          email: email || undefined,
        }).eq("id", esistente.id);
      } else {
        await supabase.from("clienti").insert({
          salone_id: salone.id,
          nome,
          telefono,
          email: email || null,
          visite: 1,
          ultima_visita: dataStr,
        });
      }
      setStep(7);
    } else {
      alert("Errore durante la prenotazione. Riprova.");
    }
    setInvioInCorso(false);
  };

  const puoAvanzare =
    (step === 1 && serviziScelti.length > 0) ||
    (step === 2 && staffScelto !== null) ||
    (step === 3 && data) ||
    (step === 4 && ora) ||
    (step === 5 && nome.trim() && telefono.trim() && email.trim()) ||
    (step === 6 && paga && (paga !== "carta" || stripeReady));

  // ── Meta tag dinamici per SEO e social sharing ──────────────────────────
  const metaTitle = salone.nome
    ? `${salone.nome} — Prenota online | Prenoty`
    : "Prenoty — Prenotazioni online";

  const metaDescription = (() => {
    if (!salone.nome) return "Prenoty — Software prenotazioni online per saloni, estetiste e professionisti.";
    const base = salone.descrizione
      ? salone.descrizione.slice(0, 120)
      : `Prenota il tuo appuntamento da ${salone.nome}${salone.indirizzo ? ` — ${salone.indirizzo}` : ""}`;
    return `${base}. Prenota online 24h su 24 con Prenoty.`.slice(0, 160);
  })();

  const metaImage = salone.copertina || salone.logo || "https://prenoty.com/laptopmockupsprenotyconombra.png";
  const canonicalUrl = `https://prenoty.com/${slug}`;
  // ─────────────────────────────────────────────────────────────────────────

  if (caricamento) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1730" }}>
      <div style={{ color: "#9b96c8", fontSize: 14 }}>Caricamento...</div>
    </div>
  );

  if (nonTrovato) return (
    <>
      <Helmet>
        <title>Salone non trovato | Prenoty</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1730", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🔍</div>
        <div style={{ color: "#fff", fontSize: 20, fontWeight: 600 }}>Salone non trovato</div>
        <div style={{ color: "#9b96c8", fontSize: 14 }}>Il link potrebbe essere errato o il salone non è più attivo.</div>
        <a href="https://prenoty.com" style={{ color: "#6c5ce7", fontSize: 14, marginTop: 8 }}>← Torna a Prenoty</a>
      </div>
    </>
  );

  return (
    <>
    <Helmet>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:locale" content="it_IT" />
      <meta property="og:site_name" content="Prenoty" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
    <div className="min-h-screen" style={{ backgroundColor: T.bg, fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: T.text }}>
      {/* HEADER */}
      <header className="sticky top-0 z-10 border-b" style={{ backgroundColor: T.card, borderColor: T.border }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Aggiungi home — solo mobile */}
          <button
            onClick={() => setPwaModalAperto(true)}
            className="md:hidden flex items-center gap-2"
            style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 20, cursor: "pointer", padding: "7px 14px", color: T.textSoft, fontFamily: "inherit", fontSize: 12 }}
          >
            <Smartphone style={{ width: 14, height: 14 }} />
            <span style={{ letterSpacing: "0.05em" }}>Aggiungi home</span>
          </button>

          {/* Icone destra: Condividi · Tema · Assistenza */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={condividiSalone}
              title="Condividi"
              style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: "50%", cursor: "pointer", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: T.textSoft }}
            >
              <Share2 style={{ width: 15, height: 15 }} />
            </button>
            <button
              onClick={() => setTema(tema === "chiaro" ? "scuro" : "chiaro")}
              title={tema === "chiaro" ? "Tema scuro" : "Tema chiaro"}
              style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: "50%", cursor: "pointer", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: T.textSoft }}
            >
              {tema === "chiaro" ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              )}
            </button>
            <WhatsAppAssistenza tema={tema} numero={(salone.telefono || "").replace(/[^0-9]/g, "")} pubblico modalita="nav" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 pb-32">
        {/* HOME */}
        {step === 0 && (
          <div className="space-y-8 pb-8">
            {/* HERO — Copertina, nome, rating, descrizione */}
            <div className="pb-2">
              {/* FOTO DI COPERTINA — proporzioni Facebook 820×312, contenuta nel container */}
              {salone.copertina ? (
                <div
                  className="relative w-full overflow-hidden"
                  style={{ aspectRatio: "820 / 312" }}
                >
                  <img
                    src={salone.copertina}
                    alt={salone.nome}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: `center ${salone.copertina_y}%` }}
                  />
                </div>
              ) : (
                <div className="mb-4" />
              )}

              {/* Logo centrato sovrapposto alla copertina */}
              <div className="flex justify-center" style={{ marginTop: salone.copertina ? -32 : 0, marginBottom: 12, position: "relative", zIndex: 1 }}>
                {salone.logo ? (
                  <img src={salone.logo} alt={salone.nome} className="w-16 h-16 rounded-2xl object-cover" style={{ boxShadow: `0 0 0 5px ${T.bg}` }} />
                ) : (
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-semibold" style={{ backgroundColor: T.accentSoft, color: T.accent, boxShadow: `0 0 0 5px ${T.bg}` }}>
                    {salone.nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="text-center">
                <h1 className="text-4xl mb-3 leading-tight">{salone.nome}</h1>

                {/* Rating stelle gialle */}
                {salone.mostraRecensioni && (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {recensioni.length > 0 && (
                      <span className="text-sm font-bold" style={{ color: "#f9ca24" }}>{mediaStelle}</span>
                    )}
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star
                          key={n}
                          className="w-4 h-4"
                          style={{
                            fill: recensioni.length > 0 && n <= Math.round(parseFloat(mediaStelle)) ? "#f9ca24" : "transparent",
                            color: "#f9ca24",
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-sm" style={{ color: T.textSoft }}>
                      {recensioni.length > 0 ? `${recensioni.length} recensioni` : "Nessuna recensione"}
                    </span>
                  </div>
                )}

                <p className="max-w-md mx-auto leading-relaxed text-sm" style={{ color: T.textSoft }}>
                  {salone.descrizione}
                </p>

                {/* CTA principale */}
                <button
                  onClick={() => setStep(1)}
                  className="mt-8 px-12 py-4 tracking-widest text-sm transition"
                  style={{ backgroundColor: "#6c5ce7", color: "#fff", letterSpacing: "0.2em" }}
                >
                  PRENOTA ORA
                </button>
              </div>
            </div>

            {/* GALLERIA (se attivata e ci sono foto) */}
            {salone.mostraGalleria && salone.galleria.length > 0 && (
              <div>
                <div className="text-xs tracking-widest mb-3" style={{ color: T.textMuted, letterSpacing: "0.2em" }}>GALLERIA</div>
                <div className="grid grid-cols-3 gap-2">
                  {(tutteLeGalleria ? salone.galleria : salone.galleria.slice(0, 6)).map((foto, i) => {
                    const fotoUrl = typeof foto === "string" ? foto : foto.url;
                    const fotoY = typeof foto === "object" ? (foto.y ?? 50) : 50;
                    return (
                      <div key={i} className="aspect-square overflow-hidden border cursor-pointer transition hover:opacity-80" style={{ borderColor: T.border }} onClick={() => setLightboxIndex(i)}>
                        <img src={fotoUrl} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" style={{ objectPosition: `center ${fotoY}%` }} />
                      </div>
                    );
                  })}
                </div>
                {salone.galleria.length > 6 && (
                  <button
                    onClick={() => setTutteLeGalleria(!tutteLeGalleria)}
                    className="w-full mt-3 py-3 text-xs tracking-widest border"
                    style={{ color: T.accent, borderColor: T.border, background: "transparent", cursor: "pointer", letterSpacing: "0.15em", fontFamily: "inherit" }}
                  >
                    {tutteLeGalleria ? "▲ NASCONDI FOTO" : `▼ VEDI TUTTE LE ${salone.galleria.length} FOTO`}
                  </button>
                )}
              </div>
            )}

            {/* LIGHTBOX — galleria navigabile (frecce, swipe, contatore) */}
            {lightboxIndex !== null && salone.galleria[lightboxIndex] && (
              <div
                onClick={chiudiLightbox}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.94)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
              >
                {/* Chiudi */}
                <button onClick={chiudiLightbox} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 42, height: 42, borderRadius: "50%", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>✕</button>

                {/* Contatore */}
                {salone.galleria.length > 1 && (
                  <div style={{ position: "absolute", top: 28, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 600, pointerEvents: "none" }}>
                    {lightboxIndex + 1} / {salone.galleria.length}
                  </div>
                )}

                {/* Freccia sinistra */}
                {salone.galleria.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
                    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 44, height: 44, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}
                    aria-label="Foto precedente"
                  >
                    <ArrowLeft size={22} />
                  </button>
                )}

                {/* Immagine + swipe */}
                <img
                  src={fotoUrlDa(salone.galleria[lightboxIndex])}
                  alt={`Foto ${lightboxIndex + 1}`}
                  onClick={(e) => e.stopPropagation()}
                  onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                  onTouchEnd={(e) => {
                    const dx = e.changedTouches[0].clientX - touchStartX.current;
                    if (dx > 50) lightboxPrev();
                    else if (dx < -50) lightboxNext();
                  }}
                  style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", borderRadius: 8 }}
                />

                {/* Freccia destra */}
                {salone.galleria.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 44, height: 44, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}
                    aria-label="Foto successiva"
                  >
                    <ArrowRight size={22} />
                  </button>
                )}
              </div>
            )}

            {/* VISUALIZZATORE FOTO TEAM */}
            {teamFoto && (
              <div
                onClick={() => setTeamFoto(null)}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.94)", zIndex: 10000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}
              >
                <button onClick={() => setTeamFoto(null)} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 42, height: 42, borderRadius: "50%", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: "min(78vw, 340px)", height: "min(78vw, 340px)", borderRadius: "50%", overflow: "hidden", border: `4px solid ${teamFoto.colore || "#6c5ce7"}`, boxShadow: "0 12px 48px rgba(0,0,0,0.5)" }}
                >
                  <img src={teamFoto.url} alt={teamFoto.nome} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
                <div style={{ textAlign: "center", marginTop: 20 }}>
                  <div style={{ color: "#fff", fontSize: 20, fontWeight: 600 }}>{teamFoto.nome}</div>
                  {teamFoto.ruolo && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 2 }}>{teamFoto.ruolo}</div>}
                </div>
              </div>
            )}

            {/* SERVIZI (anteprima rapida) */}
            <div>
              <div className="text-xs tracking-widest mb-3" style={{ color: T.textMuted, letterSpacing: "0.2em" }}>I NOSTRI SERVIZI</div>
              <div className="space-y-2">
                {servizi.slice(0, 4).map(s => (
                  <div
                    key={s.id}
                    className="p-4 border flex items-center justify-between"
                    style={{ backgroundColor: T.card, borderColor: T.border }}
                  >
                    <div>
                      <div className="text-sm">{s.nome}</div>
                      <div className="text-xs mt-0.5" style={{ color: T.textMuted }}>{s.durata} min</div>
                      {s.nota && <div className="text-xs mt-1" style={{ color: T.textSoft, fontStyle: "italic" }}>{s.nota}</div>}
                    </div>
                    <div className="text-sm" style={{ color: T.accent }}>€{s.prezzo}</div>
                  </div>
                ))}
                {servizi.length > 4 && (
                  <button
                    onClick={() => setStep(1)}
                    className="w-full p-3 text-xs tracking-widest border transition"
                    style={{ borderColor: T.border, color: T.textSoft, letterSpacing: "0.15em" }}
                  >
                    VEDI TUTTI I {servizi.length} SERVIZI →
                  </button>
                )}
              </div>
            </div>

            {/* TEAM */}
            {staff.filter(s => s.id !== 0).length > 0 && (
              <div>
                <div className="text-xs tracking-widest mb-3" style={{ color: T.textMuted, letterSpacing: "0.2em" }}>TEAM</div>
                <div className="grid grid-cols-3 gap-2">
                  {staff.filter(s => s.id !== 0).map(s => (
                    <div
                      key={s.id}
                      className="p-3 border text-center"
                      style={{ backgroundColor: T.card, borderColor: T.border }}
                    >
                      {s.foto ? (
                        <div
                          className="w-14 h-14 rounded-full mx-auto mb-2 overflow-hidden border-2 cursor-pointer transition hover:opacity-80"
                          style={{ borderColor: s.colore }}
                          onClick={() => setTeamFoto({ url: s.foto, nome: s.nome, ruolo: s.ruolo, colore: s.colore })}
                        >
                          <img src={s.foto} alt={s.nome} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm" style={{ backgroundColor: s.colore }}>
                          {s.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                      )}
                      <div className="text-xs">{s.nome.split(" ")[0]}</div>
                      <div className="text-xs mt-0.5" style={{ color: T.textMuted }}>{s.ruolo}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTATTI */}
            <div>
              <div className="text-xs tracking-widest mb-3" style={{ color: T.textMuted, letterSpacing: "0.2em" }}>CONTATTI</div>
              <div className="space-y-2">
                {salone.telefono && (
                  <a href={`tel:${salone.telefono}`} className="p-4 border flex items-center gap-3 transition hover:opacity-80" style={{ backgroundColor: T.card, borderColor: T.border }}>
                    <Phone className="w-4 h-4" style={{ color: T.accent }} />
                    <span className="text-sm">{salone.telefono}</span>
                  </a>
                )}
                {salone.email && (
                  <a href={`mailto:${salone.email}`} className="p-4 border flex items-center gap-3 transition hover:opacity-80" style={{ backgroundColor: T.card, borderColor: T.border }}>
                    <Mail className="w-4 h-4" style={{ color: T.accent }} />
                    <span className="text-sm">{salone.email}</span>
                  </a>
                )}
                {salone.social?.sito && (
                  <a href={salone.social.sito} target="_blank" rel="noopener noreferrer" className="p-4 border flex items-center gap-3 transition hover:opacity-80" style={{ backgroundColor: T.card, borderColor: T.border }}>
                    <Globe className="w-4 h-4" style={{ color: T.accent }} />
                    <span className="text-sm">{salone.social.sito.replace(/^https?:\/\//, "")}</span>
                  </a>
                )}
              </div>
            </div>

            {/* SOCIAL (se attivati — senza icona sito che è già in Contatti) */}
            {salone.mostraSocial && (salone.social?.instagram || salone.social?.facebook || salone.social?.tiktok) && (
              <div>
                <div className="text-xs tracking-widest mb-3" style={{ color: T.textMuted, letterSpacing: "0.2em" }}>SOCIAL</div>
                <div className="flex gap-3 justify-center">
                  {salone.social.instagram && (
                    <a href={salone.social.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 border rounded-full flex items-center justify-center transition hover:opacity-70" style={{ borderColor: T.border, color: T.text }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                  )}
                  {salone.social.facebook && (
                    <a href={salone.social.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 border rounded-full flex items-center justify-center transition hover:opacity-70" style={{ borderColor: T.border, color: T.text }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                  )}
                  {salone.social.tiktok && (
                    <a href={salone.social.tiktok} target="_blank" rel="noopener noreferrer" className="w-12 h-12 border rounded-full flex items-center justify-center transition hover:opacity-70" style={{ borderColor: T.border, color: T.text }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z"/></svg>
                    </a>
                  )}
                </div>
              </div>
            )}

            {salone.mostraMappa && salone.indirizzo && (
              <div>
                <div className="text-xs tracking-widest mb-3" style={{ color: T.textMuted, letterSpacing: "0.2em" }}>DOVE SIAMO</div>
                <div className="border overflow-hidden" style={{ backgroundColor: T.card, borderColor: T.border }}>
                  <div className="aspect-video w-full bg-gray-100 relative">
                    {mapCoords ? (
                      <iframe
                        title="Mappa salone"
                        width="100%"
                        height="100%"
                        style={{ border: 0, filter: tema === "scuro" ? "invert(0.9) hue-rotate(180deg)" : "none" }}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lon - 0.005},${mapCoords.lat - 0.003},${mapCoords.lon + 0.005},${mapCoords.lat + 0.003}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lon}`}
                        loading="lazy"
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: T.accentSoft, color: T.textMuted, fontSize: 13 }}>
                        Caricamento mappa...
                      </div>
                    )}
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salone.indirizzo)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "flex", padding: "16px", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}
                  >
                    <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: T.accent }} />
                    <div className="flex-1">
                      <div className="text-sm">{salone.indirizzo}</div>
                      <div className="text-xs mt-0.5" style={{ color: T.accent }}>Apri in Google Maps →</div>
                    </div>
                  </a>
                </div>
              </div>
            )}

            {/* RECENSIONI (se attivate) */}
            {salone.mostraRecensioni && recensioni.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs tracking-widest" style={{ color: T.textMuted, letterSpacing: "0.2em" }}>RECENSIONI</div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: T.textSoft }}>
                    <Star className="w-3 h-3" style={{ fill: T.accent, color: T.accent }} />
                    {mediaStelle} · {recensioni.length}
                  </div>
                </div>
                <div className="space-y-3">
                  {recensioni.slice(0, mostraTutteRecensioni ? recensioni.length : 3).map(r => (
                    <div key={r.id} className="p-4 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm">{r.nome}</div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(n => (
                            <Star
                              key={n}
                              className="w-3 h-3"
                              style={{ fill: n <= r.stelle ? T.accent : "transparent", color: T.accent }}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: T.textSoft }}>{r.testo}</p>
                      <div className="text-xs mt-2" style={{ color: T.textMuted }}>{r.data}</div>
                      {r.rispostaProprietario && (
                        <div className="mt-3 pl-3 border-l-2" style={{ borderColor: T.accent }}>
                          <div className="text-xs font-semibold mb-1" style={{ color: T.accent }}>Risposta del titolare</div>
                          <p className="text-sm leading-relaxed" style={{ color: T.textSoft }}>{r.rispostaProprietario}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {recensioni.length > 3 && (
                  <button
                    onClick={() => setMostraTutteRecensioni(v => !v)}
                    className="w-full mt-3 py-3 border tracking-widest text-xs transition flex items-center justify-center gap-2"
                    style={{ borderColor: T.accent, color: T.accent, letterSpacing: "0.12em" }}
                  >
                    {mostraTutteRecensioni
                      ? "▲ MOSTRA MENO"
                      : `▼ VEDI TUTTE LE ${recensioni.length} RECENSIONI`}
                  </button>
                )}
                <button
                  onClick={() => setModalRecensioneAperto(true)}
                  className="w-full mt-3 py-3 border tracking-widest text-xs transition flex items-center justify-center gap-2"
                  style={{ borderColor: T.borderStrong, color: T.text, letterSpacing: "0.15em" }}
                >
                  <Star className="w-3 h-3" /> SCRIVI UNA RECENSIONE
                </button>
              </div>
            )}

            {salone.mostraRecensioni && recensioni.length === 0 && (
              <div>
                <div className="text-xs tracking-widest mb-3" style={{ color: T.textMuted, letterSpacing: "0.2em" }}>RECENSIONI</div>
                <div className="p-6 border text-center" style={{ backgroundColor: T.card, borderColor: T.border }}>
                  <Star className="w-6 h-6 mx-auto mb-2" style={{ color: T.textMuted }} />
                  <p className="text-sm" style={{ color: T.textSoft }}>Nessuna recensione ancora. Sii il primo a lasciarne una!</p>
                  <button
                    onClick={() => setModalRecensioneAperto(true)}
                    className="mt-3 px-6 py-2 tracking-widest text-xs"
                    style={{ backgroundColor: T.dark, color: T.bg, letterSpacing: "0.15em" }}
                  >
                    SCRIVI LA PRIMA RECENSIONE
                  </button>
                </div>
              </div>
            )}

            {/* ORARI (se attivati) */}
            {salone.mostraOrari && (
              <div>
                <div className="text-xs tracking-widest mb-3" style={{ color: T.textMuted, letterSpacing: "0.2em" }}>ORARI DI APERTURA</div>
                <div className="p-4 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                  {["lun","mar","mer","gio","ven","sab","dom"].map((giorno) => {
                    const orario = salone.orari?.[giorno] || "Chiuso";
                    return (
                      <div key={giorno} className="flex items-center justify-between py-1.5 text-sm">
                        <span className="capitalize">{giorno}</span>
                        <span style={{ color: orario === "Chiuso" ? T.textMuted : T.text }}>{orario}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA finale (per chi scrolla fino in fondo) */}
            <div className="text-center pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-12 py-4 tracking-widest text-sm transition"
                style={{ backgroundColor: "#6c5ce7", color: "#fff", letterSpacing: "0.2em" }}
              >
                PRENOTA ORA
              </button>
            </div>
          </div>
        )}

        {/* STEP INDICATOR */}
        {step >= 1 && step <= 6 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-1 rounded-full transition-all"
                style={{
                  width: step === n ? "28px" : "14px",
                  backgroundColor: step >= n ? T.accent : T.border,
                }}
              />
            ))}
          </div>
        )}

        {/* STEP 1: SERVIZI (multi-select) */}
        {step === 1 && (
          <div>
            <h3 className="text-2xl mb-2">Scegli i servizi</h3>
            <p className="text-sm mb-6" style={{ color: T.textSoft }}>Puoi selezionarne più di uno</p>
            <div className="space-y-3">
              {servizi.map((s) => {
                const sel = serviziScelti.find(x => x.id === s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleServizio(s)}
                    className="w-full text-left p-5 border transition"
                    style={{
                      backgroundColor: sel ? T.accentSoft : T.card,
                      borderColor: sel ? T.accent : T.border,
                      borderWidth: sel ? "2px" : "1px",
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: sel ? T.accent : T.borderStrong, backgroundColor: sel ? T.accent : "transparent" }}>
                          {sel && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <div className="text-lg">{s.nome}</div>
                          <div className="text-xs mt-1 flex items-center gap-1" style={{ color: T.textMuted }}>
                            <Clock className="w-3 h-3" /> {s.durata} min
                          </div>
                          {s.nota && (
                            <div className="text-xs mt-1" style={{ color: T.textSoft, fontStyle: "italic" }}>{s.nota}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-xl" style={{ color: T.accent }}>€{s.prezzo}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            {serviziScelti.length > 0 && (
              <div className="mt-6 p-4 border" style={{ backgroundColor: T.card, borderColor: T.accent }}>
                <div className="flex justify-between items-center">
                  <div className="text-sm" style={{ color: T.textSoft }}>
                    {serviziScelti.length} {serviziScelti.length === 1 ? "servizio" : "servizi"} · {durataTotale} min
                  </div>
                  <div className="text-xl" style={{ color: T.accent }}>€{totale}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: STAFF */}
        {step === 2 && (
          <div>
            <h3 className="text-2xl mb-2">Scegli il tuo stylist</h3>
            <p className="text-sm mb-6" style={{ color: T.textSoft }}>Oppure lascia che sia il salone ad assegnarne uno</p>
            <div className="space-y-3">
              {staff.map((s) => {
                const sel = staffScelto?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setStaffScelto(s)}
                    className="w-full flex items-center gap-4 p-4 border transition text-left"
                    style={{
                      backgroundColor: sel ? T.accentSoft : T.card,
                      borderColor: sel ? T.accent : T.border,
                      borderWidth: sel ? "2px" : "1px",
                    }}
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0 overflow-hidden" style={{ backgroundColor: s.foto ? "transparent" : s.colore }}>
                      {s.foto ? (
                        <img src={s.foto} alt={s.nome} className="w-full h-full object-cover" />
                      ) : s.id === 0 ? (
                        <User className="w-5 h-5" />
                      ) : (
                        s.nome.split(" ").map(n => n[0]).join("")
                      )}
                    </div>
                    <div className="flex-1">
                      <div>{s.nome}</div>
                      <div className="text-xs" style={{ color: T.textMuted }}>{s.ruolo}</div>
                    </div>
                    {s.rating && (
                      <div className="flex items-center gap-1 text-sm" style={{ color: T.accent }}>
                        <Star className="w-3 h-3 fill-current" />
                        {s.rating}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: DATA */}
        {step === 3 && (
          <div>
            <h3 className="text-2xl mb-2">Scegli il giorno</h3>
            <p className="text-sm mb-6" style={{ color: T.textSoft }}>Prossime date disponibili</p>
            <div className="grid grid-cols-4 gap-3">
              {giorni.map((g, idx) => {
                const f = fmtData(g);
                const sel = data && data.toDateString() === g.toDateString();
                return (
                  <button
                    key={idx}
                    onClick={() => { setData(g); setOra(null); caricaOrariOccupati(g); }}
                    className="p-3 border text-center transition"
                    style={{
                      backgroundColor: sel ? T.accentSoft : T.card,
                      borderColor: sel ? T.accent : T.border,
                      borderWidth: sel ? "2px" : "1px",
                    }}
                  >
                    <div className="text-xs tracking-wider" style={{ color: T.textMuted }}>{f.gs.toUpperCase()}</div>
                    <div className="text-2xl my-1">{f.num}</div>
                    <div className="text-xs" style={{ color: T.textMuted }}>{f.mese}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: ORA */}
        {step === 4 && (
          <div>
            <h3 className="text-2xl mb-2">Scegli l'orario</h3>
            <p className="text-sm mb-6" style={{ color: T.textSoft }}>Orari disponibili</p>
            <div className="grid grid-cols-4 gap-3">
              {orari.map((o) => {
                const sel = ora === o;
                // BLOCCO ANTI-SOVRAPPOSIZIONE DISATTIVATO
                // Per riattivarlo: const occupato = orariOccupati.includes(o);
                const occupato = false;
                return (
                  <button
                    key={o}
                    onClick={() => !occupato && setOra(o)}
                    disabled={occupato}
                    className="py-3 border text-center transition"
                    style={{
                      backgroundColor: occupato ? T.bg : sel ? T.accentSoft : T.card,
                      borderColor: occupato ? T.border : sel ? T.accent : T.border,
                      borderWidth: sel ? "2px" : "1px",
                      color: occupato ? T.textMuted : T.text,
                      textDecoration: occupato ? "line-through" : "none",
                      cursor: occupato ? "not-allowed" : "pointer",
                      opacity: occupato ? 0.5 : 1,
                    }}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: DATI */}
        {step === 5 && (
          <div>
            <h3 className="text-2xl mb-2">I tuoi dati</h3>
            <p className="text-sm mb-6" style={{ color: T.textSoft }}>Ci servono per confermare l'appuntamento</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>NOME E COGNOME *</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full mt-2 p-4 border outline-none" style={{ backgroundColor: T.card, borderColor: T.border, color: T.text }} placeholder="Mario Rossi" />
              </div>
              <div>
                <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>TELEFONO *</label>
                <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full mt-2 p-4 border outline-none" style={{ backgroundColor: T.card, borderColor: T.border, color: T.text }} placeholder="+39 333 1234567" />
              </div>
              <div>
                <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>EMAIL *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-2 p-4 border outline-none" style={{ backgroundColor: T.card, borderColor: T.border, color: T.text }} placeholder="mario@email.it" />
                <div className="text-xs mt-2" style={{ color: T.textMuted }}>Ti invieremo la conferma e il promemoria qui</div>
              </div>
              <div>
                <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>NOTE (opzionale)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full mt-2 p-4 border outline-none resize-none" style={{ backgroundColor: T.card, borderColor: T.border, color: T.text }} placeholder="Es. allergie, preferenze particolari..." />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: PAGAMENTO */}
        {step === 6 && (
          <div>
            <h3 className="text-2xl mb-2">Pagamento</h3>
            <p className="text-sm mb-6" style={{ color: T.textSoft }}>Scegli come pagare</p>

            {/* RIEPILOGO */}
            <div className="p-5 border mb-6" style={{ backgroundColor: T.card, borderColor: T.border }}>
              <div className="text-xs tracking-widest mb-3" style={{ color: T.textMuted }}>RIEPILOGO</div>
              {serviziScelti.map(s => (
                <div key={s.id} className="flex justify-between py-1 text-sm">
                  <span style={{ color: T.textSoft }}>{s.nome}</span>
                  <span>€{s.prezzo}</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 flex justify-between" style={{ borderColor: T.border }}>
                <span className="text-sm" style={{ color: T.textSoft }}>Totale</span>
                <span className="text-lg" style={{ color: T.accent }}>€{totale}</span>
              </div>
              <div className="text-xs mt-3 pt-3 border-t" style={{ color: T.textMuted, borderColor: T.border }}>
                {data && fmtData(data).gs} {data?.getDate()} {data && fmtData(data).mese} · ore {ora} · {staffScelto?.nome}
              </div>
            </div>

            <div className="space-y-3">
              {/* Carta di credito via Stripe */}
              {salone.metodiPagamento.stripe && (
                <button
                  onClick={() => setPaga("carta")}
                  className="w-full p-5 border text-left transition"
                  style={{
                    backgroundColor: paga === "carta" ? T.accentSoft : T.card,
                    borderColor: paga === "carta" ? T.accent : T.border,
                    borderWidth: paga === "carta" ? "2px" : "1px",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5" style={{ color: T.accent }} />
                    <div>
                      <div>Carta di credito/debito</div>
                      <div className="text-xs mt-1" style={{ color: T.textMuted }}>Visa, Mastercard, Amex</div>
                    </div>
                  </div>
                </button>
              )}

              {/* Bonifico */}
              {salone.metodiPagamento.bonifico && (
                <button
                  onClick={() => {
                    setPaga("bonifico");
                    if (!codiceBonifico) {
                      const now = new Date();
                      const giorno = String(now.getDate()).padStart(2, "0");
                      const mese = String(now.getMonth() + 1).padStart(2, "0");
                      const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
                      setCodiceBonifico(`PRE-${giorno}${mese}-${rand}`);
                    }
                  }}
                  className="w-full p-5 border text-left transition"
                  style={{
                    backgroundColor: paga === "bonifico" ? T.accentSoft : T.card,
                    borderColor: paga === "bonifico" ? T.accent : T.border,
                    borderWidth: paga === "bonifico" ? "2px" : "1px",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5" style={{ color: T.accent }} />
                    <div>
                      <div>Bonifico bancario</div>
                      <div className="text-xs mt-1" style={{ color: T.textMuted }}>Visualizza subito IBAN e causale</div>
                    </div>
                  </div>
                </button>
              )}

              {/* In salone */}
              {salone.metodiPagamento.inSalone && (
                <button
                  onClick={() => setPaga("salone")}
                  className="w-full p-5 border text-left transition"
                  style={{
                    backgroundColor: paga === "salone" ? T.accentSoft : T.card,
                    borderColor: paga === "salone" ? T.accent : T.border,
                    borderWidth: paga === "salone" ? "2px" : "1px",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5" style={{ color: T.accent }} />
                    <div>
                      <div>{config.pagaInLoco}</div>
                      <div className="text-xs mt-1" style={{ color: T.textMuted }}>{config.pagaInLocoSub}</div>
                    </div>
                  </div>
                </button>
              )}
            </div>

            {/* Stripe Payment Element — si mostra dopo aver scelto carta */}
            {paga === "carta" && (
              <div className="mt-6 border" style={{ borderColor: T.border }}>
                <div className="px-5 py-3 text-xs tracking-widest font-semibold" style={{ backgroundColor: "#635bff", color: "#fff", letterSpacing: "0.15em" }}>
                  INSERISCI I DATI DELLA CARTA
                </div>
                <div className="p-5" style={{ backgroundColor: T.card }}>
                  {stripeLoading && (
                    <div className="text-sm py-4 text-center" style={{ color: T.textMuted }}>Caricamento form pagamento...</div>
                  )}
                  {stripeError && (
                    <div className="text-sm py-2 px-3 rounded mb-3" style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}>
                      ⚠ {stripeError}
                    </div>
                  )}
                  {/* Stripe monta il suo Payment Element in questo div */}
                  <div id="stripe-payment-element" />
                  {!stripeReady && !stripeLoading && !stripeError && (
                    <div className="text-xs mt-3" style={{ color: T.textMuted }}>Caricamento sicuro tramite Stripe...</div>
                  )}
                </div>
              </div>
            )}

            {/* Blocco bonifico — IBAN + causale visibili subito */}
            {paga === "bonifico" && codiceBonifico && (
              <div className="mt-4 border rounded-none overflow-hidden" style={{ borderColor: T.accent }}>
                {/* Header */}
                <div className="px-5 py-3 text-xs tracking-widest font-semibold" style={{ backgroundColor: T.accent, color: "#fff", letterSpacing: "0.15em" }}>
                  DATI PER IL BONIFICO
                </div>
                <div className="p-5 space-y-4" style={{ backgroundColor: T.card }}>

                  {/* Intestatario */}
                  <div>
                    <div className="text-xs tracking-widest mb-1" style={{ color: T.textMuted }}>INTESTATARIO</div>
                    <div className="text-sm font-semibold" style={{ color: T.text }}>{salone.metodiPagamento?.intestatario}</div>
                  </div>

                  {/* IBAN con copia */}
                  <div>
                    <div className="text-xs tracking-widest mb-1" style={{ color: T.textMuted }}>IBAN</div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-mono text-sm font-semibold tracking-wider" style={{ color: T.text }}>{salone.metodiPagamento?.iban}</div>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(salone.metodiPagamento?.iban || "");
                          setIbanCopiato(true);
                          setTimeout(() => setIbanCopiato(false), 2000);
                        }}
                        className="text-xs px-3 py-1.5 flex-shrink-0 transition"
                        style={{ backgroundColor: ibanCopiato ? T.accent : T.accentSoft, color: ibanCopiato ? "#fff" : T.accent, border: `1px solid ${T.accent}` }}
                      >
                        {ibanCopiato ? "✓ Copiato" : "Copia"}
                      </button>
                    </div>
                  </div>

                  {/* Importo */}
                  {totale > 0 && (
                    <div>
                      <div className="text-xs tracking-widest mb-1" style={{ color: T.textMuted }}>IMPORTO</div>
                      <div className="text-sm font-semibold" style={{ color: T.text }}>€{totale}</div>
                    </div>
                  )}

                  {/* Causale — box evidenziato */}
                  <div className="p-4 border" style={{ backgroundColor: T.accentSoft, borderColor: T.borderStrong }}>
                    <div className="text-xs tracking-widest mb-2 font-semibold" style={{ color: T.accent, letterSpacing: "0.15em" }}>SCRIVI QUESTA CAUSALE</div>
                    <div className="font-mono text-base font-bold mb-3" style={{ color: T.text }}>{codiceBonifico}</div>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(codiceBonifico);
                        setCausaleCopiata(true);
                        setTimeout(() => setCausaleCopiata(false), 2000);
                      }}
                      className="w-full py-2.5 text-sm tracking-widest transition"
                      style={{ backgroundColor: causaleCopiata ? T.accent : T.dark, color: "#fff", letterSpacing: "0.15em" }}
                    >
                      {causaleCopiata ? "✓ CAUSALE COPIATA" : "📋 COPIA CAUSALE"}
                    </button>
                  </div>

                  <p className="text-xs leading-relaxed" style={{ color: T.textMuted }}>
                    Usa questa causale esatta quando effettui il bonifico — il titolare la troverà nella sua banca e identificherà subito la tua prenotazione.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CONFERMA */}
        {step === 7 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ backgroundColor: T.accentSoft, border: `2px solid ${T.accent}` }}>
              <Check className="w-10 h-10" style={{ color: T.accent }} />
            </div>
            <h2 className="text-3xl mb-3">Appuntamento confermato</h2>
            <p className="mb-8" style={{ color: T.textSoft }}>Ti abbiamo inviato una email di conferma. Riceverai un promemoria 24h prima dell'appuntamento.</p>

            <div className="border p-6 text-left max-w-sm mx-auto space-y-4" style={{ backgroundColor: T.card, borderColor: T.border }}>
              <div className="flex items-start gap-3">
                <Scissors className="w-4 h-4 mt-1" style={{ color: T.textMuted }} />
                <div>
                  <div className="text-xs" style={{ color: T.textMuted }}>SERVIZI</div>
                  {serviziScelti.map(s => <div key={s.id}>{s.nome}</div>)}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 mt-1" style={{ color: T.textMuted }} />
                <div>
                  <div className="text-xs" style={{ color: T.textMuted }}>DATA E ORA</div>
                  <div>{data && fmtData(data).gs} {data?.getDate()} {data && fmtData(data).mese} · ore {ora}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 mt-1" style={{ color: T.textMuted }} />
                <div>
                  <div className="text-xs" style={{ color: T.textMuted }}>STYLIST</div>
                  <div>{staffScelto?.nome}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="w-4 h-4 mt-1" style={{ color: T.textMuted }} />
                <div>
                  <div className="text-xs" style={{ color: T.textMuted }}>PAGAMENTO</div>
                  <div>{paga === "salone" ? `€${totale} in salone` : `Pagato €${totale}`}</div>
                </div>
              </div>
            </div>

            <button onClick={reset} className="mt-8 text-sm tracking-widest transition" style={{ color: T.textSoft, letterSpacing: "0.2em" }}>
              NUOVA PRENOTAZIONE
            </button>
          </div>
        )}
      </main>

      {/* BOTTOM BAR */}
      {step >= 1 && step <= 6 && (
        <div className="fixed bottom-0 left-0 right-0 border-t" style={{ backgroundColor: T.card, borderColor: T.border }}>
          <div className="max-w-2xl mx-auto px-4 py-4 flex gap-2">
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 px-3 py-4 border text-sm transition flex items-center justify-center gap-2 whitespace-nowrap"
              style={{ borderColor: T.borderStrong, color: T.text, letterSpacing: "0.05em" }}
            >
              <ArrowLeft className="w-4 h-4 flex-shrink-0" /> INDIETRO
            </button>
            <button
              onClick={() => step === 6 ? inviaPrenotazione() : setStep(step + 1)}
              disabled={!puoAvanzare || invioInCorso}
              className="flex-[2] px-4 py-4 text-sm transition flex items-center justify-center gap-2 disabled:opacity-30 whitespace-nowrap"
              style={{ backgroundColor: T.dark, color: T.bg, letterSpacing: "0.05em" }}
            >
              {invioInCorso ? "INVIO..." : step === 6 ? "CONFERMA" : "AVANTI"} <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* TOAST "Link copiato" */}
      {linkCopiato && (
        <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", background: T.dark, color: T.bg, padding: "12px 20px", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", fontSize: 14, zIndex: 10001, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
          <Check size={16} /> Link copiato negli appunti
        </div>
      )}

      {/* MODAL CONDIVISIONE fallback */}
      {shareModalAperto && (
        <div onClick={() => setShareModalAperto(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "28px 24px", maxWidth: 460, width: "100%", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: T.text }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 20, fontWeight: 400, margin: 0 }}>Condividi {salone.nome}</h3>
              <button onClick={() => setShareModalAperto(false)} style={{ background: "transparent", border: "none", color: T.textSoft, cursor: "pointer", padding: 4, display: "flex" }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: T.textSoft, margin: "0 0 16px", lineHeight: 1.5 }}>Copia il link qui sotto e incollalo dove vuoi:</p>
            <div style={{ padding: 14, background: T.bg, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "monospace", color: T.text, wordBreak: "break-all", marginBottom: 16 }}>
              {typeof window !== "undefined" ? window.location.href : "https://prenoty.com"}
            </div>
            <p style={{ fontSize: 11, color: T.textMuted, fontStyle: "italic", margin: "0 0 20px", lineHeight: 1.5 }}>
              💡 Tieni premuto sul testo qui sopra e tocca "Copia". Sui telefoni moderni l'icona condividi apre direttamente il menu nativo.
            </p>
            <button onClick={() => setShareModalAperto(false)} style={{ width: "100%", padding: 12, background: T.dark, color: T.bg, border: "none", fontFamily: "inherit", fontSize: 13, letterSpacing: "0.15em", cursor: "pointer" }}>CHIUDI</button>
          </div>
        </div>
      )}

      {/* MODAL "Aggiungi alla home" - istruzioni PWA con illustrazioni */}
      {pwaModalAperto && (
        <div
          onClick={() => setPwaModalAperto(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 10000 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: T.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: "24px 24px 40px", maxWidth: 500, width: "100%", color: T.text, maxHeight: "90vh", overflowY: "auto" }}
          >
            {/* Handle bar */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border, margin: "0 auto 20px" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 6px" }}>Aggiungi alla schermata Home</h3>
                <p style={{ fontSize: 13, color: T.textSoft, margin: 0, lineHeight: 1.5 }}>
                  Accedi a <strong style={{ color: T.text }}>{salone.nome}</strong> con un tocco, come un'app — senza passare dall'App Store.
                </p>
              </div>
              <button onClick={() => setPwaModalAperto(false)} style={{ background: "transparent", border: "none", color: T.textMuted, cursor: "pointer", padding: 4, flexShrink: 0, marginLeft: 12 }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Step 1 */}
              <div style={{ background: T.bg, borderRadius: 16, padding: "16px 18px", display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>1</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Tocca il tasto <strong>Condividi</strong> del browser</div>
                  <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>Su iPhone: icona quadrato con freccia in basso alla pagina. Su Android: i 3 puntini in alto a destra.</div>
                </div>
                <div style={{ flexShrink: 0, width: 36, height: 36, border: `1.5px solid ${T.border}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                </div>
              </div>
              {/* Step 2 */}
              <div style={{ background: T.bg, borderRadius: 16, padding: "16px 18px", display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>2</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Tocca <strong>"Aggiungi alla schermata Home"</strong></div>
                  <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>Su alcuni dispositivi Android compare come "Installa app".</div>
                </div>
                <div style={{ flexShrink: 0, width: 36, height: 36, border: `1.5px solid ${T.border}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </div>
              </div>
              {/* Step 3 */}
              <div style={{ background: T.bg, borderRadius: 16, padding: "16px 18px", display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>3</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Tocca <strong>"Aggiungi"</strong> per confermare</div>
                  <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>L'icona del salone apparirà subito nella tua schermata Home.</div>
                </div>
                <div style={{ flexShrink: 0, width: 36, height: 36, border: `1.5px solid ${T.border}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
            </div>

            <button onClick={() => setPwaModalAperto(false)} style={{ width: "100%", marginTop: 20, padding: 15, background: T.accent, color: "#fff", border: "none", borderRadius: 12, fontFamily: "inherit", fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", cursor: "pointer" }}>
              HO CAPITO
            </button>
          </div>
        </div>
      )}

      {/* Footer Prenoty (riconoscibile, niente di invadente) */}
      <footer className="text-center py-6 text-xs" style={{ color: T.textMuted, borderTop: `1px solid ${T.border}`, marginTop: 32 }}>
        Powered by <a href="https://prenoty.com" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Prenoty</a>
      </footer>

      {/* PULSANTE WHATSAPP — modalità pubblica (per i clienti finali del salone) */}
      {/* MODAL "Scrivi recensione" */}
      {modalRecensioneAperto && (
        <div
          onClick={() => !recensioneInviata && setModalRecensioneAperto(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
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
              maxWidth: 480,
              width: "100%",
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
              color: T.text,
            }}
          >
            {recensioneInviata ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Check size={32} color={T.accent} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 400, margin: "0 0 8px" }}>Grazie!</h3>
                <p style={{ fontSize: 14, color: T.textSoft, margin: 0 }}>La tua recensione è stata pubblicata.</p>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 20, fontWeight: 400, margin: "0 0 6px" }}>Scrivi una recensione</h3>
                <p style={{ fontSize: 13, color: T.textSoft, margin: "0 0 20px" }}>
                  Racconta la tua esperienza presso {salone.nome}
                </p>

                <label style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.15em" }}>VALUTAZIONE</label>
                <div style={{ display: "flex", gap: 4, margin: "8px 0 20px" }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setNuovaRecensione({ ...nuovaRecensione, stelle: n })}
                      style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
                    >
                      <Star size={32} style={{ fill: n <= nuovaRecensione.stelle ? T.accent : "transparent", color: T.accent }} />
                    </button>
                  ))}
                </div>

                <label style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.15em" }}>IL TUO NOME</label>
                <input
                  type="text"
                  value={nuovaRecensione.nome}
                  onChange={(e) => setNuovaRecensione({ ...nuovaRecensione, nome: e.target.value })}
                  placeholder="es. Marco R."
                  style={{ width: "100%", padding: "10px 12px", margin: "6px 0 16px", background: T.bg, border: `1px solid ${T.border}`, color: T.text, fontFamily: "inherit", fontSize: 14, outline: "none" }}
                />

                <label style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.15em" }}>LA TUA ESPERIENZA</label>
                <textarea
                  value={nuovaRecensione.testo}
                  onChange={(e) => setNuovaRecensione({ ...nuovaRecensione, testo: e.target.value })}
                  placeholder="Cosa ti è piaciuto? Cosa miglioreresti?"
                  rows={4}
                  style={{ width: "100%", padding: "10px 12px", margin: "6px 0 4px", background: T.bg, border: `1px solid ${T.border}`, color: T.text, fontFamily: "inherit", fontSize: 14, outline: "none", resize: "none" }}
                />
                <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 20 }}>
                  {nuovaRecensione.testo.length} / 500 caratteri
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setModalRecensioneAperto(false)}
                    style={{ flex: 1, padding: "12px", background: "transparent", border: `1px solid ${T.border}`, color: T.textSoft, fontFamily: "inherit", fontSize: 13, letterSpacing: "0.15em", cursor: "pointer" }}
                  >
                    ANNULLA
                  </button>
                  <button
                    onClick={inviaRecensione}
                    disabled={!nuovaRecensione.testo.trim() || !nuovaRecensione.nome.trim()}
                    style={{ flex: 1, padding: "12px", background: T.accent, border: "none", color: "#fff", fontFamily: "inherit", fontSize: 13, letterSpacing: "0.15em", cursor: (!nuovaRecensione.testo.trim() || !nuovaRecensione.nome.trim()) ? "not-allowed" : "pointer", opacity: (!nuovaRecensione.testo.trim() || !nuovaRecensione.nome.trim()) ? 0.4 : 1 }}
                  >
                    PUBBLICA
                  </button>
                </div>

                <p style={{ fontSize: 11, color: T.textMuted, marginTop: 16, fontStyle: "italic", lineHeight: 1.5 }}>
                  La tua recensione sarà pubblicata immediatamente e visibile a tutti.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* WhatsAppAssistenza spostata nella navbar */}
    </div>
    </>
  );
}
