import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory
} from "../controller/categoryController.js";

const router = express.Router();

// @desc    Create a category
// @route   POST /api/categories
// @access  Manager/Admin
router.post("/", protect, createCategory);

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get("/", getAllCategories);

// @desc    Get a category by ID
// @route   GET /api/categories/:id
// @access  Public
router.get("/:id", getCategoryById);

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private
router.put("/:id", protect, updateCategory);

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private
router.delete("/:id", protect, deleteCategory);

export default router;
