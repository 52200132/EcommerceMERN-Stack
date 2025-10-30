import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const brandSchema = new Schema({
  brand_name: { type: String, required: [true] }
}, { timestamps: true });

// Nếu model chưa tồn tại, mới tạo (tránh lỗi khi reload trong môi trường dev)
const Brand = mongoose.models.Brand || model('Brand', brandSchema);

export default Brand;