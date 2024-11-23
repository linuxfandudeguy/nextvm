self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response; // Don't cache non-200 responses.
          }
          const responseToCache = response.clone();
          caches.open(cacheName).then((cache) => {
            // Only cache valid responses
            cache.put(event.request, responseToCache);
          });
          return response;
        });
    })
  );
});
