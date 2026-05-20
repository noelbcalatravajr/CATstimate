// sw.js — CATstimate service worker
// Cache-first strategy for offline operation. Caches all local assets +
// Google Fonts CSS/woff2 on demand. Bump CACHE_VERSION to force refresh.

const CACHE_VERSION = 'catstimate-v1.0.0';

// Files cached at install time (the app shell)
const CORE_ASSETS = [
  './',
  'Workspace.html',
  'Cutting List Estimator.html',
  'ArcRise Estimator.html',
  'workspace.js',
  'cutting-list.js',
  'arcrise.js',
  'manifest.json',
  'assets/catstimate-logo.png',
  'assets/cat-wave.png',
  'assets/cat-sleep.png',
  'assets/cat-wrench.png',
  'assets/cat-hat-tip.png',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/icon-512-maskable.png',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Silkscreen:wght@400;700&display=swap'
];

// INSTALL — pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      // addAll is atomic — if any fails, install fails. Use individual adds
      // so we tolerate missing optional resources (e.g. Google Fonts offline).
      Promise.all(CORE_ASSETS.map(url =>
        cache.add(new Request(url, { cache: 'reload' })).catch(err =>
          console.warn('[sw] failed to pre-cache', url, err)
        )
      ))
    ).then(() => self.skipWaiting())
  );
});

// ACTIVATE — drop old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// FETCH — cache-first, fall back to network, fall back to cached fallback
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET
  if (req.method !== 'GET') return;

  // Skip chrome-extension etc.
  const url = new URL(req.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        // Background revalidate for HTML so updates trickle in when online
        if (req.destination === 'document') {
          fetch(req).then(fresh => {
            if (fresh && fresh.ok) caches.open(CACHE_VERSION).then(c => c.put(req, fresh));
          }).catch(() => {});
        }
        return cached;
      }
      // Not cached — go to network, then cache
      return fetch(req).then(fresh => {
        if (fresh && fresh.ok && (fresh.type === 'basic' || fresh.type === 'cors')) {
          const copy = fresh.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, copy));
        }
        return fresh;
      }).catch(() => {
        // Network failed AND nothing cached → for HTML, fall back to Workspace
        if (req.destination === 'document') return caches.match('Workspace.html');
        return new Response('', { status: 503, statusText: 'offline' });
      });
    })
  );
});

// Optional: respond to a "skipWaiting" message from the page to activate updates
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
