// sw.js

// Define the cache name
const CACHE_NAME = 'my-cache-v1';

// List of essential files to cache during the install event
const CACHE_FILES = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/_next/static/**/*', // Cache all static files in _next
  '/404',  // Example for a custom 404 page (adjust accordingly)
  '/500',  // Example for a custom 500 page (adjust accordingly)
  '/file.svg',
  '/globe.svg',
  '/next.svg',
  '/vercel.svg',
  '/window.svg',
];

// Install event to cache essential resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  // Perform caching during installation
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching essential files...');
      return cache.addAll(CACHE_FILES).then(() => {
        console.log('Service Worker: Cached all essential files');
      }).catch((error) => {
        console.error('Service Worker: Failed to cache files', error);
      });
    })
  );
});

// Activate event to remove old caches (if any)
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  // Delete old caches if needed
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event to serve cached files or fallback to network
self.addEventListener('fetch', (event) => {
  // Log each fetch request
  console.log('Service Worker: Fetching', event.request.url);

  event.respondWith(
    // Try to serve from cache
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('Service Worker: Serving from cache', event.request.url);
        return cachedResponse; // Return cached response if found
      }

      // If not in cache, fetch from network and cache the response if successful
      return fetch(event.request).then((networkResponse) => {
        // Only cache successful network responses
        if (networkResponse && networkResponse.ok) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            console.log('Service Worker: Cached network response for', event.request.url);
          });
        }
        return networkResponse; // Return the network response
      }).catch((error) => {
        console.error('Service Worker: Fetch failed', error);
        throw error;  // Let the error propagate
      });
    })
  );
});

// Optional: Push notification handler (if you plan to use push notifications in the future)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received', event);

  const options = {
    body: event.data.text(),
    icon: '/favicon.ico',
    badge: '/badge.ico',
  };

  event.waitUntil(
    self.registration.showNotification('New Push Notification', options)
  );
});

// Optional: Background sync (if you're planning to sync data in the background)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    console.log('Service Worker: Syncing data in the background...');
    // Perform background sync logic here (e.g., send data to server)
  }
});
