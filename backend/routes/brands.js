import express from "express";
import { protect } from "../middleware/auth.js";
import { createBrand, getAllBrands, getBrandById, updateBrand, deleteBrand } from "../controller/brandController.js";
const router = express.Router();

// @desc    Create a brand
// @route   POST /api/brands
// @access  Manager/Admin
router.post("/", protect, createBrand);

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
router.get("/", getAllBrands);

// @desc    Get a brand by ID
// @route   GET /api/brands/:id
// @access  Public
router.get("/:id", getBrandById);

// @desc    Update a brand
// @route   PUT /api/brands/:id
// @access  Private
router.put("/:id", protect, updateBrand);

// @desc    Delete a brand
// @route   DELETE /api/brands/:id
// @access  Private
router.delete("/:id", protect, deleteBrand);

export default router;