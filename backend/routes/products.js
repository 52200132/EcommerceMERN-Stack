import express from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';
import { getArrangeChar, getArrangePrice, createWarehouseByProductId, createVariantByProductId, updateWarehouseById, getAllWarehouseByProduct, getProductById, deleteProductById, createProduct, updateProduct, getAllProducts, deleteVariantBySku, updateVariantBySku } from '../controller/productController.js';

const router = express.Router();

// Sắp xếp sản phẩm A-Z, Z-A
// @desc    Arrange all products A-Z, Z-A
// @route   GET /api/products/order_char
// @access  Public
router.get('/order_char', getArrangeChar);

// Sắp xếp sản phẩm theo giá thấp đến cao, cao đến thấp
// @desc    Arrange all products Price Low to High, Price High to Low
// @route   GET /api/products/order_price
// @access  Public
router.get('/order_price', getArrangePrice);

// @desc    Fetch all products
// @route   GET /api/products/all
// @access  Admin
router.get('/all', protect, admin, getAllProducts);

// @desc    Get top rated products
// @route   GET /api/products/top?number=<number>
// @access  Public
// chưa xong đâu, còn rating để nó sắp xếp
router.get('/top', async (req, res) => {
  try {
    const number = Number(req.query.number) || 10;
    const products = await Product.find({}).sort({ rating: -1 }).limit(number);
    res.json({ ec: 0, em: "Get Top Products Successfully", dt: products });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('', async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 12;
    const page = Number(req.query.page) || 1;
    const keyword = req.query.keyword
      ? {
        product_name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
      : {};

    const hastag = req.query.hastag
      ? { hastag: req.query.hastag }
      : {};

    const query = { ...keyword, ...hastag };

    const [count, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .select('-Warehouses -detail_description -created_at -short_description') // Loại bỏ các trường không cần thiết
        .sort({ created_at: -1 })
        // .lean() // Quan trọng: trả về plain objects thay vì Mongoose documents
        .limit(pageSize)
        .skip(pageSize * (page - 1))
    ]);

    res.json({
      ec: 0,
      em: "Get Products Successfully",
      dt: {
        products,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
      }
    });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
// router.post('/', protect, admin, createProduct);
router.post('/', createProduct);

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', getProductById); // đã check ok

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', deleteProductById);

// @desc    Delete a variant by SKU
// @route   DELETE /api/products/:id/variant?sku=<sku>
// @access  Private/Admin
router.delete('/:id/variant', protect, admin, deleteVariantBySku);

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', updateProduct);

// @desc    Create A variant by product ID
// @route   POST /api/products/:id/variant
// @access  Private/Admin
router.post('/:id/variant', protect, admin, createVariantByProductId);

// @desc    Update A variant
// @route   PUT /api/products/:id/variant?sku=<sku>
// @access  Private/Admin
router.put('/:id/variant', updateVariantBySku);

// @desc    Get all warehouses by product
// @route   GET /api/products/:id/warehouses
// @access  Private/Admin
router.get('/:id/warehouses', protect, admin, getAllWarehouseByProduct);

// @desc    Create warehouse by product ID
// @route   POST /api/products/:id/warehouses
// @access  Private/Admin
router.post('/:id/warehouses', protect, admin, createWarehouseByProductId);

// @desc    Update warehouse by ID
// @route   PUT /api/products/:id/warehouses/:warehouseId
// @access  Private/Admin
router.put('/:id/warehouses/:warehouseId', protect, admin, updateWarehouseById);

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        res.status(400).json({ message: 'Product already reviewed' });
        return;
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;