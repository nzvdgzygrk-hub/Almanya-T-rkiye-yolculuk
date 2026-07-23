const APP_VERSION = "2026-07-23-1";
const CACHE_NAME = `turkiye-yolculuk-${APP_VERSION}`;
const FILES_TO_CACHE = [
  `./?appv=${APP_VERSION}`,
  `index.html?appv=${APP_VERSION}`,
  "manifest.json",
  `fuel-widget.js?v=${APP_VERSION}`,
  `vignette-widget.js?v=${APP_VERSION}`
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    );

    await self.clients.claim();

    const windows = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    });

    for (const client of windows) {
      try {
        const url = new URL(client.url);
        if (url.origin !== self.location.origin) continue;
        if (url.searchParams.get("appv") === APP_VERSION) continue;
        url.searchParams.set("appv", APP_VERSION);
        await client.navigate(url.href);
      } catch (error) {
        // Ein einzelnes Fenster darf das Update der anderen nicht verhindern.
      }
    }
  })());
});

async function injectWidgets(response) {
  const text = await response.text();
  let injected = text;
  const scripts = [];

  if (!injected.includes("fuel-widget.js")) {
    scripts.push(`<script src="fuel-widget.js?v=${APP_VERSION}"></script>`);
  }

  if (!injected.includes("vignette-widget.js")) {
    scripts.push(`<script src="vignette-widget.js?v=${APP_VERSION}"></script>`);
  }

  if (scripts.length) {
    injected = injected.replace("</body>", `${scripts.join("")}</body>`);
  }

  return new Response(injected, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

async function networkFirst(request, fallbackKeys = []) {
  try {
    const response = await fetch(request, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;

    for (const key of fallbackKeys) {
      const fallback = await caches.match(key);
      if (fallback) return fallback;
    }

    throw error;
  }
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isNavigation = event.request.mode === "navigate";
  const isIndex = url.pathname.endsWith("/") || url.pathname.endsWith("/index.html") || url.pathname.endsWith("index.html");
  const isDynamicFile =
    url.pathname.endsWith("fuel-prices.json") ||
    url.pathname.endsWith("fuel-widget.js") ||
    url.pathname.endsWith("vignette-widget.js") ||
    url.pathname.endsWith("manifest.json");

  if (isNavigation || isIndex) {
    event.respondWith((async () => {
      try {
        const response = await networkFirst(event.request, [
          `index.html?appv=${APP_VERSION}`,
          `./?appv=${APP_VERSION}`,
          "index.html",
          "./"
        ]);
        return injectWidgets(response);
      } catch (error) {
        return new Response("Die Reise-App konnte nicht geladen werden.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      }
    })());
    return;
  }

  if (isDynamicFile) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});
