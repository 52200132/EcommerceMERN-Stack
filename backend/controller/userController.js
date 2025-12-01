import { clearCacheGroup } from "#middleware";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const CART_TAX_RATE = 0.08;
const SHIPPING_OPTIONS = [
  { method: "Ship Nhanh", fee: 30000, note: "Nhận từ 2-3 ngày" },
  { method: "Hỏa tốc", fee: 60000, note: "Nhận trong ngày" },
];

const parseQuantity = (value) => {
  const qty = parseInt(value, 10);
  return Number.isNaN(qty) || qty < 1 ? 1 : qty;
};

const buildCartTotals = (carts = []) => {
  const subtotal = carts.reduce((sum, item) => {
    const price = item?.variant?.price || 0;
    return sum + price * item.quantity;
  }, 0);
  const tax = Math.round(subtotal * CART_TAX_RATE);
  const itemsCount = carts.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, tax, itemsCount };
};

const toPlain = (doc) => {
  if (!doc) return doc;
  if (typeof doc.toObject === "function") return doc.toObject({ depopulate: true });
  if (typeof doc.toJSON === "function") return doc.toJSON();
  return JSON.parse(JSON.stringify(doc));
};

const enrichCartItems = async (cartItems = []) => {
  const productCache = new Map();
  const enriched = [];

  for (const item of cartItems) {
    const productId = item.product_id;
    const sku = item?.variant?.sku;
    const productKey = String(productId);
    let product = productCache.get(productKey);
    if (!product) {
      product = await Product.findById(productId).populate("category_id", "category_name");
      productCache.set(productKey, product);
    }
    const variantDoc = product?.Variants?.find((v) => v.sku === sku);
    const image_url =
      item.image_url || (product ? await Product.getImageUrlByVariantSKU(productId, sku) : null);
    const available_stock = product ? product.getStockBySku(sku) : 0;

    const baseItem = toPlain(item);
    const variantFromCart = toPlain(baseItem?.variant || item?.variant);

    enriched.push({
      ...(item.toObject ? item.toObject() : { ...item }),
      product_name: product?.product_name,
      category_name: product?.category_id?.category_name,
      available_stock,
      variant: {
        ...variantFromCart,
        price: variantDoc?.price ?? item?.variant?.price ?? 0,
      },
      image_url,
    });
  }

  return enriched;
};

const buildCartResponse = async (cartItems = []) => {
  const carts = await enrichCartItems(cartItems);
  const totals = buildCartTotals(carts);
  return { carts, totals, shippingOptions: SHIPPING_OPTIONS };
};

// Profile Management Controllers
export const getProfile = async (req, res) => {
  try {
    const user_id = req.user._id;
    const profile = await User.findById(user_id).select('-password -Carts -Addresses -updatedAt -__v');
    res.json({ ec: 200, em: "Lấy thông tin profile thành công", dt: profile });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updateData = {};
    ["username", "email", "image", "gender"].forEach((key) => {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    });
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password -points -Carts -Addresses -updatedAt -__v');
    clearCacheGroup('userProfile');
    res.json({ ec: 0, em: "Cập nhật thông tin thành công", dt: updatedUser });

  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

// users/me/general-of-points
/** 
 * - điểm khả dụng 
 * - điểm chờ xét 
 * - điểm đã sử dụng
 */
export const getGeneralOfUserPoints = async (req, res) => {
  const uerId = req.user._id;
  const ec = 0;
  const statusCode = 200;
  const em = "Lấy thông tin điểm thành viên thành công";
  const dt = {};

  try {
    dt.points_available = req.user.points || 0;
    const result = await Order.aggregate([
      {
        $match: {
          user_id: uerId,
          payment_status: { $in: ['paid', 'pending'] }
        }
      },
      {
        $group: {
          _id: "$payment_status",
          points_used: { $sum: "$points_used" },
          loyalty_points_earned: {
            $sum: {
              $cond: {
                if: { $eq: ["$payment_status", "paid"] }, // Điều kiện: Nếu status = 'paid'
                then: "$loyalty_points_earned",           // THÌ: cộng giá trị của trường amount
                else: 0                                   // NGƯỢC LẠI: cộng 0
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          user_id: 1,
          payment_status: "$_id",
          points_used: 1,
          loyalty_points_earned: 1,
          count: 1
        }
      }
    ]);

    result.forEach(item => {
      dt.points_used = Math.max(dt.points_used || 0, item.points_used || 0);
      if (item.payment_status === 'paid') {
        dt.loyalty_points_earned = item.loyalty_points_earned || 0;
      } if (item.payment_status === 'pending') {
        dt.points_pending = item.loyalty_points_earned || 0;
      }
    })
    res.status(statusCode).json({ ec, em, dt });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

// users/me/points-history
export const getPointsHistory = async (req, res) => {
  const userId = req.user._id;
  const statusCode = 200;
  const ec = 0;
  const em = "Lấy lịch sử điểm thành viên thành công";
  const dt = {};
  try {
    const pointsHistory = await Order.find({ user_id: userId })
      .select('points_used loyalty_points_earned payment_status createdAt')
      .sort({ createdAt: -1 });
    dt.points_history = pointsHistory;
    res.status(statusCode).json({ ec, em, dt });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

// User Management Controllers
export const updatePassword = async (req, res) => {
  try {
    const { password, new_password } = req.body;

    // Load lại user từ DB để có trường password
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ ec: 404, em: "User not found" });

    // So sánh mật khẩu cũ
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ ec: 400, em: "Mật khẩu cũ không đúng" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(new_password, salt);
    await user.save();

    res.json({ ec: 0, em: "Cập nhật mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

// Tạo user tạm để gán đơn hàng
export const createUserTemp = async (req, res) => {
  try {
    const { username, email, Addresses } = req.body;
    const user = new User({
      username: username,
      password: "12345678",
      email: email,
      Addresses: Addresses
    });

    const createdUser = await user.save();
    res.status(201).json({ ec: 201, em: "Tạo user tạm thành công", dt: createdUser });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

// Admin :User Management Controllers

export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      q = '',
      status,
      role,
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const query = {};

    if (q) {
      query.$or = [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (status === 'banned') query.is_banned = true;

    if (role === 'manager') query.isManager = true;
    if (role === 'user') query.isManager = false;

    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(pageSize * (pageNumber - 1))
        .limit(pageSize),
    ]);

    res.json({
      ec: 0,
      em: "Get all users successfully",
      dt: {
        users,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        total,
      }
    });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};


export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.user_id).select('-password');

    if (user) {
      res.json({ ec: 0, em: "Lấy thông tin người dùng thành công", dt: user });
    } else {
      res.status(404).json({ ec: 404, em: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};


export const updateUserById = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const {
      username,
      email,
      image,
      gender,
      password,
      points,
      isActive,
      isManager,
      is_banned,
      banned_reason,
    } = req.body;

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (image !== undefined) updateData.image = image;
    if (gender !== undefined) updateData.gender = gender;
    if (points !== undefined) updateData.points = Number(points);
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof isManager === 'boolean') updateData.isManager = isManager;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    if (typeof is_banned === 'boolean') {
      updateData.is_banned = is_banned;
      updateData.banned_reason = is_banned ? (banned_reason || null) : null;
      updateData.banned_at = is_banned ? new Date() : null;
      if (is_banned) {
        updateData.isActive = false;
      }
    }

    const user = await User.findByIdAndUpdate(
      user_id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (user) {
      res.json({ ec: 0, em: "User updated successfully", dt: user });
    } else {
      res.status(404).json({ ec: 404, em: "User not found" });
    }

  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};


// Cart Management Controllers
export const addProductToCart = async (req, res) => {
  try {
    const { product_id, variant, quantity } = req.body;
    const sku = variant?.sku;
    const qty = parseQuantity(quantity);

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ ec: 404, em: "Product not found" });
    }
    const variantDoc = product.Variants.find((v) => v.sku === sku);
    if (!variantDoc) {
      return res.status(404).json({ ec: 404, em: "Variant not found" });
    }

    const cartItem = req.user.Carts.find(
      (item) => item.product_id.toString() === product_id && item.variant.sku === sku
    );
    const newQuantity = cartItem ? cartItem.quantity + qty : qty;
    if (!product.checkQuantity(newQuantity, sku)) {
      return res
        .status(400)
        .json({ ec: 0, em: "Khong du so luong trong kho cho san pham nay" });
    }

    const variantInfo = {
      sku: variantDoc.sku,
      price: variantDoc.price,
      attributes: variantDoc.Attributes.filter((attr) => attr.type === 'appearance'),
    };
    const image_url = await Product.getImageUrlByVariantSKU(product_id, variantDoc.sku);

    if (cartItem) {
      cartItem.quantity = newQuantity;
      cartItem.variant = variantInfo;
      cartItem.image_url = image_url;
    } else {
      req.user.Carts.push({
        product_id,
        variant: variantInfo,
        quantity: newQuantity,
        image_url,
      });
    }

    await req.user.save();
    const response = await buildCartResponse(req.user.Carts);
    return res.json({
      ec: 0,
      em: 'Them vao gio hang thanh cong',
      dt: {
        ...response, added_item: {
          product_id,
          variant: variantInfo,
          quantity: qty,
          image_url
        }
      },
    });
  } catch (err) {
    return res.status(500).json({ ec: 500, em: err.message });
  }
};

export const getAllCarts = async (req, res) => {
  try {
    const response = await buildCartResponse(req.user.Carts);
    res.json({
      ec: 0,
      em: 'Lay gio hang thanh cong',
      dt: response,
    });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const deleteCartItem = async (req, res) => {
  try {
    const product_id = req.params.product_id;
    const { sku } = req.query;

    const cartItem = req.user.Carts.find(
      (item) => item.product_id.toString() === product_id && item.variant.sku === sku
    );
    if (!cartItem) {
      return res.status(404).json({ ec: 404, em: 'Khong tim thay san pham trong gio hang' });
    }

    const result = await User.updateOne(
      { _id: req.user._id },
      { $pull: { Carts: { product_id: product_id, 'variant.sku': sku } } }
    );
    if (result.modifiedCount > 0) {
      const updatedUser = await User.findById(req.user._id).select('Carts');
      const response = await buildCartResponse(updatedUser.Carts);
      res.json({
        ec: 0, em: 'Cart item removed', dt: {
          ...response,
          removed_item: {
            product_id,
            variant: { sku }
          }
        }
      });
    } else {
      res.status(404).json({ ec: 404, em: 'Cart item not found' });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { sku } = req.query;
    const { variant, quantity } = req.body;

    const cartItem = req.user.Carts.find(
      (item) => item.product_id.toString() === product_id && item.variant.sku === sku
    );
    if (!cartItem) {
      return res.status(404).json({ ec: 404, em: 'Khong tim thay san pham trong gio hang' });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ ec: 404, em: 'Product not found' });
    }

    const nextSku = variant?.sku || sku;
    const variantDoc = product.Variants.find((v) => v.sku === nextSku);
    if (!variantDoc) {
      return res.status(404).json({ ec: 404, em: 'Variant not found' });
    }

    const nextQuantity = parseQuantity(quantity || cartItem.quantity);
    if (!product.checkQuantity(nextQuantity, nextSku)) {
      return res.status(400).json({ ec: 400, em: 'Khong du so luong trong kho' });
    }

    cartItem.variant = {
      sku: variantDoc.sku,
      price: variantDoc.price,
      attributes: variantDoc.Attributes.filter((attr) => attr.type === 'appearance'),
    };
    cartItem.quantity = nextQuantity;
    cartItem.image_url = await Product.getImageUrlByVariantSKU(product_id, variantDoc.sku);

    await req.user.save();
    const response = await buildCartResponse(req.user.Carts);
    res.json({
      ec: 0,
      em: 'Cap nhat san pham trong gio hang thanh cong',
      dt: {
        ...response, update_item: {
          product_id,
          variant: cartItem.variant,
          quantity: cartItem.quantity,
          image_url: cartItem.image_url,
        }
      },
    });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

// Address Management Controllers
export const getAllAddresses = async (req, res) => {
  try {
    res.json({ ec: 0, em: "Lấy địa chỉ thành công", dt: req.user.Addresses });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

// Đặt tất cả địa chỉ isDefault = false
export const setDefaultAddress = (user) => {
  user.Addresses.forEach(addr => {
    addr.isDefault = false;
  });
};

export const addAddress = async (req, res) => {
  try {
    const { receiver, phone, country, province, district, ward, street, postalCode, isDefault } = req.body;
    // Nếu đặt địa chỉ này là mặc định, thì bỏ mặc định các địa chỉ khác
    if (isDefault === true) {
      setDefaultAddress(req.user);
    }
    req.user.Addresses.push({ receiver, phone, country, province, district, ward, street, postalCode, isDefault });
    await req.user.save();
    res.json({ ec: 0, em: "Thêm địa chỉ thành công", dt: req.user.Addresses });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const address_id = req.params.address_id;
    const { receiver, phone, country, province, district, ward, street, postalCode, isDefault } = req.body;
    if (isDefault === true) {
      setDefaultAddress(req.user);
    }
    const address = req.user.Addresses.id(address_id);
    if (address) {
      address.receiver = receiver || address.receiver;
      address.phone = phone || address.phone;
      address.country = country || address.country;
      address.province = province || address.province;
      address.district = district || address.district;
      address.ward = ward || address.ward;
      address.street = street || address.street;
      address.postalCode = postalCode || address.postalCode;
      address.isDefault = isDefault || address.isDefault;

      await req.user.save();
      res.json({ ec: 0, em: "Cập nhật địa chỉ thành công", dt: address });
    } else {
      res.status(404).json({ ec: 404, em: "Không tìm thấy địa chỉ" });
    }

  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const address_id = req.params.address_id;
    if (req.user.Addresses.id(address_id).isDefault) {
      return res.status(400).json({ ec: 400, em: "Không thể xóa địa chỉ mặc định" });
    }
    const deleteResult = await User.updateOne(
      { _id: req.user._id },
      { $pull: { Addresses: { _id: address_id } } }
    );
    if (deleteResult.modifiedCount === 0) {
      return res.status(404).json({ ec: 404, em: "Không tìm thấy địa chỉ để xóa" });
    }
    res.json({ ec: 200, em: "Xóa địa chỉ thành công" });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};
