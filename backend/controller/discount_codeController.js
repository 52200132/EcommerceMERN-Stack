import DiscountCode from '../models/DiscountCode.js';

const createDiscountCode = async (req, res) => {
    try {
        const { code, limit } = req.body;
        const discountCode = await DiscountCode.create({ code, limit });
        res.status(201).json({ mc: 0, em: 'Discount code created successfully', dt: discountCode });
    } catch (error) {
        res.status(500).json({ mc: 500, em: error.message });
    }
};

const getAllDiscountCodes = async (req, res) => {
    try {
        const discountCodes = await DiscountCode.find({});
        res.json({ mc: 0, em: 'Discount codes retrieved successfully', dt: discountCodes });
    } catch (error) {
        res.status(500).json({ mc: 500, em: error.message });
    }
};

const useDiscountCode = async (req, res) => {
    try {
        const { code } = req.body;
        const discountCode = await DiscountCode.findOne({ code });
        if (!discountCode) {
            return res.status(404).json({ mc: 404, em: 'Discount code not found' });
        }
        if (discountCode.limit > 0) {
            discountCode.limit -= 1;
            await discountCode.save();
            return res.json({ mc: 0, em: 'Discount code applied successfully', dt: discountCode });
        }
        // Logic to use the discount code
        res.status(400).json({ mc: 400, em: 'Discount code has reached its usage limit' });
    } catch (error) {
        res.status(500).json({ mc: 500, em: error.message });
    }
};

const deleteDiscountCode = async (req, res) => {
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
export { createDiscountCode, getAllDiscountCodes, useDiscountCode, deleteDiscountCode };