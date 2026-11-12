// Quạt Thần Vietwise CTV: app đánh giá buổi gặp, kịch bản đóng kịch, tập nói, chân dung khách và kịch bản bắt chuyện.
// Tất cả chạy trên máy, không gửi dữ liệu đi đâu. Đánh giá dựa trên từ khoá, không phải AI.

function bd(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/\s+/g, ' ').trim(); }
function tachCau(t) { return String(t || '').replace(/\r/g, '').replace(/([.?!…])\s+/g, '$1\n').split(/\n+/).map(function (x) { return x.trim(); }).filter(function (x) { return x.length > 3; }); }

// ---------- Phần 3 · App đánh giá ----------
var DAU_NAN = {
  1: /muc tieu|cam ket|sau buoi (nay|gap)|mong (chi|anh|co|khach)|hen (gap|buoi)/,
  2: /\bchao\b|em la |lam cung|sieu thi vietwise|hoi tham|dao nay|nha minh the nao|chuyen cua em|vi sao em/,
  3: /\?|ke them|the nao|ra sao|lo nhat|quan tam|bao nhieu|o dau|hay (an|dung|mua|nau)/,
  4: /neu (duoc|moi|ngay|toi|bua|cu|khong)|dung khong (chi|anh|co)|vay (la|dieu)|dieu (chi|anh|co) mong|thang 10|so may|im lang|mot nhip/,
  5: /thuong hieu|nha (cung cap|san xuat)|nguoi lam|nguon goc|nong dan|nhan hieu|chi .{1,20} cung (co|dung)|ban em|khach cua em/,
  6: /lam tu|giup|nen (chi|anh|nha)|hinh dung|thay sao|ngam|pha |dung (moi|hang)|cong dung|tfbr/,
  7: /\bgia\b|nghin|\d+ ?k\b|dong\b|giao (hang|theo)|dat hang|chot|suy nghi them|lich (giao|co dinh)|thanh toan/,
  8: /ngay (5|10|15)|sau (khi )?mua|dung (thay|duoc)|nhan (duoc )?hang|hoi tham sau/,
  9: /rut kinh nghiem|lan sau|phat huy|khac phuc|review|dien lai/
};
var CAU_HOI = /\?|\b(khong a|gi|nao|sao|bao nhieu|the nao|ra sao|o dau|khi nao|ai)\b/;
function nguonReview(r) { return [r.keLai, r.chat, r.chepLoi].filter(Boolean).join('\n'); }
function danhGia(r) {
  var txt = nguonReview(r), cau = tachCau(txt), kq = { co: !!txt.trim(), nan: {}, soCau: cau.length, hoi: 0, ghiChu: [] };
  cau.forEach(function (c, i) {
    var b = bd(c);
    if (CAU_HOI.test(b) || /\?$/.test(c)) kq.hoi++;
    for (var n = 1; n <= 9; n++) if (DAU_NAN[n].test(b) && !(kq.nan[n])) kq.nan[n] = { cau: c, i: i };
  });
  if (r.phatHuy && r.khacPhuc && !kq.nan[9]) kq.nan[9] = { cau: 'Phát huy: ' + r.phatHuy, i: 999 };
  kq.thay = Object.keys(kq.nan).length;
  var b4 = kq.nan[4] ? kq.nan[4].i : 1e9, b6 = kq.nan[6] ? kq.nan[6].i : 1e9, b7 = kq.nan[7] ? kq.nan[7].i : 1e9;
  if (b7 < b4 && b7 < 1e9) kq.ghiChu.push(['canh', 'Trong lời kể, chuyện giá hay đặt hàng xuất hiện trước khi thống nhất nhu cầu (nan 4). Báo giá sớm thì khách chỉ thấy đắt.']);
  else if (b6 < b4 && b6 < 1e9) kq.ghiChu.push(['canh', 'Sản phẩm được giới thiệu trước khi thống nhất nhu cầu: dấu hiệu nhảy từ nan 3 sang nan 6.']);
  if (kq.co && kq.hoi < 3) kq.ghiChu.push(['canh', 'Mới thấy ' + kq.hoi + ' câu hỏi. Buổi gặp tốt thường có nhiều câu hỏi mở ở nan 3 hơn là câu giới thiệu.']);
  else if (kq.hoi >= 5) kq.ghiChu.push(['tot', 'Có ' + kq.hoi + ' câu hỏi trong lời kể. Bạn để khách nói nhiều, giữ nhé.']);
  var neu = bd(txt);
  if (/neu .{0,40}(duoc|yen tam|khoe|nhe)/.test(neu) && /neu .{0,30}(khong|cu de|cu nhu)/.test(neu)) kq.ghiChu.push(['tot', 'Có đủ cặp câu nâng cảm xúc "Nếu được…" và "Nếu không được…" ở nan 4.']);
  var loi = kiemLoi(txt); if (loi.length) kq.ghiChu.push(['canh', 'Lời cần sửa: ' + loi.join('; ')]);
  if (r.audio && !(r.chepLoi || '').trim()) kq.ghiChu.push(['mo', 'App chưa nghe được file ghi âm. Dán bản chép lời của file vào Phần 1 (app ghi âm có chép lời, hoặc tự gõ đoạn quan trọng) để app soi đúng lời thật.']);
  kq.lech = [];
  for (var n = 1; n <= 9; n++) {
    var t = r.buoc[n];
    if (t === 'tot' && !kq.nan[n] && kq.co) kq.lech.push([n, 'Bạn chấm Tốt nhưng app chưa thấy dấu hiệu trong lời kể. Kể rõ đoạn này hơn, hoặc nhờ bạn tập cùng nghe lại.']);
    if (t === 'chua' && kq.nan[n]) kq.lech.push([n, 'Bạn chấm Chưa tốt, mà lời kể có câu hợp nan này. Có khi bạn đang khắt khe với mình, soi lại câu đó.']);
  }
  return kq;
}
function htmlDanhGia(r) {
  var kq = danhGia(r);
  var h = '<h3>Phần 3 · App đánh giá</h3>';
  if (!kq.co) return h + '<div class="the mo">Chưa có lời kể, đoạn chat hay bản chép lời để app soi. Bấm Sửa, thêm vào Phần 1 nhé.</div>';
  h += '<div class="the"><div class="hang" style="align-items:center"><div class="diem-ap"><b>' + kq.thay + '</b>/9</div><div style="flex:1">nan có dấu hiệu trong lời kể · ' + kq.hoi + ' câu hỏi · ' + kq.soCau + ' câu</div></div>';
  h += '<div class="ds" style="margin-top:8px">' + NAN.map(function (b) { var x = kq.nan[b.n]; return '<div class="muc" style="padding:8px 0"><span class="so' + (b.guong.do ? ' do' : '') + '">' + b.n + '</span><div class="y"><div>' + esc(b.ten) + ' <span class="' + (x ? 'tot-c' : 'chua-c') + '">' + (x ? '✓ thấy' : '○ chưa thấy') + '</span></div>' + (x && x.i < 999 ? '<div class="mo">“' + esc(x.cau.slice(0, 140)) + '”</div>' : '') + '</div></div>'; }).join('') + '</div></div>';
  kq.ghiChu.forEach(function (g) { h += '<div class="' + (g[0] === 'tot' ? 'on-ok' : g[0] === 'canh' ? 'canh' : 'the mo') + '">' + esc(g[1]) + '</div>'; });
  if (kq.lech.length) h += '<div class="the"><b>So với bạn tự đánh giá</b><ul>' + kq.lech.map(function (x) { return '<li>Nan ' + x[0] + ': ' + esc(x[1]) + '</li>'; }).join('') + '</ul></div>';
  h += '<p class="mo">App soi bằng từ khoá, chỉ là gợi ý.</p><button class="chip" onclick="chep(yeuCauAIReview(\'' + r.id + '\'))">Sao chép yêu cầu nhờ trợ lý AI đánh giá</button>';
  return h;
}
function yeuCauAIReview(id) {
  var r = S.review.filter(function (x) { return x.id === id; })[0];
  return 'Tôi là cộng tác viên Siêu thị Vietwise, đang tập phương pháp Quạt Thần (Action Selling 9 bước: 1 Mục tiêu cam kết, 2 Kết nối, 3 Đặt câu hỏi hay, 4 Thống nhất nhu cầu và nâng cảm xúc, 5 Giới thiệu thương hiệu, 6 Giới thiệu sản phẩm theo TFBR, 7 Chốt, 8 Sau mua, 9 Review). Dưới đây là lời kể, đoạn chat hoặc bản chép lời một buổi tư vấn khách. Hãy chấm từng bước (làm tốt, chưa tốt, bỏ qua), trích câu làm bằng chứng, chỉ ra chỗ nhảy bước, chỉ ra lời hứa công dụng hay lời ép mua nếu có, và viết lại 3 câu tôi nên nói khác đi. Không bịa thêm lời khách.\n\n---\n' + nguonReview(r) + (r.nguyenVan ? '\nKhách nói nguyên văn: ' + r.nguyenVan : '');
}

// ---------- Phần 3 · Kịch bản đóng kịch ----------
var KHACH_DAP = {
  1: '(Khách chưa xuất hiện. Người bán nói to mục tiêu cam kết của buổi này cho cả nhóm nghe.)',
  2: 'Ừ chào em. Dạo này chị cũng bận lắm.',
  3: 'Thì chị cũng lo chuyện ăn uống của mấy đứa nhỏ, mà không biết bắt đầu từ đâu.',
  4: 'Ừ, đúng là chị mong vậy.',
  5: 'Vậy à, người ta dùng thấy sao em?',
  6: 'Nghe cũng hay, mà có đắt không em?',
  7: 'Để chị suy nghĩ thêm nha.',
  8: '(Ngày 5 sau mua) Chị dùng rồi, cũng được em.',
  9: '(Hết cảnh. Cả nhóm cùng review.)'
};
function kichBan(r) {
  if (r.kichBan) return r.kichBan;
  var kq = danhGia(r), k = khach(r.khach), dien = bd(r.dienLai);
  return NAN.map(function (b) {
    var x = kq.nan[b.n], tot = r.buoc[b.n] === 'tot' && x && x.i < 999;
    var g = k ? (k.goi || 'chị').trim() : 'chị', tuPhieu = '';
    if (k) {
      if (b.n === 1 && k.mucTieu) tuPhieu = '(Nói với nhóm) Mục tiêu cam kết của em: ' + k.mucTieu;
      if (b.n === 2 && k.ketNoi) tuPhieu = k.ketNoi;
      if (b.n === 3 && k.hoiThem) tuPhieu = k.hoiThem;
      if (b.n === 4 && (k.nhuCau || []).length) tuPhieu = 'Vậy điều ' + g + ' mong nhất là ' + k.nhuCau[0].replace(/\.$/, '') + ', đúng không ' + g + '?';
      if (b.n === 5 && k.thuongHieu) tuPhieu = k.thuongHieu;
      if (b.n === 6 && (k.tfbr || []).length) tuPhieu = tfbrCau(k.tfbr[k.tfbr.length - 1]);
    }
    var ban = tot ? x.cau : tuPhieu || (b.mau && b.mau[0]) || '';
    if (b.n === 9) ban = 'Mình phát huy: ' + (r.phatHuy || '…') + '. Lần sau mình làm khác: ' + (r.khacPhuc || '…') + '.';
    var khachNoi = KHACH_DAP[b.n];
    if (b.n === 3 && r.nguyenVan) khachNoi = r.nguyenVan;
    if (b.n === 7 && r.ketQua === 'mua') khachNoi = 'Ừ, vậy em giao cho chị nha.';
    var ky = r.buoc[b.n] === 'chua' || r.buoc[b.n] === 'bo' || (dien && bd(b.ten).split(' ').some(function (w) { return w.length > 3 && dien.indexOf(w) >= 0; }));
    return { n: b.n, tieu: 'Nan ' + b.n + ' · ' + b.ten, ban: ban, khach: khachNoi, quan: b.thu, ky: !!ky, that: tot, phieu: !tot && !!tuPhieu };
  });
}
function htmlKichBan(r) {
  var kb = kichBan(r), k = khach(r.khach);
  var h = '<h3>Kịch bản mô phỏng luyện lại ca này</h3>' + boiCanhCa(r) + '<p class="mo">Ba vai: <b>Người bán</b> (bạn), <b>Khách</b> (bạn trong team đóng ' + esc(k ? (k.goi || 'chị') + ' ' + (k.ten || '') : 'khách') + '), <b>Người quan sát</b> (đọc câu soi). Câu ★ cần tập kỹ.</p>';
  h += kb.map(function (c) { return '<div class="the canh-kb' + (c.ky ? ' ky' : '') + '"><b>' + (c.ky ? '★ ' : '') + esc(c.tieu) + '</b>' + (c.that ? ' <span class="tot-c">lời thật</span>' : c.phieu ? ' <span class="tot-c">từ phiếu</span>' : '') + '<div class="vai"><i>Người bán</i>' + esc(c.ban) + '</div><div class="vai kh"><i>Khách</i>' + esc(c.khach) + '</div><div class="mo">Người quan sát soi: ' + esc(c.quan) + '</div></div>'; }).join('');
  h += '<div class="hang"><a class="nut" href="#review/tap/' + r.id + '">▶ Tập nói lại từng bước</a><button class="nut phu" onclick="chep(chuKichBan(\'' + r.id + '\'))">Sao chép kịch bản cho team</button></div>';
  return h + htmlLuyen(r);
}
function chuKichBan(id) {
  var r = S.review.filter(function (x) { return x.id === id; })[0];
  return 'KỊCH BẢN ĐÓNG KỊCH QUẠT THẦN · ' + vn(r.ngay) + '\nVai: Người bán · Khách · Người quan sát. Đoạn ★ cần tập kỹ.\n\n' + kichBan(r).map(function (c) { return (c.ky ? '★ ' : '') + c.tieu + '\nNgười bán: ' + c.ban + '\nKhách: ' + c.khach + '\nQuan sát: ' + c.quan; }).join('\n\n');
}

// ---------- Tập nói từng bước (dùng chung cho review và bắt chuyện) ----------
var TAP = null, TAP_REC = null;
function batDauTap(ds, ve, ten, khoa) { TAP = { ds: ds, b: 0, ve: ve, ten: ten, khoa: khoa, au: {}, xong: {} }; }
function tapThu() {
  if (TAP_REC) { TAP_REC.stop(); return; }
  if (!navigator.mediaDevices || !window.MediaRecorder) { toast('Máy này chưa thu âm trong app được. Bạn cứ nói to thành tiếng rồi bấm Nói trôi rồi.'); return; }
  navigator.mediaDevices.getUserMedia({ audio: true }).then(function (st) {
    var phan = [], r = new MediaRecorder(st), b = TAP.b; TAP_REC = r;
    r.ondataavailable = function (e) { if (e.data.size) phan.push(e.data); };
    r.onstop = function () { st.getTracks().forEach(function (t) { t.stop(); }); TAP_REC = null; if (TAP.au[b]) URL.revokeObjectURL(TAP.au[b]); TAP.au[b] = URL.createObjectURL(new Blob(phan, { type: r.mimeType || 'audio/webm' })); render(); };
    r.start(); render();
  }).catch(function () { toast('Chưa được phép dùng micro'); });
}
function tapBuoc(d) { if (TAP_REC) { toast('Dừng thu trước nhé'); return; } if (d > 0) TAP.xong[TAP.b] = 1; TAP.b = Math.max(0, Math.min(TAP.ds.length, TAP.b + d)); render(); window.scrollTo(0, 0); }
function suaCauTap(v) { TAP.ds[TAP.b].ban = v; }
function htmlTap() {
  if (!TAP) return '<p><a href="#review">‹ Review</a></p><div class="the mo">Chưa chọn kịch bản để tập.</div>';
  var h = '<p><a href="' + TAP.ve + '">‹ Quay lại</a></p><h2>Tập nói · ' + esc(TAP.ten) + '</h2>';
  var n = TAP.ds.length, tl = Math.round(Object.keys(TAP.xong).length / n * 100);
  h += '<div class="tien"><i style="width:' + tl + '%"></i></div>';
  if (TAP.b >= n) {
    S.tap = S.tap || {}; var key = TAP.khoa + ':' + homNay(), moi = !S.tap[key];
    if (moi) { S.tap[key] = 1; save(); }
    return h + '<div class="the" style="text-align:center"><div style="font-size:42px">🪭</div><b>Bạn đã nói trọn ' + n + ' bước.</b><p class="mo">' + (moi ? '+3 CL tập luyện. ' : '') + 'Nói lại thêm một lần với bạn tập cùng, đổi vai người bán và khách, rồi mang đoạn ★ đi diễn ở buổi Action Selling trưa thứ Sáu.</p><button class="nut" onclick="TAP.b=0;TAP.xong={};render()">Tập lại từ đầu</button> <a class="nut phu" href="' + TAP.ve + '">Xong</a></div>';
  }
  var c = TAP.ds[TAP.b];
  h += '<p class="mo">Bước ' + (TAP.b + 1) + '/' + n + '. Đọc câu một lần, rồi nói thành tiếng bằng lời của mình, không cần thuộc từng chữ.</p>';
  h += '<div class="the canh-kb' + (c.ky ? ' ky' : '') + '"><b>' + (c.ky ? '★ ' : '') + esc(c.tieu) + '</b><div class="vai"><i>Bạn nói</i><textarea rows="3" oninput="suaCauTap(this.value)">' + esc(c.ban) + '</textarea></div><div class="vai kh"><i>Khách đáp</i>' + esc(c.khach) + '</div>' + (c.quan ? '<div class="mo">Tự soi: ' + esc(c.quan) + '</div>' : '') + '</div>';
  h += '<div class="hang"><button class="nut ' + (TAP_REC ? '' : 'phu ') + '" onclick="tapThu()">' + (TAP_REC ? '■ Dừng thu' : '● Nói thử và thu lại') + '</button></div>';
  if (TAP_REC) h += '<p class="thieu">Đang thu… nói câu của bạn rồi bấm Dừng thu.</p>';
  if (TAP.au[TAP.b]) h += '<p class="mo" style="margin:6px 0 2px">Nghe lại giọng mình:</p><audio controls src="' + TAP.au[TAP.b] + '"></audio>';
  h += '<div class="hang" style="margin-top:10px">' + (TAP.b ? '<button class="nut phu nho" onclick="tapBuoc(-1)">‹ Bước trước</button>' : '') + '<button class="nut xanh" style="flex:1" onclick="tapBuoc(1)">✓ Nói trôi rồi, sang bước tiếp</button></div>';
  h += '<p class="mo">Bản thu khi tập chỉ để nghe lại ngay, đóng trang là mất, không lưu và không gửi đi đâu.</p>';
  return h;
}

// ---------- Chuẩn bị · Chân dung khách và kịch bản bắt chuyện ----------
var NET = [
  { id: 'con', ten: 'Đang nuôi con nhỏ', re: /\bbe\b|con (trai|gai|nho|lon)|\d+ tuoi|an dam|mam non|di hoc|lop \d|nuoi con|hai be|ba be/, mo: ['Em thấy chị hay chia sẻ chuyện các bé, nhìn vui ghê. Bé nhà mình năm nay mấy tuổi rồi chị?', 'Em cũng đang nuôi con nhỏ nên đọc bài chị thấy gần lắm.'], hoi: 'Bữa ăn của các bé hằng ngày, chị lo nhất khâu nào ạ?' },
  { id: 'bau', ten: 'Đang mang thai hoặc mới sinh', re: /\bbau\b|mang thai|sap sinh|bim sua|me bau|moi sinh|o cu/, mo: ['Em thấy chị sắp đón bé, chúc mừng chị nha. Dạo này chị thấy trong người sao rồi?', 'Hồi em mang bầu cũng hay đọc mấy bài như chị chia sẻ.'], hoi: 'Giai đoạn này chị đang chú ý nhất chuyện ăn uống gì ạ?' },
  { id: 'bep', ten: 'Thích nấu ăn, lo bữa cơm gia đình', re: /\bnau\b|mon an|\bbep\b|bua (sang|com|toi)|an sang|lam banh|cong thuc/, mo: ['Em xem mấy món chị nấu mà thèm, chị hay tự đi chợ không ạ?', 'Món chị đăng hôm trước nhìn ngon quá, chị chỉ em với.'], hoi: 'Đi chợ nấu ăn, chị hay băn khoăn nhất điều gì ạ?' },
  { id: 'xanh', ten: 'Quan tâm sống xanh, thuận tự nhiên', re: /song xanh|huu co|organic|tu nhien|rau sach|thuan tu nhien|it rac|khong hoa chat|thuc duong/, mo: ['Em thấy chị theo lối sống xanh lâu rồi, em cũng đang tập dần.', 'Chị bắt đầu sống xanh từ khi nào vậy chị?'], hoi: 'Với chị, một bữa ăn "sạch" là như thế nào ạ?' },
  { id: 'ongba', ten: 'Gắn bó, chăm cha mẹ ông bà', re: /ong ba|bo me|ba noi|ba ngoai|ong noi|ong ngoai|cha me|nguoi gia|bao hieu|song cung (bo|me)/, mo: ['Em đọc bài chị viết về ba mẹ mà xúc động. Hai bác dạo này khỏe không chị?', 'Nhà mình có ông bà ở cùng phải không chị?'], hoi: 'Bữa ăn cho ông bà, chị thường để ý điều gì ạ?' },
  { id: 'ban', ten: 'Công việc bận rộn', re: /van phong|kinh doanh|cong ty|ban ron|ca dem|cong tac|chu shop|ban hang online|tang ca|lam viec/, mo: ['Em thấy chị làm việc nhiều mà vẫn lo cho nhà chu đáo, chị sắp xếp sao hay vậy?', 'Ngày thường chị về nhà tầm mấy giờ ạ?'], hoi: 'Những hôm bận, bữa cơm nhà mình thường xoay xở thế nào ạ?' },
  { id: 'van', ten: 'Thích vận động, thể thao', re: /\bgym\b|chay bo|yoga|the thao|dap xe|\bboi\b|marathon|tap luyen/, mo: ['Em thấy chị chạy bộ đều quá, chị tập lâu chưa?', 'Chị giữ được nhịp tập hay ghê, có bí quyết gì không chị?'], hoi: 'Ngoài tập luyện, chị chăm ăn uống ra sao ạ?' },
  { id: 'dep', ten: 'Quan tâm làm đẹp, chăm da', re: /\bda\b|lam dep|skincare|my pham|cham soc da|\btoc\b|spa/, mo: ['Em thấy chị chăm da kỹ ghê, chị đang dùng cách nào vậy?', 'Da chị đẹp thật, chị giữ nếp chăm từ hồi nào ạ?'], hoi: 'Chị đang hài lòng nhất và muốn tốt hơn ở điểm nào ạ?' },
  { id: 'di', ten: 'Thích đi đây đi đó', re: /du lich|chuyen di|\bphuot\b|check in|cam trai|di bien/, mo: ['Chuyến đi gần đây của chị đẹp quá, chị đi đâu vậy?', 'Em thấy nhà mình hay đi chơi cuối tuần, vui ghê.'], hoi: 'Đi xa thì chuyện ăn uống của nhà mình chị chuẩn bị thế nào ạ?' },
  { id: 'tinh', ten: 'Quan tâm đời sống tinh thần, đọc sách', re: /\bthien\b|\bchua\b|tam linh|doc sach|cuon sach|phat phap|bi an|binh an|biet on/, mo: ['Em thích mấy câu chị chia sẻ về bình an, chị đang đọc sách gì vậy?', 'Đọc bài chị em thấy nhẹ lòng ghê.'], hoi: 'Với chị, một ngày bình an là ngày như thế nào ạ?' },
  { id: 'vuon', ten: 'Thích trồng cây, làm vườn', re: /trong rau|\bvuon\b|cay canh|lam vuon|ban cong|trong cay/, mo: ['Vườn rau nhà chị xanh quá, chị tự trồng hết hả chị?', 'Em thấy chị trồng cây khéo ghê, chị trồng lâu chưa?'], hoi: 'Rau nhà trồng không đủ thì chị thường mua ở đâu ạ?' },
  { id: 'cung', ten: 'Đang ở trong cùng nhóm, cộng đồng với bạn', re: /cung nhom|nhom zalo|nhom facebook|cung lop|hoi phu huynh|cong dong|cung khu/, mo: ['Em với chị cùng nhóm mà giờ mới có dịp nói chuyện.', 'Em hay đọc bình luận của chị trong nhóm, thấy chị nhiệt tình lắm.'], hoi: 'Chị vào nhóm này lâu chưa, chị thích nhóm ở điểm nào ạ?' }
];
function chanDung(k) {
  var txt = [k.tinCongKhai, k.hoiThem].filter(Boolean).join('\n'), cau = tachCau(txt), r = [];
  NET.forEach(function (n) { var c = cau.filter(function (x) { return n.re.test(bd(x)); })[0]; if (c) r.push({ n: n, cau: c }); });
  return r;
}
function batChuyen(k) {
  var cd = chanDung(k), g = (k.goi || 'chị').trim(), me = S.me.ten || 'em', a = cd[0], b = cd[1] || cd[0];
  var kw = cauTuKhoa(k);
  var chao = 'Dạ em chào ' + g + ', em là ' + me + (S.me.chuyen ? '. ' + S.me.chuyen.split(/[.!\n]/)[0].trim() + '.' : ', em làm cùng Siêu thị Vietwise.');
  return [
    { tieu: '1 · Chào và tìm điểm chung (nan 2)', ban: chao + ' ' + (kw[0] ? kw[0].t : a ? a.n.mo[0] : 'Dạo này nhà mình thế nào rồi ' + g + '?'), khach: a ? 'Ừ, ' + a.n.ten.toLowerCase().replace(/^đang /, '') + ' nên cũng nhiều chuyện lắm em.' : 'Ừ chào em, cũng bình thường em.', quan: 'Câu mở có thật, có điểm chung, chưa nhắc sản phẩm.' },
    { tieu: '2 · Hỏi mở về điều khách chia sẻ (nan 3)', ban: kw[1] ? kw[1].t : b ? b.n.hoi.replace(/\bchị\b/g, g) : 'Điều gì làm ' + g + ' lo nhất khi mua đồ cho nhà mình ạ?', khach: 'Thì cũng lo, mà bận quá nên chưa tìm hiểu kỹ.', quan: 'Hỏi rồi im lặng nghe, không chen giới thiệu.' + (kw[1] ? ' Nhắc lại đúng chữ của khách, không đổi sang chữ của mình.' : '') },
    { tieu: '3 · Hỏi nối, lắng nghe và xin phép bước tiếp (nan 3 sang nan 1)', ban: (kw[2] ? kw[2].t : g.charAt(0).toUpperCase() + g.slice(1) + ' kể thêm cho em được không?') + ' ... Em nghe ' + g + ' nói vậy em hiểu hơn nhiều. ' + 'Nếu ' + g + ' thấy tiện, em xin gửi ' + g + ' bộ câu hỏi hồ sơ gia đình để em hiểu nhà mình rõ hơn nha.', khach: 'Ừ, em gửi chị xem thử.', quan: 'Có hỏi nối ít nhất một lần, lời xin phép để khách tự chọn.' + (k.mucTieu ? ' Mục tiêu cam kết của bạn: ' + k.mucTieu : '') }
  ];
}
function htmlChanDung(k) {
  var cd = chanDung(k), id = k.id;
  var h = '<h3 style="margin-top:16px">Chân dung khách</h3>';
  var tk = htmlTuKhoa(k), kw = cauTuKhoa(k);
  if (!(k.tinCongKhai || '').trim() && !kw.length) return tk + h + '<p class="mo">Ghi điều bạn đọc được ở ô trên, app lọc ra chân dung.</p>';
  h = tk + h;
  h += cd.length ? '<div class="the ds" style="padding:0">' + cd.map(function (x) { return '<div class="muc"><span class="so">✦</span><div class="y"><div><b>' + esc(x.n.ten) + '</b></div><div class="mo">Từ: “' + esc(x.cau.slice(0, 120)) + '”</div></div></div>'; }).join('') + '</div>' : '<div class="the mo">App chưa nhận ra nét nào. Ghi rõ hơn về gia đình, công việc, sở thích khách chia sẻ.</div>';
  if (cd.length || kw.length) h += '<h3>Cách bắt chuyện từ những thông tin này</h3>';
  if (kw.length) h += '<p class="mo" style="margin:0 0 4px"><b>Dùng chữ của khách</b></p>' + kw.map(function (m) { return '<div class="soan tk-soan">' + esc(m.t) + '<div class="hang" style="margin-top:6px"><button class="chip" onclick="chep(this.parentNode.parentNode.firstChild.textContent)">Sao chép</button></div></div>'; }).join('');
  if (cd.length) {
    cd.slice(0, 2).forEach(function (x) { x.n.mo.concat([x.n.hoi]).forEach(function (m) { h += '<div class="soan">' + esc(m.replace(/\bchị\b/g, (k.goi || 'chị').trim())) + '<div class="hang" style="margin-top:6px"><button class="chip" onclick="chep(this.parentNode.parentNode.firstChild.textContent)">Sao chép</button></div></div>'; }); });
  }
  h += htmlXau(k);
  h += '<p class="mo">Chân dung chỉ là điểm bắt đầu để hỏi, không phải kết luận về khách. Điều khách tự nói trong buổi gặp luôn đúng hơn điều mình đọc được.</p>';
  return h;
}
function chuBatChuyen(id) { var k = khach(id); return 'KỊCH BẢN BẮT CHUYỆN 1-2-3 (XÂU CHUỖI TỪ KHOÁ)\n\n' + dsXau(k).map(function (c) { return c.tieu + '\nNgười bán: ' + c.ban + '\nKhách: ' + c.khach + '\nSoi: ' + c.quan; }).join('\n\n'); }
function tapBatChuyen(id) { var k = khach(id); batDauTap(dsXau(k), '#khach/' + id + '/0', 'Bắt chuyện ' + (k.ten || ''), 'bc:' + id); go('tap-noi'); }

// ---------- Từ khoá của khách: dùng đúng ngôn ngữ của khách ----------
var TK = { au: '', auTen: '', chep: '', web: '', goiY: [], nguon: '' };
var TU_DUNG = ('va la cua cho co khong thi ma mot nhung cac duoc voi nay do em chi anh minh toi ban nha roi cung nhu de khi ve ra vao len xuong lai nua rat qua lam hon nhat se da dang van con cai con nguoi ai gi nao sao the vay day kia o tai tu den trong ngoai tren duoi sau truoc nen vi neu hay hoac nhieu it moi tung ca hai ba bon nam sau bay tam chin muoi ngay hom nay mai qua oi a nhe nha ha ah uh u ok vang da thoi chu ma phai biet thay noi lam di lay muon can co the').split(' ');
var SUC_KHOE = /benh|ung thu|tieu duong|huyet ap|mo mau|gout|da day|\btri\b|vo sinh|tram cam|thuoc(?! tru sau| bao ve thuc vat)|dieu tri|nhap vien|benh vien|khoi u|viem/;
function lumTuKhoa(t) {
  var src = String(t || ''), dem = {}, giu = {};
  (src.match(/[“"«]([^”"»]{3,40})[”"»]/g) || []).forEach(function (q) { var x = q.replace(/[“”"«»]/g, '').trim(); giu[x] = 9; });
  (src.match(/#[\wÀ-ỹ]{3,30}/g) || []).forEach(function (h) { var x = h.slice(1).replace(/([a-zà-ỹ])([A-ZÀ-Ỹ])/g, '$1 $2').toLowerCase(); giu[x] = 7; });
  tachCau(src).forEach(function (c) {
    var am = c.split(/[^0-9A-Za-zÀ-ỹ]+/).filter(Boolean), b = am.map(bd);
    for (var n = 2; n <= 3; n++) for (var i = 0; i + n <= am.length; i++) {
      var p = b.slice(i, i + n); if (p.some(function (x) { return TU_DUNG.indexOf(x) >= 0; }) || p.some(function (x) { return x.length < 2 || /^\d+$/.test(x); })) continue;
      var tu = am.slice(i, i + n).join(' ').toLowerCase(); dem[tu] = (dem[tu] || 0) + (n === 3 ? 1.2 : 1);
    }
  });
  tuDien(src).forEach(function (x) { giu[x] = Math.max(giu[x] || 0, 8); });
  var r = Object.keys(giu).map(function (x) { return [x, giu[x]]; }).concat(Object.keys(dem).map(function (x) { return [x, dem[x]]; }));
  r.sort(function (a, b) { return b[1] - a[1] || b[0].length - a[0].length; });
  var ra = [];
  r.forEach(function (x) { var t = x[0]; if (ra.length >= 14) return; if (ra.some(function (y) { return y.indexOf(t) >= 0 || t.indexOf(y) >= 0; })) return; ra.push(t); });
  return ra;
}
function tuKhoa(k) { return (k.tuKhoa || []).map(function (x) { return x.t; }); }
function themTuKhoa(id, t, nguon) {
  var k = khach(id); t = String(t || '').trim().replace(/\s+/g, ' '); if (!t) return;
  k.tuKhoa = k.tuKhoa || []; if (k.tuKhoa.some(function (x) { return bd(x.t) === bd(t); })) { toast('Đã có từ này'); return; }
  k.tuKhoa.push({ t: t, nguon: nguon || 'tay', ngay: homNay() }); TK.goiY = TK.goiY.filter(function (x) { return x !== t; }); save(); render();
}
function boTuKhoa(id, i) { var k = khach(id); k.tuKhoa.splice(i, 1); save(); render(); }
function tkAudio(f) { if (!f) return; if (TK.au) URL.revokeObjectURL(TK.au); TK.au = URL.createObjectURL(f); TK.auTen = f.name; render(); }
function tkLum(nguon) { var t = nguon === 'audio' ? TK.chep : TK.web; if (!t.trim()) { toast(nguon === 'audio' ? 'Dán bản chép lời trước nhé' : 'Dán đoạn chữ từ trang của khách trước nhé'); return; } TK.nguon = nguon; TK.goiY = lumTuKhoa(t); if (!TK.goiY.length) toast('Chưa lượm được từ nào, thử dán đoạn dài hơn'); render(); }
function htmlTuKhoa(k) {
  var id = k.id, ds = k.tuKhoa || [], NG = { audio: '🎧', web: '🌐', tay: '✍' };
  var h = '<h3 style="margin-top:16px">Từ khoá của khách</h3><p class="mo">Dùng lại đúng chữ của khách để khách thấy mình được nghe.</p>';
  h += ds.length ? '<div class="tk-ds">' + ds.map(function (x, i) { var sk = SUC_KHOE.test(bd(x.t)); return '<span class="tk' + (sk ? ' sk' : '') + '">' + NG[x.nguon || 'tay'] + ' ' + esc(x.t) + '<button onclick="boTuKhoa(\'' + id + '\',' + i + ')" aria-label="Bỏ">×</button></span>'; }).join('') + '</div>' : '';
  if (ds.some(function (x) { return SUC_KHOE.test(bd(x.t)); })) h += '<div class="canh">Từ có viền đỏ là chuyện sức khỏe. App không đưa từ này vào câu bắt chuyện. Chỉ nhắc khi chính khách đã kể với bạn, và không hứa sản phẩm chữa được.</div>';
  h += '<details class="the tk-cach"><summary><b>① Từ file ghi âm</b> <span class="mo">nghe lại cuộc gọi, buổi gặp, video của khách</span></summary><div class="trong"><label class="nut phu nho" style="margin:0">Chọn file âm thanh<input type="file" accept="audio/*,video/*" class="an" onchange="tkAudio(this.files[0])"></label>' + (TK.au ? '<audio controls src="' + TK.au + '" style="width:100%;margin-top:6px"></audio><div class="mo">' + esc(TK.auTen) + ' · chỉ mở để nghe, không lưu vào app</div>' : '') + '<label>Bản chép lời (nếu có)</label><textarea rows="3" oninput="TK.chep=this.value" placeholder="Dán bản chép lời từ app ghi âm…">' + esc(TK.chep) + '</textarea><button class="nut nho" onclick="tkLum(\'audio\')">Lượm từ khoá</button><p class="mo">Không có bản chép lời thì vừa nghe vừa ghi ở cách ③.</p></div></details>';
  h += '<details class="the tk-cach"><summary><b>② Từ trang của khách</b> <span class="mo">web, Facebook, TikTok công khai</span></summary><div class="trong"><textarea rows="3" oninput="TK.web=this.value" placeholder="Mở trang của khách, chép vài bài khách tự viết rồi dán vào đây…">' + esc(TK.web) + '</textarea><div class="hang"><button class="nut nho" onclick="tkLum(\'web\')">Lượm từ khoá</button>' + ((k.tinCongKhai || '').trim() ? '<button class="nut phu nho" onclick="TK.web=khach(\'' + id + '\').tinCongKhai;tkLum(\'web\')">Lượm từ “Điều bạn đọc được”</button>' : '') + '</div></div></details>';
  h += '<details class="the tk-cach"' + (TK.au ? ' open' : '') + '><summary><b>③ Tự nghe, nhập tay</b> <span class="mo">chữ khách nói đi nói lại</span></summary><div class="trong"><div class="hang"><input id="tk-tay" placeholder="Ví dụ: bữa cơm yên tâm" style="flex:1;margin:0" onkeydown="if(event.key===\'Enter\'){themTuKhoa(\'' + id + '\',this.value,TK.au?\'audio\':\'tay\')}"><button class="nut nho" onclick="themTuKhoa(\'' + id + '\',document.getElementById(\'tk-tay\').value,TK.au?\'audio\':\'tay\')">Thêm</button></div></div></details>';
  if (TK.goiY.length) h += '<div class="the"><b>App lượm được</b><p class="mo" style="margin:2px 0 6px">Chạm để giữ những chữ đúng là của khách, bỏ qua chữ chung chung.</p>' + TK.goiY.map(function (t) { return '<button class="chip" onclick="themTuKhoa(\'' + id + '\',\'' + esc(t).replace(/'/g, '&#39;') + '\',TK.nguon)">+ ' + esc(t) + '</button>'; }).join('') + '</div>';
  return h;
}
// Câu bắt chuyện lồng từ của khách: mỗi câu tối đa một từ, nhắc lại đúng chữ khách dùng.
function cauTuKhoa(k) {
  var g = (k.goi || 'chị').trim(), G = g.charAt(0).toUpperCase() + g.slice(1), ds = (k.tuKhoa || []).filter(function (x) { return !SUC_KHOE.test(bd(x.t)); });
  if (!ds.length) return [];
  var a = ds[0], b = ds[1] || ds[0], c = ds[2];
  var r = [
    { loai: 'mo', t: a.nguon === 'audio' ? 'Hôm trước nghe ' + g + ' nhắc chuyện ' + a.t + ', em cứ nhớ hoài.' : 'Em đọc mấy chia sẻ của ' + g + ' về ' + a.t + ', thấy gần với nhà em lắm.' },
    { loai: 'hoi', t: G + ' hay nhắc tới ' + b.t + ', với ' + g + ' thì ' + b.t + ' là như thế nào ạ?' }
  ];
  if (c) r.push({ loai: 'noi', t: 'Chuyện ' + c.t + ' này ' + g + ' để ý từ khi nào vậy ạ?' });
  else r.push({ loai: 'noi', t: G + ' kể thêm cho em về ' + a.t + ' được không ạ?' });
  return r;
}


// ---------- Mô phỏng bắt chuyện 1-2-3: xâu chuỗi từ khoá qua từng câu hỏi đáp ----------
var TU_DIEN = ['thuốc trừ sâu', 'hoá chất', 'hóa chất', 'chất bảo quản', 'không yên tâm', 'yên tâm', 'an tâm', 'nhẹ đầu', 'nhẹ lòng', 'mất thời gian', 'tiết kiệm', 'ăn dặm', 'bữa cơm', 'bữa sáng', 'bữa tối', 'rau sạch', 'đồ sạch', 'ăn sạch', 'sống xanh', 'nguồn gốc', 'hàng giả', 'hàng thật', 'đề kháng', 'biếng ăn', 'kén ăn', 'đi chợ', 'rửa rau', 'ngâm rau', 'chơi với con', 'cả nhà', 'ông bà', 'tiền chợ', 'chi tiêu', 'tốt cho con', 'an toàn', 'ăn vặt', 'bánh kẹo', 'nước ngọt', 'đồ chiên', 'ngủ ngon', 'giữ dáng', 'mệt mỏi', 'bận rộn', 'nấu ăn', 'tươi ngon', 'tự nhiên', 'thuận tự nhiên', 'đồ ăn sẵn', 'giao tận nhà', 'thời gian'];
function tuDien(t) {
  var src = String(t || '').toLowerCase(), r = [];
  TU_DIEN.slice().sort(function (a, b) { return b.length - a.length; }).forEach(function (w) { if (src.indexOf(w) >= 0 && !r.some(function (y) { return y.indexOf(w) >= 0; })) r.push(w); });
  return r.sort(function (a, b) { return src.indexOf(a) - src.indexOf(b); });
}
var CUE = /(?:lo nhất là|lo nhất|lo là|sợ nhất là|sợ nhất|sợ|mong nhất là|mong|muốn|ngại|thích|cần|thấy)\s+(.+)/i;
function tuCue(dap) {
  var r = [];
  String(dap || '').split(/[,.;!?…]|\s(?:mà|nhưng|nên|vì|thì|và|với|để|chứ)\s/i).forEach(function (c) {
    var m = c.match(CUE); if (!m) return;
    var am = m[1].trim().split(/\s+/).filter(function (w) { return !/^(là|cái|những|mấy|cũng|rất|quá|lắm|nhất)$/i.test(w); });
    var p = am.slice(0, 3).join(' ').toLowerCase(); if (p.split(' ').length >= 2 && !SUC_KHOE.test(bd(p))) r.push(p);
  });
  return r;
}
var TICH_CUC = /yen tam|an tam|nhe dau|nhe long|\bvui\b|mung|khoe|ngu ngon|tiet kiem|choi voi con|tuoi ngon|an toan|\bsach\b|nang luong|thoai mai|hanh phuc/;
var TU_CAM_XUC = /\b(lo|so|ngai|met|ban|mong|muon|can|thich|yeu|ghet|kho|de|yen tam|an toan|sach|khoe|vui|buon|tiec|tiet kiem|tien|thoi gian|con|be|me|ba|nha|bua|com|an)\b/;
function chonTuDap(dap) {
  var ung = [];
  tuDien(dap).concat(tuCue(dap), lumTuKhoa(dap)).forEach(function (w) { if (!ung.some(function (y) { return y.indexOf(w) >= 0 || w.indexOf(y) >= 0; })) ung.push(w); });
  if (!ung.length) { var am = String(dap || '').replace(/[.?!…,]+$/, '').trim().split(/\s+/); if (am.length >= 2 && am.length <= 6) ung = [am.join(' ').toLowerCase()]; }
  return ung.filter(function (x) { return !SUC_KHOE.test(bd(x)); }).slice(0, 5);
}
var MAU_XAU = [
  function (w, g, G) { return 'Dạ, ' + g + ' nói ' + w + ', với ' + g + ' thì ' + w + ' là như thế nào ạ?'; },
  function (w, g, G) { return G + ' kể thêm cho em về chuyện ' + w + ' được không ạ? Chuyện đó bắt đầu từ khi nào ' + g + '?'; },
  function (w, g, G) { return 'Chuyện ' + w + ' ảnh hưởng tới nhà mình thế nào ạ?'; },
  function (w, g, G, tot) { return (tot ? 'Nếu ngày nào nhà mình cũng ' + w + ' được như vậy, ' : 'Nếu không còn phải lo chuyện ' + w + ' nữa, ') + g + ' thấy thế nào ạ? ... Còn nếu cứ để như bây giờ thì sao ạ?'; },
  function (w, g, G, tot) { return 'Vậy điều ' + g + ' mong nhất là ' + (tot ? '' : 'không còn phải lo chuyện ') + w + ', đúng không ' + g + '?'; }
];
var SO_LUOT = MAU_XAU.length;
function cauDauXau(k) {
  var kw = cauTuKhoa(k), cd = chanDung(k), g = (k.goi || 'chị').trim();
  if (kw[1]) return kw[1].t;
  if (cd[0]) return cd[0].n.hoi.replace(/\bchị\b/g, g);
  return 'Điều gì làm ' + g + ' lo nhất khi lo bữa ăn cho nhà mình ạ?';
}
function cauMoXau(k) {
  var kw = cauTuKhoa(k), cd = chanDung(k), g = (k.goi || 'chị').trim(), me = S.me.ten || 'em';
  return 'Dạ em chào ' + g + ', em là ' + me + (S.me.chuyen ? '. ' + S.me.chuyen.split(/[.!\n]/)[0].trim() + '.' : ', em làm cùng Siêu thị Vietwise.') + ' ' + (kw[0] ? kw[0].t : cd[0] ? cd[0].n.mo[0].replace(/\bchị\b/g, g) : 'Dạo này nhà mình thế nào rồi ' + g + '?');
}
function hoiTiep(k, luot) {
  var g = (k.goi || 'chị').trim(), G = g.charAt(0).toUpperCase() + g.slice(1), n = luot.length;
  if (!n) return cauDauXau(k);
  var cuoi = luot[n - 1], w = cuoi.ung[cuoi.chon || 0];
  if (!w) return G + ' kể thêm cho em được không ạ?';
  return MAU_XAU[Math.min(n - 1, SO_LUOT - 1)](w, g, G, TICH_CUC.test(bd(w)));
}
function xau(k) { k.xau = k.xau || { luot: [] }; return k.xau; }
function xauTraLoi(id) {
  var k = khach(id), x = xau(k), e = document.getElementById('xau-dap'), dap = e ? e.value.trim() : '';
  if (!dap) { toast('Gõ câu khách trả lời trước nhé'); return; }
  x.luot.push({ hoi: hoiTiep(k, x.luot), dap: dap, ung: chonTuDap(dap), chon: 0 }); save(); render();
  setTimeout(function () { var f = document.getElementById('xau-dap'); if (f) f.focus(); }, 50);
}
function xauChon(id, i, j) { var x = xau(khach(id)); x.luot[i].chon = j; x.luot = x.luot.slice(0, i + 1); save(); render(); }
function xauLai(id) { khach(id).xau = { luot: [] }; save(); render(); }
function xauLuuTu(id) { var k = khach(id), them = 0; xau(k).luot.forEach(function (l) { var w = l.ung[l.chon || 0]; if (w && !(k.tuKhoa || []).some(function (y) { return bd(y.t) === bd(w); })) { k.tuKhoa = k.tuKhoa || []; k.tuKhoa.push({ t: w, nguon: 'tay', ngay: homNay() }); them++; } }); save(); toast(them ? 'Đã thêm ' + them + ' từ khoá vào phiếu' : 'Các từ này đã có trong phiếu'); render(); }
function dsXau(k) {
  var x = xau(k), g = (k.goi || 'chị').trim(), r = [{ tieu: '1 · Chào và tìm điểm chung', ban: cauMoXau(k), khach: '(Khách chào lại)', quan: 'Câu mở có thật, có điểm chung, chưa nhắc sản phẩm.' }];
  x.luot.forEach(function (l, i) { r.push({ tieu: '2 · Hỏi xâu chuỗi, lượt ' + (i + 1), ban: l.hoi, khach: l.dap, quan: 'Nhắc lại đúng chữ của khách: ' + (l.ung[l.chon || 0] || '…') }); });
  r.push({ tieu: '3 · Tóm lại và xin phép bước tiếp', ban: 'Em nghe ' + g + ' kể vậy em hiểu nhà mình hơn nhiều. Nếu ' + g + ' thấy tiện, em xin gửi ' + g + ' bộ câu hỏi hồ sơ gia đình để em hiểu rõ hơn nha.', khach: 'Ừ, em gửi chị xem thử.', quan: 'Lời xin phép để khách tự chọn.' + (k.mucTieu ? ' Mục tiêu cam kết của bạn: ' + k.mucTieu : '') });
  return r;
}
function htmlXau(k) {
  var id = k.id, x = xau(k), g = (k.goi || 'chị').trim(), xong = x.luot.length >= SO_LUOT;
  var h = '<h3>Mô phỏng bắt chuyện 1-2-3</h3><p class="mo">Không phải danh sách câu hỏi cố định. Bạn tập cùng đóng vai khách, trả lời tự nhiên. Bạn gõ lại câu trả lời, app lượm chữ của khách trong câu đó và mở câu hỏi tiếp theo xâu đúng chữ ấy.</p>';
  h += '<div class="the canh-kb"><b>1 · Chào và tìm điểm chung</b><div class="vai"><i>Bạn nói</i>' + esc(cauMoXau(k)) + '</div></div>';
  h += '<div class="the canh-kb"><b>2 · Hỏi xâu chuỗi từ khoá</b>';
  x.luot.forEach(function (l, i) {
    h += '<div class="vai"><i>Bạn hỏi</i>' + esc(l.hoi) + '</div><div class="vai kh"><i>Khách đáp</i>' + esc(l.dap) + '</div>';
    if (l.ung.length) h += '<div class="xau-tu"><span class="mo">Xâu tiếp bằng chữ:</span> ' + l.ung.map(function (w, j) { return '<button class="chip' + ((l.chon || 0) === j ? ' on' : '') + '" onclick="xauChon(\'' + id + '\',' + i + ',' + j + ')">' + esc(w) + '</button>'; }).join('') + '</div>';
    else h += '<div class="mo">Câu trả lời ngắn quá, app chưa lượm được chữ nào. Câu sau là câu mời khách kể thêm.</div>';
  });
  if (!xong) {
    h += '<div class="vai xau-moi"><i>Bạn hỏi' + (x.luot.length ? ' (lượt ' + (x.luot.length + 1) + '/' + SO_LUOT + ')' : '') + '</i>' + esc(hoiTiep(k, x.luot)) + '</div>';
    h += '<label>Khách trả lời (mô phỏng)</label><textarea id="xau-dap" rows="2" placeholder="Ví dụ: chị lo nhất là rau ngoài chợ xanh mướt quá, sợ thuốc"></textarea><button class="nut" onclick="xauTraLoi(\'' + id + '\')">Mở câu hỏi tiếp theo ›</button>';
  } else h += '<div class="on-ok">Xong ' + SO_LUOT + ' lượt xâu chuỗi. Khách đã tự nói ra điều ' + esc(g) + ' mong nhất, sang bước 3.</div>';
  h += '</div>';
  if (xong) h += '<div class="the canh-kb"><b>3 · Tóm lại và xin phép bước tiếp</b><div class="vai"><i>Bạn nói</i>' + esc(dsXau(k).slice(-1)[0].ban) + '</div></div>';
  h += '<div class="hang">' + (x.luot.length ? '<button class="nut phu nho" onclick="xauLuuTu(\'' + id + '\')">Lưu các chữ đã xâu vào từ khoá</button><button class="nut phu nho" onclick="tapBatChuyen(\'' + id + '\')">▶ Tập nói lại chuỗi này</button><button class="nut phu nho" onclick="chep(chuBatChuyen(\'' + id + '\'))">Sao chép</button><button class="nut phu nho" onclick="xauLai(\'' + id + '\')">Làm lại</button>' : '') + '</div>';
  h += '<p class="mo">Mẹo: hỏi xong thì im một nhịp. Nhắc lại đúng chữ khách dùng, đừng đổi sang chữ của mình. Chưa nhắc sản phẩm ở phần này.</p>';
  return h;
}

// ---------- Chứng nhận và chuyển bước ----------
function dieuKienLT() {
  var hoc = S.daHoc || {}, doc = 0; for (var i = 1; i <= 9; i++) if (hoc[i]) doc++;
  var dung = QUIZ.filter(function (q, i) { return S.quiz[i] === q.dung; }).length;
  return [['Đọc đủ 9 nan', doc, 9, '#nan/' + (doc < 9 ? (function () { for (var i = 1; i <= 9; i++) if (!hoc[i]) return i; })() : 1)], ['Đọc ví dụ trọn vẹn 9 nan', hoc.vd ? 1 : 0, 1, '#nan/vi-du'], ['Tập nhanh đúng ít nhất 7 câu', Math.min(dung, 7), 7, '#nan/tap']];
}
function dieuKienTC() {
  var gap = S.khach.filter(function (k) { return k.ketQua; }).length, chuan = S.khach.filter(function (k) { return nanXong(k, 1) && nanXong(k, 3); }).length;
  return [['Chuẩn bị phiếu có mục tiêu cam kết và hồ sơ khách', Math.min(chuan, 3), 3, '#khach/moi'], ['Gặp khách thật và ghi kết quả', Math.min(gap, 3), 3, '#khach'], ['Review buổi gặp', Math.min(S.review.length, 3), 3, '#review/moi']];
}
function datChungNhan(loai, dk) {
  S.chungNhan = S.chungNhan || {};
  var xong = dk.every(function (x) { return x[1] >= x[2]; });
  if (xong && !S.chungNhan[loai]) { S.chungNhan[loai] = homNay(); save(); }
  return xong;
}
function htmlChungNhan(loai, ten, cau, dk, sau) {
  var xong = datChungNhan(loai, dk), h = '';
  if (xong) {
    h += '<div class="chung-nhan"><div class="cn-ic">' + ART.xu() + '</div><div class="cn-nho">CHỨNG NHẬN</div><div class="cn-ten">' + esc(ten) + '</div><div class="cn-nguoi">' + esc(S.me.ten || 'Cộng tác viên') + (S.me.ma ? ' · mã ' + esc(S.me.ma) : '') + '</div><div class="cn-cau">' + esc(cau) + '</div><div class="cn-ngay">Quạt Thần Vietwise CTV · ' + vn(S.chungNhan[loai]) + '</div></div>';
  } else {
    h += '<div class="the"><b>🏅 ' + esc(ten) + '</b>' + dk.map(function (x) { var ok = x[1] >= x[2]; return '<a class="dk' + (ok ? ' ok' : '') + '" href="' + x[3] + '"><span>' + (ok ? '✓' : '○') + ' ' + esc(x[0]) + '</span><b>' + x[1] + '/' + x[2] + '</b></a><div class="tien" style="margin:2px 0 8px"><i style="width:' + Math.round(x[1] / x[2] * 100) + '%"></i></div>'; }).join('') + '</div>';
  }
  if (sau) h += '<a class="nut rong" href="' + sau[0] + '">' + esc(sau[1]) + ' ›</a>';
  return h;
}
function cuoiBuoc1() { return '<div style="margin-top:22px"></div>' + htmlChungNhan('lt', 'Đã học xong Lý thuyết Quạt Thần', 'Đã đọc đủ 9 nan, ví dụ trọn vẹn và vượt bài tập nhanh.', dieuKienLT(), ['#khach', 'Sang bước 2 · Chuẩn bị Quạt Thần']); }
function cuoiBuoc2() { return '<div style="margin-top:22px"></div>' + htmlChungNhan('tc', 'Chứng nhận thực chiến Quạt Thần', 'Đã chuẩn bị, gặp khách thật và review ít nhất 3 buổi.', dieuKienTC(), ['#review', 'Sang bước 3 · Review điêu luyện']); }
function cuoiPhieu(k) {
  var rv = S.review.filter(function (r) { return r.khach === k.id; })[0];
  return '<div class="the" style="margin-top:16px;border-color:var(--kim)"><b style="display:block;margin-bottom:8px">Gặp khách xong rồi?</b><a class="nut rong" href="' + (rv ? '#review/xem/' + rv.id : '#review/moi/' + k.id) + '">Sang bước 3 · ' + (rv ? 'Kết quả và kịch bản ca này' : 'Review ca này') + ' ›</a></div>';
}

// ---------- Ghi nhận đã luyện mô phỏng cùng bạn ----------
function ghiLuyen(id) {
  var r = S.review.filter(function (x) { return x.id === id; })[0], ten = (document.getElementById('lv-ten') || {}).value || '', ma = (document.getElementById('lv-ma') || {}).value || '', vai = (document.getElementById('lv-vai') || {}).value || 'Khách';
  if (!ten.trim()) { toast('Ghi tên bạn cùng luyện nhé'); return; }
  r.luyen = r.luyen || []; r.luyen.push({ ngay: homNay(), ten: ten.trim(), ma: ma.trim(), vai: vai }); save(); toast('Đã ghi nhận lượt luyện cùng ' + ten.trim()); render();
}
function htmlLuyen(r) {
  var ds = r.luyen || [];
  var h = '<div class="the luyen"><b>✓ Đã luyện mô phỏng ca này</b>';
  if (ds.length) h += '<div class="ds" style="margin-bottom:8px">' + ds.map(function (x) { return '<div class="muc" style="padding:6px 0"><span class="so">🤝</span><div class="y"><div><b>' + esc(x.ten) + '</b>' + (x.ma ? ' · mã ' + esc(x.ma) : '') + '</div><div class="mo">' + vn(x.ngay) + ' · đóng vai ' + esc(x.vai) + '</div></div></div>'; }).join('') + '</div>';
  h += '<label>Họ tên người cùng luyện tập</label><input id="lv-ten" placeholder="Ví dụ: Trần Thu Hà">';
  h += '<div style="display:flex;gap:10px"><div style="flex:1;min-width:0"><label>Mã CTV</label><input id="lv-ma" placeholder="Ví dụ: 512"></div><div style="flex:1;min-width:0"><label>Bạn ấy đóng vai</label><select id="lv-vai"><option>Khách</option><option>Người quan sát</option><option>Người bán (mình đóng khách)</option></select></div></div>';
  return h + '<button class="nut rong" onclick="ghiLuyen(\'' + r.id + '\')">✓ Ghi nhận đã luyện mô phỏng</button></div>';
}
function boiCanhCa(r) {
  var k = khach(r.khach); if (!k) return '';
  var g = (k.goi || 'chị').trim(), d = [];
  if (k.tinCongKhai) d.push(['Khách là ai', k.tinCongKhai]);
  var hs = (k.hoSo || []).map(function (x, i) { return x && x.trim() ? HO_SO[i] + ' → ' + x.trim() : ''; }).filter(Boolean).slice(0, 4); if (hs.length) d.push(['Hồ sơ gia đình', hs.join('\n')]);
  if ((k.tuKhoa || []).length) d.push(['Chữ khách hay dùng', tuKhoa(k).join(', ')]);
  if ((k.nhuCau || []).length) d.push(['Nhu cầu đã thống nhất', k.nhuCau.join('; ')]);
  if (r.nguyenVan) d.push(['Khách nói nguyên văn', r.nguyenVan]);
  d.push(['Kết quả thật', { mua: 'Đã mua', hen: 'Hẹn lại', dung: 'Dừng đúng lúc' }[r.ketQua] || 'Chưa thành']);
  return '<div class="the boi-canh"><b>🎭 Bối cảnh ca (người đóng khách đọc trước)</b>' + d.map(function (x) { return '<div style="margin-top:6px"><span class="mo">' + esc(x[0]) + '</span><div style="white-space:pre-wrap">' + esc(x[1]) + '</div></div>'; }).join('') + '<p class="mo" style="margin:8px 0 0">Đóng đúng như ' + esc(g) + ' thật, không dễ hơn, không khó hơn.</p></div>';
}

// ---------- Trang Hôm nay: mô hình quy trình của app ----------
function htmlQuyTrinh() {
  var cn = S.chungNhan || {}, lt = dieuKienLT(), tc = dieuKienTC();
  function dem(dk) { return dk.reduce(function (a, x) { return a + Math.min(x[1], x[2]); }, 0) + '/' + dk.reduce(function (a, x) { return a + x[2]; }, 0); }
  var coPhieu = S.khach.some(function (k) { return nanXong(k, 1) || (k.tinCongKhai || '').trim(); }), coGap = S.khach.some(function (k) { return k.ketQua; }), coRv = S.review.length > 0, coQl = !!(S.donNhap || Object.keys(S.baoCao || {}).length);
  var B = [
    { id: 1, ic: ART.icon(1), ten: 'Lý thuyết', href: '#nan', con: [['9 nan', '#nan/1'], ['Ví dụ', '#nan/vi-du'], ['Tập nhanh', '#nan/tap'], ['Ca khó', '#cong-cu/ca-kho']], xong: !!cn.lt, cn: '🏅 Chứng nhận học xong · ' + (cn.lt ? 'đã đạt' : dem(lt)) },
    { id: 2, ic: ART.icon(2), ten: 'Chuẩn bị', href: '#khach', con: [['Tìm hiểu khách', '#khach'], ['Từ khoá', '#khach'], ['Mô phỏng 1-2-3', '#khach'], ['Câu CO', '#cong-cu/co'], ['TFBR', '#cong-cu/tfbr']], xong: coPhieu },
    { id: 'g', ic: '<span class="qt-emo">🤝</span>', ten: 'Gặp khách thật', href: '#khach', con: [['Quạt đủ 9 nan', '#nan'], ['Ghi kết quả', '#khach']], xong: coGap, nho: 1 },
    { id: 3, ic: ART.icon(3), ten: 'Review điêu luyện', href: '#review', con: [['Nguồn', '#review/moi'], ['Tự đánh giá', '#review/moi'], ['App đánh giá', '#review'], ['Kịch bản', '#review'], ['Luyện cùng bạn', '#review']], xong: coRv, cn: '🏅 Chứng nhận thực chiến · ' + (cn.tc ? 'đã đạt' : dem(tc)) },
    { id: 4, ic: '<span class="qt-emo">📊</span>', ten: 'Quản lý', href: '#quan-ly', con: [['Đơn hàng tuần', '#don'], ['Kết nối Gương Thần', '#quan-ly'], ['Báo cáo mentor', '#quan-ly']], xong: coQl }
  ];
  var cur = B.filter(function (b) { return !b.xong; })[0] || B[1];
  var h = '<h3>Quy trình Quạt Thần</h3><div class="qt">';
  B.forEach(function (b, i) {
    var la = b === cur;
    h += '<div class="qt-buoc' + (b.xong ? ' xong' : '') + (la ? ' nay' : '') + (b.nho ? ' nho' : '') + (i === B.length - 1 ? ' cuoi' : '') + '"><a class="qt-ic" href="' + b.href + '">' + b.ic + (typeof b.id === 'number' ? '<i>' + b.id + '</i>' : '') + '</a><div class="qt-than"><a class="qt-ten" href="' + b.href + '">' + (typeof b.id === 'number' ? b.id + ' · ' : '') + esc(b.ten) + (b.xong ? ' <span class="tot-c">✓</span>' : '') + (la ? ' <span class="qt-o">★ Bạn đang ở đây</span>' : '') + '</a><div class="qt-con">' + b.con.map(function (c) { return '<a href="' + c[1] + '">' + esc(c[0]) + '</a>'; }).join('') + '</div>' + (b.cn ? '<div class="qt-cn">' + esc(b.cn) + '</div>' : '') + '</div></div>';
  });
  h += '<div class="qt-lap">↺ Mài giũa xong, quay lại bước 2 với khách tiếp theo. Mỗi vòng quạt sắc hơn một chút.</div></div>';
  return h;
}

// ---------- Báo cáo tuần tự động: đẩy ngầm số liệu tuần về máy gửi (Google Apps Script) ----------
// Máy gửi gom báo cáo của mọi CTV và tự gửi email cho mentor lúc 23:59 Chủ nhật (giờ Việt Nam).
// Điền URL web app của Apps Script vào đây sau khi chị Hồng cài xong (xem bao-cao-tuan/HUONG-DAN.md).
var BAO_CAO_URL = '';
function goiBaoCao() {
  var w = lichSuTuan(1)[0];
  return { tuan: w.tu, ma: S.me.ma || '', ten: S.me.ten || '', cuaHang: S.me.cuaHang || '', mentorTen: S.me.mentorTen || '', mentorMa: S.me.mentorMa || '', mentorEmail: tachEmail(S.me.mentor).join(','), so: { luyen: w.luyen, review: w.review, gap: w.gap, ketNoi: w.ketNoi, tap: w.tap, cung: w.cung, hoiTham: w.hoiTham, don: w.don, cl: w.cl, chuoi: chuoiNgay(), clTong: tinhCL().tong }, noiDung: baoCaoTuan(), phienBan: 'P2' };
}
function dayBaoCao(ep) {
  if (!BAO_CAO_URL || !navigator.onLine) return;
  if (!S.me.ten && !S.me.ma) return;
  var bay = Date.now(); if (!ep && S.dayLuc && bay - S.dayLuc < 3 * 36e5) return;
  try { fetch(BAO_CAO_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(goiBaoCao()), keepalive: true }); S.dayLuc = bay; S.dayTuan = dauTuan(); localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
}
function htmlTuGui() {
  if (!BAO_CAO_URL) return '<p class="mo">Tự gửi 23:59 Chủ nhật: đang chờ cài máy gửi. Trong lúc chờ, bấm “Mở email báo cáo tuần”.</p>';
  return '<div class="on-ok">📨 Tự gửi cho mentor lúc 23:59 Chủ nhật, bạn không cần bấm gì. Số liệu cập nhật mỗi khi mở app' + (S.dayLuc ? ' (lần gần nhất ' + new Date(S.dayLuc).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) + ')' : '') + '. Đừng ghi tên hay số điện thoại khách trong phần tự soi.</div>';
}
setTimeout(function () { dayBaoCao(); }, 4000);
document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') dayBaoCao(); });

// ---------- Nhắc tải báo cáo bán hàng tháng trước từ dashboard CTV ----------
function thangTruoc() { var d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); var y = d.getFullYear(), m = ('0' + (d.getMonth() + 1)).slice(-2), cuoi = new Date(y, d.getMonth() + 1, 0).getDate(); return { ma: y + '-' + m, ten: 'tháng ' + (d.getMonth() + 1) + '/' + y, tu: '01/' + m + '/' + y, den: cuoi + '/' + m + '/' + y }; }
function canNhacThang() { var t = thangTruoc(); S.thangDon = S.thangDon || {}; if (S.thangDon[t.ma]) return null; if (S.hoanThang && S.hoanThang >= homNay()) return null; return t; }
function hoanNhacThang() { S.hoanThang = congNgay(homNay(), 1); save(); render(); }
function xongThang() { var t = thangTruoc(); S.thangDon = S.thangDon || {}; S.thangDon[t.ma] = homNay(); save(); toast('Đã ghi nhận báo cáo ' + t.ten); render(); }
function htmlNhacThang() {
  var t = canNhacThang(); if (!t) return '';
  return '<div class="the nhac-thang"><b>📥 Tải báo cáo bán hàng ' + esc(t.ten) + '</b><details class="nhac-cach"><summary>Cách tải (cần đăng nhập dashboard)</summary><ol class="nhac-b"><li>Đăng nhập tài khoản CTV, mở <a href="https://sieuthivietwise.vn/account/dashboard/" target="_blank" rel="noopener">dashboard CTV ›</a>, chọn từ ngày ' + t.tu + ' đến ' + t.den + '.</li><li>Xuất file, hoặc quét chọn bảng "Đơn hàng đã giới thiệu" rồi Sao chép.</li><li>Quay lại app, bấm nút dưới.</li></ol></details><div class="hang"><a class="nut nho" href="#don">⇪ Tải lên app</a><button class="chip" onclick="hoanNhacThang()">Mai nhắc</button><button class="chip" onclick="xongThang()">Đã tải rồi</button></div></div>';
}


// ---------- Hai nhóm khách: khách cũ (up-sell, cross-sell) và khách mới hoàn toàn (bán mới) ----------
function nhomKhach(k) { return ((k.don || []).length || (k.st && (+k.st.soDon > 0 || k.st.gan)) || k.ketQua === 'mua') ? 'cu' : 'moi'; }
var BO_TRO = { 'Thực phẩm sạch': ['Gia vị', 'Thực phẩm khô'], 'Gia vị': ['Thực phẩm sạch', 'Thực phẩm khô'], 'Thực phẩm khô': ['Gia vị', 'Dinh dưỡng'], 'Dinh dưỡng': ['Thực phẩm sạch', 'Thực phẩm khô'], 'Mỹ phẩm': ['Chăm sóc cá nhân'], 'Chăm sóc cá nhân': ['Mỹ phẩm', 'Tẩy rửa sinh học'], 'Tẩy rửa sinh học': ['Tẩy rửa', 'Chăm sóc cá nhân'], 'Tẩy rửa': ['Tẩy rửa sinh học'], 'Mẹ & bé': ['Dinh dưỡng', 'Thực phẩm sạch'] };
function spDaMua(k) {
  var chu = bd([k.st && k.st.mon, k.st && k.st.lichSu, k.spMua].concat((k.don || []).map(function (d) { return (d.sp || []).join(' '); })).filter(Boolean).join(' '));
  return (SP.sanPham || []).filter(function (p) { var w = bd(p.ten.split(/[(–-]/)[0]).trim(); return w && chu.indexOf(w) >= 0; });
}
function goiYBan(k) {
  var da = spDaMua(k), nhom = {}; da.forEach(function (p) { nhom[p.nhom] = 1; });
  var uu = []; Object.keys(nhom).forEach(function (n) { (BO_TRO[n] || []).forEach(function (x) { if (!nhom[x] && uu.indexOf(x) < 0) uu.push(x); }); });
  var cheo = (SP.sanPham || []).filter(function (p) { return !nhom[p.nhom] && (!uu.length || uu.indexOf(p.nhom) >= 0); }).slice(0, 2);
  var mon = da.length ? da.map(function (p) { return p.ten.split(/[(–]/)[0].trim(); }).slice(0, 2).join(', ') : (k.st && k.st.mon) || '';
  return { up: mon ? 'đang dùng ' + mon + ', gợi ý gói lớn hơn hoặc giao theo lịch tháng.' : 'hỏi lại khách đã dùng món nào, thấy thế nào.', cheo: cheo.map(function (p) { return p.ten.split(/[(–]/)[0].trim() + ' (' + p.nhom.toLowerCase() + ')'; }) };
}
function htmlNhomPhieu(k) {
  if (nhomKhach(k) === 'cu') { var g = goiYBan(k); return '<div class="the" style="padding:10px 12px"><span class="nhom-the cu">Khách cũ · up-sell, cross-sell</span><div style="font-size:14.5px;margin-top:4px"><b>Up-sell:</b> ' + esc(g.up) + (g.cheo.length ? '<br><b>Cross-sell:</b> ' + esc(g.cheo.join(', ')) + '.' : '') + '</div><p class="mo" style="margin:6px 0 0">Hỏi nan 3-4 trước rồi mới gợi ý.</p></div>'; }
  return '<div style="margin:10px 0"><span class="nhom-the moi">Khách mới hoàn toàn · bán mới</span><span class="mo" style="font-size:14px"> Đi đủ 9 nan.</span></div>';
}
function htmlHaiNhom() {
  var cu = S.khach.filter(function (k) { return nhomKhach(k) === 'cu'; }), moi = S.khach.filter(function (k) { return nhomKhach(k) === 'moi'; }), n = QL.nhom || '';
  var h = '<h3>👥 Khách của bạn</h3><div class="nhom2"><a href="javascript:void 0" class="cu' + (n === 'cu' ? ' on' : '') + '" onclick="QL.nhom=QL.nhom===\'cu\'?\'\':\'cu\';render()"><b>↗ ' + cu.length + '</b>Khách cũ<small>Up-sell · cross-sell</small></a><a href="javascript:void 0" class="moi' + (n === 'moi' ? ' on' : '') + '" onclick="QL.nhom=QL.nhom===\'moi\'?\'\':\'moi\';render()"><b>✦ ' + moi.length + '</b>Khách mới<small>Bán mới</small></a></div>';
  return h;
}
