import Order from "../models/Order.js";
import Product from "../models/Product.js";
import DiscountCode from "../models/DiscountCode.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import transporter from "../mail.js";
import { get } from "mongoose";

const getStatusData = () => [200, 0, "Success", {}];
const TAX_RATE = 0.08; // thuong dung VAT 8% - co the thay doi neu can
const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const buildError = (message, statusCode = 400) => {
	const error = new Error(message);
	error.statusCode = statusCode;
	return error;
};

const parseQuantity = (value) => {
	const qty = parseInt(value, 10);
	return Number.isNaN(qty) || qty < 1 ? 1 : qty;
};

const getUserFromAuthHeader = async (req) => {
	try {
		const authHeader = req.headers.authorization || "";
		if (!authHeader.startsWith("Bearer ")) return null;
		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded?._id) return null;
		return await User.findById(decoded._id).select("-password");
	} catch (error) {
		return null;
	}
};

const normalizeItemsWithStock = async (itemsPayload = []) => {
	if (!Array.isArray(itemsPayload) || itemsPayload.length === 0) {
		throw buildError("Items are required to create an order");
	}

	const productCache = new Map();
	const normalizedItems = [];
	const metas = [];

	for (const rawItem of itemsPayload) {
		const productId = rawItem?.product_id || rawItem?.productId;
		const sku = rawItem?.variant?.sku || rawItem?.sku || rawItem?.variantSku;
		const qty = parseQuantity(rawItem?.quantity ?? rawItem?.qty);

		if (!productId || !sku) {
			throw buildError("Each item requires product_id and sku");
		}

		const productKey = String(productId);
		let product = productCache.get(productKey);
		if (!product) {
			product = await Product.findById(productId).populate("category_id", "category_name");
			if (!product) {
				throw buildError(`Product not found for id ${productId}`);
			}
			productCache.set(productKey, product);
		}

		const variant = product.Variants.find((v) => v.sku === sku);
		if (!variant) {
			throw buildError(`Variant ${sku} not found for product ${product.product_name}`);
		}

		if (!product.checkQuantity(qty, sku)) {
			throw buildError(`San pham ${product.product_name} khong du so luong dat hang`);
		}

		normalizedItems.push({
			data: {
				product_id: product._id,
				category_name: product?.category_id?.category_name || "",
				product_name: product.product_name,
				quantity: qty,
				variant: {
					sku: variant.sku,
					price: variant.price,
					cost_price: variant.cost_price,
					attributes: variant.Attributes.filter((attr) => attr.type === "appearance"),
				},
			},
			meta: { product, sku, qty },
		});
	}

	return {
		normalizedItems: normalizedItems.map((item) => item.data),
		metas: normalizedItems.map((item) => item.meta),
	};
};

const reserveStockForOrder = async (metas = []) => {
	for (const meta of metas) {
		meta.product.updateStockAfterOrder(meta.qty, meta.sku);
		await meta.product.save();
	}
};

const rollbackStockReservation = async (metas = []) => {
	for (const meta of metas) {
		try {
			meta.product.revertStockAfterCancel(meta.qty, meta.sku);
			await meta.product.save();
		} catch (error) {
			console.error("Rollback stock failed", error.message);
		}
	}
};

const resolveShippingAddress = (userDoc, shippingAddressId, guestShippingAddress, addressesPayload = []) => {
	if (userDoc) {
		if (!userDoc?.Addresses?.length) {
			throw buildError("User does not have any saved address", 400);
		}
		if (shippingAddressId) {
			const foundAddress = userDoc.Addresses.id(shippingAddressId);
			if (!foundAddress) {
				throw buildError("Shipping address not found", 404);
			}
			return foundAddress;
		}
		return userDoc.Addresses.find((addr) => addr.isDefault) || userDoc.Addresses[0];
	}

	const addressCandidate = guestShippingAddress || addressesPayload[0];
	if (!addressCandidate) {
		throw buildError("Shipping address is required for guest checkout");
	}
	const requiredFields = [
		"receiver",
		"phone",
		"country",
		"province",
		"district",
		"ward",
		"street",
		"postalCode",
	];
	const missing = requiredFields.filter((field) => !addressCandidate[field]);
	if (missing.length) {
		throw buildError(`Missing shipping address fields: ${missing.join(", ")}`);
	}
	return addressCandidate;
};

const formatCurrency = (value = 0) => Number(value || 0).toLocaleString("vi-VN");

const stripShippingAddressFields = (address) => ({
	receiver: address.receiver,
	phone: address.phone,
	country: address.country,
	province: address.province,
	district: address.district,
	ward: address.ward,
	street: address.street,
	postalCode: address.postalCode,
});

// User functions
export const createOrder = async (req, res) => {
	try {
		const {
			Items = [],
			discount_code,
			points_used = 0,
			shipping_address_id,
			shipment,
			payment_method,
			notes,
			tax_fee,
			username,
			email,
			Addresses = [],
			shipping_address,
		} = req.body;

		// buoc 1: xac dinh user neu co token
		const authedUser = await getUserFromAuthHeader(req);
		const isLoggedIn = !!authedUser;

		// buoc 2: chuan hoa item + tru ton kho cho waiting_for_delivery
		const { normalizedItems, metas } = await normalizeItemsWithStock(Items);

		// buoc 3: tinh toan tong tien
		const subtotal = normalizedItems.reduce(
			(sum, item) => sum + item.variant.price * item.quantity,
			0
		);
		const shippingPayload = shipment || { method: "Standard", fee: 0, note: "" };
		if (!shippingPayload?.method) {
			throw buildError("Shipping method is required");
		}
		shippingPayload.fee = Number(shippingPayload.fee || 0);
		if (Number.isNaN(shippingPayload.fee)) {
			shippingPayload.fee = 0;
		}
		const taxAmount =
			typeof tax_fee === "number" && tax_fee >= 0
				? tax_fee
				: Math.round(subtotal * TAX_RATE);

		const allowedPaymentMethods = ["COD", "banking", "credit_card"];
		if (!payment_method || !allowedPaymentMethods.includes(payment_method)) {
			throw buildError("Invalid payment method");
		}

		// giai quyet ma giam gia
		let appliedDiscountCode = null;
		let discount = 0;
		if (discount_code) {
			appliedDiscountCode = await DiscountCode.findOne({ code: discount_code });
			if (!appliedDiscountCode) {
				throw buildError("Discount code not found", 404);
			}
			if (!appliedDiscountCode.canUse(subtotal)) {
				throw buildError("Discount code is not applicable or has reached maximum usage");
			}
			discount = appliedDiscountCode.calculateDiscount(subtotal);
			if (discount <= 0) {
				throw buildError("Discount code is not applicable for this order amount");
			}
		}

		// diem tich luy
		let pointsToUse = isLoggedIn ? Math.max(0, parseInt(points_used, 10) || 0) : 0;
		if (isLoggedIn && pointsToUse > authedUser.points) {
			pointsToUse = authedUser.points;
		}
		const pointsDiscount = pointsToUse * 1000;

		const grand_total = Math.max(
			0,
			subtotal + shippingPayload.fee + taxAmount - discount - pointsDiscount
		);
		const loyalty_points_earned = Math.floor(grand_total / 10000);

		// buoc 4: xu ly user + dia chi giao hang
		let orderUser = authedUser;
		if (!orderUser) {
			if (!email || !username) {
				throw buildError("Guest checkout requires username and email");
			}
			orderUser = await User.findOne({ email });
			if (!orderUser) {
				const normalizedAddresses = Addresses.length
					? Addresses.map((addr, index) => ({
						...stripShippingAddressFields(addr),
						isDefault: index === 0 ? true : addr.isDefault,
					}))
					: [];
				if (!normalizedAddresses.length) {
					throw buildError("Guest checkout requires at least one address");
				}
				orderUser = await User.create({
					username,
					email,
					Addresses: normalizedAddresses,
				});
			}
			// guest khong duoc dung diem
			pointsToUse = 0;
		}

		const shippingAddress = resolveShippingAddress(
			isLoggedIn ? orderUser : null,
			shipping_address_id,
			shipping_address,
			orderUser?.Addresses?.length ? orderUser.Addresses : Addresses
		);
		const normalizedShippingAddress = stripShippingAddressFields(
			shippingAddress?.toObject ? shippingAddress.toObject() : shippingAddress
		);

		let stockReserved = false;
		let pointsDeducted = false;
		try {
			await reserveStockForOrder(metas);
			stockReserved = true;

			const newOrder = await Order.create({
				user_id: orderUser._id,
				Items: normalizedItems,
				discount_code: discount_code || undefined,
				points_used: pointsToUse,
				shipping_address: normalizedShippingAddress,
				total_amount: subtotal,
				discount,
				tax_fee: taxAmount,
				grand_total,
				loyalty_points_earned,
				shipment: shippingPayload,
				payment_method,
				notes,
			});

			if (isLoggedIn) {
				orderUser.points = Math.max(0, (orderUser.points || 0) - pointsToUse);
				await orderUser.save();
				pointsDeducted = true;
			}

			if (appliedDiscountCode) {
				appliedDiscountCode.usedCount += 1;
				await appliedDiscountCode.save();
			}

			const emailTarget = orderUser.email;
			if (emailTarget) {
				await transporter.sendMail({
					from: `"Your App" <${process.env.EMAIL_USER}>`,
					to: emailTarget,
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
                        Phí vận chuyển: ${newOrder.shipment.fee.toLocaleString()} VND
                        Mã giảm giá: ${newOrder.discount_code || "Không có"}
                        Giảm giá: -${newOrder.discount.toLocaleString()} VND
                        Sử dụng điểm KHTT: -${(newOrder.points_used * 1000).toLocaleString()} VND
                        
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
                            <td style="padding:5px 0;">Phí vận chuyển:</td>
                            <td style="padding:5px 0; text-align:right;">${newOrder.shipment.fee.toLocaleString()} VND</td>
                        </tr>
                        <tr>
                            <td style="padding:5px 0;">Mã giảm giá:</td>
                            <td style="padding:5px 0; text-align:right;">${newOrder.discount_code || "Không có"}</td>
                        </tr>
                        <tr>
                            <td style="padding:5px 0;">Giảm giá:</td>
                            <td style="padding:5px 0; text-align:right;">-${newOrder.discount.toLocaleString()} VND</td>
                        </tr>
                        <tr>
                            <td style="padding:5px 0;">Sử dụng điểm KHTT:</td>
                            <td style="padding:5px 0; text-align:right;">-${(newOrder.points_used * 1000).toLocaleString()} VND</td>
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

			}

			return res.status(201).json({ ec: 0, em: "Order created successfully", dt: newOrder });
		} catch (innerError) {
			if (pointsDeducted && isLoggedIn) {
				orderUser.points = (orderUser.points || 0) + pointsToUse;
				await orderUser.save();
			}
			if (stockReserved) {
				await rollbackStockReservation(metas);
			}
			throw innerError;
		}
	} catch (error) {
		const statusCode = error?.statusCode || 500;
		res.status(statusCode).json({ ec: statusCode, em: error.message });
	}
};

export const getOrderByUserId = async (req, res) => {
	try {
		const user_id = req.user._id;
		const orders = await Order.find({ user_id })
			.select("-StatusHistory -shipment.note -__v")
			.sort("-createdAt");
		res.status(200).json({ ec: 0, em: "Orders retrieved successfully", dt: orders });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

// hàm phụ trợ tìm kiếm khi order_id ngắn và theo user_id
export const getStatusHistoryByOrderIdAndUserId = async (req, res) => {
	const order_id = req.params.order_id;
	const user_id = req.user._id;
	let [statusCode, ec, em, dt] = getStatusData();
	const safeRegex = order_id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const query = {
		user_id,
		$expr: { $regexMatch: { input: { $toString: "$_id" }, regex: safeRegex, options: "i" } },
	};
	try {
		const order = await Order.findOne(query)
			.select("StatusHistory user_id")
			.populate("StatusHistory.change_by", "username isManager");

		if (!order) {
			statusCode = ec = 404;
			em = "Order not found";
		}

		const history = [...(order.StatusHistory || [])].sort(
			(a, b) => new Date(b.change_at) - new Date(a.change_at)
		);
		dt = history;
		res.status(statusCode).json({ ec, em, dt });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

export const getStatusHistoryByOrderId = async (req, res) => {
	const order_id = req.params.order_id;
	if (typeof order_id === "string" && order_id.length < 24) return getStatusHistoryByOrderIdAndUserId(req, res);
	try {
		const order = await Order.findById(order_id)
			.select("StatusHistory user_id")
			.populate("StatusHistory.change_by", "username isManager");

		if (!order) {
			return res.status(404).json({ ec: 404, em: "Order not found" });
		}

		const isOwner = order.user_id.toString() === req.user._id.toString();
		if (!isOwner && !req.user.isManager) {
			return res.status(403).json({ ec: 403, em: "Forbidden" });
		}

		const history = [...(order.StatusHistory || [])].sort(
			(a, b) => new Date(b.change_at) - new Date(a.change_at)
		);
		res.status(200).json({ ec: 0, em: "Status History retrieved successfully", dt: history });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

// Helper for short order_id search by user
const getOrderByIdAndUserId = async (req, res) => {
	const order_id = req.params.order_id;
	const user_id = req.user._id;

	const safeRegex = order_id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	// const searchRegex = new RegExp(safeRegex, "i");
	const query = {
		user_id,
		$expr: { $regexMatch: { input: { $toString: "$_id" }, regex: safeRegex, options: "i" } },
	};
	try {
		const order = await Order.findOne(query)
			.populate("StatusHistory.change_by", "username isManager")
			.populate("user_id", "username email");

		if (!order) {
			return res.status(404).json({ ec: 404, em: "Order not found" });
		}

		order.StatusHistory = [...(order.StatusHistory || [])].sort(
			(a, b) => new Date(b.change_at) - new Date(a.change_at)
		);
		res.status(200).json({ ec: 0, em: "Order retrieved successfully", dt: order });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
}

// Common function
export const getOrderById = async (req, res) => {
	const order_id = req.params.order_id;
	if (typeof order_id === "string" && order_id.length < 24) return getOrderByIdAndUserId(req, res);
	try {
		const order = await Order.findById(order_id)
			.populate("StatusHistory.change_by", "username isManager")
			.populate("user_id", "username email");

		if (!order) {
			return res.status(404).json({ ec: 404, em: "Order not found" });
		}
		const isOwner = order.user_id?._id?.toString() === req.user._id.toString();
		if (!isOwner && !req.user.isManager) {
			return res.status(403).json({ ec: 403, em: "Forbidden" });
		}

		order.StatusHistory = [...(order.StatusHistory || [])].sort(
			(a, b) => new Date(b.change_at) - new Date(a.change_at)
		);
		res.status(200).json({ ec: 0, em: "Order retrieved successfully", dt: order });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

// Admin functions
export const getAllOrders = async (req, res) => {
	const pageSize = parseInt(req.query.limit, 10) || 20;
	const page = parseInt(req.query.page, 10) || 1;
	const { start, end, date, q, status } = req.query;
	const dateStart = start ? new Date(start) : null;
	const dateEnd = end ? new Date(end) : null;
	const searchText = typeof q === "string" ? q.trim() : "";
	try {

		let query = {};
		let createdAtFilter = {};

		const today = new Date();

		const hasStart = dateStart && !Number.isNaN(dateStart.getTime());
		const hasEnd = dateEnd && !Number.isNaN(dateEnd.getTime());

		if (hasStart || hasEnd) {
			if (hasStart) {
				const startOfDay = new Date(dateStart);
				startOfDay.setHours(0, 0, 0, 0);
				createdAtFilter.$gte = startOfDay;
			}
			if (hasEnd) {
				const endOfDay = new Date(dateEnd);
				endOfDay.setHours(23, 59, 59, 999);
				createdAtFilter.$lte = endOfDay;
			}
		} else if (date === "today") {
			createdAtFilter.$gte = new Date(today.getFullYear(), today.getMonth(), today.getDate());
			createdAtFilter.$lt = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
		} else if (date === "yesterday") {
			createdAtFilter.$gte = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
			createdAtFilter.$lt = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		} else if (date === "this_week") {
			const firstDay = today.getDate() - today.getDay();
			createdAtFilter.$gte = new Date(today.getFullYear(), today.getMonth(), firstDay);
			createdAtFilter.$lt = new Date(today.getFullYear(), today.getMonth(), firstDay + 7);
		} else if (date === "this_month") {
			createdAtFilter.$gte = new Date(today.getFullYear(), today.getMonth(), 1);
			createdAtFilter.$lt = new Date(today.getFullYear(), today.getMonth() + 1, 1);
		}

		if (Object.keys(createdAtFilter).length > 0) {
			query.createdAt = createdAtFilter;
		}

		if (status && ORDER_STATUSES.includes(status)) {
			query.order_status = status;
		}

		if (searchText) {
			const safeRegex = searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			const searchRegex = new RegExp(safeRegex, "i");
			query.$or = [
				{ $expr: { $regexMatch: { input: { $toString: "$_id" }, regex: safeRegex, options: "i" } } },
				{ discount_code: searchRegex },
			];
		}

		const [count, orders] = await Promise.all([
			Order.countDocuments(query),
			Order.find(query)
				.select("-StatusHistory -shipping_address -shipment.note -__v")
				.sort("-createdAt")
				.populate("user_id", "username email")
				.limit(pageSize)
				.skip(pageSize * (page - 1)),
		]);

		res.status(200).json({
			ec: 0,
			em: "All Orders retrieved successfully",
			dt: {
				orders,
				page,
				pages: Math.ceil(count / pageSize),
				total: count,
			},
		});
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

export const getOrdersOverview = async (req, res) => {
	try {
		const { start, end, days } = req.query;
		const today = new Date();
		const defaultDays = Math.max(parseInt(days, 10) || 3, 1);

		let startDate = start ? new Date(start) : null;
		let endDate = end ? new Date(end) : null;

		if (!startDate || Number.isNaN(startDate.getTime())) {
			startDate = new Date(today);
			startDate.setDate(today.getDate() - (defaultDays - 1));
		}
		if (!endDate || Number.isNaN(endDate.getTime())) {
			endDate = today;
		}

		if (startDate > endDate) {
			const temp = startDate;
			startDate = endDate;
			endDate = temp;
		}

		startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
		endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);

		const matchStage = {
			createdAt: {
				$gte: startDate,
				$lte: endDate,
			},
		};

		const overview = await Order.aggregate([
			{ $match: matchStage },
			{
				$group: {
					_id: {
						status: "$order_status",
						day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
					},
					count: { $sum: 1 },
				},
			},
		]);

		const labels = [];
		const cursor = new Date(startDate);
		while (cursor <= endDate) {
			labels.push(cursor.toISOString().slice(0, 10));
			cursor.setDate(cursor.getDate() + 1);
		}

		const statusSeries = {};
		const totals = {};
		ORDER_STATUSES.forEach((statusKey) => {
			statusSeries[statusKey] = Array(labels.length).fill(0);
			totals[statusKey] = 0;
		});

		overview.forEach((row) => {
			const statusKey = row._id?.status;
			const dayLabel = row._id?.day;
			if (!statusSeries[statusKey]) return;
			const dayIndex = labels.indexOf(dayLabel);
			if (dayIndex === -1) return;
			statusSeries[statusKey][dayIndex] += row.count;
			totals[statusKey] += row.count;
		});

		const totalOrders = Object.values(totals).reduce((sum, value) => sum + value, 0);

		res.status(200).json({
			ec: 0,
			em: "Orders overview retrieved successfully",
			dt: {
				labels,
				statusSeries,
				totals,
				totalOrders,
				start: startDate.toISOString(),
				end: endDate.toISOString(),
			},
		});
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

const adjustDiscountUsage = async (discountCodeValue, direction = 1) => {
	if (!discountCodeValue) return;
	const codeDoc = await DiscountCode.findOne({ code: discountCodeValue });
	if (!codeDoc) return;
	const nextCount = Math.max(0, (codeDoc.usedCount || 0) + direction);
	codeDoc.usedCount = nextCount;
	await codeDoc.save();
};

// Ham update status Admin
export const updateOrderStatus = async (req, res) => {
	try {
		const order_id = req.params.order_id;
		const newStatus = req.body.order_status;
		if (!ORDER_STATUSES.includes(newStatus)) {
			return res.status(400).json({ ec: 400, em: "Invalid order status" });
		}

		const order = await Order.findById(order_id).select(
			"_id user_id Items order_status StatusHistory points_used total_amount discount_code grand_total loyalty_points_earned"
		);
		if (!order) {
			return res.status(404).json({ ec: 404, em: "Order not found" });
		}
		const oldStatus = order.order_status;

		if (oldStatus === newStatus) {
			return res.status(400).json({ ec: 400, em: "Order status is the same as the current status" });
		}

		if (oldStatus === "delivered" || oldStatus === "cancelled") {
			return res.status(400).json({ ec: 400, em: "Status order cannot be changed once delivered or cancelled" });
		}
		order.order_status = newStatus;
		order.StatusHistory.push({
			status: newStatus,
			change_at: new Date(),
			change_by: req.user._id,
		});
		await order.save();

		const user = await User.findById(order.user_id).select("points");
		if (!user) {
			return res.status(404).json({ ec: 404, em: "User not found" });
		}

		if (order.order_status === "delivered") {
			const pointsEarned =
				order.loyalty_points_earned || Math.floor((order.grand_total || 0) / 10000);
			user.points += pointsEarned;
			await user.save();

			for (const item of order.Items) {
				const product = await Product.findById(item.product_id);
				if (product) {
					product.exportStockAfterShipping(item.quantity, item.variant.sku);
					const variant = product.Variants.find((v) => v.sku === item.variant.sku);
					if (variant) {
						variant.sold = (variant.sold || 0) + item.quantity;
					}
					product.quantity_sold = product.Variants.reduce((sum, v) => sum + (v.sold || 0), 0);
					await product.save();
				}
			}
		} else if (order.order_status === "cancelled") {
			user.points += parseInt(order.points_used, 10) || 0;
			if (user.points < 0) user.points = 0;
			await user.save();

			for (const item of order.Items) {
				const product = await Product.findById(item.product_id);
				if (product) {
					product.revertStockAfterCancel(item.quantity, item.variant.sku);
					await product.save();
				}
			}
			await adjustDiscountUsage(order.discount_code, -1);
		}
		await order.populate("StatusHistory.change_by", "username isManager");

		res.status(200).json({ ec: 0, em: "Order status updated successfully", dt: order });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

// Ham update status User huy don hang
export const userCancelOrder = async (req, res) => {
	try {
		const order_id = req.params.order_id;
		const newStatus = req.body.order_status;
		if (!ORDER_STATUSES.includes(newStatus)) {
			return res.status(400).json({ ec: 400, em: "Invalid order status" });
		}
		if (newStatus !== "cancelled") {
			return res.status(400).json({ ec: 400, em: "User can only cancel pending orders" });
		}

		const order = await Order.findById(order_id).select(
			"_id user_id Items order_status StatusHistory points_used total_amount discount_code grand_total loyalty_points_earned"
		);
		if (!order) {
			return res.status(404).json({ ec: 404, em: "Order not found" });
		}
		if (order.user_id.toString() !== req.user._id.toString()) {
			return res.status(403).json({ ec: 403, em: "Forbidden" });
		}
		const oldStatus = order.order_status;

		if (oldStatus === newStatus) {
			return res.status(400).json({ ec: 400, em: "Order status is the same as the current status" });
		}

		if (oldStatus !== "pending") {
			return res.status(400).json({ ec: 400, em: "Only pending orders can change status" });
		}
		order.order_status = newStatus;
		order.StatusHistory.push({
			status: newStatus,
			change_at: new Date(),
			change_by: req.user._id,
		});
		await order.save();

		const user = await User.findById(order.user_id).select("points");
		if (!user) {
			return res.status(404).json({ ec: 404, em: "User not found" });
		}

		if (order.order_status === "cancelled") {
			user.points += parseInt(order.points_used, 10) || 0;
			if (user.points < 0) user.points = 0;
			await user.save();

			for (const item of order.Items) {
				const product = await Product.findById(item.product_id);
				if (product) {
					product.revertStockAfterCancel(item.quantity, item.variant.sku);
					await product.save();
				}
			}
			await adjustDiscountUsage(order.discount_code, -1);
		}
		await order.populate("StatusHistory.change_by", "username isManager");

		res.status(200).json({ ec: 0, em: "Order status updated successfully", dt: order });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

// TODO: cap nhat trang thai don hang khi thanh toan online thanh cong
