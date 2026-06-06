# Security Guide — Prenoty

Guida alle protezioni di sicurezza implementate in Prenoty.
Scritta per essere riutilizzabile come riferimento su future webapp con lo stesso stack:
**Cloudflare Pages Functions + Supabase + Stripe + Resend**.

---

## Architettura di sicurezza a livelli

```
Browser / App cliente (anonimo)
    │
    ▼
[ Cloudflare Edge ]
    ├── Content-Security-Policy (build/_headers)
    ├── CORS — Origin whitelist su ogni endpoint
    └── Rate Limiting Middleware (_middleware.js + KV)
            │
            ▼
    [ Cloudflare Pages Functions ]
        ├── Input validation (400 su campi mancanti)
        ├── CRON_SECRET per endpoint cron HTTP
        ├── Stripe webhook — verifica firma HMAC-SHA256
        └── Chiavi segrete solo server-side (mai al frontend)
                │
                ▼
        [ Supabase ]
            ├── Row Level Security su tutte le tabelle
            ├── anon key (frontend) — limitate da RLS
            └── service_role key (solo Functions) — bypassa RLS
```

---

## 1. Content Security Policy

**File:** `build/_headers` (o `public/_headers` per il source)

```
/*
  Content-Security-Policy: default-src 'self';
    script-src  'self' 'unsafe-inline' 'unsafe-eval'
                https://cdn.tailwindcss.com
                https://embeds.iubenda.com https://cdn.iubenda.com
                https://js.stripe.com
                https://connect.facebook.net;
    connect-src 'self'
                https://lievvbydmynrdrmgxljm.supabase.co
                wss://lievvbydmynrdrmgxljm.supabase.co
                https://connect.facebook.net https://www.facebook.com
                https://nominatim.openstreetmap.org
                https://idb.flat.iubenda.com https://cs.iubenda.com
                https://cdn.iubenda.com https://privacyportal.onetrust.com;
    img-src     'self' data: https: https://www.facebook.com;
    frame-src   https://www.openstreetmap.org https://js.stripe.com;
    style-src   'self' 'unsafe-inline';
    font-src    'self' data:;
    object-src  'none';
    base-uri    'self';
```

**Regole chiave:**
- `default-src 'self'` — tutto bloccato di default
- `object-src 'none'` — blocca Flash e plugin legacy
- `base-uri 'self'` — previene base-tag injection
- `connect-src` include `wss://` per le realtime subscriptions di Supabase
- **Ogni nuovo servizio esterno** (analytics, font, CDN) va aggiunto esplicitamente

---

## 2. CORS — Origin Whitelist

**Applicato a:** tutti gli endpoint in `functions/api/`

```js
const CORS = {
  "Access-Control-Allow-Origin":  "https://prenoty.com",  // dominio esplicito, mai "*"
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Handler preflight obbligatorio su ogni endpoint
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
```

**Regola:** non usare mai `Access-Control-Allow-Origin: *` su endpoint che
ricevono dati sensibili o chiamano API esterne. Il wildcard si accetta solo
per asset pubblici statici (immagini, font).

---

## 3. Rate Limiting con Cloudflare KV

**File:** `functions/api/_middleware.js`

### Perché KV e non `Map` in-memory

Cloudflare Workers gira in isolati multipli in parallelo. Un `Map` in-memory
viene azzerato ad ogni cold start e non è condiviso tra isolati:
un bot con 10 richieste simultanee le manda a 10 isolati diversi, ognuno
con contatore = 0. **Il rate limiting in-memory non funziona in produzione.**

Il KV è condiviso, persistente e ha TTL nativo — è la soluzione corretta.

### Configurazione limiti

```js
const RATE_LIMITS = {
  // Endpoint email: ogni request invia email reali → vettore di spam
  '/api/send-booking-email':      { limit: 5,   windowSec: 300  }, // 5 / 5 min
  '/api/send-cancellation-email': { limit: 5,   windowSec: 300  }, // 5 / 5 min
  '/api/send-welcome-email':      { limit: 3,   windowSec: 3600 }, // 3 / ora

  // Endpoint pagamento: accede a chiavi Stripe, crea oggetti a pagamento
  '/api/create-payment-intent':   { limit: 10,  windowSec: 60   }, // 10 / min
  '/api/create-checkout-session': { limit: 5,   windowSec: 60   }, // 5 / min

  // Endpoint leggero, limite generoso
  '/api/event-id':                { limit: 200, windowSec: 60   }, // 200 / min
};
```

### Algoritmo sliding-window su KV

```js
async function checkRateLimit(kv, identifier, limit, windowSec) {
  // Divide il tempo in bucket: ogni bucket dura windowSec secondi
  const bucket = Math.floor(Date.now() / 1000 / windowSec);
  const key = `rl:${identifier}:${bucket}`;

  const raw = await kv.get(key);
  const count = raw ? parseInt(raw, 10) : 0;

  if (count >= limit) return false;

  // TTL = 2× finestra: il bucket vecchio si auto-cancella
  await kv.put(key, String(count + 1), { expirationTtl: windowSec * 2 });
  return true;
}
```

### Chiave di identificazione

```js
const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
const identifier = `${path}:${ip}`;
// Esempio: "/api/send-booking-email:1.2.3.4"
```

Usa `CF-Connecting-IP` (header Cloudflare, non falsificabile dal client)
anziché `X-Forwarded-For` (può essere spoofato).

### Eccezioni al rate limit

| Endpoint | Motivo dell'eccezione | Protezione alternativa |
|---|---|---|
| `stripe-webhook` | Solo Stripe può chiamarlo | Firma HMAC-SHA256 |
| `send-reminder-emails` | Solo cron interno | `CRON_SECRET` token |
| `send-trial-emails` | Solo cron interno | `CRON_SECRET` token |
| `OPTIONS` (preflight) | Non contiene payload | Nessuna necessaria |

### Fail-open

Se il KV non è configurato, il middleware logga un warning e lascia passare
le richieste senza bloccare. L'app non si rompe mai per via del rate limit.

```js
if (!env.RATE_LIMIT_KV) {
  console.warn('[rate-limit] RATE_LIMIT_KV non configurato');
  return next();
}
```

### Setup KV (una volta per progetto)

```bash
# 1. Crea il namespace
npx wrangler kv namespace create RATE_LIMIT_KV

# 2. Aggiungi l'id in wrangler.toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "<id-restituito>"
```

---

## 4. Protezione endpoint cron

I cron (`send-reminder-emails`, `send-trial-emails`) hanno due entry point:

- **`scheduled()`** — chiamato dal cron Cloudflare, non passa da HTTP
- **`onRequest()`** — path HTTP, usato per test manuali; va protetto

```js
// In _middleware.js
const CRON_PATHS = ['/api/send-reminder-emails', '/api/send-trial-emails'];

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
```

**Setup:**
```bash
# Genera secret (32 byte hex = 64 caratteri)
openssl rand -hex 32

# Aggiungi su Cloudflare Pages (production + preview)
echo "<secret>" | npx wrangler pages secret put CRON_SECRET --project-name <nome>
echo "<secret>" | npx wrangler pages secret put CRON_SECRET --project-name <nome> --env preview
```

**Uso in test manuali / CI:**
```bash
curl -X GET https://prenoty.com/api/send-reminder-emails \
  -H "X-Cron-Secret: <il-tuo-secret>"
```

---

## 5. Verifica firma Stripe Webhook

**File:** `functions/api/stripe-webhook.js`

Stripe firma ogni evento con HMAC-SHA256. Verificare la firma è l'unico modo
per essere certi che la richiesta venga davvero da Stripe e non da un attaccante
che simula eventi di pagamento.

```js
async function verifyStripeSignature(payload, sigHeader, secret) {
  if (!sigHeader || !secret) return false;

  // L'header ha formato: "t=<timestamp>,v1=<firma>"
  const parts   = sigHeader.split(",");
  const tPart   = parts.find(p => p.startsWith("t="));
  const v1Part  = parts.find(p => p.startsWith("v1="));
  if (!tPart || !v1Part) return false;

  const timestamp    = tPart.slice(2);
  const expectedSig  = v1Part.slice(3);
  const signedPayload = `${timestamp}.${payload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const computed = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, "0")).join("");

  return computed === expectedSig;
}
```

**Importante:** leggi il body come testo grezzo **prima** di fare `JSON.parse`.
Se fai `request.json()` direttamente perdi il body originale e la firma non
torna mai.

```js
const payload = await request.text();      // ← testo grezzo, non .json()
const sig     = request.headers.get("stripe-signature");
const isValid = await verifyStripeSignature(payload, sig, env.STRIPE_WEBHOOK_SECRET);
if (!isValid) return new Response("Firma non valida", { status: 400 });
const event   = JSON.parse(payload);       // ← parse solo dopo verifica
```

---

## 6. Gestione chiavi API e segreti

### Variabili d'ambiente — mappa completa

| Variabile | Dove viene usata | Livello di sensibilità |
|---|---|---|
| `STRIPE_SECRET_KEY` | `create-checkout-session`, `stripe-webhook` | Critico — mai al frontend |
| `STRIPE_PRICE_ID` | `create-checkout-session` | Bassa — ID pubblico Stripe |
| `STRIPE_WEBHOOK_SECRET` | `stripe-webhook` | Critico — firma eventi |
| `SUPABASE_URL` | Tutte le Functions | Bassa — URL pubblico |
| `SUPABASE_SERVICE_KEY` | Tutte le Functions lato server | Critico — bypassa RLS |
| `RESEND_API_KEY` | Tutte le Functions email | Alto — invia email a nome tuo |
| `CRON_SECRET` | `_middleware.js` | Alto — protegge cron HTTP |
| `RATE_LIMIT_KV` | `_middleware.js` | Binding KV (non una stringa) |

### Regola fondamentale: due livelli di accesso Supabase

```
Frontend (browser)          → supabase anon key  → limitata da RLS
Cloudflare Functions (edge) → service_role key   → accesso totale, bypassa RLS
```

La `service_role key` non deve mai finire nel bundle JavaScript del browser.
Si configura solo come variabile d'ambiente delle Functions.

### Chiavi Stripe dei titolari (caso speciale)

I titolari di Prenoty possono configurare la propria chiave Stripe per
ricevere pagamenti dai clienti. La `stripe_sk` del titolare è salvata in
Supabase nella colonna `metodi_pagamento` (JSONB).

**Flusso sicuro:**

```
App cliente (browser)
  │  POST /api/create-payment-intent { salone_id, amount }
  ▼
Cloudflare Function (server)
  │  Fetcha metodi_pagamento con service_role key
  │  Usa stripe_sk lato server per creare PaymentIntent
  │  Restituisce solo { client_secret, stripe_pk }
  ▼
App cliente
  ← Riceve solo stripe_pk (pubblica) e client_secret
  ← Non vede mai stripe_sk
```

```js
// ✓ Corretto: stripe_sk usata solo server-side
const pi = await fetch("https://api.stripe.com/v1/payment_intents", {
  headers: { "Authorization": `Bearer ${mp.stripe_sk}` },  // mai al frontend
});
return { client_secret: pi.client_secret, stripe_pk: mp.stripe_pk };

// ✗ Sbagliato: non restituire mai stripe_sk al browser
return { stripe_sk: mp.stripe_sk };  // ← non farlo mai
```

### Dove NON mettere i segreti

- **Non nel codice sorgente** — anche nei file non committati, usa sempre `env.*`
- **Non nel bundle JS del browser** — tutto ciò che è in `src/` finisce nel bundle
- **Non in `supabase.js`** — la anon key è accettabile (è pubblica per design);
  la service key no
- **Non nei log** — non fare `console.log(env.STRIPE_SECRET_KEY)`

---

## 7. Row Level Security (Supabase)

### Attori e livelli di accesso

| Attore | Come si autentica | `auth.uid()` |
|---|---|---|
| Titolare | `supabase.auth` (email/password) | = `saloni.user_id` |
| Admin Prenoty | `supabaseAdmin.auth` (sessione separata) | = `admins.id` |
| Cliente finale | Anonimo (nessun login) | `null` |
| Cloudflare Functions | `service_role key` | bypassa RLS |

### Isolamento sessioni (titolare vs admin)

Due istanze del client Supabase con `storageKey` diversi evitano che
la sessione admin sovrascriva quella del titolare quando entrambe
le pagine sono aperte:

```js
// src/supabase.js
export const supabase = createClient(url, anonKey, {
  auth: { storageKey: 'prenoty-session' }       // titolare
});

export const supabaseAdmin = createClient(url, anonKey, {
  auth: { storageKey: 'prenoty-admin-session' }  // admin
});
```

### Policy RLS complete

Esegui `supabase-rls.sql` nel SQL Editor di Supabase.
Lo STEP 0 del file usa un blocco `DO $$` dinamico che elimina **tutte**
le policy esistenti sulle 5 tabelle prima di ricrearle — safe da rieseguire.

#### SALONI

```sql
-- Chiunque può leggere (app cliente cerca il salone per slug)
CREATE POLICY "saloni_select_public"
  ON public.saloni FOR SELECT USING (true);

-- Solo il titolare può creare/modificare/cancellare il proprio salone
CREATE POLICY "saloni_insert_owner"
  ON public.saloni FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saloni_update_owner"
  ON public.saloni FOR UPDATE USING (auth.uid() = user_id);

-- L'admin Prenoty può aggiornare qualsiasi salone (abbonamento, recensioni)
CREATE POLICY "saloni_update_admin"
  ON public.saloni FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

CREATE POLICY "saloni_delete_owner"
  ON public.saloni FOR DELETE USING (auth.uid() = user_id);
```

#### SERVIZI

```sql
-- Lettura pubblica (app cliente mostra i servizi)
CREATE POLICY "servizi_select_public"
  ON public.servizi FOR SELECT USING (true);

-- Scrittura solo al titolare del salone tramite join
CREATE POLICY "servizi_insert_owner"
  ON public.servizi FOR INSERT
  WITH CHECK (salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid()));

CREATE POLICY "servizi_update_owner"
  ON public.servizi FOR UPDATE
  USING (salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid()));

CREATE POLICY "servizi_delete_owner"
  ON public.servizi FOR DELETE
  USING (salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid()));
```

#### PRENOTAZIONI

```sql
-- Lettura pubblica: necessaria per il controllo disponibilità orari
-- NOTA: espone PII (nome/tel/email cliente) — nelle query pubbliche
-- selezionare solo i campi strettamente necessari (data, ora, stato)
CREATE POLICY "prenotazioni_select_public"
  ON public.prenotazioni FOR SELECT USING (true);

-- Insert pubblico: il cliente prenota senza account
CREATE POLICY "prenotazioni_insert_public"
  ON public.prenotazioni FOR INSERT WITH CHECK (true);

-- Modifica/cancellazione solo al titolare
CREATE POLICY "prenotazioni_update_owner"
  ON public.prenotazioni FOR UPDATE
  USING (salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid()));

CREATE POLICY "prenotazioni_delete_owner"
  ON public.prenotazioni FOR DELETE
  USING (salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid()));
```

#### CLIENTI

```sql
-- Solo il titolare vede i propri clienti (privacy GDPR)
CREATE POLICY "clienti_select_owner"
  ON public.clienti FOR SELECT
  USING (salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid()));

-- Insert pubblico: cliente creato durante il flusso di prenotazione
CREATE POLICY "clienti_insert_public"
  ON public.clienti FOR INSERT WITH CHECK (true);

-- Modifica manuale: solo il titolare
CREATE POLICY "clienti_update_owner"
  ON public.clienti FOR UPDATE
  USING (salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid()));

-- Upsert anonimo durante prenotazione (aggiorna ultima_visita, contatore visite)
-- Intenzionalmente permissiva: necessaria perché il cliente non ha account.
-- Mitigazione futura: spostare in una RPC SECURITY DEFINER.
CREATE POLICY "clienti_update_booking"
  ON public.clienti FOR UPDATE USING (true);

CREATE POLICY "clienti_delete_owner"
  ON public.clienti FOR DELETE
  USING (salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid()));
```

#### ADMINS

```sql
-- Ogni admin vede solo il proprio record
CREATE POLICY "admins_select_self"
  ON public.admins FOR SELECT USING (auth.uid() = id);

-- Nessuna policy INSERT/UPDATE/DELETE: gli admin vengono
-- aggiunti manualmente via Supabase Studio
```

### Operazioni anonime sicure: RPC SECURITY DEFINER

Quando un utente anonimo deve eseguire un'operazione che modifica dati
altrimenti protetti (es. aggiungere una recensione), la soluzione corretta
non è aprire una policy UPDATE pubblica su tutta la tabella, ma creare
una funzione SQL con `SECURITY DEFINER` che esegue solo l'operazione
consentita:

```sql
CREATE OR REPLACE FUNCTION public.aggiungi_recensione(
  p_salone_id uuid,
  p_recensione jsonb
)
RETURNS void LANGUAGE plpgsql
SECURITY DEFINER          -- esegue come owner della funzione, non come utente corrente
SET search_path = public
AS $$
BEGIN
  UPDATE public.saloni
  SET recensioni = COALESCE(recensioni, '[]'::jsonb) || p_recensione
  WHERE id = p_salone_id;
END;
$$;

-- Permette l'esecuzione al ruolo anonimo
GRANT EXECUTE ON FUNCTION public.aggiungi_recensione(uuid, jsonb) TO anon;
```

Chiamata dal frontend:
```js
await supabase.rpc("aggiungi_recensione", {
  p_salone_id: salone.id,
  p_recensione: nuovaRecensione,
});
```

**Vantaggi rispetto a una policy UPDATE pubblica:**
- Limita l'operazione a un singolo campo (`recensioni`)
- Si possono aggiungere validazioni nel body della funzione
- Non apre altri campi della tabella a modifiche anonime

### Verifica policy attive

```sql
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('saloni', 'servizi', 'prenotazioni', 'clienti', 'admins')
ORDER BY tablename, policyname;
-- Atteso: 14 righe
```

---

## 8. Autenticazione frontend

### Login titolare

```js
// src/login.jsx
const { error } = await supabase.auth.signInWithPassword({ email, password });
```

### Registrazione

```js
// src/registrazione.jsx
const { data, error } = await supabase.auth.signUp({ email, password });
// Dopo signUp: inserire il record in public.saloni con user_id = data.user.id
```

### Doppio controllo admin

Dopo il login, verifica che l'utente sia nella tabella `admins`.
Se non lo è, esegui subito `signOut()` — questo evita che un titolare
qualsiasi acceda al pannello admin semplicemente navigando all'URL `/admin`.

```js
// src/admin-guard.jsx
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
const { data: adminData } = await supabase
  .from("admins").select("id").eq("id", data.user.id).maybeSingle();

if (!adminData) {
  setErrore("Account non autorizzato come admin");
  await supabase.auth.signOut();  // revoca sessione immediatamente
}
```

---

## 9. Input Validation

Ogni endpoint valida i campi richiesti e restituisce 400 prima di
fare qualsiasi chiamata esterna:

```js
const { saloneId, email, nomeNegozio } = await request.json();

if (!saloneId || !email) {
  return new Response(JSON.stringify({ error: "saloneId e email obbligatori" }), {
    status: 400,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}
```

Per gli importi numerici, verificare anche il range:
```js
if (!amount || amount <= 0) { ... }  // create-payment-intent
```

---

## 10. Anti-pattern da evitare

### ✗ Rate limiting in-memory

```js
// NON FARLO — non funziona su Cloudflare Workers in produzione
const rateLimitMap = new Map();
function isRateLimited(ip) {
  // Questa Map viene azzerata ad ogni cold start e non è condivisa
  // tra Worker isolates — un bot con richieste parallele la bypassa
}
```

**Soluzione:** usa Cloudflare KV come mostrato nel punto 3.

### ✗ Service key nel bundle frontend

```js
// NON FARLO — src/ finisce nel bundle JavaScript del browser
const supabase = createClient(url, process.env.SUPABASE_SERVICE_KEY);
```

**Soluzione:** la service key va solo in `env.*` delle Functions.

### ✗ Policy RLS UPDATE pubblica su tabelle con dati sensibili

```sql
-- NON FARLO su tabelle con PII senza una buona ragione documentata
CREATE POLICY "troppo_aperta" ON public.clienti FOR UPDATE USING (true);
```

**Soluzione:** usa una RPC `SECURITY DEFINER` per operazioni anonime specifiche.

### ✗ CORS wildcard su endpoint con dati

```js
// NON FARLO su endpoint che ricevono o restituiscono dati sensibili
"Access-Control-Allow-Origin": "*"
```

**Soluzione:** specifica il dominio esplicito.

### ✗ Leggere il body come JSON prima di verificare la firma

```js
// NON FARLO con Stripe webhook
const event = await request.json();  // ← consuma il body, firma non verificabile
```

**Soluzione:** leggi prima come testo, poi verifica, poi parsa.

---

## Checklist per nuovi progetti

### Cloudflare Pages Functions
- [ ] `_middleware.js` con rate limiting KV per tutti gli endpoint pubblici
- [ ] `CORS` con dominio esplicito su ogni endpoint
- [ ] Handler `OPTIONS` su ogni endpoint POST/GET
- [ ] Endpoint cron protetti da `CRON_SECRET`
- [ ] Webhook di terze parti verificati con firma HMAC
- [ ] Tutte le chiavi segrete in variabili d'ambiente, mai nel codice
- [ ] Input validation (400) prima di qualsiasi chiamata esterna
- [ ] `CF-Connecting-IP` per identificazione IP (non `X-Forwarded-For`)
- [ ] KV namespace creato: `npx wrangler kv namespace create <NOME>`
- [ ] `CRON_SECRET` generato con `openssl rand -hex 32` e caricato su prod+preview

### Supabase RLS
- [ ] `ENABLE ROW LEVEL SECURITY` su ogni tabella
- [ ] Script idempotente con DROP dinamico prima dei CREATE
- [ ] Lettura pubblica solo dove necessario (es. slug lookup, disponibilità)
- [ ] Scrittura pubblica solo dove necessario e documentata (es. insert prenotazione)
- [ ] Operazioni anonime complesse gestite con RPC `SECURITY DEFINER`
- [ ] Admin con policy separata (`EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())`)
- [ ] Verifica con query su `pg_policies` (conta le righe attese)

### Frontend
- [ ] `Content-Security-Policy` in `public/_headers`
- [ ] Due istanze Supabase con `storageKey` distinti se ci sono ruoli multipli
- [ ] Doppio controllo ruolo dopo login (es. query su tabella `admins`)
- [ ] `signOut()` immediato su accesso non autorizzato
- [ ] Chiavi pubbliche (anon key, stripe_pk) ok nel bundle
- [ ] Chiavi segrete (service key, stripe_sk) mai nel bundle

### Infrastruttura
- [ ] `wrangler.toml` con `pages_build_output_dir` e KV binding
- [ ] Cron trigger configurato nel dashboard Pages (non in `wrangler.toml`)
- [ ] Nessun segreto nel repository (controlla con `git log -p | grep -i secret`)
