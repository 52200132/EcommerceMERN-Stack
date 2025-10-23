import Product from "../models/Product.js";


// const updateStockAfterOrder = async (req, res) => {
//   try {
//     const { productId, quantityOrdered, sku } = req.body;
//     const product = await Product.findById(productId);
//     let list_warehouses = [];
//     if (product.checkQuantity(quantityOrdered, sku)) {
//       {
//         const warehouses = await Product.find(
//           { _id: productId, 'Warehouses.warehouse_variants.sku': sku }
//         );
//         warehouses.forEach(warehouse => {
//           if (warehouse.warehouse_variants.sku === sku) {
//             warehouse.warehouse_variants.forEach(wv => {
//               if (quantityOrdered <= wv.quantity) {
//                 wv.waiting_for_delivery += quantityOrdered;
//                 quantityOrdered = 0;
//                 list_warehouses.push({warehouseId: warehouse._id, sku: sku, quantity: quantityOrdered});
//               } else {
//                 quantityOrdered -= wv.quantity;
//                 wv.waiting_for_delivery += wv.quantity;
//                 list_warehouses.push({warehouseId: warehouse._id, sku: sku, quantity: wv.quantity});
//               }
//             });
//           }
//         });
//       }
//       await product.save();
//       res.status(200).json({ message: 'Stock updated', warehouses: list_warehouses });
//     } else {
//       res.status(400).json({ message: 'Insufficient stock' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    products.forEach(product => {
      product.recalculateStock();
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.recalculateStock();
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ec, em, dt

const deleteProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const createProduct = async (req, res) => {
  try {
    const {
      brand_id,
      product_name,
      hashtag,
      short_description,
      detailed_description,
      Warehouse,
      Images,
      Variants
    } = req.body;

    const product = new Product({
      brand_id,
      product_name,
      hashtag,
      short_description,
      detailed_description,
      Warehouse,
      Images,
      Variants,
      createdAt: Date.now()
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const updateProduct = async (req, res) => {
  try {
    const {
      brand_id,
      product_name,
      hashtag,
      short_description,
      detailed_description,
      Warehouse,
      Images,
      Variants
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.brand_id = brand_id || product.brand_id;
      product.product_name = product_name || product.product_name;
      product.hashtag = hashtag || product.hashtag;
      product.short_description = short_description || product.short_description;
      product.detailed_description = detailed_description || product.detailed_description;
      product.Warehouses = Warehouse || product.Warehouses;
      product.Images = Images || product.Images;
      product.Variants = Variants || product.Variants;
      product.updatedAt = Date.now();

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const deleteVariantBySku = async (req, res) => {
  try {
    const { sku } = req.body;
    const product = await Product.findById(req.params.id);
    if (product) {
      product.Variants = product.Variants.filter(variant => variant.sku !== sku);
      await product.save();
      res.json({ message: 'Variant removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export { getProductById, deleteProductById, createProduct, updateProduct, getAllProducts, deleteVariantBySku };