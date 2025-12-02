import Category from "../models/Category.js";
import Product from "../models/Product.js";

export const createCategory = async (req, res) => {
  try {
    const { category_name } = req.body;
    if (!category_name) {
      return res.status(400).json({ ec: 400, em: "Category name is required" });
    }
    const existed = await Category.findOne({ category_name });
    if (existed) {
      return res.status(400).json({ ec: 400, em: "Category already exists" });
    }
    const category = new Category({ category_name });
    await category.save();
    res.status(201).json({ ec: 0, em: "Category created successfully", dt: category });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const includeProductStats = String(req.query.includeProductStats) === "true";
    const categories = await Category.find().sort({ category_name: 1 });

    if (!includeProductStats) {
      return res.status(200).json({ ec: 0, em: "Categories retrieved successfully", dt: categories });
    }

    const productStats = await Product.aggregate([
      {
        $group: {
          _id: "$category_id",
          productCount: { $sum: 1 },
        }
      }
    ]);
    const statsMap = productStats.reduce((acc, curr) => {
      const key = curr._id ? String(curr._id) : "uncategorized";
      acc[key] = curr.productCount;
      return acc;
    }, {});

    const uncategorizedCount = statsMap["uncategorized"] || 0;
    const enrichedCategories = categories.map((cate) => ({
      ...cate.toObject(),
      productCount: statsMap[String(cate._id)] || 0,
    }));

    if (uncategorizedCount > 0) {
      enrichedCategories.push({
        _id: "uncategorized",
        category_name: "Chưa phân loại",
        productCount: uncategorizedCount,
        isVirtual: true,
      });
    }

    res.status(200).json({ ec: 0, em: "Categories retrieved successfully", dt: enrichedCategories });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ ec: 404, em: "Category not found" });
    }
    res.status(200).json({ ec: 0, em: "Category retrieved successfully", dt: category });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name } = req.body;
    if (!category_name) {
      return res.status(400).json({ ec: 400, em: "Category name is required" });
    }

    const duplicated = await Category.findOne({ category_name, _id: { $ne: id } });
    if (duplicated) {
      return res.status(400).json({ ec: 400, em: "Category already exists" });
    }

    const category = await Category.findByIdAndUpdate(id, { category_name }, { new: true });
    if (!category) {
      return res.status(404).json({ ec: 404, em: "Category not found" });
    }
    res.status(200).json({ ec: 0, em: "Category updated successfully", dt: category });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ ec: 404, em: "Category not found" });
    }
    if (await Product.exists({ category_id: id })) {
      return res.status(400).json({ ec: 400, em: "Cannot delete category with associated products" });
    }
    await Category.findByIdAndDelete(id);
    res.status(200).json({ ec: 0, em: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};
