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

export const getAllCategories = async (_req, res) => {
  try {
    const categories = await Category.find().sort({ category_name: 1 });
    res.status(200).json({ ec: 0, em: "Categories retrieved successfully", dt: categories });
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
