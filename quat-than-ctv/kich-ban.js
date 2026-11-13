// Kịch bản mô phỏng luyện lại một ca (Review, phần 3), hai bản để tập:
//   A · Khách phản hồi rõ: khách nói thẳng điều mình lo, người bán đào thêm một tầng rồi đi tiếp.
//   B · Khách phản hồi chưa rõ: khách nói chung chung, ngập ngừng, trì hoãn; người bán đặt thêm câu hỏi làm rõ.
// Nan 4 luôn đủ 3 câu: khách tự xác nhận nhu cầu, viễn cảnh tránh xa, viễn cảnh hướng tới.
// Mỗi cảnh có nút "Vì sao cần câu này". Ghi đè kichBan, htmlKichBan, chuKichBan của thuc-hanh.js.

var KB_KIEU = {};
function kieuKB(r) { return KB_KIEU[r.id] || 'a'; }
function doiKieuKB(id, k) { KB_KIEU[id] = k; render(); }
function hoa(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
function boCham(s) { return String(s || '').trim().replace(/[.?!…]+$/, ''); }

function boiCanhKB(r) {
  var k = khach(r.khach), g = k ? (k.goi || 'chị').trim() : 'chị';
  return {
    g: g, G: hoa(g),
    nc: k && (k.nhuCau || []).length ? boCham(k.nhuCau[0]) : 'mỗi bữa tối cho bé ăn rau mà không phải lo',
    mucTieu: k && k.mucTieu ? boCham(k.mucTieu) : g + ' đồng ý để em gửi bộ câu hỏi hồ sơ gia đình, và chọn thử một món cho bữa tối của bé',
    ketNoi: k && k.ketNoi ? k.ketNoi.trim() : '',
    hoi: k && k.hoiThem ? k.hoiThem.trim() : '',
    tfbr: k && (k.tfbr || []).length ? tfbrCau(k.tfbr[k.tfbr.length - 1]) : '',
    thuongHieu: k && k.thuongHieu ? k.thuongHieu.trim() : ''
  };
}

// Mỗi cảnh: n (nan), phu (tên cảnh con), luot [[người bán, khách, nhãn]], viSao
function canhKB(r, kieu) {
  var b = boiCanhKB(r), g = b.g, G = b.G, B = kieu === 'b';
  var ds = [];
  ds.push({ n: 1, luot: [['(Nói với nhóm trước khi vào vai) Mục tiêu cam kết của em hôm nay: ' + b.mucTieu + '.', '(Khách chưa xuất hiện.)']],
    viSao: 'Mục tiêu là việc khách sẽ làm, không phải số tiền mình bán. Nói to trước nhóm để cả buổi đi đúng hướng, và để người quan sát biết cuối buổi chấm vào đâu.' });
  ds.push({ n: 2, luot: [[b.ketNoi || 'Em chào ' + g + ' ạ. Hôm trước ' + g + ' kể bé nhà mình mới vào lớp 1, mấy hôm nay bé quen trường chưa ' + g + '?',
    B ? 'Ừ chào em. Cũng bình thường thôi, dạo này chị bận lắm.' : 'Quen rồi em. Mà sáng nào chị cũng dậy sớm lo đồ ăn cho bé, mệt ghê.']].concat(B ? [['Dạ, ' + g + ' bận nhất là khúc nào trong ngày ạ?', 'Buổi tối đó em, vừa đi làm về lại lo cơm nước cho bé.', 'Hỏi làm rõ']] : []),
    viSao: B ? 'Khách đáp "bình thường, bận lắm" là cửa còn khép. Đừng nhảy vào giới thiệu. Hỏi một câu nhỏ về chính chữ "bận" để khách kể tiếp, kết nối mới thành.' : 'Hỏi bằng một chi tiết thật mình đã nghe từ khách. Khách thấy mình được nhớ tới, không phải đang bị bán hàng.' });
  if (!B) ds.push({ n: 3, luot: [
      [b.hoi || G + ' lo đồ ăn cho bé thì điều gì làm ' + g + ' băn khoăn nhất ạ?', 'Chị sợ nhất rau ngoài chợ còn thuốc. Rửa kỹ mấy cũng không yên tâm, mà bé nhà chị hay bị đau bụng.'],
      ['Bé hay đau bụng vậy, ' + g + ' để ý thường là sau bữa nào ạ?', 'Hay sau bữa tối. Hôm nào ăn rau là y như rằng.', 'Đào thêm một tầng']],
    viSao: 'Hỏi mở trước, rồi đào thêm đúng một tầng vào chữ khách vừa nói ("đau bụng"). Nhu cầu phải là chữ của khách, không phải điều mình đoán sẵn.' });
  else ds.push({ n: 3, luot: [
      [b.hoi || G + ' lo đồ ăn cho bé thì điều gì làm ' + g + ' băn khoăn nhất ạ?', 'Thì cũng bình thường em. Chị muốn ăn uống lành hơn thôi.'],
      ['Dạ, với ' + g + ', "lành hơn" là như thế nào ạ? ' + G + ' đang để ý chuyện gì nhất trong bữa ăn của bé?', 'À… chắc là rau. Chị nghe nói rau ngoài chợ hay còn thuốc.', 'Hỏi làm rõ'],
      ['' + G + ' nghe vậy rồi, nhà mình đã gặp chuyện gì chưa ạ?', 'Bé hay đau bụng, mà chị cũng không chắc có phải do rau không.', 'Hỏi làm rõ']],
    viSao: 'Khách nói chung chung ("bình thường", "lành hơn") thì chưa có nhu cầu để thống nhất. Hỏi lại đúng chữ khách vừa dùng, và hỏi tới khi khách kể ra một chuyện cụ thể đã xảy ra trong nhà.' });
  // Nan 4 · ba câu
  ds.push({ n: 4, phu: '4.1 Khách tự xác nhận nhu cầu', luot: B ? [
      ['Em nghe ' + g + ' kể vậy, điều ' + g + ' mong nhất là ' + b.nc + ', đúng không ' + g + '? (Dừng, chờ khách xác nhận.)', 'Ừ… chắc vậy. Mà chị cũng chưa biết nữa.'],
      ['Dạ, ' + g + ' còn chưa chắc ở chỗ nào ạ? Là chưa chắc bé đau bụng vì rau, hay chưa chắc có cách nào tốt hơn cách ' + g + ' đang làm?', 'Chưa chắc có cách nào tốt hơn. Chị rửa kỹ rồi mà vẫn lo.', 'Hỏi làm rõ'],
      ['Vậy điều ' + g + ' cần là một cách rửa rau làm ' + g + ' thật sự yên tâm, để ' + b.nc + ', đúng không ạ? (Dừng, chờ khách xác nhận.)', 'Đúng. Cái đó thì đúng em.', 'Xác nhận lại']
    ] : [['Em nghe ' + g + ' nói vậy, điều ' + g + ' mong nhất là ' + b.nc + ', đúng không ' + g + '? (Dừng, chờ khách xác nhận.)', 'Đúng rồi em, chị chỉ cần vậy thôi.']],
    viSao: (B ? '"Chắc vậy" chưa phải là xác nhận. Hỏi đúng chỗ khách còn ngập ngừng, rồi tóm lại lần nữa, tới khi khách nói "đúng" bằng giọng chắc. ' : '') + 'Câu 1 của nan 4. Tóm lại bằng chính chữ của khách, rồi dừng lại chờ khách tự nói "đúng". Chưa có chữ "đúng" của khách thì chưa sang câu 2. Nhu cầu do khách tự xác nhận thì khách tự giữ lấy nó; mình không phải thuyết phục, chỉ cần đi cùng.' });
  ds.push({ n: 4, phu: '4.2 Viễn cảnh tránh xa', luot: B ? [
      ['Nếu cứ để như bây giờ thêm vài năm nữa, ' + g + ' nghĩ chuyện gì sẽ xảy ra với bữa ăn của bé ạ? (Dừng, chờ khách trả lời. Khách chỉ gật đầu đồng tình cũng được.)', 'Chị cũng không nghĩ xa vậy đâu em.'],
      ['Dạ, mình nghĩ gần thôi ' + g + '. Cứ vài hôm bé lại đau bụng một lần như bây giờ, một năm nữa thì sao ạ? (Dừng, chờ khách trả lời. Khách chỉ gật đầu đồng tình cũng được.)', 'Thì… chắc bé sợ ăn rau luôn. Nghĩ tới là chị thấy lo.', 'Hỏi làm rõ']
    ] : [['Nếu cứ để như bây giờ thêm vài năm, bữa nào ' + g + ' cũng phải ngại rau, ' + g + ' nghĩ chuyện gì sẽ xảy ra ạ? (Dừng, chờ khách trả lời. Khách chỉ gật đầu đồng tình cũng được.)', 'Thì bé sợ ăn rau, rồi thiếu chất. Nghĩ tới là chị thấy lo.']],
    viSao: (B ? 'Khi khách né viễn cảnh, kéo nó lại gần và cụ thể: một chuyện đang xảy ra, trong một năm tới. ' : '') + 'Câu 2 của nan 4, chỉ hỏi sau khi khách đã xác nhận nhu cầu. Viễn cảnh tránh xa giúp khách tự thấy cái giá của việc không thay đổi. Đây là câu hỏi, không phải lời dọa: khách tự hình dung, mình không nói thay, không phóng đại. Hỏi xong thì im, chờ khách trả lời. Khách chỉ gật đầu đồng tình cũng đủ, không ép khách nói dài.' });
  ds.push({ n: 4, phu: '4.3 Viễn cảnh hướng tới', luot: B ? [
      ['Còn nếu tối nào ' + g + ' cũng yên tâm bày rau lên mâm, thì ' + g + ' thấy sao ạ? (Dừng, chờ khách trả lời. Khách chỉ gật đầu đồng tình cũng được.)', 'Thì đỡ lo.'],
      ['Dạ, đỡ lo rồi thì buổi tối của ' + g + ' sẽ khác đi thế nào ạ?', 'Chị được ngồi ăn với con, không phải canh từng miếng rau nữa.', 'Hỏi làm rõ']
    ] : [['Còn nếu tối nào ' + g + ' cũng yên tâm bày rau lên mâm, bé ăn ngon, thì ' + g + ' thấy cả nhà mình khác đi thế nào ạ? (Dừng, chờ khách trả lời. Khách chỉ gật đầu đồng tình cũng được.)', '(Gật đầu) Ừ, vậy thì tốt quá em.']],
    viSao: (B ? '"Đỡ lo" vẫn còn chung chung. Hỏi thêm một câu để khách tự vẽ ra một hình ảnh cụ thể trong nhà mình; hình ảnh càng rõ, cảm xúc càng đủ mạnh. ' : '') + 'Câu 3 của nan 4. Viễn cảnh hướng tới cho khách lý do muốn đi tới. Đặt sau câu tránh xa để buổi nói chuyện kết lại bằng hy vọng, không bằng nỗi sợ. Khách quyết vì điều mình muốn có. Hỏi xong im, chờ khách trả lời hoặc chỉ cần đồng tình (như bản A), rồi mới sang nan 5.' });
  ds.push({ n: 5, luot: [[b.thuongHieu || 'Siêu thị Vietwise chỉ nhận hàng có hồ sơ kiểm nghiệm. Có một chị khách của em cũng có bé như nhà mình (kể một ca thật bạn biết), dùng được hai tháng, chị ấy kể giờ dám cho bé ăn rau lại.', B ? 'Vậy à. Mà ai cũng nói hàng mình tốt hết em.' : 'Vậy à, có kiểm nghiệm thì chị yên tâm hơn.']].concat(B ? [['Dạ đúng ạ, nên ' + g + ' cứ hỏi em giấy tờ. ' + G + ' muốn xem phiếu kiểm nghiệm, hay muốn nghe chị khách kia kể trực tiếp ạ?', 'Em gửi chị phiếu kiểm nghiệm xem thử.', 'Hỏi làm rõ']] : []),
    viSao: B ? 'Khách nghi ngờ là chuyện bình thường. Đừng nói thêm lời khen; hỏi khách muốn kiểm chứng bằng gì rồi đưa đúng thứ đó.' : 'Nói uy tín bằng điều kiểm chứng được và bằng chuyện thật của người giống khách. Không mượn lời hứa chữa bệnh, không bịa ca.' });
  ds.push({ n: 6, luot: [[b.tfbr || G + ' muốn bữa tối của bé yên tâm về rau (T). Bột rửa Umikai làm từ canxi vỏ hàu, ngâm rau 5 đến 10 phút (F), nên khâu rửa gọn trong một lần, ' + g + ' không phải rửa đi rửa lại (B). ' + G + ' hình dung mỗi tối rửa rau thế này thì thấy sao ạ? (R)', B ? 'Ừ, nghe cũng được…' : 'Nghe gọn đó. Một gói dùng được bao lâu em?']].concat(B ? [
      ['Dạ, ' + g + ' còn thấy chỗ nào chưa hợp với nhà mình ạ?', 'Chị sợ mất công. Tối chị bận lắm.', 'Hỏi làm rõ'],
      ['Dạ, mỗi lần chỉ ngâm 5 đến 10 phút trong lúc ' + g + ' làm việc khác, không cần chà. ' + G + ' thấy vậy có vừa với buổi tối nhà mình không ạ?', 'Vậy thì được.', 'Trả lời đúng chỗ']] : []),
    viSao: (B ? '"Cũng được…" thường giấu một băn khoăn. Hỏi ra băn khoăn đó rồi trả lời đúng chỗ, thay vì kể thêm tính năng. ' : '') + 'TFBR nối thẳng vào nhu cầu khách vừa tự xác nhận ở nan 4 (T), chỉ nói đặc điểm có thật (F), lợi ích cho đúng nhà khách (B), và kết bằng câu hỏi để khách nói (R), không độc thoại.' });
  ds.push({ n: 7, luot: [['Một gói dùng được khoảng … (nói đúng số liệu thật của sản phẩm). ' + G + ' muốn em giao cùng giỏ hàng tuần này, hay ' + g + ' để lần sau ạ?', B ? 'Để chị suy nghĩ thêm nha.' : (r.ketQua === 'mua' ? 'Ừ, vậy em giao cho chị nha.' : 'Giao luôn tuần này đi em.')]].concat(B ? [
      ['Dạ, ' + g + ' cứ suy nghĩ ạ. Em hỏi để giúp ' + g + ' dễ nghĩ hơn: ' + g + ' còn băn khoăn về giá, về cách dùng, hay muốn hỏi ý anh nhà trước ạ?', 'Chị muốn hỏi anh nhà đã.', 'Hỏi làm rõ'],
      ['Dạ hợp lý ạ. Em gửi ' + g + ' ảnh sản phẩm và giá để ' + g + ' đưa anh xem, tối mai em nhắn hỏi lại ' + g + ' nha?', 'Ừ, được em.', 'Hẹn bước tiếp']] : []),
    viSao: B ? '"Để chị suy nghĩ" là trì hoãn chưa rõ lý do. Hỏi ra lý do thật bằng vài lựa chọn nhẹ, tôn trọng quyền nói không, rồi hẹn một bước tiếp cụ thể. Không giảm giá ép, không tạo khan hiếm giả; nếu khách còn lo về nhu cầu thì quay lại nan 4.' : 'Hỏi cam kết bằng hai lựa chọn đều nhẹ, và khách vẫn nói "để lần sau" được. Người ta còn nói không được thì đó mới là xin cam kết, không phải ép.' });
  ds.push({ n: 8, luot: [['(Ngày 5 sau mua) ' + G + ' ơi, mấy hôm nay bé ăn rau thế nào rồi ạ?', B ? 'Cũng được em.' : 'Bé chịu ăn rau rồi em, chị cũng yên tâm hơn.']].concat(B ? [['Dạ, "cũng được" là ' + g + ' thấy ổn rồi, hay còn chỗ nào chưa tiện ạ?', 'Ổn, mà chị hay quên ngâm đủ 5 phút.', 'Hỏi làm rõ']] : []),
    viSao: 'Hỏi lại sau mua bằng chuyện của khách (bé ăn rau thế nào), không phải hỏi "chị mua thêm không". Chỗ chưa tiện khách kể ra là món quà để mình chăm sóc tiếp.' });
  ds.push({ n: 9, luot: [['Mình phát huy: ' + (r.phatHuy || '…') + '. Lần sau mình làm khác: ' + (r.khacPhuc || '…') + '.', '(Hết cảnh. Cả nhóm cùng review.)']],
    viSao: 'Review ngay khi còn nhớ: một điều giữ lại, một điều làm khác. Người quan sát đọc lại chỗ mình nhảy bước, nhất là có bỏ qua ba câu của nan 4 không.' });
  return ds;
}

function kichBan(r) {
  var kq = danhGia(r), dien = bd(r.dienLai), kieu = kieuKB(r), ra = [];
  canhKB(r, kieu).forEach(function (c) {
    var b = NAN[c.n - 1], x = kq.nan[c.n], that = r.buoc[c.n] === 'tot' && x && x.i < 999 && !c.phu;
    var ky = c.n === 4 || r.buoc[c.n] === 'chua' || r.buoc[c.n] === 'bo' || (dien && bd(b.ten).split(' ').some(function (w) { return w.length > 3 && dien.indexOf(w) >= 0; }));
    var tieu = 'Nan ' + c.n + ' · ' + (c.phu || b.ten);
    c.luot.forEach(function (l, i) { ra.push({ n: c.n, tieu: tieu + (c.luot.length > 1 ? ' (' + (i + 1) + '/' + c.luot.length + ')' : ''), ban: l[0], khach: l[1], nhan: l[2] || '', quan: b.thu, viSao: c.viSao, ky: !!ky, that: that && i === 0 ? x.cau : '' }); });
  });
  return ra;
}

function htmlKichBan(r) {
  var k = khach(r.khach), kieu = kieuKB(r), ds = canhKB(r, kieu), kq = danhGia(r);
  var h = '<h3>Kịch bản mô phỏng luyện lại ca này</h3>' + boiCanhCa(r);
  h += '<div class="hang kb-chon" style="margin:6px 0 4px"><button class="chip' + (kieu === 'a' ? ' on' : '') + '" onclick="doiKieuKB(\'' + r.id + '\',\'a\')">🅰 Khách phản hồi rõ</button><button class="chip' + (kieu === 'b' ? ' on' : '') + '" onclick="doiKieuKB(\'' + r.id + '\',\'b\')">🅱 Khách phản hồi chưa rõ</button></div>';
  h += '<p class="mo">' + (kieu === 'a' ? 'Bản A: khách nói thẳng điều mình lo. Bạn tập đi đúng thứ tự, đào thêm một tầng, và nói đủ 3 câu ở nan 4.' : 'Bản B: khách nói chung chung, ngập ngừng, trì hoãn. Bạn tập <b>hỏi làm rõ</b> trước khi đi tiếp. Các câu hỏi làm rõ có nhãn tím.') + ' Ba vai: <b>Người bán</b> (bạn), <b>Khách</b> (bạn trong team đóng ' + esc(k ? (k.goi || 'chị') + ' ' + (k.ten || '') : 'khách') + '), <b>Người quan sát</b>. Cảnh ★ cần tập kỹ.</p>';
  h += ds.map(function (c) {
    var b = NAN[c.n - 1], x = kq.nan[c.n], that = r.buoc[c.n] === 'tot' && x && x.i < 999 && !c.phu;
    var ky = c.n === 4 || r.buoc[c.n] === 'chua' || r.buoc[c.n] === 'bo';
    var o = '<div class="the canh-kb' + (ky ? ' ky' : '') + '"><b>' + (ky ? '★ ' : '') + 'Nan ' + c.n + ' · ' + esc(c.phu || b.ten) + '</b>';
    if (c.phu && c.phu.indexOf('4.1') === 0) o += '<div class="mo" style="margin-top:4px">Thứ tự nan 4: ① tóm nhu cầu, <b>chờ khách xác nhận</b> → ② hỏi viễn cảnh tránh xa, <b>chờ khách trả lời</b> → ③ hỏi viễn cảnh hướng tới, <b>chờ khách trả lời</b>. Khách chỉ gật đầu đồng tình cũng được.</div>';
    if (that) o += '<div class="mo" style="margin-top:4px">Lời thật của bạn trong ca này: “' + esc(x.cau) + '”</div>';
    o += c.luot.map(function (l) { return '<div class="vai"><i>Người bán' + (l[2] ? ' <span class="kb-nhan">' + esc(l[2]) + '</span>' : '') + '</i>' + esc(l[0]) + '</div><div class="vai kh"><i>Khách</i>' + esc(l[1]) + '</div>'; }).join('');
    o += '<details class="kb-visao"><summary>💡 Vì sao cần câu này?</summary><p>' + esc(c.viSao) + '</p></details>';
    return o + '<div class="mo">Người quan sát soi: ' + esc(b.thu) + '</div></div>';
  }).join('');
  h += '<div class="hang"><a class="nut" href="#review/tap/' + r.id + '">▶ Tập nói bản ' + kieu.toUpperCase() + ' từng câu</a><button class="nut phu" onclick="chep(chuKichBan(\'' + r.id + '\'))">Sao chép kịch bản cho team</button></div>';
  return h + htmlLuyen(r);
}

function chuKichBan(id) {
  var r = S.review.filter(function (x) { return x.id === id; })[0], kieu = kieuKB(r);
  return 'KỊCH BẢN ĐÓNG KỊCH QUẠT THẦN · ' + vn(r.ngay) + ' · BẢN ' + (kieu === 'a' ? 'A: KHÁCH PHẢN HỒI RÕ' : 'B: KHÁCH PHẢN HỒI CHƯA RÕ, CẦN HỎI LÀM RÕ') + '\nVai: Người bán · Khách · Người quan sát. Cảnh ★ cần tập kỹ.\n\n' + canhKB(r, kieu).map(function (c) {
    var b = NAN[c.n - 1];
    return 'Nan ' + c.n + ' · ' + (c.phu || b.ten) + '\n' + c.luot.map(function (l) { return 'Người bán' + (l[2] ? ' (' + l[2] + ')' : '') + ': ' + l[0] + '\nKhách: ' + l[1]; }).join('\n') + '\nVì sao: ' + c.viSao + '\nQuan sát: ' + b.thu;
  }).join('\n\n');
}
