import { parse } from "dotenv";
import Product from "../models/Product.js";

// Cập nhật số lượng sau khi đặt hàng thành công đẩy vào waiting_for_delivery
// Status order: Pending -> Processing
const updateStockAfterOrder = async (req, res) => {
  try {
    const { productId, quantityOrdered, sku } = req.body;
    const product = await Product.findById(productId);
    let list_warehouses = [];
    if (product.checkQuantity(quantityOrdered, sku)) {
      list_warehouses = product.updateStockAfterOrder(quantityOrdered, sku);
      res.status(200).json({ ec: 0, em: 'Stock updated', dt: list_warehouses });
    }
    else {
      res.status(400).json({ ec: 400, em: 'Insufficient stock' });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

// Xuất hàng giảm quantity, waiting_for_delivery
// Status order: Shipping -> Delivered
const exportStockAfterShipping = async (req, res) => {
  try {
    const { productId, quantityShipped, sku } = req.body;
    const product = await Product.findById(productId);
    let list_warehouses = [];
    list_warehouses = product.exportStockAfterShipping(quantityShipped, sku);
    res.status(200).json({ ec: 0, em: 'Stock exported', dt: list_warehouses });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

// Product Order (sắp xếp thứ tự sản phẩm)
const getArrangeAlphabet = async (req, res) => {
  try {
    const {order} = req.query;
    if (order !== 'asc'){
      const products = await Product.find({}).select("-detail_description -Images -Variants -Warehouses -created_at -updated_at -__v").sort({ product_name: -1 });
      res.json({ ec: 0, em: "Get Products Z-A Successfully", dt: products });
    }
    else{
      const products = await Product.find({}).select("-detail_description -Images -Variants -Warehouses -created_at -updated_at -__v").sort({ product_name: 1 });
      res.json({ ec: 0, em: "Get Products A-Z Successfully", dt: products });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

const getArrangePrice = async (req, res) => {
  try {
    const {order} = req.query;
    if (order !== 'asc'){
      const products = await Product.find({}).select("-detail_description -Images -Variants -Warehouses -created_at -updated_at -__v").sort({ 'Variants.price': -1 });
      res.json({ ec: 0, em: "Get Products Price High to Low Successfully", dt: products });
    }
    else{
      const products = await Product.find({}).select("-detail_description -Images -Variants -Warehouses -created_at -updated_at -__v").sort({ 'Variants.price': 1 });
      res.json({ ec: 0, em: "Get Products Price Low to High Successfully", dt: products });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

// Product Management Controllers
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).select("-detail_description -Images -Variants -Warehouses -created_at -updated_at -__v");
    res.json({ ec: 0, em: "Get All Product Successfully", dt: products });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

const getProductByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ category_id: categoryId }).select("-detail_description -Images -Variants -Warehouses -created_at -updated_at -__v");
    res.json({ ec: 0, em: "Get Products by Category Successfully", dt: products });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.recalculateStock();
      res.json({ ec: 0, em: "Get Product Successfully", dt: product });
    } else {
      res.status(404).json({ ec: 404, em: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

const deleteProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ ec: 0, em: 'Product removed' });
    } else {
      res.status(404).json({ ec: 404, em: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
}

const createProduct = async (req, res) => {
  try {
    const {
      brand_id,
      product_name,
      category_id,
      hashtag,
      short_description,
      detail_description,
      Warehouses,
      Images,
      Variants
    } = req.body;
    
    const product = new Product({
      brand_id,
      product_name,
      category_id,
      hashtag,
      short_description,
      detail_description,
      Warehouses,
      Images,
      Variants
    });

    const createdProduct = await product.save();
    res.status(201).json({ ec: 0, em: "Product created successfully", dt: createdProduct });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
}

const updateProduct = async (req, res) => {
  try {
    const {
      brand_id,
      product_name,
      category_id,
      hashtag,
      short_description,
      detail_description,
      Images,
      Variants
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.brand_id = brand_id || product.brand_id;
      product.product_name = product_name || product.product_name;
      product.category_id = category_id || product.category_id;
      product.hashtag = hashtag || product.hashtag;
      product.short_description = short_description || product.short_description;
      product.detail_description = detail_description || product.detail_description;
      product.Images = Images || product.Images;
      product.Variants = Variants || product.Variants;
      product.updated_at = Date.now();

      const updatedProduct = await product.save();
      // ghi log đường dẫn POST
      res.json({ ec: 0, em: "Product updated successfully", dt: updatedProduct });
    } else {
      res.status(404).json({ ec: 404, em: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
}

// Variant Management Controllers
const deleteVariantBySku = async (req, res) => {
  try {
    const { sku } = req.query;
    const product = await Product.findById(req.params.id);
    if (product) {
      product.Variants = product.Variants.filter(variant => variant.sku !== sku);
      await product.save();
      res.json({ ec: 0, em: 'Variant removed', dt: product });
    } else {
      res.status(404).json({ ec: 404, em: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
}

const createVariantByProductId = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const { sku, price, html_text_attributes, Images, Attributes, is_active } = req.body;
    if (product) {
      product.Variants.push({
        sku, price, html_text_attributes, Images, Attributes, is_active
      });
      await product.save();
      res.json({ ec: 0, em: 'Variant created', dt: product });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

const updateVariantBySku = async (req, res) => {
  try {
    const { sku } = req.query;
    const product = await Product.findById(req.params.id);
    const { price, html_text_attributes, Images, Attributes, is_active } = req.body;
    if (product) {
      const variant = product.Variants.find(variant => variant.sku === sku);
      if (variant) {
        variant.price = price || variant.price;
        variant.html_text_attributes = html_text_attributes || variant.html_text_attributes;
        variant.Images = Images || variant.Images;
        variant.Attributes = Attributes || variant.Attributes;
        variant.is_active = is_active !== undefined ? is_active : variant.is_active;
        variant.updated_at = Date.now();
        }
      variant = await product.save();
      res.json({ ec: 0, em: 'Variant updated', dt: variant });
    } else {
      res.status(404).json({ ec: 404, em: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

// Warehouse Management Controllers
const getAllWarehouseByProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const warehouses = product.Warehouses;
    res.json({ ec: 0, em: 'Get all warehouses successfully', dt: warehouses });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

const createWarehouseByProductId = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const { name, location, warehouse_variants } = req.body;
    if (!product) { res.status(404).json({ ec: 404, em: 'Product not found' });}
    product.Warehouses.push({
      name, location, warehouse_variants
    });
    await product.save();
    res.json({ ec: 0, em: 'Warehouse created', dt: product });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

const updateWarehouseById = async (req, res) => {
  try {
    const { name, location, warehouse_variants } = req.body;
    const product = await Product.findById(req.params.id);
    if (product) {
      const warehouse = product.Warehouses.find(wh => wh._id.toString() === req.params.warehouseId);
      if (warehouse) {
        warehouse.name = name || warehouse.name;
        warehouse.location = location || warehouse.location;
        warehouse.warehouse_variants = warehouse_variants || warehouse.warehouse_variants;
      }
      await product.save();
      res.json({ ec: 0, em: 'Warehouse updated', dt: warehouse });
    } else {
      res.status(404).json({ ec: 404, em: 'Product not found' });
    }
  } catch (error) {
    
  }
};

// Product information needs to create Order
export const getProductsInfoForOrder = async (req, res) => {
  try {
    const { items } = req.body; // [{ product_id, sku, qty }, ...]
    let results = [];
    for (const item of items) {
      const { product_id, sku, qty } = item;
      const product = await Product.findById(product_id);
      if (product) {
        const variant = product.Variants.find(variant => variant.sku === sku);
        if (variant) {
          const attributes_info = variant.Attributes.filter(attr => attr.type === 'appearance');
          const variant_info = {
            sku: variant.sku,
            price: variant.price,
            attributes: attributes_info
          }
          const result_item = {
            product_id: product._id,
            product_name: product.product_name,
            quantity: parseInt(qty, 10) || 1,
            variant: variant_info
          };
          results.push(result_item);
        }
      }
    }
    return res.json({ ec: 0, em: 'Get products info for order successfully', dt: results });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export { getArrangeAlphabet, getProductByCategory, getArrangePrice, createWarehouseByProductId, createVariantByProductId, updateWarehouseById, getAllWarehouseByProduct, getProductById, deleteProductById, createProduct, updateProduct, getAllProducts, deleteVariantBySku, updateVariantBySku };