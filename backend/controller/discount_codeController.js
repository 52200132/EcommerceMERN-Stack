import DiscountCode from '../models/DiscountCode.js';

export const getAllDiscountCodes = async (req, res) => {
    try {
        const discountCodes = await DiscountCode.find({});
        res.json({ mc: 0, em: 'Discount codes retrieved successfully', dt: discountCodes });
    } catch (error) {
        res.status(500).json({ mc: 500, em: error.message });
    }
};

export const getDiscountCode = async (req, res) => {
    try {
        const { code } = req.query;
        const discountCode = await DiscountCode.findOne({ code });
        if (!discountCode) {
            return res.status(404).json({ mc: 404, em: 'Discount code not found' });
        }
        res.json({ mc: 0, em: 'Discount code retrieved successfully', dt: discountCode });
    } catch (error) {
        res.status(500).json({ mc: 500, em: error.message });
    }
};

export const getDiscountCodeById = async (req, res) => {
    try {
        const { id } = req.params;
        const discountCode = await DiscountCode.findById(id);
        if (!discountCode) {
            return res.status(404).json({ mc: 404, em: 'Discount code not found' });
        }
        res.json({ mc: 0, em: 'Discount code retrieved successfully', dt: discountCode });
    } catch (error) {
        res.status(500).json({ mc: 500, em: error.message });
    }
};

export const createDiscountCode = async (req, res) => {
    try {
        const { code, limit, condition, discount } = req.body;
        const discountCode = await DiscountCode.create({ code, limit, condition, discount });
        res.status(201).json({ mc: 0, em: 'Discount code created successfully', dt: discountCode });
    } catch (error) {
        res.status(500).json({ mc: 500, em: error.message });
    }
};

export const useDiscountCode = async (req, res) => {
    try {
        const { code, total_amount } = req.body;
        const discountCode = await DiscountCode.findOne({ code });
        if (!discountCode) {
            return res.status(404).json({ mc: 404, em: 'Discount code not found' });
        }
        if (total_amount >= discountCode.condition && discountCode.limit > 0) {
            discountCode.limit -= 1;
            await discountCode.save();
            return res.json({ mc: 0, em: 'Discount code applied successfully', dt: discountCode });
        }
        // Logic to use the discount code
        res.status(400).json({ mc: 400, em: 'Discount code has reached its usage limit or does not meet the condition' });
    } catch (error) {
        res.status(500).json({ mc: 500, em: error.message });
    }
};

export const updateDiscountCode = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, limit, condition, discount } = req.body;
        const updates = { code, limit, condition, discount };
        const discountCode = await DiscountCode.findByIdAndUpdate(id, updates, { new: true });
        if (!discountCode) {
            return res.status(404).json({ mc: 404, em: 'Discount code not found' });
        }
        res.json({ mc: 0, em: 'Discount code updated successfully', dt: discountCode });
    } catch (error) {
        res.status(500).json({ mc: 500, em: error.message });
    }
};

export const deleteDiscountCode = async (req, res) => {
    try {
        const { id } = req.params;
        const discountCode = await DiscountCode.findByIdAndDelete(id, { new: true });
        if (!discountCode) {
            return res.status(404).json({ mc: 404, em: 'Discount code not found' });
        }
        res.json({ mc: 0, em: 'Discount code deleted successfully', dt: discountCode });
    } catch (error) {
        res.status(500).json({ mc: 500, em: error.message });
    }
};