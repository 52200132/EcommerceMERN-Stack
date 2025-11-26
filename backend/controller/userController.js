import { clearCacheGroup } from "#middleware";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Profile Management Controllers
export const getProfile = async (req, res) => {
  try {
    const user_id = req.user._id;
    const profile = await User.findById(user_id).select('-password -points -Carts -Addresses -Linked_accounts -updatedAt -__v');
    res.json({ ec: 200, em: "Lấy thông tin profile thành công", dt: profile });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updateData = {
      usernaem: req.body.username,
      email: req.body.email,
      image: req.body.image,
      gender: req.body.gender
    };
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password -points -Carts -Addresses -Linked_accounts -updatedAt -__v');
    clearCacheGroup('userProfile');
    res.json({ ec: 0, em: "Cập nhật thông tin thành công", dt: updatedUser });

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
      usernaem: username,
      password: "12345678",
      email: email,
      Addresses: Addresses
    });

    const createdUser = await user.save();
    res.status(201).json({ ec: 201, em: "Tạo user tạm thành công", dt: user });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

// Admin :User Management Controllers
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ ec: 0, em: "Lấy tất cả người dùng thành công", dt: users });
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
    // Thông tin người dùng 
    const { username, email, image, gender, password, points, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      user_id,
      { username, email, image, gender, password, points, isActive },
      { new: true }
    ).select('-password');

    if (user) {
      res.json({ ec: 0, em: "Cập nhật thông tin người dùng thành công", dt: user });
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

    const cart = req.user.Carts.find(item =>
      item.product_id.toString() === product_id &&
      JSON.stringify(item.variant.sku) === JSON.stringify(variant.sku)
    );

    if (cart) {
      // Nếu sản phẩm đã có trong giỏ hàng với variant giống nhau, tăng số lượng
      cart.quantity += quantity;
    } else {
      // Thêm sản phẩm mới vào giỏ hàng
      req.user.Carts.push({
        product_id,
        variant,
        quantity
      });
    }

    await req.user.save(); // sẽ cast và validate đúng
    return res.json({ ec: 200, em: 'Thêm thành công', dt: req.user.Carts });
  } catch (err) {
    return res.status(500).json({ ec: 500, em: err.message });
  }
};

export const getAllCarts = async (req, res) => {
  try {
    res.json({ ec: 200, em: "Lấy giỏ hàng thành công", dt: req.user.Carts });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const deleteCartItem = async (req, res) => {
  try {
    // tham số lọc ra cart cần xóa
    const product_id = req.params.product_id;
    const { sku } = req.query;

    const cartItem = req.user.Carts.find(item =>
      item.product_id.toString() === product_id &&
      JSON.stringify(item.variant.sku) === JSON.stringify(sku)
    );
    if (!cartItem) {
      return res.status(404).json({ ec: 404, em: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }

    const result = await User.updateOne(
      { _id: req.user._id },
      { $pull: { Carts: { product_id: product_id, "variant.sku": sku } } }
    );
    if (result.modifiedCount > 0) {
      res.json({ ec: 200, em: 'Cart item removed' });
    } else {
      res.status(404).json({ ec: 404, em: 'Cart item not found' });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    // tham số lọc ra cart cần cập nhật
    const { product_id } = req.params;
    const { sku } = req.query;
    // tham số cập nhật
    const { variant, quantity } = req.body;

    const cartItem = req.user.Carts.find(item =>
      item.product_id.toString() === product_id &&
      JSON.stringify(item.variant.sku) === JSON.stringify(sku)
    );
    if (!cartItem) {
      return res.status(404).json({ ec: 404, em: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }
    cartItem.variant = variant || cartItem.variant;
    cartItem.quantity = quantity || cartItem.quantity;

    await req.user.save();
    res.json({ ec: 200, em: "Cập nhật sản phẩm trong giỏ hàng thành công", dt: cartItem });

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

// TODO: Bảng điều khiển đơn giản: tổng quan chi tiết về hiệu suất của cửa hàng, các số liệu chính và thông tin chi tiết hữu ích. Bao gồm: Tổng số người
// dùng, số lượng người dùng mới, số lượng đơn hàng, doanh thu, các sản phẩm bán chạy nhất được thể hiện qua biểu đồ.



// TODO: Bảng điều khiển Nâng cao: Hiển thị số liệu thống kê và biểu đồ liên quan cho thông tin chính theo các khoảng thời gian cụ thể. Theo mặc định, dữ
// liệu được hiển thị hàng năm, nhưng người dùng có thể linh hoạt điều chỉnh chế độ xem theo quý, hàng tháng, hàng tuần hoặc dựa trên ngày bắt đầu
// và kết thúc đã xác định. Đối với mỗi khung thời gian này, việc theo dõi số lượng đơn hàng đã bán, tổng doanh thu và lợi nhuận chung là rất quan
// trọng. Ngoài ra, cần có các biểu đồ so sánh thể hiện doanh thu, lợi nhuận, số lượng sản phẩm và loại sản phẩm đã bán, được phân chia theo năm,
// tháng, quý và tuần.