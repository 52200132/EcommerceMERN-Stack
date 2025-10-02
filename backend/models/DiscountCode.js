const discountCodeSchema = new mongoose.Schema({
  code: { type: String, required: [true, "Mã giảm giá là bắt buộc"], unique: true, minlength: 5, maxlength: 5},
  limit: { type: Number, required: [true, "Giới hạn số lần sử dụng là bắt buộc"], min: 0, max: 10}
}, { timestamps: true });

module.exports = mongoose.model("DiscountCode", discountCodeSchema);