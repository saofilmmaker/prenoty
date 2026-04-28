import { useState } from "react";
import { Scissors, Calendar, X, Clock, User, Check, CreditCard, ArrowLeft, ArrowRight, Sparkles, MapPin, Phone, Star, Mail, Camera, Globe, ChevronDown, Image as ImageIcon, Heart, Flower2, Share2, Smartphone } from "lucide-react";
import WhatsAppAssistenza from "./whatsapp-assistenza";

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
  },
  estetista: {
    nome: "Estetista",
    icona: Sparkles,
    operatoreSing: "Estetista",
    operatorePlur: "Le nostre estetiste",
    tagline: "La tua bellezza, su misura",
  },
  spa: {
    nome: "SPA",
    icona: Flower2,
    operatoreSing: "Terapista",
    operatorePlur: "I nostri terapisti",
    tagline: "Il tuo momento di puro relax",
  },
  generico: {
    nome: "Altro",
    icona: Calendar,
    operatoreSing: "Operatore",
    operatorePlur: "Il nostro team",
    tagline: "Il tuo appuntamento, semplice",
  },
};

export default function AppCliente() {
  // TEMA (il cliente può scegliere; il salone ha un default)
  const [tema, setTema] = useState("chiaro");

  // Modal "Aggiungi alla home" — banner istruzioni PWA su mobile
  const [pwaModalAperto, setPwaModalAperto] = useState(false);

  // Modal e toast condivisione (con fallback)
  const [shareModalAperto, setShareModalAperto] = useState(false);
  const [linkCopiato, setLinkCopiato] = useState(false);

  // Funzione condividi — strategia a 3 livelli
  const condividiSalone = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "https://prenoty.com";
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

  // DATI SALONE (in produzione: da Supabase)
  const salone = {
    nome: "Atelier Bellezza",
    tipoAttivita: "parrucchiere", // parrucchiere | estetista | spa
    indirizzo: "Via Roma 12, Milano",
    telefono: "+39 02 1234567",
    email: "info@atelierbellezza.it",
    logo: null, // se il salone carica un logo, apparirà qui

    // VETRINA — dati che il parrucchiere imposta dalla sua dashboard
    descrizione: "Salone storico nel cuore di Milano. Specializzati in colore, taglio e cura della persona. Ti aspettiamo con un caffè.",
    galleria: [], // foto del salone (data URL) - vuota di default in demo
    social: {
      Camera: "https://Camera.com/atelierbellezza",
      tiktok: "",
      Globe: "",
      sito: "",
    },
    orari: { Lunedì: "09:00 – 19:00", Martedì: "09:00 – 19:00", Mercoledì: "09:00 – 19:00", Giovedì: "09:00 – 19:00", Venerdì: "09:00 – 19:00", Sabato: "09:00 – 18:00", Domenica: "Chiuso" },

    // INTERRUTTORI VETRINA — il parrucchiere decide cosa mostrare
    mostraRecensioni: true,
    mostraMappa: true,
    mostraOrari: true,
    mostraGalleria: true,
    mostraSocial: true,

    // Metodi di pagamento che il salone ha attivato nella sua dashboard
    metodiPagamento: {
      carta: true,
      applePay: true,
      googlePay: true,
      nexi: true,            // Nexi Pay — molto usato in Italia (specialmente nord)
      paypal: false,
      bonifico: false,
      inSalone: true,
    },
  };

  // RECENSIONI (in produzione: lette da Supabase, scritte tramite form)
  const [recensioni, setRecensioni] = useState([
    { id: 1, nome: "Sofia E.", stelle: 5, testo: "Servizio impeccabile, Marco è bravissimo con il colore. Tornerò sicuramente!", data: "15 apr 2026" },
    { id: 2, nome: "Giulia R.", stelle: 5, testo: "Ambiente elegante e personale gentile. Il taglio è perfetto.", data: "10 apr 2026" },
    { id: 3, nome: "Anna V.", stelle: 4, testo: "Bella esperienza, prezzi giusti. Consigliato.", data: "5 apr 2026" },
    { id: 4, nome: "Laura C.", stelle: 5, testo: "Le ragazze sono dolcissime, mi sento sempre coccolata. Top.", data: "28 mar 2026" },
  ]);
  const mediaStelle = recensioni.length > 0
    ? (recensioni.reduce((s, r) => s + r.stelle, 0) / recensioni.length).toFixed(1)
    : 0;

  // Form "Scrivi recensione"
  const [modalRecensioneAperto, setModalRecensioneAperto] = useState(false);
  const [nuovaRecensione, setNuovaRecensione] = useState({ nome: "", stelle: 5, testo: "" });
  const [recensioneInviata, setRecensioneInviata] = useState(false);

  const inviaRecensione = () => {
    const testo = nuovaRecensione.testo.trim();
    const nome = nuovaRecensione.nome.trim();
    if (!testo || !nome) return;
    const nuova = {
      id: Math.max(0, ...recensioni.map(r => r.id)) + 1,
      nome: nome,
      stelle: nuovaRecensione.stelle,
      testo: testo,
      data: "Adesso",
    };
    setRecensioni([nuova, ...recensioni]);
    setRecensioneInviata(true);
    setTimeout(() => {
      setModalRecensioneAperto(false);
      setRecensioneInviata(false);
      setNuovaRecensione({ nome: "", stelle: 5, testo: "" });
    }, 2000);
  };

  // Configurazione dinamica in base al tipo di attività del salone
  const config = CONFIG_ATTIVITA[salone.tipoAttivita] || CONFIG_ATTIVITA.parrucchiere;
  const IconaAttivita = config.icona;

  const servizi = [
    { id: 1, nome: "Taglio Donna", durata: 45, prezzo: 35, cat: "Taglio" },
    { id: 2, nome: "Taglio Uomo", durata: 30, prezzo: 20, cat: "Taglio" },
    { id: 3, nome: "Colore", durata: 90, prezzo: 65, cat: "Colore" },
    { id: 4, nome: "Piega", durata: 30, prezzo: 25, cat: "Styling" },
    { id: 5, nome: "Taglio + Piega", durata: 60, prezzo: 50, cat: "Taglio" },
    { id: 6, nome: "Colpi di Sole", durata: 120, prezzo: 85, cat: "Colore" },
  ];

  const staff = [
    { id: 0, nome: "Chiunque disponibile", ruolo: "Primo disponibile", colore: "#9b96c8", foto: null },
    { id: 1, nome: "Marco Ferrari", ruolo: "Titolare", colore: "#6c5ce7", rating: 4.9, foto: null },
    { id: 2, nome: "Laura Bianchi", ruolo: "Senior Stylist", colore: "#a29bfe", rating: 4.8, foto: null },
    { id: 3, nome: "Giulia Conti", ruolo: "Colorista", colore: "#fd79a8", rating: 4.9, foto: null },
  ];

  const orari = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];

  const giorni = [];
  const oggi = new Date();
  let i = 0;
  while (giorni.length < 14) {
    const g = new Date(oggi);
    g.setDate(oggi.getDate() + i);
    if (g.getDay() !== 0) giorni.push(g);
    i++;
  }

  const fmtData = (d) => {
    const gs = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
    const ms = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
    return { gs: gs[d.getDay()], num: d.getDate(), mese: ms[d.getMonth()] };
  };

  const totale = serviziScelti.reduce((s, x) => s + x.prezzo, 0);
  const durataTotale = serviziScelti.reduce((s, x) => s + x.durata, 0);

  const reset = () => {
    setStep(0); setServiziScelti([]); setStaffScelto(null); setData(null); setOra(null);
    setNome(""); setTelefono(""); setEmail(""); setNote(""); setPaga(null);
  };

  const toggleServizio = (s) => {
    setServiziScelti(serviziScelti.find(x => x.id === s.id)
      ? serviziScelti.filter(x => x.id !== s.id)
      : [...serviziScelti, s]);
  };

  const puoAvanzare =
    (step === 1 && serviziScelti.length > 0) ||
    (step === 2 && staffScelto !== null) ||
    (step === 3 && data) ||
    (step === 4 && ora) ||
    (step === 5 && nome.trim() && telefono.trim() && email.trim()) ||
    (step === 6 && paga);

  return (
    <div className="min-h-screen" style={{ backgroundColor: T.bg, fontFamily: "Georgia, 'Times New Roman', serif", color: T.text }}>
      {/* HEADER */}
      <header className="sticky top-0 z-10 border-b" style={{ backgroundColor: T.card, borderColor: T.border }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo del salone o iniziali fallback */}
            {salone.logo ? (
              <img src={salone.logo} alt={salone.nome} className="w-10 h-10 rounded-full object-cover border" style={{ borderColor: T.border }} />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                style={{ backgroundColor: T.accentSoft, color: T.accent, border: `1px solid ${T.border}` }}
              >
                {salone.nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-sm tracking-wide" style={{ letterSpacing: "0.1em" }}>{salone.nome.toUpperCase()}</h1>
              {salone.mostraRecensioni && recensioni.length > 0 && (
                <div className="flex items-center gap-1 text-xs" style={{ color: T.textMuted }}>
                  <Star className="w-3 h-3 fill-current" style={{ color: T.accent }} />
                  {mediaStelle} · {recensioni.length} recensioni
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={condividiSalone}
              className="p-2 rounded transition"
              style={{ color: T.textSoft }}
              title="Condividi"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTema(tema === "chiaro" ? "scuro" : "chiaro")}
              className="p-2 rounded transition text-xs tracking-widest"
              style={{ color: T.textSoft, letterSpacing: "0.1em" }}
            >
              {tema === "chiaro" ? "SCURO" : "CHIARO"}
            </button>
          </div>
        </div>
      </header>

      {/* BANNER PWA — visibile solo su mobile, solo in step 0 (home) */}
      {step === 0 && (
        <div
          className="md:hidden flex items-center justify-between gap-2 px-4 py-2.5 border-b"
          style={{ backgroundColor: T.dark, color: T.bg, borderColor: T.borderStrong }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Smartphone className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs truncate">Aggiungi alla home — accedi più rapidamente</span>
          </div>
          <button
            onClick={() => setPwaModalAperto(true)}
            className="text-xs tracking-widest whitespace-nowrap px-3 py-1.5"
            style={{ backgroundColor: T.bg, color: T.dark, letterSpacing: "0.1em" }}
          >
            COME?
          </button>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-6 py-8 pb-32">
        {/* HOME */}
        {step === 0 && (
          <div className="space-y-8 pb-8">
            {/* HERO — Logo, nome, rating, descrizione */}
            <div className="text-center pt-4 pb-2">
              {salone.logo && (
                <img src={salone.logo} alt={salone.nome} className="w-20 h-20 mx-auto mb-4 object-contain" />
              )}
              <h1 className="text-4xl mb-3 leading-tight">{salone.nome}</h1>

              {/* Rating compatto (solo se attivato) */}
              {salone.mostraRecensioni && recensioni.length > 0 && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star
                        key={n}
                        className="w-4 h-4"
                        style={{
                          fill: n <= Math.round(mediaStelle) ? T.accent : "transparent",
                          color: T.accent,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm" style={{ color: T.textSoft }}>
                    {mediaStelle} · {recensioni.length} recensioni
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
                style={{ backgroundColor: T.dark, color: T.bg, letterSpacing: "0.2em" }}
              >
                PRENOTA ORA
              </button>
            </div>

            {/* GALLERIA (se attivata e ci sono foto) */}
            {salone.mostraGalleria && salone.galleria.length > 0 && (
              <div>
                <div className="text-xs tracking-widest mb-3" style={{ color: T.textMuted, letterSpacing: "0.2em" }}>GALLERIA</div>
                <div className="grid grid-cols-3 gap-2">
                  {salone.galleria.map((foto, i) => (
                    <div key={i} className="aspect-square overflow-hidden border" style={{ borderColor: T.border }}>
                      <img src={foto} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
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
                    onClick={() => { setServiziScelti([s.id]); setStep(1); }}
                    className="p-4 border flex items-center justify-between cursor-pointer transition hover:opacity-80"
                    style={{ backgroundColor: T.card, borderColor: T.border }}
                  >
                    <div>
                      <div className="text-sm">{s.nome}</div>
                      <div className="text-xs mt-0.5" style={{ color: T.textMuted }}>{s.durata} min</div>
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
            <div>
              <div className="text-xs tracking-widest mb-3" style={{ color: T.textMuted, letterSpacing: "0.2em" }}>{config.operatorePlur.toUpperCase()}</div>
              <div className="grid grid-cols-3 gap-2">
                {staff.filter(s => s.id !== 0).map(s => (
                  <div
                    key={s.id}
                    className="p-3 border text-center"
                    style={{ backgroundColor: T.card, borderColor: T.border }}
                  >
                    {s.foto ? (
                      <div className="w-14 h-14 rounded-full mx-auto mb-2 overflow-hidden border-2" style={{ borderColor: s.colore }}>
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
                  {recensioni.slice(0, 3).map(r => (
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
                    </div>
                  ))}
                </div>

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

            {/* MAPPA + INDIRIZZO (se attivata) */}
            {salone.mostraMappa && (
              <div>
                <div className="text-xs tracking-widest mb-3" style={{ color: T.textMuted, letterSpacing: "0.2em" }}>DOVE SIAMO</div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salone.indirizzo)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border overflow-hidden transition hover:opacity-80"
                  style={{ backgroundColor: T.card, borderColor: T.border }}
                >
                  {/* Mappa statica via OpenStreetMap embed (gratis, no API key) */}
                  <div className="aspect-video w-full bg-gray-100 relative">
                    <iframe
                      title="Mappa salone"
                      width="100%"
                      height="100%"
                      style={{ border: 0, filter: tema === "scuro" ? "invert(0.9) hue-rotate(180deg)" : "none" }}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=9.18,45.46,9.20,45.47&layer=mapnik&marker=45.4642,9.19`}
                    />
                  </div>
                  <div className="p-4 flex items-center gap-3">
                    <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: T.accent }} />
                    <div className="flex-1">
                      <div className="text-sm">{salone.indirizzo}</div>
                      <div className="text-xs mt-0.5" style={{ color: T.accent }}>Apri in Google Maps →</div>
                    </div>
                  </div>
                </a>
              </div>
            )}

            {/* ORARI (se attivati) */}
            {salone.mostraOrari && (
              <div>
                <div className="text-xs tracking-widest mb-3" style={{ color: T.textMuted, letterSpacing: "0.2em" }}>ORARI DI APERTURA</div>
                <div className="p-4 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                  {Object.entries(salone.orari).map(([giorno, orario]) => (
                    <div key={giorno} className="flex items-center justify-between py-1.5 text-sm">
                      <span>{giorno}</span>
                      <span style={{ color: orario === "Chiuso" ? T.textMuted : T.text }}>{orario}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTATTI + SOCIAL */}
            <div>
              <div className="text-xs tracking-widest mb-3" style={{ color: T.textMuted, letterSpacing: "0.2em" }}>CONTATTI</div>
              <div className="space-y-2">
                <a href={`tel:${salone.telefono}`} className="p-4 border flex items-center gap-3 transition hover:opacity-80" style={{ backgroundColor: T.card, borderColor: T.border }}>
                  <Phone className="w-4 h-4" style={{ color: T.accent }} />
                  <span className="text-sm">{salone.telefono}</span>
                </a>
                {salone.email && (
                  <a href={`mailto:${salone.email}`} className="p-4 border flex items-center gap-3 transition hover:opacity-80" style={{ backgroundColor: T.card, borderColor: T.border }}>
                    <Mail className="w-4 h-4" style={{ color: T.accent }} />
                    <span className="text-sm">{salone.email}</span>
                  </a>
                )}
              </div>

              {/* SOCIAL (se attivati e almeno uno compilato) */}
              {salone.mostraSocial && Object.values(salone.social).some(v => v) && (
                <div className="flex gap-3 justify-center mt-4">
                  {salone.social.Camera && (
                    <a href={salone.social.Camera} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border rounded-full flex items-center justify-center transition hover:opacity-70" style={{ borderColor: T.border, color: T.text }}>
                      <Camera className="w-4 h-4" />
                    </a>
                  )}
                  {salone.social.tiktok && (
                    <a href={salone.social.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border rounded-full flex items-center justify-center transition hover:opacity-70" style={{ borderColor: T.border, color: T.text }}>
                      <span className="text-xs font-bold">TT</span>
                    </a>
                  )}
                  {salone.social.Globe && (
                    <a href={salone.social.Globe} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border rounded-full flex items-center justify-center transition hover:opacity-70" style={{ borderColor: T.border, color: T.text }}>
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  {salone.social.sito && (
                    <a href={salone.social.sito} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border rounded-full flex items-center justify-center transition hover:opacity-70" style={{ borderColor: T.border, color: T.text }}>
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* CTA finale ridondante (per chi scrolla fino in fondo) */}
            <div className="text-center pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-12 py-4 tracking-widest text-sm transition"
                style={{ backgroundColor: T.dark, color: T.bg, letterSpacing: "0.2em" }}
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
                    onClick={() => setData(g)}
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
                return (
                  <button
                    key={o}
                    onClick={() => setOra(o)}
                    className="py-3 border text-center transition"
                    style={{
                      backgroundColor: sel ? T.accentSoft : T.card,
                      borderColor: sel ? T.accent : T.border,
                      borderWidth: sel ? "2px" : "1px",
                      color: T.text,
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
              {/* Carta di credito */}
              {salone.metodiPagamento.carta && (
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

              {/* Apple Pay */}
              {salone.metodiPagamento.applePay && (
                <button
                  onClick={() => setPaga("applePay")}
                  className="w-full p-5 border text-left transition"
                  style={{
                    backgroundColor: paga === "applePay" ? T.accentSoft : T.card,
                    borderColor: paga === "applePay" ? T.accent : T.border,
                    borderWidth: paga === "applePay" ? "2px" : "1px",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl"></span>
                    <div>
                      <div>Apple Pay</div>
                      <div className="text-xs mt-1" style={{ color: T.textMuted }}>Pagamento rapido con Face ID</div>
                    </div>
                  </div>
                </button>
              )}

              {/* Google Pay */}
              {salone.metodiPagamento.googlePay && (
                <button
                  onClick={() => setPaga("googlePay")}
                  className="w-full p-5 border text-left transition"
                  style={{
                    backgroundColor: paga === "googlePay" ? T.accentSoft : T.card,
                    borderColor: paga === "googlePay" ? T.accent : T.border,
                    borderWidth: paga === "googlePay" ? "2px" : "1px",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">G</span>
                    <div>
                      <div>Google Pay</div>
                      <div className="text-xs mt-1" style={{ color: T.textMuted }}>Pagamento rapido da Android</div>
                    </div>
                  </div>
                </button>
              )}

              {/* Nexi — molto diffuso in Italia */}
              {salone.metodiPagamento.nexi && (
                <button
                  onClick={() => setPaga("nexi")}
                  className="w-full p-5 border text-left transition"
                  style={{
                    backgroundColor: paga === "nexi" ? T.accentSoft : T.card,
                    borderColor: paga === "nexi" ? T.accent : T.border,
                    borderWidth: paga === "nexi" ? "2px" : "1px",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-xs font-bold rounded" style={{ backgroundColor: "#003a70", color: "#fff", letterSpacing: "0.05em" }}>nexi</span>
                    <div>
                      <div>Nexi</div>
                      <div className="text-xs mt-1" style={{ color: T.textMuted }}>Carte Nexi, Cartasì, PagoBancomat</div>
                    </div>
                  </div>
                </button>
              )}

              {/* PayPal */}
              {salone.metodiPagamento.paypal && (
                <button
                  onClick={() => setPaga("paypal")}
                  className="w-full p-5 border text-left transition"
                  style={{
                    backgroundColor: paga === "paypal" ? T.accentSoft : T.card,
                    borderColor: paga === "paypal" ? T.accent : T.border,
                    borderWidth: paga === "paypal" ? "2px" : "1px",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold" style={{ color: "#003087" }}>PayPal</span>
                    <div>
                      <div>PayPal</div>
                      <div className="text-xs mt-1" style={{ color: T.textMuted }}>Paga con il tuo account PayPal</div>
                    </div>
                  </div>
                </button>
              )}

              {/* Bonifico */}
              {salone.metodiPagamento.bonifico && (
                <button
                  onClick={() => setPaga("bonifico")}
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
                      <div className="text-xs mt-1" style={{ color: T.textMuted }}>Riceverai l'IBAN via email</div>
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
                      <div>Paga in salone</div>
                      <div className="text-xs mt-1" style={{ color: T.textMuted }}>Al termine del servizio</div>
                    </div>
                  </div>
                </button>
              )}
            </div>

            {/* Form carta solo se ha scelto carta */}
            {paga === "carta" && (
              <div className="mt-6 p-5 border space-y-3" style={{ backgroundColor: T.card, borderColor: T.border }}>
                <input type="text" placeholder="Numero carta" className="w-full p-3 border outline-none" style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text }} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="MM/AA" className="p-3 border outline-none" style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text }} />
                  <input type="text" placeholder="CVV" className="p-3 border outline-none" style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text }} />
                </div>
              </div>
            )}

            {/* Avviso bonifico */}
            {paga === "bonifico" && (
              <div className="mt-6 p-4 border text-sm" style={{ backgroundColor: T.accentSoft, borderColor: T.accent, color: T.textSoft }}>
                Dopo la conferma riceverai via email l'IBAN per effettuare il bonifico. L'appuntamento sarà confermato al ricevimento del pagamento.
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
              onClick={() => setStep(step + 1)}
              disabled={!puoAvanzare}
              className="flex-[2] px-4 py-4 text-sm transition flex items-center justify-center gap-2 disabled:opacity-30 whitespace-nowrap"
              style={{ backgroundColor: T.dark, color: T.bg, letterSpacing: "0.05em" }}
            >
              {step === 6 ? "CONFERMA" : "AVANTI"} <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* TOAST "Link copiato" */}
      {linkCopiato && (
        <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", background: T.dark, color: T.bg, padding: "12px 20px", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 14, zIndex: 10001, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
          <Check size={16} /> Link copiato negli appunti
        </div>
      )}

      {/* MODAL CONDIVISIONE fallback */}
      {shareModalAperto && (
        <div onClick={() => setShareModalAperto(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "28px 24px", maxWidth: 460, width: "100%", fontFamily: "Georgia, 'Times New Roman', serif", color: T.text }}>
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

      {/* MODAL "Aggiungi alla home" - istruzioni PWA */}
      {pwaModalAperto && (
        <div
          onClick={() => setPwaModalAperto(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 10000 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.card,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: "28px 24px 36px",
              maxWidth: 500,
              width: "100%",
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: T.text,
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h3 style={{ fontSize: 20, fontWeight: 400, margin: 0 }}>Aggiungi alla schermata home</h3>
              <button onClick={() => setPwaModalAperto(false)} style={{ background: "transparent", border: "none", color: T.textSoft, cursor: "pointer", padding: 4, display: "flex" }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: T.textSoft, margin: "0 0 24px", lineHeight: 1.6 }}>
              Accederai a <strong style={{ color: T.text }}>{salone.nome}</strong> con un solo tocco, come un'app nativa. Nessun download dall'App Store.
            </p>

            {isIOS ? (
              <div>
                <div style={{ fontSize: 11, color: T.accent, letterSpacing: "0.2em", marginBottom: 14 }}>SU IPHONE / SAFARI</div>
                <div style={{ display: "flex", gap: 14, marginBottom: 18, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 14, flexShrink: 0 }}>1</div>
                  <div>
                    <div style={{ fontSize: 14, marginBottom: 4 }}>Tocca il pulsante <strong>Condividi</strong></div>
                    <div style={{ fontSize: 12, color: T.textMuted }}>L'icona del quadrato con la freccia in alto, in basso al centro della pagina (Safari).</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 14, marginBottom: 18, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 14, flexShrink: 0 }}>2</div>
                  <div>
                    <div style={{ fontSize: 14, marginBottom: 4 }}>Scorri e tocca <strong>"Aggiungi alla schermata Home"</strong></div>
                    <div style={{ fontSize: 12, color: T.textMuted }}>Trovi l'opzione nella seconda riga del menu condivisione.</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 14, flexShrink: 0 }}>3</div>
                  <div>
                    <div style={{ fontSize: 14, marginBottom: 4 }}>Tocca <strong>"Aggiungi"</strong> in alto a destra</div>
                    <div style={{ fontSize: 12, color: T.textMuted }}>L'icona del salone apparirà nella tua home, come un'app.</div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 11, color: T.accent, letterSpacing: "0.2em", marginBottom: 14 }}>SU ANDROID / CHROME</div>
                <div style={{ display: "flex", gap: 14, marginBottom: 18, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 14, flexShrink: 0 }}>1</div>
                  <div>
                    <div style={{ fontSize: 14, marginBottom: 4 }}>Tocca i <strong>3 puntini</strong> in alto a destra</div>
                    <div style={{ fontSize: 12, color: T.textMuted }}>Apre il menu di Chrome.</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 14, marginBottom: 18, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 14, flexShrink: 0 }}>2</div>
                  <div>
                    <div style={{ fontSize: 14, marginBottom: 4 }}>Tocca <strong>"Installa app"</strong> o <strong>"Aggiungi a schermata Home"</strong></div>
                    <div style={{ fontSize: 12, color: T.textMuted }}>L'opzione si chiama in modo leggermente diverso a seconda della versione Android.</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 14, flexShrink: 0 }}>3</div>
                  <div>
                    <div style={{ fontSize: 14, marginBottom: 4 }}>Conferma con <strong>"Installa"</strong> o <strong>"Aggiungi"</strong></div>
                    <div style={{ fontSize: 12, color: T.textMuted }}>L'icona del salone apparirà nella tua home.</div>
                  </div>
                </div>
              </div>
            )}

            <button onClick={() => setPwaModalAperto(false)} style={{ width: "100%", marginTop: 24, padding: 14, background: T.dark, color: T.bg, border: "none", fontFamily: "inherit", fontSize: 13, letterSpacing: "0.15em", cursor: "pointer" }}>HO CAPITO</button>
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
              fontFamily: "Georgia, 'Times New Roman', serif",
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

      <WhatsAppAssistenza tema={tema} numero={salone.telefono.replace(/[^0-9]/g, "")} pubblico />
    </div>
  );
}
