import { useState } from "react";
import { Scissors, Calendar, Clock, User, Phone, CheckCircle, XCircle, CreditCard, Euro, TrendingUp, Bell, Search, MoreVertical, Settings, Users, Package, BarChart3, Home, Sun, Moon, Plus, Edit2, Trash2, Star, MessageSquare, LogOut, ChevronLeft, ChevronRight, FileText, Gift, Image, Camera, Globe, MapPin, X, Mail, Sparkles, Heart, Flower2 } from "lucide-react";
import WhatsAppAssistenza from "./whatsapp-assistenza";

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

export default function DashboardPrenoty() {
  // TEMA
  const [tema, setTema] = useState("chiaro"); // chiaro | scuro
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
  const [dettaglio, setDettaglio] = useState(null);
  const [menuAperto, setMenuAperto] = useState(false);

  // TIPO DI ATTIVITÀ (parrucchiere | estetista | spa)
  // Determina servizi predefiniti, etichette, icona, in tutta l'app.
  // In produzione viene salvato in Supabase al primo accesso.
  const [tipoAttivita, setTipoAttivita] = useState("parrucchiere");
  const config = CONFIG_ATTIVITA[tipoAttivita];
  const IconaAttivita = config.icona;

  // DATI SALONE (modificabili in impostazioni → così l'app serve per qualsiasi attività beauty)
  const [salone, setSalone] = useState({
    nome: "Atelier Bellezza",
    indirizzo: "Via Roma 12, Milano",
    telefono: "+39 02 1234567",
    email: "info@atelierbellezza.it",
    logo: null, // URL dell'immagine del logo caricato dal parrucchiere
    orari: { lun: "09:00-19:00", mar: "09:00-19:00", mer: "09:00-19:00", gio: "09:00-19:00", ven: "09:00-19:00", sab: "09:00-18:00", dom: "Chiuso" },

    // VETRINA — contenuti che il cliente vede sulla home pubblica
    descrizione: "Salone storico nel cuore di Milano. Specializzati in colore, taglio e cura della persona. Ti aspettiamo con un caffè.",
    galleria: [], // max 6 foto del salone/lavori (data URL)
    social: { Camera: "", tiktok: "", Globe: "", sito: "" },

    // INTERRUTTORI vetrina (il parrucchiere decide cosa mostrare al cliente)
    mostraRecensioni: true,
    mostraMappa: true,
    mostraOrari: true,
    mostraGalleria: true,
    mostraSocial: true,
  });

  // RECENSIONI (in produzione arriveranno da Supabase, qui mock per la demo)
  // RECENSIONI
  // - stelle 1-5
  // - testo: messaggio del cliente
  // - rispostaProprietario: testo (null se non ancora risposto)
  // - segnalata: boolean (proprietario può segnalare a admin Prenoty)
  // - nascosta: boolean (admin può nasconderla dopo segnalazione)
  const [recensioni, setRecensioni] = useState([
    { id: 1, nome: "Sofia E.", stelle: 5, testo: "Servizio impeccabile, Marco è bravissimo con il colore. Tornerò sicuramente!", data: "2026-04-15", rispostaProprietario: null, segnalata: false, nascosta: false },
    { id: 2, nome: "Giulia R.", stelle: 5, testo: "Ambiente elegante e personale gentile. Il taglio è perfetto.", data: "2026-04-10", rispostaProprietario: "Grazie mille Giulia! Ti aspettiamo presto.", segnalata: false, nascosta: false },
    { id: 3, nome: "Anna V.", stelle: 4, testo: "Bella esperienza, prezzi giusti. Consigliato.", data: "2026-04-05", rispostaProprietario: null, segnalata: false, nascosta: false },
    { id: 4, nome: "Laura C.", stelle: 5, testo: "Le ragazze sono dolcissime, mi sento sempre coccolata. Top.", data: "2026-03-28", rispostaProprietario: null, segnalata: false, nascosta: false },
    { id: 5, nome: "Anonimo", stelle: 1, testo: "Servizio pessimo, da evitare assolutamente!", data: "2026-04-22", rispostaProprietario: null, segnalata: false, nascosta: false },
  ]);

  // State per gestione risposte/segnalazioni
  const [risposteInCorso, setRisposteInCorso] = useState({}); // { recensioneId: "testo bozza" }

  const inviaRisposta = (recId) => {
    const testo = risposteInCorso[recId]?.trim();
    if (!testo) return;
    setRecensioni(recensioni.map(r => r.id === recId ? { ...r, rispostaProprietario: testo } : r));
    setRisposteInCorso({ ...risposteInCorso, [recId]: "" });
  };

  const eliminaRisposta = (recId) => {
    setRecensioni(recensioni.map(r => r.id === recId ? { ...r, rispostaProprietario: null } : r));
  };

  const segnalaRecensione = (recId) => {
    setRecensioni(recensioni.map(r => r.id === recId ? { ...r, segnalata: !r.segnalata } : r));
  };
  const mediaStelle = recensioni.length > 0
    ? (recensioni.reduce((s, r) => s + r.stelle, 0) / recensioni.length).toFixed(1)
    : 0;

  // METODI DI PAGAMENTO (il parrucchiere sceglie quali attivare)
  const [metodiPagamento, setMetodiPagamento] = useState({
    carta: true,           // Visa, Mastercard, Amex (tramite PSP)
    applePay: true,        // Apple Pay
    googlePay: true,       // Google Pay
    nexi: true,            // Nexi (Cartasì, PagoBancomat) — molto usato in Italia
    paypal: false,         // PayPal (il parrucchiere deve avere account)
    bonifico: false,       // Bonifico bancario
    inSalone: true,        // Paga direttamente in salone (nessun pagamento online)
  });

  // PSP (Payment Service Provider) scelto dal parrucchiere per ricevere i pagamenti con carta
  const [psp, setPsp] = useState({
    scelto: null,          // null | "nexi" | "stripe" | "paypal" | "sumup"
    collegato: false,      // true quando il parrucchiere ha completato il setup
    iban: "",              // IBAN del salone dove arriveranno i soldi
    intestatario: "",      // Nome dell'intestatario del conto
  });

  // STAFF - ora con foto e max 5 operatori
  const [staff, setStaff] = useState([
    { id: 1, nome: "Marco Ferrari", ruolo: "Titolare", colore: "#6c5ce7", foto: null },
    { id: 2, nome: "Laura Bianchi", ruolo: "Senior Stylist", colore: "#a29bfe", foto: null },
    { id: 3, nome: "Giulia Conti", ruolo: "Colorista", colore: "#fd79a8", foto: null },
  ]);
  const MAX_STAFF = 15;

  // Modifica inline staff: { id: 2, campo: "nome" | "ruolo" }
  const [modificaStaff, setModificaStaff] = useState(null);

  const aggiornaStaff = (id, campo, valore) => {
    setStaff(staff.map(s => s.id === id ? { ...s, [campo]: valore } : s));
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

  const eseguiEliminaStaff = () => {
    if (!confermaEliminaStaff) return;
    setStaff(staff.filter(s => s.id !== confermaEliminaStaff));
    setConfermaEliminaStaff(null);
  };

  const nuovoStaff = () => {
    if (staff.length >= MAX_STAFF) return;
    const nuovoId = Math.max(0, ...staff.map(s => s.id)) + 1;
    // colori predefiniti a rotazione per i nuovi operatori
    const coloriDisponibili = ["#6c5ce7", "#a29bfe", "#fd79a8", "#00cec9", "#fdcb6e"];
    const colore = coloriDisponibili[staff.length % coloriDisponibili.length];
    setStaff([...staff, { id: nuovoId, nome: "Nuovo operatore", ruolo: config.operatoreSing, colore, foto: null }]);
    setModificaStaff({ id: nuovoId, campo: "nome" });
  };

  // Gestisce upload foto (logo salone o foto staff)
  const uploadFoto = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target.result);
    reader.readAsDataURL(file);
  };

  // SERVIZI — popolati dinamicamente in base al tipo di attività
  // Quando il professionista cambia tipo (parrucchiere/estetista/spa),
  // i servizi predefiniti si aggiornano in automatico
  const [servizi, setServizi] = useState(CONFIG_ATTIVITA.parrucchiere.serviziDefault);

  // Modifica inline servizi: tiene traccia di quale servizio si sta modificando
  // e quale campo (es: { id: 3, campo: "prezzo" })
  const [modificaServizio, setModificaServizio] = useState(null);

  // Cambia tipo di attività e ricarica i servizi predefiniti
  // (con conferma per evitare di sovrascrivere lavoro esistente)
  // Modal di conferma per cambio tipo attività
  // (in-app: funziona ovunque, ed è più elegante del confirm() nativo)
  const [confermaCambioTipo, setConfermaCambioTipo] = useState(null);

  const cambiaTipoAttivita = (nuovoTipo) => {
    if (nuovoTipo === tipoAttivita) return;
    setConfermaCambioTipo(nuovoTipo);
  };

  const eseguiCambioTipo = () => {
    if (!confermaCambioTipo) return;
    setTipoAttivita(confermaCambioTipo);
    setServizi(CONFIG_ATTIVITA[confermaCambioTipo].serviziDefault);
    setConfermaCambioTipo(null);
  };

  const aggiornaServizio = (id, campo, valore) => {
    setServizi(servizi.map(s =>
      s.id === id ? { ...s, [campo]: campo === "nome" ? valore : Number(valore) || 0 } : s
    ));
  };

  // Modal eliminazione servizio (in-app, funziona ovunque)
  const [confermaEliminaServizio, setConfermaEliminaServizio] = useState(null);

  const eliminaServizio = (id) => {
    setConfermaEliminaServizio(id);
  };

  const eseguiEliminaServizio = () => {
    if (!confermaEliminaServizio) return;
    setServizi(servizi.filter(s => s.id !== confermaEliminaServizio));
    setConfermaEliminaServizio(null);
  };

  const nuovoServizio = () => {
    const nuovoId = Math.max(0, ...servizi.map(s => s.id)) + 1;
    setServizi([...servizi, { id: nuovoId, nome: "Nuovo servizio", durata: 30, prezzo: 0 }]);
    setModificaServizio({ id: nuovoId, campo: "nome" });
  };

  // CLIENTI
  const [clienti, setClienti] = useState([
    { id: 1, nome: "Giulia Rossi", tel: "+39 333 1234567", visite: 12, totaleSpeso: 780, ultimaVisita: "2026-04-10", note: "Colore castano scuro, allergica all'ammoniaca", fedelta: 8 },
    { id: 2, nome: "Marco Bianchi", tel: "+39 347 9876543", visite: 5, totaleSpeso: 100, ultimaVisita: "2026-04-15", note: "Taglio sfumato sui lati", fedelta: 3 },
    { id: 3, nome: "Sofia Esposito", tel: "+39 320 5551234", visite: 18, totaleSpeso: 1200, ultimaVisita: "2026-04-20", note: "Cliente VIP, preferisce appuntamenti pomeridiani", fedelta: 15 },
    { id: 4, nome: "Laura Conti", tel: "+39 335 4443322", visite: 7, totaleSpeso: 520, ultimaVisita: "2026-03-28", note: "", fedelta: 5 },
    { id: 5, nome: "Anna Verdi", tel: "+39 340 7778899", visite: 3, totaleSpeso: 90, ultimaVisita: "2026-04-05", note: "Nuova cliente", fedelta: 2 },
  ]);

  // GESTIONE NUOVO CLIENTE / ELIMINA CLIENTE
  const [modalNuovoCliente, setModalNuovoCliente] = useState(false);
  const [nuovoCliente, setNuovoCliente] = useState({ nome: "", tel: "", note: "" });
  const [confermaEliminaCliente, setConfermaEliminaCliente] = useState(null);

  const aggiungiCliente = () => {
    if (!nuovoCliente.nome.trim() || !nuovoCliente.tel.trim()) return;
    const nuovoId = Math.max(0, ...clienti.map(c => c.id)) + 1;
    setClienti([...clienti, {
      id: nuovoId, nome: nuovoCliente.nome.trim(), tel: nuovoCliente.tel.trim(), note: nuovoCliente.note.trim(),
      visite: 0, totaleSpeso: 0, ultimaVisita: null, fedelta: 0,
    }]);
    setNuovoCliente({ nome: "", tel: "", note: "" });
    setModalNuovoCliente(false);
  };

  const eseguiEliminaCliente = () => {
    if (!confermaEliminaCliente) return;
    setClienti(clienti.filter(c => c.id !== confermaEliminaCliente));
    setConfermaEliminaCliente(null);
  };

  // PRENOTAZIONI
  const [prenotazioni, setPrenotazioni] = useState([
    { id: 1, cliente: "Giulia Rossi", tel: "+39 333 1234567", servizio: "Colore", durata: 90, prezzo: 65, data: "2026-04-24", ora: "09:00", stato: "confermato", pagamento: "pagato", staffId: 3, nuovo: true, note: "Colore castano scuro" },
    { id: 2, cliente: "Marco Bianchi", tel: "+39 347 9876543", servizio: "Taglio Uomo", durata: 30, prezzo: 20, data: "2026-04-24", ora: "10:30", stato: "confermato", pagamento: "salone", staffId: 1, nuovo: false },
    { id: 3, cliente: "Sofia Esposito", tel: "+39 320 5551234", servizio: "Taglio + Piega", durata: 60, prezzo: 50, data: "2026-04-24", ora: "11:30", stato: "confermato", pagamento: "pagato", staffId: 2, nuovo: true },
    { id: 4, cliente: "Laura Conti", tel: "+39 335 4443322", servizio: "Colpi di Sole", durata: 120, prezzo: 85, data: "2026-04-24", ora: "14:30", stato: "confermato", pagamento: "salone", staffId: 3, nuovo: false },
    { id: 5, cliente: "Anna Verdi", tel: "+39 340 7778899", servizio: "Piega", durata: 30, prezzo: 25, data: "2026-04-24", ora: "17:00", stato: "confermato", pagamento: "pagato", staffId: 2, nuovo: false },
    { id: 6, cliente: "Francesca Moro", tel: "+39 328 1112233", servizio: "Taglio Donna", durata: 45, prezzo: 35, data: "2026-04-25", ora: "10:00", stato: "confermato", pagamento: "salone", staffId: 2, nuovo: true },
    { id: 7, cliente: "Elena Ricci", tel: "+39 333 6667788", servizio: "Colore", durata: 90, prezzo: 65, data: "2026-04-25", ora: "14:00", stato: "confermato", pagamento: "pagato", staffId: 3, nuovo: false },
    { id: 8, cliente: "Chiara Galli", tel: "+39 347 2223344", servizio: "Taglio Donna", durata: 45, prezzo: 35, data: "2026-04-26", ora: "11:00", stato: "confermato", pagamento: "salone", staffId: 1, nuovo: false },
  ]);

  const oggi = "2026-04-24";

  const filtraPrenotazioni = () => {
    let f = prenotazioni;
    if (vista === "oggi") f = f.filter(p => p.data === oggi);
    if (vista === "settimana") f = f.filter(p => p.data >= oggi);
    if (filtro) f = f.filter(p => p.cliente.toLowerCase().includes(filtro.toLowerCase()) || p.servizio.toLowerCase().includes(filtro.toLowerCase()));
    return f.sort((a, b) => (a.data + a.ora).localeCompare(b.data + b.ora));
  };

  const prenOggi = prenotazioni.filter(p => p.data === oggi);
  const incassoOggi = prenOggi.reduce((s, p) => s + p.prezzo, 0);
  const pagatiOggi = prenOggi.filter(p => p.pagamento === "pagato").reduce((s, p) => s + p.prezzo, 0);
  const nuoveNotifiche = prenotazioni.filter(p => p.nuovo).length;

  // Dropdown notifiche (campanella)
  const [notificheAperte, setNotificheAperte] = useState(false);

  const listaNotifiche = [
    ...prenotazioni.filter(p => p.nuovo).map(p => ({
      tipo: "prenotazione",
      icon: Calendar,
      titolo: `Nuova prenotazione: ${p.cliente}`,
      sottotitolo: `${p.servizio} · ${p.data} ore ${p.ora}`,
      data: p.data,
      onClick: () => { setSezione("agenda"); setNotificheAperte(false); },
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
  const incassoMese = prenotazioni.reduce((s, p) => s + p.prezzo, 0);

  const cancella = (id) => { setPrenotazioni(prenotazioni.filter(p => p.id !== id)); setDettaglio(null); };
  const segnaLetta = (id) => setPrenotazioni(prenotazioni.map(p => p.id === id ? { ...p, nuovo: false } : p));

  const fmtData = (d) => {
    const date = new Date(d);
    const g = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
    const m = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
    return `${g[date.getDay()]} ${date.getDate()} ${m[date.getMonth()]}`;
  };

  const staffDi = (id) => staff.find(s => s.id === id);
  const visibili = filtraPrenotazioni();

  const menuItems = [
    { id: "agenda", label: "Agenda", icon: Calendar },
    { id: "clienti", label: "Clienti", icon: Users },
    { id: "servizi", label: "Servizi", icon: Package },
    { id: "staff", label: "Staff", icon: Scissors },
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
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition" style={{ color: T.textSoft, borderRadius: 10 }}>
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
        <header className="border-b px-4 md:px-8 py-4 flex items-center justify-between" style={{ backgroundColor: T.card, borderColor: T.border }}>
          <div className="md:hidden flex items-center gap-2">
            <IconaAttivita className="w-5 h-5" style={{ color: T.accent }} />
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
                  <span className="absolute top-1 right-1 w-4 h-4 text-[10px] flex items-center justify-center rounded-full text-white" style={{ backgroundColor: T.accent }}>
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
                          return (
                            <button
                              key={i}
                              onClick={n.onClick}
                              className="w-full p-3 text-left transition"
                              style={{ borderColor: T.border, backgroundColor: T.card }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: T.accentSoft }}>
                                  <Icona className="w-4 h-4" style={{ color: T.accent }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm">{n.titolo}</div>
                                  <div className="text-xs mt-0.5 truncate" style={{ color: T.textMuted }}>{n.sottotitolo}</div>
                                </div>
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
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {/* AGENDA */}
          {sezione === "agenda" && (
            <div>
              {/* STATS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { lbl: "OGGI", val: prenOggi.length, sub: "appuntamenti", icon: Calendar, bg: T.accent, light: false },
                  { lbl: "INCASSO", val: `€${incassoOggi}`, sub: "previsto", icon: Euro, bg: "#00b894", light: false },
                  { lbl: "PAGATO", val: `€${pagatiOggi}`, sub: "online", icon: CreditCard, bg: T.card, light: true },
                  { lbl: "NUOVE", val: nuoveNotifiche, sub: "da vedere", icon: TrendingUp, bg: T.card, light: true },
                ].map((s, i) => {
                  const Ic = s.icon;
                  return (
                    <div key={i} className="p-4" style={{ backgroundColor: s.bg, borderRadius: 14, border: s.light ? `1px solid ${T.border}` : "none", boxShadow: s.light ? "none" : "0 4px 16px rgba(108,92,231,0.25)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <div style={{ width: 32, height: 32, borderRadius: 14, background: s.light ? T.accentSoft : "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Ic className="w-4 h-4" style={{ color: s.light ? T.accent : "#fff" }} />
                        </div>
                        <span className="text-xs tracking-widest" style={{ color: s.light ? T.textMuted : "rgba(255,255,255,0.7)", letterSpacing: "0.12em" }}>{s.lbl}</span>
                      </div>
                      <div className="text-2xl md:text-3xl font-semibold" style={{ color: s.light ? T.text : "#fff" }}>{s.val}</div>
                      <div className="text-xs mt-1" style={{ color: s.light ? T.textMuted : "rgba(255,255,255,0.75)" }}>{s.sub}</div>
                    </div>
                  );
                })}
              </div>

              {/* FILTRI */}
              <div className="flex flex-col md:flex-row gap-3 mb-5">
                <div className="flex gap-1 p-1" style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, borderRadius: 10 }}>
                  {["oggi", "settimana", "tutti"].map(v => (
                    <button
                      key={v}
                      onClick={() => setVista(v)}
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
                      <div className="text-sm flex items-center gap-3 mt-1" style={{ color: T.textSoft }}>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.tel}</span>
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
                        onClick={() => eliminaStaff(s.id)}
                        className="absolute top-2 right-2 p-1.5 rounded transition"
                        style={{ color: T.danger }}
                        title="Elimina operatore"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Foto o iniziali — clicca per caricare foto */}
                      <label className="cursor-pointer block relative group">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            uploadFoto(e.target.files[0], (dataUrl) => {
                              setStaff(staff.map(x => x.id === s.id ? { ...x, foto: dataUrl } : x));
                            });
                          }}
                        />
                        {s.foto ? (
                          <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden border-2" style={{ borderColor: s.colore }}>
                            <img src={s.foto} alt={s.nome} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl" style={{ backgroundColor: s.colore }}>
                            {s.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                        )}
                      </label>

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
                          onClick={() => setStaff(staff.map(x => x.id === s.id ? { ...x, foto: null } : x))}
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
                    <div key={r.id} className="p-5 border" style={{ backgroundColor: T.card, borderColor: r.segnalata ? T.danger : T.border, borderWidth: r.segnalata ? "2px" : "1px" }}>
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
                        {r.segnalata && (
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
          {sezione === "report" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                {[
                  { lbl: "INCASSO MESE", val: `€${incassoMese}`, trend: "+12%" },
                  { lbl: "APPUNTAMENTI", val: prenotazioni.length, trend: "+8%" },
                  { lbl: "NUOVI CLIENTI", val: 3, trend: "+50%" },
                ].map((s, i) => (
                  <div key={i} className="p-5 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                    <div className="text-xs tracking-widest mb-2" style={{ color: T.textMuted, letterSpacing: "0.15em" }}>{s.lbl}</div>
                    <div className="text-3xl" style={{ color: T.accent }}>{s.val}</div>
                    <div className="text-xs mt-1" style={{ color: "#16a34a" }}>{s.trend} vs mese scorso</div>
                  </div>
                ))}
              </div>

              <div className="p-6 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                <h3 className="text-sm tracking-widest mb-4" style={{ color: T.textSoft, letterSpacing: "0.15em" }}>SERVIZI PIÙ RICHIESTI</h3>
                <div className="space-y-3">
                  {servizi.length === 0 ? (
                    <p className="text-sm text-center py-4" style={{ color: T.textMuted, fontStyle: "italic" }}>
                      Nessun servizio configurato. Vai su "Servizi" per aggiungerne.
                    </p>
                  ) : (
                    servizi.slice(0, 4).map((s, i) => {
                      const count = Math.max(1, 4 - i);
                      const perc = Math.max(20, 90 - i * 18);
                      return (
                        <div key={s.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{s.nome}</span>
                            <span style={{ color: T.textMuted }}>{count} {count === 1 ? "prenotazione" : "prenotazioni"}</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: T.border }}>
                            <div className="h-full rounded-full" style={{ width: `${perc}%`, backgroundColor: T.accent }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* IMPOSTAZIONI */}
          {sezione === "impostazioni" && (
            <div className="space-y-6">
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
                <h3 className="text-sm tracking-widest mb-4" style={{ color: T.textSoft, letterSpacing: "0.15em" }}>DATI SALONE</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>NOME SALONE</label>
                    <input
                      type="text"
                      value={salone.nome}
                      onChange={(e) => setSalone({ ...salone, nome: e.target.value })}
                      className="w-full mt-1 p-3 border outline-none"
                      style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text }}
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>INDIRIZZO</label>
                    <input
                      type="text"
                      value={salone.indirizzo}
                      onChange={(e) => setSalone({ ...salone, indirizzo: e.target.value })}
                      className="w-full mt-1 p-3 border outline-none"
                      style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text }}
                    />
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
                          });
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
                          <div className="text-xs mt-1">PNG, JPG, SVG · max 2MB</div>
                        </div>
                      )}
                    </label>
                  </div>
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
                              setSalone({ ...salone, galleria: [...salone.galleria, dataUrl] });
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
                      {salone.galleria.map((foto, i) => (
                        <div key={i} className="relative aspect-square overflow-hidden border" style={{ borderColor: T.border }}>
                          <img src={foto} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => setSalone({ ...salone, galleria: salone.galleria.filter((_, idx) => idx !== i) })}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#fff" }}
                            title="Rimuovi"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SOCIAL */}
                <div className="mb-5">
                  <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>LINK SOCIAL</label>
                  <div className="space-y-2 mt-2">
                    {[
                      { key: "Camera", label: "Camera", icon: Camera, placeholder: "https://Camera.com/tuosalone" },
                      { key: "tiktok", label: "TikTok", icon: Globe, placeholder: "https://tiktok.com/@tuosalone" },
                      { key: "Globe", label: "Globe", icon: Globe, placeholder: "https://Globe.com/tuosalone" },
                      { key: "sito", label: "Sito web", icon: Globe, placeholder: "https://tuosito.it" },
                    ].map(s => {
                      const Ic = s.icon;
                      return (
                        <div key={s.key} className="flex items-center gap-2">
                          <Ic className="w-4 h-4 flex-shrink-0" style={{ color: T.textMuted }} />
                          <input
                            type="url"
                            value={salone.social[s.key]}
                            onChange={(e) => setSalone({ ...salone, social: { ...salone.social, [s.key]: e.target.value } })}
                            placeholder={s.placeholder}
                            className="flex-1 p-2 border outline-none text-sm"
                            style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text }}
                          />
                        </div>
                      );
                    })}
                  </div>
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
              </div>

              <div className="p-6 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                <h3 className="text-sm tracking-widest mb-4" style={{ color: T.textSoft, letterSpacing: "0.15em" }}>ORARI DI APERTURA</h3>
                <div className="space-y-2">
                  {Object.entries(salone.orari).map(([giorno, orario]) => (
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
                  ))}
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
                <p className="text-xs mb-4" style={{ color: T.textMuted }}>Scegli quali metodi accettare dai tuoi clienti</p>
                <div className="space-y-3">
                  {[
                    { key: "carta", lbl: "Carta di credito/debito", sub: "Visa, Mastercard, Amex" },
                    { key: "applePay", lbl: "Apple Pay", sub: "Pagamento rapido da iPhone" },
                    { key: "googlePay", lbl: "Google Pay", sub: "Pagamento rapido da Android" },
                    { key: "nexi", lbl: "Nexi", sub: "Molto diffuso in Italia: Cartasì, PagoBancomat" },
                    { key: "paypal", lbl: "PayPal", sub: "Richiede account PayPal Business" },
                    { key: "bonifico", lbl: "Bonifico bancario", sub: "Il cliente riceve l'IBAN via email" },
                    {
                      key: "inSalone",
                      lbl: tipoAttivita === "generico" ? "Paga di persona" : "Paga in salone",
                      sub: tipoAttivita === "generico"
                        ? "Nessun pagamento online, paga direttamente al servizio"
                        : "Nessun pagamento online, paga al termine del servizio",
                    },
                  ].map((m) => {
                    const attivo = metodiPagamento[m.key];
                    return (
                      <label key={m.key} className="flex items-center justify-between cursor-pointer py-2">
                        <div className="flex-1 pr-3">
                          <div className="text-sm">{m.lbl}</div>
                          <div className="text-xs mt-0.5" style={{ color: T.textMuted }}>{m.sub}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={attivo}
                          onChange={() => setMetodiPagamento({ ...metodiPagamento, [m.key]: !attivo })}
                          className="sr-only"
                        />
                        <div className="w-10 h-6 rounded-full relative transition flex-shrink-0" style={{ backgroundColor: attivo ? T.accent : T.border }}>
                          <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition" style={{ left: attivo ? "calc(100% - 20px)" : "4px" }} />
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* SCELTA PSP — dove arrivano i soldi dei clienti */}
              {(metodiPagamento.carta || metodiPagamento.applePay || metodiPagamento.googlePay || metodiPagamento.nexi) && (
                <div className="p-6 border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                  <h3 className="text-sm tracking-widest mb-1" style={{ color: T.textSoft, letterSpacing: "0.15em" }}>DOVE RICEVERAI I PAGAMENTI</h3>
                  <p className="text-xs mb-4" style={{ color: T.textMuted }}>Scegli il servizio che gestirà i pagamenti con carta. I soldi arriveranno automaticamente sul tuo IBAN.</p>

                  {/* Scelta tra i 3 PSP */}
                  <div className="space-y-3 mb-5">
                    {[
                      { id: "nexi", nome: "Nexi", commissione: "1,2% + 0,25 €", descr: "Italiano, leader in Italia (60% delle transazioni). Ideale per saloni.", consigliato: true },
                      { id: "stripe", nome: "Stripe", commissione: "1,4% + 0,25 €", descr: "Internazionale, setup in 10 minuti." },
                      { id: "sumup", nome: "SumUp", commissione: "1,95%", descr: "Italiano, semplice e senza canoni." },
                      { id: "paypal", nome: "PayPal", commissione: "2,9% + 0,35 €", descr: "Conosciuto da tutti, ma più costoso." },
                    ].map((p) => {
                      const sel = psp.scelto === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setPsp({ ...psp, scelto: p.id, collegato: false })}
                          className="w-full p-4 border text-left transition"
                          style={{
                            backgroundColor: sel ? T.accentSoft : T.bg,
                            borderColor: sel ? T.accent : T.border,
                            borderWidth: sel ? "2px" : "1px",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span>{p.nome}</span>
                                {p.consigliato && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full text-white tracking-widest" style={{ backgroundColor: T.accent, letterSpacing: "0.1em" }}>
                                    CONSIGLIATO
                                  </span>
                                )}
                              </div>
                              <div className="text-xs mt-1" style={{ color: T.textMuted }}>{p.descr}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs" style={{ color: T.textMuted }}>commissione</div>
                              <div className="text-sm" style={{ color: T.accent }}>{p.commissione}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Form IBAN + collegamento, visibile solo se ha scelto un PSP */}
                  {psp.scelto && (
                    <div className="pt-5 border-t space-y-4" style={{ borderColor: T.border }}>
                      <div>
                        <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>INTESTATARIO DEL CONTO *</label>
                        <input
                          type="text"
                          value={psp.intestatario}
                          onChange={(e) => setPsp({ ...psp, intestatario: e.target.value })}
                          className="w-full mt-2 p-3 border outline-none"
                          style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text }}
                          placeholder="Nome e cognome o ragione sociale"
                        />
                      </div>
                      <div>
                        <label className="text-xs tracking-widest" style={{ color: T.textMuted }}>IBAN DEL SALONE *</label>
                        <input
                          type="text"
                          value={psp.iban}
                          onChange={(e) => setPsp({ ...psp, iban: e.target.value.toUpperCase() })}
                          className="w-full mt-2 p-3 border outline-none font-mono"
                          style={{ backgroundColor: T.bg, borderColor: T.border, color: T.text }}
                          placeholder="IT60 X054 2811 1010 0000 0123 456"
                          maxLength={34}
                        />
                        <div className="text-xs mt-2" style={{ color: T.textMuted }}>Qui arriveranno i soldi dei pagamenti online (entro 2-7 giorni)</div>
                      </div>

                      {!psp.collegato ? (
                        <button
                          onClick={() => {
                            if (psp.iban && psp.intestatario) {
                              setPsp({ ...psp, collegato: true });
                            }
                          }}
                          disabled={!psp.iban || !psp.intestatario}
                          className="w-full py-3 tracking-widest text-sm disabled:opacity-40"
                          style={{ backgroundColor: T.dark, color: T.bg, letterSpacing: "0.15em" }}
                        >
                          COLLEGA {psp.scelto.toUpperCase()}
                        </button>
                      ) : (
                        <div className="p-4 border flex items-center gap-3" style={{ backgroundColor: T.accentSoft, borderColor: T.accent }}>
                          <CheckCircle className="w-5 h-5" style={{ color: T.accent }} />
                          <div className="flex-1">
                            <div className="text-sm">{({ nexi: "Nexi", stripe: "Stripe", paypal: "PayPal", sumup: "SumUp" })[psp.scelto]} collegato correttamente</div>
                            <div className="text-xs mt-0.5" style={{ color: T.textMuted }}>I pagamenti arriveranno su {psp.iban.slice(0, 4)}••••{psp.iban.slice(-4)}</div>
                          </div>
                          <button
                            onClick={() => setPsp({ scelto: null, collegato: false, iban: "", intestatario: "" })}
                            className="text-xs tracking-widest"
                            style={{ color: T.danger, letterSpacing: "0.15em" }}
                          >
                            SCOLLEGA
                          </button>
                        </div>
                      )}

                      <div className="text-xs p-3 border" style={{ backgroundColor: T.bg, borderColor: T.border, color: T.textMuted }}>
                        <strong style={{ color: T.textSoft }}>Come funziona:</strong> quando un cliente paga online, i soldi arrivano prima a {({ nexi: "Nexi", stripe: "Stripe", paypal: "PayPal", sumup: "SumUp" })[psp.scelto]}, che li gira automaticamente sul tuo IBAN entro pochi giorni. Non devi fare nulla manualmente.
                      </div>
                    </div>
                  )}
                </div>
              )}
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
              <div>
                <div className="text-xs tracking-widest mb-1" style={{ color: T.textMuted }}>SERVIZIO</div>
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4" style={{ color: T.textMuted }} />
                  {dettaglio.servizio}
                </div>
              </div>
              {staffDi(dettaglio.staffId) && (
                <div>
                  <div className="text-xs tracking-widest mb-1" style={{ color: T.textMuted }}>OPERATORE</div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: staffDi(dettaglio.staffId).colore }} />
                    {staffDi(dettaglio.staffId).nome}
                  </div>
                </div>
              )}
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
                    ) : (
                      <><CreditCard className="w-4 h-4" style={{ color: T.textMuted }} /><span>Da pagare</span></>
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
              I servizi attuali verranno sostituiti con quelli predefiniti per <strong style={{ color: T.text }}>{CONFIG_ATTIVITA[confermaCambioTipo].nome}</strong>.<br />
              Potrai comunque modificarli dopo.
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

      <WhatsAppAssistenza tema={tema} numero="393331234567" />
    </div>
  );
}
