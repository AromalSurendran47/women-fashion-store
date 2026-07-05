import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const SettingsSchema = new Schema(
  {
    storeName: { type: String, required: true },
    tagline: { type: String },
    logo: { type: String },
    favicon: { type: String },
    currency: { type: String, default: "INR" },
    contact: {
      email: String,
      phone: String,
      whatsapp: String,
      address: String,
    },
    social: {
      instagram: String,
      facebook: String,
      twitter: String,
      pinterest: String,
      youtube: String,
    },
    shipping: {
      freeShippingThreshold: Number,
      standardRate: Number,
      expressRate: Number,
      estimatedDays: String,
    },
    returnPolicy: String,
    about: String,
    footerLinks: [{ label: String, url: String }],
    theme: {
      primary: String,
      secondary: String,
      accent: String,
      fontHeading: String,
      fontBody: String,
    },
  },
  { timestamps: true }
);

export default models.Settings || model("Settings", SettingsSchema);
