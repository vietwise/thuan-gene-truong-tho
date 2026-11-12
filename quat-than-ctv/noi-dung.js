// Quạt Thần CTV — nội dung phương pháp (bản chuẩn Vy + Má Hồng chốt 23/10/2026, ghép Gương Thần theo skill quat-than)
var NAN = [
  { n: 1, ten: 'Mục tiêu cam kết', ngan: 'Biết trước mình mong khách cam kết điều gì',
    viec: ['Trước buổi gặp, viết ra một điều cụ thể khách có thể cam kết sau buổi này.', 'Mục tiêu nhỏ cũng được: đồng ý hẹn buổi hai, nhận tài liệu, thử một món, chọn giỏ tháng này.'],
    guong: { lop: 'Lớp 7 — Hữu ích', y: 'Mục tiêu phải hữu ích cho người kia, không chỉ cho mình.' },
    loi: ['Đi gặp mà không biết mình mong gì, nên buổi trò chuyện trôi tuột.', 'Mục tiêu chỉ có doanh số, không có lợi ích của khách.'],
    mau: ['Sau buổi này, em mong chị đồng ý cho em gửi bộ câu hỏi hồ sơ gia đình.', 'Sau buổi này, em mong chị thử chọn một giỏ hàng tháng này.'],
    thu: 'Nếu khách đạt cam kết này, cuộc sống của khách tốt hơn ở điểm nào?',
    vd: "Trước khi gặp chị Lan (mẹ hai bé 6 tuổi và 3 tuổi, quen qua nhóm Zalo của lớp), Ngân ghi mục tiêu: sau buổi này chị Lan đồng ý trả lời bộ 9 câu hồ sơ gia đình và hẹn gặp lại thứ Bảy." },
  { n: 2, ten: 'Kết nối', ngan: 'Mở lòng, tạo thiện cảm, giữ năng lượng',
    viec: ['Nhìn, chào, gọi tên. Ấn tượng đầu tiên quyết định khách có muốn nghe tiếp không.', 'Kể ngắn câu chuyện thật của chính mình: vì sao mình làm Vietwise.', 'Giữ năng lượng tích cực suốt buổi.'],
    guong: { lop: 'Lớp 3 — Phụng sự · Khiêm nhường · Yêu thương', y: 'Niềm tin không phải kỹ thuật, là con người mình. Cho trước khi xin.' },
    loi: ['Vào thẳng sản phẩm khi khách chưa tin mình.', 'Diễn sự quan tâm. Yêu thương không diễn được, chỉ có thật hoặc không.'],
    mau: ['Em chào chị, em là ... Em làm cùng Siêu thị Vietwise vì ...', 'Dạo này nhà mình thế nào rồi chị?'],
    thu: 'Câu chuyện mở của mình có thật không, hay dựng lên?',
    vd: "Ngân mở lời: “Em chào chị Lan, em là Ngân, mẹ bé Su học cùng lớp bé Na. Em làm cùng Siêu thị Vietwise từ hồi bé Su hay đau bụng, em bắt đầu để ý kỹ chuyện ăn uống trong nhà.”" },
  { n: 3, ten: 'Đặt câu hỏi hay', ngan: 'Hỏi để khách tự nhận ra nhu cầu',
    viec: ['Quan tâm, lắng nghe, hỏi nối theo chuỗi thông tin, hỏi lại khi chưa hiểu.', 'Hỏi tiền đề của khách: "tốt cho sức khỏe" với chị nghĩa là gì? Nỗi lo phía sau là gì?', 'Bước 3 là vòng lặp. Hỏi hết mà chưa ra nhu cầu thật thì ở lại bước 3, hoặc dừng và không bán.'],
    guong: { lop: 'Lớp 3 Khiêm nhường + Lớp 4 Người khác', y: 'Hỏi vì mình thật sự chưa biết, không phải hỏi để gài.' },
    loi: ['Nhảy từ một câu hỏi sang giới thiệu sản phẩm.', 'Giả định khách đã biết rõ nhu cầu của mình.', 'Nói nhiều thông tin trước khi hỏi "chị có muốn nghe thông tin này không".'],
    mau: ['Chị nói "muốn ăn uống lành hơn", với chị lành hơn là như thế nào ạ?', 'Điều gì làm chị lo nhất khi mua đồ ngoài chợ?', 'Chị kể thêm cho em được không?'],
    thu: 'Mình có thật sự nghe, hay chỉ chờ tới lượt nói?',
    vd: "Ngân hỏi: “Nhà mình hay đi chợ ở đâu chị?”. Chị Lan: “Chợ gần nhà, mà rau xanh mướt quá chị cũng sợ.” Ngân hỏi nối: “Chị sợ nhất điều gì ạ?”. Chị Lan: “Thuốc trừ sâu, bé Bin mới 3 tuổi.” Tới đây Ngân vẫn chưa nhắc tới sản phẩm nào." },
  { n: 4, ten: 'Thống nhất nhu cầu', ngan: 'Khách tự nói ra, mình nâng cảm xúc',
    viec: ['Tóm lại bằng chính lời khách rồi hỏi "đúng không ạ?".', 'Nâng cảm xúc bằng hai câu: "Nếu được… thì…" và "Nếu không được thì…".', 'Rồi im lặng một nhịp cho khách hình dung. Chưa đưa thêm thông tin.'],
    guong: { lop: 'Lớp 2 — LƯƠNG TÂM', y: 'Đây là bước dễ biến thành thao túng nhất. Chạm, chứ không khoét vào nỗi sợ.', do: true },
    loi: ['Hỏi câu nâng cảm xúc mà chính mình không tin, nghe giả.', 'Khách chưa hình dung được mà mình đã đưa thông tin.'],
    mau: ['Nếu mỗi bữa cơm chị đều yên tâm về rau cá, thì chị thấy thế nào?', 'Nếu cứ để như bây giờ thêm vài năm, chị nghĩ chuyện gì sẽ xảy ra?', 'Mức quan tâm của chị với chuyện này đang ở số mấy trên thang 10?'],
    thu: 'Nếu người ngồi trước mặt là mẹ mình, mình có nói câu này không? Không dám nói với mẹ thì đừng nói với ai.',
    vd: "Ngân tóm lại: “Vậy điều chị mong nhất là bữa cơm của hai bé được yên tâm, đúng không chị?”. Chị Lan: “Đúng rồi em.” Ngân hỏi: “Nếu tối nào nấu cơm chị cũng thấy yên tâm, chị thấy thế nào?”, rồi im lặng một nhịp. Chị Lan: “Thì nhẹ đầu lắm.”" },
  { n: 5, ten: 'Giới thiệu thương hiệu, nhân hiệu', ngan: 'Ít thông tin, nhiều bằng chứng',
    viec: ['Chỉ nhắc điều về Vietwise và về mình có gắn với nhu cầu đã thống nhất ở bước 4.', 'Bằng chứng tốt nhất là lời khen của khách tương tự, đúng điểm liên quan nhu cầu.'],
    guong: { lop: 'Lớp 6 Đạo đức + Lớp 9 Vô ngã', y: 'Uy tín phải có thật. Kể để trao, không phải để khoe.' },
    loi: ['Nhồi cả lịch sử công ty.', 'Bịa lời khách. Chưa có chuyện thật thì để trống, đừng dựng.'],
    mau: ['Một chị cũng có hai bé như nhà mình, dùng ... được hai tháng, chị ấy kể ...'],
    thu: 'Uy tín mình nêu ra có kiểm chứng được không?',
    vd: "Ngân kể ngắn: “Bên em có chị Hoa cũng hai bé như nhà mình, rửa rau theo cách này ba tháng rồi, chị ấy kể là đỡ lo hẳn.” Ngân không kể lịch sử công ty. Chuyện chị Hoa phải là chuyện thật Ngân biết, không dựng." },
  { n: 6, ten: 'Giới thiệu sản phẩm (TFBR)', ngan: 'Một nhu cầu, một tính năng độc đáo',
    viec: ['T – Tieback: nhắc lại nhu cầu khách đã đồng ý.', 'F – Feature: một tính năng độc đáo của sản phẩm.', 'B – Benefit: tính năng đó đáp ứng nhu cầu ấy thế nào.', 'R – Reaction: hỏi để khách hình dung và nói cảm nhận.', 'Nói lợi ích, không nói tính năng suông. Không liệt kê hết.'],
    guong: { lop: 'Lớp 2 Quặng mỏ châu ngọc + Lớp 6 Trí tuệ', y: 'Bên trong sản phẩm phải có ngọc thật. Người bán giỏi dám nói "cái này chưa hợp với chị".' },
    loi: ['Đọc danh sách tính năng mà không nối với nhu cầu.', 'Hứa công dụng chữa bệnh. Chỉ nói đúng công bố, giữ chữ "góp phần", "hỗ trợ".'],
    mau: ['Chị muốn rau cá nấu cho nhà yên tâm hơn (T). Umikai làm từ canxi vỏ hàu, ngâm 5–10 phút (F), nên khâu rửa gọn trong một lần (B). Chị hình dung mỗi tối rửa rau thế này thì thấy sao ạ? (R)'],
    thu: 'Sản phẩm có ngọc thật bên trong không? Nó không hợp với ai?',
    vd: "Ngân dùng TFBR: “Chị muốn bữa cơm của hai bé yên tâm hơn (T). Umikai làm từ canxi vỏ hàu, rắc 2g pha 1 lít nước, ngâm rau 5–10 phút (F), nên chị rửa gọn một lần mà yên tâm hơn chuyện tồn dư thuốc (B). Chị hình dung mỗi tối rửa rau thế này thì thấy sao ạ? (R)”" },
  { n: 7, ten: 'Xin cam kết và xử lý trì hoãn', ngan: 'Xin, chứ không ép',
    viec: ['7a: báo giá, cách mua, nối giá với giá trị và sự tâm an của khách.', '7b: nói lý do bắt đầu sớm có thật (mùa, đợt hàng). Cấp bách phải thật, không bịa.', 'Khách lưỡng lự: không bao giờ hỏi "tại sao". Quay về bước 4, rồi dùng một USB hợp với khách.', 'Hỏi xong thì im lặng.'],
    guong: { lop: 'Lớp 2 — Ý CHÍ TỰ DO', y: 'Người mua có quyền nói không. Không thúc, không tạo khan hiếm giả.', do: true },
    loi: ['Báo giá khi chưa thống nhất nhu cầu, khách chỉ thấy đắt.', 'Tung hết khuyến mãi một lượt.', 'Nói "chỉ hôm nay thôi" khi mai vẫn bán.'],
    mau: ['Giỏ này khoảng ... một tháng. Chị muốn em giao theo lịch cố định hay chị gọi khi cần ạ?', 'Chị tìm hiểu kỹ quá. Chị còn băn khoăn điều gì để em nói rõ thêm ạ?'],
    thu: 'Người ta còn nói "không" được không?',
    vd: "Ngân báo giá: “Hũ 100g khoảng 219 nghìn, dùng được nhiều lần ngâm.” Chị Lan: “Để chị suy nghĩ thêm.” Ngân không hỏi “sao chị còn phân vân”, mà nói: “Chị tìm hiểu kỹ quá. Chị còn băn khoăn điều gì để em nói rõ thêm ạ?”. Hóa ra chị Lan sợ không biết pha. Ngân chỉ tận tay, chị Lan lấy một hũ." },
  { n: 8, ten: 'Sau mua', ngan: 'Khách thấy vui vì đã chọn đúng',
    viec: ['Giúp khách khẳng định mình đã chọn đúng.', 'Giữ đúng mọi điều đã hứa, trao một bất ngờ nhỏ.', 'Hỏi thăm theo nhịp 5 – 10 – 15 ngày.'],
    guong: { lop: 'Lớp 7 — Hạnh phúc', y: 'Mua xong thấy vui, không thấy hối.' },
    loi: ['Bán xong là im.', 'Chỉ nhắn khi muốn bán tiếp.'],
    mau: ['Nhà mình dùng được mấy hôm rồi, chị thấy thế nào ạ?'],
    thu: 'Người mua rồi có thấy vui không?',
    vd: "Ngày 5, Ngân nhắn hỏi chị Lan dùng thấy sao, có chỗ nào chưa rõ cách pha. Ngày 10, hỏi thăm bé Bin. Ngày 15, hỏi Umikai còn nhiều không; nếu chị muốn dùng tiếp thì Ngân chuẩn bị, chưa cần thì cũng không sao." },
  { n: 9, ten: 'Review, mài giũa', ngan: 'Soi lại để lần sau giỏi hơn',
    viec: ['Ghi lại ngay: khách nói gì nguyên văn, mình hỏi gì.', 'Soi từng bước 1–8: đủ chưa, có nhảy bước không.', 'Ghi ít nhất một điều phát huy và một điều khắc phục.', 'Diễn lại đoạn chưa tốt (một mình, theo cặp, hoặc buổi trưa thứ Sáu).', 'Soi cả thương vụ thành công lẫn chưa thành công.'],
    guong: { lop: 'Lớp 8 — VÒNG LẶP PHẢN HỒI', y: 'Không phải ví von: bước 9 chính là vòng lặp phản hồi. Bỏ bước 9 thì mười năm vẫn bán như năm đầu.', do: true },
    loi: ['Chỉ soi khi thất bại.', 'Không ghi chép, nên giỏi lên chỉ nhờ may rủi.'],
    mau: ['Hôm nay mình đã nhảy từ bước 3 sang bước 6 ở chỗ ...'],
    thu: 'Lần sau mình làm gì khác lần này?',
    vd: "Tối đó Ngân review. Phát huy: hỏi nối ở nan 3 nên chị Lan tự nói ra nỗi sợ. Khắc phục: báo giá ngay khi chị Lan chưa kịp nói cảm nhận ở nan 6. Ngân mang đoạn này đi diễn lại ở buổi Action Selling trưa thứ Sáu." }
];

var HO_SO = [
  'Gia đình mình hiện có mấy người, mấy bé?',
  'Các bé nhà mình mấy tuổi rồi ạ?',
  'Gia đình mình đang quan tâm nhất chuyện sức khỏe nào? (tiêu hóa, miễn dịch, ngủ, cân nặng…)',
  'Mình đã từng dùng sản phẩm thuận tự nhiên, thảo dược nào chưa, dùng thấy sao?',
  'Mỗi tháng gia đình mình chi khoảng bao nhiêu cho đồ ăn, thực phẩm, thảo dược?',
  'Mình hay mua đồ thuận tự nhiên ở đâu?',
  'Trong nhà có ai có bệnh nền hoặc tiền sử cần lưu ý không?',
  'Mình thích nhận hàng theo lịch cố định hay gọi khi cần?',
  'Ai là người quyết định chính việc mua sắm này ạ?'
];

var USB = [
  { ten: 'Trả góp, chia nhỏ', khi: 'Khách muốn nhưng ngại một lần chi nhiều' },
  { ten: 'Khuyến mãi có thời hạn thật', khi: 'Đang có đợt thật (ví dụ 24 giờ, 50 suất). Không bịa hạn' },
  { ten: 'Quà tặng kèm nếu mua trong tháng', khi: 'Chương trình tháng đang chạy' },
  { ten: 'Mua nhiều giảm nhiều', khi: 'Khách dùng cho cả nhà, dùng đều' },
  { ten: 'Sản phẩm thứ hai giảm 50%', khi: 'Khách muốn thử thêm một món' },
  { ten: 'Nhân đôi điểm tích lũy hôm nay', khi: 'Khách đã là khách quen' },
  { ten: 'Học bổng gia đình (giỏ 2,5tr x 3 tháng)', khi: 'Gia đình muốn đồng hành dài, có con nhỏ. Gọi đúng tên "học bổng gia đình"' }
];

var CA_KHO = [
  { ca: 'Khách đang dùng sản phẩm tương tự và "thấy ổn"', giai: 'Mừng, vì họ đã có ngân sách. Không dạy lại từ đầu. Hỏi chi phí một tháng cả quy trình họ đang dùng, tìm nhu cầu chưa được đáp ứng (nguồn gốc, yên tâm hàng thật, kiến thức tiếng Việt, tiết kiệm). Khách nói ra nhu cầu đó rồi mới sang bước 5–6.', mo: ["Dạ, chị đang dùng loại nào vậy ạ? Chị thấy ổn nhất ở điểm nào?", "Một tháng cả nhà mình dùng hết chừng bao nhiêu ạ, chị có từng tính thử chưa?", "Có điều gì chị vẫn mong loại đang dùng làm được mà chưa thấy không ạ?"] },
  { ca: 'Khách không dùng gì, không biết gì, không có ngân sách', giai: 'Không nhảy vào bán. Bám chính điều khách vừa nói (ví dụ "da tôi đang đẹp") để gợi: tối ưu cái đang tốt, chuẩn bị cho sau này. Hỏi "mức quan tâm của chị ở số mấy trên thang 10". Khi khách tự hỏi "có tốn tiền không" là đã muốn, lúc đó mới giới thiệu.', mo: ["Dạ, chị đang chăm mình thế nào mà thấy ổn vậy, chị chia sẻ em với?", "Nếu chấm từ 1 tới 10, chị quan tâm chuyện này ở mức nào ạ?", "Chị muốn giữ được như bây giờ trong bao lâu nữa ạ?"] },
  { ca: 'Khách nói nhu cầu còn xa (con còn nhỏ, chưa nghĩ tới)', giai: 'Hỏi lại tuổi con và mối quan tâm hiện tại; chuyển thành "khi nào là thời điểm tốt để chuẩn bị".', mo: ["Dạ, bé nhà mình năm nay mấy tuổi rồi chị?", "Bây giờ chị đang lo cho bé nhất chuyện gì ạ?", "Theo chị, lúc nào là lúc tốt để mình bắt đầu chuẩn bị ạ?"] },
  { ca: 'Khách tin hàng ngoại hơn hàng Việt', giai: 'Đừng tranh luận. Hỏi nỗi bất an phía sau (hàng giả, không rõ nguồn gốc, đọc tiếng Anh). Khách mua sự tâm an; đây là chỗ nhãn hàng có người thật, nguồn gốc rõ nói được.', mo: ["Dạ, chị hay chọn hàng ngoại vì điều gì nhất ạ?", "Chị từng gặp chuyện mua phải hàng không rõ nguồn gốc chưa ạ?", "Nếu biết rõ người làm ra và nơi làm ra, chị thấy yên tâm hơn không ạ?"] },
  { ca: 'Khách hỏi giá ngay từ đầu', giai: 'Đừng báo giá sớm. Kéo về bước 3 bằng một câu hỏi, vì báo giá khi chưa có nhu cầu thì chỉ thấy đắt. Ví dụ: "Dạ, giá có nhiều mức tùy nhà mình dùng thế nào, chị cho em hỏi nhà mình mấy người ạ?"', mo: ["Dạ, giá có vài mức tùy nhà mình dùng thế nào. Chị cho em hỏi nhà mình mấy người ạ?", "Dạ em báo chị ngay, trước đó chị cho em hỏi chị định dùng cho ai trong nhà ạ?", "Chị đang dùng loại nào không, để em so cho chị dễ chọn ạ?"] },
  { ca: 'Khách nói "để suy nghĩ thêm"', giai: 'Giữ năng lượng, khen khách ("chị tìm hiểu kỹ quá"), rồi hỏi tiếp để tìm nhu cầu còn ẩn. Không chất vấn "tại sao", không báo hiệu mình đang chờ chốt. Về bước 4 rồi mới cân nhắc một USB.', mo: ["Dạ, chị tìm hiểu kỹ quá, em thích vậy. Chị còn băn khoăn điểm nào nhất ạ?", "Chị cần thêm thông tin gì để thấy chắc hơn ạ, em gửi chị liền?", "Nếu chưa chọn, chị thấy chuyện này ảnh hưởng gì tới nhà mình không ạ?"] }
];

var SOAT = [
  [1, 'Mục tiêu này hữu ích cho người mua chứ?'],
  [2, 'Câu chuyện mở có thật không, hay dựng lên?'],
  [3, 'Mình có thật sự nghe, hay chỉ chờ tới lượt nói?'],
  [4, 'Câu nâng cảm xúc có nói được với mẹ mình không?'],
  [5, 'Uy tín nêu ra có kiểm chứng được không?'],
  [6, 'Sản phẩm có ngọc thật bên trong không?'],
  [7, 'Người ta còn nói "không" được không?'],
  [8, 'Người mua rồi có thấy vui không?'],
  [9, 'Lần sau mình có gì khác lần này?']
];

var QUIZ = [
  { n: 3, hoi: 'Khách vừa nói "nhà chị hay bị đau bụng". Câu tiếp theo tốt nhất là gì?', chon: ['Chị dùng ngay men tiêu hóa bên em nhé', 'Chị kể thêm cho em, thường là lúc nào và ai trong nhà ạ?', 'Bên em có nhàu lên men rất tốt'], dung: 1, giai: 'Hỏi nối để hiểu tiếp, chưa giới thiệu sản phẩm (lỗi số 1: nhảy từ một câu hỏi sang sản phẩm).' },
  { n: 7, hoi: 'Khách nói "để chị suy nghĩ thêm". Mình nên làm gì?', chon: ['Hỏi "sao chị còn phải suy nghĩ ạ?"', 'Báo ngay khuyến mãi chỉ còn hôm nay', 'Khen chị tìm hiểu kỹ, rồi hỏi chị còn băn khoăn điều gì (về bước 4)'], dung: 2, giai: 'Không chất vấn "tại sao", không bịa hạn. Về bước 4 tìm nhu cầu còn ẩn.' },
  { n: 6, hoi: 'Câu nào là TFBR đầy đủ?', chon: ['Umikai từ vỏ hàu Nhật, giá 219 nghìn', 'Chị muốn rửa rau yên tâm hơn; Umikai ngâm 5–10 phút nên rửa gọn một lần; chị hình dung mỗi tối thế này thì sao ạ?', 'Umikai bán chạy nhất tháng này đó chị'], dung: 1, giai: 'Có đủ T (nhu cầu của khách), F (tính năng), B (lợi ích) và R (hỏi cảm nhận).' },
  { n: 4, hoi: 'Câu nâng cảm xúc nào qua được phép thử "nói với mẹ mình"?', chon: ['Không dùng cái này thì con chị sẽ bệnh nặng đấy', 'Nếu mỗi bữa cơm chị đều yên tâm, chị thấy thế nào?', 'Ai cũng mua hết rồi, chị không mua là thiệt'], dung: 1, giai: 'Chạm mà không khoét vào nỗi sợ, không dọa.' },
  { n: 1, hoi: 'Mục tiêu cam kết nào cụ thể nhất?', chon: ['Bán được càng nhiều càng tốt', 'Chị đồng ý cho em gửi bộ câu hỏi hồ sơ gia đình và hẹn gọi lại thứ Bảy', 'Cho khách biết về Vietwise'], dung: 1, giai: 'Mục tiêu cụ thể, có thể đo, và có ích cho khách.' },
  { n: 5, hoi: 'Bước 5 nên kể gì về Vietwise?', chon: ['Toàn bộ lịch sử công ty từ đầu', 'Điều gắn với nhu cầu khách vừa đồng ý, kèm lời khen của khách tương tự', 'Một lời khen mình tự viết cho hay'], dung: 1, giai: 'Ít thông tin, nhiều bằng chứng thật. Không bịa lời khách.' },
  { n: 3, hoi: 'Khách hỏi giá ngay câu đầu. Mình làm gì?', chon: ['Báo giá ngay cho nhanh', 'Kéo về bước 3 bằng một câu hỏi về nhà mình', 'Bảo khách xem trên web'], dung: 1, giai: 'Báo giá khi chưa có nhu cầu thì chỉ thấy đắt.' },
  { n: 9, hoi: 'Khi nào cần làm review bước 9?', chon: ['Chỉ khi khách không mua', 'Chỉ khi bán được đơn lớn', 'Sau mỗi cuộc gặp, cả thành công lẫn chưa thành công'], dung: 2, giai: 'Review để mài giũa, mài giũa để điêu luyện.' },
  { n: 8, hoi: 'Nhịp hỏi thăm sau mua là gì?', chon: ['Ngày 5, 10, 15', 'Một tháng một lần', 'Chỉ khi khách nhắn'], dung: 0, giai: 'Nhịp 5 – 10 – 15 ngày trong chương trình CTV Tuần 4.' }
];

// Lời nhắn hôm nay: trích ebook "Kinh Tế Tâm Linh" (Nhất Phương Hồng, 2025) và bộ 6 WINS của Siêu thị Vietwise (sứ mệnh, 6 lợi ích dạng vần)
var LOI_NHAN = [
  { c: "Kinh tế không nhất thiết phải là trò chơi “một mất một còn”.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Vietwise không bán sản phẩm, mà luân chuyển giá trị sống có ý thức.", n: "6 WINS Siêu thị Vietwise" },
  { c: "Không ép buộc hay lôi kéo, mà đánh thức nhu cầu bên trong họ, giúp họ thấy giá trị thực sự của những gì ta mang lại.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Không vốn vẫn bộn hàng, trang web riêng đàng hoàng. Đơn về, kho chung gửi, truyền thông chung rộn ràng.", n: "6 WINS Siêu thị Vietwise" },
  { c: "Kinh tế Tâm Linh không phải là từ bỏ lợi nhuận, mà là cách tạo giá trị để đón dòng tiền một cách thông minh, nhân văn và bền vững.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Tỉnh thức giúp người bán không bán sai, người mua không mua vô thức.", n: "6 WINS Siêu thị Vietwise" },
  { c: "Hãy nhận rõ mỗi con người là quặng mỏ đầy châu ngọc vô giá.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Dùng sản phẩm tỉnh thức, lợi cả Trí – Tâm – Thân. Năng lượng tăng cao dần, thông thương trao và nhận.", n: "6 WINS Siêu thị Vietwise" },
  { c: "Tiền là phương tiện vận chuyển giá trị, và là cái bóng của giá trị.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Gìn giữ nghề cha ông, từng hạt giống nguyên bản. Tấm lòng người gieo trồng, được cộng đồng trân trọng.", n: "6 WINS Siêu thị Vietwise" },
  { c: "Cạnh tranh chỉ mang lại chiến thắng ngắn hạn. Sự kết nối và cộng hưởng giá trị mới tạo ra sự tăng trưởng bền vững và đột phá.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Tạo đứa con tinh thần, gửi tâm tư xa gần. Vừa sinh thêm thành quả, vừa dồi dào tình thân.", n: "6 WINS Siêu thị Vietwise" },
  { c: "Nếu bạn giúp người khác cùng thành công, bạn sẽ xây dựng một hệ sinh thái bền vững mà ở đó mọi người đều thắng.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Quỹ thiện nguyện trích ra, lo trẻ nhỏ, người già. Giúp mồ côi, yếu thế, tạo công đức gần xa.", n: "6 WINS Siêu thị Vietwise" },
  { c: "Khi họ thực sự nhận được giá trị, họ tự nhiên lan tỏa, trở thành một phần của hệ sinh thái.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Tư duy xanh bừng sáng, hiện thực thật vững vàng. Cộng hưởng thật mạnh mẽ, bền vững mãi tỏa lan.", n: "6 WINS Siêu thị Vietwise" },
  { c: "Một hạt giống không bị ép phải nảy mầm, nó sẽ tự vươn lên khi đủ duyên.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Thống nhất trong dị biệt là mục đích, bình an cùng nhau trong sự biết ơn.", n: "6 WINS Siêu thị Vietwise" },
  { c: "Nếu đối tượng mà bạn muốn phụng sự không biết đến bạn, thì làm sao họ có cơ hội trở thành người được phụng sự?", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Sân chơi này vô hạn, vì nó là sân chơi của 6 WIN chứ không phải sân chơi thắng – thua.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Xây dựng nhân hiệu là PHÁP, không phải là CHIÊU.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Bạn có phụng sự bao nhiêu, thì bạn cũng không lo chiếm mất cơ hội phụng sự của người khác.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Một ngọn đèn chỉ sáng trong căn phòng riêng thì chỉ có một mình nó thấy ánh sáng. Nhưng nếu được đặt trên cột cao, nó có thể chiếu sáng cho cả con đường.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Hiểu rằng khi bạn giúp ai đó thành công, bạn đang góp phần tạo ra năng lượng tích cực cho chính mình.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Bạn không cần “khác biệt để nổi bật”, chỉ cần chân thật đến mức sự độc đáo của bạn không thể lẫn vào đâu được.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Bạn không thể phụng sự mọi thứ cho mọi người, nhưng bạn có thể trở thành ánh sáng cho một lĩnh vực cụ thể.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Nếu không thông thương giá trị, thì không có sự thịnh vượng.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Con người cần chủ động tri ân để dòng chảy năng lượng của những giá trị tạo ra được thông suốt.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Giúp đỡ người khác mà không mong đợi đền đáp ngay lập tức.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Hôm nay, bạn đang làm việc để tối đa hóa lợi nhuận hay tối đa hóa giá trị?", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Thời của sự xuất sắc cá nhân qua rồi, đây là thời của sự xuất sắc của tập thể thống nhất trong dị biệt.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Chúng ta không sinh ra để trốn tránh thế giới. Chúng ta sinh ra để biến đổi thế giới.", n: "Ebook Kinh Tế Tâm Linh" },
  { c: "Hệ Hiệu chính là khi tất cả các dòng chảy nhỏ hợp lại thành một đại dương: không ai đơn độc, không ai bị bỏ lại phía sau.", n: "Ebook Kinh Tế Tâm Linh" }
];

// Lời dễ vi phạm quy định quảng cáo hoặc giọng "thuận tự nhiên"
var LOI_CAM = [
  { re: /\bchữa\b|\bchữa (khỏi|bệnh|trị)/i, goi: 'Không hứa chữa bệnh. Dùng "góp phần", "hỗ trợ".' },
  { re: /khỏi bệnh|khỏi hẳn|dứt điểm|trị dứt|đặc trị|thay thuốc/i, goi: 'Không hứa công dụng chữa bệnh.' },
  { re: /cam kết hiệu quả|100\s?% (hiệu quả|khỏi)|hiệu quả tuyệt đối/i, goi: 'Không cam kết hiệu quả.' },
  { re: /sập sàn|duy nhất hôm nay|số lượng có hạn|cực gấp|xả kho/i, goi: 'Giữ giọng "thuận tự nhiên, tận tâm", không thúc ép.' },
  { re: /tặng miễn phí|quà khuyến mãi/i, goi: 'Với chương trình giỏ hàng, gọi là "học bổng gia đình".' },
  { re: /tại sao (chị|anh|bạn|em) (chưa|không)/i, goi: 'Không chất vấn "tại sao" khi khách lưỡng lự.' }
];

// Soi Gương Thần mỗi ngày: 18 yếu tố của sáu hành tinh trong tiểu vũ trụ, lấy từ game "Khám Phá Tiểu Vũ Trụ Cùng Gương Thần"
// (sáu lớp soi của khóa We Are One / Wise Way to Be). "be" là ẩn dụ trong game, "hoi" là câu soi viết lại cho người bán, "nan" là nan quạt gần nhất.
var GUONG_NGAY = [
  { lop: 'Mối Quan Hệ', ht: 'Hành tinh Kết Nối', ic: '🌞', ten: 'Nguồn', be: 'Nguồn giống như mặt trời. Không thấy tay mặt trời, nhưng cây nào cũng lớn nhờ nắng. Trong mình cũng có một tia nắng như vậy.', hoi: 'Trước buổi gặp hôm nay, mình lấy năng lượng ở đâu để đến với khách bằng lòng ấm, không bằng nỗi lo doanh số?', nan: 2 },
  { lop: 'Mối Quan Hệ', ht: 'Hành tinh Kết Nối', ic: '🪞', ten: 'Chính Mình', be: 'Làm bạn với chính mình là biết mình đang vui hay đang buồn, rồi đối xử tử tế với mình, như với một người bạn thân.', hoi: 'Nếu là bạn thân của chính mình, sau buổi gặp chưa thành gần nhất, mình sẽ nói với mình câu gì?', nan: 9 },
  { lop: 'Mối Quan Hệ', ht: 'Hành tinh Kết Nối', ic: '👨‍👩‍👧', ten: 'Người Khác', be: 'Mỗi người quanh mình là một tiểu vũ trụ khác. Hiểu nhau một chút là hai vũ trụ chạm vào nhau.', hoi: 'Khách mình sắp gặp là một tiểu vũ trụ thế nào? Mình đã thật sự muốn hiểu họ, hay chỉ muốn họ hiểu sản phẩm?', nan: 3 },
  { lop: 'Nhu Cầu', ht: 'Hành tinh Nuôi Dưỡng', ic: '🍚', ten: 'Thể Chất', be: 'Thân thể là chiếc xe chở mình đi suốt đời. Xe cần xăng, cần nghỉ, cần được lau rửa.', hoi: 'Bữa ăn, giấc ngủ của gia đình khách đang ra sao? Mình đã hỏi đủ để thấy, chưa đoán thay khách?', nan: 3 },
  { lop: 'Nhu Cầu', ht: 'Hành tinh Nuôi Dưỡng', ic: '💭', ten: 'Cảm Xúc và Trí Tuệ', be: 'Cảm xúc như thời tiết trong lòng, có nắng có mưa. Trí óc như khu vườn, cần được gieo điều mới mẻ mỗi ngày.', hoi: 'Thời tiết trong lòng khách lúc nói về nhu cầu là nắng hay mưa? Mình đã lắng nghe cảm xúc đó chưa?', nan: 4 },
  { lop: 'Nhu Cầu', ht: 'Hành tinh Nuôi Dưỡng', ic: '🕊️', ten: 'Tâm Linh', be: 'Tâm linh là lúc mình lặng yên, biết ơn, và thấy mình thuộc về một điều lớn hơn mình.', hoi: 'Hôm nay mình biết ơn điều gì ở công việc này, ngoài tiền hoa hồng?', nan: 2 },
  { lop: 'Món Quà', ht: 'Hành tinh Châu Ngọc', ic: '⛏️', ten: 'Mỏ Châu Ngọc', be: 'Con là một mỏ châu ngọc. Ngọc đang nằm trong đất, chờ được đào lên và mài sáng. Học là cách mài ngọc.', hoi: 'Viên ngọc nào của mình khách hay nhờ đến nhất? Hôm nay mình mài nó thêm bằng việc gì?', nan: 5 },
  { lop: 'Món Quà', ht: 'Hành tinh Châu Ngọc', ic: '🧭', ten: 'Ý Chí Tự Do', be: 'Con luôn có quyền chọn. Chọn làm, chọn dừng, chọn thử lại. Chọn xong thì nhận lấy kết quả của mình.', hoi: 'Ở nan 7, mình có để khách thật sự được chọn, kể cả chọn chưa mua, không?', nan: 7 },
  { lop: 'Món Quà', ht: 'Hành tinh Châu Ngọc', ic: '🔔', ten: 'Lương Tâm', be: 'Lương tâm là cái chuông nhỏ trong lòng. Làm điều chưa phải, chuông kêu khe khẽ. Nghe thấy chuông là một món quà.', hoi: 'Lần gần nhất chuông lương tâm kêu khi đang tư vấn là lúc nào? Câu đó mình có dám nói với mẹ mình không?', nan: 4 },
  { lop: 'Bản Chất', ht: 'Hành tinh Gốc Rễ', ic: '❤️', ten: 'Yêu Thương', be: 'Yêu thương là muốn người kia được tốt, kể cả khi mình không được gì. Yêu thương làm mọi thứ dễ hơn.', hoi: 'Hôm nay mình làm một việc nhỏ nào cho một khách cũ mà không kèm lời chào hàng?', nan: 8 },
  { lop: 'Bản Chất', ht: 'Hành tinh Gốc Rễ', ic: '🙏', ten: 'Khiêm Nhường', be: 'Khiêm nhường là biết mình còn có thể học thêm. Người khiêm nhường hay hỏi, hay lắng nghe, ít khoe khoang.', hoi: 'Trong buổi gặp gần nhất, mình nói nhiều hơn hay nghe nhiều hơn? Khách đã dạy mình điều gì?', nan: 3 },
  { lop: 'Bản Chất', ht: 'Hành tinh Gốc Rễ', ic: '🫶', ten: 'Phụng Sự', be: 'Phụng sự là dùng cái mình giỏi để giúp ích cho người khác. Giúp xong lòng mình nhẹ, không cần ai khen.', hoi: 'Sản phẩm mình giới thiệu hôm nay giúp đúng nhu cầu nào của khách, hay chỉ là món mình muốn bán?', nan: 6 },
  { lop: 'Việc Làm', ht: 'Hành tinh Hành Động', ic: '🤫', ten: 'Vô Vi', be: '"Vô vi" là làm việc tốt mà không cần ai biết, không cần được khen. Như cái cây cho bóng mát mà chẳng đòi gì.', hoi: 'Mình đã hỏi thăm khách sau mua chỉ vì muốn khách ổn, không vì đơn tiếp theo, chưa?', nan: 8 },
  { lop: 'Việc Làm', ht: 'Hành tinh Hành Động', ic: '🎶', ten: 'Đồng Điệu', be: 'Đồng điệu là chơi cùng một nhịp với người khác. Không ai trên, không ai dưới. Lắng nghe trước, rồi mới nói.', hoi: 'Lúc nào trong buổi gặp mình và khách đã "cùng nhịp"? Lúc nào mình đi nhanh hơn khách?', nan: 2 },
  { lop: 'Việc Làm', ht: 'Hành tinh Hành Động', ic: '✨', ten: 'Bức Xạ', be: 'Bức xạ là nụ cười, lời nói tử tế, sự vui vẻ lan ra như ánh sáng. Một người sáng, cả phòng sáng theo.', hoi: 'Khách có thấy mình sáng lên khi kể chuyện thật về Siêu thị Vietwise không, hay mình đang đọc bài học thuộc sẵn?', nan: 5 },
  { lop: 'Thành Tựu', ht: 'Hành tinh Nở Hoa', ic: '🛠️', ten: 'Hữu Ích', be: 'Hữu ích là việc mình làm giúp được ai đó thật. Cái bàn hữu ích vì có người ngồi. Con hữu ích vì có người được giúp.', hoi: 'Câu TFBR mình dùng hôm nay có ích thật cho khách ở điểm nào? Khách đã nói gì sau câu R?', nan: 6 },
  { lop: 'Thành Tựu', ht: 'Hành tinh Nở Hoa', ic: '😊', ten: 'Hạnh Phúc', be: 'Hạnh phúc thật không phải có nhiều đồ chơi, mà là lòng mình vui vì vừa giúp ích cho ai đó bằng trái tim trong sáng.', hoi: 'Khách nào làm mình vui nhất tuần này vì họ thấy mình đã chọn đúng?', nan: 8 },
  { lop: 'Thành Tựu', ht: 'Hành tinh Nở Hoa', ic: '🌌', ten: 'Siêu Việt', be: 'Siêu việt là vượt lên chính mình: hôm qua chưa làm được, hôm nay làm được. Chưa dám, rồi dám. Lớn lên từ bên trong.', hoi: 'Nan nào hôm qua mình còn hụt mà hôm nay mình làm được hơn một chút?', nan: 9 }
];

// Vài câu Ẩn Ngôn (Bahá'u'lláh) đã dùng trong game Gương Thần. Bản Việt là bản tham khảo của game; ngoài Ả Rập số 1, số 4 và câu quặng mỏ, các câu khác chưa đối chiếu bản chính thức.
var AN_NGON = [
  { c: 'Hãy xem con người là quặng mỏ đầy châu ngọc vô giá. Chỉ có giáo dục mới khiến những châu ngọc đó được lộ ra và trở nên hữu ích cho nhân loại.', n: 'Thánh thư Bahá’í (Gleanings)' },
  { c: 'Lời khuyên đầu tiên của Ta là: hãy có một trái tim trong sạch, hiền hòa và rạng rỡ.', n: 'Ẩn Ngôn, phần Ả Rập, số 1' },
  { c: 'Hãy tự xét mình mỗi ngày, trước khi ngươi bị gọi đến để tính sổ.', n: 'Ẩn Ngôn' },
  { c: 'Hãy để việc làm, chứ không phải lời nói, là trang sức của các ngươi.', n: 'Ẩn Ngôn' },
  { c: 'Đừng gán cho ai điều mà ngươi không muốn bị gán cho mình, và đừng nói điều mà ngươi không làm.', n: 'Ẩn Ngôn' },
  { c: 'Các ngươi là những cái cây trong vườn của Ta; các ngươi phải sinh ra những trái lành và kỳ diệu, để chính các ngươi và người khác đều được hưởng lợi từ đó.', n: 'Ẩn Ngôn' },
  { c: 'Những người tốt nhất là những người kiếm sống bằng nghề của mình và chi dùng cho bản thân và cho người thân vì tình yêu Thượng Đế.', n: 'Ẩn Ngôn' },
  { c: 'Khi thịnh vượng đến với ngươi, đừng vui mừng quá; khi sa sút đến với ngươi, đừng buồn phiền; vì cả hai rồi sẽ qua đi.', n: 'Ẩn Ngôn' },
  { c: 'Ngươi chỉ còn cách đỉnh cao vinh quang một bước chân. Hãy bước một bước, rồi bước tiếp.', n: 'Ẩn Ngôn' }
];
