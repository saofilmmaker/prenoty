// Cloudflare Pages Function — Cron Job
// Eseguito ogni giorno a mezzanotte (configurato in wrangler.toml)
// Controlla i saloni con prova in scadenza e invia email via Resend

export async function onRequest(context) {
  const { env } = context;
  const result = await runTrialEmailCheck(env);
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
}

// Esportato anche per uso da scheduled worker
export async function scheduled(event, env, ctx) {
  ctx.waitUntil(runTrialEmailCheck(env));
}

async function runTrialEmailCheck(env) {
  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);

  const risultati = { inviati: [], errori: [] };

  // Controlla per 7, 3 e 1 giorni prima della scadenza
  for (const giorni of [7, 3, 1]) {
    const dataTarget = new Date(oggi);
    dataTarget.setDate(dataTarget.getDate() + giorni);
    const dataStr = dataTarget.toISOString().split("T")[0]; // YYYY-MM-DD

    // Cerca saloni con prova che scade esattamente tra N giorni
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/saloni?prova_scade_il=eq.${dataStr}&abbonamento_attivo=eq.false&select=id,nome_negozio,email`,
      {
        headers: {
          "apikey": env.SUPABASE_SERVICE_KEY,
          "Authorization": `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (!res.ok) {
      risultati.errori.push(`Supabase query error per ${giorni} giorni: ${await res.text()}`);
      continue;
    }

    const saloni = await res.json();

    for (const salone of saloni) {
      if (!salone.email) continue;

      try {
        await inviaEmailScadenza(salone, giorni, env);
        risultati.inviati.push({ salone: salone.nome_negozio, giorni });
      } catch (err) {
        risultati.errori.push({ salone: salone.nome_negozio, giorni, errore: err.message });
      }
    }
  }

  console.log("Trial email check:", JSON.stringify(risultati));
  return risultati;
}

async function inviaEmailScadenza(salone, giorniRimasti, env) {
  const nomeNegozio = salone.nome_negozio || "il tuo negozio";

  let oggetto, messaggioHtml;

  if (giorniRimasti === 7) {
    oggetto = `⏳ La tua prova gratuita di Prenoty scade tra 7 giorni`;
    messaggioHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <img src="https://prenoty.com/P_prenoty_Viola.png" alt="Prenoty" style="height: 40px; margin-bottom: 24px;" />
        <h2 style="color: #1a1730;">Ciao! La tua prova sta per scadere 👋</h2>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">
          La prova gratuita di <strong>${nomeNegozio}</strong> su Prenoty scade tra <strong>7 giorni</strong>.
        </p>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">
          Per continuare a ricevere prenotazioni senza interruzioni, acquista il piano Prenoty al prezzo di <strong>€299 una tantum</strong> — nessun abbonamento, paghi una volta sola.
        </p>
        <a href="https://prenoty.com/dashboard"
           style="display: inline-block; background: #4a3cb5; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Acquista ora →
        </a>
        <p style="color: #888; font-size: 14px; margin-top: 32px;">
          Hai domande? Rispondi a questa email, siamo qui per aiutarti.
        </p>
        <p style="color: #bbb; font-size: 12px;">Prenoty • prenoty.com</p>
      </div>
    `;
  } else if (giorniRimasti === 3) {
    oggetto = `⚠️ Ultimi 3 giorni di prova gratuita — Prenoty`;
    messaggioHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <img src="https://prenoty.com/P_prenoty_Viola.png" alt="Prenoty" style="height: 40px; margin-bottom: 24px;" />
        <h2 style="color: #1a1730;">Ultimi 3 giorni! ⚠️</h2>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">
          La prova gratuita di <strong>${nomeNegozio}</strong> scade tra soli <strong>3 giorni</strong>.
        </p>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">
          Dopo la scadenza il tuo link prenotazioni verrà disattivato. Sblocca Prenoty subito con un pagamento unico di <strong>€299</strong>.
        </p>
        <a href="https://prenoty.com/dashboard"
           style="display: inline-block; background: #e07b00; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Attiva il piano ora →
        </a>
        <p style="color: #888; font-size: 14px; margin-top: 32px;">
          Hai bisogno di aiuto? Rispondi a questa email.
        </p>
        <p style="color: #bbb; font-size: 12px;">Prenoty • prenoty.com</p>
      </div>
    `;
  } else if (giorniRimasti === 1) {
    oggetto = `🚨 Ultimo giorno di prova — il tuo account si blocca domani`;
    messaggioHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <img src="https://prenoty.com/P_prenoty_Viola.png" alt="Prenoty" style="height: 40px; margin-bottom: 24px;" />
        <h2 style="color: #c0392b;">Ultimo giorno! 🚨</h2>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">
          La prova gratuita di <strong>${nomeNegozio}</strong> scade <strong>domani</strong>.
        </p>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">
          Domani il tuo link prenotazioni verrà disattivato e i clienti non potranno più prenotare. Evitalo subito con il piano Prenoty a <strong>€299 una tantum</strong>.
        </p>
        <a href="https://prenoty.com/dashboard"
           style="display: inline-block; background: #c0392b; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Attiva subito →
        </a>
        <p style="color: #888; font-size: 14px; margin-top: 32px;">
          Hai bisogno di aiuto? Rispondi a questa email, ti rispondiamo subito.
        </p>
        <p style="color: #bbb; font-size: 12px;">Prenoty • prenoty.com</p>
      </div>
    `;
  }

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Prenoty <noreply@prenoty.com>",
      to: [salone.email],
      subject: oggetto,
      html: messaggioHtml,
    }),
  });

  if (!emailRes.ok) {
    const err = await emailRes.text();
    throw new Error(`Resend error: ${err}`);
  }

  return await emailRes.json();
}
