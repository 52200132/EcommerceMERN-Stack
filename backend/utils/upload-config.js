import fs from "fs";
import path from "path";

const ensureDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const uploadRoot = path.resolve(process.cwd(), "uploads");
const imagesDir = path.join(uploadRoot, "images");
const tempDir = path.join(uploadRoot, "tmp");

[uploadRoot, imagesDir, tempDir].forEach(ensureDirectory);

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit as required

export const uploadConfig = {
  fieldName: "image",
  allowedMimeTypes: ALLOWED_MIME_TYPES,
  maxFileSize: MAX_FILE_SIZE_BYTES,
  maxFiles: 10,
  directories: {
    root: uploadRoot,
    images: imagesDir,
    temp: tempDir,
  },
  resize: {
    width: 1280,
    height: 1280,
    fit: "inside",
  },
  quality: {
    jpeg: 75,
    png: 75,
    webp: 75,
  },
};
