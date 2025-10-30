import mongoose from "mongoose";

const { Schema, model } = mongoose;

//  Subschema: imageSchema 
const imageSchema = new Schema({
  url: { type: String, required: true },
  is_primary: { type: Boolean, required: true },
}, { _id: false });

//  Subschema: attributeSchema 
const attributeSchema = new Schema({
  attribute: { type: String, required: true },
  value: { type: String, required: true },
  type: { type: String, enum: ["technology", "appearance"], required: true },
  is_show_in_table: { type: Boolean, required: true, default: true },
  group_attribute: { type: String },
}, { _id: false });

//  Subschema: warehouse_variant
const warehouseVariantSchema = new Schema({
  sku: { type: String, required: true},
  quantity: { type: Number, required: true, min: 0 },
  waiting_for_delivery: { type: Number, required: true, min: 0 },
}, { _id: false });

//  Subschema: warehouseSchema
const warehouseSchema = new Schema({
  name : { type: String, required: true },
  location: { type: String },
  warehouse_variants: [warehouseVariantSchema],
}, { _id: true });

//  Subschema: variantSchema 
const variantSchema = new Schema({
  sku: { type: String, required: true, unique: true },
  price: { type: Number, min: 0, required: true },
  stock: { type: Number, min: 0},
  html_text_attributes: { type: String }, // dung cho render attribute
  Images: [imageSchema],
  Attributes: [attributeSchema],
  is_active: { type: Boolean, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { _id: false });

//  Main Schema: productSchema 
const productSchema = new Schema({
  product_name: { type: String, required: true },
  brand_id: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
  hashtag: { type: String },
  quantity_sold: { type: Number, min: 0, default: 0 },
  price_min: { type: Number, min: 0, required: true },
  price_max: { type: Number, min: 0, required: true },
  short_description: { type: String, required: true },
  detail_description: { type: String, required: true },
  Images: [imageSchema],
  Warehouses: [warehouseSchema],
  Variants: [variantSchema],
  is_active: { type: Boolean, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { timestamps: false }); 
// Không dùng timestamps vì đã có created_at, updated_at

// Hàm tính lại stock cho các variant dựa trên thông tin trong Warehouses
productSchema.methods.recalculateStock = function() {
  this.Variants.forEach(variant => {
    let totalStock = 0;
    // this.Warehouses.forEach(warehouse => {
    //   warehouse.warehouse_variants.forEach(wv => {
    //     if (wv.sku === variant.sku) {
    //       totalStock += (wv.quantity - wv.waiting_for_delivery);
    //     }
    //   });
    // });
    totalStock = this.getStockBySku(variant.sku);
    variant.stock = totalStock;
  });
};
// Tính stock theo sku của variant
productSchema.methods.getStockBySku = function(sku) {
  let totalStock = 0;
  this.Warehouses.forEach(warehouse => {
    warehouse.warehouse_variants.forEach(wv => {
      if (wv.sku === sku) {
        totalStock += (wv.quantity - wv.waiting_for_delivery);
      }
    });
  });
  return totalStock;
};

// cách dùng 
// product.recalculateStock();
// chỉ gọi product.recalculateStock(); khi dùng get product

// Kiểm tra số lượng đặt hàng
productSchema.methods.checkQuantity = function( quantityOrdered, sku) {
  let quantityAvailable = this.getStockBySku(sku);
  if (quantityOrdered > quantityAvailable) {
    return false;
  }
  return true;
};

// Cập nhật số lượng sau khi đặt hàng thành công đẩy vào waiting_for_delivery
productSchema.methods.updateStockAfterOrder = function(quantityOrdered, sku) {
  let list_warehouses = [];
  this.Warehouses.forEach(warehouse => {
    warehouse.warehouse_variants.forEach(wv => {
      if (wv.sku === sku){
        if (quantityOrdered <= wv.quantity) {
          wv.waiting_for_delivery += quantityOrdered;
          quantityOrdered = 0;
          list_warehouses.push({warehouseId: warehouse._id, sku: sku, quantity: quantityOrdered});
        } else {
          quantityOrdered -= wv.quantity;
          wv.waiting_for_delivery += wv.quantity;
          list_warehouses.push({warehouseId: warehouse._id, sku: sku, quantity: wv.quantity});
        }
      }
    });
  });
  return list_warehouses;
};

// Xuất hàng giảm quantity, waiting_for_delivery
productSchema.methods.exportStockAfterShipping = function(quantityShipped, sku) {
  let list_warehouses = [];
  this.Warehouses.forEach(warehouse => {
    warehouse.warehouse_variants.forEach(wv => {
      if (wv.sku === sku){
        if (quantityShipped <= wv.waiting_for_delivery) {
          wv.quantity -= quantityShipped;
          wv.waiting_for_delivery -= quantityShipped;
          quantityShipped = 0;
          list_warehouses.push({ warehouseId: warehouse._id, sku: sku, quantity: quantityShipped });
        } else {
          quantityShipped -= wv.waiting_for_delivery;
          wv.quantity -= wv.waiting_for_delivery;
          wv.waiting_for_delivery = 0;
          list_warehouses.push({ warehouseId: warehouse._id, sku: sku, quantity: wv.waiting_for_delivery });
        }
      }
    });
  });
  return list_warehouses;
};

// Trả về min và max price của product dựa trên các variant
productSchema.pre("save",  function(next) {
  if (this.Variants && this.Variants.length > 0) {
  let prices = this.Variants.map(variant => variant.price);
  this.price_min = Math.min(...prices);
  this.price_max = Math.max(...prices);
  }
  next();
});

const Product = mongoose.models.Product || model("Product", productSchema);
export default Product;
