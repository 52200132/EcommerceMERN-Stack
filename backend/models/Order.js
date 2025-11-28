import mongoose from "mongoose";
import User from "../models/User.js"; // xử lý tích điểm khách hàng thân thiết

const { Schema, model } = mongoose;

//  Subschema: orderItemVariantSchema 
const orderItemVariantSchema = new Schema({
  sku: { type: String, required: true },
  attributes: [
    {
      attribute: { type: String, required: true },
      value: { type: String, required: true }
    }
  ],
  price: { type: Number, required: true },
  cost_price: { type: Number, required: true, min: 0 }
}, { _id: false });

//  Subschema: orderItemSchema 
const orderItemSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  category_name: { type: String, required: true },
  product_name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variant: { type: orderItemVariantSchema, required: true },
}, { _id: false });

//  Subschema: shippingAddressSchema 
const shippingAddressSchema = new Schema({
  receiver: { type: String, required: true },
  phone: { type: String, required: true, match: /^[0-9]{10}$/ },
  country: { type: String, required: true },
  province: { type: String, required: true },
  district: { type: String, required: true },
  ward: { type: String, required: true },
  street: { type: String, required: true },
  postalCode: { type: String, required: true },
}, { _id: false });

//  Subschema: statusHistorySchema 
const statusHistorySchema = new Schema({
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    required: true
  },
  change_at: { type: Date, required: true },
  change_by: { type: Schema.Types.ObjectId, ref: "User", default: null }
}, { _id: false });

// Subschema: shipmentSchema
const shipmentSchema = new Schema({
  method: { type: String, required: true },
  fee: { type: Number, required: true, min: 0 },
  note: { type: String }
}, { _id: false });

//  Main Schema: orderSchema 
const orderSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  Items: {
    type: [orderItemSchema], required: true, validate: v => v.length > 0,
  },
  discount_code: { type: String, match: /^[A-Za-z0-9]{5}$/ },
  points_used: { type: Number, min: 0, default: 0 },
  shipping_address: { type: shippingAddressSchema, required: true },
  payment_method: {
    type: String,
    enum: ["COD", "banking", "credit_card"],
    required: true
  },
  payment_status: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    required: true,
    default: "pending"
  },
  order_status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    required: true,
    default: "pending"
  },
  StatusHistory: {
    type: [statusHistorySchema],
    default: () => [{ status: "pending", change_at: new Date(), change_by: null }]
  },
  total_amount: { type: Number, min: 0 },
  discount: { type: Number, min: 0, default: 0 },
  shipment: { type: shipmentSchema, required: true },
  tax_fee: { type: Number, min: 0, default: 0 },
  grand_total: { type: Number, min: 0 },
  loyalty_points_earned: { type: Number, min: 0, default: 0 },
  notes: { type: String }
}, { timestamps: true });

//  Export model 
const Order = mongoose.models.Order || model("Order", orderSchema);
export default Order;
