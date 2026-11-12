// Quạt Thần CTV: chạy offline. Mỗi lần sửa app phải tăng số phiên bản cache.
var CACHE = 'quat-than-ctv-v39';
var FILES = ['./', './index.html', './noi-dung.js', './san-pham.json', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon-64.png', './logo.jpg', './xlsx.mini.min.js', './art.js', './thuc-hanh.js', './giao-dien.js', './kich-hoat.js', './doc-file.js'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var u = new URL(e.request.url);
  if (u.origin !== location.origin) return;
  // hỏi máy chủ trước (bỏ qua HTTP cache của điện thoại), mất mạng mới lấy bản đã lưu
  e.respondWith(fetch(new Request(e.request.url, { cache: 'no-cache' })).then(function (r) { var c = r.clone(); caches.open(CACHE).then(function (ca) { ca.put(e.request, c); }); return r; }).catch(function () { return caches.match(e.request, { ignoreSearch: true }).then(function (m) { return m || caches.match('./index.html'); }); }));
});
