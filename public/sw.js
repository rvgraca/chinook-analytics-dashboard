/* public/sw.js */
"use strict";

/**
 * Chinook PWA Service Worker (strict + production-ready baseline)
 * - Update APP_VERSION on each deploy to force fresh app shell.
 */
const APP_VERSION = "v1.0.2";

const CACHE = {
  SHELL: `shell-${APP_VERSION}`,
  ASSETS: `assets-${APP_VERSION}`,
  API: `api-${APP_VERSION}`,
  RUNTIME: `runtime-${APP_VERSION}`
};

const OFFLINE_URL = "/offline.html";
const API_PREFIX = "/api/analytics";
const API_NETWORK_TIMEOUT_MS = 7000;

/**
 * Critical app shell files.
 * Keep this list minimal + real files only.
 */
const APP_SHELL_FILES = [
  "/",
  "/index.html",
  OFFLINE_URL,
  "/manifest.webmanifest",

  // CSS
  "/css/main.css",
  "/css/components/button.css",
  "/styles/globals.css",

  // JS
  "/js/main.js",
  "/js/modules/utils.js",
  "/js/modules/dom.js",

  // Icons
  "/assets/icons/pie-chart-192.png",
  "/assets/icons/pie-chart-512.png",
  "/assets/icons/maskable-512.png",

  //charts
  "/assets/vendor/chart/chart.umd.min.js",
  "/assets/vendor/chart/chartjs-chart-geo.umd.min.js",

  //maps
  "/assets/maps/countries-50m.json",
];

/* ----------------------------- lifecycle ----------------------------- */

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE.SHELL);

    // Tolerant precache: don't fail whole install because of one bad file.
    await Promise.allSettled(
      APP_SHELL_FILES.map(async (url) => {
        try {
          const res = await fetch(url, { cache: "no-cache" });
          if (res && res.ok) await cache.put(url, res.clone());
        } catch (_) {
          // ignored intentionally; file may be optional or temporarily unavailable
        }
      })
    );

    // Activate new SW immediately after install.
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keep = new Set(Object.values(CACHE));

    const keys = await caches.keys();
    await Promise.all(
      keys.map((key) => {
        if (!keep.has(key)) return caches.delete(key);
      })
    );

    // Take control without waiting reload
    await self.clients.claim();
  })());
});

/* ------------------------------ helpers ------------------------------ */

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isApiRequest(url) {
  return url.pathname.startsWith(API_PREFIX);
}

function isNavigationRequest(request) {
  return request.mode === "navigate";
}

function isGetRequest(request) {
  return request.method === "GET";
}

function isRangeRequest(request) {
  return request.headers.has("range");
}

function isCacheableResponse(res) {
  // cache only successful basic/cors responses
  if (!res) return false;
  if (!res.ok) return false;
  if (res.type === "error") return false;
  return res.type === "basic" || res.type === "cors";
}

async function putInCache(cacheName, request, response) {
  if (!isCacheableResponse(response)) return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
}

function fetchWithTimeout(request, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("network-timeout")), timeoutMs);
    fetch(request)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/* ----------------------------- strategies ---------------------------- */

async function handleNavigation(request) {
  // Network first for fresh HTML; fallback to cached offline page
  try {
    const fresh = await fetch(request, { cache: "no-cache" });
    if (isCacheableResponse(fresh)) {
      await putInCache(CACHE.RUNTIME, request, fresh);
    }
    return fresh;
  } catch (_) {
    const cachedPage = await caches.match(request);
    if (cachedPage) return cachedPage;

    const offline = await caches.match(OFFLINE_URL);
    if (offline) return offline;

    return new Response("Offline", {
      status: 503,
      statusText: "Offline",
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}

async function handleApi(request) {
  // Network first with timeout; fallback to cached API response
  try {
    const fresh = await fetchWithTimeout(request, API_NETWORK_TIMEOUT_MS);
    if (isCacheableResponse(fresh)) {
      await putInCache(CACHE.API, request, fresh);
    }
    return fresh;
  } catch (_) {
    const cached = await caches.match(request);
    if (cached) return cached;

    return new Response(
      JSON.stringify({
        offline: true,
        message: "No network and no cached API response available."
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      }
    );
  }
}

async function handleStatic(request) {
  // Stale-while-revalidate for static assets
  const cached = await caches.match(request);
  const networkPromise = fetch(request)
    .then(async (res) => {
      if (isCacheableResponse(res)) {
        await putInCache(CACHE.ASSETS, request, res);
      }
      return res;
    })
    .catch(() => undefined);

  if (cached) {
    // return cached immediately, update in background
    return cached;
  }

  const networkRes = await networkPromise;
  if (networkRes) return networkRes;

  // Optional fallback for missing images
  if (request.destination === "image") {
    const fallbackIcon = await caches.match("/assets/icons/pie-chart-192.png");
    if (fallbackIcon) return fallbackIcon;
  }

  return new Response("Resource unavailable", { status: 504 });
}

/* -------------------------------- fetch ------------------------------ */

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore cross-origin (CDNs, etc.)
  if (!isSameOrigin(url)) return;

  // Ignore non-GET and range requests
  if (!isGetRequest(request) || isRangeRequest(request)) return;

  if (isNavigationRequest(request)) {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (isApiRequest(url)) {
    event.respondWith(handleApi(request));
    return;
  }

  event.respondWith(handleStatic(request));
});

/* --------------------------- app update hooks ------------------------- */

// Allow page to trigger immediate activation of waiting SW
self.addEventListener("message", (event) => {
  const msg = event.data;
  if (!msg) return;

  if (msg.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
