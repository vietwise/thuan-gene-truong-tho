// Giao diện Quạt Thần Vietwise CTV: lớp hiển thị nhiều icon, ít chữ.
// Nạp SAU script chính, ghi đè các trang danh sách. Tính năng và dữ liệu giữ nguyên.
var IC_NAN = ['🎯', '🤝', '❓', '💞', '🏷️', '💎', '✍️', '🌱', '🪞'];
var TEN_NGAN = ['Mục tiêu', 'Kết nối', 'Câu hỏi hay', 'Nhu cầu', 'Thương hiệu', 'Sản phẩm', 'Cam kết', 'Sau mua', 'Review'];

// Lưới ô icon: [{h|on, ic, t, so, xong, stt, m}]
function oLuoi(ds, cot) {
  return '<div class="luoi' + (cot ? ' c' + cot : '') + '">' + ds.map(function (x) {
    var dau = x.on ? 'href="javascript:void 0" onclick="' + x.on + '"' : 'href="' + x.h + '"';
    return '<a class="o" ' + dau + ' style="--m:' + (x.m || '#1b2f86') + '">' + (x.stt ? '<i class="o-stt">' + x.stt + '</i>' : '') + '<span class="o-ic">' + x.ic + (x.so ? '<i class="o-so">' + x.so + '</i>' : '') + (x.xong ? '<i class="o-xong">✓</i>' : '') + '</span><span class="o-ten">' + esc(x.t) + '</span></a>';
  }).join('') + '</div>';
}
function cuon(id) { var e = document.getElementById(id); if (e) e.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function tenTat(t) { var w = String(t || '?').trim().split(/\s+/); return (w[w.length - 1] || '?').charAt(0).toUpperCase(); }
function cham9(k) { var s = '<span class="cham9">'; for (var i = 1; i <= 9; i++) s += '<i' + (nanXong(k, i) ? ' class="on"' : '') + '></i>'; return s + '</span>'; }
function dongKhach(k, phu) {
  var nh = nhomKhach(k);
  return '<a class="kh" href="#khach/' + k.id + '"><span class="av ' + nh + '">' + esc(tenTat(k.ten)) + '</span><div class="y"><div class="kh-ten">' + esc(k.ten || 'Khách chưa đặt tên') + '</div><div class="mo">' + phu + '</div>' + cham9(k) + '</div><span class="mui">›</span></a>';
}

// ---------- Hôm nay ----------
V.home = function () {
  var g = chauNgoc(), ht = canHoiTham(), dn = Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5), kho = LOI_NHAN.concat(AN_NGON), q = kho[dn % kho.length], gg = GUONG_NGAY[dn % GUONG_NGAY.length], nd = S.ngay[homNay()] || {}, c = tinhCL();
  var thu = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][new Date().getDay()];
  var ml = S.khach.filter(function (k) { return k.st && k.st.tiep && k.st.tiep <= congNgay(homNay(), 3); }).sort(function (a, b) { return a.st.tiep < b.st.tiep ? -1 : 1; }).slice(0, 8);
  var gyh = goiYKetNoi();
  var h = '<div class="hero">' + ART.hero() + '<div class="hero-chu"><small>Chào ' + esc(S.me.ten || 'bạn') + ' · ' + thu + '</small><b>Quạt ra tiền<br>chân chính</b><a class="hero-cl" href="#cl">' + ART.xu() + ' ' + c.tong + ' CL<span>🔥 ' + chuoiNgay() + '</span></a></div></div>';
  if (!S.me.vaoNhom && window.NHOM_ZALO) h += '<a class="the phan nhe" href="#quan-ly"><span class="o-ic" style="--m:#c9930f">👥</span><b style="flex:1">Vào nhóm Zalo CTV Quạt Thần</b><span class="mui">›</span></a>';
  if (!S.me.ten) h += '<a class="the phan nhe" href="#quan-ly"><span class="o-ic" style="--m:#1b2f86">👤</span><b style="flex:1">Ghi tên của bạn</b><span class="mui">›</span></a>';
  h += htmlNhacThang();
  h += oLuoi([
    { h: '#khach/moi', ic: '🤝', t: 'Gặp khách', m: '#1b2f86' },
    { h: '#review/moi', ic: '💎', t: 'Review', m: '#8e3fd1' },
    { on: ht.length ? "cuon('ht')" : '', h: '#khach', ic: '💬', t: 'Hỏi thăm', so: ht.length, m: '#e0609c' },
    { on: ml.length ? "cuon('ml')" : '', h: '#khach', ic: '🛒', t: 'Mua lại', so: ml.length, m: '#2c55c9' },
    { h: '#quan-ly', ic: '🪞', t: 'Kết nối', so: gyh.length, m: '#c9930f' },
    { h: '#don', ic: '📥', t: 'Tải khách', m: '#0f1c5c' }
  ]);
  h += '<div class="the nhan"><small>💌 Lời nhắn hôm nay</small><div class="nhan-cau">“' + esc(q.c) + '”</div><small>' + esc(q.n) + '</small>';
  h += '<details class="soi"' + (nd.doc ? '' : ' open') + '><summary><span class="soi-ic">' + gg.ic + '</span><span style="flex:1"><small>Soi Gương Thần</small><br><b>' + esc(gg.ten) + '</b></span>' + (nd.doc ? '<span class="xong" style="color:var(--vang)">✓</span>' : '<span class="mui">⌄</span>') + '</summary>';
  h += '<p class="soi-be">' + esc(gg.be) + '</p><p class="soi-hoi">' + esc(gg.hoi) + '</p><textarea rows="2" placeholder="Mình soi thấy…" oninput="datSoi(this.value)">' + esc(nd.soi || '') + '</textarea>';
  h += '<div class="hang">' + (nd.doc ? '' : '<button class="nut nho" style="background:var(--kim);color:var(--dem)" onclick="docLoiNhan()">✓ Đã soi</button>') + '<a class="nhan-ln" href="#nan/' + gg.nan + '">' + IC_NAN[gg.nan - 1] + ' Ôn nan ' + gg.nan + ' ›</a></div></details></div>';
  h += htmlQuyTrinh();
  if (ml.length) h += '<h3 id="ml">🛒 Sắp mua lại</h3><div class="the ds" style="padding:0">' + ml.map(function (k) { return dongKhach(k, 'Dự kiến ' + vn(k.st.tiep) + (k.st.mon ? ' · ' + esc(k.st.mon) : '')).replace('#khach/' + k.id + '"', '#khach/' + k.id + '/0"'); }).join('') + '</div><p class="mo">Hỏi thăm trước, đừng chào hàng.</p>';
  if (ht.length) h += '<h3 id="ht">💬 Cần hỏi thăm</h3><div class="the ds" style="padding:0">' + ht.map(function (x) { return dongKhach(x.k, 'Ngày ' + x.n + ' sau mua · ' + vn(x.han)).replace('#khach/' + x.k.id + '"', '#khach/' + x.k.id + '/8"'); }).join('') + '</div>';
  h += '<h3>💠 Châu ngọc</h3>' + htmlNgoc(g);
  return h;
};

// Mô hình quy trình: 5 bước ngang, sáng bước đang ở
function htmlQuyTrinh() {
  var cn = S.chungNhan || {}, lt = dieuKienLT(), tc = dieuKienTC();
  function dem(dk) { return dk.reduce(function (a, x) { return a + Math.min(x[1], x[2]); }, 0) + '/' + dk.reduce(function (a, x) { return a + x[2]; }, 0); }
  var B = [
    { ic: ART.icon(1), t: 'Lý thuyết', h: '#nan', xong: !!cn.lt, cn: cn.lt ? '' : '🏅 ' + dem(lt) },
    { ic: ART.icon(2), t: 'Chuẩn bị', h: '#khach', xong: S.khach.some(function (k) { return nanXong(k, 1) || (k.tinCongKhai || '').trim(); }) },
    { ic: '🤝', t: 'Gặp khách', h: '#khach', xong: S.khach.some(function (k) { return k.ketQua; }) },
    { ic: ART.icon(3), t: 'Review', h: '#review', xong: S.review.length > 0, cn: cn.tc ? '' : '🏅 ' + dem(tc) },
    { ic: '📊', t: 'Quản lý', h: '#quan-ly', xong: !!(S.donNhap || Object.keys(S.baoCao || {}).length) }
  ];
  var cur = B.filter(function (b) { return !b.xong; })[0] || B[1];
  var h = '<div class="the qt2"><div class="qt2-hang">' + B.map(function (b) { return '<a class="qt2-b' + (b.xong ? ' xong' : '') + (b === cur ? ' nay' : '') + '" href="' + b.h + '"><span>' + b.ic + (b.xong ? '<i>✓</i>' : '') + '</span><small>' + esc(b.t) + '</small></a>'; }).join('') + '</div>';
  return h + '<a class="qt2-tiep" href="' + cur.h + '"><span>Bước tiếp: <b>' + esc(cur.t) + '</b>' + (cur.cn ? ' · ' + cur.cn : '') + '</span><span>›</span></a></div>';
}

// ---------- Lý thuyết ----------
var _nanCu = V.nan;
V.nan = function (p) {
  if (p[1]) return _nanCu(p);
  S.daHoc = S.daHoc || {};
  var dung = QUIZ.filter(function (q, i) { return S.quiz[i] === q.dung; }).length;
  var h = '<h2 class="dau"><span class="dau-ic">' + ART.icon(1) + '</span><span>Lý thuyết Quạt Thần</span></h2>' + quatSvg();
  h += oLuoi(NAN.map(function (b, i) { return { h: '#nan/' + b.n, ic: IC_NAN[i], t: TEN_NGAN[i], stt: b.n, xong: !!S.daHoc[b.n], m: b.guong.do ? '#8e3fd1' : '#1b2f86' }; }));
  h += '<h3>Luyện tập</h3>' + oLuoi([
    { h: '#nan/vi-du', ic: '📖', t: 'Ví dụ 9 nan', xong: !!S.daHoc.vd, m: '#2c55c9' },
    { h: '#nan/tap', ic: '✅', t: 'Tập nhanh', so: dung ? dung + '/' + QUIZ.length : '', m: '#1f8a4c' },
    { h: '#cong-cu/ca-kho', ic: '🧩', t: 'Ca khó', m: '#e0609c' },
    { h: '#cong-cu/usb', ic: '🔌', t: 'USB', m: '#c9930f' }
  ], 4);
  return h + cuoiBuoc1();
};

// ---------- Chuẩn bị ----------
var _khachCu = V.khach;
V.khach = function (p) {
  if (p[1]) return _khachCu(p);
  var h = '<h2 class="dau"><span class="dau-ic">' + ART.icon(2) + '</span><span>Chuẩn bị Quạt Thần</span></h2><a class="nut rong lon" href="#khach/moi">＋ Gặp khách mới</a>';
  h += oLuoi([
    { h: '#cong-cu/co', ic: '🎯', t: 'Câu CO', m: '#1b2f86' },
    { h: '#cong-cu/tfbr', ic: '🔗', t: 'TFBR', m: '#8e3fd1' },
    { h: '#cong-cu/san-pham', ic: '💎', t: 'Sản phẩm', m: '#2c55c9' },
    { h: '#cong-cu/kiem', ic: '🛡️', t: 'Kiểm lời', m: '#1f8a4c' }
  ], 4);
  h += '<h3>👥 Khách của bạn <a class="h3-nut" href="#don">📥 Tải</a></h3>';
  if (!S.khach.length) h += '<div class="the rong-tron"><div>🌱</div>Chưa có khách nào<br><span class="mo">Dữ liệu chỉ nằm trên máy bạn</span></div>';
  else {
    var nhan = { mua: '🛒 Đã mua', hen: '📅 Hẹn lại', dung: '✋ Dừng đúng lúc' };
    h += '<div class="the ds" style="padding:0">' + S.khach.map(function (k) { return dongKhach(k, nhan[k.ketQua] || (nhomKhach(k) === 'cu' ? '↗ Khách cũ' + (k.st && k.st.soDon ? ' · ' + k.st.soDon + ' đơn' : '') : '✦ Khách mới')); }).join('') + '</div>';
  }
  return h + cuoiBuoc2();
};

// ---------- Review ----------
var _reviewCu = V.review;
V.review = function (p) {
  if (p[1]) return _reviewCu(p);
  var h = '<h2 class="dau"><span class="dau-ic">' + ART.icon(3) + '</span><span>Review điêu luyện</span></h2><a class="nut rong lon" href="#review/moi">＋ Review một buổi gặp</a>';
  var dem = {}; S.review.forEach(function (r) { for (var i = 1; i <= 8; i++) if (r.buoc[i] === 'chua' || r.buoc[i] === 'bo') dem[i] = (dem[i] || 0) + 1; });
  var top = Object.keys(dem).sort(function (a, b) { return dem[b] - dem[a]; })[0];
  var luyen = S.review.reduce(function (a, r) { return a + (r.luyen || []).length; }, 0);
  h += oLuoi([
    { h: top ? '#nan/' + top : '#nan', ic: top ? IC_NAN[top - 1] : '📖', t: top ? 'Hay hụt: nan ' + top : 'Ôn 9 nan', so: top ? dem[top] : '', m: '#e0609c' },
    { h: S.review.length ? '#review/xem/' + S.review[0].id : '#review/moi', ic: '🎭', t: 'Luyện kịch bản', so: luyen, m: '#8e3fd1' },
    { h: '#cong-cu/soat', ic: '🔍', t: 'Soát Quạt Thần', m: '#1b2f86' }
  ]);
  h += '<h3>📚 Các buổi đã review</h3>';
  if (!S.review.length) return h + '<div class="the rong-tron"><div>💎</div>Chưa có buổi nào<br><span class="mo">Soi cả cuộc thành lẫn chưa thành</span></div>';
  var ic = { mua: '🛒', hen: '📅', dung: '✋' };
  return h + '<div class="the ds" style="padding:0">' + S.review.map(function (r) {
    var k = khach(r.khach), tot = 0; for (var i = 1; i <= 9; i++) if (r.buoc[i] === 'tot') tot++;
    return '<a class="kh" href="#review/xem/' + r.id + '"><span class="av rv">' + (ic[r.ketQua] || '🌧') + '</span><div class="y"><div class="kh-ten">' + esc(k ? k.ten : (r.ten || 'Buổi gặp')) + '</div><div class="mo">' + vn(r.ngay) + ' · ' + ({ mua: 'Đã mua', hen: 'Hẹn lại', dung: 'Dừng đúng lúc' }[r.ketQua] || 'Chưa thành') + ((r.luyen || []).length ? ' · 🎭 ' + r.luyen.length : '') + '</div></div><span class="diem">' + tot + '<small>/9</small></span></a>';
  }).join('') + '</div>';
};

render();
