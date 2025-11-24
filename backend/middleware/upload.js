import crypto from "crypto";
import path from "path";
import multer from "multer";
import { uploadConfig } from "#utils";

const allowedMimeTypes = new Set(uploadConfig.allowedMimeTypes);
const defaultErrorMessage = "File không hợp lệ hoặc kích thước vượt quá giới hạn";

const sanitizeFilename = (filename) =>
  filename
    .normalize("NFD")
    .replace(/[^a-zA-Z0-9.\-\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase() || "image";

const resolveExtension = (file) => {
  const extFromName = path.extname(file.originalname || "").toLowerCase();
  if (extFromName) {
    return extFromName;
  }

  switch (file.mimetype) {
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/jpeg":
    default:
      return ".jpg";
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadConfig.directories.temp);
  },
  filename: (req, file, cb) => {
    const extension = resolveExtension(file);
    const safeBaseName = sanitizeFilename(path.basename(file.originalname, extension));
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    cb(null, `${uniqueSuffix}-${safeBaseName}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.has(file.mimetype)) {
    cb(null, true);
    return;
  }

  const error = new multer.MulterError("LIMIT_UNEXPECTED_FILE", uploadConfig.fieldName);
  error.code = "UNSUPPORTED_FILE_TYPE";
  cb(error);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: uploadConfig.maxFileSize },
});

const createUploadMiddleware = (maxFiles = 1) => (req, res, next) => {
  upload.array(uploadConfig.fieldName, maxFiles)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        let message = defaultErrorMessage;

        if (err.code === "LIMIT_FILE_SIZE") {
          message = "Kích thước ảnh vượt quá 5MB";
        } else if (err.code === "UNSUPPORTED_FILE_TYPE") {
          message = "Định dạng ảnh không được hỗ trợ";
        }

        return res.status(400).json({ success: false, message });
      }

      return next(err);
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: defaultErrorMessage });
    }

    req.files = req.files.slice(0, maxFiles);
    req.file = req.files[0];

    next();
  });
};

export const uploadSingleImage = createUploadMiddleware(1);
export const uploadMultipleImages = createUploadMiddleware(uploadConfig.maxFiles);
