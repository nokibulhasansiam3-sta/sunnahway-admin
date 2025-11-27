const CACHE_NAME = 'sunnahway-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/logo.png',
    '/screenshot1.png',
    '/screenshot2.png',
    '/screenshot3.png',
    '/screenshot4.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
