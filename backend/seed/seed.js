/**
 * Plain-JavaScript importer (no TypeScript tooling required).
 *
 * Reads the pre-generated /data/*.json files and bulk-inserts them into
 * MongoDB. Run this if you just want the data in your database and don't want
 * to install tsx / faker:
 *
 *   node seed/seed.js         (or: npm run import)
 *
 * Requires only `mongoose` and a MONGODB_URI env var (or the default below).
 * Generate the JSON first with `npm run seed:json`.
 *
 * NOTE: this project uses ES modules ("type": "module" in package.json), so
 * this file uses `import`/top-level `await` rather than `require`.
 */

import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aura_fashion";

// filename (without .json) → Mongoose model name (collection = lowercase + "s")
const COLLECTIONS = {
  categories: "Category",
  products: "Product",
  users: "User",
  reviews: "Review",
  wishlist: "Wishlist",
  cart: "Cart",
  coupons: "Coupon",
  orders: "Order",
  banners: "Banner",
  testimonials: "Testimonial",
  faq: "Faq",
  newsletter: "Newsletter",
  blogs: "Blog",
  settings: "Settings",
  attributes: "Attribute",
};

const OID_RE = /^[a-f0-9]{24}$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

function revive(value) {
  if (Array.isArray(value)) return value.map(revive);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = revive(v);
    return out;
  }
  if (typeof value === "string") {
    if (OID_RE.test(value)) return new mongoose.Types.ObjectId(value);
    if (ISO_RE.test(value)) return new Date(value);
  }
  return value;
}

function load(name) {
  const file = path.join(process.cwd(), "data", `${name}.json`);
  if (!fs.existsSync(file)) {
    console.warn(`  ⚠ skipping ${name} — data/${name}.json not found`);
    return null;
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

await mongoose.connect(MONGODB_URI);
console.log("🌱  Importing JSON into MongoDB:");

for (const [name, modelName] of Object.entries(COLLECTIONS)) {
  const docs = load(name);
  if (!docs) continue;

  const collection = mongoose.connection.collection(modelName.toLowerCase() + "s");
  await collection.deleteMany({});

  if (docs.length) {
    const cast = docs.map((d) => revive(d));
    await collection.insertMany(cast, { ordered: false });
  }
  console.log(`  ✓ ${modelName} (${docs.length})`);
}

await mongoose.disconnect();
console.log("✅  Import complete.");
