// Chép lời ghi âm ngay trên điện thoại: Whisper (OpenAI) chạy bằng transformers.js 3.8.1 + ONNX Runtime (WASM).
// Lần đầu tải mô hình whisper-base (khoảng 80MB) từ huggingface.co, sau đó trình duyệt giữ lại, chạy không cần mạng.
// Âm thanh không rời máy: chỉ tải mô hình về, không gửi gì đi.
import { pipeline, env } from './transformers.min.js';

env.allowLocalModels = false;
env.useBrowserCache = true;
env.backends.onnx.wasm.wasmPaths = new URL('./', import.meta.url).href;
env.backends.onnx.wasm.numThreads = 1;

var MO_HINH = 'onnx-community/whisper-base', nghe = null;
function napMoHinh() {
  if (nghe) return nghe;
  var tai = {};
  nghe = pipeline('automatic-speech-recognition', MO_HINH, {
    dtype: 'q8', device: 'wasm',
    progress_callback: function (p) {
      if (p.status === 'progress' && p.total) { tai[p.file] = [p.loaded, p.total]; var a = 0, b = 0; for (var k in tai) { a += tai[k][0]; b += tai[k][1]; } postMessage({ loai: 'tai', da: a, tong: b }); }
    }
  }).catch(function (e) { nghe = null; throw e; });
  return nghe;
}

onmessage = async function (ev) {
  var m = ev.data;
  try {
    var asr = await napMoHinh();
    if (m.loai === 'nap') { postMessage({ loai: 'san' }); return; }
    var am = m.am, sr = 16000, doan = 28 * sr, so = Math.max(1, Math.ceil(am.length / doan)), chu = [];
    for (var i = 0; i < so; i++) {
      var mau = am.subarray(i * doan, Math.min(am.length, (i + 1) * doan));
      var im = 0; for (var j = 0; j < mau.length; j += 160) im += Math.abs(mau[j]);
      var t = '';
      if (im / (mau.length / 160) > 0.004) { var r = await asr(mau, { language: 'vietnamese', task: 'transcribe' }); t = String(r.text || '').trim(); }
      if (t && !/^(\[.*\]|\(.*\)|…|\.+)$/.test(t)) chu.push(t);
      postMessage({ loai: 'doan', xong: i + 1, tong: so, chu: t });
    }
    postMessage({ loai: 'xong', chu: chu.join('\n') });
  } catch (e) { postMessage({ loai: 'loi', loi: String(e && e.message || e) }); }
};
