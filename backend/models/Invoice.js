import mongoose from "mongoose";

const { Schema, model } = mongoose;

const invoiceSchema = new Schema({
  invoice_code: { type: String, required: true, trim: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  order_id: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  create_at: { type: Date, required: true, default: Date.now },
  payment_method: { type: String, enum: ["COD", "banking", "credit_card"], required: true },
  payment_status: { type: String, enum: ["pending", "paid", "failed", "refunded"], required: true, default: "pending" },
  total_amount: { type: Number, min: 0, required: true },
  discount: { type: Number, min: 0, required: true, default: 0 },
  shipping_fee: { type: Number, min: 0, required: true, default: 0 },
  grand_total: { type: Number, min: 0, required: true },
    // grand_total = total_amount - discount + shipping_fee
});

// Dùng pre-save hook để tự tính grand_total trước khi lưu:
invoiceSchema.pre("save", function (next) {
  this.grand_total = this.total_amount - this.discount + this.shipping_fee;
  next();
});

const Invoice = mongoose.models.Invoice || model("Invoice", invoiceSchema);

export default Invoice;