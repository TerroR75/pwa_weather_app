// Service Worker

const CACHE_NAME = "pogoda-pwa-v1";

// Zasoby do cache'owania przy instalacji
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/app.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@400;600;700&display=swap",
];

// ===== INSTALL – cache statycznych zasobów =====
self.addEventListener("install", (event) => {
  console.log("[SW] Instalacja");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Cachowanie zasobów statycznych");
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

// ===== ACTIVATE – usuń stare cache =====
self.addEventListener("activate", (event) => {
  console.log("[SW] Aktywacja");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log("[SW] Usuwam stary cache:", key);
            return caches.delete(key);
          }),
      ),
    ),
  );
  self.clients.claim();
});

// ===== FETCH – strategia zależy od typu żądania =====
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // API pogodowe → Network First (chcemy świeże dane)
  if (url.hostname === "api.openweathermap.org") {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Ikony pogodowe z OWM
  if (url.hostname === "openweathermap.org") {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Wszystko inne (statyka) → Cache First
  event.respondWith(cacheFirst(event.request));
});

// Cache First: sprawdź cache, jeśli nie ma – idź do sieci i zapisz
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Brak połączenia", { status: 503 });
  }
}

// Network First: idź do sieci, jeśli błąd – fallback do cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}
