import mongoose from "mongoose";
import Rating from "../models/Rating.js"

const createRating = async (req, res) => {
	try {
		const user_id = req.user._id;
		const product_id = req.params.product_id;
		const { rating, comment } = req.body;

		const checkRating = await Rating.findOne({ "product_id": product_id, "user_id": user_id });
		if (checkRating) {
			const updateRating = await Rating.findByIdAndUpdate(checkRating._id, { rating, comment }, { new: true, runValidators: true });
			return res.status(201).json({ ec: 0, em: "Rating updated successfully", dt: updateRating });
		}
		else {
			const newRating = new Rating({
				product_id,
				user_id,
				rating,
				comment
			})
			await newRating.save();
			return res.status(201).json({ ec: 0, em: "Rating created successfully", dt: newRating });
		}

	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

const updateRating = async (req, res) => {
	try {
		const rating_id = req.params.rating_id;
		const { rating, comment } = req.body;
		const updateRating = await Rating.findByIdAndUpdate(rating_id, { rating, comment }, { new: true, runValidators: true });
		res.status(201).json({ ec: 0, em: "Rating updated successfully", dt: updateRating });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

const deleteRating = async (req, res) => {
	try {
		const rating_id = req.params.rating_id;
		await Rating.findByIdAndDelete(rating_id);
		res.status(201).json({ ec: 0, em: "Rating deleted successfully" });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

/**
 * Lấy tất cả đánh giá của một sản phẩm, không bao gồm đánh giá của người dùng hiện tại, tổng số đánh giá theo từng mức sao
 */
export const getAllRatingsByProduct = async (req, res) => {
	try {
		const { page, limit } = req.query;
		const product_id = req.params.product_id;
		const user_id = req.query?.user_id; // lấy id người dùng từ req.user của protect middleware
		if (!mongoose.Types.ObjectId.isValid(product_id)) {
			return res.status(400).json({ ec: 400, em: "Invalid product id" });
		}

		const promiseFuncs = [
			// ratingOfMe
			() => user_id ? Rating.findOne({ product_id, user_id }).populate('user_id', 'username image').lean() : Promise.resolve(null),
			// ratings
			() => {
				let query = Rating.find({ product_id })
					.select('-product_id')
				if (user_id) {
					query = query.where('user_id').ne(user_id);
				}
				query = query.populate('user_id', 'username image')
					.sort({ created_at: -1 });
				if (page && limit) {
					query = query.skip((page - 1) * limit).limit(limit);
				}
				return query.lean();
			},
			// counts
			() => Rating.aggregate([
				{ $match: { product_id: new mongoose.Types.ObjectId(product_id) } },
				{ $group: { _id: "$rating", total: { $sum: 1 } } }
			])
		];
		const [ratingOfMe, ratings, counts] = await Promise.all(promiseFuncs.map(fn => fn()));

		const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
		counts.forEach(({ _id, total }) => {
			if (ratingCounts[_id] !== undefined) {
				ratingCounts[_id] = total;
			}
		});

		res.status(200).json({
			ec: 0,
			em: "Get all ratings by product successfully",
			dt: {
				rating_of_me: ratingOfMe,
				ratings,
				rating_counts: ratingCounts
			}
		});
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

const getAllRatingsByUser = async (req, res) => {
	try {
		const user_id = req.user._id;
		const ratings = await Rating.find({ user_id });
		res.status(201).json({ ec: 0, em: "Get all ratings by user successfully", dt: ratings });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

export { createRating, updateRating, deleteRating, getAllRatingsByUser };