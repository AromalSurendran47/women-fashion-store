import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const WishlistSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export default models.Wishlist || model("Wishlist", WishlistSchema);
