import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as P from "./pools.js";
import * as IMG from "./images.js";

const { Types } = mongoose;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const oid = () => new Types.ObjectId();

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickMany = <T>(arr: readonly T[], n: number): T[] =>
  faker.helpers.arrayElements(arr as T[], n);
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const chance = (p: number) => Math.random() < p;
const round99 = (n: number) => Math.max(499, Math.round(n / 10) * 10 - 1);

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Real bcrypt hash of the plaintext "Password123" — computed once at seed time
// so every seeded account can actually log in.
const PASSWORD_HASH = bcrypt.hashSync("Password123", 10);

const img = (seed: string, w = 600, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export function genCategories() {
  return P.CATEGORIES.map((c, i) => ({
    _id: oid(),
    name: c.name,
    slug: c.slug,
    image: IMG.categoryImage(c.slug),
    banner: IMG.categoryBanner(c.slug),
    description: c.description,
    featured: c.featured,
    order: i,
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: new Date(),
    _types: c.types, // internal helper, stripped before insert
  }));
}

type Category = ReturnType<typeof genCategories>[number];

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

export function genProducts(count: number, categories: Category[]) {
  const products = [];
  const usedSlugs = new Set<string>();

  for (let i = 0; i < count; i++) {
    const cat = categories[i % categories.length];
    const type = pick(cat._types);
    const adjective = pick(P.STYLE_ADJECTIVES);
    const fabric = pick(P.FABRICS);
    const fit = pick(P.FITS);
    const occasion = pick(P.OCCASIONS);

    const name = `${adjective} ${fabric} ${type}`;
    let slug = slugify(name);
    while (usedSlugs.has(slug)) slug = `${slugify(name)}-${randInt(100, 999)}`;
    usedSlugs.add(slug);

    const price = round99(randInt(999, 4999));
    const discountPercentage = pick([0, 0, 10, 15, 20, 25, 30, 40]);
    const discountPrice =
      discountPercentage > 0 ? round99(price - (price * discountPercentage) / 100) : price;

    const colors = pickMany(
      P.COLORS.map((c) => c.name),
      randInt(2, 5)
    );
    const sizes = P.SIZES.slice(0, randInt(4, 6)) as unknown as string[];

    const _id = oid();
    const images = IMG.productImages(cat.slug, i);
    const thumbnail = images[0];

    // Variants = colours × sizes with individual stock.
    const variants = [];
    let totalStock = 0;
    for (const color of colors) {
      for (const size of sizes) {
        const stock = randInt(0, 25);
        totalStock += stock;
        variants.push({
          color,
          size,
          sku: `SRUVALLE-${slug.slice(0, 6).toUpperCase()}-${color.slice(0, 2).toUpperCase()}-${size}`,
          stock,
          price: discountPrice,
          image: IMG.variantImage(cat.slug, i),
        });
      }
    }

    const intro = pick(P.DESCRIPTION_INTROS)
      .replace("{fabric}", fabric)
      .replace("{type}", type.toLowerCase())
      .replace("{fit}", fit.toLowerCase());
    const body = pick(P.DESCRIPTION_BODIES);
    const description = `${intro} ${body}`;
    const shortDescription = `${adjective} ${type.toLowerCase()} in premium ${fabric.toLowerCase()} — ${occasion.toLowerCase()} ready.`;

    products.push({
      _id,
      name,
      slug,
      description,
      shortDescription,
      category: cat._id,
      subCategory: type,
      brand: pick(P.BRANDS),
      fabric,
      fit,
      occasion,
      price,
      discountPrice,
      discountPercentage,
      stock: totalStock,
      sku: `SRUVALLE-${String(1000 + i)}`,
      rating: 0, // filled in after reviews
      reviewCount: 0,
      featured: chance(0.25),
      newArrival: chance(0.35),
      bestSeller: chance(0.2),
      trending: chance(0.25),
      sizes,
      colors,
      material: fabric,
      careInstructions: pickMany(P.CARE_INSTRUCTIONS, randInt(3, 4)),
      weight: randInt(180, 650),
      images,
      thumbnail,
      video: chance(0.15) ? "https://www.w3schools.com/html/mov_bbb.mp4" : undefined,
      variants,
      seoTitle: `${name} | Buy Online at Sruvalle`,
      seoDescription: `Shop the ${name} — ${fabric} ${fit} fit, perfect for ${occasion.toLowerCase()}. Free shipping over ₹1499.`,
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: new Date(),
    });
  }
  return products;
}

type Product = ReturnType<typeof genProducts>[number];

/* ------------------------------------------------------------------ */
/* Users (+ addresses, wishlist, cart)                                 */
/* ------------------------------------------------------------------ */

function genAddress(fullName: string) {
  const loc = pick(P.CITIES);
  return {
    label: pick(["Home", "Work", "Other"]),
    fullName,
    phone: `+91 ${randInt(70, 99)}${randInt(10000000, 99999999)}`,
    line1: pick(P.STREETS),
    line2: `Near ${pick(["City Mall", "Metro Station", "Central Park", "Ring Road"])}`,
    city: loc.city,
    state: loc.state,
    pincode: loc.pincode,
    country: "India",
    isDefault: false,
  };
}

export interface SeedUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "admin" | "seller" | "customer";
  avatar: string;
  wishlist: mongoose.Types.ObjectId[];
  cart: any[];
  addresses: ReturnType<typeof genAddress>[];
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function genUsers(count: number, products: Product[]): SeedUser[] {
  const users: SeedUser[] = [];

  // First two accounts are the admin + a seller, for dashboard testing.
  const seeded = [
    { name: "Sruvalle Admin", email: "admin@sruvalle.in", role: "admin" as const },
    { name: "Studio Seller", email: "seller@sruvalle.in", role: "seller" as const },
  ];

  for (let i = 0; i < count; i++) {
    const first = pick(P.FIRST_NAMES);
    const last = pick(P.LAST_NAMES);
    const info = seeded[i];
    const name = info?.name ?? `${first} ${last}`;
    const email = info?.email ?? `${first}.${last}${i}`.toLowerCase() + "@example.com";
    const role: "admin" | "seller" | "customer" = info?.role ?? "customer";

    const addresses = Array.from({ length: randInt(1, 2) }, () => genAddress(name));
    if (addresses.length) addresses[0].isDefault = true;

    const wishlist = pickMany(products, randInt(0, 5)).map((p) => p._id);
    const cartProducts = pickMany(products, randInt(0, 3));
    const cart = cartProducts.map((p) => ({
      product: p._id,
      variantSku: p.variants[0]?.sku,
      name: p.name,
      thumbnail: p.thumbnail,
      color: pick(p.colors),
      size: pick(p.sizes),
      price: p.discountPrice,
      quantity: randInt(1, 3),
    }));

    users.push({
      _id: oid(),
      name,
      email,
      phone: `+91 ${randInt(70, 99)}${randInt(10000000, 99999999)}`,
      password: PASSWORD_HASH,
      role,
      avatar: IMG.avatar(i),
      wishlist,
      cart,
      addresses,
      emailVerified: chance(0.85),
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: new Date(),
    });
  }
  return users;
}

type User = SeedUser;

/* ------------------------------------------------------------------ */
/* Reviews (+ rollup onto products)                                    */
/* ------------------------------------------------------------------ */

export function genReviews(count: number, products: Product[], users: User[]) {
  const customers = users.filter((u) => u.role === "customer");
  const reviews = [];

  for (let i = 0; i < count; i++) {
    const product = pick(products);
    const user = pick(customers);
    const rating = faker.helpers.weightedArrayElement([
      { weight: 1, value: 2 },
      { weight: 2, value: 3 },
      { weight: 5, value: 4 },
      { weight: 8, value: 5 },
    ]);

    reviews.push({
      _id: oid(),
      product: product._id,
      user: user._id,
      userName: user.name,
      rating,
      title: pick(P.REVIEW_TITLES),
      comment: pick(P.REVIEW_COMMENTS),
      images: chance(0.2) ? [IMG.blogImage(i)] : [],
      verifiedPurchase: chance(0.8),
      helpfulCount: randInt(0, 40),
      createdAt: faker.date.recent({ days: 200 }),
    });
  }

  // Roll ratings up onto products.
  const byProduct = new Map<string, number[]>();
  for (const r of reviews) {
    const key = String(r.product);
    if (!byProduct.has(key)) byProduct.set(key, []);
    byProduct.get(key)!.push(r.rating);
  }
  for (const p of products) {
    const ratings = byProduct.get(String(p._id));
    if (ratings?.length) {
      p.reviewCount = ratings.length;
      p.rating = Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
    } else {
      p.reviewCount = 0;
      p.rating = 0;
    }
  }

  return reviews;
}

/* ------------------------------------------------------------------ */
/* Standalone Wishlist & Cart documents                                */
/* ------------------------------------------------------------------ */

export function genWishlists(users: User[], products: Product[]) {
  return users
    .filter((u) => u.role === "customer")
    .map((u) => ({
      _id: oid(),
      user: u._id,
      products: pickMany(products, randInt(1, 8)).map((p) => p._id),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: new Date(),
    }));
}

export function genCarts(users: User[], products: Product[]) {
  return users
    .filter((u) => u.role === "customer" && chance(0.6))
    .map((u) => {
      const items = pickMany(products, randInt(1, 4)).map((p) => ({
        product: p._id,
        variantSku: p.variants[0]?.sku,
        name: p.name,
        thumbnail: p.thumbnail,
        color: pick(p.colors),
        size: pick(p.sizes),
        price: p.discountPrice,
        quantity: randInt(1, 3),
      }));
      return {
        _id: oid(),
        user: u._id,
        items,
        coupon: chance(0.3) ? pick(P.COUPONS).code : undefined,
        updatedAt: faker.date.recent({ days: 20 }),
      };
    });
}

/* ------------------------------------------------------------------ */
/* Coupons                                                             */
/* ------------------------------------------------------------------ */

export function genCoupons() {
  return P.COUPONS.map((c) => ({
    _id: oid(),
    code: c.code,
    description: c.description,
    discountType: c.discountType,
    discountValue: c.discountValue,
    minOrderValue: c.minOrderValue,
    maxDiscount: c.maxDiscount,
    usageLimit: randInt(50, 500),
    usedCount: randInt(0, 50),
    active: chance(0.85),
    expiresAt: faker.date.future({ years: 1 }),
    createdAt: faker.date.past({ years: 1 }),
  }));
}

type Coupon = ReturnType<typeof genCoupons>[number];

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
] as const;

export function genOrders(count: number, users: User[], products: Product[], coupons: Coupon[]) {
  const customers = users.filter((u) => u.role === "customer");
  const orders = [];

  for (let i = 0; i < count; i++) {
    const user = pick(customers);
    const lineItems = pickMany(products, randInt(1, 4)).map((p) => ({
      product: p._id,
      name: p.name,
      thumbnail: p.thumbnail,
      color: pick(p.colors),
      size: pick(p.sizes),
      price: p.discountPrice,
      quantity: randInt(1, 3),
    }));

    const subtotal = lineItems.reduce((sum, it) => sum + it.price * it.quantity, 0);

    let discount = 0;
    let couponCode: string | undefined;
    if (chance(0.4)) {
      const coupon = pick(coupons);
      if (subtotal >= coupon.minOrderValue) {
        couponCode = coupon.code;
        discount =
          coupon.discountType === "percentage"
            ? Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount)
            : coupon.discountValue;
        discount = Math.round(discount);
      }
    }

    const shipping = subtotal - discount >= 1499 ? 0 : 99;
    const tax = Math.round((subtotal - discount) * 0.05);
    const total = subtotal - discount + shipping + tax;

    const status = pick(ORDER_STATUSES);
    const shipped = ["Shipped", "Delivered", "Returned"].includes(status);
    let paymentStatus: string;
    if (status === "Delivered") paymentStatus = "Paid";
    else if (status === "Cancelled") paymentStatus = pick(["Refunded", "Failed"]);
    else if (status === "Returned") paymentStatus = "Refunded";
    else paymentStatus = pick(["Paid", "Pending"]);

    const paymentMethod = pick(["Razorpay", "UPI", "Card", "NetBanking", "COD"]);
    if (paymentMethod === "COD" && status === "Delivered") paymentStatus = "Paid";

    const address = user.addresses[0] ?? genAddress(user.name);
    const createdAt = faker.date.recent({ days: 180 });

    orders.push({
      _id: oid(),
      orderNumber: `SRUVALLE${String(100000 + i)}`,
      user: user._id,
      customerName: user.name,
      products: lineItems,
      subtotal,
      discount,
      couponCode,
      shipping,
      tax,
      total,
      paymentMethod,
      paymentStatus,
      status,
      trackingNumber: shipped ? `TRK${faker.string.alphanumeric(10).toUpperCase()}` : undefined,
      shippingAddress: address,
      billingAddress: address,
      notes: chance(0.15) ? "Please deliver after 6 PM." : undefined,
      createdAt,
      updatedAt: new Date(),
    });
  }
  return orders;
}

/* ------------------------------------------------------------------ */
/* Banners                                                             */
/* ------------------------------------------------------------------ */

export function genBanners(categories: Category[]) {
  const banners: any[] = [];
  let order = 0;

  P.HERO_BANNERS.forEach((b, i) => {
    banners.push({
      _id: oid(),
      ...b,
      image: IMG.heroImage(i),
      mobileImage: IMG.heroImage(i),
      type: "hero",
      order: order++,
      active: true,
      createdAt: faker.date.past({ years: 1 }),
    });
  });

  P.COLLECTION_BANNERS.forEach((b) => {
    banners.push({
      _id: oid(),
      ...b,
      image: IMG.collectionImage(),
      mobileImage: IMG.collectionImage(),
      type: "collection",
      order: order++,
      active: true,
      createdAt: faker.date.past({ years: 1 }),
    });
  });

  categories
    .filter((c) => c.featured)
    .slice(0, 6)
    .forEach((c) => {
      banners.push({
        _id: oid(),
        title: c.name,
        subtitle: c.description,
        image: IMG.categoryBanner(c.slug),
        mobileImage: IMG.categoryImage(c.slug),
        ctaText: `Shop ${c.name}`,
        ctaLink: `/collections/${c.slug}`,
        type: "category",
        order: order++,
        active: true,
        createdAt: faker.date.past({ years: 1 }),
      });
    });

  P.OFFER_BANNERS.forEach((b) => {
    banners.push({
      _id: oid(),
      ...b,
      image: IMG.offerImage(),
      mobileImage: IMG.offerImage(),
      type: "offer",
      order: order++,
      active: true,
      createdAt: faker.date.past({ years: 1 }),
    });
  });

  Array.from({ length: P.INSTAGRAM_COUNT }).forEach((_, i) => {
    banners.push({
      _id: oid(),
      title: `@${P.INSTAGRAM_HANDLE}`,
      subtitle: "Instagram",
      image: IMG.instagramImage(i),
      mobileImage: IMG.instagramImage(i),
      ctaText: "View on Instagram",
      ctaLink: `https://instagram.com/${P.INSTAGRAM_HANDLE}`,
      type: "instagram",
      order: order++,
      active: true,
      createdAt: faker.date.past({ years: 1 }),
    });
  });

  return banners;
}

/* ------------------------------------------------------------------ */
/* Testimonials, FAQ, Newsletter, Blogs, Settings                      */
/* ------------------------------------------------------------------ */

export function genTestimonials() {
  return P.TESTIMONIALS.map((t, i) => ({
    _id: oid(),
    name: t.name,
    avatar: IMG.avatar(i + 24),
    location: t.location,
    rating: 5,
    message: t.message,
    active: true,
    createdAt: faker.date.past({ years: 1 }),
  }));
}

export function genFaqs() {
  return P.FAQS.map((f, i) => ({
    _id: oid(),
    question: f.q,
    answer: f.a,
    category: f.category,
    order: i,
  }));
}

export function genNewsletter(count: number) {
  const subs = [];
  const used = new Set<string>();
  for (let i = 0; i < count; i++) {
    let email = faker.internet.email().toLowerCase();
    while (used.has(email)) email = faker.internet.email().toLowerCase();
    used.add(email);
    subs.push({
      _id: oid(),
      email,
      subscribed: chance(0.9),
      source: pick(["footer", "popup", "checkout", "blog"]),
      createdAt: faker.date.past({ years: 1 }),
    });
  }
  return subs;
}

export function genBlogs() {
  return P.BLOG_TOPICS.map((b, i) => {
    const author = `${pick(P.FIRST_NAMES)} ${pick(P.LAST_NAMES)}`;
    const paras = [
      P.BLOG_PARAGRAPHS[0],
      ...faker.helpers.arrayElements(P.BLOG_PARAGRAPHS.slice(1), 3),
    ];
    const content = paras.map((p) => `<p>${p}</p>`).join("\n");
    return {
      _id: oid(),
      title: b.title,
      slug: slugify(b.title),
      excerpt: paras[0].slice(0, 140) + "…",
      image: IMG.blogImage(i),
      content,
      tags: b.tags,
      author,
      authorAvatar: IMG.avatar(i + 40),
      readTime: randInt(3, 8),
      published: true,
      publishedAt: faker.date.recent({ days: 300 }),
      createdAt: faker.date.past({ years: 1 }),
    };
  });
}

export function genSettings() {
  return { _id: oid(), ...P.SETTINGS };
}
