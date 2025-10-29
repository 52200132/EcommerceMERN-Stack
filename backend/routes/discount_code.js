import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { createDiscountCode, getAllDiscountCodes, useDiscountCode, deleteDiscountCode } from '../controller/discount_codeController.js';

const router = express.Router();

// @desc    create a new discount code
// @route   POST /api/discount-codes
// @access  Private/Admin
router.post('/create', protect, admin, createDiscountCode); // đã check ok

// @desc    get all discount codes
// @route   GET /api/discount-codes
// @access  Private/Admin
router.get('/all', protect, admin, getAllDiscountCodes); // đã check ok

// @desc    delete a discount code
// @route   DELETE /api/discount-codes/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteDiscountCode); // đã check ok

// @desc    use a discount code
// @route   POST /api/discount-codes/use
// @access  Public/User
router.post('/use', useDiscountCode); // đã check ok

export default router;