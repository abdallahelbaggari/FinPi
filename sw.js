/* FinPi Service Worker v4 — cache busted */
const CACHE = 'finpi-v4';
const STATIC = ['/index.html', '/manifest.json', '/finpi-logo.svg'];

self.addEventListener('install', e => {
  /* Skip waiting immediately — activate new SW right away */
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).catch(() => {})
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => {
        console.log('[FinPi SW] Deleting old cache:', k);
        return caches.delete(k);
      }))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  /* Never cache these */
  if (
    url.includes('/approve') || url.includes('/complete') ||
    url.includes('/payment-recovery') ||
    url.includes('coingecko') || url.includes('okx.com') ||
    url.includes('gateio') || url.includes('api.') ||
    e.request.method !== 'GET'
  ) return;

  /* For HTML — always try network first, fall back to cache */
  if (url.endsWith('.html') || url.endsWith('/') || !url.includes('.')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  /* For assets — cache first */
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    }).catch(() => caches.match('/index.html'))
  );
});
