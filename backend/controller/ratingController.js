import Rating from "../models/Rating.js"

const createRating = async (req,res) => {
    try {
        const user_id = req.user._id;
        const product_id = req.params.product_id;
        const { rating, comment } = req.body;

        const checkRating = await Rating.findOne({"product_id": product_id, "user_id":user_id});
        if (checkRating)
        {
            const updateRating = await Rating.findByIdAndUpdate(checkRating._id, { rating, comment }, { new: true, runValidators: true});
            return res.status(201).json({ec: 0, em: "Rating updated successfully", dt: updateRating});
        }
        else {
            const newRating = new Rating({
                product_id,
                user_id,
                rating,
                comment
            })
            await newRating.save();
            return res.status(201).json({ec: 0, em: "Rating created successfully", dt: newRating});
        }

    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};

const updateRating = async (req, res) => {
    try {
        const rating_id = req.params.rating_id;
        const { rating, comment } = req.body;
        const updateRating = await Rating.findByIdAndUpdate( rating_id, { rating, comment }, { new: true, runValidators: true});
        res.status(201).json({ec: 0, em: "Rating updated successfully", dt: updateRating});
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};

const deleteRating = async (req, res) => {
    try {
        const rating_id = req.params.rating_id;
        await Rating.findByIdAndDelete(rating_id);
        res.status(201).json({ec: 0, em: "Rating deleted successfully"});
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};

const getAllRatingsByProduct = async (req, res) =>{
    try {
        const product_id = req.params.product_id;
        const ratings = await Rating.find({product_id});
        res.status(201).json({ec: 0, em: "Get all ratings by product successfully", dt: ratings});
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};

const getAllRatingsByUser = async (req, res) =>{
    try {
        const user_id = req.user._id;
        const ratings = await Rating.find({user_id});
        res.status(201).json({ec: 0, em: "Get all ratings by user successfully", dt: ratings});
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};

export { createRating, updateRating, deleteRating, getAllRatingsByProduct, getAllRatingsByUser };