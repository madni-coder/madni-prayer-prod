// ============================================================
// Raahe Hidayat - Service Worker
//
// On first install:
//   → Fetches /precache-manifest.json
//   → Downloads ALL pages + ALL JS/CSS chunks + ALL images in parallel
//   → User only needs internet ONCE — everything works offline after that
//
// Strategies per request type:
//   /_next/static/**  → Cache First   (hashed, immutable chunks)
//   /api/**           → Network First  (live data, cached fallback)
//   everything else   → Stale-While-Revalidate (instant + background refresh)
// ============================================================

const CACHE_VERSION = 'v1';   // Bump this to force full re-download on next deploy

const STATIC_CACHE = `raahe-static-${CACHE_VERSION}`;
const PAGE_CACHE   = `raahe-pages-${CACHE_VERSION}`;
const API_CACHE    = `raahe-api-${CACHE_VERSION}`;
const ALL_CACHES   = [STATIC_CACHE, PAGE_CACHE, API_CACHE];

// ─── Install — download everything at once ──────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        installAll().then(() => self.skipWaiting())
    );
});

async function installAll() {
    let urls = [];

    // Fetch the manifest generated at build time
    try {
        const res = await fetch('/precache-manifest.json', { cache: 'no-store' });
        if (res.ok) {
            const manifest = await res.json();
            urls = manifest.urls || [];
        }
    } catch {
        // Manifest not available — fall back to minimal list
        urls = ['/', '/prayer-times', '/tasbih', '/zikr', '/quran', '/qibla',
                '/settings', '/more', '/notice', '/jamat-times', '/rewards', '/login'];
    }

    // Split URLs into buckets: static chunks vs everything else
    const staticUrls = urls.filter(u => u.startsWith('/_next/static/'));
    const pageUrls   = urls.filter(u => !u.startsWith('/_next/static/'));

    // Cache all assets in parallel (failures skipped — one bad file won't block everything)
    const [staticCache, pageCache] = await Promise.all([
        caches.open(STATIC_CACHE),
        caches.open(PAGE_CACHE),
    ]);

    await Promise.allSettled([
        ...staticUrls.map(url =>
            fetch(url, { cache: 'force-cache' })
                .then(r => r.ok && staticCache.put(url, r))
                .catch(() => {})
        ),
        ...pageUrls.map(url =>
            fetch(url)
                .then(r => r.ok && pageCache.put(url, r))
                .catch(() => {})
        ),
    ]);
}

// ─── Activate — delete old caches ───────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(names =>
                Promise.all(
                    names
                        .filter(name => !ALL_CACHES.includes(name))
                        .map(name => caches.delete(name))
                )
            )
            .then(() => self.clients.claim())
    );
});

// ─── Fetch — serve from cache using right strategy ──────────
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== 'GET') return;
    if (!url.protocol.startsWith('http')) return;

    // API calls → Network First (live data, fall back to last cached response)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(request, API_CACHE));
        return;
    }

    // Hashed JS/CSS chunks → Cache First (hash guarantees freshness)
    if (url.pathname.startsWith('/_next/static/')) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // Pages + images + everything else → Stale-While-Revalidate
    event.respondWith(staleWhileRevalidate(request, PAGE_CACHE));
});

// ─── Strategies ─────────────────────────────────────────────

async function networkFirst(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response(
            JSON.stringify({ error: 'Offline', offline: true }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return new Response('Asset not cached', { status: 503 });
    }
}

async function staleWhileRevalidate(request, cacheName) {
    const cached = await caches.match(request);

    const networkPromise = fetch(request)
        .then(async (response) => {
            if (response.ok) {
                const cache = await caches.open(cacheName);
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => null);

    if (cached) {
        networkPromise; // background refresh — don't await
        return cached;
    }

    const networkResponse = await networkPromise;
    if (networkResponse) return networkResponse;

    return new Response(
        '<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:40px">' +
        '<h2>Aap offline hain</h2>' +
        '<p>Ye page pehle internet ke saath khola nahi gaya.<br>Internet se connect karke dobara try karein.</p>' +
        '</body></html>',
        { status: 503, headers: { 'Content-Type': 'text/html' } }
    );
}
