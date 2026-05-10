// Cloudflare Pages Function — Cron Job
// Eseguito ogni giorno alle 08:00 UTC (configurato in wrangler.toml)
// Cerca prenotazioni di domani e invia email promemoria ai clienti

const SUPABASE_URL = "https://lievvbydmynrdrmgxljm.supabase.co";

export async function onRequest(context) {
  const { env } = context;
  const result = await runReminderCheck(env);
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function scheduled(event, env, ctx) {
  ctx.waitUntil(runReminderCheck(env));
}

async function runReminderCheck(env) {
  // Data di domani in formato YYYY-MM-DD
  const domani = new Date();
  domani.setDate(domani.getDate() + 1);
  const domaniStr = domani.toISOString().split("T")[0];

  const domaniLeggibile = domani.toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
  const domaniCapitalized = domaniLeggibile.charAt(0).toUpperCase() + domaniLeggibile.slice(1);

  const risultati = { inviati: [], errori: [] };

  // Cerca tutte le prenotazioni di domani con email cliente
  const prenRes = await fetch(
    `${SUPABASE_URL}/rest/v1/prenotazioni?data=eq.${domaniStr}&stato=eq.confermato&email_cliente=neq.null&select=id,nome_cliente,email_cliente,ora,nomi_servizi,prezzo,salone_id`,
    {
      headers: {
        "apikey": env.SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  if (!prenRes.ok) {
    return { errore: "Errore fetch prenotazioni", status: prenRes.status };
  }

  const prenotazioni = await prenRes.json();
  if (!prenotazioni.length) return { inviati: [], messaggio: "Nessuna prenotazione domani" };

  // Carica i nomi dei saloni coinvolti
  const saloneIds = [...new Set(prenotazioni.map(p => p.salone_id))];
  const saloniRes = await fetch(
    `${SUPABASE_URL}/rest/v1/saloni?id=in.(${saloneIds.join(",")})&select=id,nome,slug`,
    {
      headers: {
        "apikey": env.SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      },
    }
  );
  const saloni = saloniRes.ok ? await saloniRes.json() : [];
  const saloneMap = {};
  saloni.forEach(s => { saloneMap[s.id] = s; });

  // Invia un promemoria per ogni prenotazione
  for (const pren of prenotazioni) {
    const salone = saloneMap[pren.salone_id] || {};
    const nomeSalone = salone.nome || "il tuo salone";
    const linkSalone = salone.slug ? `https://prenoty.com/${salone.slug}` : "https://prenoty.com";

    const html = `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
</head>
<body style="margin:0;padding:0;background:#f4f3ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color-scheme:light;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <div style="text-align:center;margin-bottom:32px;">
      <img src="https://prenoty.com/Prenoty_Viola.png" alt="Prenoty" style="height:28px;" />
    </div>

    <div style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(108,92,231,0.08);">

      <div style="background:#4a3cb5;padding:28px 32px;text-align:center;">
        <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:16px;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 6px;">Promemoria appuntamento</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">Il tuo appuntamento è <strong>domani!</strong></p>
      </div>

      <div style="padding:28px 32px;">
        <p style="color:#1a1730;font-size:15px;margin:0 0 24px;">
          Ciao <strong>${pren.nome_cliente}</strong>, ti ricordiamo il tuo appuntamento di domani:
        </p>

        <div style="background:#f4f3ff;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;width:40%;">Salone</td>
              <td style="padding:8px 0;color:#1a1730;font-size:14px;font-weight:600;">${nomeSalone}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;">Servizio</td>
              <td style="padding:8px 0;color:#1a1730;font-size:14px;font-weight:600;border-top:1px solid #e0dcff;">${pren.nomi_servizi || "—"}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;">Quando</td>
              <td style="padding:8px 0;color:#1a1730;font-size:14px;font-weight:600;border-top:1px solid #e0dcff;">${domaniCapitalized}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;">Ora</td>
              <td style="padding:8px 0;color:#6c5ce7;font-size:18px;font-weight:700;border-top:1px solid #e0dcff;">${pren.ora?.slice(0,5) || "—"}</td>
            </tr>
          </table>
        </div>

        <div style="text-align:center;">
          <a href="${linkSalone}" style="display:inline-block;background:#6c5ce7;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
            Vedi il salone →
          </a>
        </div>
      </div>
    </div>

    <p style="color:#9b96c8;font-size:12px;text-align:center;margin:24px 0 0;">
      Per cancellare o modificare contatta direttamente il salone.<br/>
      <a href="https://prenoty.com" style="color:#6c5ce7;text-decoration:none;">prenoty.com</a>
    </p>
  </div>
</body>
</html>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Prenoty <noreply@prenoty.com>",
        to: [pren.email_cliente],
        subject: `⏰ Promemoria: appuntamento domani alle ${pren.ora?.slice(0,5)} — ${nomeSalone}`,
        html,
      }),
    });

    if (resendRes.ok) {
      risultati.inviati.push({ email: pren.email_cliente, salone: nomeSalone });
    } else {
      const err = await resendRes.text();
      risultati.errori.push({ email: pren.email_cliente, errore: err });
    }
  }

  return risultati;
}
