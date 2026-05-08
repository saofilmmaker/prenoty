// Cloudflare Pages Function
// POST /api/send-welcome-email
// Body: { email, nomeNegozio }
// Invia email di benvenuto via Resend al nuovo iscritto

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://prenoty.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const { email, nomeNegozio, tipoAttivita } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "email obbligatoria" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const isGenerico = tipoAttivita === "generico";
    const parolaAttivita = isGenerico ? "attività" : "salone";
    const parolaAttivitaMaiusc = isGenerico ? "Attività" : "Salone";
    const nome = nomeNegozio || (isGenerico ? "la tua attività" : "il tuo salone");

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">

        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 32px;">
          <img src="https://prenoty.com/Prenoty_Viola.png" alt="Prenoty" style="height: 32px;" />
        </div>

        <!-- Titolo -->
        <h1 style="color: #1a1730; font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 8px;">
          Benvenuto su Prenoty! 🎉
        </h1>
        <p style="color: #6c5ce7; text-align: center; font-size: 15px; margin-bottom: 32px;">
          Il tuo account è attivo — inizia subito a ricevere prenotazioni.
        </p>

        <!-- Box principale -->
        <div style="background: #f4f3ff; border-radius: 16px; padding: 28px; margin-bottom: 28px;">
          <p style="color: #1a1730; font-size: 16px; line-height: 1.7; margin: 0 0 16px;">
            Ciao! La tua ${parolaAttivita} <strong>${nome}</strong> è stata creata con successo.<br/>
            Hai <strong>30 giorni gratuiti</strong> per provare tutte le funzionalità di Prenoty.
          </p>
          <p style="color: #555; font-size: 14px; line-height: 1.7; margin: 0;">
            Accedi alla dashboard per:
          </p>
          <ul style="color: #555; font-size: 14px; line-height: 2; margin: 8px 0 0; padding-left: 20px;">
            <li>Personalizzare il nome e i servizi della tua ${parolaAttivita}</li>
            <li>Impostare i tuoi orari di disponibilità</li>
            <li>Condividere il tuo link prenotazioni ai clienti</li>
          </ul>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="https://prenoty.com/dashboard"
             style="display: inline-block; background: #4a3cb5; color: #ffffff; padding: 16px 36px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px;">
            Vai alla dashboard →
          </a>
        </div>

        <!-- Passi suggeriti -->
        <div style="border-top: 1px solid #e0dcff; padding-top: 24px; margin-bottom: 24px;">
          <p style="color: #1a1730; font-weight: 700; font-size: 14px; margin-bottom: 16px;">
            3 cose da fare subito:
          </p>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <span style="background: #6c5ce7; color: white; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;">1</span>
              <div>
                <strong style="color: #1a1730; font-size: 14px;">Aggiungi i tuoi servizi</strong><br/>
                <span style="color: #888; font-size: 13px;">Inserisci i servizi che offri con durata e prezzo</span>
              </div>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <span style="background: #6c5ce7; color: white; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;">2</span>
              <div>
                <strong style="color: #1a1730; font-size: 14px;">Imposta i tuoi orari</strong><br/>
                <span style="color: #888; font-size: 13px;">Indica quando sei disponibile, giorno per giorno</span>
              </div>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <span style="background: #6c5ce7; color: white; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;">3</span>
              <div>
                <strong style="color: #1a1730; font-size: 14px;">Condividi il link ai clienti</strong><br/>
                <span style="color: #888; font-size: 13px;">Copia il tuo link e mettilo su Instagram, WhatsApp o dove vuoi</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <p style="color: #bbb; font-size: 12px; text-align: center; margin: 0;">
          Hai bisogno di aiuto? Rispondi a questa email, siamo qui per te.<br/>
          <a href="https://prenoty.com" style="color: #6c5ce7; text-decoration: none;">prenoty.com</a>
        </p>
      </div>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Prenoty <noreply@prenoty.com>",
        to: [email],
        subject: "🎉 Benvenuto su Prenoty — il tuo salone è pronto!",
        html,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ error: err }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
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
