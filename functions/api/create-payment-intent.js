// Cloudflare Pages Function
// POST /api/create-payment-intent
// Body: { salone_id, amount }
// Recupera stripe_sk del salone da Supabase, crea un PaymentIntent Stripe
// Restituisce { client_secret, stripe_pk }

const CORS = {
  "Access-Control-Allow-Origin": "https://prenoty.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Il rate limiting (10 req/min per IP) è gestito da _middleware.js via KV.

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { salone_id, amount, servizi_ids } = await request.json();

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const ids = [...new Set(Array.isArray(servizi_ids) ? servizi_ids.map(String) : [])];
    if (!salone_id || !UUID_RE.test(String(salone_id)) || ids.length === 0 || ids.length > 20 || !ids.every((i) => UUID_RE.test(i))) {
      return new Response(JSON.stringify({ error: "salone_id e servizi obbligatori" }), {
        status: 400, headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    // L'importo lo calcola il server dai prezzi nel database: quello inviato dalla pagina non conta
    const serviziRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/servizi?salone_id=eq.${salone_id}&id=in.(${ids.join(",")})&select=id,prezzo`,
      { headers: { "apikey": env.SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${env.SUPABASE_SERVICE_KEY}` } }
    );
    if (!serviziRes.ok) {
      return new Response(JSON.stringify({ error: "Errore calcolo importo" }), {
        status: 500, headers: { "Content-Type": "application/json", ...CORS },
      });
    }
    const serviziDb = await serviziRes.json();
    if (!Array.isArray(serviziDb) || serviziDb.length !== ids.length) {
      return new Response(JSON.stringify({ error: "Servizi non validi per questo salone" }), {
        status: 400, headers: { "Content-Type": "application/json", ...CORS },
      });
    }
    const importo = Math.round(serviziDb.reduce((t, x) => t + (Number(x.prezzo) || 0), 0) * 100) / 100;
    if (!(importo > 0)) {
      return new Response(JSON.stringify({ error: "Importo non valido" }), {
        status: 400, headers: { "Content-Type": "application/json", ...CORS },
      });
    }
    // Se la pagina mostra un prezzo diverso da quello reale (prezzi cambiati), non si incassa: si ricarica la pagina
    if (amount != null && Math.abs(Number(amount) - importo) > 0.01) {
      return new Response(JSON.stringify({ error: "I prezzi sono cambiati. Ricarica la pagina e riprova." }), {
        status: 409, headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    // Recupera le chiavi Stripe del salone da Supabase (lato server — stripe_sk non va mai al frontend)
    const supabaseRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/saloni?id=eq.${salone_id}&select=metodi_pagamento`,
      {
        headers: {
          "apikey": env.SUPABASE_SERVICE_KEY,
          "Authorization": `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (!supabaseRes.ok) {
      return new Response(JSON.stringify({ error: "Errore recupero dati salone" }), {
        status: 500, headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    const saloni = await supabaseRes.json();
    const mp = { ...(saloni?.[0]?.metodi_pagamento || {}) };

    // La chiave segreta sta nella tabella protetta "saloni_segreti"; se non c'è, si usa il vecchio campo
    try {
      const segRes = await fetch(
        `${env.SUPABASE_URL}/rest/v1/saloni_segreti?salone_id=eq.${encodeURIComponent(salone_id)}&select=stripe_sk`,
        { headers: { "apikey": env.SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${env.SUPABASE_SERVICE_KEY}` } }
      );
      if (segRes.ok) {
        const seg = await segRes.json();
        if (seg?.[0]?.stripe_sk) mp.stripe_sk = seg[0].stripe_sk;
      }
    } catch (_) { /* usa il vecchio campo */ }

    if (!mp?.stripe || !mp?.stripe_sk || !mp?.stripe_pk) {
      return new Response(JSON.stringify({ error: "Stripe non configurato per questo salone" }), {
        status: 400, headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    // Crea PaymentIntent su Stripe con la chiave segreta del salone
    const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mp.stripe_sk}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: String(Math.round(importo * 100)), // Stripe vuole i centesimi (importo calcolato dal server)
        currency: "eur",
        "automatic_payment_methods[enabled]": "true",
      }),
    });

    if (!stripeRes.ok) {
      const err = await stripeRes.text();
      console.error("Stripe error:", err);
      return new Response(JSON.stringify({ error: "Errore Stripe" }), {
        status: 500, headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    const pi = await stripeRes.json();

    return new Response(JSON.stringify({
      client_secret: pi.client_secret,
      stripe_pk: mp.stripe_pk, // La chiave pubblica è sicura da restituire al frontend
    }), {
      status: 200, headers: { "Content-Type": "application/json", ...CORS },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...CORS },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
