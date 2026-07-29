/* FinPi Service Worker v2 */
const CACHE = 'finpi-v2';
const STATIC = ['/', '/index.html', '/manifest.json', '/finpi-logo.svg'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  /* Never cache API/payment routes */
  if (url.includes('/approve') || url.includes('/complete') ||
      url.includes('/payment-recovery') || url.includes('api.') ||
      url.includes('coingecko') || url.includes('okx.com') ||
      e.request.method !== 'GET') {
    return;
  }
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request)
        .then(res => {
          if (res && res.status === 200 && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
      )
      .catch(() => caches.match('/'))
  );
});
