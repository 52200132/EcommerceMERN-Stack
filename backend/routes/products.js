import express from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';
import { getProductById, deleteProductById, createProduct, updateProduct, getAllProducts, deleteVariantBySku } from '../controller/productController.js';

const router = express.Router();

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const category = req.query.category
      ? { category: req.query.category }
      : {};

    const query = { ...keyword, ...category };

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, createProduct);

// @desc    Fetch all products
// @route   GET /api/products/all
// @access  Admin
router.get('/all', protect, admin, getAllProducts);

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', getProductById); // đã check ok

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteProductById);

// @desc    Delete a variant by SKU
// @route   DELETE /api/products/:id/variants
// @access  Private/Admin
router.delete('/:id/variants', protect, admin, deleteVariantBySku);

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, updateProduct);

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

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
router.get('/top', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(3);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

export default router;