// Review sâu: app đọc hết tư liệu buổi gặp rồi chấm từng nan và viết kịch bản "mài rìu" cho team tập.
//  1. Đọc tư liệu ngay trên máy: ảnh chụp chat (Tesseract, tách lượt Khách / Mình theo vị trí bong bóng),
//     PDF (pdf.js 3.11.174, trang scan thì đọc chữ trong ảnh), Word .docx, file chữ, phụ đề,
//     ghi âm và video (Whisper chạy trên máy, thư mục stt/).
//  2. Chấm 9 nan theo từng tiêu chí, trích câu thật làm bằng chứng, soi thứ tự nan.
//  3. Kịch bản mài rìu: mỗi nan một cảnh, dùng chính chữ khách đã nói, có nút tập nói và vì sao.
// Không gửi tư liệu đi đâu. Chấm theo quy tắc, không phải AI: chỉ là gợi ý cho người quan sát.
// Ghi đè htmlDanhGia (thuc-hanh.js), V.suaReview và V.review (index.html).

var PDF_DIR = new URL('pdf/', location.href).href, STT_DIR = new URL('stt/', location.href).href;
var DOC = { dang: false, tin: '' };

// ================= 1 · ĐỌC TƯ LIỆU =================
function baoDoc(t) { DOC.tin = t; var e = document.getElementById('rv-doc'); if (e) { e.textContent = t; e.style.display = t ? '' : 'none'; } }
function themNguon(truong, ten, chu) {
  chu = String(chu || '').trim(); if (!chu || !R) return false;
  R[truong] = ((R[truong] || '').trim() ? R[truong].trim() + '\n\n' : '') + '[' + ten + ']\n' + chu;
  return true;
}

// ---- Ảnh chat: đọc chữ và đoán ai nói theo vị trí bong bóng (trái = khách, phải = mình) ----
function kichThuocAnh(f) { return new Promise(function (ok) { var u = URL.createObjectURL(f), i = new Image(); i.onload = function () { ok(i.naturalWidth || 0); URL.revokeObjectURL(u); }; i.onerror = function () { ok(0); URL.revokeObjectURL(u); }; i.src = u; }); }
var OCR_W = null;
function ocrWorker() {
  if (OCR_W) return OCR_W;
  OCR_W = napOcr().then(function () { return Tesseract.createWorker('vie', 1, { workerPath: OCR_DIR + 'worker.min.js', corePath: OCR_DIR, langPath: OCR_DIR, workerBlobURL: false }); });
  OCR_W.catch(function () { OCR_W = null; });
  return OCR_W;
}
function dongOcr(data) {
  if (data.lines && data.lines.length) return data.lines;
  var ra = []; (data.blocks || []).forEach(function (b) { (b.paragraphs || []).forEach(function (p) { (p.lines || []).forEach(function (l) { ra.push(l); }); }); });
  return ra;
}
function chatTuAnh(data, W) {
  var ls = dongOcr(data);
  if (!W || !ls.length) return String(data.text || '').trim();
  var luot = [], cu = null;
  ls.forEach(function (l) {
    var t = String(l.text || '').replace(/\s+/g, ' ').trim(), b = l.bbox || {};
    if (t.length < 2 || /^\d{1,2}[:h]\d{2}( ?(am|pm|sa|ch))?$/i.test(t) || /^(hôm nay|hôm qua|đã xem|đã nhận|đã gửi|seen|delivered)$/i.test(t)) return;
    var trai = b.x0 / W, phai = b.x1 / W, ai = trai > 0.28 && phai > 0.8 ? 'Mình' : trai < 0.2 && phai < 0.85 ? 'Khách' : '';
    if (cu && (cu.ai === ai || !ai) && b.y0 - cu.y1 < (b.y1 - b.y0) * 1.2) { cu.t += ' ' + t; cu.y1 = b.y1; }
    else { cu = { ai: ai, t: t, y1: b.y1 }; luot.push(cu); }
  });
  return luot.map(function (x) { return (x.ai ? x.ai + ': ' : '') + x.t; }).join('\n');
}
function docAnhChat(f) {
  return Promise.all([ocrWorker(), kichThuocAnh(f)]).then(function (a) { return a[0].recognize(f, {}, { text: true, blocks: true }).then(function (r) { return chatTuAnh(r.data, a[1]); }); });
}

// ---- PDF ----
function napPdf() { return window.pdfjsLib ? Promise.resolve() : new Promise(function (ok, loi) { var e = document.createElement('script'); e.src = PDF_DIR + 'pdf.min.js'; e.onload = function () { pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_DIR + 'pdf.worker.min.js'; ok(); }; e.onerror = loi; document.head.appendChild(e); }); }
function docPdf(f) {
  return napPdf().then(function () { return f.arrayBuffer(); }).then(function (buf) { return pdfjsLib.getDocument({ data: new Uint8Array(buf), isEvalSupported: false }).promise; }).then(function (pdf) {
    var ra = [], so = Math.min(pdf.numPages, 40);
    var chuoi = Promise.resolve();
    for (var i = 1; i <= so; i++) (function (i) {
      chuoi = chuoi.then(function () { baoDoc('Đang đọc PDF ' + f.name + ': trang ' + i + '/' + so); return pdf.getPage(i); }).then(function (pg) {
        return pg.getTextContent().then(function (tc) {
          var dong = [], y = null;
          tc.items.forEach(function (it) { var yy = Math.round(it.transform[5]); if (y !== null && Math.abs(yy - y) > 2) dong.push('\n'); dong.push(it.str); y = yy; });
          var t = dong.join('').replace(/[ \t]+/g, ' ').trim();
          if (t.replace(/\s/g, '').length > 30) { ra.push(t); return; }
          // trang scan: vẽ ra ảnh rồi đọc chữ
          var vp = pg.getViewport({ scale: 2 }), cv = document.createElement('canvas'); cv.width = vp.width; cv.height = vp.height;
          return pg.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise.then(function () { return ocrWorker(); }).then(function (w) { return w.recognize(cv); }).then(function (r) { ra.push(String(r.data.text || '').trim()); });
        });
      });
    })(i);
    return chuoi.then(function () { return ra.join('\n\n') + (pdf.numPages > so ? '\n(PDF dài ' + pdf.numPages + ' trang, app đọc ' + so + ' trang đầu.)' : ''); });
  });
}

// ---- Word, chữ, phụ đề ----
function boMocGio(t) { return String(t || '').replace(/^\uFEFF/, '').replace(/^WEBVTT.*$/m, '').replace(/^\d+\s*$/gm, '').replace(/^[\d:.,]+\s*-->\s*[\d:.,]+.*$/gm, '').replace(/<[^>]+>/g, '').replace(/\n{2,}/g, '\n').trim(); }
function docWord(f) { return f.arrayBuffer().then(giaiNenDocx).then(function (xml) { var x = docxThanhDong(xml); return (x.bang.map(function (r) { return r.join(' · '); }).join('\n') + '\n' + x.chu).trim(); }); }

// ---- Ghi âm, video: Whisper trên máy ----
var STT = null, STT_CHO = null;
function sttWorker() {
  if (STT) return STT;
  STT = new Worker(STT_DIR + 'stt-worker.js', { type: 'module' });
  STT.onmessage = function (e) {
    var m = e.data, c = STT_CHO; if (!c) return;
    if (m.loai === 'tai') baoDoc('Lần đầu: tải bộ nghe tiếng Việt ' + Math.round(m.da / 1048576) + '/' + Math.round(m.tong / 1048576) + ' MB (cần Wi-Fi, chỉ tải một lần)…');
    else if (m.loai === 'doan') { if (m.chu) c.phan.push(m.chu); baoDoc('Đang chép lời ' + c.ten + ': ' + Math.round(m.xong / m.tong * 100) + '% (' + m.xong + '/' + m.tong + ' đoạn 28 giây)'); }
    else if (m.loai === 'xong') { STT_CHO = null; c.ok(m.chu); }
    else if (m.loai === 'loi') { STT_CHO = null; c.loi(new Error(m.loi)); }
  };
  STT.onerror = function (e) { var c = STT_CHO; STT_CHO = null; STT = null; if (c) c.loi(new Error(e.message || 'worker')); };
  return STT;
}
function giaiMaAm(blob) {
  var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return Promise.reject(new Error('Máy không giải mã được âm thanh'));
  return blob.arrayBuffer().then(function (buf) {
    var ac = new AC();
    return new Promise(function (ok, loi) { ac.decodeAudioData(buf, ok, loi); }).then(function (ab) {
      try { ac.close(); } catch (x) {}
      var dai = Math.ceil(ab.duration * 16000), oc = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, dai, 16000), s = oc.createBufferSource();
      s.buffer = ab; s.connect(oc.destination); s.start();
      return oc.startRendering().then(function (r) { return { am: r.getChannelData(0), giay: ab.duration }; });
    });
  });
}
function chepLoiAm(blob, ten) {
  baoDoc('Đang mở file ' + ten + '…');
  return giaiMaAm(blob).then(function (x) {
    if (x.giay > 90 * 60) throw new Error('File dài hơn 90 phút. Cắt đoạn chính (dưới 90 phút) rồi tải lại nhé');
    return new Promise(function (ok, loi) {
      STT_CHO = { ok: ok, loi: loi, ten: ten, phan: [] };
      baoDoc('Đang chuẩn bị bộ nghe chữ (' + Math.round(x.giay / 60) + ' phút âm thanh)…');
      sttWorker().postMessage({ loai: 'chep', am: x.am }, [x.am.buffer]);
    });
  });
}

// ---- Cửa vào: nhiều file một lần ----
function loaiTuLieu(f) {
  var d = duoiFile(f), t = f.type || '';
  if (/^image\//.test(t) || /^(png|jpe?g|heic|heif|webp|gif|bmp)$/.test(d)) return 'anh';
  if (/^(audio|video)\//.test(t) || /^(m4a|mp3|wav|aac|ogg|oga|opus|amr|webm|mp4|mov|m4v|3gp)$/.test(d)) return 'am';
  if (d === 'pdf' || t === 'application/pdf') return 'pdf';
  if (d === 'docx') return 'word';
  if (d === 'doc') return 'doc';
  if (/^(txt|md|srt|vtt|csv)$/.test(d) || /^text\//.test(t)) return 'chu';
  return '';
}
function docTuLieu(fl) {
  var fs = [].slice.call(fl || []); if (!fs.length || !R) return;
  if (DOC.dang) { toast('App đang đọc tư liệu, chờ xong rồi tải thêm nhé'); return; }
  DOC.dang = true; R.tuLieu = R.tuLieu || [];
  var anh = fs.filter(function (f) { return loaiTuLieu(f) === 'anh'; });
  if (anh.length) chonAnh(anh);
  var chuoi = Promise.resolve(), dem = 0;
  fs.forEach(function (f, i) {
    chuoi = chuoi.then(function () {
      var l = loaiTuLieu(f), nhan = (fs.length > 1 ? '(' + (i + 1) + '/' + fs.length + ') ' : '');
      baoDoc(nhan + 'Đang đọc ' + f.name + '…');
      var p;
      if (l === 'anh') p = docAnhChat(f).then(function (t) { return ['chat', t]; });
      else if (l === 'pdf') p = docPdf(f).then(function (t) { return ['chepLoi', t]; });
      else if (l === 'word') p = docWord(f).then(function (t) { return ['chepLoi', t]; });
      else if (l === 'chu') p = f.text().then(function (t) { return ['chepLoi', boMocGio(t)]; });
      else if (l === 'am') { if (!AU) chonAudio(f); p = chepLoiAm(f, f.name).then(function (t) { return ['chepLoi', t]; }); }
      else if (l === 'doc') { toast(f.name + ': file .doc đời cũ, mở bằng Word rồi lưu lại dạng .docx nhé'); return; }
      else { toast('App chưa đọc được loại file ' + f.name); return; }
      return p.then(function (kq) {
        var co = themNguon(kq[0], f.name, kq[1]);
        R.tuLieu.push({ ten: f.name, loai: l, chu: co ? kq[1].length : 0 }); if (co) dem++;
        if (!co) toast('Không thấy chữ nào trong ' + f.name);
      }).catch(function (e) {
        R.tuLieu.push({ ten: f.name, loai: l, loi: 1 });
        var m = String(e && e.message || e);
        toast(l === 'am' && /fetch|network|load|Failed/i.test(m) ? 'Lần đầu chép lời cần mạng (Wi-Fi) để tải bộ nghe tiếng Việt khoảng 80MB' : l === 'anh' && /fetch|network|load/i.test(m) ? 'Lần đầu đọc ảnh cần mạng để tải bộ đọc chữ' : 'Chưa đọc được ' + f.name + ': ' + m);
      });
    });
  });
  chuoi.then(function () { DOC.dang = false; baoDoc(''); render(); if (dem) toast('Đã đọc ' + dem + ' tư liệu. Soát lại chữ ở các ô bên dưới, rồi tự chấm Phần 2 nhé'); });
}
function chepLoiBanThu() {
  if (!AU || !R) return; if (DOC.dang) { toast('App đang đọc tư liệu, chờ chút nhé'); return; }
  DOC.dang = true; var ten = (R.audio && R.audio.ten) || 'bản thu';
  chepLoiAm(AU, ten).then(function (t) { if (themNguon('chepLoi', ten, t)) toast('Đã chép lời ' + ten); else toast('Không nghe ra lời nào trong ' + ten); })
    .catch(function (e) { var m = String(e && e.message || e); toast(/fetch|network|load|Failed/i.test(m) ? 'Lần đầu chép lời cần mạng (Wi-Fi) để tải bộ nghe tiếng Việt khoảng 80MB' : 'Chưa chép lời được: ' + m); })
    .then(function () { DOC.dang = false; baoDoc(''); render(); });
}

// ================= 2 · CHẤM SÁT TỪNG NAN =================
var RE_BAN = /^\s*(mình|minh|em|tôi|toi|ctv|người bán|nguoi ban|nb|me)\s*[:：]\s*/i, RE_KHACH = /^\s*(khách|khach|kh|k|chị khách|anh khách)\s*[:：]\s*/i;
function doanAi(c) {
  var b = bd(c);
  if (/^(u|o|um|uhm|thi|vay a|ok|oke|the a|vang|da vang|chac|de chi|chi cung|chi thay|chi so|chi lo|chi muon)\b/.test(b)) return 'k';
  if (/\b(a|a\?)$/.test(b.replace(/[.!?…]+$/, '')) || /^(da|em chao|em xin|em nghe|em hoi)\b/.test(b)) return 'b';
  return '';
}
function tachLuot(r) {
  var ds = [], doan = false;
  [['keLai', 1], ['chat', 0], ['chepLoi', 0]].forEach(function (nguon) {
    String(r[nguon[0]] || '').split(/\r?\n/).forEach(function (l) {
      if (/^\[[^\]]+\]$/.test(l.trim())) return;
      var ai = '';
      if (RE_BAN.test(l)) { ai = 'b'; l = l.replace(RE_BAN, ''); } else if (RE_KHACH.test(l)) { ai = 'k'; l = l.replace(RE_KHACH, ''); }
      tachCau(l).forEach(function (c) {
        var a = ai || (nguon[1] ? 'ke' : doanAi(c) || (/\?$/.test(c) ? 'b' : ''));
        if (!ai && nguon[1] === 0) doan = true;
        ds.push({ ai: a, c: c, b: bd(c), i: ds.length, nguon: nguon[0] });
      });
    });
  });
  return { ds: ds, doan: doan };
}
var CAU_MO = /the nao|ra sao|dieu gi|chuyen gi|vi sao|tai sao|ke (them|cho em)|nhu the nao|lo nhat|quan tam nhat|mong nhat|so nhat|cai gi|ra lam sao|o diem nao|khuc nao|luc nao/;
var TU_LOT = 'chi anh em co bac minh nha thi la ma va cua cho voi cung roi nay do kia mot nhung cac duoc khong co gi nao sao vay a oi nhe nha thoi rat lam qua hon the nay day'.split(' ');
function tuChinh(b) { return b.replace(/[^a-z0-9 ]/g, ' ').split(' ').filter(function (w) { return w.length > 2 && TU_LOT.indexOf(w) < 0; }); }
var RE_DAU = /\b(lo|so|ngai|met|muon|mong|can|bi|kho|khong biet|thich|ghet|ban khoan|tiec|buon|vat va|chan|hay om|dau bung|thieu)\b/;
var RE_TU_CHOI = [
  ['gia', /\b(dat|mac|nhieu tien|khong co tien|gia cao|re hon|giam gia)\b/, 'chê giá'],
  ['nghi', /suy nghi|de (chi|anh|toi|em) (xem|tinh)|de sau|tinh sau|lan sau/, 'xin suy nghĩ thêm'],
  ['hoi', /hoi (y )?(chong|vo|anh nha|ong xa|ba xa|nha|con)/, 'muốn hỏi người nhà'],
  ['chua', /chua can|khong can|dang dung (roi|hang khac)|co roi/, 'chưa thấy cần'],
  ['tin', /lua dao|ai cung noi|khong tin|quang cao|that khong/, 'còn nghi ngờ']
];
function thay(ds, re, ai, sau) { for (var i = 0; i < ds.length; i++) { var x = ds[i]; if ((sau == null || x.i > sau) && (!ai || x.ai === ai || x.ai === '' || x.ai === 'ke') && re.test(x.b)) return x; } return null; }
function sauDo(ds, x, ai) { if (!x) return null; for (var i = x.i + 1; i < ds.length && i < x.i + 4; i++) if (ds[i].ai === ai) return ds[i]; return null; }

function chamSau(r) {
  var L = tachLuot(r), ds = L.ds, k = khach(r.khach), kq = { co: ds.length > 0, ds: ds, doan: L.doan, nan: {}, ghiChu: [] };
  if (!kq.co) return kq;
  var ban = ds.filter(function (x) { return x.ai === 'b'; }), kh = ds.filter(function (x) { return x.ai === 'k'; });
  var chuBan = 0, chuKh = 0; ban.forEach(function (x) { chuBan += x.c.split(/\s+/).length; }); kh.forEach(function (x) { chuKh += x.c.split(/\s+/).length; });
  kq.tyLe = chuBan + chuKh > 40 && kh.length >= 2 ? Math.round(chuKh / (chuBan + chuKh) * 100) : null;
  var hoi = ds.filter(function (x) { return x.ai !== 'k' && (/\?$/.test(x.c) || CAU_HOI.test(x.b)); });
  var mo = hoi.filter(function (x) { return CAU_MO.test(x.b); });
  var dao = null;
  hoi.forEach(function (q) { if (dao) return; var tr = null; for (var j = q.i - 1; j >= 0 && j >= q.i - 3; j--) if (ds[j].ai === 'k') { tr = ds[j]; break; } if (!tr) return; var a = tuChinh(tr.b), b = tuChinh(q.b); if (a.some(function (w) { return b.indexOf(w) >= 0; })) dao = q; });
  kq.hoi = hoi.length; kq.mo = mo.length;
  function diemDau(x) { var b = x.b, d = 0; if (/\bnhat\b/.test(b)) d += 3; if (/\b(so|lo|ngai|ban khoan)\b/.test(b)) d += 2; if (/\b(dau|benh|om|bi|thuoc|huyet ap|tieu duong|beo|met)\b/.test(b)) d += 2; return d + Math.min(x.c.length, 120) / 120; }
  kq.dau = kh.filter(function (x) { return RE_DAU.test(x.b) && x.c.length > 8; }).sort(function (a, b) { return diemDau(b) - diemDau(a); }).slice(0, 5);
  if (!kq.dau.length) kq.dau = ds.filter(function (x) { return x.ai !== 'b' && RE_DAU.test(x.b) && /\b(chi|anh|co|nha|be|con|minh)\b/.test(x.b) && x.c.length > 8; }).slice(0, 3);
  kq.tuChoi = []; RE_TU_CHOI.forEach(function (t) { var x = thay(ds, t[1], 'k'); if (x) kq.tuChoi.push({ id: t[0], ten: t[2], cau: x }); });

  function tc(ten, x, ghi) { return { ten: ten, ok: !!x, cau: x && x.c ? x : null, ghi: ghi || '' }; }
  var N = {};
  var x1 = thay(ds, /muc tieu|cam ket|sau buoi (nay|hom nay|gap)|hom nay em mong|em mong (chi|anh|co)/, 'b');
  N[1] = [tc('Có mục tiêu cam kết rõ: việc khách sẽ làm sau buổi gặp', x1 || (k && k.mucTieu ? { c: 'Phiếu khách: ' + k.mucTieu, i: -1 } : null))];
  N[2] = [
    tc('Chào hỏi, hỏi thăm trước khi vào chuyện', thay(ds, /\bchao\b|hoi tham|dao nay|khoe khong|the nao roi|lau qua/, 'b')),
    tc('Nhắc một chi tiết thật của khách (gia đình, chuyện khách từng kể)', thay(ds, /hom truoc (chi|anh|co)|nghe (chi|anh|co) (ke|noi)|be nha|be (moi|vao|dang)|con (chi|anh|co)|chau nha|lan truoc/, 'b')),
    tc('Kể ngắn vì sao mình làm Vietwise (chuyện thật của mình)', thay(ds, /vi sao em|em lam (cung|o|voi)|em cung (tung|la me|co con|bi)|chuyen cua em|ly do em/, 'b'))
  ];
  N[3] = [
    tc('Có từ 3 câu hỏi mở (thế nào, điều gì, kể thêm…)', mo.length >= 3 ? mo[0] : null, mo.length + ' câu hỏi mở / ' + hoi.length + ' câu hỏi'),
    tc('Đào thêm một tầng vào đúng chữ khách vừa nói', dao),
    tc('Khách nói nhiều hơn mình (khách chiếm từ 50% số chữ)', kq.tyLe != null && kq.tyLe >= 50 ? { c: 'Khách nói ' + kq.tyLe + '% số chữ', i: -1 } : null, kq.tyLe != null ? 'Khách nói ' + kq.tyLe + '% số chữ' : 'Chưa tách được lời ai nói, ghi "Khách:" và "Mình:" đầu mỗi lượt')
  ];
  var a1 = thay(ds, /dung khong|phai khong|co dung (khong|vay)|vay la (chi|anh|co)|dieu (chi|anh|co) (mong|can|lo|muon) nhat|em hieu (la|dung)|tom lai/, 'b');
  var xn = a1 && sauDo(ds, a1, 'k'), xnOk = xn && /\b(dung|u|vang|da|phai|chuan|chinh xac|that)\b/.test(xn.b);
  var a2 = thay(ds, /neu (cu|khong|de) |vai (nam|thang) nua|lau dan|ve lau ve dai|chuyen gi se xay ra|(cu|de) nhu (bay gio|vay)/, 'b');
  var a3 = thay(ds, /neu (moi|ngay|toi|bua|duoc|ca nha|sang|be|chi|anh)|hinh dung|khac di the nao|thi (chi|anh|co) thay (the nao|sao)/, 'b', a2 ? a2.i : null) || thay(ds, /neu (moi|ngay|toi|bua|duoc|ca nha|be)|hinh dung|khac di the nao/, 'b');
  N[4] = [
    tc('4.1 Tóm nhu cầu bằng chữ của khách và hỏi "đúng không"', a1),
    tc('Chờ khách tự xác nhận ("đúng", "ừ") rồi mới đi tiếp', xnOk ? xn : null, a1 && !xnOk ? 'Sau câu tóm, chưa thấy khách nói "đúng"' : ''),
    tc('4.2 Hỏi viễn cảnh tránh xa ("Nếu cứ để như bây giờ…")', a2),
    tc('4.3 Hỏi viễn cảnh hướng tới ("Nếu mỗi ngày…", "hình dung…")', a3),
    tc('Đúng thứ tự 4.1 → 4.2 → 4.3', a1 && a2 && a3 && a1.i < a2.i && a2.i < a3.i ? a1 : null)
  ];
  N[5] = [
    tc('Uy tín kiểm chứng được (kiểm nghiệm, nguồn gốc, người làm ra)', thay(ds, /kiem nghiem|chung nhan|giay (phep|to)|ho so|nguon goc|truy xuat|nong dan|nguoi lam ra|nha (cung cap|san xuat)|thuong hieu/, 'b')),
    tc('Kể chuyện thật của một khách giống khách này', thay(ds, /mot (chi|anh|co|ban|me|nha) .{0,40}(dung|ke|thay|mua)|khach (cua em|ben em|khac)|ban em .{0,20}dung/, 'b'))
  ];
  var t6 = thay(ds, /(chi|anh|co) (muon|can|mong|lo|so)|nhu (chi|anh|co) (noi|ke)|de (chi|anh|co) (yen tam|do)/, 'b', a1 ? a1.i - 1 : null);
  var f6 = thay(ds, /lam tu|thanh phan|chiet xuat|gom co|duoc lam|ngam \d|cong thuc|nguyen lieu|khong (chua|co) (chat|hoa chat)/, 'b');
  var b6 = f6 && thay(ds, /\bnen\b|giup|do (lo|phai|mat)|khong (con|phai|can)|de (chi|anh|be)/, 'b', f6.i - 1);
  var r6 = f6 && thay(ds, /thay (sao|the nao)|co hop|nghi sao|co vua|co duoc khong|thu (hinh dung|nghi)/, 'b', f6.i - 1);
  N[6] = [tc('T: nối vào nhu cầu khách đã xác nhận', t6), tc('F: nêu đặc điểm có thật của sản phẩm', f6), tc('B: nói lợi ích cho đúng nhà khách', b6), tc('R: hỏi lại khách thấy sao, không độc thoại', r6)];
  var c7 = thay(ds, /hay (la )?(chi|anh|co|de|lan)|muon .{0,30} hay |giao .{0,25}(tuan|thang|mai|nay)|lay .{0,20}(goi|hop|combo)|chot|dat (luon|hang)/, 'b');
  var gia = thay(ds, /\bgia\b|nghin|\d+ ?k\b|\d+\.\d{3}|dong\b|trieu/, '');
  var tcH = kq.tuChoi.filter(function (t) { return t.id !== 'tin'; })[0], xuLy = tcH && sauDo(ds, tcH.cau, 'b'), xlOk = xuLy && (/\?$/.test(xuLy.c) || CAU_HOI.test(xuLy.b));
  var ep = kiemLoi(ds.filter(function (x) { return x.ai !== 'k'; }).map(function (x) { return x.c; }).join('\n'));
  N[7] = [
    tc('Mời quyết định bằng câu hỏi lựa chọn nhẹ', c7),
    tc('Nói giá sau khi đã thống nhất nhu cầu', gia && a1 && gia.i > a1.i ? gia : null, gia && (!a1 || gia.i < a1.i) ? 'Giá xuất hiện trước khi thống nhất nhu cầu' : !gia ? 'Chưa thấy nói giá' : ''),
    tcH ? tc('Khách ' + tcH.ten + ': hỏi ra lý do thật thay vì giải thích', xlOk ? xuLy : null, 'Khách nói: “' + tcH.cau.c + '”') : null,
    tc('Không ép mua, không hứa công dụng', ep.length ? null : { c: 'Không thấy lời ép hay lời hứa công dụng', i: -1 }, ep.join('; '))
  ].filter(Boolean);
  N[8] = [tc('Hẹn chăm sóc sau mua bằng một mốc cụ thể', thay(ds, /sau (khi )?(mua|dung)|ngay (thu )?\d+|vai hom (nua|toi)|em (nhan|goi|hoi) (lai|tham)|hen (chi|anh|co|lai)|dung thu/, 'b'))];
  N[9] = [tc('Có điều phát huy và điều khắc phục', r.phatHuy && r.khacPhuc ? { c: 'Phát huy: ' + r.phatHuy + ' · Khắc phục: ' + r.khacPhuc, i: -1 } : null)];
  for (var n = 1; n <= 9; n++) {
    var ds_ = N[n], ok = ds_.filter(function (t) { return t.ok; }).length;
    var muc = ok === ds_.length ? 'tot' : ok ? 'chua' : 'bo';
    if (n === 4 && ok && !(N[4][0].ok && N[4][2].ok && N[4][3].ok)) muc = 'chua';
    var dau = ds_.filter(function (t) { return t.cau && t.cau.i >= 0; })[0];
    kq.nan[n] = { muc: muc, tc: ds_, ok: ok, cau: dau ? dau.cau : null };
  }
  // thứ tự
  var moc = {}; [[4, a1], [6, f6], [7, gia || c7]].forEach(function (x) { if (x[1]) moc[x[0]] = x[1].i; });
  if (moc[7] != null && (moc[4] == null || moc[7] < moc[4])) kq.ghiChu.push(['canh', 'Chuyện giá, đặt hàng xuất hiện trước khi thống nhất nhu cầu (nan 4). Báo giá sớm thì khách chỉ thấy đắt.']);
  else if (moc[6] != null && (moc[4] == null || moc[6] < moc[4])) kq.ghiChu.push(['canh', 'Sản phẩm được giới thiệu trước khi khách tự xác nhận nhu cầu: dấu hiệu nhảy từ nan 3 sang nan 6.']);
  if (kq.nan[4].muc === 'tot') kq.ghiChu.push(['tot', 'Nan 4 đủ 3 câu và đúng thứ tự. Sự đồng tình ở đây là khách đã ngầm chốt, các nan sau chỉ giúp khách giao dịch.']);
  if (kq.tyLe != null && kq.tyLe < 35) kq.ghiChu.push(['canh', 'Khách chỉ nói ' + kq.tyLe + '% số chữ. Mình nói nhiều quá, lần sau hỏi nhiều hơn, kể ít hơn.']);
  if (L.doan) kq.ghiChu.push(['mo', 'Một số câu app phải đoán ai nói. Ghi "Khách:" và "Mình:" đầu mỗi lượt trong ô chép lời để app chấm chuẩn hơn.']);
  return kq;
}

// ================= 3 · KỊCH BẢN MÀI RÌU =================
function goiKhach(r, ds) {
  var k = khach(r.khach); if (k && k.goi) return k.goi.trim();
  var dem = {}; ds.forEach(function (x) { if (x.ai === 'b') (x.b.match(/\b(chi|anh|co|bac|di|chu)\b/g) || []).forEach(function (w) { dem[w] = (dem[w] || 0) + 1; }); });
  var top = Object.keys(dem).sort(function (a, b) { return dem[b] - dem[a]; })[0];
  return { chi: 'chị', anh: 'anh', co: 'cô', bac: 'bác', di: 'dì', chu: 'chú' }[top] || 'chị';
}
function ngan(s, n) { s = boCham(String(s || '').replace(/^(khách|mình|em)\s*:\s*/i, '')); var w = s.split(/\s+/); return w.length > (n || 18) ? w.slice(0, n || 18).join(' ') + '…' : s; }
function loiKhach(x) { return x ? '“' + ngan(x.c, 22) + '”' : ''; }
function tuDau(x) {
  if (!x) return ''; var c = boCham(x.c), m = /(lo|sợ|ngại|mệt|muốn|mong|cần|bị|khó|băn khoăn|vất vả|thiếu)\s+(nhất\s+|nhiều\s+|là\s+)*([^,;.]{3,60})/i.exec(c);
  return ngan(m ? m[3] : c.split(/[,;]/)[0], 10);
}
function maiRiu(r, kq) {
  var ds = kq.ds, g = goiKhach(r, ds), G = hoa(g), k = khach(r.khach);
  var dau = kq.dau[0], dau2 = kq.dau[1], td = tuDau(dau), nc = k && (k.nhuCau || []).length ? boCham(k.nhuCau[0]) : td ? 'yên tâm, không còn phải lo chuyện ' + td : 'chuyện ' + g + ' vừa kể được giải quyết cho yên tâm';
  var canh = [];
  function them(n, phu, ban, khachDap, viSao, nhan) {
    var x = kq.nan[n], cu = phu && n === 4 ? (phu.indexOf('4.1') === 0 ? x.tc[0] : phu.indexOf('4.2') === 0 ? x.tc[2] : x.tc[3]).cau : x.cau;
    var dap = cu && cu.i >= 0 ? sauDo(ds, cu, 'k') : null;
    canh.push({ n: n, phu: phu || '', muc: x.muc, cu: cu && cu.i >= 0 ? cu.c : '', dap: dap ? dap.c : '', ban: ban, khach: khachDap, viSao: viSao, nhan: nhan || '', tc: phu ? [] : x.tc });
  }
  var x;
  x = kq.nan[1];
  them(1, '', '(Nói với nhóm trước khi vào vai) Mục tiêu cam kết của em: ' + (k && k.mucTieu ? boCham(k.mucTieu) : g + ' đồng ý để em gửi bộ câu hỏi hồ sơ gia đình, hoặc chọn thử một món nhỏ cho đúng chuyện ' + g + ' đang lo') + '.', '(Khách chưa xuất hiện.)',
    x.muc === 'tot' ? 'Ca thật đã có mục tiêu. Giữ thói quen nói to trước nhóm.' : 'Ca thật chưa thấy mục tiêu cam kết. Không có mục tiêu thì buổi gặp trôi theo câu chuyện và dễ nhảy sang bán. Mục tiêu là việc khách sẽ làm, không phải số tiền.');
  x = kq.nan[2];
  var kn2 = (k && k.ketNoi && !x.tc[1].ok) ? k.ketNoi : (x.tc[0].ok ? x.tc[0].cau.c : 'Em chào ' + g + ' ạ.') + (x.tc[1].ok && x.tc[1].cau !== x.tc[0].cau ? ' ' + x.tc[1].cau.c : x.tc[1].ok ? '' : ' Lần trước ' + g + ' có kể … (nhắc một chi tiết thật của nhà ' + g + '), giờ chuyện đó sao rồi ' + g + '?') + (x.tc[2].ok ? '' : ' Em làm cùng Siêu thị Vietwise vì … (một câu chuyện thật của em).');
  them(2, '', kn2, dau ? loiKhach(dau) : 'Ừ chào em. Dạo này chị cũng bận lắm.',
    x.muc === 'tot' ? 'Kết nối đã ổn: có chào hỏi, có chi tiết thật của khách, có chuyện của mình.' : 'Thiếu: ' + x.tc.filter(function (t) { return !t.ok; }).map(function (t) { return t.ten.toLowerCase(); }).join('; ') + '. Mở bằng một chi tiết thật của khách để khách thấy mình được nhớ tới, không phải đang bị bán hàng.');
  x = kq.nan[3];
  var q3 = td ? G + ' nói ' + loiKhach(dau) + '. ' + G + ' kể thêm cho em, chuyện đó thường xảy ra lúc nào, và lúc đó ' + g + ' thấy sao ạ?' : G + ' lo cho bữa ăn của nhà mình thì điều gì làm ' + g + ' băn khoăn nhất ạ?';
  them(3, '', q3, dau2 ? loiKhach(dau2) : dau ? '(Khách kể thêm một chuyện cụ thể trong nhà.)' : 'Thì chị cũng lo chuyện ăn uống của mấy đứa nhỏ.',
    (x.tc[0].ghi ? 'Ca thật: ' + x.tc[0].ghi + '. ' : '') + (x.tc[1].ok ? 'Bạn đã đào thêm một tầng, tốt. ' : 'Chưa thấy câu hỏi đào thêm vào đúng chữ khách vừa nói. ') + 'Bản mài rìu nhặt lại chính chữ khách đã nói rồi hỏi sâu một tầng, để nhu cầu là của khách chứ không phải mình đoán.', 'Đào thêm một tầng');
  x = kq.nan[4];
  them(4, '4.1 Khách tự xác nhận nhu cầu', 'Em nghe ' + g + ' nói' + (dau ? ' ' + loiKhach(dau) : ' vậy') + ', vậy điều ' + g + ' mong nhất là ' + nc + ', đúng không ' + g + '? (Dừng, chờ khách xác nhận.)', 'Đúng rồi em.',
    (x.tc[0].ok ? (x.tc[1].ok ? 'Ca thật đã tóm và khách đã xác nhận. ' : 'Ca thật có tóm, nhưng chưa thấy khách nói "đúng" trước khi mình đi tiếp. ') : 'Ca thật chưa có câu tóm nhu cầu. ') + 'Tóm bằng chính chữ khách, rồi im lặng chờ khách tự nói "đúng". Chưa có chữ "đúng" thì chưa sang câu 2.', 'Chờ xác nhận');
  them(4, '4.2 Viễn cảnh tránh xa', 'Nếu cứ để như bây giờ thêm vài năm nữa' + (td ? ', chuyện ' + td + ' vẫn còn đó' : '') + ', ' + g + ' nghĩ nhà mình sẽ ra sao ạ? (Dừng, chờ khách trả lời. Khách chỉ gật đầu đồng tình cũng được.)', '(Khách tự nói ra cái giá của việc không thay đổi.)',
    (x.tc[2].ok ? 'Ca thật đã có câu viễn cảnh tránh xa. ' : 'Ca thật thiếu câu viễn cảnh tránh xa. ') + 'Đây là câu hỏi để khách tự hình dung, không phải lời dọa. Chỉ hỏi sau khi khách đã xác nhận nhu cầu.', 'Chờ khách trả lời');
  them(4, '4.3 Viễn cảnh hướng tới', 'Còn nếu ' + (k && (k.nhuCau || []).length ? nc : td ? g + ' được yên tâm, chuyện ' + td + ' không còn làm ' + g + ' lo nữa' : nc) + ', ' + g + ' hình dung một ngày của nhà mình sẽ khác đi thế nào ạ? (Dừng, chờ khách trả lời. Khách chỉ gật đầu đồng tình cũng được.)', '(Gật đầu) Ừ, vậy thì tốt quá em.',
    (x.tc[3].ok ? 'Ca thật đã có câu viễn cảnh hướng tới. ' : 'Ca thật thiếu câu viễn cảnh hướng tới. ') + 'Kết nan 4 bằng hy vọng. Khách đồng tình ở đây là đã ngầm chốt; nan 5 đến 7 chỉ còn giúp khách giao dịch.', 'Chờ khách trả lời');
  x = kq.nan[5];
  them(5, '', x.tc[0].ok && x.tc[1].ok ? x.tc[1].cau.c : (k && k.thuongHieu) ? k.thuongHieu : 'Siêu thị Vietwise chỉ nhận hàng có hồ sơ kiểm nghiệm, ' + g + ' xem được nguồn gốc từng món. Có một chị khách của em cũng ' + (td ? 'từng ' + td : 'có hoàn cảnh giống nhà mình') + ' (kể một ca thật bạn biết), giờ chị ấy yên tâm hơn nhiều.', 'Vậy à, có kiểm nghiệm thì chị yên tâm hơn.',
    'Thiếu: ' + (x.tc.filter(function (t) { return !t.ok; }).map(function (t) { return t.ten.toLowerCase(); }).join('; ') || 'không thiếu gì, giữ nhé') + '. Uy tín phải kiểm chứng được, và chuyện kể phải là chuyện thật.');
  x = kq.nan[6];
  var tf = k && (k.tfbr || []).length ? tfbrCau(k.tfbr[k.tfbr.length - 1]) : G + ' muốn ' + nc + ' (T). [Tên sản phẩm] làm từ … (F: chỉ nói điều có trên nhãn, hồ sơ), nên … (B: lợi ích cho đúng nhà ' + g + '). ' + G + ' hình dung dùng thế này mỗi ngày thì thấy sao ạ? (R)';
  them(6, '', tf, 'Nghe gọn đó em.', 'Ca thật: ' + x.tc.map(function (t) { return t.ten.split(':')[0] + (t.ok ? ' ✓' : ' ✗'); }).join(', ') + '. TFBR nối thẳng vào nhu cầu khách vừa xác nhận ở nan 4, và luôn kết bằng câu hỏi để khách nói.');
  x = kq.nan[7];
  var tcH = kq.tuChoi.filter(function (t) { return t.id !== 'tin'; })[0], xl = {
    gia: 'Dạ, ' + g + ' thấy giá cao so với cái gì ạ? (Dừng, nghe.) Tính ra mỗi ngày khoảng … (nói đúng số thật). ' + G + ' muốn thử gói nhỏ trước hay lấy gói tháng ạ?',
    nghi: 'Dạ, ' + g + ' cứ suy nghĩ ạ. Em hỏi để giúp ' + g + ' dễ nghĩ hơn: ' + g + ' còn băn khoăn về giá, về cách dùng, hay muốn hỏi ý người nhà trước ạ?',
    hoi: 'Dạ hợp lý ạ. Em gửi ' + g + ' ảnh sản phẩm và giá để ' + g + ' đưa người nhà xem, tối mai em nhắn hỏi lại ' + g + ' nha?',
    chua: 'Dạ, vậy mình quay lại chuyện ' + (td || g + ' kể lúc nãy') + ' một chút: ' + g + ' thấy chuyện đó cần giải quyết sớm, hay để sau cũng được ạ?'
  };
  var b7 = 'Một gói dùng được khoảng … (nói đúng số liệu thật). ' + G + ' muốn em giao cùng giỏ hàng tuần này, hay ' + g + ' để lần sau ạ?';
  them(7, '', tcH ? b7 + ' / Khi khách ' + tcH.ten + ': ' + xl[tcH.id] : b7, tcH ? loiKhach(tcH.cau) : (r.ketQua === 'mua' ? 'Ừ, vậy em giao cho chị nha.' : 'Để chị suy nghĩ thêm nha.'),
    'Ca thật: ' + x.tc.map(function (t) { return t.ten + (t.ok ? ' ✓' : ' ✗') + (t.ghi && !t.ok ? ' (' + t.ghi + ')' : ''); }).join('; ') + '. Khách vẫn được quyền nói không. Không giảm giá ép, không tạo khan hiếm giả; nếu khách còn lo về nhu cầu thì quay lại nan 4.', tcH ? 'Hỏi ra lý do thật' : '');
  them(8, '', '(Ngày 5 sau mua) ' + G + ' ơi, mấy hôm nay ' + (td ? 'chuyện ' + td + ' thế nào rồi ạ?' : 'nhà mình dùng thấy thế nào rồi ạ?'), 'Cũng được em, mà chị hay quên cách dùng.',
    (kq.nan[8].muc === 'tot' ? 'Ca thật đã hẹn chăm sóc sau mua. ' : 'Ca thật chưa hẹn mốc chăm sóc sau mua. ') + 'Hỏi lại bằng chuyện của khách, không hỏi "mua thêm không".');
  them(9, '', 'Mình phát huy: ' + (r.phatHuy || '…') + '. Lần sau mình làm khác: ' + (r.khacPhuc || '…') + '.', '(Hết cảnh. Cả nhóm cùng review.)', 'Người quan sát đọc lại các nan có dấu ✗ ở trên, nhất là ba câu của nan 4.');
  return canh;
}

var MUC_CHU = { tot: '✓ Tốt', chua: '◐ Chưa đủ', bo: '○ Bỏ qua' };
function htmlDanhGia(r) {
  var kq = chamSau(r), h = '<h3>Phần 3 · App chấm sát từng nan</h3>';
  if (!kq.co) return h + '<div class="the mo">Chưa có tư liệu để app đọc. Bấm Sửa, tải ảnh chat, ghi âm, video, PDF, Word hoặc dán lời kể vào Phần 1 nhé.</div>';
  var tot = 0; for (var n = 1; n <= 9; n++) if (kq.nan[n].muc === 'tot') tot++;
  h += '<div class="the"><div class="hang" style="align-items:center"><div class="diem-ap"><b>' + tot + '</b>/9</div><div style="flex:1">nan đủ tiêu chí · ' + kq.ds.length + ' câu đã đọc · ' + kq.hoi + ' câu hỏi (' + kq.mo + ' câu mở)' + (kq.tyLe != null ? ' · khách nói ' + kq.tyLe + '%' : '') + '</div></div>';
  if (kq.dau.length) h += '<div style="margin-top:8px"><b>Chữ của khách</b> (điều khách lo, mong):<ul style="margin:4px 0 0">' + kq.dau.map(function (x) { return '<li>“' + esc(ngan(x.c, 30)) + '”</li>'; }).join('') + '</ul></div>';
  if (kq.tuChoi.length) h += '<div style="margin-top:6px"><b>Khách từ chối, trì hoãn:</b> ' + kq.tuChoi.map(function (t) { return esc(t.ten) + ' (“' + esc(ngan(t.cau.c, 16)) + '”)'; }).join('; ') + '</div>';
  h += '</div>';
  h += NAN.map(function (b) {
    var x = kq.nan[b.n];
    return '<details class="the" style="padding:8px 12px"' + (x.muc !== 'tot' ? ' open' : '') + '><summary class="hang" style="align-items:center"><span class="so' + (b.guong.do ? ' do' : '') + '">' + b.n + '</span><b style="flex:1">' + esc(b.ten) + '</b><span class="' + (x.muc === 'tot' ? 'tot-c' : 'chua-c') + '">' + MUC_CHU[x.muc] + '</span></summary><ul style="margin:6px 0 0;padding-left:18px">' + x.tc.map(function (t) {
      return '<li>' + (t.ok ? '✓ ' : '✗ ') + esc(t.ten) + (t.cau ? '<div class="mo">“' + esc(ngan(t.cau.c, 30)) + '”</div>' : t.ghi ? '<div class="mo">' + esc(t.ghi) + '</div>' : '') + '</li>';
    }).join('') + '</ul></details>';
  }).join('');
  kq.ghiChu.forEach(function (g) { h += '<div class="' + (g[0] === 'tot' ? 'on-ok' : g[0] === 'canh' ? 'canh' : 'the mo') + '">' + esc(g[1]) + '</div>'; });
  var lech = []; for (var i = 1; i <= 9; i++) { var t = r.buoc[i], m = kq.nan[i].muc; if (t === 'tot' && m === 'bo') lech.push('Nan ' + i + ': bạn chấm Tốt nhưng app chưa thấy trong tư liệu.'); if ((t === 'chua' || t === 'bo') && m === 'tot') lech.push('Nan ' + i + ': bạn chấm Chưa tốt, mà tư liệu cho thấy đủ tiêu chí. Có khi bạn đang khắt khe với mình.'); }
  if (lech.length) h += '<div class="the"><b>So với bạn tự đánh giá</b><ul>' + lech.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
  h += '<p class="mo">App chấm theo quy tắc trên chữ đã đọc, không phải AI: là gợi ý để người quan sát soi lại.</p><button class="chip" onclick="chep(yeuCauAIReview(\'' + r.id + '\'))">Sao chép yêu cầu nhờ trợ lý AI chấm sâu hơn</button>';
  return h + htmlMaiRiu(r, kq);
}
function htmlMaiRiu(r, kq) {
  var cs = maiRiu(r, kq);
  var h = '<h3>🪓 Kịch bản mài rìu từ ca thật</h3><p class="mo">Mỗi cảnh đặt <b>lời thật</b> của bạn cạnh <b>bản mài rìu</b> sắc hơn, dùng chính chữ khách đã nói. Tập theo thứ tự; cảnh ★ là chỗ ca thật còn hụt.</p>';
  h += cs.map(function (c) {
    var ky = c.muc !== 'tot', b = NAN[c.n - 1];
    var o = '<div class="the canh-kb' + (ky ? ' ky' : '') + '"><b>' + (ky ? '★ ' : '') + 'Nan ' + c.n + ' · ' + esc(c.phu || b.ten) + '</b>';
    o += '<div class="vai" style="opacity:.8"><i>Ca thật, bạn nói</i>' + (c.cu ? esc(c.cu) : '<span class="mo">(không thấy trong tư liệu)</span>') + (c.dap ? '<div class="mo">Khách đáp: “' + esc(c.dap) + '”</div>' : '') + '</div>';
    o += '<div class="vai"><i>Bản mài rìu' + (c.nhan ? ' <span class="kb-nhan">' + esc(c.nhan) + '</span>' : '') + '</i>' + esc(c.ban) + '</div><div class="vai kh"><i>Khách</i>' + esc(c.khach) + '</div>';
    return o + '<details class="kb-visao"><summary>💡 Vì sao mài lại thế này?</summary><p>' + esc(c.viSao) + '</p></details><div class="mo">Người quan sát soi: ' + esc(b.thu) + '</div></div>';
  }).join('');
  h += '<div class="hang"><a class="nut" href="#review/tapm/' + r.id + '">▶ Tập bản mài rìu từng câu</a><button class="nut phu" onclick="chep(chuMaiRiu(\'' + r.id + '\'))">Sao chép bản mài rìu cho team</button></div>';
  return h + '<p class="mo" style="margin-top:14px">Bên dưới là hai kịch bản mẫu A, B để tập thêm tình huống khách rõ và khách chưa rõ.</p>';
}
function chuMaiRiu(id) {
  var r = S.review.filter(function (x) { return x.id === id; })[0], cs = maiRiu(r, chamSau(r));
  return 'KỊCH BẢN MÀI RÌU QUẠT THẦN · ' + vn(r.ngay) + '\nVai: Người bán · Khách · Người quan sát. Cảnh ★ là chỗ ca thật còn hụt.\n\n' + cs.map(function (c) {
    return (c.muc !== 'tot' ? '★ ' : '') + 'Nan ' + c.n + ' · ' + (c.phu || NAN[c.n - 1].ten) + '\nCa thật: ' + (c.cu || '(không thấy)') + '\nMài rìu: ' + c.ban + '\nKhách: ' + c.khach + '\nVì sao: ' + c.viSao;
  }).join('\n\n');
}
function yeuCauAIReview(id) {
  var r = S.review.filter(function (x) { return x.id === id; })[0];
  return 'Tôi là cộng tác viên Siêu thị Vietwise, đang tập Quạt Thần (Action Selling 9 nan: 1 Mục tiêu cam kết, 2 Kết nối, 3 Đặt câu hỏi hay, 4 Thống nhất nhu cầu và nâng cảm xúc gồm 3 câu theo thứ tự: 4.1 khách tự xác nhận nhu cầu, 4.2 viễn cảnh tránh xa, 4.3 viễn cảnh hướng tới, mỗi câu dừng chờ khách trả lời hoặc đồng tình; 5 Giới thiệu thương hiệu, 6 Giới thiệu sản phẩm theo TFBR, 7 Chốt, 8 Sau mua, 9 Review). Khách đồng tình ở nan 4 là đã ngầm chốt, nan 5 đến 7 chỉ giúp khách giao dịch.\n\nDưới đây là toàn bộ tư liệu một buổi tư vấn (lời kể, chat, bản chép lời). Hãy:\n1. Chấm từng nan: tốt, chưa đủ, bỏ qua. Trích nguyên câu làm bằng chứng.\n2. Chỉ ra chỗ nhảy bước, chỗ mình nói nhiều hơn khách, lời hứa công dụng hay lời ép mua nếu có.\n3. Viết kịch bản "mài rìu" cho từng nan (nan 4 đủ 3 câu), dùng chính chữ khách đã nói, kèm một câu giải thích vì sao, để team đóng vai tập lại tình huống thật.\nKhông bịa thêm lời khách, không hứa công dụng sản phẩm.\n\n---\n' + nguonReview(r) + (r.nguyenVan ? '\nKhách nói nguyên văn: ' + r.nguyenVan : '');
}

// ================= GIAO DIỆN =================
(function () {
  var goc = V.suaReview;
  V.suaReview = function () {
    var h = goc();
    var o = '<div class="the" style="border-color:var(--kim)"><b>📎 Tải tư liệu buổi gặp cho app đọc</b><p class="mo" style="margin:4px 0 8px">Ảnh chụp chat, ghi âm, video, PDF, Word, file chữ. Chọn được nhiều file một lần. App đọc hết chữ ngay trên máy, chép lời ghi âm, rồi ở Phần 3 chấm sát từng nan và viết kịch bản mài rìu.</p>';
    o += '<label class="nut rong" style="margin:0">📎 Chọn tư liệu<input type="file" class="an" multiple accept="image/*,audio/*,video/*,.pdf,.docx,.doc,.txt,.md,.srt,.vtt,.m4a,.mp3,.wav,.aac,.ogg,.opus,.amr,.mp4,.mov,.m4v,.webm,application/pdf" onchange="docTuLieu(this.files)"></label>';
    o += '<div class="hang mo" style="gap:10px;margin:6px 0 0"><span>🖼 Ảnh chat</span><span>🎧 Ghi âm</span><span>🎬 Video</span><span>📄 PDF</span><span>📝 Word, chữ</span></div>';
    o += '<p id="rv-doc" class="thieu" style="' + (DOC.tin ? '' : 'display:none') + '">' + esc(DOC.tin) + '</p>';
    if (R.tuLieu && R.tuLieu.length) o += '<div class="mo" style="margin-top:6px">Đã đọc: ' + R.tuLieu.map(function (t) { return esc(t.ten) + (t.loi ? ' (chưa đọc được)' : ''); }).join(' · ') + '</div>';
    o += '<p class="mo" style="margin:6px 0 0">Lần đầu chép lời ghi âm, app tải bộ nghe tiếng Việt khoảng 80MB (cần Wi-Fi), sau đó chạy không cần mạng. Chép lời mất chừng bằng độ dài file, cứ để app mở. Ảnh chat: bong bóng trái là Khách, phải là Mình.</p></div>';
    h = h.replace('<label>Kể lại buổi gặp</label>', o + '<label>Kể lại buổi gặp</label>');
    if (AU_URL) h = h.replace(/(<div class="mo">[^<]*· [\d.]+ (?:MB|KB)<\/div>)/, '$1<button class="chip" onclick="chepLoiBanThu()">📝 Chép lời file này vào ô bản chép lời</button>');
    return h;
  };
  var gocV = V.review;
  V.review = function (p) {
    if (p[1] === 'tapm') {
      var r = S.review.filter(function (x) { return x.id === p[2]; })[0];
      if (r) { batDauTap(maiRiu(r, chamSau(r)).map(function (c) { return { tieu: 'Nan ' + c.n + ' · ' + (c.phu || NAN[c.n - 1].ten), ban: c.ban, khach: c.khach, quan: NAN[c.n - 1].thu, ky: c.muc !== 'tot', nhan: c.nhan, viSao: c.viSao }; }), '#review/xem/' + r.id, 'Mài rìu ' + vn(r.ngay), 'rvm:' + r.id); location.replace('#tap-noi'); return ''; }
    }
    return gocV(p);
  };
})();
