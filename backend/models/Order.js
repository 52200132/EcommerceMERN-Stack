const mongoose = require("mongoose");

const orderItemVariantSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  attributes: [{
    attribute: { type: String, required: true },
    value: { type: String, required: true }
  }],
  price: { type: Number, required: true }
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  product_name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variant: { type: orderItemVariantSchema, required: true }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  receiver: { type: String, required: true },
  phone: { type: String, required: true, match: /^[0-9]{10}$/ },
  country: { type: String, required: true },
  province: { type: String, required: true },
  district: { type: String, required: true },
  ward: { type: String, required: true },
  street: { type: String, required: true },
  postalCode: { type: String, required: true }
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status: { 
    type: String, 
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"], 
    required: true 
  },
  change_at: { type: Date, required: true },
  change_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  order_code: { type: String, required: true, unique: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  Items: { type: [orderItemSchema], required: true, validate: v => v.length > 0 },

  discount_code: { type: String, match: /^[A-Za-z0-9]{5}$/ },

  shipping_address: { type: shippingAddressSchema, required: true },
  payment_method: { type: String, enum: ["COD", "banking", "credit_card"], required: true },
  payment_status: { type: String, enum: ["pending", "paid", "failed", "refunded"], required: true },
  status: { type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled"], required: true },
  StatusHistory: [statusHistorySchema],

  total_amount: { type: Number, min: 0, required: true },
  discount: { type: Number, min: 0, default: 0 },
  shipping_fee: { type: Number, min: 0, default: 0 },
  grand_total: { type: Number, min: 0, required: true },

  notes: { type: String },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
}, { timestamps: false });
// không dùng timestamps vì đã có create_at, update_at

// Dùng pre-save hook để tự tính grand_total trước khi lưu:
orderSchema.pre("save", function (next) {
  this.grand_total = this.total_amount - this.discount + this.shipping_fee;
  next();
});

module.exports = mongoose.model("Order", orderSchema);