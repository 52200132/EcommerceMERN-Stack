import mongoose from "mongoose";

const { Schema, model } = mongoose;

const commentSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User", default: null },
  user_displayed_name: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  created_at: { type: Date, default: Date.now }
});

const Comment = mongoose.models.Comment || model("Comment", commentSchema);

export default Comment;