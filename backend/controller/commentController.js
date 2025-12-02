import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const populateUser = {
	path: "user_id",
	select: "username image isManager"
};

const repliesPopulate = {
	path: "replies",
	select: "user_displayed_name content created_at user_id guest_id parent_comment_id",
	options: { sort: { created_at: -1 } },
	populate: [
		populateUser,
		{ path: "reply_count" }
	],
};

const normalizeComment = (commentDoc) => {
	if (!commentDoc) return commentDoc;
	const comment = typeof commentDoc.toObject === "function" ? commentDoc.toObject({ virtuals: true }) : commentDoc;
	const replies = Array.isArray(comment.replies)
		? comment.replies
		: comment.replies
			? [comment.replies]
			: [];
	return { ...comment, replies };
};

const getUserFromRequest = async (req) => {
	if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
		return null;
	}
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded._id).select("-password");
		return user || null;
	} catch (error) {
		return null;
	}
};

const createComment = async (req, res) => {
	try {
		const product_id = req.params.product_id;
		const { content, parent_comment_id } = req.body;
		console.log("Creating comment for product:", req.body);
		const user = await getUserFromRequest(req);

		// Authenticated user comment
		if (user) {
			const newComment = new Comment({
				parent_comment_id,
				product_id,
				user_id: user._id,
				user_displayed_name: user.username,
				content
			});
			await newComment.save();
			return res.status(201).json({ ec: 0, em: "Comment created successfully", dt: normalizeComment(newComment) });
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
		return res.status(201).json({ ec: 0, em: "Comment created successfully", dt: normalizeComment(newComment) });

	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

const getAllCommentsByProductId = async (req, res) => {
	const product_id = req.params.product_id;
	const requester = await getUserFromRequest(req);
	const expeceptUserId = req.query.guest_id || req.query.user_id || requester?._id;
	const pageSize = parseInt(req.query.limit) || 10;
	const page = parseInt(req.query.page) || 1;

	const query = {
		product_id, parent_comment_id: null
	};
	const isObjectId = mongoose.Types.ObjectId.isValid(expeceptUserId);
	const arrayPromisesFuncs = [
		// comments of me
		() => expeceptUserId ? Comment.find(query)
			.where(isObjectId ? "user_id" : "guest_id").equals(expeceptUserId)
			.populate(populateUser)
			.populate(repliesPopulate)
			.sort({ created_at: -1 }) : Promise.resolve([])
		,
		// comments of product
		() => Comment.find(query)
			.where(isObjectId ? "user_id" : "guest_id").ne(expeceptUserId)
			.populate(populateUser)
			.populate(repliesPopulate)
			.sort({ created_at: -1 })
			.skip(pageSize * (page - 1))
			.limit(pageSize)
	];
	try {
		const [commentsOfMe, commentsOfProduct] = await Promise.all(arrayPromisesFuncs.map(func => func()));
		res.status(200).json({
			ec: 0, em: "Comments retrieved successfully", dt: {
				comments_of_me: commentsOfMe.map(normalizeComment),
				comments_of_product: commentsOfProduct.map(normalizeComment)
			}
		});
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

export const updateComment = async (req, res) => {
	const comment_id = req.params.comment_id;
	const { content, guest_id } = req.body;
	try {
		if (!content || !content.trim()) {
			return res.status(400).json({ ec: 400, em: "Nội dung bình luận không được để trống" });
		}
		const [comment, user] = await Promise.all([
			Comment.findById(comment_id),
			getUserFromRequest(req),
		]);
		if (!comment) {
			return res.status(404).json({ ec: 404, em: "Comment not found" });
		}
		const isOwner = user ? comment.user_id?.equals(user._id) : Boolean(guest_id && comment.guest_id === guest_id);
		const isManager = user?.isManager;
		if (!isOwner && !isManager) {
			return res.status(403).json({ ec: 403, em: "Bạn không có quyền chỉnh sửa bình luận này" });
		}

		comment.content = content;
		await comment.save();

		const populated = await comment.populate([populateUser, repliesPopulate]);
		res.status(200).json({ ec: 0, em: "Comment updated successfully", dt: normalizeComment(populated) });
	} catch (error) {
		res.status(500).json({ ec: 500, em: error.message });
	}
};

export const deleteComment = async (req, res) => {
	try {
		const comment_id = req.params.comment_id;
		const { guest_id } = req.body || {};
		const [comment, user] = await Promise.all([
			Comment.findById(comment_id),
			getUserFromRequest(req),
		]);
		if (!comment) {
			return res.status(404).json({ ec: 404, em: "Comment not found" });
		}
		const isOwner = user ? comment.user_id?.equals(user._id) : Boolean(guest_id && comment.guest_id === guest_id);
		const isManager = user?.isManager;
		if (!isOwner && !isManager) {
			return res.status(403).json({ ec: 403, em: "Bạn không có quyền xóa bình luận này" });
		}

		await comment.deleteOne();

		// Also delete replies if any (soft cascade)
		await Comment.deleteMany({ parent_comment_id: comment_id });

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
