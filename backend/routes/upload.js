import express from "express";
import { uploadMultipleImages, uploadSingleImage } from "#middleware";
import { uploadImageController, uploadMultipleImagesController } from "../controller/uploadController.js";

const router = express.Router();

router.post("/image", uploadSingleImage, uploadImageController);
router.post("/images", uploadMultipleImages, uploadMultipleImagesController);

export default router;
