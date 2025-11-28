import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  createDiscountCode,
  getAllDiscountCodes,
  useDiscountCode,
  deleteDiscountCode,
  getDiscountCode,
  getDiscountCodeById,
  updateDiscountCode,
  getOrdersByDiscountCode
} from '../controller/discount_codeController.js';

const router = express.Router();

// @desc    create a new discount code
// @route   POST /api/discount-codes
// @access  Private/Admin
router.post('/', protect, admin, createDiscountCode); // da check ok

// @desc    use a discount code
// @route   POST /api/discount-codes/use
// @access  Public/User
router.post('/use', useDiscountCode); // da check ok

// @desc    get all discount codes
// @route   GET /api/discount-codes
// @access  Private/Admin
router.get('/', protect, admin, getAllDiscountCodes); // da check ok

// @desc    get a discount code
// @route   GET /api/discount-codes/code?code=<code>
// @access  Public/User-Admin
router.get('/code', protect, getDiscountCode); // da check ok

// @desc    get orders by discount code
// @route   GET /api/discount-codes/:code/orders
// @access  Private/Admin
router.get('/:code/orders', protect, admin, getOrdersByDiscountCode);

// @desc    get a discount code
// @route   GET /api/discount-codes/:id
// @access  Public/User-Admin
router.get('/:id', protect, getDiscountCodeById); // da check ok

// @desc    update a discount code
// @route   PUT /api/discount-codes/:id
// @access  Private/Admin
router.put('/:id', protect, admin, updateDiscountCode);

// @desc    delete a discount code
// @route   DELETE /api/discount-codes/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteDiscountCode); // da check ok

export default router;
