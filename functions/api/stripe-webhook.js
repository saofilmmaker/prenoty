// Cloudflare Pages Function
// POST /api/stripe-webhook
// Riceve eventi Stripe e aggiorna Supabase

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const payload = await request.text();
    const sig = request.headers.get("stripe-signature");

    // Verifica firma Stripe (Webhook Secret)
    const isValid = await verifyStripeSignature(payload, sig, env.STRIPE_WEBHOOK_SECRET);
    if (!isValid) {
      return new Response("Firma non valida", { status: 400 });
    }

    const event = JSON.parse(payload);
    console.log("Stripe event:", event.type);

    // Gestisci i vari eventi
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(event.data.object, env);
    }

    if (event.type === "invoice.payment_succeeded") {
      await handlePaymentSucceeded(event.data.object, env);
    }

    if (event.type === "customer.subscription.deleted") {
      await handleSubscriptionDeleted(event.data.object, env);
    }

    return new Response("ok", { status: 200 });

  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(err.message, { status: 500 });
  }
}

// ── Handlers ──────────────────────────────────────────────

async function handleCheckoutCompleted(session, env) {
  const saloneId = session.metadata?.salone_id;
  if (!saloneId) return;

  // Calcola scadenza: oggi + 1 anno
  const scadenza = new Date();
  scadenza.setFullYear(scadenza.getFullYear() + 1);

  await supabaseUpdate(env, saloneId, {
    abbonamento_attivo: true,
    abbonamento_scade_il: scadenza.toISOString(),
    stripe_customer_id: session.customer,
    stripe_subscription_id: session.subscription,
  });
}

async function handlePaymentSucceeded(invoice, env) {
  // Rinnovo annuale: aggiorna la scadenza
  if (!invoice.subscription) return;

  // Recupera la subscription per trovare il salone_id
  const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${invoice.subscription}`, {
    headers: { "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}` },
  });
  const sub = await subRes.json();
  const saloneId = sub.metadata?.salone_id;
  if (!saloneId) return;

  const scadenza = new Date(sub.current_period_end * 1000);

  await supabaseUpdate(env, saloneId, {
    abbonamento_attivo: true,
    abbonamento_scade_il: scadenza.toISOString(),
  });
}

async function handleSubscriptionDeleted(subscription, env) {
  const saloneId = subscription.metadata?.salone_id;
  if (!saloneId) return;

  await supabaseUpdate(env, saloneId, {
    abbonamento_attivo: false,
  });
}

// ── Supabase update ────────────────────────────────────────

async function supabaseUpdate(env, saloneId, data) {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/saloni?id=eq.${saloneId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": env.SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    console.error("Supabase update error:", err);
  }
}

// ── Verifica firma Stripe ──────────────────────────────────

async function verifyStripeSignature(payload, sigHeader, secret) {
  if (!sigHeader || !secret) return false;

  const parts = sigHeader.split(",");
  const tPart = parts.find(p => p.startsWith("t="));
  const v1Part = parts.find(p => p.startsWith("v1="));
  if (!tPart || !v1Part) return false;

  const timestamp = tPart.slice(2);
  const expectedSig = v1Part.slice(3);
  const signedPayload = `${timestamp}.${payload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");

  return computed === expectedSig;
}
