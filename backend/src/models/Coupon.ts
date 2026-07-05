import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

CouponSchema.index({ active: 1, expiresAt: 1 });

export default models.Coupon || model("Coupon", CouponSchema);
