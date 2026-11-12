// Trang bắt đầu: thêm app vào màn hình chính, đăng ký, kích hoạt bằng mã chị Hồng duyệt tay.
// Mã kích hoạt ký số ECDSA P-256. App chỉ giữ KHOÁ CÔNG KHAI để kiểm; khoá riêng chỉ chị Hồng giữ.
// Mã: QT-<payload base64url>.<chữ ký>, payload {v:1, k:'ctv', m: mã CTV, z: băm số Zalo, t: ngày cấp}.
var KH_PUB = { kty: 'EC', crv: 'P-256', x: '2CrCIgh7gkoMoJ9byDrWb1dl9qO-NIz68prBTaKirB0', y: '3FhJcIEB1YuDXcpmyR6lN4_T7b62CPpUF0jfjvnsAEk' };
var KH_ZALO = 'https://zalo.me/0977206471';
var DK = null, CAI = null;
window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); CAI = e; if (location.hash.indexOf('#bat-dau') === 0) render(); });

function soZalo(s) { s = String(s || '').replace(/\D/g, ''); if (s.indexOf('84') === 0) s = '0' + s.slice(2); if (s && s[0] !== '0') s = '0' + s; return s; }
function b64d(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }
function kiemMa(ma, zalo, code) {
  code = String(code || '').trim().replace(/\s+/g, '');
  var m = /^QT-([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/.exec(code);
  if (!m) return Promise.resolve('Mã chưa đúng dạng. Mã bắt đầu bằng QT-');
  if (!window.crypto || !crypto.subtle) return Promise.resolve('Máy chưa hỗ trợ kiểm mã. Mở app bằng Safari hoặc Chrome bản mới.');
  var p; try { p = JSON.parse(new TextDecoder().decode(b64d(m[1]))); } catch (e) { return Promise.resolve('Mã bị thiếu ký tự. Dán lại nguyên mã nhé.'); }
  return crypto.subtle.importKey('jwk', KH_PUB, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify'])
    .then(function (k) { return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, k, b64d(m[2]), new TextEncoder().encode(m[1])); })
    .then(function (ok) {
      if (!ok || p.k !== 'ctv') return 'Mã không hợp lệ.';
      if (String(p.m).toUpperCase() !== String(ma || '').trim().toUpperCase()) return 'Mã này cấp cho mã CTV khác.';
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode('qt|' + soZalo(zalo))).then(function (h) { return hex(h).slice(0, 10) === p.z ? '' : 'Mã này cấp cho số Zalo khác.'; });
    }).catch(function () { return 'Không kiểm được mã, thử lại nhé.'; });
}
function daKichHoat() { return !!(S.kichHoat && S.kichHoat.code && S.kichHoat.ma === S.me.ma) || !!window.XEM_THU_MO; }
function laApCai() { try { return navigator.standalone || matchMedia('(display-mode: standalone)').matches; } catch (e) { return false; } }
function heDieuHanh() { var u = navigator.userAgent || ''; if (/iPhone|iPad|iPod/i.test(u) || (/Macintosh/.test(u) && 'ontouchend' in document)) return 'ios'; if (/Android/i.test(u)) return 'android'; return 'khac'; }

function dkLay() { if (!DK) DK = { ma: S.me.ma || '', ten: S.me.ten || '', zalo: S.me.zalo || '', code: '', loi: '', buoc: S.daDangKy ? 3 : 0 }; return DK; }
function tinDangKy() { var d = dkLay(); return 'Em xin kích hoạt app Quạt Thần Vietwise CTV\nMã CTV: ' + d.ma.trim() + '\nHọ tên: ' + d.ten.trim() + '\nSố Zalo đăng ký CTV: ' + soZalo(d.zalo); }
function guiDangKy() {
  var d = dkLay();
  d.ma = (document.getElementById('dk-ma') || {}).value || d.ma; d.ten = (document.getElementById('dk-ten') || {}).value || d.ten; d.zalo = (document.getElementById('dk-zalo') || {}).value || d.zalo;
  if (!d.ma.trim() || !d.ten.trim() || soZalo(d.zalo).length < 10) { toast('Điền đủ mã CTV, họ tên và số Zalo (10 số) nhé'); return; }
  S.me.ma = d.ma.trim(); S.me.ten = d.ten.trim(); S.me.zalo = soZalo(d.zalo); S.daDangKy = homNay(); save();
  try { navigator.clipboard.writeText(tinDangKy()).catch(function () {}); } catch (e) {}
  if (window.BAO_CAO_URL) try { fetch(BAO_CAO_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ loai: 'dang-ky', ma: S.me.ma, ten: S.me.ten, zalo: S.me.zalo, ngay: homNay() }) }); } catch (e) {}
  d.buoc = 3; render();
  window.open(KH_ZALO, '_blank', 'noopener');
}
function kichHoat() {
  var d = dkLay(), el = document.getElementById('dk-code'); d.code = el ? el.value : d.code;
  kiemMa(S.me.ma, S.me.zalo, d.code).then(function (loi) {
    if (loi) { d.loi = loi; render(); return; }
    S.kichHoat = { ma: S.me.ma, zalo: S.me.zalo, code: d.code.trim().replace(/\s+/g, ''), ngay: homNay() }; save();
    DK = null; toast('Kích hoạt xong. Chào mừng ' + S.me.ten + '!'); location.replace('#'); render();
  });
}
function caiApp() { if (!CAI) return; CAI.prompt(); CAI.userChoice.then(function () { CAI = null; render(); }); }

V['bat-dau'] = function () {
  var d = dkLay(), os = heDieuHanh(), cai = laApCai(), ok = daKichHoat();
  var h = '<div class="bd-dau"><img src="icon-512.png" alt="Logo Quạt Thần CTV Vietwise"><h2>Quạt Thần Vietwise CTV</h2><p>Bán bằng tâm, lộc bền lâu</p></div>';
  // Bước 1: thêm vào màn hình chính
  h += '<div class="the bd-b' + (cai ? ' xong' : '') + '"><div class="bd-tieu"><span class="bd-so">' + (cai ? '✓' : '1') + '</span><b>Thêm app vào màn hình chính</b></div>';
  if (cai) h += '<p class="mo">Đã cài trên màn hình chính.</p>';
  else if (os === 'ios') h += '<div class="bd-cach"><div><span>🧭</span>Mở bằng <b>Safari</b></div><div><span>⬆️</span>Bấm nút <b>Chia sẻ</b></div><div><span>➕</span>Chọn <b>Thêm vào MH chính</b></div></div>';
  else h += (CAI ? '<button class="nut rong" onclick="caiApp()">📲 Cài app ngay</button>' : '') + '<div class="bd-cach"><div><span>🌐</span>Mở bằng <b>Chrome</b></div><div><span>⋮</span>Bấm <b>menu 3 chấm</b></div><div><span>📲</span>Chọn <b>Thêm vào MH chính</b></div></div>';
  h += '</div>';
  // Bước 2: đăng ký
  var daGui = d.buoc >= 3;
  h += '<div class="the bd-b' + (daGui ? ' xong' : '') + '"><div class="bd-tieu"><span class="bd-so">' + (daGui ? '✓' : '2') + '</span><b>Đăng ký CTV</b></div>';
  if (daGui) h += '<p class="mo" style="margin:0">' + esc(S.me.ten) + ' · mã ' + esc(S.me.ma) + ' · Zalo ' + esc(S.me.zalo) + ' <a href="javascript:void 0" onclick="DK.buoc=0;render()">sửa</a></p>';
  else {
    h += '<label for="dk-ma">🪪 Mã CTV Siêu thị</label><input id="dk-ma" value="' + esc(d.ma) + '" placeholder="Ví dụ: 512" autocomplete="off">';
    h += '<label for="dk-ten">👤 Họ và tên</label><input id="dk-ten" value="' + esc(d.ten) + '" placeholder="Như trên tài khoản CTV" autocomplete="name">';
    h += '<label for="dk-zalo">💬 Số Zalo đã đăng ký CTV</label><input id="dk-zalo" inputmode="tel" value="' + esc(d.zalo) + '" placeholder="09…" autocomplete="tel">';
    h += '<button class="nut rong" onclick="guiDangKy()">Gửi đăng ký qua Zalo ›</button><p class="mo" style="margin:0">App chép sẵn tin đăng ký, bạn mở Zalo Siêu thị và dán vào ô chat.</p>';
  }
  h += '</div>';
  // Bước 3: nhập mã
  h += '<div class="the bd-b' + (ok ? ' xong' : (daGui ? '' : ' mo-nhat')) + '"><div class="bd-tieu"><span class="bd-so">' + (ok ? '✓' : '3') + '</span><b>Nhập mã kích hoạt</b></div>';
  if (daGui && !ok) {
    h += '<p class="mo" style="margin:0 0 6px">Má Hồng duyệt xong sẽ gửi mã qua Zalo. Dán mã vào đây.</p><textarea id="dk-code" rows="3" placeholder="QT-…" autocomplete="off" spellcheck="false">' + esc(d.code) + '</textarea>' + (d.loi ? '<div class="canh">' + esc(d.loi) + '</div>' : '') + '<button class="nut rong" onclick="kichHoat()">🔓 Kích hoạt</button><button class="chip" onclick="chep(tinDangKy())">Chép lại tin đăng ký</button><a class="chip" href="' + KH_ZALO + '" target="_blank" rel="noopener">Mở Zalo Siêu thị</a>';
  } else if (!ok) h += '<p class="mo" style="margin:0">Làm bước 2 trước nhé.</p>';
  h += '</div>';
  if (window.XEM_THU && !ok) h += '<button class="nut phu rong" onclick="window.XEM_THU_MO=true;location.replace(\'#\');render()">Bản xem thử: vào app không cần mã</button>';
  if (ok) h += '<a class="nut rong lon" href="#">Vào app ›</a>';
  return h;
};

// Khoá app khi chưa kích hoạt
var _renderGoc = render;
render = function () {
  var t = (location.hash || '#').slice(1).split('/')[0];
  var khoa = !daKichHoat();
  document.body.classList.toggle('chua-kh', khoa); if (khoa) CL_TRUOC = null;
  if (khoa && t !== 'bat-dau') { location.replace('#bat-dau'); }
  _renderGoc();
};
// Kiểm lại chữ ký mỗi lần mở app, phòng sửa tay dữ liệu
if (S.kichHoat && S.kichHoat.code) kiemMa(S.kichHoat.ma, S.kichHoat.zalo, S.kichHoat.code).then(function (loi) { if (loi) { delete S.kichHoat; save(); render(); } });
render();
