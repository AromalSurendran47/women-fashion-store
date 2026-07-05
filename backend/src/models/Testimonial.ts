import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const TestimonialSchema = new Schema(
  {
    name: { type: String, required: true },
    avatar: { type: String },
    location: { type: String },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    message: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.Testimonial || model("Testimonial", TestimonialSchema);
