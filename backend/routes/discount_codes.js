import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { createDiscountCode, getAllDiscountCodes, useDiscountCode, deleteDiscountCode, getDiscountCode, getDiscountCodeById, updateDiscountCode } from '../controller/discount_codeController.js';

const router = express.Router();

// @desc    create a new discount code
// @route   POST /api/discount_codes
// @access  Private/Admin
router.post('/', protect, admin, createDiscountCode); // đã check ok

// @desc    use a discount code
// @route   POST /api/discount_codes/use
// @access  Public/User
router.post('/use', useDiscountCode); // đã check ok

// @desc    get all discount codes
// @route   GET /api/discount_codes
// @access  Private/Admin
router.get('/', protect, admin, getAllDiscountCodes); // đã check ok

// @desc    get a discount code
// @route   GET /api/discount_codes/code?code=<code>
// @access  Public/User-Admin
router.get('/code', protect, getDiscountCode); // đã check ok

// @desc    get a discount code
// @route   GET /api/discount_codes/:id
// @access  Public/User-Admin
router.get('/:id', protect, getDiscountCodeById); // đã check ok

// @desc    update a discount code
// @route   PUT /api/discount_codes/:id
// @access  Private/Admin
router.put('/:id', protect, admin, updateDiscountCode);

// @desc    delete a discount code
// @route   DELETE /api/discount_codes/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteDiscountCode); // đã check ok

export default router;