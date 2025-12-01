import mongoose from "mongoose";

const { Schema, model } = mongoose;

const commentSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User", default: null },
  user_displayed_name: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  parent_comment_id: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
  guest_id: { type: String, default: null },
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parent_comment_id",
  justOne: true
});

commentSchema.virtual("reply_count", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parent_comment_id",
  count: true
});

commentSchema.set("toObject", { virtuals: true });
commentSchema.set("toJSON", { virtuals: true });

const Comment = mongoose.models.Comment || model("Comment", commentSchema);

export default Comment;