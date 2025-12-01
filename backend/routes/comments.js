import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createComment, getAllCommentsByProductId, updateUserComment, deleteUserComment,
  updateComment,
  deleteComment
} from "../controller/commentController.js";

const router = express.Router();

// @desc    Create a comment
// @route   POST /api/comments/product/:product_id
// @access  Public/User or Guest
router.post("/product/:product_id", createComment); //đã check ok

// @desc    Get comments by product ID
// @route   GET /api/comments/product/:product_id
// @access  Public/System
router.get("/product/:product_id", getAllCommentsByProductId); //đã check ok

router.put("/:comment_id", updateComment);
router.delete("/:comment_id", deleteComment);

// @desc Update User's comment
// @route PUT /api/comments/product/:product_id
// @access Private/User
router.put("/product/:product_id", protect, updateUserComment); //đã check ok

// @desc Delete User's comment
// @route DELETE /api/comments/product/:product_id
// @access Private/User
router.delete("/product/:product_id", protect, deleteUserComment); //đã check ok

export default router;