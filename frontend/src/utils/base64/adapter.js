import { readAsDataURL, compressToDataURL } from './image-utils';

export default class Base64UploadAdapter {
  constructor(loader, opts) {
    this.loader = loader;
    this.opts = { compress: true, maxWidth: 1280, quality: 0.82, mime: 'image/jpeg', ...opts };
  }
  async upload() {
    const file = await this.loader.file;
    if (!file?.type?.startsWith('image/')) {
      throw new Error('Only image uploads are allowed.');
    }
    const { compress, maxWidth, quality, mime } = this.opts;
    const dataUrl = compress
      ? await compressToDataURL(file, maxWidth, quality, mime)
      : await readAsDataURL(file);
    // CKEditor cần key 'default'
    return { default: dataUrl };
  }
  abort() {} // không cần xử lý
}
