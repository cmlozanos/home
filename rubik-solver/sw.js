const APP_CACHE = "rubik-solver-app-v2.0.0-refinement3";
const RUNTIME_CACHE = "rubik-solver-runtime-v2.0.0-refinement3";

const PRECACHE_ASSETS = ["family-v2/family.css?v=2.0.0","family-v2/family.js?v=2.0.0","family-v2/playwrite-es.ttf","family-v2/OFL.txt",
  "./",
  "./index.html",
  "./styles.css?v=2.0.0",
  "./app.js?v=2.0.0",
  "./solver-worker.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./vendor/cubejs/cube.js",
  "./vendor/cubejs/solve.js",
  "./vendor/cubejs/LICENSE",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("rubik-solver-") && ![APP_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin === self.location.origin) {
    if (request.mode === "navigate") {
      event.respondWith(networkFirst(request, "./index.html"));
      return;
    }

    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

function networkFirst(request, fallbackUrl = null) {
  return fetchAndCache(request, RUNTIME_CACHE).catch(() => {
    return caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fallbackUrl ? caches.match(fallbackUrl) : Promise.reject(new Error("Offline"));
    });
  });
}

function fetchAndCache(request, cacheName) {
  return fetch(request).then((response) => {
    if (!response || response.status >= 400) return response;
    const responseCopy = response.clone();
    caches.open(cacheName)
      .then((cache) => cache.put(request, responseCopy))
      .catch(() => null);
    return response;
  });
}
