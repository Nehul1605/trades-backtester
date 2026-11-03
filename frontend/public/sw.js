// Service Worker for TradeTracker Pro PWA
const CACHE_NAME = "tradetracker-pwa-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // WebRTC / API / Live Stream requests should always bypass cache
  if (
    event.request.url.includes("/api/") ||
    event.request.url.includes("wss://") ||
    event.request.url.includes("livekit")
  ) {
    return;
  }

  // Network first with fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

