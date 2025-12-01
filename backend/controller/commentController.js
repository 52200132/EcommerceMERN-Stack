import Comment from "../models/Comment.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const createComment = async (req, res) => {
	try {
		const product_id = req.params.product_id;
		const { content, parent_comment_id } = req.body;
		let token;

		// Check if user is authenticated
		if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
			try {
				token = req.headers.authorization.split(" ")[1];
				const decoded = jwt.verify(token, process.env.JWT_SECRET);
				const user = await User.findById(decoded._id).select("-password");
				console.log("Token", token);
				console.log("User", user);

				const newComment = new Comment({
					parent_comment_id,
					product_id,
					user_id: user._id,
					user_displayed_name: user.username,
					content
				});
				await newComment.save();
				return res.status(201).json({ ec: 0, em: "Comment created successfully", dt: newComment });
			} catch (authError) {
				console.log("Invalid token, treating as guest");
			}
		}

		// Guest user comment
		const guestId = req.body.guest_id || Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
		const user_displayed_name = req.body.user_displayed_name || "Guest" + guestId;
		const newComment = new Comment({
			product_id,
			parent_comment_id,
			user_displayed_name,
			content,
			guest_id: guestId
		});
		await newComment.save();
		return res.status(201).json({ ec: 0, em: "Comment created successfully", dt: newComment });

	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

const getAllCommentsByProductId = async (req, res) => {
	const product_id = req.params.product_id;
	const expeceptUserId = req.query.guest_id || req.query.user_id;
	const pageSize = parseInt(req.query.limit) || 10;
	const page = parseInt(req.query.page) || 1;

	const query = {
		product_id, parent_comment_id: null
	};
	const arrayPromisesFuncs = [
		// comments of me
		() => expeceptUserId ? Comment.find({ ...query, $or: [{ guest_id: { $eq: expeceptUserId } }, { user_id: { $eq: expeceptUserId } }] }) : Promise.resolve([]),
		// comments of product
		() => {
			const pupulateUser = {
				path: "user_id",
				select: "username image isManager"
			}
			return Comment.find(query)
				.where("guest_id").ne(expeceptUserId)
				.where("user_id").ne(expeceptUserId)
				.populate(pupulateUser)
				.populate({
					path: "replies",
					select: "user_displayed_name content created_at",
					options: { sort: { created_at: -1 } },
					populate: [
						pupulateUser,
						{ path: "reply_count" }
					],
				})
				.sort({ created_at: -1 })
				.skip(pageSize * (page - 1))
				.limit(pageSize);
		}
	];
	try {
		const [commentsOfMe, commentsOfProduct] = await Promise.all(arrayPromisesFuncs.map(func => func()));
		res.status(200).json({
			ec: 0, em: "Comments retrieved successfully", dt: {
				comments_of_me: commentsOfMe,
				comments_of_product: commentsOfProduct
			}
		});
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

export const updateComment = async (req, res) => {
	const comment_id = req.params.comment_id;
	const { content } = req.body;
	try {
		const comment = await Comment.findByIdAndUpdate(comment_id, { content }, { runValidators: true });
		if (!comment) {
			return res.status(404).json({ ec: 404, em: "Comment not found" });
		}
		res.status(200).json({ ec: 0, em: "Comment updated successfully", dt: comment });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

export const deleteComment = async (req, res) => {
	try {
		const comment_id = req.params.comment_id;
		const comment = await Comment.findByIdAndDelete(comment_id);
		if (!comment) {
			return res.status(404).json({ ec: 404, em: "Comment not found" });
		}
		res.status(200).json({ ec: 0, em: "Comment deleted successfully" });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

const updateUserComment = async (req, res) => {
	const product_id = req.params.product_id;
	const user_id = req.user._id;
	const { content } = req.body;
	try {
		const comment = await Comment.findOneAndUpdate({ product_id, user_id }, { content }, { new: true, runValidators: true });
		if (!comment) {
			return res.status(404).json({ ec: 404, em: "Comment not found" });
		}
		res.status(200).json({ ec: 0, em: "Comment updated successfully", dt: comment });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

const deleteUserComment = async (req, res) => {
	try {
		const product_id = req.params.product_id;
		const user_id = req.user._id;
		const comment = await Comment.findOneAndDelete({ product_id, user_id });
		if (!comment) {
			return res.status(404).json({ ec: 404, em: "Comment not found" });
		}
		res.status(200).json({ ec: 0, em: "Comment deleted successfully" });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

export { createComment, getAllCommentsByProductId, updateUserComment, deleteUserComment };