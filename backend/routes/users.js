import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  updatePassword,
  createUserTemp,
  getAllCarts,
  getAllAddresses,
  addAddress,
  getAllUsers, getUserById, addProductToCart, deleteCartItem, updateCartItem, deleteAddress, updateAddress,
  updateUserById
} from '../controller/userController.js'

const router = express.Router();

// @desc    Get user's profile
// @route   GET /api/users/profile
// @access  Public/User
router.get('/profile', protect, getProfile); // đã check ok

// @desc    Update user's profile
// @route   PUT /api/users/profile
// @access  Public/User
router.put('/profile', protect, updateProfile); // đã check ok

// @desc    Update user's password
// @route   PUT /api/users/profile/password
// @access  Public/User
router.put('/profile/password', protect, updatePassword); // đã check ok

// @desc    Create a temporary user
// @route   POST /api/users/temp
// @access  Public/User
router.post('/temp', createUserTemp); // đã check ok

// @desc    Get all carts by user
// @route   GET /api/users/cart
// @access  Public/User
router.get('/cart', protect, getAllCarts); // đã check ok

// @desc    Add product to cart
// @route   POST /api/users/cart
// @access  Public/User
router.post('/cart', protect, addProductToCart); // đã check ok

// @desc    Update cart item
// @route   PUT /api/users/cart/:product_id?sku=<sku>
// @access  Public/User
router.put('/cart/:product_id', protect, updateCartItem); // đã check ok

// @desc    Delete cart item
// @route   DELETE /api/users/cart/:product_id?sku=<sku>
// @access  Public/User
router.delete('/cart/:product_id', protect, deleteCartItem); // đã check ok

// @desc    Get all addresses by user
// @route   GET /api/users/addresses
// @access  Private/User
router.get('/addresses', protect, getAllAddresses); // đã check ok

// @desc    Add an address by user
// @route   POST /api/users/addresses
// @access  Private/User
router.post('/addresses', protect, addAddress); // đã check ok

// @desc    Update an address by user
// @route   PUT /api/users/addresses/:address_id
// @access  Private/User
router.put('/addresses/:address_id', protect, updateAddress); // đã check ok

// @desc    Delete an address by user
// @route   DELETE /api/users/addresses/:address_id
// @access  Private/User
router.delete('/addresses/:address_id', protect, deleteAddress); // đã check ok

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, admin, getAllUsers); // đã check ok

// @desc    Get user by ID
// @route   GET /api/users/:user_id
// @access  Private/Admin
router.get('/:user_id', protect, admin, getUserById); // đã check ok

// @desc    Update user by ID
// @route   PUT /api/users/:user_id
// @access  Private/Admin
router.put('/:user_id', protect, admin, updateUserById);

export default router;