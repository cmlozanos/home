'use strict';
var PREFIX = 'shape-studio-';
var CACHE = PREFIX + 'v20260925-gate1';
var ASSETS = ['./learning-gate.js?v=20260925-gate1','./', 'index.html', 'style.css?v=20260925-gate1', 'core.js?v=20260925-gate1', 'game.js?v=20260925-gate1', 'manifest.webmanifest', 'icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'THIRD_PARTY_NOTICES.md'];
self.addEventListener('install', function (event) { event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.addAll(ASSETS); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (event) { event.waitUntil(caches.keys().then(function (keys) { return Promise.all(keys.filter(function (key) { return key.indexOf(PREFIX) === 0 && key !== CACHE; }).map(function (key) { return caches.delete(key); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.href.indexOf(self.registration.scope) !== 0) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(function (response) { if (!response.ok) throw new Error('Navigation unavailable'); return response; }).catch(function () { return caches.open(CACHE).then(function (cache) { return cache.match('index.html'); }); }));
  } else {
    event.respondWith(caches.open(CACHE).then(function (cache) { return cache.match(event.request).then(function (cached) { return cached || fetch(event.request); }); }));
  }
});
