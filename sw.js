/* FinPi Service Worker v6 — legal pages completely excluded */
const CACHE = 'finpi-v6';
const STATIC = ['/index.html', '/manifest.json', '/finpi-logo.svg'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).catch(() => {})
  );
});

self.addEventListener('activate', e => {
  /* Delete ALL old caches immediately */
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  const path = new URL(url).pathname;

  /* NEVER intercept legal pages — let browser fetch directly from server */
  if (path.startsWith('/legal/')) return;

  /* Never intercept API/payment routes */
  if (
    path.startsWith('/approve') ||
    path.startsWith('/complete') ||
    path.startsWith('/payment-recovery') ||
    url.includes('coingecko') ||
    url.includes('okx.com') ||
    url.includes('gateio') ||
    url.includes('anthropic') ||
    e.request.method !== 'GET'
  ) return;

  /* index.html — always fetch fresh from network */
  if (path === '/' || path === '/index.html') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res && res.status === 200) {
            caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          }
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  /* Static assets — cache first */
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200) {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      });
    }).catch(() => null)
  );
});
