const CACHE_NAME = "turkiye-yolculuk-v4";
const FILES_TO_CACHE = [
  "./",
  "index.html",
  "manifest.json",
  "fuel-widget.js",
  "vignette-widget.js"
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

async function injectWidgets(response) {
  const text = await response.text();
  let injected = text;
  const scripts = [];

  if (!injected.includes("fuel-widget.js")) {
    scripts.push('<script src="fuel-widget.js?v=2"></script>');
  }

  if (!injected.includes("vignette-widget.js")) {
    scripts.push('<script src="vignette-widget.js?v=1"></script>');
  }

  if (scripts.length) {
    injected = injected.replace("</body>", `${scripts.join("")}</body>`);
  }

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
          return injectWidgets(response);
        })
        .catch(() => caches.match("index.html").then(cached => cached ? injectWidgets(cached) : caches.match("./")))
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
