// public/service-worker.js

const CACHE_NAME = 'nextvm-cache-v1';
const STATIC_ASSETS = [
  '/',        // Main page
  '/favicon.ico',
  '/manifest.json',
  '/404',
  '/500',
  '/file.svg',
  '/globe.svg',
  '/next.svg',
  '/vercel.svg',
  '/window.svg',
];

// Install event: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache static files
      await cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: Cache all files dynamically (including API, CSS, JS, etc.)
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Match requests to /_next/static/*, which includes JS, CSS, etc.
  if (url.includes('/_next/static/') || url.endsWith('.css') || url.endsWith('.js')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request).then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              // Cache the network response for future requests
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
        );
      })
    );
  } else if (url.startsWith('/api/')) {
    // If it's an API request, handle it separately (this will cache API responses)
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Cache API responses as well
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
    );
  } else {
    // Handle everything else normally
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});
