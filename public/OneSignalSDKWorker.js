// One worker for push notifications (OneSignal) and offline support, because only one can control the site.
try {
  importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
} catch (e) {}

const VERSION = "formed-v1";
const STATIC = VERSION + "-static";
const PAGES = VERSION + "-pages";
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("formed-") && !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isStatic(url) {
  return url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") ||
    /\.(?:png|jpg|jpeg|webp|svg|ico|woff2?)$/.test(url.pathname);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Fonts from Google: cache-first.
  if (url.hostname === "fonts.gstatic.com" || url.hostname === "fonts.googleapis.com") {
    event.respondWith(caches.open(STATIC).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) c.put(req, res.clone());
      return res;
    }));
    return;
  }

  // Only this site; never cache account data, API calls, auth or large videos.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.endsWith(".mp4") || req.headers.has("range")) return;

  if (isStatic(url)) {
    event.respondWith(caches.open(STATIC).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) c.put(req, res.clone());
      return res;
    }));
    return;
  }

  // Pages and page data: network first, then the last copy seen, then the offline page.
  event.respondWith((async () => {
    try {
      const res = await fetch(req);
      if (res.ok && !res.redirected) caches.open(PAGES).then((c) => c.put(req, res.clone()));
      return res;
    } catch (e) {
      const hit = await caches.match(req, { ignoreVary: true });
      if (hit) return hit;
      if (req.mode === "navigate") return (await caches.match(OFFLINE_URL)) || Response.error();
      return Response.error();
    }
  })());
});
