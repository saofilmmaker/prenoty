// Prenoty Service Worker — cache shell per PWA offline-ready
const CACHE = "prenoty-v1";

// File da mettere in cache al primo avvio
const SHELL = ["/", "/dashboard", "/login"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network first → fallback cache (per JS/CSS/HTML)
self.addEventListener("fetch", (e) => {
  // Ignora richieste non-GET e richieste API Supabase (sempre live)
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.hostname.includes("supabase.co")) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Salva in cache solo risposte ok dello stesso dominio
        if (res.ok && url.origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((cached) => cached || caches.match("/")))
  );
});
