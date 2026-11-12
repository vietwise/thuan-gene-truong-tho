// Đọc danh sách khách từ nhiều loại file: Excel/CSV (SheetJS), Word .docx (tự giải nén, không cần thư viện),
// ảnh chụp màn hình (Tesseract.js 5.1.1 + dữ liệu tiếng Việt để sẵn trong thư mục ocr/, đọc chữ ngay trên máy).
// Mọi thứ chạy trên điện thoại, không gửi file đi đâu.

var OCR_DIR = new URL('ocr/', location.href).href;

function duoiFile(f) { var m = /\.([a-z0-9]+)$/i.exec(f.name || ''); return m ? m[1].toLowerCase() : ''; }

// ---------- .docx: tìm word/document.xml trong file zip ----------
function giaiNenDocx(buf) {
  var u = new Uint8Array(buf), dv = new DataView(buf), e = -1;
  for (var i = u.length - 22; i >= Math.max(0, u.length - 66000); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) return Promise.reject(new Error('khong phai zip'));
  var n = dv.getUint16(e + 10, true), p = dv.getUint32(e + 16, true);
  for (var k = 0; k < n; k++) {
    var kieu = dv.getUint16(p + 10, true), nen = dv.getUint32(p + 20, true), lt = dv.getUint16(p + 28, true), lx = dv.getUint16(p + 30, true), lc = dv.getUint16(p + 32, true), dau = dv.getUint32(p + 42, true);
    var ten = new TextDecoder().decode(u.subarray(p + 46, p + 46 + lt));
    if (ten === 'word/document.xml') {
      var bd = dau + 30 + dv.getUint16(dau + 26, true) + dv.getUint16(dau + 28, true), du = u.slice(bd, bd + nen);
      if (kieu === 0) return Promise.resolve(new TextDecoder().decode(du));
      if (kieu !== 8 || !window.DecompressionStream) return Promise.reject(new Error('khong giai nen duoc'));
      return new Response(new Blob([du]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
    }
    p += 46 + lt + lx + lc;
  }
  return Promise.reject(new Error('khong thay noi dung'));
}
function docxThanhDong(xml) {
  var d = new DOMParser().parseFromString(xml, 'application/xml'), W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  function chu(el) { return [].map.call(el.getElementsByTagNameNS(W, 'p'), function (p) { return [].map.call(p.getElementsByTagNameNS(W, 't'), function (t) { return t.textContent; }).join(''); }).join(' ').trim(); }
  var bang = [];
  [].forEach.call(d.getElementsByTagNameNS(W, 'tbl'), function (tb) { [].forEach.call(tb.getElementsByTagNameNS(W, 'tr'), function (tr) { bang.push([].map.call(tr.getElementsByTagNameNS(W, 'tc'), chu)); }); });
  var dong = [].map.call(d.getElementsByTagNameNS(W, 'p'), function (p) { for (var a = p.parentNode; a; a = a.parentNode) if (a.localName === 'tbl') return ''; return [].map.call(p.getElementsByTagNameNS(W, 't'), function (t) { return t.textContent; }).join(''); }).filter(function (s) { return s.trim(); });
  return { bang: bang, chu: dong.join('\n') };
}

// ---------- Ảnh: đọc chữ bằng Tesseract ----------
function napOcr() { return window.Tesseract ? Promise.resolve() : new Promise(function (ok, loi) { var e = document.createElement('script'); e.src = OCR_DIR + 'tesseract.min.js'; e.onload = ok; e.onerror = loi; document.head.appendChild(e); }); }
function docAnh(fs) {
  return napOcr().then(function () {
    return Tesseract.createWorker('vie', 1, { workerPath: OCR_DIR + 'worker.min.js', corePath: OCR_DIR, langPath: OCR_DIR, workerBlobURL: false }).then(function (w) {
      var ra = [];
      return fs.reduce(function (pr, f) { return pr.then(function () { return w.recognize(f).then(function (r) { ra.push(r.data.text); }); }); }, Promise.resolve()).then(function () { w.terminate(); return ra.join('\n'); });
    });
  });
}

// ---------- Chữ tự do (ảnh, Word không có bảng): mỗi dòng một khách ----------
var RE_SDT = /(?:\+?84|0)[\s.\-]?\d(?:[\s.\-]?\d){7,9}/;
function chuThanhKhach(t) {
  var ds = [];
  String(t || '').split(/\r?\n/).forEach(function (l) {
    l = l.replace(/[|•·]+/g, ' ').trim(); if (l.length < 2) return;
    var m = RE_SDT.exec(l), sdt = m ? soDt(m[0]) : '';
    var ten = (m ? (l.slice(0, m.index) + ' ' + l.slice(m.index + m[0].length)) : l).replace(/^\s*\d+[.)\-\s]+/, '').replace(/[\d:;,\-–_=+*#@()\[\]{}<>\/\\]+/g, ' ').replace(/\s+/g, ' ').trim();
    ten = ten.split(' ').slice(0, 6).join(' ');
    if (!ten || ten.length < 2 || !/[a-zA-ZÀ-ỹ]/.test(ten)) return;
    if (/^(ten|ho va ten|so dien thoai|sdt|stt|danh sach|khach hang)$/.test(boDau(ten))) return;
    ds.push({ ten: ten, sdt: sdt });
  });
  return ds;
}
function khachTuDong(ds) { return ds.map(function (x) { return { ten: x.ten, sdt: x.sdt, ma: '', st: { soDon: '', tong: '', tieuDung: '', dau: '', gan: '', tiep: '', mon: '', lichSu: '', diaChi: '', nguon: '', dacDiem: '', nhap: homNay() } }; }); }
function datTho(t, file, nguon) {
  var ds = chuThanhKhach(t);
  NH = { sheet: nguon, ds: khachTuDong(ds), cuaToi: null, boCtv: 0, cot: ['ten', 'sdt'], file: file, tho: ds.map(function (x) { return x.ten + (x.sdt ? ' - ' + x.sdt : ''); }).join('\n') };
  render();
}
function docLaiTho() { var e = document.getElementById('nh-tho'); if (!e || !NH) return; var f = NH.file, s = NH.sheet; datTho(e.value, f, s); toast('Đã đọc lại ' + NH.ds.length + ' khách'); }

// ---------- Cửa vào chung ----------
function docFileKhachMoi(fl) {
  var fs = [].slice.call(fl || []); if (!fs.length) return;
  var anh = fs.filter(function (f) { return /^image\//.test(f.type) || /^(png|jpe?g|heic|webp)$/.test(duoiFile(f)); });
  if (anh.length) {
    toast('Đang đọc chữ trong ' + anh.length + ' ảnh, chờ chút nhé…');
    docAnh(anh).then(function (t) { datTho(t, anh.length > 1 ? anh.length + ' ảnh chụp' : anh[0].name, 'ảnh chụp màn hình'); if (!NH.ds.length) toast('Chưa đọc được tên khách nào trong ảnh. Gõ tay vào ô bên dưới nhé'); })
      .catch(function () { toast('Lần đầu đọc ảnh cần có mạng để tải bộ đọc chữ (khoảng 5MB)'); });
    return;
  }
  var f = fs[0], d = duoiFile(f);
  if (d === 'docx') {
    toast('Đang đọc file Word…');
    f.arrayBuffer().then(giaiNenDocx).then(function (xml) {
      var x = docxThanhDong(xml), tot = x.bang.length ? phanTichBang(x.bang, 'bảng trong Word') : null;
      if (tot && tot.ds.length) { NH = tot; NH.file = f.name; render(); return; }
      var chu = x.bang.map(function (r) { return r.join(' '); }).join('\n') + '\n' + x.chu;
      datTho(chu, f.name, 'file Word');
    }).catch(function () { toast('Không đọc được file Word này. Lưu lại dạng .docx rồi thử lại nhé'); });
    return;
  }
  if (d === 'doc') { toast('File .doc đời cũ: mở bằng Word rồi lưu lại dạng .docx nhé'); return; }
  if (d === 'csv') {
    toast('Đang đọc file…');
    napXlsx().then(function () { return f.text(); }).then(function (t) {
      var wb = XLSX.read(t.replace(/^\uFEFF/, ''), { type: 'string' }), tot = null;
      wb.SheetNames.forEach(function (n) { var x = phanTichBang(XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: '', raw: false }), n); if (x && (!tot || x.ds.length > tot.ds.length)) tot = x; });
      if (tot && tot.ds.length) { NH = tot; NH.file = f.name; render(); } else datTho(t.replace(/[,;\t]/g, ' '), f.name, 'file CSV');
    }).catch(function () { toast('Không đọc được file CSV này'); });
    return;
  }
  if (d === 'txt') { f.text().then(function (t) { datTho(t, f.name, 'file chữ'); }); return; }
  docFileKhach(f);
}

// ---------- Giao diện: thay ô chọn file ở trang Tải file danh sách khách ----------
(function () {
  var goc = V.nhap;
  V.nhap = function () {
    var h = goc();
    h = h.replace(/<p class="mo">Dùng file Excel[\s\S]*?<\/p>/, '<p class="mo">Tải danh sách khách của bạn dưới bất kỳ dạng nào: <b>Excel, CSV, Word (.docx), ảnh chụp màn hình</b> (danh bạ, nhóm Zalo, bảng tính). App tự nhận tên và số điện thoại, không cần sửa file.</p>');
    h = h.replace(/<label class="nut rong" style="margin:8px 0">Chọn file danh sách<input[^>]*><\/label>/, '<label class="nut rong" style="margin:8px 0">📂 Chọn file hoặc ảnh<input type="file" class="an" multiple accept=".xlsx,.xls,.csv,.docx,.txt,image/*,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,text/plain" onchange="docFileKhachMoi(this.files)"></label><div class="hang mo" style="gap:10px;margin:0 0 8px"><span>📊 Excel</span><span>🧾 CSV</span><span>📝 Word</span><span>📸 Ảnh chụp</span></div>');
    if (NH && NH.tho != null) {
      var o = '<div class="the"><label for="nh-tho">✏️ Soát lại: mỗi dòng một khách, dạng <b>Tên - SĐT</b></label><textarea id="nh-tho" rows="8" spellcheck="false">' + esc(NH.tho) + '</textarea><button class="chip" onclick="docLaiTho()">↻ Đọc lại sau khi sửa</button><p class="mo" style="margin:6px 0 0">Ảnh chụp có thể đọc sai vài chữ, bạn sửa ngay ở đây trước khi nhập.</p></div>';
      h = h.replace('<button class="nut rong" onclick="nhapKhach()">', o + '<button class="nut rong" onclick="nhapKhach()">');
    }
    return h;
  };
})();
