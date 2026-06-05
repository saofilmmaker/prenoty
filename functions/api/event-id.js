// Cloudflare Pages Function
// GET /api/event-id
// Restituisce un UUID v4 univoco da usare come event_id per la deduplicazione
// tra Meta Pixel (browser) e Conversions API (server-side, tramite Zaraz).

const CORS = {
  "Access-Control-Allow-Origin": "https://prenoty.com",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestGet() {
  const event_id = crypto.randomUUID();

  return new Response(JSON.stringify({ event_id }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...CORS,
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
