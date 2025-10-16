'use strict';

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `sakcomnp-static-${CACHE_VERSION}`;
const FONT_CACHE = `sakcomnp-fonts-${CACHE_VERSION}`;
const THIRD_PARTY_CACHE = `sakcomnp-third-party-${CACHE_VERSION}`;
const CACHE_ALLOWLIST = [STATIC_CACHE, FONT_CACHE, THIRD_PARTY_CACHE];
const OFFLINE_URL = '/offline.html';

const APP_SHELL = [
    '/',
    '/index.html',
    OFFLINE_URL,
    '/css/style.css',
    '/css/responsive.css',
    '/css/articles.css',
    '/js/main.js',
    '/manifest.json',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/images/loki.gif',
    '/images/loki.jpg',
    '/images/loki.svg',
    '/images/loki512.jpg',
    '/images/saksham00.png',
    '/images/divine.png',
    '/images/hobbies.jpg',
    '/images/hq_monk12.png',
    '/images/chess.jpg',
    '/images/philosophy.jpg',
    '/images/writing.jpg',
    '/pages/quotes.html',
    '/pages/writings.html',
    '/pages/thoughts.html',
    '/pages/contact.html',
    '/pages/player.html',
    '/pages/writings/writing1.html',
    '/pages/writings/writing2.html',
    '/pages/writings/writing3.html'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => (
            Promise.all(
                cacheNames
                    .filter(name => name.startsWith('sakcomnp-') && !CACHE_ALLOWLIST.includes(name))
                    .map(name => caches.delete(name))
            )
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }

    const requestURL = new URL(event.request.url);

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const copy = response.clone();
                    caches.open(STATIC_CACHE).then(cache => cache.put(event.request, copy));
                    return response;
                })
                .catch(async () => {
                    const cachedResponse = await caches.match(event.request);
                    return cachedResponse || caches.match(OFFLINE_URL);
                })
        );
        return;
    }

    if (requestURL.origin.includes('fonts.googleapis.com') || requestURL.origin.includes('fonts.gstatic.com')) {
        event.respondWith((async () => {
            const cache = await caches.open(FONT_CACHE);
            const cached = await cache.match(event.request);

            if (cached) {
                event.waitUntil(
                    fetch(event.request)
                        .then(response => {
                            if (response && response.status === 200) {
                                cache.put(event.request, response.clone());
                            }
                        })
                        .catch(() => undefined)
                );

                return cached;
            }

            const response = await fetch(event.request);

            if (response && response.status === 200) {
                cache.put(event.request, response.clone());
            }

            return response;
        })());
        return;
    }

    if (requestURL.origin.includes('cdnjs.cloudflare.com') || requestURL.origin.includes('static.elfsight.com')) {
        event.respondWith((async () => {
            const cache = await caches.open(THIRD_PARTY_CACHE);
            const cached = await cache.match(event.request);

            if (cached) {
                event.waitUntil(
                    fetch(event.request)
                        .then(response => {
                            if (response && response.status === 200) {
                                cache.put(event.request, response.clone());
                            }
                        })
                        .catch(() => undefined)
                );

                return cached;
            }

            const response = await fetch(event.request);

            if (response && response.status === 200) {
                cache.put(event.request, response.clone());
            }

            return response;
        })());
        return;
    }

    if (requestURL.origin === self.location.origin) {
        event.respondWith((async () => {
            const cache = await caches.open(STATIC_CACHE);
            const cached = await cache.match(event.request);
            const fetchPromise = fetch(event.request)
                .then(response => {
                    if (response && response.status === 200) {
                        cache.put(event.request, response.clone());
                    }
                    return response;
                })
                .catch(() => cached);

            if (cached) {
                event.waitUntil(fetchPromise);
                return cached;
            }

            return fetchPromise;
        })());
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request))
    );
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
