// Cloudflare Pages Function
// POST /api/send-cancellation-email
// Body: { emailCliente, emailTitolare, nomeCliente, telefonoCliente, nomeSalone, servizi, data, ora, slugSalone }
// Invia email di cancellazione al cliente E notifica al titolare via Resend

const CORS = {
  "Access-Control-Allow-Origin": "https://prenoty.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
// Protegge il testo che finisce dentro la pagina dell'email (niente link o codice inseriti da altri)
const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
// Testo semplice per l'oggetto dell'email: niente a capo o caratteri di controllo
const txt = (v) => String(v ?? "").replace(/[\u0000-\u001f]+/g, " ").trim().slice(0, 120);
const risposta = (status, obj) => new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", ...CORS } });

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();

    // Questa email la può mandare solo il titolare collegato, per il proprio salone
    const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
    if (!token) return risposta(401, { error: "Accesso richiesto" });
    const saloneId = String(body.salone_id || "");
    if (!UUID_RE.test(saloneId)) return risposta(400, { error: "Salone non valido" });

    const sb = { "apikey": env.SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${env.SUPABASE_SERVICE_KEY}` };
    const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: { "apikey": env.SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${token}` },
    });
    if (!userRes.ok) return risposta(401, { error: "Accesso non valido" });
    const utente = await userRes.json();
    if (!utente?.id || !UUID_RE.test(utente.id)) return risposta(401, { error: "Accesso non valido" });

    const salRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/saloni?id=eq.${saloneId}&user_id=eq.${utente.id}&select=nome,slug,email`,
      { headers: sb }
    );
    const sal = salRes.ok ? (await salRes.json())?.[0] : null;
    if (!sal) return risposta(403, { error: "Non autorizzato per questo salone" });

    // Dati per l'email: salone e indirizzo del titolare dal database, testo protetto
    const emailCliente = body.emailCliente && EMAIL_RE.test(String(body.emailCliente).trim()) && String(body.emailCliente).length <= 254 ? String(body.emailCliente).trim() : null;
    const emailTitolare = sal.email && EMAIL_RE.test(sal.email) ? sal.email : null;
    const nomeCliente = esc(body.nomeCliente);
    const nomeClienteTxt = txt(body.nomeCliente);
    const telefonoCliente = esc(body.telefonoCliente);
    const nomeSalone = esc(sal.nome);
    const nomeSaloneTxt = txt(sal.nome);
    const servizi = esc(body.servizi);
    const data = String(body.data || "").slice(0, 10);
    const ora = String(body.ora || "").slice(0, 5);
    const slugSalone = sal.slug ? encodeURIComponent(sal.slug) : "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return risposta(400, { error: "Data non valida" });

    if (!emailCliente && !emailTitolare) {
      return new Response(JSON.stringify({ error: "Nessun destinatario" }), {
        status: 400, headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    const dataObj = new Date(data + "T00:00:00");
    const dataLeggibile = dataObj.toLocaleDateString("it-IT", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
    const dataCapitalized = dataLeggibile.charAt(0).toUpperCase() + dataLeggibile.slice(1);
    const giorno = dataObj.getDate();
    const meseBreve = dataObj.toLocaleDateString("it-IT", { month: "short" }).toUpperCase().replace(".", "");
    const linkSalone = slugSalone ? `https://prenoty.com/${slugSalone}` : "https://prenoty.com";

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

      <!-- Header grigio/neutro per cancellazione -->
      <div style="background:#6b7280;padding:28px 32px;text-align:center;">
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 18px;border-radius:14px;overflow:hidden;background:#ffffff;width:58px;">
          <tr>
            <td style="background:#4b5563;height:18px;text-align:center;vertical-align:middle;border-radius:14px 14px 0 0;">
              <span style="color:#ffffff;font-size:9px;font-weight:700;letter-spacing:2px;font-family:sans-serif;">&#11044; &#11044;</span>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;text-align:center;padding:4px 0 6px;border-radius:0 0 14px 14px;">
              <div style="font-family:sans-serif;font-size:8px;font-weight:700;color:#6b7280;letter-spacing:1.5px;text-transform:uppercase;">${meseBreve}</div>
              <div style="font-family:sans-serif;font-size:22px;font-weight:800;color:#1a1730;line-height:1.1;">${giorno}</div>
            </td>
          </tr>
        </table>
        <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 6px;">Appuntamento annullato</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">Il tuo appuntamento da <strong>${nomeSalone}</strong> è stato cancellato</p>
      </div>

      <div style="padding:28px 32px;">
        <p style="color:#1a1730;font-size:15px;margin:0 0 24px;">
          Ciao <strong>${nomeCliente}</strong>, ti informiamo che il seguente appuntamento è stato annullato:
        </p>

        <div style="background:#f4f3ff;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;width:40%;">Salone</td>
              <td style="padding:8px 0;color:#1a1730;font-size:14px;font-weight:600;">${nomeSalone}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;">Servizio</td>
              <td style="padding:8px 0;color:#1a1730;font-size:14px;font-weight:600;border-top:1px solid #e0dcff;text-decoration:line-through;color:#9b96c8;">${servizi}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;">Data</td>
              <td style="padding:8px 0;color:#9b96c8;font-size:14px;font-weight:600;border-top:1px solid #e0dcff;text-decoration:line-through;">${dataCapitalized}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;">Ora</td>
              <td style="padding:8px 0;color:#9b96c8;font-size:14px;font-weight:600;border-top:1px solid #e0dcff;text-decoration:line-through;">${ora}</td>
            </tr>
          </table>
        </div>

        <p style="color:#6b7280;font-size:13px;margin:0 0 24px;line-height:1.6;text-align:center;">
          Per fissare un nuovo appuntamento, visita la pagina del salone.
        </p>

        <div style="text-align:center;">
          <a href="${linkSalone}" style="display:inline-block;background:#6c5ce7;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
            Prenota di nuovo →
          </a>
        </div>
      </div>
    </div>

    <p style="color:#9b96c8;font-size:12px;text-align:center;margin:24px 0 0;">
      <a href="https://prenoty.com" style="color:#6c5ce7;text-decoration:none;">prenoty.com</a>
    </p>
  </div>
</body>
</html>`;

    // Email al CLIENTE (se presente)
    if (emailCliente) {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Prenoty <noreply@prenoty.com>",
          to: [emailCliente],
          subject: `Appuntamento annullato — ${nomeSaloneTxt} · ${ora} del ${dataCapitalized}`,
          html,
        }),
      });
      if (!resendRes.ok) {
        const err = await resendRes.text();
        console.error("Resend error (cliente):", err);
      }
    }

    // Email al TITOLARE (notifica annullamento)
    if (emailTitolare) {
      const htmlTitolare = `
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
      <div style="background:#6b7280;padding:28px 32px;text-align:center;">
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 18px;border-radius:14px;overflow:hidden;background:#ffffff;width:58px;">
          <tr>
            <td style="background:#4b5563;height:18px;text-align:center;vertical-align:middle;border-radius:14px 14px 0 0;">
              <span style="color:#ffffff;font-size:9px;font-weight:700;letter-spacing:2px;font-family:sans-serif;">&#11044; &#11044;</span>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;text-align:center;padding:4px 0 6px;border-radius:0 0 14px 14px;">
              <div style="font-family:sans-serif;font-size:8px;font-weight:700;color:#6b7280;letter-spacing:1.5px;text-transform:uppercase;">${meseBreve}</div>
              <div style="font-family:sans-serif;font-size:22px;font-weight:800;color:#1a1730;line-height:1.1;">${giorno}</div>
            </td>
          </tr>
        </table>
        <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 6px;">Appuntamento annullato</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">Un appuntamento da <strong>${nomeSalone}</strong> è stato annullato</p>
      </div>
      <div style="padding:28px 32px;">
        <p style="color:#1a1730;font-size:15px;margin:0 0 24px;">
          È stato annullato il seguente appuntamento:
        </p>
        <div style="background:#f4f3ff;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;width:40%;">Cliente</td>
              <td style="padding:8px 0;color:#1a1730;font-size:14px;font-weight:600;">${nomeCliente}</td>
            </tr>
            ${telefonoCliente ? `
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;">Telefono</td>
              <td style="padding:8px 0;color:#1a1730;font-size:14px;font-weight:600;border-top:1px solid #e0dcff;">${telefonoCliente}</td>
            </tr>` : ""}
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;">Servizio</td>
              <td style="padding:8px 0;color:#9b96c8;font-size:14px;font-weight:600;border-top:1px solid #e0dcff;text-decoration:line-through;">${servizi}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;">Data</td>
              <td style="padding:8px 0;color:#9b96c8;font-size:14px;font-weight:600;border-top:1px solid #e0dcff;text-decoration:line-through;">${dataCapitalized}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#9b96c8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid #e0dcff;">Ora</td>
              <td style="padding:8px 0;color:#9b96c8;font-size:14px;font-weight:600;border-top:1px solid #e0dcff;text-decoration:line-through;">${ora}</td>
            </tr>
          </table>
        </div>
        <div style="text-align:center;">
          <a href="https://prenoty.com/dashboard" style="display:inline-block;background:#6c5ce7;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
            Vai alla dashboard →
          </a>
        </div>
      </div>
    </div>
    <p style="color:#9b96c8;font-size:12px;text-align:center;margin:24px 0 0;">
      Notifica automatica di <a href="https://prenoty.com" style="color:#6c5ce7;text-decoration:none;">prenoty.com</a>
    </p>
  </div>
</body>
</html>`;

      const resendTit = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Prenoty <noreply@prenoty.com>",
          to: [emailTitolare],
          subject: `Appuntamento annullato — ${nomeClienteTxt} · ${ora} del ${dataCapitalized}`,
          html: htmlTitolare,
        }),
      });
      if (!resendTit.ok) {
        const err = await resendTit.text();
        console.error("Resend error (titolare):", err);
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
