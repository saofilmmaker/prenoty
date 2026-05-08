// Cloudflare Pages Function
// POST /api/create-checkout-session
// Body: { saloneId, email, nomeNegozio }
// Crea una Stripe Checkout Session e restituisce l'URL

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS
  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://prenoty.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const { saloneId, email, nomeNegozio } = await request.json();

    if (!saloneId || !email) {
      return new Response(JSON.stringify({ error: "saloneId e email obbligatori" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Crea Stripe Checkout Session
    const params = new URLSearchParams({
      "mode": "subscription",
      "line_items[0][price]": env.STRIPE_PRICE_ID,
      "line_items[0][quantity]": "1",
      "customer_email": email,
      "success_url": `https://prenoty.com/dashboard?abbonamento=success`,
      "cancel_url": `https://prenoty.com/dashboard?abbonamento=cancel`,
      "metadata[salone_id]": saloneId,
      "metadata[nome_negozio]": nomeNegozio || "",
      "subscription_data[metadata][salone_id]": saloneId,
      "allow_promotion_codes": "true",
      "locale": "it",
    });

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await stripeRes.json();

    if (!stripeRes.ok) {
      console.error("Stripe error:", session);
      return new Response(JSON.stringify({ error: session.error?.message || "Errore Stripe" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "https://prenoty.com",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
