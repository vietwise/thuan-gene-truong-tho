// Thuận Gene Trường Thọ — app khách: chạy offline và xử lý nút trên thông báo
var CACHE = 'tt-khach-v7';
var FILES = ['./', './index.html', './manifest.webmanifest', './marked.min.js', './purify.min.js', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon-64.png', './goi-y.json'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(function (r) { var c = r.clone(); caches.open(CACHE).then(function (ca) { ca.put(e.request, c); }); return r; }).catch(function () { return caches.match(e.request, { ignoreSearch: true }).then(function (m) { return m || caches.match('./index.html'); }); }));
});
self.addEventListener('notificationclick', function (e) {
  var d = e.notification.data || {}, act = e.action || 'open';
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cs) {
    if (act === 'done' || act === 'skip' || act === 'snooze') {
      if (cs.length) { cs.forEach(function (c) { c.postMessage({ type: 'tt-act', act: act, pid: d.pid, day: d.day, rid: d.rid }); }); return; }
      return self.clients.openWindow('./?act=' + act + '&pid=' + encodeURIComponent(d.pid) + '&day=' + d.day + '&rid=' + encodeURIComponent(d.rid));
    }
    if (cs.length) return cs[0].focus();
    return self.clients.openWindow('./');
  }));
});
