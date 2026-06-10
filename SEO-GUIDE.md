# SEO Guide — React SPA

Guida riutilizzabile basata su quanto implementato su **Prenoty** (React + Cloudflare Pages).  
Ogni sezione contiene il codice pronto da copiare e le note sul perché funziona.

---

## Indice

1. [Struttura dei file SEO](#1-struttura-dei-file-seo)
2. [Meta tag statici in index.html](#2-meta-tag-statici-in-indexhtml)
3. [Open Graph](#3-open-graph)
4. [Twitter Card](#4-twitter-card)
5. [Structured Data — SoftwareApplication](#5-structured-data--softwareapplication)
6. [Structured Data — FAQPage](#6-structured-data--faqpage)
7. [sitemap.xml](#7-sitemapxml)
8. [robots.txt](#8-robotstxt)
9. [Meta tag dinamici con react-helmet-async](#9-meta-tag-dinamici-con-react-helmet-async)
10. [Google Search Console](#10-google-search-console)
11. [Checklist finale](#11-checklist-finale)

---

## 1. Struttura dei file SEO

```
public/
  index.html       ← meta tag statici, structured data, og, twitter
  sitemap.xml      ← URL pubbliche indicizzabili
  robots.txt       ← direttive crawler + puntamento al sitemap
src/
  index.js         ← HelmetProvider avvolge tutto l'app
  [pagina-slug].jsx ← <Helmet> dinamico per ogni pagina generata da dati
```

**Regola generale:** tutto ciò che è uguale per tutto il sito va in `index.html`.  
Tutto ciò che cambia pagina per pagina va in `<Helmet>` nel componente React.

---

## 2. Meta tag statici in index.html

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

  <!-- Google Search Console — verifica proprietà -->
  <meta name="google-site-verification" content="IL_TUO_CODICE_QUI" />

  <!-- SEO primario -->
  <title>NomeApp | Proposta di valore principale | Keyword secondaria</title>
  <meta name="description" content="Descrizione di 120–160 caratteri. Includi la keyword principale e una call to action." />
  <meta name="keywords" content="keyword1, keyword2, keyword3" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://tuodominio.com/" />
</head>
```

**Note:**
- `lang="it"` è obbligatorio per il ranking in italiano.
- Il `title` ideale è 50–60 caratteri. Oltre 60 Google lo tronca.
- La `description` non influenza il ranking direttamente ma influenza il CTR (click-through rate).
- Il `canonical` evita contenuto duplicato se il sito è raggiungibile da URL diverse (con/senza www, con/senza slash finale).
- `keywords` è ignorato da Google ma utile per Bing e DuckDuckGo.

---

## 3. Open Graph

Controlla l'anteprima su Facebook, WhatsApp, LinkedIn, Telegram.

```html
<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://tuodominio.com/" />
<meta property="og:title" content="NomeApp — Tagline breve" />
<meta property="og:description" content="Descrizione per i social: 2–3 righe, tono diretto." />
<meta property="og:image" content="https://tuodominio.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="it_IT" />
<meta property="og:site_name" content="NomeApp" />
```

**Note critiche:**
- L'immagine OG **deve esistere** nella cartella `public/`. Verificare sempre.
- Dimensioni raccomandate: **1200×630px** (ratio 1.91:1). Meno di 600px di larghezza viene ignorata da alcuni client.
- `og:description` può essere diversa dal meta `description` — spesso funziona meglio con tono più marketing.
- Dopo il deploy, aggiornare il cache con [Facebook Debugger](https://developers.facebook.com/tools/debug/) → "Fetch new information".

---

## 4. Twitter Card

```html
<!-- Twitter / X Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="NomeApp — Tagline breve" />
<meta name="twitter:description" content="Descrizione per Twitter/X." />
<meta name="twitter:image" content="https://tuodominio.com/og-image.png" />
```

**Note:**
- `summary_large_image` mostra l'immagine grande sopra il testo. Usarla sempre per SaaS/prodotti.
- Se non hai un account Twitter/X, metti comunque i tag: WhatsApp su desktop li usa a volte come fallback.

---

## 5. Structured Data — SoftwareApplication

Per app/SaaS: attiva i rich snippet su Google (stelle, prezzo, piattaforma).

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "NomeApp",
  "url": "https://tuodominio.com",
  "description": "Descrizione del software in 1–2 frasi.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR",
    "description": "30 giorni gratuiti, poi piano a pagamento"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "ratingCount": "1"
  },
  "publisher": {
    "@type": "Organization",
    "name": "NomeApp",
    "url": "https://tuodominio.com",
    "logo": "https://tuodominio.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@tuodominio.com",
      "contactType": "customer support"
    }
  }
}
</script>
```

**Note:**
- `applicationCategory` valori comuni: `BusinessApplication`, `UtilitiesApplication`, `HealthApplication`, `FinanceApplication`.
- `aggregateRating` richiede dati reali: se hai 0 recensioni, rimuovere il campo o Google può penalizzare.
- Validare su [Google Rich Results Test](https://search.google.com/test/rich-results).

---

## 6. Structured Data — FAQPage

Per pagine con FAQ: attiva l'espansione delle domande direttamente nei risultati di ricerca (SERP).

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Domanda 1?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Risposta completa alla domanda 1."
      }
    },
    {
      "@type": "Question",
      "name": "Domanda 2?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Risposta completa alla domanda 2."
      }
    }
  ]
}
</script>
```

**Note:**
- Le FAQ devono corrispondere a domande visibili sulla pagina HTML — Google le confronta.
- Massimo 10–15 voci. Oltre quella soglia Google mostra solo le prime.
- Formato `text` in `acceptedAnswer`: solo testo plain, no HTML.

---

## 7. sitemap.xml

File `public/sitemap.xml` — include solo le URL pubbliche e indicizzabili.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Homepage -->
  <url>
    <loc>https://tuodominio.com/</loc>
    <lastmod>2026-06-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Pagina di conversione principale (signup, pricing, ecc.) -->
  <url>
    <loc>https://tuodominio.com/registrazione</loc>
    <lastmod>2026-06-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Pagine di contenuto secondario -->
  <url>
    <loc>https://tuodominio.com/come-funziona</loc>
    <lastmod>2026-06-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Pagine legali -->
  <url>
    <loc>https://tuodominio.com/privacy-policy</loc>
    <lastmod>2026-06-10</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>

  <url>
    <loc>https://tuodominio.com/termini-di-servizio</loc>
    <lastmod>2026-06-10</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>

  <url>
    <loc>https://tuodominio.com/cookie-policy</loc>
    <lastmod>2026-06-10</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>

</urlset>
```

**Cosa NON includere nel sitemap:**
- Pagine protette da login (`/dashboard`, `/admin`)
- Pagine di utilità (`/recupera-password`, `/nuova-password`, `/blocco`)
- Pagine 404 o di errore
- URL duplicate (con e senza trailing slash)
- Pagine dinamiche generate da dati utente (es. `/:slug`) — a meno che non siano pubbliche e stabili

**Dopo il deploy:** sottometti su [Google Search Console](https://search.google.com/search-console) → Sitemaps → inserisci `https://tuodominio.com/sitemap.xml`.

---

## 8. robots.txt

File `public/robots.txt`.

```
User-agent: *
Disallow: /dashboard
Disallow: /admin
Disallow: /blocco
Disallow: /recupera-password
Disallow: /nuova-password

Sitemap: https://tuodominio.com/sitemap.xml
```

**Note:**
- `Disallow:` (vuoto) = tutto indicizzabile. Non omettere la riga — alcuni crawler si aspettano almeno una direttiva.
- La direttiva `Sitemap:` è opzionale ma accelera il crawling: Google trova subito tutte le URL.
- `User-agent: *` si applica a tutti i crawler. Per escludere solo alcuni bot (es. GPTBot): aggiungere un blocco separato.
- Non elencare le URL private nel sitemap E bloccarle in robots: scegliere una sola strategia. Meglio bloccarle solo in robots e non metterle nel sitemap.

---

## 9. Meta tag dinamici con react-helmet-async

Per pagine generate da dati (es. `/:slug`, `/prodotto/:id`, `/utente/:username`).

### Installazione

```bash
npm install react-helmet-async
```

### 1 — Avvolgere l'app in HelmetProvider (index.js / main.jsx)

```jsx
import { HelmetProvider } from 'react-helmet-async';

root.render(
  <HelmetProvider>
    <BrowserRouter>
      <Routes>
        {/* ... */}
      </Routes>
    </BrowserRouter>
  </HelmetProvider>
);
```

### 2 — Calcolo dei meta tag nel componente pagina

```jsx
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

export default function PaginaSlug() {
  const { slug } = useParams();
  const [entita, setEntita] = useState({ nome: "", descrizione: "", immagine: null, indirizzo: "" });

  // ... caricamento dati da API/Supabase ...

  // ── Meta tag — calcolare PRIMA degli early return ──────────────────────
  const metaTitle = entita.nome
    ? `${entita.nome} — Prenota online | NomeApp`
    : "NomeApp — Tagline default";

  const metaDescription = (() => {
    if (!entita.nome) return "NomeApp — Descrizione default.";
    const base = entita.descrizione
      ? entita.descrizione.slice(0, 120)
      : `Prenota il tuo appuntamento da ${entita.nome}${entita.indirizzo ? ` — ${entita.indirizzo}` : ""}`;
    return `${base}. Prenota online 24h su 24 con NomeApp.`.slice(0, 160);
  })();

  const metaImage = entita.immagine || "https://tuodominio.com/og-image-default.png";
  const canonicalUrl = `https://tuodominio.com/${slug}`;
  // ───────────────────────────────────────────────────────────────────────

  // Stato di caricamento: nessun Helmet (lascia i tag statici di index.html)
  if (caricamento) return <div>Caricamento...</div>;

  // Pagina non trovata: noindex per non sprecare crawl budget
  if (nonTrovato) return (
    <>
      <Helmet>
        <title>Pagina non trovata | NomeApp</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div>Pagina non trovata</div>
    </>
  );

  // Pagina caricata: meta tag completi
  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:locale" content="it_IT" />
        <meta property="og:site_name" content="NomeApp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImage} />
      </Helmet>

      {/* contenuto pagina */}
    </>
  );
}
```

**Note:**
- I meta tag calcolati prima degli early return sono al sicuro: dipendono solo dallo stato React, non da effetti collaterali.
- `react-helmet-async` sovrascrive i tag corrispondenti in `index.html` — i tag senza corrispondenza in `<Helmet>` restano intatti.
- Google esegue JavaScript quando crawla: i meta tag dinamici vengono visti correttamente, anche su SPA. Bing è più lento ma li legge comunque.
- Per SSR (Next.js, Remix) usare le API native del framework (`generateMetadata`, `meta` export) invece di `react-helmet-async`.

---

## 10. Google Search Console

### Verifica proprietà

Aggiungere in `index.html` prima del deploy:

```html
<meta name="google-site-verification" content="IL_CODICE_DA_SEARCH_CONSOLE" />
```

### Dopo il deploy

1. Aprire [Google Search Console](https://search.google.com/search-console)
2. **Sitemaps** → inserire `https://tuodominio.com/sitemap.xml` → Invia
3. **Ispezione URL** → testare `https://tuodominio.com/` → "Richiedi indicizzazione"
4. Aspettare 48–72 ore per la prima scansione

### Strumenti di verifica

| Strumento | URL | Cosa testa |
|-----------|-----|------------|
| Rich Results Test | [search.google.com/test/rich-results](https://search.google.com/test/rich-results) | Structured Data (SoftwareApp, FAQ, ecc.) |
| Facebook Debugger | [developers.facebook.com/tools/debug](https://developers.facebook.com/tools/debug/) | Open Graph — anteprima link |
| Twitter Card Validator | [cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator) | Twitter Card |
| PageSpeed Insights | [pagespeed.web.dev](https://pagespeed.web.dev) | Core Web Vitals (ranking factor) |

---

## 11. Checklist finale

### Prima del deploy

- [ ] `index.html` ha `lang` impostato (es. `lang="it"`)
- [ ] `<title>` è tra 40–60 caratteri
- [ ] `<meta name="description">` è tra 120–160 caratteri
- [ ] `<link rel="canonical">` punta all'URL principale (con o senza www — scegliere uno)
- [ ] `og:image` punta a un file che **esiste** in `public/`
- [ ] `og:image:width` e `og:image:height` sono specificati (raccomandati: 1200×630)
- [ ] Structured Data validato su Rich Results Test senza errori
- [ ] `sitemap.xml` include solo URL pubbliche e indicizzabili
- [ ] `robots.txt` ha la direttiva `Sitemap:` con URL assoluta
- [ ] `robots.txt` blocca dashboard, admin e pagine utility
- [ ] `react-helmet-async`: `HelmetProvider` è il wrapper più esterno dell'app
- [ ] Le pagine 404 / non trovate hanno `<meta name="robots" content="noindex, nofollow" />`
- [ ] Le pagine protette da login non compaiono né nel sitemap né sono raggiungibili senza auth

### Dopo il deploy

- [ ] Sitemap sottomesso su Google Search Console
- [ ] Almeno una URL ispezionata e indicizzazione richiesta manualmente
- [ ] Anteprima Open Graph verificata su Facebook Debugger
- [ ] Rich Results Test eseguito sulla homepage
- [ ] PageSpeed Insights eseguito — Core Web Vitals in verde (LCP < 2.5s, CLS < 0.1)

### Da rivedere ogni 3–6 mesi

- [ ] Aggiornare `lastmod` nel sitemap per le pagine modificate
- [ ] Aggiornare `aggregateRating.ratingCount` con recensioni reali
- [ ] Verificare su Search Console eventuali errori di copertura (pagine escluse, reindirizzamenti)
- [ ] Revisionare title/description se il CTR medio su Search Console è sotto il 3%
