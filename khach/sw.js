// Thuận Gene Trường Thọ — app khách: chạy offline và xử lý nút trên thông báo
var CACHE = 'tt-khach-v33', IMG = 'tt-oracle-img';
var FILES = ['./', './index.html', './manifest.webmanifest', './marked.min.js', './purify.min.js', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon-64.png', './goi-y.json', './oracle.json'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE && k !== IMG; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var u = new URL(e.request.url);
  // the 22 real card images live on Edubit: keep each one after the first view, so the deck works offline
  if (u.hostname === 'file.edubit.vn') { e.respondWith(caches.open(IMG).then(function (c) { return c.match(e.request).then(function (m) { return m || fetch(e.request).then(function (r) { if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; }); }); })); return; }
  if (u.origin !== location.origin) return;
  // always ask the server first (bypassing the phone's HTTP cache, which can keep an old page for ~10 minutes); offline falls back to the saved copy
  e.respondWith(fetch(new Request(e.request.url, { cache: 'no-cache' })).then(function (r) { var c = r.clone(); caches.open(CACHE).then(function (ca) { ca.put(e.request, c); }); return r; }).catch(function () { return caches.match(e.request, { ignoreSearch: true }).then(function (m) { return m || caches.match('./index.html'); }); }));
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
