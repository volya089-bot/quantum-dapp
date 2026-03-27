const CACHE_NAME = 'quantum-v2';
const ASSETS = ['/', '/index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request).catch(() => caches.match('/')))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))));
});
