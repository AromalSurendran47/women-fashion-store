import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const VariantSchema = new Schema(
  {
    color: { type: String, required: true },
    size: { type: String, required: true },
    sku: { type: String, required: true },
    stock: { type: Number, default: 0 },
    price: { type: Number, required: true },
    image: { type: String },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: String },
    brand: { type: String },
    fabric: { type: String },
    fit: { type: String },
    occasion: { type: String },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    discountPercentage: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    sku: { type: String, required: true, unique: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    flashSale: { type: Boolean, default: false },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    material: { type: String },
    careInstructions: [{ type: String }],
    weight: { type: Number },
    images: [{ type: String }],
    thumbnail: { type: String, required: true },
    video: { type: String },
    variants: [VariantSchema],
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

// Full-text search across the fields shoppers search by.
ProductSchema.index({ name: "text", description: "text", brand: "text" });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ featured: 1, newArrival: 1, bestSeller: 1, trending: 1 });
ProductSchema.index({ flashSale: 1 });
ProductSchema.index({ rating: -1 });

export default models.Product || model("Product", ProductSchema);
