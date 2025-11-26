import Order from "../models/Order.js";
import Product from "../models/Product.js";
import DiscountCode from '../models/DiscountCode.js';
import User from "../models/User.js";
import jwt from 'jsonwebtoken';
import transporter from "../mail.js";

// User functions
export const createOrder = async (req, res) => {
    try {

        const {
            Items, // mảng các item trong đơn hàng frontend xử lý truyền vào gọi Post /api/products/info_for_order/bulk lấy Items
            discount_code,
            points_used,
            shipping_address_id, // truyền id của địa chỉ đã lưu trong user
            shipment,
            payment_method,
            notes,

            // Cho khách ko đăng nhập
            username,
            email,
            Addresses
        } = req.body;

        // Kiểm tra đăng nhập
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded._id).select('-password');
                // console.log("env", process.env.JWT_SECRET);
                // console.log("Decoded id:", decoded);
                // console.log("Token", token);
                // console.log("User", user);

                // Kiểm tra số lượng đặt hàng với stock
                for (const item of Items) {
                    const product = await Product.findById(item.product_id);
                    if (!product.checkQuantity(item.quantity, item.variant.sku)) {
                        return res.status(400).json({ ec: 400, em: `Sản phẩm ${item.product_name} không đủ số lượng đặt hàng` });
                    }
                    const list_warehouses = product.updateStockAfterOrder(item.quantity, item.variant.sku);
                    await product.save();
                }

                // Xử lý tạo đơn hàng cho user đã đăng nhập
                const user_id = user._id;

                // lấy địa chỉ giao hàng từ user
                const shipping_address = user.Addresses.id(shipping_address_id);

                // cập nhật điểm người dùng nếu có sử dụng điểm
                user.points = Math.max(0, user.points - points_used);
                await user.save();

                // tính tổng tiền hàng
                const total_amount = Items.reduce((sum, item) => {
                    return sum + item.variant.price * item.quantity;
                }, 0);

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

                // Gửi email xác nhận đơn hàng
                await transporter.sendMail({
                    from: `"Your App" <${process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: "Xác nhận đơn hàng",
                    text: `
                        Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi!

                        Mã đơn hàng: ${newOrder._id}
                        Trạng thái: ${newOrder.order_status}

                        Sản phẩm:
                            ${newOrder.Items.map(i =>
                        `- ${i.product_name} | SKU: ${i.variant.sku} | SL: ${i.quantity} | Giá: ${i.variant.price.toLocaleString()} VND`
                    ).join('\n')
                        }

                        Tổng tiền sản phẩm: ${newOrder.total_amount.toLocaleString()} VND
                        Mã giảm giá: ${newOrder.discount_code || "Không có"}
                        Giảm giá: ${newOrder.discount.toLocaleString()} VND
                        Điểm đã sử dụng: ${newOrder.points_used}
                        Phí vận chuyển: ${newOrder.shipment.fee.toLocaleString()} VND
                        Tổng thanh toán: ${newOrder.grand_total.toLocaleString()} VND

                        Phương thức thanh toán: ${newOrder.payment_method}
                        Địa chỉ nhận hàng: ${newOrder.shipping_address.receiver}, ${newOrder.shipping_address.street}, ${newOrder.shipping_address.ward}, ${newOrder.shipping_address.district}, ${newOrder.shipping_address.province}

                        Ghi chú: ${newOrder.notes || "Không có"}

                        Chúng tôi sẽ tiếp tục cập nhật khi đơn hàng được xử lý.
                        `,
                    html: `
                    <div style="width:100%; background:#f5f5f5; padding:20px 0; font-family:Arial, sans-serif;">
                    <div style="max-width:600px; background:white; margin:auto; padding:20px; border-radius:8px;">

                        <h2 style="text-align:center; color:#333;">Cảm ơn bạn đã đặt hàng!</h2>

                        <p>Xin chào <b>${newOrder.shipping_address.receiver}</b>,</p>
                        <p>Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi. Dưới đây là thông tin đơn hàng của bạn:</p>

                        <!-- Order Info -->
                        <table width="100%" style="border-collapse:collapse; margin-top:15px;">
                        <tr>
                            <td style="padding:8px 0;"><b>Mã đơn hàng:</b></td>
                            <td style="padding:8px 0;">${newOrder._id}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0;"><b>Trạng thái:</b></td>
                            <td style="padding:8px 0;">${newOrder.order_status}</td>
                        </tr>
                        </table>

                        <h3 style="margin-top:25px;">🛒 Sản phẩm đã mua</h3>
                        <table width="100%" style="border-collapse:collapse;">
                        ${newOrder.Items.map((i) => `
                            <tr style="border-bottom:1px solid #ddd;">
                            <td style="padding:10px 0;">
                                <b>${i.product_name}</b><br>
                                <small>SKU: ${i.variant.sku}</small><br>
                                <small>Số lượng: ${i.quantity}</small><br>
                                <small>Giá: ${i.variant.price.toLocaleString()} VND</small>
                            </td>
                            </tr>
                        `).join('')}
                        </table>

                        <h3 style="margin-top:25px;">💰 Chi tiết thanh toán</h3>
                        <table width="100%" style="border-collapse:collapse;">
                        <tr>
                            <td style="padding:5px 0;">Tổng tiền sản phẩm:</td>
                            <td style="padding:5px 0; text-align:right;">${newOrder.total_amount.toLocaleString()} VND</td>
                        </tr>
                        <tr>
                            <td style="padding:5px 0;">Mã giảm giá:</td>
                            <td style="padding:5px 0; text-align:right;">${newOrder.discount_code || "Không có"}</td>
                        </tr>
                        <tr>
                            <td style="padding:5px 0;">Giảm giá:</td>
                            <td style="padding:5px 0; text-align:right;">${newOrder.discount.toLocaleString()} VND</td>
                        </tr>
                        <tr>
                            <td style="padding:5px 0;">Điểm đã sử dụng:</td>
                            <td style="padding:5px 0; text-align:right;">${newOrder.points_used}</td>
                        </tr>
                        <tr>
                            <td style="padding:5px 0;">Phí vận chuyển:</td>
                            <td style="padding:5px 0; text-align:right;">${newOrder.shipment.fee.toLocaleString()} VND</td>
                        </tr>
                        <tr style="border-top:1px solid #ddd;">
                            <td style="padding:10px 0; font-size:16px;"><b>Tổng thanh toán:</b></td>
                            <td style="padding:10px 0; text-align:right; font-size:16px; color:#d9534f;">
                            <b>${newOrder.grand_total.toLocaleString()} VND</b>
                            </td>
                        </tr>
                        </table>

                        <h3 style="margin-top:25px;">📍 Địa chỉ giao hàng</h3>
                        <p style="line-height:1.6;">
                        ${newOrder.shipping_address.receiver}<br/>
                        ${newOrder.shipping_address.street}, ${newOrder.shipping_address.ward}<br/>
                        ${newOrder.shipping_address.district}, ${newOrder.shipping_address.province}<br/>
                        SĐT: ${newOrder.shipping_address.phone}
                        </p>

                        <h3 style="margin-top:25px;">📝 Ghi chú</h3>
                        <p>${newOrder.notes || "Không có"}</p>

                        <p style="margin-top:30px;">
                        Chúng tôi sẽ thông báo cho bạn khi đơn hàng được xử lý.<br>
                        <b>Cảm ơn bạn đã mua sắm tại cửa hàng!</b>
                        </p>

                    </div>
                    </div>
                    `,
                });

                return res.status(201).json({ ec: 0, em: "Order created successfully", dt: newOrder });
            } catch (authError) {
                console.log("Invalid token, treating as guest");
            }
        }
        // Đơn hàng cho khách không đăng nhập
        else {
            // Kiểm tra nếu email đã được tạo tài khoản
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ ec: 400, em: "Email đã tạo tài khoản, xin hãy đăng nhập" });
            }

            // Kiểm tra số lượng đặt hàng với stock/ nếu ok thì cập nhật waiting_for_delivery
            for (const item of Items) {
                const product = await Product.findById(item.product_id);
                if (!product.checkQuantity(item.quantity, item.variant.sku)) {
                    return res.status(400).json({ ec: 400, em: `Sản phẩm ${item.product_name} không đủ số lượng đặt hàng` });
                }
                const list_warehouses = product.updateStockAfterOrder(item.quantity, item.variant.sku);
                await product.save();
            }

            // Tạo user tạm để gán đơn hàng
            const user = await User.create({
                username,
                email,
                Addresses
            });
            
            // tính tổng tiền hàng
            const total_amount = Items.reduce((sum, item) => {
                return sum + item.variant.price * item.quantity;
            }, 0);

            // tính giảm giá từ mã giảm giá nếu có
            const Dcode = await DiscountCode.findOne({ code: discount_code });
            const discount = Dcode ? Dcode.discount : 0;

            // tính grand_total
            const grand_total = Math.max(0, total_amount + shipment.fee - discount);

            const newOrder = await new Order({
                user_id: user._id,
                Items,
                discount_code,
                points_used: 0, // khách ko đăng nhập ko dùng điểm
                shipping_address: user.Addresses[0], // lấy địa chỉ đầu tiên
                total_amount,
                discount,
                grand_total,
                shipment,
                payment_method,
                notes
            });
            await newOrder.save();

            // Gửi email xác nhận đơn hàng
            await transporter.sendMail({
                from: `"Your App" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: "Xác nhận đơn hàng",
                text: `
                        Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi!

                        Mã đơn hàng: ${newOrder._id}
                        Trạng thái: ${newOrder.order_status}

                        Sản phẩm:
                            ${newOrder.Items.map(i =>
                    `- ${i.product_name} | SKU: ${i.variant.sku} | SL: ${i.quantity} | Giá: ${i.variant.price.toLocaleString()} VND`
                ).join('\n')
                    }

                        Tổng tiền sản phẩm: ${newOrder.total_amount.toLocaleString()} VND
                        Mã giảm giá: ${newOrder.discount_code || "Không có"}
                        Giảm giá: ${newOrder.discount.toLocaleString()} VND
                        Điểm đã sử dụng: ${newOrder.points_used}
                        Phí vận chuyển: ${newOrder.shipment.fee.toLocaleString()} VND
                        Tổng thanh toán: ${newOrder.grand_total.toLocaleString()} VND

                        Phương thức thanh toán: ${newOrder.payment_method}
                        Địa chỉ nhận hàng: ${newOrder.shipping_address.receiver}, ${newOrder.shipping_address.street}, ${newOrder.shipping_address.ward}, ${newOrder.shipping_address.district}, ${newOrder.shipping_address.province}

                        Ghi chú: ${newOrder.notes || "Không có"}

                        Chúng tôi sẽ tiếp tục cập nhật khi đơn hàng được xử lý.
                        `,
                html: `
                    <div style="width:100%; background:#f5f5f5; padding:20px 0; font-family:Arial, sans-serif;">
                    <div style="max-width:600px; background:white; margin:auto; padding:20px; border-radius:8px;">

                        <h2 style="text-align:center; color:#333;">Cảm ơn bạn đã đặt hàng!</h2>

                        <p>Xin chào <b>${newOrder.shipping_address.receiver}</b>,</p>
                        <p>Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi. Dưới đây là thông tin đơn hàng của bạn:</p>

                        <!-- Order Info -->
                        <table width="100%" style="border-collapse:collapse; margin-top:15px;">
                        <tr>
                            <td style="padding:8px 0;"><b>Mã đơn hàng:</b></td>
                            <td style="padding:8px 0;">${newOrder._id}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0;"><b>Trạng thái:</b></td>
                            <td style="padding:8px 0;">${newOrder.order_status}</td>
                        </tr>
                        </table>

                    <h3 style="margin-top:25px;">🛒 Sản phẩm đã mua</h3>
                    <table width="100%" style="border-collapse:collapse;">
                    ${newOrder.Items.map((i) => `
                        <tr style="border-bottom:1px solid #ddd;">
                        <td style="padding:10px 0;">
                            <b>${i.product_name}</b><br>
                            <small>SKU: ${i.variant.sku}</small><br>
                            <small>Số lượng: ${i.quantity}</small><br>
                            <small>Giá: ${i.variant.price.toLocaleString()} VND</small>
                        </td>
                        </tr>
                    `).join('')}
                    </table>

                    <h3 style="margin-top:25px;">💰 Chi tiết thanh toán</h3>
                    <table width="100%" style="border-collapse:collapse;">
                    <tr>
                        <td style="padding:5px 0;">Tổng tiền sản phẩm:</td>
                        <td style="padding:5px 0; text-align:right;">${newOrder.total_amount.toLocaleString()} VND</td>
                    </tr>
                    <tr>
                        <td style="padding:5px 0;">Mã giảm giá:</td>
                        <td style="padding:5px 0; text-align:right;">${newOrder.discount_code || "Không có"}</td>
                    </tr>
                    <tr>
                        <td style="padding:5px 0;">Giảm giá:</td>
                        <td style="padding:5px 0; text-align:right;">${newOrder.discount.toLocaleString()} VND</td>
                    </tr>
                    <tr>
                        <td style="padding:5px 0;">Điểm đã sử dụng:</td>
                        <td style="padding:5px 0; text-align:right;">${newOrder.points_used}</td>
                    </tr>
                    <tr>
                        <td style="padding:5px 0;">Phí vận chuyển:</td>
                        <td style="padding:5px 0; text-align:right;">${newOrder.shipment.fee.toLocaleString()} VND</td>
                    </tr>
                    <tr style="border-top:1px solid #ddd;">
                        <td style="padding:10px 0; font-size:16px;"><b>Tổng thanh toán:</b></td>
                        <td style="padding:10px 0; text-align:right; font-size:16px; color:#d9534f;">
                        <b>${newOrder.grand_total.toLocaleString()} VND</b>
                        </td>
                    </tr>
                    </table>

                    <h3 style="margin-top:25px;">📍 Địa chỉ giao hàng</h3>
                    <p style="line-height:1.6;">
                    ${newOrder.shipping_address.receiver}<br/>
                    ${newOrder.shipping_address.street}, ${newOrder.shipping_address.ward}<br/>
                    ${newOrder.shipping_address.district}, ${newOrder.shipping_address.province}<br/>
                    SĐT: ${newOrder.shipping_address.phone}
                    </p>

                    <h3 style="margin-top:25px;">📝 Ghi chú</h3>
                    <p>${newOrder.notes || "Không có"}</p>

                    <p style="margin-top:30px;">
                    Chúng tôi sẽ thông báo cho bạn khi đơn hàng được xử lý.<br>
                    <b>Cảm ơn bạn đã mua sắm tại cửa hàng!</b>
                    </p>

                </div>
                </div>
                `,
            });

            res.status(201).json({ ec: 0, em: "Order created successfully", dt: newOrder });
        }
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }

    // TODO: Sau khi tạo đơn hàng (nếu thanh toán online) gọi phương thức thanh toán tích hợp
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
        const order = await Order.findById(order_id, user_id).select('StatusHistory').populate('StatusHistory.change_by', 'username').sort('-createdAt');
        res.status(201).json({ ec: 0, em: "Status History getted successfully", dt: order.StatusHistory });
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};
// Common function
export const getOrderById = async (req, res) => {
    try {
        const order_id = req.params.order_id;
        const order = await Order.findById(order_id).populate('StatusHistory.change_by', 'username email').populate('user_id', 'username');
        res.status(201).json({ ec: 0, em: "Order getted successfully", dt: order });
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};

// Admin functions
export const getAllOrders = async (req, res) => {
    try {

        const pageSize = 20;
        const page = 1;

        let query = {};
        let createdAtFilter = {};

        const { start, end, date } = req.query;
        const today = new Date();

        // Lọc theo khoảng thời gian: start – end
        if (start && end) {
            createdAtFilter.$gte = new Date(start);
            createdAtFilter.$lte = new Date(end);
        }
        // Lọc theo lựa chọn : today, yesterday, this_week, this_month
        if (date === 'today') {
            createdAtFilter.$gte = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            createdAtFilter.$lt = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        } else if (date === 'yesterday') {
            createdAtFilter.$gte = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
            createdAtFilter.$lt = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        } else if (date === 'this_week') {
            const firstDay = today.getDate() - today.getDay();
            createdAtFilter.$gte = new Date(today.getFullYear(), today.getMonth(), firstDay);
            createdAtFilter.$lt = new Date(today.getFullYear(), today.getMonth(), firstDay + 7);

        } else if (date === 'this_month') {
            createdAtFilter.$gte = new Date(today.getFullYear(), today.getMonth(), 1);
            createdAtFilter.$lt = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        }

        // Chỉ gán created_at nếu có filter
        if (Object.keys(createdAtFilter).length > 0) {
            query.createdAt = createdAtFilter;
        }

        const [count, orders] = await Promise.all([
            Order.countDocuments(query),
            Order.find(query)
                .select('-StatusHistory -shipping_address -shipment -__v')
                .sort('-createdAt')
                .populate('user_id', 'username')
                .limit(pageSize)
                .skip(pageSize * (page - 1))
        ]);

        res.status(201).json({
            ec: 0,
            em: "All Orders getted successfully",
            dt: {
                orders,
                page,
                pages: Math.ceil(count / pageSize),
                total: count,
            }
        });
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};

// Hàm update status Admin
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

            // xử lý cập nhật số lượng đã bán
            order.Items.forEach(async (item) => {
                const product = await Product.findById(item.product_id);
                if (product) {
                    const list_warehouses = product.updateStockAfterOrder(item.quantity, item.variant.sku);
                    await product.save();
                    // res.status(200).json({ ec: 0, em: 'Stock updated', dt: list_warehouses });
                }
            });

        }

        // Nếu đơn bị hủy sau khi đã giao thì trừ điểm
        else if (order.order_status === 'cancelled') {
            // console.log('Points used before refunding for user:', user.points);
            user.points += parseInt(order.points_used); // hoàn trả điểm đã dùng
            if (user.points < 0) user.points = 0; // tránh âm
            // console.log('Points used:', parseInt(order.points_used));
            // console.log('User points after cancellation:', user.points);
            await user.save();

            // xử lý hoàn trả số lượng đặt đặt hàng về kho
            order.Items.forEach(async (item) => {
                const product = await Product.findById(item.product_id);
                if (product) {
                    // Giảm waiting_for_delivery và tăng quantity
                    const list_warehouses = product.revertStockAfterCancel(item.quantity, item.variant.sku);
                    await product.save();
                }
            });
        }
        await order.populate('StatusHistory.change_by', 'username email');

        res.status(200).json({ ec: 0, em: "Order status updated successfully", dt: order });

    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};
// Hàm update status User hủy đơn hàng
export const userCancelOrder = async (req, res) => {
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

        // Nếu đơn bị hủy sau khi đã giao thì trừ điểm
        if (order.order_status === 'cancelled') {
            // console.log('Points used before refunding for user:', user.points);
            user.points += parseInt(order.points_used); // hoàn trả điểm đã dùng
            if (user.points < 0) user.points = 0; // tránh âm
            // console.log('Points used:', parseInt(order.points_used));
            // console.log('User points after cancellation:', user.points);
            await user.save();

            // xử lý hoàn trả số lượng đặt đặt hàng về kho
            order.Items.forEach(async (item) => {
                const product = await Product.findById(item.product_id);
                if (product) {
                    // Giảm waiting_for_delivery và tăng quantity
                    const list_warehouses = product.revertStockAfterCancel(item.quantity, item.variant.sku);
                    await product.save();
                }
            });
        }
        await order.populate('StatusHistory.change_by', 'username email');

        res.status(200).json({ ec: 0, em: "Order status User cancelled successfully", dt: order });

    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};
