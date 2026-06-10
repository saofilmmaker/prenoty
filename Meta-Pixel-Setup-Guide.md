# Guida: Installazione Meta Pixel su React + Cloudflare Pages
*Configurazione usata su prenoty.com — Giugno 2026*

---

## Il problema

Il pixel Meta installato direttamente nel browser (`index.html`) **non funzionava** perché:
1. **iubenda** (cookie banner) bloccava le richieste a `connect.facebook.net`
2. **Ad blocker** dei browser bloccavano `fbevents.js`
3. La **Content Security Policy (CSP)** configurata su Cloudflare non permetteva le connessioni a Facebook

---

## La soluzione: Cloudflare Zaraz

Zaraz è uno strumento di Cloudflare che carica i pixel **lato server** (server-side), bypassando completamente ad blocker, iubenda e CSP browser-side.

**Vantaggi:**
- Bypassa ad blocker e iubenda
- Più affidabile del pixel browser
- Include CAPI (Conversions API) integrata
- Piano gratuito: 1.000.000 eventi/mese

---

## Step 1 — Genera il CAPI Token su Meta

1. Vai su **Meta Events Manager** → seleziona il dataset del sito
2. **Impostazioni** → scorri fino a **"API Conversions"**
3. Clicca **"Genera token d'accesso"**
4. Copia il token (stringa lunga ~200 caratteri)

---

## Step 2 — Configura Cloudflare Zaraz

1. Vai su **dash.cloudflare.com** → seleziona il dominio
2. Menu sinistro → **Distribuzione e prestazioni** → **Gestione dei tag Web**
3. Seleziona il dominio → **Configurazione tag**
4. Clicca **"Facebook Pixel"**
5. Segui il wizard:
   - **Autorizzazioni**: lascia tutto attivo → Continua
   - **Configura**:
     - `Pixel ID`: inserisci l'ID del pixel Meta
     - `Conversion API Access Token`: incolla il token del Step 1
     - `Test Event Code`: lascia vuoto (solo per test temporanei)
   - Salva

---

## Step 3 — Verifica con Test Event Code

1. **Meta Events Manager** → **Testa gli eventi** → cambia canale su **"Server"**
2. Copia il codice tipo `TEST12345`
3. Torna su **Zaraz → Facebook Pixel → Impostazioni** → incolla nel campo `Test Event Code` → Salva
4. Apri il sito in un nuovo tab
5. Verifica che in Events Manager appaia **PageView** con sorgente **"Server"**
6. **Rimuovi il Test Event Code** da Zaraz dopo la verifica

---

## Step 4 — Aggiungi eventi personalizzati

In **Zaraz → Trigger** crea i trigger:

| Nome Trigger | Tipo | Configurazione |
|---|---|---|
| `Visita Prezzi` | Regola di corrispondenza | Proprietà evento: `url` · Contiene: `prezzi` |
| `Click Registrati` | Listener clic · CSS | Selettore: `.btn-glass-green-cta` |
| `Click Accedi` | Listener clic · CSS | Selettore: `a[href="/login"]` |

In **Zaraz → Facebook Pixel → Crea azione** collega i trigger:

| Nome Azione | Trigger | Evento Meta |
|---|---|---|
| `ViewContent Prezzi` | Visita Prezzi | `ViewContent` |
| `Lead Registrati` | Click Registrati | `Lead` |
| `Lead Accedi` | Click Accedi | `Lead` |

---

## Step 5 — Content Security Policy (CSP)

Se il progetto usa una CSP (tramite Cloudflare Transform Rules o `_headers`), aggiungi questi domini:

```
script-src: https://connect.facebook.net

connect-src: https://connect.facebook.net
             https://www.facebook.com
             https://idb.flat.iubenda.com
             https://cs.iubenda.com
             https://cdn.iubenda.com
```

> **Nota**: Con Zaraz il pixel gira server-side, quindi la CSP browser è meno critica.
> Ma va aggiornata per evitare errori in console.

---

## Step 6 — Aggiorna la Privacy Policy su iubenda

Dopo aver aggiunto il pixel, iubenda scansiona il sito e segnala i servizi mancanti.

1. Vai su **iubenda.com** → Privacy Policy del progetto → **Aggiungi servizio**
2. Aggiungi:
   - **Meta Events Manager**
   - **Monitoraggio conversioni di Meta ads**
3. Salva e chiudi

---

## Step 7 — Deduplicazione eventi (Pixel + CAPI)

Zaraz invia ogni evento **due volte** a Meta: una via Pixel (browser) e una via CAPI (server). Senza deduplicazione Meta conta ogni evento doppio, gonfiando i dati e aumentando il costo per risultato.

**Il problema**: Zaraz non supporta JavaScript personalizzato nelle variabili, quindi non si può generare l'`event_id` direttamente nel dashboard.

**La soluzione**: una Cloudflare Pages Function che genera un UUID univoco, chiamata da Zaraz tramite variabile.

### 7a — Crea il file `functions/api/event-id.js`

Nel progetto Cloudflare Pages, crea il file:

```javascript
// functions/api/event-id.js
// GET /api/event-id
// Restituisce un UUID v4 univoco per la deduplicazione Meta Pixel + CAPI

const CORS = {
  "Access-Control-Allow-Origin": "https://tuosito.com", // ← cambia con il tuo dominio
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
```

Fai commit e push — Cloudflare deploya automaticamente.

### 7b — Verifica che funzioni

Apri nel browser:
```
https://tuosito.com/api/event-id
```

Deve rispondere con:
```json
{"event_id":"550e8400-e29b-41d4-a716-446655440000"}
```

### 7c — Crea la variabile in Zaraz

1. Vai su **Zaraz → Variabili → Crea variabile**
2. Imposta:
   - **Nome:** `meta_event_id`
   - **Tipo:** `Stringa`
   - **Valore:** `__zaraz_eventId`
3. Salva

### 7d — Collega l'Event ID a ogni azione personalizzata

Per ogni azione personalizzata (Lead Registrati, Lead Accedi, ViewContent Prezzi):

1. Apri l'azione → **Aggiungi campo**
2. Seleziona **Event ID**
3. Clicca `+` → seleziona la variabile `meta_event_id`
4. Salva

### 7e — Come funziona il flusso completo

```
Browser                    Cloudflare Edge              Meta
  │                              │                        │
  ├─ GET /api/event-id ─────────►│                        │
  │◄─ { event_id: "abc-123" } ───┤                        │
  │                              │                        │
  ├─ zaraz.track("Lead") ────────►│                        │
  │                              ├─ Pixel (browser) ──────►│ event_id: abc-123
  │                              ├─ CAPI (server) ─────────►│ event_id: abc-123
  │                              │                        │
  │                              │       Meta deduplica: conta 1 solo evento
```

### 7f — Verifica dopo 24-48 ore

Vai su **Meta Events Manager → Dataset → PageView → Copertura degli eventi**.

- ✅ Obiettivo: copertura ≥ 75%
- ⚠️ Se rimane a 0%: controlla che le azioni abbiano l'Event ID configurato

---

## Step 8 — Aggiungere il parametro fbc alle azioni personalizzate

### Perché serve

Il parametro `fbc` è l'ID clic di Facebook (dal cookie `_fbc`). Inviarlo negli eventi
server-side migliora la qualità dell'associazione degli eventi in Meta Events Manager.
Senza `fbc`, il punteggio rimane basso (~6/10) anche con email e nome presenti.

### Come configurarlo in Zaraz

Per ogni azione personalizzata (Lead Accedi, Lead Registrati):

1. Apri l'azione → **Aggiungi campo**
2. Seleziona **"Aggiungi campo personalizzato..."** in fondo alla lista
3. **Nome campo:** `fbc`
4. **Valore:** clicca `+` → scorri fino alla sezione **COOKIE** → clicca **"Cookie: ..."**
5. Nel popup scrivi: `_fbc` → clicca **Conferma**
6. Salva

### Struttura aggiornata

```
Azioni personalizzate:
├── Lead Accedi
│   ├── Event ID: meta_event_id ✅
│   └── fbc: Cookie _fbc ✅
└── Lead Registrati
    ├── Event ID: meta_event_id ✅
    └── fbc: Cookie _fbc ✅
```

### Risultato atteso

Il punteggio qualità associazione in Meta Events Manager dovrebbe
salire da ~6/10 a 7-8/10 nei giorni successivi alla configurazione.

---

## Rimuovere il pixel browser

Se hai già il pixel in `index.html`, **rimuovilo** per evitare eventi doppi.
Zaraz gestisce tutto — il codice browser non serve più.

```html
<!-- RIMUOVERE questo blocco da index.html -->
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)...
fbq('init', 'PIXEL_ID');
fbq('track', 'PageView');
</script>
<!-- End Meta Pixel Code -->
```

---

## Struttura finale

```
Meta Events Manager
└── Dataset (sito.com)
    └── Pixel ID: XXXXXXXXXXXXXXX

Cloudflare Pages
└── functions/api/event-id.js  ← genera UUID per deduplicazione

Cloudflare Zaraz
└── Facebook Pixel
    ├── Pixel ID: XXXXXXXXXXXXXXX
    ├── CAPI Token: [token Meta]
    ├── Azioni automatizzate: Pageviews ✅ Events ✅ E-commerce ✅
    ├── Azioni personalizzate:
    │   ├── ViewContent Prezzi (trigger: url contiene "prezzi") + Event ID ✅
    │   ├── Lead Registrati (trigger: click .btn-glass-green-cta) + Event ID ✅ + fbc ✅
    │   └── Lead Accedi (trigger: click a[href="/login"]) + Event ID ✅ + fbc ✅
    └── Variabili:
        └── meta_event_id (Stringa: __zaraz_eventId)
```

---

## Note importanti

- **Zaraz è gratuito** fino a 1M eventi/mese su Cloudflare
- Il pixel browser in `index.html` va **rimosso** dopo la configurazione Zaraz
- Il **Test Event Code** va rimosso dopo la verifica
- Gli eventi Zaraz appaiono con sorgente **"Server"** in Meta Events Manager
- Per nuovi bottoni CTA, aggiornare il selettore CSS nel trigger corrispondente
- **La deduplicazione (Step 7) è obbligatoria** — senza, Meta conta ogni evento doppio
- **Il parametro fbc (Step 8) è obbligatorio** — senza, la qualità associazione rimane bassa
- Zaraz non supporta JavaScript personalizzato nelle variabili → serve sempre la Pages Function `/api/event-id`
