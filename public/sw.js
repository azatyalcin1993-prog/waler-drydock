// Waler Drydock - No Service Worker (PWA disabled)
// Clear old caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Always fetch from network, never cache
self.addEventListener('fetch', (event) => {
  return;
});