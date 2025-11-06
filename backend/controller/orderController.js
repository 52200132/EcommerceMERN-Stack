import Order from "../models/Order.js"

const createOder = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { 
            Items,
            discount_code,
            shipping_address,
            payment_method,
            notes
        } = req.body;
        const newOrder = await new Order({
            user_id,
            Items,
            discount_code,
            shipping_address,
            payment_method,
            notes
        });
        await newOrder.save();
        res.status(201).json({ec: 0, em: "Order created successfully", dt: newOrder});
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};

const getOrderById = async (req,res) => {
    try {
        const order_id = req.params.order_id;
        const order = await Order.findById(order_id, {
            user_id,
            Items,
            discount_code,
            shipping_address,
            payment_method,
            payment_status,
            order_status, //Cập nhật trên mongodb status -> order_status
            total_amount,
            discount,
            shipping_fee,
            grand_total,
            notes
        });
        res.status(201).json({ec: 0, em: "Order getted successfully", dt: order});
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};

export { createOder, getOrderById };