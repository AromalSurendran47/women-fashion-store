import "dotenv/config";
import { faker } from "@faker-js/faker";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { connectDB, disconnectDB } from "../src/lib/db.js";
import {
  User,
  Category,
  Product,
  Review,
  Wishlist,
  Cart,
  Coupon,
  Order,
  Banner,
  Testimonial,
  Faq,
  Newsletter,
  Blog,
  Settings,
} from "../src/models/index.js";
import * as gen from "./generators.js";

/**
 * Seed generator for the Sruvalle Fashion store.
 *
 *   npm run seed             → generate data, dump /data/*.json AND insert into MongoDB
 *   npm run seed:json        → only write /data/*.json (no DB connection needed)
 *   npm run seed:mongo       → only insert into MongoDB
 */

const args = process.argv.slice(2);
const JSON_ONLY = args.includes("--json-only");
const MONGO_ONLY = args.includes("--mongo-only");

// Deterministic output — same data every run.
faker.seed(20250704);

const N = {
  users: Number(process.env.SEED_USERS) || 20,
  products: Number(process.env.SEED_PRODUCTS) || 100,
  reviews: Number(process.env.SEED_REVIEWS) || 250,
  orders: Number(process.env.SEED_ORDERS) || 60,
  newsletter: 40,
};

function build() {
  const categoriesRaw = gen.genCategories();
  const products = gen.genProducts(N.products, categoriesRaw);
  const users = gen.genUsers(N.users, products);
  const reviews = gen.genReviews(N.reviews, products, users); // also rolls ratings onto products
  const wishlists = gen.genWishlists(users, products);
  const carts = gen.genCarts(users, products);
  const coupons = gen.genCoupons();
  const orders = gen.genOrders(N.orders, users, products, coupons);
  const banners = gen.genBanners(categoriesRaw);
  const testimonials = gen.genTestimonials();
  const faqs = gen.genFaqs();
  const newsletter = gen.genNewsletter(N.newsletter);
  const blogs = gen.genBlogs();
  const settings = gen.genSettings();

  // Strip the internal `_types` helper from categories before persisting.
  const categories = categoriesRaw.map(({ _types, ...c }) => c);

  return {
    categories,
    products,
    users,
    reviews,
    wishlist: wishlists,
    cart: carts,
    coupons,
    orders,
    banners,
    testimonials,
    faq: faqs,
    newsletter,
    blogs,
    settings: [settings],
  };
}

async function writeJson(data: Record<string, unknown[]>) {
  const dir = join(process.cwd(), "data");
  await mkdir(dir, { recursive: true });
  for (const [name, docs] of Object.entries(data)) {
    // JSON.stringify serialises ObjectId → hex string and Date → ISO string.
    await writeFile(join(dir, `${name}.json`), JSON.stringify(docs, null, 2), "utf8");
    console.log(`  ✓ data/${name}.json (${docs.length})`);
  }
}

async function insertMongo(data: Record<string, unknown[]>) {
  await connectDB();
  const map: [any, unknown[]][] = [
    [Category, data.categories],
    [Product, data.products],
    [User, data.users],
    [Review, data.reviews],
    [Wishlist, data.wishlist],
    [Cart, data.cart],
    [Coupon, data.coupons],
    [Order, data.orders],
    [Banner, data.banners],
    [Testimonial, data.testimonials],
    [Faq, data.faq],
    [Newsletter, data.newsletter],
    [Blog, data.blogs],
    [Settings, data.settings],
  ];

  for (const [Model, docs] of map) {
    await Model.deleteMany({});
    if (docs.length) await Model.insertMany(docs, { ordered: false });
    console.log(`  ✓ ${Model.modelName} (${docs.length})`);
  }
  await disconnectDB();
}

async function main() {
  console.log("🧵  Generating Sruvalle Fashion seed data…");
  const data = build();

  if (!MONGO_ONLY) {
    console.log("\n📄  Writing JSON files:");
    await writeJson(data as unknown as Record<string, unknown[]>);
  }

  if (!JSON_ONLY) {
    console.log("\n🌱  Inserting into MongoDB:");
    await insertMongo(data as unknown as Record<string, unknown[]>);
  }

  console.log("\n✅  Done.");
  console.log("    Login → admin@sruvalle.in / seller@sruvalle.in / <name>.<surname>@example.com");
  console.log("    Password for every account: Password123");
}

main().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
