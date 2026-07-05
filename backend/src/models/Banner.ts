import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const BannerSchema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    mobileImage: { type: String },
    ctaText: { type: String },
    ctaLink: { type: String },
    type: { type: String, enum: ["hero", "category", "offer"], default: "hero" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

BannerSchema.index({ type: 1, order: 1, active: 1 });

export default models.Banner || model("Banner", BannerSchema);
