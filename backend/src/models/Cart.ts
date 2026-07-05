import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const CartItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantSku: { type: String },
    name: { type: String, required: true },
    thumbnail: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const CartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [CartItemSchema],
    coupon: { type: String },
  },
  { timestamps: true }
);

export default models.Cart || model("Cart", CartSchema);
