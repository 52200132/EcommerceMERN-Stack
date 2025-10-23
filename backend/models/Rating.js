import mongoose from "mongoose";

const { Schema, model } = mongoose;

//  Schema: ratingSchema 
const ratingSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true },
  created_at: { type: Date, default: Date.now }
});

// Create a compound index
ratingSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

//  Export model 
const Rating = mongoose.models.Rating || model("Rating", ratingSchema);
export default Rating;