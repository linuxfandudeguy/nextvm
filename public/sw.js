const CACHE_NAME = 'nextvm-cache-v1'; // You can update the version as needed
const URLs_TO_CACHE = [
  '/',
  '/404',
  '/500',
  '/favicon.ico',
  '/manifest.json',
  '/file.svg',
  '/globe.svg',
  '/next.svg',
  '/vercel.svg',
  '/window.svg',
];

// Install event to cache important assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache and caching essential files');
      return cache.addAll(URLs_TO_CACHE); // Cache the static URLs
    }).catch((error) => {
      console.error('Failed to install service worker and cache resources:', error);
    })
  );
});

// Fetch event to handle the caching and fetching logic
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If the request is already cached, return it
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise, fetch the resource and cache it if successful
      return fetch(event.request).then((response) => {
        // Only cache valid responses (200 OK and 'basic' type)
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response; // Don't cache non-200 responses
        }

        // Clone the response so we can cache it and return it
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response; // Return the network response
      }).catch((error) => {
        console.error('Fetch failed; serving fallback:', error);
        // Serve fallback content if the fetch fails (e.g., offline mode)
        return caches.match('index.html');
      });
    })
  );
});

// Activate event to clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]; // Only keep the current cache version

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            // Delete outdated caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
