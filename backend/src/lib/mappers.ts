/**
 * Map Mongoose documents to the DTO shapes the frontend consumes
 * (see frontend/src/types). Keeping the mapping here means the API contract is
 * explicit and the frontend never has to know about Mongo internals.
 */

const COLOR_HEX: Record<string, string> = {
  Black: "#1A1A1A",
  White: "#F4F1EC",
  Beige: "#D8C3A5",
  Brown: "#6F4E37",
  Pink: "#E8B4C0",
  Green: "#2E7D5B",
  Olive: "#708238",
  Blue: "#3B5998",
  Red: "#B22222",
  Mustard: "#E1AD01",
};

const hexFor = (name: string) => COLOR_HEX[name] ?? "#CCCCCC";

/** Category may be a populated object or a raw id. */
function categoryFields(category: any): { slug: string; name: string } {
  if (category && typeof category === "object" && "slug" in category) {
    return { slug: category.slug, name: category.name };
  }
  return { slug: "", name: "" };
}

export function mapProduct(p: any) {
  const cat = categoryFields(p.category);
  // "New" badge shows only for products created today (server-local date).
  const created = p.createdAt ? new Date(p.createdAt) : null;
  const isNew = created ? created.toDateString() === new Date().toDateString() : false;
  return {
    id: String(p._id),
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.shortDescription ?? "",
    category: cat.slug,
    categoryName: cat.name,
    brand: p.brand ?? "",
    fabric: p.fabric ?? "",
    fit: p.fit ?? "",
    occasion: p.occasion ?? "",
    price: p.price,
    discountPrice: p.discountPrice ?? p.price,
    discountPercentage: p.discountPercentage ?? 0,
    stock: p.stock ?? 0,
    sku: p.sku,
    rating: p.rating ?? 0,
    reviewCount: p.reviewCount ?? 0,
    featured: !!p.featured,
    newArrival: !!p.newArrival,
    bestSeller: !!p.bestSeller,
    trending: !!p.trending,
    flashSale: (p.discountPercentage ?? 0) >= 25,
    sizes: p.sizes ?? [],
    colors: (p.colors ?? []).map((c: string) => ({ name: c, hex: hexFor(c) })),
    material: p.material ?? p.fabric ?? "",
    careInstructions: p.careInstructions ?? [],
    images: p.images ?? [],
    thumbnail: p.thumbnail,
    variants: (p.variants ?? []).map((v: any) => ({
      color: v.color,
      size: v.size,
      stock: v.stock,
    })),
    createdAt: p.createdAt ?? null,
    isNew,
  };
}

export function mapUser(u: any) {
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    phone: u.phone ?? "",
    role: u.role,
    avatar: u.avatar ?? `https://i.pravatar.cc/150?img=${(String(u._id).charCodeAt(0) % 70) + 1}`,
    emailVerified: !!u.emailVerified,
    createdAt: u.createdAt,
  };
}

export function mapCategory(c: any) {
  return {
    id: String(c._id),
    name: c.name,
    slug: c.slug,
    image: c.image,
    banner: c.banner ?? c.image,
    description: c.description ?? "",
    featured: !!c.featured,
    productCount: c.productCount ?? 0,
  };
}

export function mapReview(r: any) {
  // Deterministic face avatar from the review id (pravatar has 70 portraits).
  const n = (parseInt(String(r._id).slice(-2), 16) % 70) + 1;
  return {
    id: String(r._id),
    productId: String(r.product),
    userName: r.userName,
    avatar: `https://i.pravatar.cc/150?img=${n}`,
    rating: r.rating,
    title: r.title ?? "",
    comment: r.comment,
    verifiedPurchase: !!r.verifiedPurchase,
    date: r.createdAt,
    helpfulCount: r.helpfulCount ?? 0,
  };
}

export function mapBlog(b: any) {
  return {
    id: String(b._id),
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt ?? "",
    image: b.image,
    content: b.content,
    tags: b.tags ?? [],
    author: b.author,
    authorAvatar: b.authorAvatar ?? "",
    readTime: b.readTime ?? 4,
    date: b.publishedAt ?? b.createdAt,
  };
}

export function mapTestimonial(t: any) {
  return {
    id: String(t._id),
    name: t.name,
    avatar: t.avatar,
    location: t.location ?? "",
    rating: t.rating ?? 5,
    message: t.message,
  };
}

export function mapFaq(f: any) {
  return {
    id: String(f._id),
    question: f.question,
    answer: f.answer,
    category: f.category ?? "General",
  };
}

export function mapCoupon(c: any) {
  return {
    code: c.code,
    description: c.description ?? "",
    discountType: c.discountType,
    discountValue: c.discountValue,
    minOrderValue: c.minOrderValue ?? 0,
    maxDiscount: c.maxDiscount ?? 0,
  };
}

export function mapOrder(o: any) {
  return {
    id: String(o._id),
    orderNumber: o.orderNumber,
    customerName: o.customerName ?? "",
    date: o.createdAt ?? o.date,
    createdAt: o.createdAt ?? o.date,
    items: (o.products ?? []).map((p: any) => ({
      productId: String(p.product),
      name: p.name,
      thumbnail: p.thumbnail ?? "",
      color: p.color ?? "",
      size: p.size ?? "",
      price: p.price,
      quantity: p.quantity,
    })),
    subtotal: o.subtotal ?? 0,
    discount: o.discount ?? 0,
    shipping: o.shipping ?? 0,
    tax: o.tax ?? 0,
    total: o.total ?? 0,
    status: o.status,
    paymentMethod: o.paymentMethod ?? "",
    trackingNumber: o.trackingNumber ?? undefined,
  };
}

export function mapBanner(b: any) {
  return {
    id: String(b._id),
    title: b.title,
    subtitle: b.subtitle ?? "",
    description: b.description ?? "",
    image: b.image,
    mobileImage: b.mobileImage ?? b.image,
    ctaText: b.ctaText ?? "",
    ctaLink: b.ctaLink ?? "",
    type: b.type ?? "hero",
    align: b.align ?? "left",
  };
}
