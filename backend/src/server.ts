import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import {
  User,
  Category,
  Product,
  Review,
  Coupon,
  Order,
  Blog,
  Testimonial,
  Faq,
  Banner,
} from "./models/index.js";
import {
  mapProduct,
  mapCategory,
  mapReview,
  mapBlog,
  mapTestimonial,
  mapFaq,
  mapCoupon,
  mapBanner,
  mapOrder,
  mapUser,
} from "./lib/mappers.js";
import {
  hashPassword,
  verifyPassword,
  signToken,
  authRequired,
  adminRequired,
  usingDefaultSecret,
  type AuthedRequest,
} from "./lib/auth.js";

const PORT = Number(process.env.PORT) || 5000;

const app = express();
app.use(cors());
app.use(express.json());

const wrap =
  (fn: (req: express.Request, res: express.Response) => Promise<unknown>) =>
  (req: express.Request, res: express.Response) => {
    fn(req, res).catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    });
  };

/* ------------------------------ Health ------------------------------ */
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "aura-api" }));

/* ------------------------------- Auth ------------------------------- */
app.post(
  "/api/auth/register",
  wrap(async (req, res) => {
    const { name, email, phone, password } = req.body ?? {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }
    const existing = await User.findOne({ email: String(email).toLowerCase() }).lean();
    if (existing) return res.status(409).json({ error: "An account with this email already exists." });

    const user = await User.create({
      name,
      email: String(email).toLowerCase(),
      phone: phone ?? "",
      password: hashPassword(String(password)),
      role: "customer",
      emailVerified: false,
    });

    const token = signToken({ id: String(user._id), role: user.role });
    res.status(201).json({ token, user: mapUser(user) });
  })
);

app.post(
  "/api/auth/login",
  wrap(async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

    const user = (await User.findOne({ email: String(email).toLowerCase() })) as any;
    if (!user || !verifyPassword(String(password), user.password)) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = signToken({ id: String(user._id), role: user.role });
    res.json({ token, user: mapUser(user) });
  })
);

app.get(
  "/api/auth/me",
  authRequired,
  wrap(async (req: AuthedRequest, res) => {
    const user = await User.findById(req.auth!.id).lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: mapUser(user) });
  })
);

// Update profile (name / phone / email)
app.put(
  "/api/auth/me",
  authRequired,
  wrap(async (req: AuthedRequest, res) => {
    const { name, phone, email } = req.body ?? {};
    const update: Record<string, unknown> = {};

    if (typeof name === "string" && name.trim()) update.name = name.trim();
    if (typeof phone === "string") update.phone = phone.trim();
    if (typeof email === "string" && email.trim()) {
      const normalized = email.trim().toLowerCase();
      const clash = await User.findOne({ email: normalized, _id: { $ne: req.auth!.id } }).lean();
      if (clash) return res.status(409).json({ error: "That email is already in use." });
      update.email = normalized;
    }

    const user = await User.findByIdAndUpdate(req.auth!.id, update, { new: true }).lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: mapUser(user) });
  })
);

// Change password
app.put(
  "/api/auth/password",
  authRequired,
  wrap(async (req: AuthedRequest, res) => {
    const { currentPassword, newPassword } = req.body ?? {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required." });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }
    const user = (await User.findById(req.auth!.id)) as any;
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!verifyPassword(String(currentPassword), user.password)) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }
    user.password = hashPassword(String(newPassword));
    await user.save();
    res.json({ ok: true });
  })
);

// Delete account
app.delete(
  "/api/auth/me",
  authRequired,
  wrap(async (req: AuthedRequest, res) => {
    const deleted = await User.findByIdAndDelete(req.auth!.id).lean();
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.json({ ok: true });
  })
);

/* ------------------------------ Admin ------------------------------- */
app.get(
  "/api/admin/stats",
  adminRequired,
  wrap(async (_req, res) => {
    const [products, orders, users, revenueAgg] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.aggregate([
        { $match: { status: { $nin: ["Cancelled", "Returned"] } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);
    res.json({
      products,
      orders,
      users,
      revenue: revenueAgg[0]?.total ?? 0,
    });
  })
);

app.get(
  "/api/admin/users",
  adminRequired,
  wrap(async (_req, res) => {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).limit(100).lean();
    res.json(users.map(mapUser));
  })
);

/* ---------------------------- Categories ---------------------------- */
app.get(
  "/api/categories",
  wrap(async (_req, res) => {
    const cats = await Category.find().sort({ order: 1 }).lean();
    // attach live product counts
    const counts = await Product.aggregate([
      { $group: { _id: "$category", n: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.n]));
    res.json(cats.map((c) => mapCategory({ ...c, productCount: countMap.get(String(c._id)) ?? 0 })));
  })
);

app.get(
  "/api/categories/:slug",
  wrap(async (req, res) => {
    const cat = await Category.findOne({ slug: req.params.slug }).lean();
    if (!cat) return res.status(404).json({ error: "Category not found" });
    res.json(mapCategory(cat));
  })
);

/* ----------------------------- Products ----------------------------- */
app.get(
  "/api/products",
  wrap(async (req, res) => {
    const { filter, category } = req.query as { filter?: string; category?: string };
    const query: Record<string, unknown> = {};
    if (filter === "new") query.newArrival = true;
    else if (filter === "best") query.bestSeller = true;
    else if (filter === "trending") query.trending = true;

    if (category) {
      const cat = (await Category.findOne({ slug: category }).lean()) as any;
      if (cat) query.category = cat._id;
    }

    const products = await Product.find(query).populate("category", "slug name").lean();
    res.json(products.map(mapProduct));
  })
);

app.get(
  "/api/products/:slug",
  wrap(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("category", "slug name")
      .lean();
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(mapProduct(product));
  })
);

app.get(
  "/api/products/:slug/related",
  wrap(async (req, res) => {
    const product = (await Product.findOne({ slug: req.params.slug }).lean()) as any;
    if (!product) return res.status(404).json({ error: "Product not found" });
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .populate("category", "slug name")
      .limit(8)
      .lean();
    res.json(related.map(mapProduct));
  })
);

/* ------------------------------ Reviews ----------------------------- */
app.get(
  "/api/reviews",
  wrap(async (req, res) => {
    const { productId } = req.query as { productId?: string };
    const query = productId ? { product: productId } : {};
    const reviews = await Review.find(query).sort({ createdAt: -1 }).lean();
    res.json(reviews.map(mapReview));
  })
);

/* ------------------------------- Blogs ------------------------------ */
app.get(
  "/api/blogs",
  wrap(async (_req, res) => {
    const blogs = await Blog.find({ published: true }).sort({ publishedAt: -1 }).lean();
    res.json(blogs.map(mapBlog));
  })
);

app.get(
  "/api/blogs/:slug",
  wrap(async (req, res) => {
    const blog = await Blog.findOne({ slug: req.params.slug }).lean();
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(mapBlog(blog));
  })
);

/* -------------------- Testimonials / FAQs / Banners ----------------- */
app.get(
  "/api/testimonials",
  wrap(async (_req, res) => {
    const items = await Testimonial.find({ active: true }).lean();
    res.json(items.map(mapTestimonial));
  })
);

app.get(
  "/api/faqs",
  wrap(async (_req, res) => {
    const items = await Faq.find().sort({ order: 1 }).lean();
    res.json(items.map(mapFaq));
  })
);

app.get(
  "/api/banners",
  wrap(async (req, res) => {
    const { type } = req.query as { type?: string };
    const query = type ? { type, active: true } : { active: true };
    const items = await Banner.find(query).sort({ order: 1 }).lean();
    res.json(items.map(mapBanner));
  })
);

/* ------------------------------ Coupons ----------------------------- */
app.get(
  "/api/coupons",
  wrap(async (_req, res) => {
    const items = await Coupon.find({ active: true }).lean();
    res.json(items.map(mapCoupon));
  })
);

app.post(
  "/api/coupons/validate",
  wrap(async (req, res) => {
    const { code, subtotal = 0 } = req.body as { code?: string; subtotal?: number };
    const coupon = (await Coupon.findOne({
      code: (code ?? "").toUpperCase(),
      active: true,
    }).lean()) as any;
    if (!coupon) return res.status(404).json({ valid: false, message: "Invalid coupon code." });
    if (subtotal < coupon.minOrderValue) {
      return res.json({
        valid: false,
        message: `Minimum order ₹${coupon.minOrderValue} required.`,
      });
    }
    const raw =
      coupon.discountType === "percentage"
        ? (subtotal * coupon.discountValue) / 100
        : coupon.discountValue;
    const discount = Math.round(Math.min(raw, coupon.maxDiscount || raw));
    res.json({ valid: true, code: coupon.code, discount });
  })
);

/* ------------------------------- Orders ----------------------------- */
app.get(
  "/api/orders",
  wrap(async (_req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(20).lean();
    res.json(orders.map(mapOrder));
  })
);

/* -------------------------------- Boot ------------------------------ */
async function start() {
  if (usingDefaultSecret) {
    console.warn(
      "⚠️  JWT_SECRET is not set — using the insecure default. Create backend/.env with a strong JWT_SECRET."
    );
  } else {
    console.log("🔐  JWT_SECRET loaded from environment.");
  }
  if (!process.env.MONGODB_URI) {
    console.warn("⚠️  MONGODB_URI is not set — using the default localhost connection.");
  }

  const conn = await connectDB();
  console.log(
    `🍃  MongoDB connected → ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`
  );
  app.listen(PORT, () => {
    console.log(`🚀  Sruvalle API running at http://localhost:${PORT}/api`);
  });
}

start().catch((err) => {
  console.error("Failed to start API:", err);
  process.exit(1);
});

// Referenced so tree-shakers keep the model registered even if unused directly.
void User;
