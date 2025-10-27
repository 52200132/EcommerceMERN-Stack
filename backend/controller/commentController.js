import Comment from "../models/Comment.js";

const createComment = async (req, res) => {
    try {
        if (!req.user) {
            const { product_id, content } = req.body;
            const newComment = new Comment({
                product_id,
                user_displayed_name: "Guest" + Date.now(),
                content
            });
            await newComment.save();
            return res.status(201).json({ec: 0, em: "Comment created successfully", dt: newComment});
        }
        const { product_id, user_id, user_displayed_name, content } = req.body;
        const newComment = new Comment({
            product_id,
            user_id,
            user_displayed_name,
            content
        });
        await newComment.save();
        res.status(201).json({ec: 0, em: "Comment created successfully", dt: newComment});
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};

const getCommentByProductId = async (req, res) => {
    try {
        const { product_id } = req.params;
        const comments = await Comment.find({ product_id });
        res.status(200).json({ ec: 0, em: "Comments retrieved successfully", dt: comments });
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};

const updateUserComment = async (req, res) => {
    try {
        const { product_id } = req.params;
        const user_id = req.user._id;
        const { content } = req.body;
        const comment = await Comment.findOne({ product_id, user_id });
        if (!comment) {
            return res.status(404).json({ ec: 404, em: "Comment not found"});
        }
        comment.content = content || comment.content;
        await comment.save();
        res.status(200).json({ ec: 0, em: "Comment updated successfully", dt: comment });
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};

const deleteUserComment = async (req, res) => {
    try {
        const { product_id } = req.params;
        const user_id = req.user._id;
        const comment = await Comment.findOneAndDelete({ product_id, user_id });
        if (!comment) {
            return res.status(404).json({ ec: 404, em: "Comment not found" });
        }
        res.status(200).json({ ec: 0, em: "Comment deleted successfully", dt: comment });
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};

export { createComment, getCommentByProductId, updateUserComment, deleteUserComment };