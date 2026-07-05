import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

/**
 * Controlled vocabulary for product attributes (fabric, fit, occasion, colour,
 * size). One document per option — the single source of truth consumed by the
 * admin product form dropdowns and the storefront filters.
 */
const AttributeSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["fabric", "fit", "occasion", "color", "size"],
      required: true,
    },
    value: { type: String, required: true },
    hex: { type: String }, // only for type === "color"
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AttributeSchema.index({ type: 1, order: 1, active: 1 });

export default models.Attribute || model("Attribute", AttributeSchema);
