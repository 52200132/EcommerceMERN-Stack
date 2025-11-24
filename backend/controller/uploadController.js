import path from "path";
import sharp from "sharp";
import { promises as fs } from "fs";
import { uploadConfig } from "#utils";

const formatMap = {
  "image/jpeg": { format: "jpeg", extension: ".jpg", mimeType: "image/jpeg" },
  "image/png": { format: "png", extension: ".png", mimeType: "image/png" },
  "image/webp": { format: "webp", extension: ".webp", mimeType: "image/webp" },
};

const fallbackFormat = formatMap["image/jpeg"];

const removeFileQuietly = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Không thể xoá file tạm:", error.message);
    }
  }
};

const buildBaseUrl = (req) => {
  const envUrl = process.env.APP_URL?.trim();

  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}`;
};

const ensureExtension = (filename, desiredExt) => {
  const currentExt = path.extname(filename).toLowerCase();
  const normalizedDesired = desiredExt.toLowerCase();

  if (currentExt === normalizedDesired) {
    return filename;
  }

  const baseName = currentExt ? path.basename(filename, currentExt) : filename;
  return `${baseName}${normalizedDesired}`;
};

const applyFormatOptions = (instance, formatKey) => {
  if (formatKey === "png") {
    return instance.png({
      quality: uploadConfig.quality.png,
      compressionLevel: 9,
      adaptiveFiltering: true,
      palette: true,
    });
  }

  if (formatKey === "webp") {
    return instance.webp({
      quality: uploadConfig.quality.webp,
    });
  }

  return instance.jpeg({
    quality: uploadConfig.quality.jpeg,
    mozjpeg: true,
  });
};

const optimizeAndStoreImage = async (file) => {
  const formatConfig = formatMap[file.mimetype] || fallbackFormat;
  const formattedName = ensureExtension(file.filename, formatConfig.extension);
  const finalPath = path.join(uploadConfig.directories.images, formattedName);

  const transformer = sharp(file.path)
    .rotate()
    .resize({
      width: uploadConfig.resize.width,
      height: uploadConfig.resize.height,
      fit: uploadConfig.resize.fit,
      withoutEnlargement: true,
    });

  const info = await applyFormatOptions(transformer, formatConfig.format).toFile(finalPath);

  return {
    info,
    formattedName,
    mimeType: formatConfig.mimeType,
    finalPath,
  };
};

const formatUploadResponse = (req, file, info, formattedName, mimeType) => {
  const publicPath = `/uploads/images/${formattedName}`;
  const absoluteUrl = `${buildBaseUrl(req)}${publicPath}`;

  return {
    url: absoluteUrl,
    path: publicPath,
    originalName: file.originalname,
    size: info.size,
    mimeType,
    width: info.width,
    height: info.height,
  };
};

const processFile = async (req, file) => {
  try {
    const { info, formattedName, mimeType } = await optimizeAndStoreImage(file);
    return formatUploadResponse(req, file, info, formattedName, mimeType);
  } finally {
    await removeFileQuietly(file.path);
  }
};

const processFiles = async (req, files = []) => {
  const payloads = [];
  for (const file of files) {
    const result = await processFile(req, file);
    payloads.push(result);
  }
  return payloads;
};

export const uploadImageController = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "File không hợp lệ hoặc kích thước vượt quá giới hạn",
    });
  }

  try {
    const [payload] = await processFiles(req, [req.file]);

    return res.status(200).json({
      success: true,
      message: "Upload thành công",
      ...payload,
    });
  } catch (error) {
    return next(error);
  }
};

export const uploadMultipleImagesController = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Không nhận được ảnh hợp lệ",
    });
  }

  try {
    const payloads = await processFiles(req, req.files);

    return res.status(200).json({
      success: true,
      message: "Upload thành công",
      files: payloads,
      count: payloads.length,
    });
  } catch (error) {
    return next(error);
  }
};
