// Bộ hình Quạt Thần CTV: vẽ bằng SVG theo màu logo (navy, vàng kim, tím, hồng sen), nhẹ và chạy offline.
var ART = (function () {
  var n = 0;
  function id(t) { n++; return t + n; }
  function xu(x, y, r, xoay) {
    var g = id('xu');
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (xoay || 0) + ')"><defs><radialGradient id="' + g + '" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fff3b0"/><stop offset=".45" stop-color="#f2c230"/><stop offset="1" stop-color="#a87406"/></radialGradient></defs>' +
      '<circle r="' + r + '" fill="url(#' + g + ')" stroke="#8a5e00" stroke-width="' + (r / 9).toFixed(1) + '"/>' +
      '<circle r="' + (r * .74).toFixed(1) + '" fill="none" stroke="#a87406" stroke-width="' + (r / 12).toFixed(1) + '" stroke-dasharray="' + (r / 5).toFixed(1) + ' ' + (r / 8).toFixed(1) + '"/>' +
      '<rect x="' + (-r * .26).toFixed(1) + '" y="' + (-r * .26).toFixed(1) + '" width="' + (r * .52).toFixed(1) + '" height="' + (r * .52).toFixed(1) + '" fill="#1b2f86" stroke="#8a5e00" stroke-width="' + (r / 14).toFixed(1) + '"/>' +
      '<path d="M' + (-r * .7).toFixed(1) + ' ' + (-r * .3).toFixed(1) + ' A' + (r * .78).toFixed(1) + ' ' + (r * .78).toFixed(1) + ' 0 0 1 ' + (-r * .2).toFixed(1) + ' ' + (-r * .74).toFixed(1) + '" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="' + (r / 8).toFixed(1) + '" stroke-linecap="round"/></g>';
  }
  function sao(x, y, r, mau, mo) {
    return '<path transform="translate(' + x + ' ' + y + ')" d="M0 ' + (-r) + ' Q' + (r * .18) + ' ' + (-r * .18) + ' ' + r + ' 0 Q' + (r * .18) + ' ' + (r * .18) + ' 0 ' + r + ' Q' + (-r * .18) + ' ' + (r * .18) + ' ' + (-r) + ' 0 Q' + (-r * .18) + ' ' + (-r * .18) + ' 0 ' + (-r) + 'Z" fill="' + (mau || '#fff') + '" opacity="' + (mo || .9) + '"/>';
  }
  function ngocHinh(x, y, s, c1, c2) {
    var g = id('ng');
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs>' +
      '<path d="M-12 -4 L-6 -12 L6 -12 L12 -4 L0 14 Z" fill="url(#' + g + ')" stroke="#fff" stroke-opacity=".6" stroke-width="1"/>' +
      '<path d="M-12 -4 L12 -4 M-6 -12 L-3 -4 L0 14 M6 -12 L3 -4 L0 14 M-3 -4 L0 -12 L3 -4" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width=".8"/>' +
      '<path d="M-6 -12 L-3 -4 L-12 -4 Z" fill="#fff" opacity=".35"/></g>';
  }
  function sen(x, y, s) {
    var g1 = id('sen'), g2 = id('sen');
    function canh(goc, dai, rong, g) { return '<path transform="rotate(' + goc + ')" d="M0 0 C' + (-rong) + ' ' + (-dai * .35) + ' ' + (-rong * .7) + ' ' + (-dai * .85) + ' 0 ' + (-dai) + ' C' + (rong * .7) + ' ' + (-dai * .85) + ' ' + rong + ' ' + (-dai * .35) + ' 0 0Z" fill="url(#' + g + ')" stroke="#b83f78" stroke-width=".8"/>'; }
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><defs><linearGradient id="' + g1 + '" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e0609c"/><stop offset="1" stop-color="#ffd6e8"/></linearGradient><linearGradient id="' + g2 + '" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#c94785"/><stop offset="1" stop-color="#f7a8cb"/></linearGradient></defs>' +
      '<ellipse cx="0" cy="2" rx="30" ry="5" fill="#2f8a5a" opacity=".85"/>' +
      canh(-68, 20, 8, g2) + canh(68, 20, 8, g2) + canh(-40, 25, 9, g1) + canh(40, 25, 9, g1) + canh(-14, 29, 9, g1) + canh(14, 29, 9, g1) + canh(0, 31, 9, g2) +
      '<circle cx="0" cy="-6" r="3" fill="#ffd84d"/></g>';
  }
  function quatNho(cx, cy, R) {
    var mau = ['#f2c230', '#fbe7a6', '#f2c230', '#8e3fd1', '#fbe7a6', '#f2c230', '#8e3fd1', '#fbe7a6', '#8e3fd1'], s = '', b = Math.PI / 9;
    function d(a, r) { return (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1); }
    for (var k = 0; k <= 9; k++) s += '<path d="M' + d(Math.PI + k * b, 4) + ' L' + d(Math.PI + k * b, R * .42) + '" stroke="#7a4a1f" stroke-width="' + (R / 34).toFixed(1) + '" stroke-linecap="round"/>';
    for (var i = 0; i < 9; i++) {
      var a1 = Math.PI + i * b, a2 = a1 + b, am = (a1 + a2) / 2, r0 = R * .4;
      s += '<path d="M' + d(a1, r0) + ' L' + d(a1, R) + ' A' + R + ' ' + R + ' 0 0 1 ' + d(a2, R) + ' L' + d(a2, r0) + ' A' + r0 + ' ' + r0 + ' 0 0 0 ' + d(a1, r0) + 'Z" fill="' + mau[i] + '" stroke="#b98207" stroke-width=".8"/>';
      s += '<path d="M' + d(am, r0) + ' L' + d(am, R) + ' A' + R + ' ' + R + ' 0 0 1 ' + d(a2, R) + ' L' + d(a2, r0) + 'Z" fill="#0f1c5c" opacity=".14"/>';
    }
    s += '<path d="M' + d(Math.PI, R) + ' A' + R + ' ' + R + ' 0 0 1 ' + d(0, R) + '" fill="none" stroke="#ffd84d" stroke-width="' + (R / 26).toFixed(1) + '"/>';
    return s + '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R / 9).toFixed(1) + '" fill="#f2c230" stroke="#8a5e00" stroke-width="1"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (R / 20).toFixed(1) + '" fill="#8e3fd1"/>';
  }
  function hero() {
    var g = id('hr'), q = id('hq'), s = '<svg class="hero-hinh" viewBox="0 0 360 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' +
      '<linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f1c5c"/><stop offset=".6" stop-color="#1b2f86"/><stop offset="1" stop-color="#3a2a9a"/></linearGradient>' +
      '<radialGradient id="' + q + '" cx="268" cy="140" r="130" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffd84d" stop-opacity=".75"/><stop offset=".45" stop-color="#f2c230" stop-opacity=".25"/><stop offset="1" stop-color="#f2c230" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="360" height="150" fill="url(#' + g + ')"/><circle cx="268" cy="140" r="130" fill="url(#' + q + ')"/>';
    for (var i = 0; i < 16; i++) { var a = Math.PI + (i + .5) * Math.PI / 16, a2 = a + .07; s += '<path class="tia" d="M268 140 L' + (268 + 240 * Math.cos(a)).toFixed(0) + ' ' + (140 + 240 * Math.sin(a)).toFixed(0) + ' L' + (268 + 240 * Math.cos(a2)).toFixed(0) + ' ' + (140 + 240 * Math.sin(a2)).toFixed(0) + 'Z" fill="#ffd84d" opacity=".13"/>'; }
    s += '<g class="hero-quat">' + quatNho(268, 140, 86) + '</g>' + sen(268, 150, 1.25);
    s += '<g class="bay">' + xu(196, 42, 11, -15) + xu(338, 36, 9, 20) + xu(214, 106, 7, 10) + '</g>' + ngocHinh(344, 92, .7, '#c08cff', '#6a22b0') + ngocHinh(184, 74, .55, '#ffc1dc', '#e0609c');
    s += sao(160, 20, 6, '#ffd84d') + sao(330, 64, 4) + sao(232, 18, 4) + sao(20, 128, 5, '#ffd84d', .6) + sao(140, 132, 3, '#fff', .6) + sao(300, 12, 5, '#fff', .8);
    return s + '</svg>';
  }
  function icon(loai) {
    var s = '<svg viewBox="0 0 64 64" aria-hidden="true">';
    if (loai === 1) { // sách mở và quạt: Lý thuyết
      s += '<circle cx="32" cy="32" r="30" fill="#fff3cf"/>' + quatNho(32, 30, 20) +
        '<path d="M8 36 Q20 31 32 37 Q44 31 56 36 L56 54 Q44 49 32 55 Q20 49 8 54Z" fill="#1b2f86"/><path d="M10 37 Q21 33 31 38 L31 53 Q21 48 10 52Z" fill="#fffdf6"/><path d="M54 37 Q43 33 33 38 L33 53 Q43 48 54 52Z" fill="#fbe7a6"/>' +
        '<path d="M14 41 Q21 39 28 42 M14 45 Q21 43 28 46 M36 42 Q43 39 50 41 M36 46 Q43 43 50 45" stroke="#8e3fd1" stroke-width="1.2" fill="none" opacity=".6"/>' + sao(52, 12, 4, '#f2c230');
    } else if (loai === 2) { // rổ quà tài lộc: Chuẩn bị
      s += '<circle cx="32" cy="32" r="30" fill="#f4eafc"/>' +
        '<path d="M22 24 C20 14 30 12 32 20 C34 12 44 14 42 24Z" fill="#2f8a5a"/><path d="M32 20 L32 30" stroke="#1f6b43" stroke-width="1.5"/>' +
        '<circle cx="23" cy="30" r="7" fill="#e0609c"/><circle cx="21" cy="28" r="2" fill="#fff" opacity=".6"/>' + xu(40, 28, 7, 15) + '<circle cx="31" cy="27" r="5.5" fill="#ffd84d" stroke="#d9a514"/>' +
        '<path d="M12 32 H52 L47 54 Q46 56 44 56 H20 Q18 56 17 54Z" fill="#b97a3a" stroke="#7a4a1f" stroke-width="1.5"/>' +
        '<path d="M14 39 H50 M15.5 46 H48.5 M22 32 L23 56 M32 32 V56 M42 32 L41 56" stroke="#7a4a1f" stroke-width="1.3" opacity=".7"/><path d="M10 32 H54" stroke="#f2c230" stroke-width="3" stroke-linecap="round"/>' + sao(53, 13, 4, '#f2c230');
    } else { // Gương Thần: Review điêu luyện
      var g = id('gl');
      s += '<circle cx="32" cy="32" r="30" fill="#e8edfd"/><defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b57af0"/><stop offset=".55" stop-color="#3a2a9a"/><stop offset="1" stop-color="#0f1c5c"/></linearGradient></defs>' +
        '<ellipse cx="32" cy="27" rx="15" ry="19" fill="#f2c230" stroke="#a87406" stroke-width="1.5"/><ellipse cx="32" cy="27" rx="11" ry="15" fill="url(#' + g + ')"/>' +
        '<path d="M25 18 Q28 14 33 13" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>' + ngocHinh(32, 28, .5, '#fff3b0', '#f2c230') + sen(32, 57, .55) + sao(50, 12, 4, '#f2c230') + sao(14, 16, 3, '#8e3fd1');
    }
    return s + '</svg>';
  }
  return {
    hero: hero, icon: icon,
    xu: function (r) { return '<svg class="xu-ic" viewBox="-12 -12 24 24" aria-hidden="true">' + xu(0, 0, 11, 0) + '</svg>'; },
    ngoc: function (c1, c2) { return '<svg class="ngoc-ic" viewBox="-14 -14 28 30" aria-hidden="true">' + ngocHinh(0, 0, 1, c1, c2) + '</svg>'; },
    sen: function () { return '<svg class="sen-ic" viewBox="-34 -36 68 42" aria-hidden="true">' + sen(0, 0, 1) + '</svg>'; },
    xuRoi: function () { return '<svg viewBox="-12 -12 24 24">' + xu(0, 0, 11, 0) + '</svg>'; }
  };
})();
