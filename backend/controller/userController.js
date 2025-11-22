import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Profile Management Controllers
export const getProfile = async (req, res) => {
  try {
    const user_id = req.user._id;
    const profile = await User.findById(user_id).select('-password -points -Carts -Addresses -Linked_accounts -updatedAt -__v');
    res.json({ ec: 200, me: "Lấy thông tin profile thành công", dt: profile });
  } catch (error) {
    res.status(500).json({ ec: 500, me: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updateData = {
      username: req.body.username,
      email: req.body.email,
      image: req.body.image,
      gender: req.body.gender
    };
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password -points -Carts -Addresses -Linked_accounts -updatedAt -__v');

    res.json({ ec: 200, me: "Cập nhật thông tin thành công", dt: updatedUser });

  } catch (error) {
    res.status(500).json({ ec: 500, me: error.message });
  }
};

// User Management Controllers
export const updatePassword = async (req, res) => {
  try {
    const { password, new_password } = req.body;

    // Load lại user từ DB để có trường password
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ ec: 404, me: "User not found" });

    // So sánh mật khẩu cũ
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ ec: 400, me: "Mật khẩu cũ không đúng" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(new_password, salt);
    await user.save();

    res.json({ ec: 0, me: "Cập nhật mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ ec: 500, me: error.message });
  }
};

export const createUserTemp = async (req, res) => {
  try {
    const user = new User({
      username: "User" + Date.now(),
      password: "12345678",
      email: req.body.email,
      Addresses: req.body.Addresses
    });
    
    const createdUser = await user.save();
    res.status(201).json({ ec: 201, me: "Tạo user tạm thành công", dt: {
      _id: createdUser._id,
      username: createdUser.username,
      email: createdUser.email,
      Addresses: createdUser.Addresses
    }});
  } catch (error) {
    res.status(500).json({ ec: 500, me: error.message });
  }
};
  // Admin :User Management Controllers
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ ec: 200, me: "Lấy tất cả người dùng thành công", dt: users });
  } catch (error) {
    res.status(500).json({ ec: 500, me: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.user_id).select('-password');

    if (user) {
      res.json({ ec: 200, me: "Lấy thông tin người dùng thành công", dt: user });
    } else {
      res.status(404).json({ ec: 404, me: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, me: error.message });
  }
};

export const updateUserById = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    //TODO:? Thông tin người dùng 
    const { username, email, image, gender, password, points, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      user_id,
      { username, email, image, gender, password, points, isActive },
      { new: true }
    ).select('-password');

    if (user) {
      res.json({ ec: 200, me: "Cập nhật thông tin người dùng thành công", dt: user });
    } else {
      res.status(404).json({ ec: 404, me: "User not found" });
    }

  } catch (error) {
    res.status(500).json({ ec: 500, me: error.message });
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
    return res.json({ ec:200, me:'Thêm thành công', dt: req.user.Carts });
  } catch (err) {
    return res.status(500).json({ ec:500, me: err.message });
  }
};

export const getAllCarts = async (req, res) => {
  try {
    res.json({ ec: 200, me: "Lấy giỏ hàng thành công", dt: req.user.Carts });
  } catch (error) {
    res.status(500).json({ ec: 500, me: error.message });
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
      return res.status(404).json({ ec: 404, me: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }

    const result = await User.updateOne(
      { _id: req.user._id },
      { $pull: { Carts: { product_id: product_id, "variant.sku": sku } } }
    );
    if (result.modifiedCount > 0) {
      res.json({ ec: 200, me: 'Cart item removed' });
    } else {
      res.status(404).json({ ec: 404, me: 'Cart item not found' });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, me: error.message });
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
      return res.status(404).json({ ec: 404, me: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }
    cartItem.variant = variant || cartItem.variant;
    cartItem.quantity = quantity || cartItem.quantity;

    await req.user.save();
    res.json({ ec: 200, me: "Cập nhật sản phẩm trong giỏ hàng thành công", dt: cartItem });

  } catch (error) {
    res.status(500).json({ ec: 500, me: error.message });
  }
};

// Address Management Controllers
export const getAllAddresses = async (req, res) => {
  try {
    res.json({ ec: 200, me: "Lấy địa chỉ thành công", dt: req.user.Addresses });
  } catch (error) {
    res.status(500).json({ ec: 500, me: error.message });
  }
};

// Đặt tất cả địa chỉ isDefault = false
const setDefaultAddress = (user) => {
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
    res.json({ ec: 200, me: "Thêm địa chỉ thành công", dt: req.user.Addresses });
  } catch (error) {
    res.status(500).json({ ec: 500, me: error.message });
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
      res.json({ ec: 200, me: "Cập nhật địa chỉ thành công", dt: address });
    } else {
      res.status(404).json({ ec: 404, me: "Không tìm thấy địa chỉ" });
    }

  } catch (error) {
    res.status(500).json({ ec: 500, me: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const address_id = req.params.address_id;
    if (req.user.Addresses.id(address_id).isDefault) {
      return res.status(400).json({ ec: 400, me: "Không thể xóa địa chỉ mặc định" });
    }
    const deleteResult = await User.updateOne(
      { _id: req.user._id },
      { $pull: { Addresses: { _id: address_id } } }
    );
    if (deleteResult.modifiedCount === 0) {
      return res.status(404).json({ ec: 404, me: "Không tìm thấy địa chỉ để xóa" });
    }
    res.json({ ec: 200, me: "Xóa địa chỉ thành công" });
  } catch (error) {
    res.status(500).json({ ec: 500, me: error.message });
  }
};

// TODO: Thêm ảnh đại diện người dùng/ lưu ảnh về máy chủ