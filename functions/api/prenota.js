// Cloudflare Pages Function
// POST /api/prenota
// Body: { salone_id, servizi_ids, staff_id, nome_cliente, telefono_cliente, email_cliente, data, ora, note, metodo_pagamento, codice_bonifico }
// Crea la prenotazione dopo aver controllato i dati. Prezzo, durata, pausa e nomi dei servizi
// vengono dal database (non dalla pagina). Il limite di richieste è in _middleware.js.

const CORS = {
  "Access-Control-Allow-Origin": "https://prenoty.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
const risposta = (status, obj) => new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", ...CORS } });
const pulisci = (v, max) => String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const b = await request.json();

    // 1) Controllo dei dati ricevuti
    const saloneId = String(b.salone_id || "");
    const ids = [...new Set(Array.isArray(b.servizi_ids) ? b.servizi_ids.map(String) : [])];
    const nome = pulisci(b.nome_cliente, 80);
    const telefono = pulisci(b.telefono_cliente, 30);
    const emailRaw = pulisci(b.email_cliente, 254);
    const email = emailRaw || null;
    const data = String(b.data || "");
    const ora = String(b.ora || "").slice(0, 5);
    const note = pulisci(b.note, 500) || null;
    const metodo = ["salone", "carta", "bonifico"].includes(b.metodo_pagamento) ? b.metodo_pagamento : "salone";
    const codiceBonifico = metodo === "bonifico" ? (pulisci(b.codice_bonifico, 40) || null) : null;
    const staffIdIn = b.staff_id == null || b.staff_id === 0 ? null : Number(b.staff_id);

    if (!UUID_RE.test(saloneId) || ids.length === 0 || ids.length > 20 || !ids.every((i) => UUID_RE.test(i))) {
      return risposta(400, { error: "Dati prenotazione non validi" });
    }
    if (!nome) return risposta(400, { error: "Inserisci il tuo nome." });
    const cifre = telefono.replace(/\D/g, "");
    if (!/^[0-9+()\-\s.]+$/.test(telefono) || cifre.length < 6 || cifre.length > 15) {
      return risposta(400, { error: "Inserisci un numero di telefono valido (solo numeri)." });
    }
    if (email && !EMAIL_RE.test(email)) return risposta(400, { error: "Email non valida" });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^\d{2}:\d{2}$/.test(ora)) return risposta(400, { error: "Data o ora non valide" });
    const oggi = Date.now();
    const quando = Date.parse(data + "T00:00:00Z");
    if (!Number.isFinite(quando) || quando < oggi - 2 * 86400000 || quando > oggi + 800 * 86400000) {
      return risposta(400, { error: "Data non valida" });
    }
    if (staffIdIn !== null && !Number.isInteger(staffIdIn)) return risposta(400, { error: "Operatore non valido" });

    const sb = { "apikey": env.SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${env.SUPABASE_SERVICE_KEY}` };

    // 2) Salone, servizi e operatore dal database
    const salRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/saloni?id=eq.${saloneId}&select=id,staff,blocco_occupato,blocco_sovrapposizione,limite_sovrapposizione`,
      { headers: sb }
    );
    if (!salRes.ok) return risposta(500, { error: "Errore verifica salone" });
    const sal = (await salRes.json())?.[0];
    if (!sal) return risposta(404, { error: "Salone non trovato" });

    const servRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/servizi?salone_id=eq.${saloneId}&id=in.(${ids.join(",")})&select=id,nome,durata,prezzo,pausa`,
      { headers: sb }
    );
    if (!servRes.ok) return risposta(500, { error: "Errore verifica servizi" });
    const servizi = await servRes.json();
    if (!Array.isArray(servizi) || servizi.length !== ids.length) return risposta(400, { error: "Servizi non validi per questo salone" });
    // Stesso ordine scelto dal cliente
    const servOrdinati = ids.map((i) => servizi.find((x) => x.id === i));
    const durataTot = servOrdinati.reduce((t, x) => t + (Number(x.durata) || 0), 0);
    const pausaTot = servOrdinati.reduce((t, x) => t + (Number(x.pausa) || 0), 0);
    const prezzoTot = servOrdinati.reduce((t, x) => t + (Number(x.prezzo) || 0), 0);
    const nomiServizi = servOrdinati.map((x) => x.nome).join(", ");

    if (staffIdIn !== null && !(sal.staff || []).some((x) => x.id === staffIdIn)) {
      return risposta(400, { error: "Operatore non valido" });
    }

    // 3) Orario ancora libero? Stesse regole della pagina pubblica (blocco occupati / limite sovrapposizione)
    if (sal.blocco_occupato || sal.blocco_sovrapposizione) {
      const prenRes = await fetch(
        `${env.SUPABASE_URL}/rest/v1/prenotazioni?salone_id=eq.${saloneId}&data=eq.${data}&stato=neq.annullata&select=ora,durata_totale,pausa_totale,staff_id`,
        { headers: sb }
      );
      if (!prenRes.ok) return risposta(500, { error: "Errore verifica orari" });
      const esistenti = await prenRes.json();
      const [sh, sm] = ora.split(":").map(Number);
      const slotMin = sh * 60 + sm;
      const prenPerOccupato = staffIdIn ? esistenti.filter((p) => p.staff_id === staffIdIn) : esistenti;
      const prenPerSovrap = staffIdIn ? esistenti.filter((p) => p.staff_id === staffIdIn || p.staff_id === null) : esistenti;
      const contaPresenti = (lista, conPausa) => {
        let n = 0;
        for (const p of lista) {
          const [ph, pm] = (String(p.ora || "00:00").slice(0, 5)).split(":").map(Number);
          const startMin = ph * 60 + pm;
          const endMin = startMin + (p.durata_totale || 30) + (conPausa ? (p.pausa_totale || 0) : 0);
          if (startMin <= slotMin && slotMin < endMin) n++;
        }
        return n;
      };
      let occupato = false;
      if (sal.blocco_occupato && contaPresenti(prenPerOccupato, true) >= 1) occupato = true;
      else if (sal.blocco_sovrapposizione && contaPresenti(prenPerSovrap, false) >= (sal.limite_sovrapposizione ?? 3)) occupato = true;
      if (occupato) return risposta(409, { error: "Questo orario non è più disponibile. Scegline un altro." });
    }

    // 4) Salvataggio
    const ins = await fetch(`${env.SUPABASE_URL}/rest/v1/prenotazioni`, {
      method: "POST",
      headers: { ...sb, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify({
        salone_id: saloneId,
        servizio_id: ids[0],
        staff_id: staffIdIn,
        nome_cliente: nome,
        telefono_cliente: telefono,
        email_cliente: email,
        data,
        ora,
        stato: "confermato",
        durata_totale: durataTot,
        pausa_totale: pausaTot,
        nomi_servizi: nomiServizi,
        prezzo: prezzoTot,
        note,
        metodo_pagamento: metodo,
        codice_bonifico: codiceBonifico,
      }),
    });
    if (!ins.ok) {
      console.error("Errore inserimento prenotazione:", await ins.text());
      return risposta(500, { error: "Errore salvataggio prenotazione" });
    }

    // 5) Scheda cliente in anagrafica (se qualcosa va storto la prenotazione resta valida)
    try {
      const telGrezzo = pulisci(b.telefono_grezzo, 30);
      const candidati = [...new Set([telefono, telGrezzo].filter((v) => v && /^[0-9+()\-\s.]+$/.test(v)))];
      const lista = candidati.map((v) => `"${v}"`).join(",");
      const cRes = await fetch(
        `${env.SUPABASE_URL}/rest/v1/clienti?salone_id=eq.${saloneId}&telefono=in.(${encodeURIComponent(lista)})&select=id,visite&limit=1`,
        { headers: sb }
      );
      const esistente = cRes.ok ? (await cRes.json())?.[0] : null;
      if (esistente) {
        await fetch(`${env.SUPABASE_URL}/rest/v1/clienti?id=eq.${esistente.id}`, {
          method: "PATCH",
          headers: { ...sb, "Content-Type": "application/json", "Prefer": "return=minimal" },
          body: JSON.stringify({ visite: (esistente.visite || 0) + 1, ultima_visita: data, nome, ...(email ? { email } : {}) }),
        });
      } else if (cRes.ok) {
        await fetch(`${env.SUPABASE_URL}/rest/v1/clienti`, {
          method: "POST",
          headers: { ...sb, "Content-Type": "application/json", "Prefer": "return=minimal" },
          body: JSON.stringify({ salone_id: saloneId, nome, telefono, email, visite: 1, ultima_visita: data }),
        });
      }
    } catch (e) {
      console.error("Errore scheda cliente:", e.message);
    }

    return risposta(200, { ok: true });
  } catch (err) {
    return risposta(500, { error: err.message });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
