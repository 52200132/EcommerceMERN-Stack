// tiny-file-picker.js
import { readAsDataURL, compressToDataURL } from 'utils/image-utils';

/**
 * TinyMCE custom file picker callback
 * @param {function} callback - TinyMCE callback để chèn ảnh vào editor
 * @param {string} value - Giá trị hiện tại trong input (nếu có)
 * @param {object} meta - Metadata của file (image/media/file)
 * @param {object} [options] - Tuỳ chọn thêm
 * @param {boolean} [options.compress=true] - Có nén ảnh base64 không
 * @param {number} [options.maxWidth=1280] - Kích thước tối đa khi nén
 * @param {number} [options.quality=0.82] - Chất lượng nén
 * @param {string} [options.mime='image/jpeg'] - Định dạng mime ảnh nén
 * @param {string} [options.uploadUrl] - URL API để upload ảnh (nếu có)
 */
export async function filePickerCallback(callback, value, meta, options = {}) {
  const {
    compress = true,
    maxWidth = 1280,
    quality = 0.82,
    mime = 'image/jpeg',
    uploadUrl = 'http://localhost:4000/upload',
  } = options;

  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');

  input.onchange = async function () {
    const file = this.files[0];
    if (!file) return;

    // Cho người dùng chọn cách xử lý
    const useUpload = window.confirm(
      'Nhấn OK để Upload ảnh lên server\nNhấn Cancel để chèn ảnh dạng Base64'
    );

    if (useUpload) {
      // --- Upload ảnh lên server ---
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch(uploadUrl, { method: 'POST', body: formData });
        const data = await res.json();
        callback(data.url, { alt: file.name });
      } catch (err) {
        alert('Upload thất bại');
        console.error(err);
      }
    } else {
      // --- Dùng base64 (có thể nén) ---
      const dataUrl = compress
        ? await compressToDataURL(file, maxWidth, quality, mime)
        : await readAsDataURL(file);
      callback(dataUrl, { alt: file.name });
    }
  };

  input.click();
}
