import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const discountCodeSchema = new Schema({
  code: {
    type: String, required: true,
    unique: true,
    minlength: [5, 'Mã giảm giá phải có đúng 5 ký tự'],
    maxlength: [5, 'Mã giảm giá phải có đúng 5 ký tự']
  },
  limit: {
    type: Number,
    required: true,
    min: [0, 'Giới hạn số lần sử dụng không được nhỏ hơn 0'],
    max: [10, 'Giới hạn số lần sử dụng không được lớn hơn 10']
  }
}, { timestamps: true });

export default mongoose.models.DiscountCode || model("DiscountCode", discountCodeSchema);