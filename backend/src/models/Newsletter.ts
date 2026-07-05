import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const NewsletterSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    subscribed: { type: Boolean, default: true },
    source: { type: String, default: "footer" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.Newsletter || model("Newsletter", NewsletterSchema);
