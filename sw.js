const CACHE_NAME = "turkiye-yolculuk-v3";
const FILES_TO_CACHE = [
  "./",
  "index.html",
  "manifest.json",
  "fuel-widget.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

async function injectFuelWidget(response) {
  const text = await response.text();
  if (text.includes("fuel-widget.js")) {
    return new Response(text, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }
  const injected = text.replace("</body>", "<script src=\"fuel-widget.js?v=1\"></script></body>");
  return new Response(injected, {
    status: response.status,
    statusText: response.statusText,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isFuelPrices = url.pathname.endsWith("/fuel-prices.json") || url.pathname.endsWith("fuel-prices.json");
  const isAppShell = event.request.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("/index.html") || url.pathname.endsWith("index.html");

  if (isFuelPrices) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  if (isAppShell) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return injectFuelWidget(response);
        })
        .catch(() => caches.match("index.html").then(cached => cached ? injectFuelWidget(cached) : caches.match("./")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match("index.html"));
    })
  );
});
