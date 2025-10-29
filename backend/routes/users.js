import express from 'express';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';
import {getProfile, updateProfile, updatePassword, createUserTemp, getAllCarts, getAllAddresses, getALlUsers, getUserById, addProductToCart, deleteCartItem, updateCartItem } from '../controller/userController.js'

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

// @desc    Add product to cart
// @route   POST /api/users/cart
// @access  Public/User
router.post('/cart', protect, addProductToCart);

// @desc    Update cart item
// @route   PUT /api/users/cart
// @access  Public/User
router.put('/cart', protect, updateCartItem); // thêm id product rồi update

// @desc    Delete cart item
// @route   DELETE /api/users/cart
// @access  Public/User
router.delete('/cart/:product_id', protect, deleteCartItem);  // thêm id product rồi xóa

// @desc    Get all carts by user
// @route   GET /api/users/cart
// @access  Public/User
router.get('/cart', protect, getAllCarts); // đã check ok

// @desc    Get all addresses by user
// @route   GET /api/users/addresses
// @access  Public/User
router.get('/address', protect, getAllAddresses); // thêm id của address rồi xóa, sửa

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, admin, getALlUsers); // đã check ok

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', protect, admin, getUserById); // đã check ok

export default router;