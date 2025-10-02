const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  receiver: { type: String, required: true },
  phone: { type: String, required: true, match: /^[0-9]{10}$/ },
  country: { type: String, required: true },
  province: { type: String, required: true },
  district: { type: String, required: true },
  ward: { type: String, required: true },
  street: { type: String, required: true },
  postalCode: { type: String, required: true },
  isDefault: { type: Boolean, required: true }
}, { _id: false });

const variantSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  attributes: [{
    attribute: { type: String, required: true },
    value: { type: String, required: true }
  }],
  price: { type: Number, required: true, min: 0 }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variant: { type: variantSchema, required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const linkedAccountSchema = new mongoose.Schema({
  provider: { type: String, required: true },
  provider_id: { type: String, required: true },
  linked_at: { type: Date, required: true },
  last_login: { type: Date, required: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    match: /^.+@.+\..+$/, 
    unique: true 
  },
  password: { type: String, required: true },
  isManager: { type: Boolean, required: true },
  Addresses: [addressSchema],
  Carts: [cartSchema],
  Linked_accounts: [linkedAccountSchema]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);