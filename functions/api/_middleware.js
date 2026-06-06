// Rate limiting middleware — si applica a tutti gli endpoint /api/*
//
// Usa Cloudflare KV per i contatori: persiste tra Worker isolates,
// al contrario di un Map in-memory che viene azzerato ad ogni cold start.
//
// Setup richiesto (una volta sola):
//   1. wrangler kv:namespace create RATE_LIMIT_KV
//   2. Aggiungi l'id restituito in wrangler.toml (vedi commento lì)
//   3. Aggiungi CRON_SECRET come variabile d'ambiente nel dashboard Cloudflare
//      Pages → Settings → Environment variables

// ── Limiti per endpoint ────────────────────────────────────────────────────
//
//  send-booking-email / send-cancellation-email:
//    5 richieste per IP ogni 5 minuti — ogni call manda 2 email reali,
//    un bot potrebbe esaurire Resend o spammare inbox arbitrarie.
//
//  send-welcome-email:
//    3 per IP ogni ora — inviata una volta sola alla registrazione.
//
//  create-payment-intent:
//    10 per IP al minuto — accede alle chiavi Stripe del salone.
//
//  create-checkout-session:
//    5 per IP al minuto — crea session Stripe, costo API non trascurabile.
//
//  event-id:
//    200 per IP al minuto — solo genera UUID, limite generoso anti-scraping.
//
const RATE_LIMITS = {
  '/api/send-booking-email':      { limit: 5,   windowSec: 300  },
  '/api/send-cancellation-email': { limit: 5,   windowSec: 300  },
  '/api/send-welcome-email':      { limit: 3,   windowSec: 3600 },
  '/api/create-payment-intent':   { limit: 10,  windowSec: 60   },
  '/api/create-checkout-session': { limit: 5,   windowSec: 60   },
  '/api/event-id':                { limit: 200, windowSec: 60   },
};

// Endpoint riservati al cron Cloudflare.
// La chiamata via scheduler usa l'export `scheduled()` e non passa dal middleware.
// Questo blocco protegge il path HTTP (usato per test manuali / CI):
// richiede l'header X-Cron-Secret con il valore della env var CRON_SECRET.
const CRON_PATHS = ['/api/send-reminder-emails', '/api/send-trial-emails'];

// ── Sliding-window counter su KV ──────────────────────────────────────────
async function checkRateLimit(kv, identifier, limit, windowSec) {
  const bucket = Math.floor(Date.now() / 1000 / windowSec);
  const key = `rl:${identifier}:${bucket}`;

  const raw = await kv.get(key);
  const count = raw ? parseInt(raw, 10) : 0;

  if (count >= limit) return false;

  await kv.put(key, String(count + 1), { expirationTtl: windowSec * 2 });
  return true;
}

// ── Middleware principale ─────────────────────────────────────────────────
export async function onRequest(context) {
  const { request, env, next } = context;

  // Preflight CORS: non rate-limitare
  if (request.method === 'OPTIONS') return next();

  const path = new URL(request.url).pathname;

  // Endpoint cron: protetti da secret, non da rate limit
  if (CRON_PATHS.some(p => path.startsWith(p))) {
    const provided = request.headers.get('X-Cron-Secret');
    if (!env.CRON_SECRET || provided !== env.CRON_SECRET) {
      return new Response(JSON.stringify({ error: 'Non autorizzato' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return next();
  }

  // Stripe webhook: già verificato da firma HMAC, nessun rate limit aggiuntivo
  if (path.startsWith('/api/stripe-webhook')) return next();

  const config = RATE_LIMITS[path];
  if (!config) return next();

  // KV non configurato: lascia passare con un warning (fail-open, non blocca il deploy)
  if (!env.RATE_LIMIT_KV) {
    console.warn('[rate-limit] RATE_LIMIT_KV non configurato — rate limiting disabilitato');
    return next();
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const allowed = await checkRateLimit(env.RATE_LIMIT_KV, `${path}:${ip}`, config.limit, config.windowSec);

  if (!allowed) {
    return new Response(
      JSON.stringify({ error: 'Troppe richieste. Riprova tra qualche minuto.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(config.windowSec),
          'Access-Control-Allow-Origin': 'https://prenoty.com',
        },
      }
    );
  }

  return next();
}
