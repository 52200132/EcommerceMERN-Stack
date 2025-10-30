import Brand from "../models/Brand.js";
import Product from "../models/Product.js";

export const createBrand = async (req, res) => {
	try {
		const { brand_name } = req.body;
		const brand = new Brand({ brand_name });
		await brand.save();
		res.status(201).json({ ec: 0, em: "Brand created successfully", dt: brand });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

/**
 * Lấy tất cả thương hiệu có trong database
 */
export const getAllBrands = async (req, res) => {
	try {
		const brands = await Brand.find();
		res.status(200).json({ ec: 0, em: "Brands retrieved successfully", dt: brands });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

export const getBrandById = async (req, res) => {
	try {
		const { id } = req.params;
		const brand = await Brand.findById(id);
		if (!brand) {
			return res.status(404).json({ ec: 404, em: "Brand not found" });
		}
		res.status(200).json({ ec: 0, em: "Brand retrieved successfully", dt: brand });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

export const updateBrand = async (req, res) => {
	try {
		const { id } = req.params;
		const { brand_name } = req.body;
		const brand = await Brand.findByIdAndUpdate(id, { brand_name }, { new: true });
		if (!brand) {
			return res.status(404).json({ ec: 404, em: "Brand not found", dt: brand });
		}
		res.status(200).json({ ec: 0, em: "Brand updated successfully", dt: brand });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

export const deleteBrand = async (req, res) => {
	try {
		const { id } = req.params;
		const brand = await Brand.findById(id);
		if (!brand) {
			return res.status(404).json({ ec: 404, em: "Brand not found", dt: brand });
		}
		if (await Product.exists({ brand_id: id })) {
			return res.status(400).json({ ec: 400, em: "Cannot delete brand with associated products" });
		}
		await Brand.findByIdAndDelete(id);
		res.status(200).json({ ec: 0, em: "Brand deleted successfully" });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};
