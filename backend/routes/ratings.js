import express from "express";
import { protect } from "../middleware/auth.js";
import { createRating, updateRating, deleteRating, getAllRatingsByProduct, getAllRatingsByUser } from "../controller/ratingController.js";

const router = express.Router();

// @desc    Create a rating
// @route   POST /api/ratings/product/:product_id
// @access  Private
router.post("/product/:product_id", protect, createRating); //đã check ok

// @desc    Update a rating
// @route   PUT /api/ratings/:rating_id
// @access  Private
router.put("/:rating_id", protect, updateRating); //đã check ok

// @desc    Delete a rating
// @route   DELETE /api/ratings/:rating_id
// @access  Private
router.delete("/:rating_id", protect, deleteRating); //đã check ok

// @desc    Get all ratings by product
// @route   GET /api/ratings/product/:product_id
// @access  Private
router.get("/product/:product_id", getAllRatingsByProduct); //đã check ok

// @desc    Get all ratings by user
// @route   GET /api/ratings/user
// @access  Private
router.get("/user", protect, getAllRatingsByUser); //đã check ok

export default router;