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
    const { salone_id, amount } = await request.json();

    if (!salone_id || !amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "salone_id e amount obbligatori" }), {
        status: 400, headers: { "Content-Type": "application/json", ...CORS },
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
    const mp = saloni?.[0]?.metodi_pagamento;

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
        amount: String(Math.round(amount * 100)), // Stripe vuole i centesimi
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
