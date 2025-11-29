import Product from "../models/Product.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";

/** Lấy danh sách sản phẩm để hiện trên giao diện */
export const getProducts = async (req, res) => {
  const {
    category_id,
    category_name,
    brand_names,
    variants_filters,
    sort_by, // price_asc, price_desc, name_asc, name_desc, quantity_sold_desc, rating_desc
    price_min,
    price_max,
    page,
    limit,
    q
  } = req.query;

  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.max(parseInt(limit, 10) || 10, 1);
  const query = {
    is_active: true
  };

  if (q) {
    query.$or = [
      { product_name: { $regex: q, $options: "i" } },
    ];
  }

  // Convert category_id to ObjectId if provided
  if (category_id && mongoose.Types.ObjectId.isValid(category_id)) {
    query.category_id = new mongoose.Types.ObjectId(category_id);
  }

  let sortQuery = null;
  if (sort_by) {
    sortQuery = {};
    switch (sort_by) {
      case "price_asc":
        sortQuery["price_min"] = 1;
        break;
      case "price_desc":
        sortQuery["price_min"] = -1;
        break;
      case "name_asc":
        sortQuery["product_name"] = 1;
        break;
      case "name_desc":
        sortQuery["product_name"] = -1;
        break;
      case "quantity_sold_desc":
        sortQuery["quantity_sold"] = -1;
        break;
      case "rating_desc":
        sortQuery["rating"] = -1;
        break;
      default:
        break;
    }
  }

  const hasBrandNamesArray = Array.isArray(brand_names) && brand_names?.length > 0;
  const parsedPriceMin = price_min !== undefined ? Number(price_min) : null;
  const parsedPriceMax = price_max !== undefined ? Number(price_max) : null;
  let minPrice = Number.isFinite(parsedPriceMin) ? parsedPriceMin : null;
  let maxPrice = Number.isFinite(parsedPriceMax) ? parsedPriceMax : null;
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }
  const priceMatch = {};
  if (minPrice !== null) {
    priceMatch.price_max = { $gte: minPrice };
  }
  if (maxPrice !== null) {
    priceMatch.price_min = { ...(priceMatch.price_min || {}), $lte: maxPrice };
  }
  const hasPriceFilter = Object.keys(priceMatch).length > 0;

  try {
    const pipeline = [
      { $match: query },
      ...(hasPriceFilter ? [{ $match: priceMatch }] : []),

      // LUÔN LUÔN lookup brand và category để lấy tên
      {
        $lookup: {
          from: "brands",
          localField: "brand_id",
          foreignField: "_id",
          as: "brandDetails"
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },

      // Filter by brand_names nếu có
      ...(hasBrandNamesArray ? [{
        $match: {
          "brandDetails.brand_name": { $in: brand_names }
        }
      }] : []),

      // Filter by category_name nếu có (và chưa filter bằng category_id)
      ...(category_name && !category_id ? [{
        $match: {
          "categoryDetails.category_name": category_name
        }
      }] : []),

      // Sử dụng $facet để lấy cả total và data trong 1 query
      {
        $facet: {
          metadata: [{ $count: "total" }],
          products: [
            { $sort: sortQuery || { quantity_sold: -1 } },
            { $skip: pageSize * (pageNumber - 1) },
            { $limit: pageSize },
            {
              $project: {
                product_name: 1,
                short_description: 1,
                hashtag: 1,
                quantity_sold: 1,
                rating: 1,
                is_active: 1,
                stock: 1,
                price_min: 1,
                price_max: 1,
                image: {
                  $let: {
                    vars: {
                      // 1. Tạo biến tạm 'primaryImageObject' bằng cách lọc và lấy phần tử đầu tiên
                      primaryImageObject: {
                        $arrayElemAt: [{
                          $filter: {
                            input: "$Images",
                            as: "img",
                            cond: { $eq: ["$$img.is_primary", true] }
                          }
                        }, 0] // Lấy phần tử đầu tiên (index 0)
                      }
                    },
                    // 2. Output: Truy cập trường 'url' của biến tạm đó
                    in: "$$primaryImageObject.url"
                  },
                },
                brand_name: { $arrayElemAt: ["$brandDetails.brand_name", 0] },
                category_name: { $arrayElemAt: ["$categoryDetails.category_name", 0] }
              }
            }
          ]
        }
      }
    ];

    const result = await Product.aggregate(pipeline);
    const total = result[0].metadata[0]?.total || 0;
    const products = result[0].products || [];
    const pages = Math.ceil(total / pageSize);

    res.status(200).json({
      ec: 0,
      em: 'Lấy danh sách sản phẩm thành công',
      dt: {
        products,
        total,
        pages,
        current_page: pageNumber,
        page_size: pageSize
      }
    });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};


// Product Order (sắp xếp thứ tự sản phẩm)
const getArrangeAlphabet = async (req, res) => {
  try {
    const { order } = req.query;
    if (order !== "asc") {
      const products = await Product.find({}).select("-detail_description -Images -Variants -Warehouses -createdAt -updatedAt -__v").sort({ product_name: -1 });
      res.json({ ec: 0, em: "Get Products Z-A Successfully", dt: products });
    }
    else {
      const products = await Product.find({}).select("-detail_description -Images -Variants -Warehouses -createdAt -updatedAt -__v").sort({ product_name: 1 });
      res.json({ ec: 0, em: "Get Products A-Z Successfully", dt: products });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

const getArrangePrice = async (req, res) => {
  try {
    const { order } = req.query;
    if (order !== "asc") {
      const products = await Product.find({}).select("-detail_description -Images -Variants -Warehouses -createdAt -updatedAt -__v").sort({ "Variants.price": -1 });
      res.json({ ec: 0, em: "Get Products Price High to Low Successfully", dt: products });
    }
    else {
      const products = await Product.find({}).select("-detail_description -Images -Variants -Warehouses -createdAt -updatedAt -__v").sort({ "Variants.price": 1 });
      res.json({ ec: 0, em: "Get Products Price Low to High Successfully", dt: products });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

// Product Management Controllers
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).select("-detail_description -Images -Variants -Warehouses -createdAt -updatedAt -__v");
    res.json({ ec: 0, em: "Get All Product Successfully", dt: products });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

const getProductByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ category_id: categoryId }).select("-detail_description -Images -Variants -Warehouses -createdAt -updatedAt -__v");
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
      res.status(404).json({ ec: 404, em: "Product not found" });
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
      res.json({ ec: 0, em: "Product removed" });
    } else {
      res.status(404).json({ ec: 404, em: "Product not found" });
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

      const updatedProduct = await product.save();
      // ghi log đường dẫn POST
      res.json({ ec: 0, em: "Product updated successfully", dt: updatedProduct });
    } else {
      res.status(404).json({ ec: 404, em: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
}

export const getTopSellingProducts = async (req, res) => {
  try {
    const topProducts = await Product.find({})
      .sort({ quantity_sold: -1 })
      .limit(10)
      .select("-detail_description -Images -Variants -Warehouses -createdAt -updatedAt -__v");

    res.json({ ec: 0, em: "Get Top Selling Products Successfully", dt: topProducts });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const getNewProducts = async (req, res) => {
  try {
    const newProducts = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select("-detail_description -Images -Variants -Warehouses -createdAt -updatedAt -__v");

    res.json({ ec: 0, em: "Get New Products Successfully", dt: newProducts });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

// Variant Management Controllers
const deleteVariantBySku = async (req, res) => {
  try {
    const { sku } = req.query;
    const product = await Product.findById(req.params.id);
    if (product) {
      product.Variants = product.Variants.filter(variant => variant.sku !== sku);
      await product.save();
      res.json({ ec: 0, em: "Variant removed", dt: product });
    } else {
      res.status(404).json({ ec: 404, em: "Product not found" });
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
      res.json({ ec: 0, em: "Variant created", dt: product });
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
      }
      variant = await product.save();
      res.json({ ec: 0, em: "Variant updated", dt: variant });
    } else {
      res.status(404).json({ ec: 404, em: "Product not found" });
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
    res.json({ ec: 0, em: "Get all warehouses successfully", dt: warehouses });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

const createWarehouseByProductId = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, location, warehouse_variants } = req.body;

    const product = await Product.findById(id);
    if (!product) { res.status(404).json({ ec: 404, em: "Product not found" }); }
    product.Warehouses.push({
      name, location, warehouse_variants
    });
    await product.save();
    res.json({ ec: 0, em: "Warehouse created", dt: product.Warehouses });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

const updateWarehouseById = async (req, res) => {
  try {
    const { id, warehouseId } = req.params;
    const { name, location, warehouse_variants } = req.body;

    const product = await Product.findById(id);
    if (product) {
      const warehouse = product.Warehouses.id(warehouseId);
      if (warehouse) {
        warehouse.name = name || warehouse.name;
        warehouse.location = location || warehouse.location;
        warehouse.warehouse_variants = warehouse_variants || warehouse.warehouse_variants;
      }
      await product.save();
      res.json({ ec: 0, em: "Warehouse updated", dt: warehouse });
    } else {
      res.status(404).json({ ec: 404, em: "Product not found" });
    }
  } catch (error) {

  }
};

export const deleteWarehouseById = async (req, res) => {
  try {
    const { id, warehouse_id } = req.params;

    const result = await Product.updateOne(
      { _id: id },
      { $pull: { Warehouses: { _id: warehouse_id } } } // cách nhanh nhất, không cần load toàn bộ product
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ ec: 404, em: "Warehouse not found" });
    }

    res.json({ ec: 0, em: "Warehouse deleted" });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};
// Management Variant in Warehouse 

export const createVariantByWarehouseId = async (req, res) => {
  try {
    const { id, warehouse_id } = req.params;
    const { sku, quantity, waiting_for_delivery } = req.body;

    const product = await Product.findById(id);
    if (product) {
      const warehouse = product.Warehouses.id(warehouse_id);
      if (warehouse) {
        // Kiểm tra trùng SKU trong warehouse này
        const skuExists = warehouse.warehouse_variants.some(v => v.sku === sku);
        if (skuExists) {
          throw new Error(`SKU ${sku} đã tồn tại trong warehouse này`);
        }
        // Thêm variant mới vào warehouse
        warehouse.warehouse_variants.push({
          sku, quantity, waiting_for_delivery
        });
      }
      await product.save();
      res.json({ ec: 0, em: "Warehouse Variant created", dt: warehouse });
    } else {
      res.status(404).json({ ec: 404, em: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const updateWarehouseVariantBySku = async (req, res) => {
  try {
    const { id, warehouse_id } = req.params;
    const { sku } = req.query;
    const { quantity, waiting_for_delivery } = req.body;

    const product = await Product.UpdateOne(
      { _id: id, "Warehouses._id": warehouse_id, "Warehouses.warehouse_variants.sku": sku },
      {
        $set: {
          "Warehouses.$.warehouse_variants.$[wv].quantity": quantity,
          "Warehouses.$.warehouse_variants.$[wv].waiting_for_delivery": waiting_for_delivery
        }
      },
      {
        arrayFilters: [{ "wv.sku": sku }]
      }
    );
    res.json({ ec: 0, em: "Warehouse Variant updated", dt: product.Warehouses.id(warehouse_id) });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const deleteWarehouseVariantBySku = async (req, res) => {
  try {
    const { id, warehouse_id } = req.params;
    const { sku } = req.query;

    const result = await Product.updateOne(
      { _id: id, "Warehouses._id": warehouse_id },
      { $pull: { "Warehouses.$.warehouse_variants": { sku: sku } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ ec: 404, em: "Warehouse or Variant not found" });
    }

    res.json({ ec: 0, em: "Warehouse Variant deleted" });

  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

// Product information needs to create Order
export const getProductsInfoForOrder = async (req, res) => {
  try {
    const { items } = req.body; // [{ product_id, sku, qty }, ...]
    let results = [];
    for (const item of items) {
      const { product_id, sku, qty } = item;
      const product = await Product.findById(product_id).populate("category_id", "category_name");
      if (product) {
        const variant = product.Variants.find(variant => variant.sku === sku);
        if (variant) {
          const attributes_info = variant.Attributes.filter(attr => attr.type === "appearance");
          const image_url = await Product.getImageUrlByVariantSKU(product_id, variant.sku);
          const available_stock = product.getStockBySku(variant.sku);
          const variant_info = {
            sku: variant.sku,
            price: variant.price,
            cost_price: variant.cost_price,
            attributes: attributes_info
          }
          const result_item = {
            product_id: product._id,
            category_name: product.category_id.category_name,
            product_name: product.product_name,
            quantity: parseInt(qty, 10) || 1,
            image_url,
            available_stock,
            variant: variant_info
          };
          results.push(result_item);
        }
      }
    }
    return res.json({ ec: 0, em: "Get products info for order successfully", dt: results });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export { getArrangeAlphabet, getProductByCategory, getArrangePrice, createWarehouseByProductId, createVariantByProductId, updateWarehouseById, getAllWarehouseByProduct, getProductById, deleteProductById, createProduct, updateProduct, getAllProducts, deleteVariantBySku, updateVariantBySku };
