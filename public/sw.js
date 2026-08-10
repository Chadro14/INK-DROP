// public/sw.js
const CACHE_NAME = 'inkdrop-v1';
const API_CACHE_NAME = 'inkdrop-api-v1';
const IMAGE_CACHE_NAME = 'inkdrop-images-v1';

// ✅ Fichiers statiques à mettre en cache
const STATIC_ASSETS = [
  '/',
  '/discover',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-384.png',
];

// ✅ Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// ✅ Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME && name !== IMAGE_CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      }),
      self.clients.claim(),
    ])
  );
});

// ✅ Interception des requêtes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // ⚡ Stratégie différente selon le type de requête

  // 1. API : Network First (toujours la version la plus récente)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(API_CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // 2. Images : Stale While Revalidate (affiche le cache, met à jour en arrière-plan)
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          caches.open(IMAGE_CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Pages : Cache First (rapide, puis mise à jour)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Mise à jour en arrière-plan
        fetch(event.request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse);
          });
        });
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});

// ✅ Gestion des notifications push (si activé)
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body || 'Nouvelle notification INKDROP',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification('INKDROP', options)
  );
});

// ✅ Clic sur notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data.url || '/';
  event.waitUntil(
    clients.openWindow(url)
  );
});
