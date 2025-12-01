import express from 'express';
import Order from '../models/Order.js';
import { protect, admin } from '../middleware/auth.js';
import {
  userCancelOrder,
  createOrder,
  getOrderByUserId,
  getStatusHistoryByOrderId,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrdersOverview
} from '../controller/orderController.js';

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Public - User
router.post('/', createOrder);

// @desc    Get all orders
// @route   GET /api/orders?start=<>&end=<>&date=<>
// @access  Private - Admin
router.get('/', protect, admin, getAllOrders);

// @desc    Get overview of orders by status & day
// @route   GET /api/orders/overview
// @access  Private - Admin
router.get('/overview', protect, admin, getOrdersOverview);

// @desc    Get order by User_ID
// @route   GET /api/orders/myorders
// @access  Private - User
router.get('/myorders', protect, getOrderByUserId);

// @desc    Get order by ID
// @route   GET /api/orders/:order_id
// @access  Private - User
router.get('/:order_id', protect, getOrderById);

// @desc    Get status history by order ID
// @route   GET /api/orders/:order_id/status
// @access  Private - User
router.get('/:order_id/history_status', protect, getStatusHistoryByOrderId); // user nào thì xem được lich sử đơn hàng của user đó

// @desc    Update order status
// @route   PUT /api/orders/:order_id/status
// @access  Private - Admin
router.put('/:order_id/status', protect, admin, updateOrderStatus);

// @desc    Update order status
// @route   PUT /api/orders/:order_id/cancel
// @access  Public - User
router.put('/:order_id/cancel', protect, userCancelOrder);

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router
