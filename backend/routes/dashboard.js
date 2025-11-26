import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { getDashboardGeneral } from '../controller/dashboardController.js';

const router = express.Router();

// @desc    Get dashboard general info
// @route   GET /api/dashboard/general
// @access  Private/Admin
router.get('/general', protect, admin, getDashboardGeneral);
export default router;