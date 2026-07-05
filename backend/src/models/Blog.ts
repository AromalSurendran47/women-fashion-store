import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const BlogSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String },
    image: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    author: { type: String, required: true },
    authorAvatar: { type: String },
    readTime: { type: Number, default: 4 },
    published: { type: Boolean, default: true },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

BlogSchema.index({ published: 1, publishedAt: -1 });
BlogSchema.index({ tags: 1 });

export default models.Blog || model("Blog", BlogSchema);
