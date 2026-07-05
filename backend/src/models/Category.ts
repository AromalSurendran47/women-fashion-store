import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String, required: true },
    banner: { type: String },
    description: { type: String },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.index({ featured: 1, order: 1 });

export default models.Category || model("Category", CategorySchema);
