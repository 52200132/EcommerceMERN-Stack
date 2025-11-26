import Comment from "../models/Comment.js";
import User from "../models/User.js";
import jwt from 'jsonwebtoken';

const createComment = async (req, res) => {
    try {
        const product_id = req.params.product_id;
        const { content } = req.body;
        let token;

        // Check if user is authenticated
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded._id).select('-password');
                console.log("Token", token);
                console.log("User", user);

                const newComment = new Comment({
                    product_id,
                    user_id: user._id,
                    user_displayed_name: user.username,
                    content
                });
                await newComment.save();
                return res.status(201).json({ec: 0, em: "Comment created successfully", dt: newComment});
            } catch (authError) {
                console.log("Invalid token, treating as guest");
            }
        }
        
        // Guest user comment
        const newComment = new Comment({
            product_id,
            user_displayed_name: "Guest" + Date.now(),
            content
        });
        await newComment.save();
        return res.status(201).json({ec: 0, em: "Comment created successfully", dt: newComment});

    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};

const getAllCommentsByProductId = async (req, res) => {
    try {
        const product_id = req.params.product_id;
        const comments = await Comment.find({ product_id });
        res.status(200).json({ ec: 0, em: "Comments retrieved successfully", dt: comments });
    } catch (error) {
        res.status(500).json({ ec: 500, em: error.message });
    }
};

const updateUserComment = async (req, res) => {
    try {
        const product_id = req.params.product_id;
        const user_id = req.user._id;
        const { content } = req.body;
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