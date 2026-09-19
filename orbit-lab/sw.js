'use strict';
var PREFIX = 'orbit-lab-';
var CACHE = PREFIX + '20260919-2';
var FILES = ['./', './index.html', './style.css?v=20260919-2', './vendor/gravity.js?v=20260919-2', './physics.js?v=20260919-2', './life.js?v=20260919-2', './game.js?v=20260919-2', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './RESEARCH.md', './STELLAR_AUDIT.md', './vendor/LICENSE.gravity'];
self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) { return Promise.all(keys.filter(function (key) { return key.indexOf(PREFIX) === 0 && key !== CACHE; }).map(function (key) { return caches.delete(key); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.href.indexOf(self.registration.scope) !== 0) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(function () { return caches.match('./index.html'); }));
    return;
  }
  event.respondWith(caches.match(event.request).then(function (cached) { return cached || fetch(event.request); }));
});
