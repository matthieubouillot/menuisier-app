// Service Worker pour PWA
const CACHE_NAME = "menuisier-pro-v2";
const urlsToCache = [
  "/",
  "/dashboard",
  "/devis",
  "/atelier",
  "/calendrier",
  "/parametres/entreprise",
  "/offline",
];

// Installation du Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache ouvert");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activation du Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Suppression de l'ancien cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Stratégie: Network First, puis Cache
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignorer complètement les requêtes API et les requêtes non-GET
  if (url.pathname.startsWith("/api/") || request.method !== "GET") {
    // Pour les requêtes API ou non-GET, passer directement au réseau sans cache
    event.respondWith(fetch(request));
    return;
  }

  // Pour les requêtes GET non-API, utiliser la stratégie Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Ne mettre en cache que les réponses valides (200-299)
        if (response.status >= 200 && response.status < 300) {
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache).catch((err) => {
              // Ignorer les erreurs de cache silencieusement
              console.warn("Erreur lors de la mise en cache:", err);
            });
          });
        }

        return response;
      })
      .catch(() => {
        // Si le réseau échoue, chercher dans le cache
        return caches.match(request).then((response) => {
          if (response) {
            return response;
          }
          // Si pas dans le cache et que c'est une navigation, retourner la page offline
          if (request.mode === "navigate") {
            return caches.match("/offline");
          }
          return new Response("Offline", { status: 503 });
        });
      })
  );
});
