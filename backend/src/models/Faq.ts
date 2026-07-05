import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const FaqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, default: "General" },
    order: { type: Number, default: 0 },
  },
  { timestamps: false }
);

FaqSchema.index({ category: 1, order: 1 });

export default models.Faq || model("Faq", FaqSchema);
