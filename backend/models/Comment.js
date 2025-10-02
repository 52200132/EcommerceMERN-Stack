const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  user_displayed_name: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Comment", commentSchema);