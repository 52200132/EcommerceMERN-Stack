const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  is_primary: { type: Boolean, required: true }
}, { _id: false });

const attributeSchema = new mongoose.Schema({
  attribute: { type: String, required: true },
  value: { type: String, required: true },
  type: { type: String, enum: ["technology", "appearance"], required: true }
}, { _id: false });

const variantSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  price: { type: Number, min: 0, required: true },
  stock: { type: Number, min: 0, required: true },

  Images: [imageSchema],
  Attributes: [attributeSchema],

  is_active: { type: Boolean, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { _id: false });

const productSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
  brand_id: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
  hashtag: { type: String },
  quantity_sold: { type: Number, min: 0, default: 0 },

  price_min: { type: Number, min: 0, required: true },
  price_max: { type: Number, min: 0, required: true },

  short_description: { type: String, required: true },
  detail_description: { type: String, required: true },

  Images: [imageSchema],
  Variants: [variantSchema],

  is_active: { type: Boolean, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { timestamps: false }); 
// không dùng timestamps vì đã có created_at, updated_at

module.exports = mongoose.model('Product', productSchema);