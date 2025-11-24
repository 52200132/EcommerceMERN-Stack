import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const categorySchema = new Schema({
  category_name: { type: String, required: true, unique: true }
}, { timestamps: false });

// Nếu model chưa tồn tại, mới tạo (tránh lỗi khi reload trong môi trường dev)
const Category = mongoose.models.Category || model('Category', categorySchema);

export default Category;