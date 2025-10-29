import User from "../models/User.js";
import bcrypt from "bcryptjs";

const getProfile = (req, res) => {
  res.json(req.user);
};

const updateProfile = async (req, res) => {
  try {
    const updateData = {
      username: req.body.username,
      email: req.body.email,
      Addresses: req.body.Addresses
    };
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedUser);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    
    const user = await User.findById(req.user._id);

    if (user) {
      // pre-save hook will hash the password
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const createUserTemp = async (req, res) => {
  try {
    const user = new User({
      username: "User" + Date.now(),
      password: "12345678",
      email: req.body.email,
      isManager: false,
      Addresses: req.body.Addresses || []
    });
    
    const createdUser = await user.save();
    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addProductToCart = async (req, res) => {
  try {
    const { product_id, variant, quantity } = req.body;
    await User.updateOne(
      { _id: req.user._id },
      { $push: { Carts: { product_id, variant, quantity } } },
      { new: true }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllCarts = async (req, res) => {
  try {
    res.json(req.user.Carts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllAddresses = async (req, res) => {
  try {
    res.json(req.user.Addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getALlUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const product_id = req.params.product_id;
    const result = await User.updateOne(
      { _id: req.user._id },
      { $pull: { Carts: { product_id: product_id } } }
    );
    if (result.modifiedCount > 0) {
      res.json({ message: 'Cart item removed' });
    } else {
      res.status(404).json({ message: 'Cart item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { product_id, variant, quantity } = req.body;
    updateCartItem = await User.updateOne(
      { _id: req.user._id, "Carts.product_id": product_id },
      { $set: { "Carts.$.variant": variant, "Carts.$.quantity": quantity } },
      { new: true }
    );

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getProfile, updateProfile, updatePassword, createUserTemp, getAllCarts, getAllAddresses, addProductToCart, deleteCartItem, updateCartItem, getALlUsers, getUserById };