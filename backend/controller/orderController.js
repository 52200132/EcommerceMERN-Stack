import Order from "../models/Order.js"
import DiscountCode from '../models/DiscountCode.js';
import User from "../models/User.js";

// User functions
export const createOrder = async (req, res) => {
    try {
        const user_id = req.user._id;
        const {
            Items, // mảng các item trong đơn hàng frontend xử lý truyền vào
            discount_code,
            points_used,
            shipping_address_id, // truyền id của địa chỉ đã lưu trong user
            shipment,
            payment_method,
            notes
        } = req.body;
        // Tiền xử lý dữ liệu trước khi tạo đơn hàng

        // lấy địa chỉ giao hàng từ user
        const shipping_address = req.user.Addresses.id(shipping_address_id);

        // tính tổng tiền hàng
        const total_amount = Items.reduce((sum, item) => {
            return sum + item.variant.price * item.quantity;
        }, 0);

        // cập nhật điểm người dùng nếu có sử dụng điểm
        const user = await User.findById(user_id).select('points');
        user.points = Math.max(0, user.points - points_used);
        await user.save();

        // tính giảm giá từ mã giảm giá nếu có
        const Dcode = await DiscountCode.findOne({ code: discount_code });
        const discount = Dcode ? Dcode.discount : 0;

        // tính grand_total
        const grand_total = Math.max(0, total_amount + shipment.fee - discount - points_used * 1000);

        const newOrder = await new Order({
            user_id,
            Items,
            discount_code,
            points_used,
            shipping_address,
            total_amount,
            discount,
            grand_total,
            shipment,
            payment_method,
            notes
        });
        await newOrder.save();
        res.status(201).json({ ec: 0, em: "Order created successfully", dt: newOrder });
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
    //• Quy trình thanh toán: Hướng dẫn người dùng thực hiện quy trình nhiều bước để nhập thông tin thanh toán và vận chuyển, cũng như xác nhận đơn hàng.
    //• Thanh toán cho khách: Cho phép người dùng hoàn tất giao dịch mua mà không cần tạo tài khoản.

    // TODO: tạo usertemp nếu chưa có đăng nhập và gán đon hàng cho usertemp đó
    // TODO: Sau khi tạo đơn hàng (nếu thanh toán online) gọi phương thức thanh toán
    // TODO: Cập nhật thanh toán sau đó gửi email xác nhận đơn hàng với thông tin chi tiết về đơn hàng.
};

export const getOrderByUserId = async (req, res) => {
    try {
        const user_id = req.user._id;
        const orders = await Order.find({ user_id }).select('-StatusHistory -shipping_address -shipment -__v').sort('-createdAt');
        res.status(201).json({ ec: 0, em: "Orders getted successfully", dt: orders });
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};
// Get status history by order ID
// user nào thì xem được lich sử đơn hàng của user đó
export const getStatusHistoryByOrderId = async (req, res) => {
    try {
        const order_id = req.params.order_id;
        const user_id = req.user._id;
        const order = await Order.findById(order_id, user_id).select('StatusHistory').populate('StatusHistory.change_by', 'username email');
        res.status(201).json({ ec: 0, em: "Status History getted successfully", dt: order.StatusHistory });
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};
// Common function
export const getOrderById = async (req, res) => {
    try {
        const order_id = req.params.order_id;
        const order = await Order.findById(order_id).populate('StatusHistory.change_by', 'username email');
        res.status(201).json({ ec: 0, em: "Order getted successfully", dt: order });
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};

// Admin functions
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().select('-StatusHistory -shipping_address -shipment -__v').sort('-createdAt');
        res.status(201).json({ ec: 0, em: "All Orders getted successfully", dt: orders });
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};
// Cách hàm update status phải dùng save() để kích hoạt hook pre/post
export const updateOrderStatus = async (req, res) => {
    try {
        const order_id = req.params.order_id;
        const { order_status } = req.body;
        const order = await Order.findById(order_id).select('_id user_id order_status StatusHistory points_used total_amount');
        if (!order) {
            return res.status(404).json({ ec: 404, em: "Order not found" });
        }
        order.order_status = order_status;
        // Cập nhật lịch sử thay đổi trạng thái
        order.StatusHistory.push({
            status: order_status,
            change_at: new Date(),
            change_by: req.user._id
        });
        await order.save();

        // Xử lý điểm khách hàng thân thiết
        // Lấy user
        const user = await User.findById(order.user_id).select('points');
        if (!user) {
            return res.status(404).json({ ec: 404, em: "User not found" });
        };

        // Nếu đơn được giao (delivered) thì cộng điểm
        if (order.order_status === 'delivered') {
            // console.log('Points used before adding for user:', user.points);
            user.points += parseInt((order.total_amount * 0.1) / 1000);
            // console.log(parseInt((order.total_amount * 0.1) / 1000))
            // console.log('User points after delivery:', user.points);
            await user.save();
        }

        // Nếu đơn bị hủy sau khi đã giao thì trừ điểm
        else if (order.order_status === 'cancelled') {
            // console.log('Points used before refunding for user:', user.points);
            user.points += parseInt(order.points_used); // hoàn trả điểm đã dùng
            if (user.points < 0) user.points = 0; // tránh âm
            // console.log('Points used:', parseInt(order.points_used));
            // console.log('User points after cancellation:', user.points);
            await user.save();
        }

        res.status(200).json({ ec: 0, em: "Order status updated successfully", dt: order });
        // res.status(200).json({ ec: 0, em: "Order status updated successfully", dt: await order.populate('StatusHistory.change_by', 'username email') });
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};

// TODO: Thanh toán đơn hàng (tích hợp cổng thanh toán)
// TODO: Email thông báo sau khi tạo đơn hàng