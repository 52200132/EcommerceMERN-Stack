// helpers: đọc file -> dataURL
export const readAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

// (tuỳ chọn) nén/resize ảnh trước khi chuyển sang dataURL (giúp HTML nhẹ hơn)
export async function compressToDataURL(file, maxW = 1280, quality = 0.82, mime = 'image/jpeg') {
  const url = URL.createObjectURL(file);
  const img = await new Promise((res, rej) => {
    const el = new Image();
    el.onload = () => res(el);
    el.onerror = rej;
    el.src = url;
  });

  const scale = Math.min(1, maxW / img.width);
  if (scale >= 1) {
    URL.revokeObjectURL(url);
    return readAsDataURL(file); // không cần nén
  }

  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(url);
  return canvas.toDataURL(mime, quality);
}
