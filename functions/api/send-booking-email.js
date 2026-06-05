// Cloudflare Pages Function
// POST /api/send-booking-email
// Body: { emailCliente, emailTitolare, nomeCliente, telefonoCliente, nomeSalone, servizi, data, ora, staff, prezzo, slugSalone }
// Invia email di conferma al cliente E notifica al titolare via Resend

const CORS = {
  "Access-Control-Allow-Origin": "https://prenoty.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { emailCliente, emailTitolare, nomeCliente, telefonoCliente, nomeSalone, servizi, data, ora, staff, prezzo, slugSalone, metodoPagamento, iban, intestatario, codiceBonifico } = await request.json();

    if (!emailCliente) {
      return new Response(JSON.stringify({ error: "emailCliente obbligatoria" }), {
        status: 400, headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    // Formatta data leggibile
    const dataObj = new Date(data + "T00:00:00");
    const dataLeggibile = dataObj.toLocaleDateString("it-IT", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
    const dataCapitalized = dataLeggibile.charAt(0).toUpperCase() + dataLeggibile.slice(1);
    const giorno = dataObj.getDate();
    const meseBreve = dataObj.toLocaleDateString("it-IT", { month: "short" }).toUpperCase().replace(".","");

    const linkSalone = slugSalone ? `https://prenoty.com/${slugSalone}` : "https://prenoty.com";

    const html = `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
</head>
<body style="margin:0;padding:0;background:#f4f3ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color-scheme:light;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <img src="https://prenoty.com/Prenoty_Viola.png" alt="Prenoty" style="height:28px;" />
    </div>

    <!-- Card principale -->
    <div style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(108,92,231,0.08);">

      <!-- Header viola -->
      <div style="background:#6c5ce7;padding:32px 32px 28px;text-align:center;">
        <!-- Icona calendario stile Prenoty — tabella per compatibilità Gmail -->
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 18px;border-radius:14px;overflow:hidden;background:#ffffff;width:58px;">
          <tr>
            <td style="background:#4a3cb5;height:18px;text-align:center;vertical-align:middle;border-radius:14px 14px 0 0;">
              <span style="color:#ffffff;font-size:9px;font-weight:700;letter-spacing:2px;font-family:sans-serif;">&#11044; &#11044;</span>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;text-align:center;padding:4px 0 6px;border-radius:0 0 14px 14px;">
              <div style="font-family:sans-serif;font-size:8px;font-weight:700;color:#6c5ce7;letter-spacing:1.5px;text-transform:uppercase;">${meseBreve}</div>
              <div style="font-family:sans-serif;font-size:22px;font-weight:800;color:#1a1730;line-height:1.1;">${giorno}</div>
            </td>
          </tr>
        </table>
        <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 6px;">Appuntamento confermato!</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">Ti aspettiamo da <strong>${nomeSalone}</strong></p>
      </div>

      <!-- Dettagli appuntamento -->
      <div style="padding:28px 32px;">

        <p style="color:#1a1730;font-size:15px;margin:0 0 24px;">
          Ciao <strong>${nomeCliente}</strong>, la tua prenotazione è confermata. Ecco il riepilogo:
        </p>

        <!-- Riepilogo -->
        <div style="background:#f4f3ff;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;width:40%;vertical-align:top;">Salone</td>
              <td style="padding:8px 0;color:#1a1730;font-size:14px;font-weight:600;vertical-align:top;">${nomeSalone}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;vertical-align:top;">Servizio</td>
              <td style="padding:8px 0;color:#1a1730;font-size:14px;font-weight:600;border-top:1px solid #e0dcff;vertical-align:top;">${servizi}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;vertical-align:top;">Data</td>
              <td style="padding:8px 0;color:#1a1730;font-size:14px;font-weight:600;border-top:1px solid #e0dcff;vertical-align:top;">${dataCapitalized}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;vertical-align:top;">Ora</td>
              <td style="padding:8px 0;color:#6c5ce7;font-size:18px;font-weight:700;border-top:1px solid #e0dcff;vertical-align:top;">${ora}</td>
            </tr>
            ${staff ? `
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;vertical-align:top;">Con</td>
              <td style="padding:8px 0;color:#1a1730;font-size:14px;font-weight:600;border-top:1px solid #e0dcff;vertical-align:top;">${staff}</td>
            </tr>` : ""}
            ${prezzo > 0 ? `
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;vertical-align:top;">Prezzo</td>
              <td style="padding:8px 0;color:#1a1730;font-size:14px;font-weight:600;border-top:1px solid #e0dcff;vertical-align:top;">€${prezzo}</td>
            </tr>` : ""}
          </table>
        </div>

        <!-- Bonifico bancario — mostrato solo se il cliente ha scelto bonifico -->
        ${metodoPagamento === "bonifico" && iban ? `
        <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:18px 20px;margin-bottom:16px;">
          <p style="color:#92400e;font-size:13px;font-weight:700;margin:0 0 10px;">💳 Completa il pagamento tramite bonifico</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:5px 0;color:#78350f;font-size:12px;width:36%;">Intestatario</td>
              <td style="padding:5px 0;color:#1a1730;font-size:13px;font-weight:600;">${intestatario}</td>
            </tr>
            <tr>
              <td style="padding:5px 0;color:#78350f;font-size:12px;">IBAN</td>
              <td style="padding:5px 0;color:#1a1730;font-size:13px;font-weight:600;font-family:monospace;">${iban}</td>
            </tr>
            ${prezzo > 0 ? `<tr>
              <td style="padding:5px 0;color:#78350f;font-size:12px;">Importo</td>
              <td style="padding:5px 0;color:#1a1730;font-size:13px;font-weight:600;">€${prezzo}</td>
            </tr>` : ""}
            <tr>
              <td style="padding:5px 0;color:#78350f;font-size:12px;">Causale</td>
              <td style="padding:5px 0;color:#1a1730;font-size:16px;font-weight:800;font-family:monospace;letter-spacing:1px;">${codiceBonifico || `PRE-${nomeSalone.slice(0,3).toUpperCase()}`}</td>
            </tr>
          </table>
          <!-- Box causale evidenziata -->
          <div style="background:#fffbeb;border:2px dashed #f59e0b;border-radius:8px;padding:14px;margin-top:12px;text-align:center;">
            <div style="color:#92400e;font-size:11px;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Scrivi questa causale nel bonifico</div>
            <div style="color:#1a1730;font-size:20px;font-weight:800;font-family:monospace;letter-spacing:2px;">${codiceBonifico || ""}</div>
          </div>
          <p style="color:#92400e;font-size:12px;margin:10px 0 0;">Il titolare troverà questo codice nella causale e identificherà subito la tua prenotazione.</p>
        </div>
        ` : ""}

        <!-- Info promemoria -->
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
          <p style="color:#166534;font-size:13px;margin:0;">
            ✓ Riceverai un promemoria via email <strong>24 ore prima</strong> dell'appuntamento.
          </p>
        </div>

        <!-- CTA -->
        <div style="text-align:center;margin-bottom:8px;">
          <a href="${linkSalone}" style="display:inline-block;background:#6c5ce7;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
            Vedi il salone →
          </a>
        </div>

      </div>
    </div>

    <!-- Footer -->
    <p style="color:#9b96c8;font-size:12px;text-align:center;margin:24px 0 0;">
      Hai bisogno di cancellare o modificare? Contatta direttamente il salone.<br/>
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
        to: [emailCliente],
        subject: `✓ Appuntamento confermato — ${nomeSalone} · ${ora} del ${dataCapitalized}`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ error: err }), {
        status: 500, headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    // Email notifica al titolare (se ha un'email configurata)
    if (emailTitolare) {
      const htmlTitolare = `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
</head>
<body style="margin:0;padding:0;background:#f4f3ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color-scheme:light;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <img src="https://prenoty.com/Prenoty_Viola.png" alt="Prenoty" style="height:28px;" />
    </div>

    <!-- Card principale -->
    <div style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(108,92,231,0.08);">

      <!-- Header verde (distinto dal viola del cliente) -->
      <div style="background:#6c5ce7;padding:32px 32px 28px;text-align:center;">
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 18px;border-radius:14px;overflow:hidden;background:#ffffff;width:58px;">
          <tr>
            <td style="background:#4a3cb5;height:18px;text-align:center;vertical-align:middle;border-radius:14px 14px 0 0;">
              <span style="color:#ffffff;font-size:9px;font-weight:700;letter-spacing:2px;font-family:sans-serif;">&#11044; &#11044;</span>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;text-align:center;padding:4px 0 6px;border-radius:0 0 14px 14px;">
              <div style="font-family:sans-serif;font-size:8px;font-weight:700;color:#6c5ce7;letter-spacing:1.5px;text-transform:uppercase;">${meseBreve}</div>
              <div style="font-family:sans-serif;font-size:22px;font-weight:800;color:#1a1730;line-height:1.1;">${giorno}</div>
            </td>
          </tr>
        </table>
        <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 6px;">Nuova prenotazione!</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">Un cliente ha appena prenotato da <strong>${nomeSalone}</strong></p>
      </div>

      <!-- Dettagli -->
      <div style="padding:28px 32px;">

        <p style="color:#1a1730;font-size:15px;margin:0 0 24px;">
          Ecco i dettagli della prenotazione appena ricevuta:
        </p>

        <!-- Riepilogo -->
        <div style="background:#f4f3ff;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;width:40%;vertical-align:top;">Cliente</td>
              <td style="padding:8px 0;color:#1a1730;font-size:14px;font-weight:600;vertical-align:top;">${nomeCliente}</td>
            </tr>
            ${telefonoCliente ? `
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;vertical-align:top;">Telefono</td>
              <td style="padding:8px 0;color:#1a1730;font-size:14px;font-weight:600;border-top:1px solid #e0dcff;vertical-align:top;">${telefonoCliente}</td>
            </tr>` : ""}
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;vertical-align:top;">Servizio</td>
              <td style="padding:8px 0;color:#1a1730;font-size:14px;font-weight:600;border-top:1px solid #e0dcff;vertical-align:top;">${servizi}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;vertical-align:top;">Data</td>
              <td style="padding:8px 0;color:#1a1730;font-size:14px;font-weight:600;border-top:1px solid #e0dcff;vertical-align:top;">${dataCapitalized}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;vertical-align:top;">Ora</td>
              <td style="padding:8px 0;color:#6c5ce7;font-size:18px;font-weight:700;border-top:1px solid #e0dcff;vertical-align:top;">${ora}</td>
            </tr>
            ${staff ? `
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;vertical-align:top;">Con</td>
              <td style="padding:8px 0;color:#1a1730;font-size:14px;font-weight:600;border-top:1px solid #e0dcff;vertical-align:top;">${staff}</td>
            </tr>` : ""}
            ${prezzo > 0 ? `
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;vertical-align:top;">Prezzo</td>
              <td style="padding:8px 0;color:#1a1730;font-size:14px;font-weight:600;border-top:1px solid #e0dcff;vertical-align:top;">€${prezzo}</td>
            </tr>` : ""}
          </table>
        </div>

        <!-- CTA dashboard -->
        <div style="text-align:center;margin-bottom:8px;">
          <a href="https://prenoty.com/dashboard" style="display:inline-block;background:#6c5ce7;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
            Vai alla dashboard →
          </a>
        </div>

      </div>
    </div>

    <!-- Footer -->
    <p style="color:#9b96c8;font-size:12px;text-align:center;margin:24px 0 0;">
      Notifica automatica di <a href="https://prenoty.com" style="color:#6c5ce7;text-decoration:none;">prenoty.com</a>
    </p>

  </div>
</body>
</html>`;

      const resendTitolare = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Prenoty <noreply@prenoty.com>",
          to: [emailTitolare],
          subject: `🔔 Nuova prenotazione — ${nomeCliente} · ${ora} del ${dataCapitalized}`,
          html: htmlTitolare,
        }),
      });
      if (!resendTitolare.ok) {
        const errT = await resendTitolare.text();
        console.error("Resend titolare error:", errT);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
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
