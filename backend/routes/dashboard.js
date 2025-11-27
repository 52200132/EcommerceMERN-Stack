import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { getDashboardGeneral, getDashboardAdvanced } from '../controller/dashboardController.js';

const router = express.Router();

// @desc    Get dashboard general info
// @route   GET /api/dashboard/general
// @access  Private/Admin
router.get('/general', protect, admin, getDashboardGeneral);

// @desc    Get dashboard advanced info
// @route   GET /api/dashboard/advanced
// @access  Private/Admin
router.get('/advanced', protect, admin, getDashboardAdvanced);

export default router;