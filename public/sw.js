// My Pocket Tracker - Robust Offline-First Service Worker
// Cache version identifier
const CACHE_NAME = 'pocket-tracker-v1.0.1';
const OFFLINE_FALLBACK_URL = '/offline';

// Core Application Shell assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  OFFLINE_FALLBACK_URL,
  '/manifest.webmanifest',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/icon.svg'
];

// Domains / paths to never cache (security and external dynamic auth APIs)
const EXCLUDED_HOSTS = [
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'www.googleapis.com',
  'firestore.googleapis.com'
];

// 1. INSTALL LIFECYCLE
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Precache individual items safely so one failure does not break the entire install
      for (const asset of PRECACHE_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`[PWA SW] Precache failed for ${asset}:`, err);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE LIFECYCLE (Clean up old cache versions)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('pocket-tracker-') && name !== CACHE_NAME)
          .map((name) => {
            console.log(`[PWA SW] Removing obsolete cache: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. MESSAGE LISTENER (Control updates & lifecycle from client)
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// 4. FETCH INTERCEPTION (Offline-First Strategies)
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle HTTP/HTTPS GET requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Security: Do NOT cache Firebase Auth or sensitive external auth endpoints
  if (EXCLUDED_HOSTS.some(host => url.hostname.includes(host))) {
    return;
  }

  // A. PAGE NAVIGATION REQUESTS (HTML documents)
  // Strategy: Network-First with Cache and Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If network failed (offline), attempt to serve cached page
          const cachedPage = await caches.match(request);
          if (cachedPage) {
            return cachedPage;
          }
          // Fall back to root cached page or dedicated offline page
          const rootPage = await caches.match('/');
          if (rootPage) {
            return rootPage;
          }
          const offlineFallback = await caches.match(OFFLINE_FALLBACK_URL);
          if (offlineFallback) {
            return offlineFallback;
          }
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>My Pocket Tracker - Offline</title>
                <style>
                  body { margin: 0; background: #0b0f17; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 20px; }
                  .card { background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; max-width: 440px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                  .icon { width: 56px; height: 56px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; color: #10b981; font-weight: bold; font-size: 24px; margin-bottom: 16px; }
                  h1 { font-size: 20px; margin: 0 0 8px; }
                  p { font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0 0 24px; }
                  button { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 13px; cursor: pointer; transition: opacity 0.2s; }
                  button:hover { opacity: 0.9; }
                </style>
              </head>
              <body>
                <div class="card">
                  <div class="icon">M</div>
                  <h1>You're Offline</h1>
                  <p>Your supported financial records remain available locally on this device. When your connection returns, full synchronization will resume.</p>
                  <button onclick="window.location.href='/'">Open Local Tracker</button>
                </div>
              </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // B. STATIC ASSETS (_next/static/*, fonts, images, manifest)
  // Strategy: Stale-While-Revalidate (Fast local response + background refresh)
  const isStaticAsset = (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.webmanifest')
  );

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse); // If network fails, return cached

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // C. DEFAULT PASS-THROUGH with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
