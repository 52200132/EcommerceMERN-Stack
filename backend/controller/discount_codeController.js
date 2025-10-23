import DiscountCode from '../models/DiscountCode.js';

const createDiscountCode = async (req, res) => {
    try {
        const { code, limit } = req.body;
        const discountCode = await DiscountCode.create({ code, limit });
        res.status(201).json(discountCode);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllDiscountCodes = async (req, res) => {
    try {
        const discountCodes = await DiscountCode.find({});
        res.json(discountCodes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const useDiscountCode = async (req, res) => {
    try {
        const { code } = req.body;
        const discountCode = await DiscountCode.findOne({ code });
        if (!discountCode) {
            return res.status(404).json({ message: 'Discount code not found' });
        }
        if (discountCode.limit > 0) {
            discountCode.limit -= 1;
            await discountCode.save();
        }
        // Logic to use the discount code
        res.json({ message: 'Discount code applied successfully', data: discountCode.toJSON() });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteDiscountCode = async (req, res) => {
    try {
        const { id } = req.params;
        const discountCode = await DiscountCode.findByIdAndDelete(id);
        if (!discountCode) {
            return res.status(404).json({ message: 'Discount code not found' });
        }
        res.json({ message: 'Discount code deleted successfully', data: discountCode.toJSON() });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export { createDiscountCode, getAllDiscountCodes, useDiscountCode, deleteDiscountCode };