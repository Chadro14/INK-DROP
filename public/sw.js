const CACHE_NAME = 'inkdrop-v2';
const OFFLINE_PAGE = '/offline.html';

// ✅ Seulement les fichiers statiques
const STATIC_ASSETS = [
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
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
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      }),
      self.clients.claim(),
    ])
  );
});

// ✅ Interception
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // 1. API : Network First
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // 2. Pages HTML : Network First avec fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(OFFLINE_PAGE);
        })
    );
    return;
  }

  // 3. Images, CSS, JS : Cache First
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse);
          });
        });
        return cachedResponse;
      }
      return fetch(request);
    })
  );
});