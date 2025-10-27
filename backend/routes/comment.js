import express from "express";
import { protect } from "../middleware/auth.js";
import { createComment, getCommentByProductId, updateUserComment, deleteUserComment } from "../controller/commentController.js";

const router = express.Router();

// @desc    Create a comment
// @route   POST /api/comments
// @access  Public/User or Guest
router.post("/", createComment);

// @desc    Get comments by product ID
// @route   GET /api/comments/product/:product_id
// @access  Public
router.get("/product/:product_id", getCommentByProductId);

// @desc Update User's comment
// @route PUT /api/comments/product/:product_id
// @access Private/User
router.put("/product/:product_id", protect, updateUserComment);

// @desc Delete User's comment
// @route DELETE /api/comments/product/:product_id
// @access Private/User
router.delete("/product/:product_id", protect, deleteUserComment);

export default router;