const CACHE_NAME = 'phantom-packet-v6';
const ASSETS = [ './', './index.html', './style.css', './src/app.js?v=20261120-v6', './src/store.js', './src/packet.js', './src/ui.js', './src/demo.js', './manifest.json', './icons/icon-192x192.png', './icons/icon-512x512.png' ];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('phantom-packet-') && key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)));
});
