import mongoose from "mongoose";
import Rating from "../models/Rating.js"
import Product from "../models/Product.js";

const updateMeanRating = async (product_id) => {
	const ratings = await Rating.find({ product_id });
	const totalRatings = await Rating.countDocuments({ product_id });
	if (totalRatings === 0) {
		await Product.findByIdAndUpdate(product_id, { rating: 0 });
		return;
	}
	const sumRatings = ratings.reduce((sum, r) => sum + r.rating, 0);
	const meanRating = parseFloat((sumRatings / totalRatings).toFixed(1));
	console.log("Mean Rating:", meanRating);
	await Product.findByIdAndUpdate(product_id, { rating: meanRating });
};

const parseRating = (value, { required = true } = {}) => {
	if (value === undefined || value === null) {
		return required ? { error: "Rating is required" } : { value: undefined };
	}
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5) {
		return { error: "Rating must be a number between 1 and 5" };
	}
	return { value: parsed };
};

const createRating = async (req, res) => {
	try {
		const user_id = req.user._id;
		const product_id = req.params.product_id;
		const { rating, comment } = req.body;

		if (!mongoose.Types.ObjectId.isValid(product_id)) {
			return res.status(400).json({ ec: 400, em: "Invalid product id" });
		}
		const { value: parsedRating, error: ratingError } = parseRating(rating);
		if (ratingError) {
			return res.status(400).json({ ec: 400, em: ratingError });
		}

		const checkRating = await Rating.findOne({ "product_id": product_id, "user_id": user_id });
		if (checkRating) {
			const updatePayload = { rating: parsedRating };
			if (comment !== undefined) updatePayload.comment = comment;
			const updateRating = await Rating.findByIdAndUpdate(checkRating._id, updatePayload, { new: true, runValidators: true });
			await updateMeanRating(product_id);
			return res.status(201).json({ ec: 0, em: "Rating updated successfully", dt: updateRating });
		}
		else {
			const newRating = new Rating({
				product_id,
				user_id,
				rating: parsedRating,
				comment
			})
			await newRating.save();
			await updateMeanRating(product_id);
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
		if (!mongoose.Types.ObjectId.isValid(rating_id)) {
			return res.status(400).json({ ec: 400, em: "Invalid rating id" });
		}
		const { value: parsedRating, error: ratingError } = parseRating(rating, { required: false });
		if (ratingError) {
			return res.status(400).json({ ec: 400, em: ratingError });
		}
		const updatePayload = {};
		if (parsedRating !== undefined) updatePayload.rating = parsedRating;
		if (comment !== undefined) updatePayload.comment = comment;
		if (Object.keys(updatePayload).length === 0) {
			return res.status(400).json({ ec: 400, em: "No fields to update" });
		}
		const updatedRating = await Rating.findByIdAndUpdate(rating_id, updatePayload, { new: true, runValidators: true });
		if (!updatedRating) {
			return res.status(404).json({ ec: 404, em: "Rating not found" });
		}
		await updateMeanRating(updatedRating.product_id);
		res.status(201).json({ ec: 0, em: "Rating updated successfully", dt: updatedRating });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

const deleteRating = async (req, res) => {
	try {
		const rating_id = req.params.rating_id;
		if (!mongoose.Types.ObjectId.isValid(rating_id)) {
			return res.status(400).json({ ec: 400, em: "Invalid rating id" });
		}
		const deletedRating = await Rating.findByIdAndDelete(rating_id);
		if (!deletedRating) {
			return res.status(404).json({ ec: 404, em: "Rating not found" });
		}
		await updateMeanRating(deletedRating.product_id);
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
