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
}, { _id: false });

//  Subschema: orderItemSchema 
const orderItemSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
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
  change_by: { type: Schema.Types.ObjectId, ref: "User", default: null },
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
  StatusHistory: { type: [statusHistorySchema], default: [{ status: "pending", change_at: new Date(), change_by: null }] },
  total_amount: { type: Number, min: 0 },
  discount: { type: Number, min: 0, default: 0 },
  shipment: { type: shipmentSchema, required: true },
  grand_total: { type: Number, min: 0},
  notes: { type: String }
}, { timestamps: true });

// post-save để xử lý điểm khách hàng (an toàn hơn pre-save)
// orderSchema.post('save', async function(doc) {
//   try {
//     // Lấy user
//     const user = await User.findById(doc.user_id).select('points');
//     if (!user) return;

//     // Nếu đơn được giao (delivered) thì cộng điểm
//     if (doc.isModified('order_status') && doc.order_status === 'delivered') {
//       user.points += parseInt(doc.total_amount * 0.1); // 10% tổng tiền
//       console.log(parseInt(doc.total_amount * 0.1))
//       console.log('User points after delivery:', user.points);
//       await user.save();
//     }

//     // Nếu đơn bị hủy sau khi đã giao thì trừ điểm
//     else if (doc.isModified('order_status') && doc.order_status === 'cancelled') {
//       user.points += parseInt(doc.points_used); // hoàn trả điểm đã dùng
//       if (user.points < 0) user.points = 0; // tránh âm
//       console.log(parseInt(doc.points_used));
//       console.log('User points after cancellation:', user.points);
//       await user.save();
//     }
//   } catch (err) {
//     console.error('Error updating user points:', err);
//   }
// });


//  Export model 
const Order = mongoose.models.Order || model("Order", orderSchema);
export default Order;