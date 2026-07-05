import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const AddressSchema = new Schema(
  {
    label: { type: String, default: "Home" },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

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

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "customer", "seller"], default: "customer" },
    avatar: { type: String },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    cart: [CartItemSchema],
    addresses: [AddressSchema],
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });

export default models.User || model("User", UserSchema);
