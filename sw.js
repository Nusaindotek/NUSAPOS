const CACHE_NAME = "nusapos-v1.1";
const urlsToCache = [
  "./index.html",
  "./setting.html",
  "./app.js",
  "./icon.png",
  "./icon_192.png",
  "./icon_512.png",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener("fetch", event => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
