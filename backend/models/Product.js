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
  // sku: { type: String, required: true, unique: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  waiting_for_delivery: { type: Number, min: 0, default: 0 },
}, { _id: false });

//  Subschema: warehouseSchema
const warehouseSchema = new Schema({
  name : { type: String, required: true },
  location: { type: String },
  warehouse_variants: { type: [warehouseVariantSchema], default: [] }
}, { _id: true });

//  Subschema: variantSchema 
const variantSchema = new Schema({
  // sku: { type: String, required: true, unique: true },
  sku: { type: String, required: true },
  price: { type: Number, min: 0, required: true },
  stock: { type: Number, min: 0, default: 0 }, // tổng stock của variant, tính từ các kho
  html_text_attributes: { type: String }, // dung cho render attribute
  Images: { type: [imageSchema], default: [] },
  Attributes: { type: [attributeSchema], default: [] },
  is_active: { type: Boolean, required: true, default: true },
  sold: { type: Number, min: 0, default: 0 }
}, { _id: false, timestamps: true });

//  Main Schema: productSchema 
const productSchema = new Schema({
  product_name: { type: String, required: true },
  brand_id: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
  hashtag: { type: String },
  category_id: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  quantity_sold: { type: Number, min: 0, default: 0 },
  price_min: { type: Number, min: 0 },
  price_max: { type: Number, min: 0 },
  short_description: { type: String, required: true },
  detail_description: { type: String, required: true },
  Images: { type: [imageSchema], default: [] },
  Warehouses: { type: [warehouseSchema], default: [] },
  Variants: { type: [variantSchema], default: [] },
  is_active: { type: Boolean, required: true, default: true },
}, { timestamps: true }); 

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

      if (wv.sku === sku && quantityOrdered > 0) {

        const available = wv.quantity - wv.waiting_for_delivery;
        if (available <= 0) return;

        if (quantityOrdered <= available) {
          // Lấy hết từ kho này
          wv.waiting_for_delivery += quantityOrdered;

          list_warehouses.push({
            warehouseId: warehouse._id,
            sku,
            quantity: quantityOrdered   // số lượng thực tế lấy từ kho này
          });

          quantityOrdered = 0;
        } 
        else {
          // Lấy hết available từ kho này
          wv.waiting_for_delivery += available;

          list_warehouses.push({
            warehouseId: warehouse._id,
            sku,
            quantity: available          // số lượng thực tế lấy từ kho này
          });

          quantityOrdered -= available;
        }
      }
    });
  });

  return list_warehouses;
};// trả về danh sách kho (đã trừ - tức là kho lấy mẫu nào số lượng bao nhiêu) hàng dùng để ghi log

// Hoàn trả stock sau khi hủy đơn hàng, giảm waiting_for_delivery
productSchema.methods.revertStockAfterCancel = function(quantityCanceled, sku) {
  let list_warehouses = [];

  this.Warehouses.forEach(warehouse => {
    warehouse.warehouse_variants.forEach(wv => {
      if (wv.sku === sku && quantityCanceled > 0) {
        const canRevert = Math.min(quantityCanceled, wv.waiting_for_delivery);
        wv.waiting_for_delivery -= canRevert;
        list_warehouses.push({
          warehouseId: warehouse._id,
          sku,
          quantity: canRevert
        });
        quantityCanceled -= canRevert;
      }
    });
  });

  return list_warehouses;
}; // trả về danh sách kho (đã hoàn trả - tức là kho trả mẫu nào số lượng bao nhiêu) hàng dùng để ghi log


// Xuất hàng giảm quantity, waiting_for_delivery
productSchema.methods.exportStockAfterShipping = function(quantityShipped, sku) {
  let list_warehouses = [];

  this.Warehouses.forEach(warehouse => {
    warehouse.warehouse_variants.forEach(wv => {

      if (wv.sku === sku && quantityShipped > 0) {

        const availableWaiting = wv.waiting_for_delivery;
        if (availableWaiting <= 0) return;

        if (quantityShipped <= availableWaiting) {
          wv.quantity -= quantityShipped;
          wv.waiting_for_delivery -= quantityShipped;

          list_warehouses.push({
            warehouseId: warehouse._id,
            sku,
            quantity: quantityShipped  // số lượng thực tế xuất từ kho này
          });

          quantityShipped = 0;
        } 
        else {
          // Xuất hết availableWaiting từ kho này
          wv.quantity -= availableWaiting;
          wv.waiting_for_delivery = 0;

          list_warehouses.push({
            warehouseId: warehouse._id,
            sku,
            quantity: availableWaiting  // số lượng thực tế xuất
          });

          quantityShipped -= availableWaiting;
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
