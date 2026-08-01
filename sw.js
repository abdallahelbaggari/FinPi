/* FinPi Service Worker v5 */
const CACHE = 'finpi-v5';
const STATIC = ['/index.html', '/manifest.json', '/finpi-logo.svg'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).catch(() => {})
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  /* NEVER intercept these — let browser fetch directly */
  if (
    url.includes('/legal/') ||
    url.includes('/approve') ||
    url.includes('/complete') ||
    url.includes('/payment-recovery') ||
    url.includes('coingecko') ||
    url.includes('okx.com') ||
    url.includes('gateio') ||
    url.includes('anthropic') ||
    e.request.method !== 'GET'
  ) return;

  /* For index.html — network first */
  if (url.endsWith('/') || url.endsWith('/index.html') || (!url.includes('.'))) {
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

  /* Assets — cache first */
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200) {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      });
    }).catch(() => caches.match('/index.html'))
  );
});
