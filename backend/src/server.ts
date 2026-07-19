import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import mongoose from "mongoose";
import { connectDB } from "./lib/db.js";
import { uploadImageToBlob } from "./lib/azure-blob.js";
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
  Attribute,
  Wishlist,
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

// In-memory multipart parsing for image uploads (buffer streamed straight to S3).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed."));
  },
});

/** Wrap multer so its errors return clean JSON instead of an HTML 500. */
const uploadSingle =
  (field: string) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    upload.single(field)(req, res, (err: unknown) => {
      if (err) {
        const message = err instanceof Error ? err.message : "Upload failed.";
        return res.status(400).json({ error: message });
      }
      next();
    });
  };

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

// Upload / change the profile photo. Multipart field: "file".
app.post(
  "/api/auth/avatar",
  authRequired,
  uploadSingle("file"),
  wrap(async (req: AuthedRequest, res) => {
    const file = (req as AuthedRequest & { file?: Express.Multer.File }).file;
    if (!file) return res.status(400).json({ error: "No file uploaded." });
    try {
      const url = await uploadImageToBlob({ buffer: file.buffer, mimetype: file.mimetype }, "avatars");
      const user = await User.findByIdAndUpdate(req.auth!.id, { avatar: url }, { new: true }).lean();
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ user: mapUser(user) });
    } catch (err: any) {
      if (err?.status === 503) return res.status(503).json({ error: err.message });
      console.error("Avatar upload error:", err?.name, err?.message);
      return res.status(502).json({ error: "Upload failed. Please try again." });
    }
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
    await Wishlist.deleteOne({ user: req.auth!.id });
    res.json({ ok: true });
  })
);

/* ----------------------------- Addresses ---------------------------- */

const mapAddress = (a: any) => ({
  id: String(a._id),
  label: a.label ?? "Home",
  fullName: a.fullName,
  phone: a.phone,
  line1: a.line1,
  line2: a.line2 ?? "",
  city: a.city,
  state: a.state,
  pincode: a.pincode,
  country: a.country ?? "India",
  isDefault: !!a.isDefault,
});

const addressesOf = (user: any) => (user.addresses ?? []).map(mapAddress);

/** Validate and normalize an address payload. Returns an error string or the clean fields. */
function readAddressBody(body: any): { error: string } | { fields: Record<string, string> } {
  const required = ["fullName", "phone", "line1", "city", "state", "pincode"] as const;
  const fields: Record<string, string> = {};
  for (const key of required) {
    const value = String(body?.[key] ?? "").trim();
    if (!value) return { error: `${key} is required.` };
    fields[key] = value;
  }
  fields.label = String(body?.label ?? "").trim() || "Home";
  fields.line2 = String(body?.line2 ?? "").trim();
  fields.country = String(body?.country ?? "").trim() || "India";
  return { fields };
}

app.get(
  "/api/addresses",
  authRequired,
  wrap(async (req: AuthedRequest, res) => {
    const user = await User.findById(req.auth!.id).lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ addresses: addressesOf(user) });
  })
);

app.post(
  "/api/addresses",
  authRequired,
  wrap(async (req: AuthedRequest, res) => {
    const parsed = readAddressBody(req.body);
    if ("error" in parsed) return res.status(400).json({ error: parsed.error });

    const user = (await User.findById(req.auth!.id)) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    // First address, or an explicit request, becomes the default.
    const makeDefault = user.addresses.length === 0 || Boolean(req.body?.isDefault);
    if (makeDefault) user.addresses.forEach((a: any) => (a.isDefault = false));
    user.addresses.push({ ...parsed.fields, isDefault: makeDefault });
    await user.save();
    res.status(201).json({ addresses: addressesOf(user) });
  })
);

app.put(
  "/api/addresses/:addressId",
  authRequired,
  wrap(async (req: AuthedRequest, res) => {
    const { addressId } = req.params;
    if (!mongoose.isValidObjectId(addressId)) {
      return res.status(400).json({ error: "Invalid address id" });
    }
    const parsed = readAddressBody(req.body);
    if ("error" in parsed) return res.status(400).json({ error: parsed.error });

    const user = (await User.findById(req.auth!.id)) as any;
    if (!user) return res.status(404).json({ error: "User not found" });
    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ error: "Address not found" });

    Object.assign(address, parsed.fields);
    if (req.body?.isDefault === true) {
      user.addresses.forEach((a: any) => (a.isDefault = false));
      address.isDefault = true;
    }
    await user.save();
    res.json({ addresses: addressesOf(user) });
  })
);

app.put(
  "/api/addresses/:addressId/default",
  authRequired,
  wrap(async (req: AuthedRequest, res) => {
    const { addressId } = req.params;
    if (!mongoose.isValidObjectId(addressId)) {
      return res.status(400).json({ error: "Invalid address id" });
    }
    const user = (await User.findById(req.auth!.id)) as any;
    if (!user) return res.status(404).json({ error: "User not found" });
    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ error: "Address not found" });

    user.addresses.forEach((a: any) => (a.isDefault = false));
    address.isDefault = true;
    await user.save();
    res.json({ addresses: addressesOf(user) });
  })
);

app.delete(
  "/api/addresses/:addressId",
  authRequired,
  wrap(async (req: AuthedRequest, res) => {
    const { addressId } = req.params;
    if (!mongoose.isValidObjectId(addressId)) {
      return res.status(400).json({ error: "Invalid address id" });
    }
    const user = (await User.findById(req.auth!.id)) as any;
    if (!user) return res.status(404).json({ error: "User not found" });
    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ error: "Address not found" });

    const wasDefault = Boolean(address.isDefault);
    address.deleteOne();
    // Keep exactly one default while any addresses remain.
    if (wasDefault && user.addresses.length > 0) user.addresses[0].isDefault = true;
    await user.save();
    res.json({ addresses: addressesOf(user) });
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

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

app.get(
  "/api/admin/users",
  adminRequired,
  wrap(async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const filter: Record<string, unknown> = {};
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }

    // Backward-compatible: only paginate when page/limit is requested; otherwise
    // return a plain array (used by the dashboard's recent-customers panel).
    const paginated = req.query.page !== undefined || req.query.limit !== undefined;
    if (!paginated) {
      const users = await User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
      return res.json(users.map(mapUser));
    }

    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const limit = Math.min(10000, Math.max(1, parseInt(String(req.query.limit ?? "10"), 10) || 10));
    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);
    res.json({
      users: users.map(mapUser),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      limit,
    });
  })
);

const USER_ROLES = ["admin", "customer", "seller"] as const;
const isOid = (id: string) => /^[a-f0-9]{24}$/i.test(id);

// Create a customer/user (admin)
app.post(
  "/api/admin/users",
  adminRequired,
  wrap(async (req, res) => {
    const { name, email, phone, password, role } = req.body ?? {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }
    const normalizedRole = role && USER_ROLES.includes(role) ? role : "customer";
    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: phone ? String(phone).trim() : "",
      password: hashPassword(String(password)),
      role: normalizedRole,
      emailVerified: false,
    });
    res.status(201).json(mapUser(user));
  })
);

// Update a customer/user (admin)
app.put(
  "/api/admin/users/:id",
  adminRequired,
  wrap(async (req: AuthedRequest, res) => {
    const { id } = req.params;
    if (!isOid(id)) return res.status(400).json({ error: "Invalid user id." });
    const { name, email, phone, role, password } = req.body ?? {};
    const update: Record<string, unknown> = {};

    if (typeof name === "string" && name.trim()) update.name = name.trim();
    if (typeof phone === "string") update.phone = phone.trim();
    if (typeof role === "string") {
      if (!USER_ROLES.includes(role as any)) {
        return res.status(400).json({ error: "Invalid role." });
      }
      // Don't let an admin strip their own admin role and lock themselves out.
      if (id === req.auth!.id && role !== "admin") {
        return res.status(400).json({ error: "You cannot change your own role." });
      }
      update.role = role;
    }
    if (typeof email === "string" && email.trim()) {
      const normalized = email.trim().toLowerCase();
      const clash = await User.findOne({ email: normalized, _id: { $ne: id } }).lean();
      if (clash) return res.status(409).json({ error: "That email is already in use." });
      update.email = normalized;
    }
    if (typeof password === "string" && password) {
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters." });
      }
      update.password = hashPassword(password);
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .select("-password")
      .lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(mapUser(user));
  })
);

// Delete a customer/user (admin)
app.delete(
  "/api/admin/users/:id",
  adminRequired,
  wrap(async (req: AuthedRequest, res) => {
    const { id } = req.params;
    if (!isOid(id)) return res.status(400).json({ error: "Invalid user id." });
    if (id === req.auth!.id) {
      return res.status(400).json({ error: "You cannot delete your own account here." });
    }
    const deleted = await User.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ error: "User not found" });
    await Wishlist.deleteOne({ user: id });
    res.json({ ok: true, id });
  })
);

// Upload an image to S3 (admin). Returns { url } of the stored object.
app.post(
  "/api/admin/upload",
  adminRequired,
  uploadSingle("file"),
  wrap(async (req, res) => {
    const file = (req as express.Request & { file?: Express.Multer.File }).file;
    if (!file) return res.status(400).json({ error: "No file uploaded." });
    try {
      const url = await uploadImageToBlob({ buffer: file.buffer, mimetype: file.mimetype });
      res.json({ url });
    } catch (err: any) {
      if (err?.status === 503) return res.status(503).json({ error: err.message });
      // Surface the real storage error to the admin (this is an admin-only route).
      console.error("Blob upload error:", err?.name, err?.message);
      return res
        .status(502)
        .json({ error: `Upload failed: ${err?.message || err?.name || "unknown error"}` });
    }
  })
);

/* ---------------------------- Attributes ---------------------------- */
// Controlled vocabulary for product options — consumed by the admin form and
// the storefront filters. Grouped by type for easy frontend consumption.
app.get(
  "/api/attributes",
  wrap(async (_req, res) => {
    const items = (await Attribute.find({ active: true })
      .sort({ type: 1, order: 1 })
      .lean()) as any[];
    const values = (t: string) => items.filter((i) => i.type === t).map((i) => i.value);
    res.json({
      fabrics: values("fabric"),
      fits: values("fit"),
      occasions: values("occasion"),
      sizes: values("size"),
      colors: items
        .filter((i) => i.type === "color")
        .map((i) => ({ name: i.value, hex: i.hex ?? "#CCCCCC" })),
    });
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

    const products = await Product.find(query)
      .sort({ createdAt: -1 }) // newest first
      .populate("category", "slug name")
      .lean();
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

/* ----------------------------- Wishlist ----------------------------- */

const wishlistIds = (doc: any): string[] => (doc?.products ?? []).map((p: any) => String(p));

app.get(
  "/api/wishlist",
  authRequired,
  wrap(async (req: AuthedRequest, res) => {
    const doc = await Wishlist.findOne({ user: req.auth!.id }).lean();
    res.json({ ids: wishlistIds(doc) });
  })
);

app.post(
  "/api/wishlist/:productId",
  authRequired,
  wrap(async (req: AuthedRequest, res) => {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    const exists = await Product.exists({ _id: productId });
    if (!exists) return res.status(404).json({ error: "Product not found" });
    const doc = await Wishlist.findOneAndUpdate(
      { user: req.auth!.id },
      { $addToSet: { products: productId } },
      { upsert: true, new: true }
    ).lean();
    res.json({ ids: wishlistIds(doc) });
  })
);

app.delete(
  "/api/wishlist/:productId",
  authRequired,
  wrap(async (req: AuthedRequest, res) => {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    const doc = await Wishlist.findOneAndUpdate(
      { user: req.auth!.id },
      { $pull: { products: productId } },
      { new: true }
    ).lean();
    res.json({ ids: wishlistIds(doc) });
  })
);

// Replace the whole list — used to merge a guest (localStorage) wishlist into the account on login.
app.put(
  "/api/wishlist",
  authRequired,
  wrap(async (req: AuthedRequest, res) => {
    const raw = req.body?.ids;
    if (!Array.isArray(raw)) {
      return res.status(400).json({ error: "ids must be an array of product ids" });
    }
    const candidates = [...new Set(raw.map(String))].filter((id) => mongoose.isValidObjectId(id));
    const found = await Product.find({ _id: { $in: candidates } }, { _id: 1 }).lean();
    const validIds = new Set(found.map((p: any) => String(p._id)));
    const products = candidates.filter((id) => validIds.has(id));
    const doc = await Wishlist.findOneAndUpdate(
      { user: req.auth!.id },
      { $set: { products } },
      { upsert: true, new: true }
    ).lean();
    res.json({ ids: wishlistIds(doc) });
  })
);

/* ---------------- Product admin CRUD (adminRequired) ---------------- */

const OID = /^[a-f0-9]{24}$/i;

const slugify = (s: string) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function resolveCategoryId(value: unknown): Promise<any | null> {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (OID.test(raw)) {
    const byId = (await Category.findById(raw).lean()) as any;
    if (byId) return byId._id;
  }
  const bySlug = (await Category.findOne({ slug: raw }).lean()) as any;
  return bySlug ? bySlug._id : null;
}

/** Build the set of product fields from a request body (create or update). */
async function buildProductFields(body: any): Promise<Record<string, unknown>> {
  const fields: Record<string, unknown> = {};
  const set = (k: string, v: unknown) => {
    if (v !== undefined) fields[k] = v;
  };
  const toArray = (v: unknown) =>
    Array.isArray(v)
      ? v.map((x) => String(x).trim()).filter(Boolean)
      : typeof v === "string"
      ? v.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined;

  if (body.name !== undefined) fields.name = String(body.name).trim();
  if (body.slug !== undefined) fields.slug = slugify(body.slug);

  if (body.category !== undefined) {
    const catId = await resolveCategoryId(body.category);
    if (!catId) throw Object.assign(new Error("Invalid category."), { status: 400 });
    fields.category = catId;
  }

  set("description", body.description !== undefined ? String(body.description) : undefined);
  set("shortDescription", body.shortDescription);
  set("brand", body.brand);
  set("fabric", body.fabric);
  set("material", body.material ?? body.fabric);
  set("fit", body.fit);
  set("occasion", body.occasion);
  set("sku", body.sku ? String(body.sku).trim() : undefined);
  set("thumbnail", body.thumbnail);

  if (body.price !== undefined) fields.price = Number(body.price);
  if (body.discountPrice !== undefined && body.discountPrice !== null && body.discountPrice !== "")
    fields.discountPrice = Number(body.discountPrice);

  const price = body.price !== undefined ? Number(body.price) : undefined;
  const dp = fields.discountPrice as number | undefined;
  if (price !== undefined && dp !== undefined && price > 0) {
    fields.discountPercentage = Math.max(0, Math.round(((price - dp) / price) * 100));
  } else if (body.discountPercentage !== undefined) {
    fields.discountPercentage = Number(body.discountPercentage);
  }

  if (body.stock !== undefined) fields.stock = Number(body.stock);
  set("sizes", toArray(body.sizes));
  set("colors", toArray(body.colors));
  set("images", toArray(body.images));
  set("careInstructions", toArray(body.careInstructions));

  for (const flag of ["featured", "newArrival", "bestSeller", "trending", "flashSale"] as const) {
    if (body[flag] !== undefined) fields[flag] = Boolean(body[flag]);
  }

  return fields;
}

/** Next sequential admin SKU: SRUVALLE-1001, SRUVALLE-1002, … */
async function nextSku(): Promise<string> {
  const rows = await Product.find({ sku: { $regex: /^SRUVALLE-\d+$/ } }, { sku: 1 }).lean();
  let max = 1000; // first generated SKU is SRUVALLE-1001
  for (const r of rows as any[]) {
    const n = parseInt(String(r.sku).replace("SRUVALLE-", ""), 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `SRUVALLE-${max + 1}`;
}

// Create
app.post(
  "/api/products",
  adminRequired,
  wrap(async (req, res) => {
    const body = req.body ?? {};
    if (!body.name || body.price === undefined || body.price === "" || !body.category) {
      return res.status(400).json({ error: "Name, price and category are required." });
    }
    try {
      const fields: any = await buildProductFields(body);
      fields.slug = fields.slug || slugify(fields.name);
      fields.thumbnail =
        fields.thumbnail || (Array.isArray(fields.images) && fields.images[0]) || "";
      if (!fields.thumbnail) {
        return res.status(400).json({ error: "A thumbnail image URL is required." });
      }
      // SKU is always assigned by the server as the next sequential number.
      fields.sku = await nextSku();
      if (fields.description === undefined) fields.description = fields.name;

      const clash = await Product.findOne({
        $or: [{ slug: fields.slug }, { sku: fields.sku }],
      }).lean();
      if (clash) {
        return res.status(409).json({ error: "A product with this slug or SKU already exists." });
      }

      const created = await Product.create(fields);
      const populated = await Product.findById(created._id)
        .populate("category", "slug name")
        .lean();
      res.status(201).json(mapProduct(populated));
    } catch (err: any) {
      if (err?.status === 400) return res.status(400).json({ error: err.message });
      throw err;
    }
  })
);

// Update
app.put(
  "/api/products/:id",
  adminRequired,
  wrap(async (req, res) => {
    const { id } = req.params;
    if (!OID.test(id)) return res.status(400).json({ error: "Invalid product id." });
    try {
      const fields = await buildProductFields(req.body ?? {});
      const updated = await Product.findByIdAndUpdate(id, fields, {
        new: true,
        runValidators: true,
      })
        .populate("category", "slug name")
        .lean();
      if (!updated) return res.status(404).json({ error: "Product not found" });
      res.json(mapProduct(updated));
    } catch (err: any) {
      if (err?.status === 400) return res.status(400).json({ error: err.message });
      throw err;
    }
  })
);

// Delete
app.delete(
  "/api/products/:id",
  adminRequired,
  wrap(async (req, res) => {
    const { id } = req.params;
    if (!OID.test(id)) return res.status(400).json({ error: "Invalid product id." });
    const deleted = await Product.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    await Wishlist.updateMany({ products: id }, { $pull: { products: id } });
    res.json({ ok: true, id });
  })
);

/* ---------------- Category admin CRUD (adminRequired) ---------------- */

/** Map a category with its live product count attached. */
async function mapCategoryWithCount(cat: any) {
  const productCount = await Product.countDocuments({ category: cat._id });
  return mapCategory({ ...cat, productCount });
}

// Create
app.post(
  "/api/categories",
  adminRequired,
  wrap(async (req, res) => {
    const body = req.body ?? {};
    const name = String(body.name ?? "").trim();
    const image = String(body.image ?? "").trim();
    if (!name) return res.status(400).json({ error: "Name is required." });
    if (!image) return res.status(400).json({ error: "Image is required." });

    const slug = slugify(body.slug || name);
    if (!slug) return res.status(400).json({ error: "Could not derive a slug from the name." });
    const clash = await Category.findOne({ slug }).lean();
    if (clash) return res.status(409).json({ error: `A category with slug "${slug}" already exists.` });

    const cat = await Category.create({
      name,
      slug,
      image,
      banner: String(body.banner ?? "").trim() || undefined,
      description: String(body.description ?? "").trim(),
      featured: Boolean(body.featured),
      order: Number.isFinite(Number(body.order)) ? Number(body.order) : 0,
    });
    res.status(201).json(await mapCategoryWithCount(cat.toObject()));
  })
);

// Update
app.put(
  "/api/categories/:id",
  adminRequired,
  wrap(async (req, res) => {
    const { id } = req.params;
    if (!OID.test(id)) return res.status(400).json({ error: "Invalid category id." });
    const body = req.body ?? {};

    const update: Record<string, unknown> = {};
    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) return res.status(400).json({ error: "Name cannot be empty." });
      update.name = name;
    }
    if (body.slug !== undefined || body.name !== undefined) {
      const slug = slugify(body.slug || body.name || "");
      if (slug) {
        const clash = await Category.findOne({ slug, _id: { $ne: id } }).lean();
        if (clash) return res.status(409).json({ error: `A category with slug "${slug}" already exists.` });
        update.slug = slug;
      }
    }
    if (body.image !== undefined) {
      const image = String(body.image).trim();
      if (!image) return res.status(400).json({ error: "Image cannot be empty." });
      update.image = image;
    }
    if (body.banner !== undefined) update.banner = String(body.banner).trim() || undefined;
    if (body.description !== undefined) update.description = String(body.description).trim();
    if (body.featured !== undefined) update.featured = Boolean(body.featured);
    if (body.order !== undefined && Number.isFinite(Number(body.order))) update.order = Number(body.order);

    const cat = await Category.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!cat) return res.status(404).json({ error: "Category not found" });
    res.json(await mapCategoryWithCount(cat));
  })
);

// Delete — refused while products still belong to the category.
app.delete(
  "/api/categories/:id",
  adminRequired,
  wrap(async (req, res) => {
    const { id } = req.params;
    if (!OID.test(id)) return res.status(400).json({ error: "Invalid category id." });
    const inUse = await Product.countDocuments({ category: id });
    if (inUse > 0) {
      return res.status(400).json({
        error: `Cannot delete: ${inUse} product${inUse > 1 ? "s" : ""} still use${inUse > 1 ? "" : "s"} this category. Move or delete them first.`,
      });
    }
    const deleted = await Category.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ error: "Category not found" });
    res.json({ ok: true, id });
  })
);

/* ------------------------------ Reviews ----------------------------- */
app.get(
  "/api/reviews",
  wrap(async (req, res) => {
    const { productId } = req.query as { productId?: string };
    // A non-ObjectId productId (e.g. a slug) would throw a cast error — treat it
    // as "no matching reviews" rather than crashing the endpoint.
    if (productId && !OID.test(productId)) return res.json([]);
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
const PAYMENT_LABELS: Record<string, string> = {
  razorpay: "Razorpay",
  card: "Card",
  cod: "COD",
  upi: "UPI",
  netbanking: "NetBanking",
};

/** Next sequential order number: SRUVALLE100001, SRUVALLE100002, … */
async function nextOrderNumber(): Promise<string> {
  const rows = await Order.find({ orderNumber: { $regex: /^SRUVALLE\d+$/ } }, { orderNumber: 1 }).lean();
  let max = 100000;
  for (const r of rows as any[]) {
    const n = parseInt(String(r.orderNumber).replace("SRUVALLE", ""), 10);
    if (Number.isFinite(n) && n >= max) max = n;
  }
  return `SRUVALLE${max + 1}`;
}

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
] as const;
const PAYMENT_STATUSES = ["Pending", "Paid", "Failed", "Refunded"] as const;

// List orders. Admins see everyone's; a customer sees only their own.
// Admins may paginate/search/filter (?page,&limit,&q,&status); with no such
// params the response is a plain array (used by the dashboard panel).
app.get(
  "/api/orders",
  authRequired,
  wrap(async (req: AuthedRequest, res) => {
    // `?mine=1` forces "my orders only" even for admins — the profile page uses
    // it so an admin's personal Order History isn't flooded with everyone's.
    const forceMine = req.query.mine === "1" || req.query.mine === "true";
    const isAdmin = req.auth!.role === "admin" && !forceMine;
    const query: Record<string, unknown> = isAdmin ? {} : { user: req.auth!.id };

    if (isAdmin) {
      const status = typeof req.query.status === "string" ? req.query.status : "";
      if (status && (ORDER_STATUSES as readonly string[]).includes(status)) query.status = status;
      const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
      if (q) {
        const rx = new RegExp(escapeRegex(q), "i");
        query.$or = [{ orderNumber: rx }, { customerName: rx }];
      }
    }

    const paginated = isAdmin && (req.query.page !== undefined || req.query.limit !== undefined);
    if (!paginated) {
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .limit(isAdmin ? 50 : 25)
        .lean();
      return res.json(orders.map(mapOrder));
    }

    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "10"), 10) || 10));
    const [total, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);
    res.json({
      orders: orders.map(mapOrder),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      limit,
    });
  })
);

// Update an order's status / payment status / tracking number (admin).
app.put(
  "/api/orders/:id",
  adminRequired,
  wrap(async (req, res) => {
    const { id } = req.params;
    if (!OID.test(id)) return res.status(400).json({ error: "Invalid order id." });
    const { status, paymentStatus, trackingNumber } = req.body ?? {};
    const update: Record<string, unknown> = {};

    if (status !== undefined) {
      if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
        return res.status(400).json({ error: "Invalid order status." });
      }
      update.status = status;
    }
    if (paymentStatus !== undefined) {
      if (!(PAYMENT_STATUSES as readonly string[]).includes(paymentStatus)) {
        return res.status(400).json({ error: "Invalid payment status." });
      }
      update.paymentStatus = paymentStatus;
    }
    if (trackingNumber !== undefined) {
      update.trackingNumber = String(trackingNumber).trim();
    }
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "Nothing to update." });
    }

    const order = await Order.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(mapOrder(order));
  })
);

// Place an order (authenticated). Totals are recomputed server-side for trust.
app.post(
  "/api/orders",
  authRequired,
  wrap(async (req: AuthedRequest, res) => {
    const b = req.body ?? {};
    const items = Array.isArray(b.items) ? b.items : [];
    if (items.length === 0) return res.status(400).json({ error: "Your cart is empty." });

    const method = PAYMENT_LABELS[String(b.paymentMethod || "").toLowerCase()];
    if (!method) return res.status(400).json({ error: "Please choose a valid payment method." });

    const user = (await User.findById(req.auth!.id).lean()) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    const products: any[] = [];
    for (const it of items) {
      if (!OID.test(String(it.productId ?? ""))) {
        return res.status(400).json({ error: "Your cart contains an invalid product." });
      }
      products.push({
        product: it.productId,
        name: String(it.name ?? ""),
        thumbnail: it.thumbnail ?? "",
        color: it.color ?? "",
        size: it.size ?? "",
        price: Number(it.price) || 0,
        quantity: Math.max(1, Number(it.quantity) || 1),
      });
    }

    const subtotal = products.reduce((s, p) => s + p.price * p.quantity, 0);
    const shipping = subtotal >= 1499 ? 0 : 99;
    const tax = Math.round(subtotal * 0.05);
    const discount = Math.max(0, Number(b.discount) || 0);
    const total = Math.max(0, subtotal + shipping + tax - discount);

    const a = b.shippingAddress ?? {};
    const shippingAddress = {
      fullName: String(a.fullName ?? "").trim(),
      phone: String(a.phone ?? "").trim(),
      line1: String(a.line1 ?? "").trim(),
      line2: String(a.line2 ?? "").trim(),
      city: String(a.city ?? "").trim(),
      state: String(a.state ?? "").trim(),
      pincode: String(a.pincode ?? "").trim(),
      country: String(a.country ?? "India").trim(),
    };
    for (const f of ["fullName", "phone", "line1", "city", "state", "pincode"] as const) {
      if (!shippingAddress[f]) {
        return res.status(400).json({ error: "A complete shipping address is required." });
      }
    }

    // Idempotency net: if the same user just placed an identical order (same
    // items + total) within 30s, return that one instead of creating a duplicate.
    const since = new Date(Date.now() - 30_000);
    const sig = products
      .map((p) => `${p.name}x${p.quantity}`)
      .sort()
      .join("|");
    const recent = (await Order.find({ user: user._id, total, createdAt: { $gte: since } }).lean()) as any[];
    const dup = recent.find(
      (c) =>
        (c.products ?? [])
          .map((p: any) => `${p.name}x${p.quantity}`)
          .sort()
          .join("|") === sig
    );
    if (dup) return res.status(201).json(mapOrder(dup));

    const order = await Order.create({
      orderNumber: await nextOrderNumber(),
      user: user._id,
      customerName: shippingAddress.fullName || user.name,
      products,
      subtotal,
      discount,
      couponCode: b.couponCode || undefined,
      shipping,
      tax,
      total,
      paymentMethod: method,
      paymentStatus: method === "COD" ? "Pending" : "Paid",
      status: "Confirmed",
      shippingAddress,
      billingAddress: b.billingAddress ?? shippingAddress,
    });

    res.status(201).json(mapOrder(order));
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
