// Cloudflare Pages Function
// POST /api/send-booking-email
// Body: { emailCliente, nomeCliente, nomeSalone, servizi, data, ora, staff, prezzo, slugSalone }
// Invia email di conferma prenotazione al cliente via Resend

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { emailCliente, nomeCliente, nomeSalone, servizi, data, ora, staff, prezzo, slugSalone } = await request.json();

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
        <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:16px;margin:0 auto 16px;line-height:56px;text-align:center;font-size:28px;">
          &#128197;
        </div>
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
