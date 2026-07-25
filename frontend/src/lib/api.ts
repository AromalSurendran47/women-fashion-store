import type {
  Product,
  Category,
  Review,
  Blog,
  Testimonial,
  Banner,
  Faq,
  Coupon,
  Order,
  Attributes,
} from "@/types";
import { FABRICS, FITS, OCCASIONS, SIZES, COLORS } from "@/data/_pools";

// All application data is served exclusively by the backend API. There is no
// bundled dummy-data fallback: if NEXT_PUBLIC_API_URL is unset or the API is
// unreachable, list endpoints resolve to empty and single-item lookups to
// `undefined`, so no hardcoded frontend data is ever displayed.

const BASE = process.env.NEXT_PUBLIC_API_URL;

/** Whether the app is configured to talk to the backend API. */
export const isApiEnabled = Boolean(BASE);

/**
 * Fetch JSON from the API. On any failure (no BASE, network error, non-OK
 * response) the provided empty `fallback` is returned — never dummy content.
 * Uses `no-store` so admin catalog edits (price, category, flags…) reflect on
 * the storefront immediately instead of being served stale from the ISR cache.
 */
async function apiGet<T>(path: string, fallback: T): Promise<T> {
  if (!BASE) return fallback;
  try {
    const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

/** Fetch a single resource by path, returning undefined on any failure. */
async function apiGetOne<T>(path: string): Promise<T | undefined> {
  if (!BASE) return undefined;
  try {
    const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
    if (!res.ok) return undefined;
    return (await res.json()) as T;
  } catch {
    return undefined;
  }
}

/* ------------------------------- Products ------------------------------- */

export function getProducts(filter?: "new" | "best" | "trending"): Promise<Product[]> {
  const qs = filter ? `?filter=${filter}` : "";
  return apiGet<Product[]>(`/products${qs}`, []);
}

export function getProductBySlug(slug: string): Promise<Product | undefined> {
  return apiGetOne<Product>(`/products/${slug}`);
}

export function getProductsByCategory(slug: string): Promise<Product[]> {
  return apiGet<Product[]>(`/products?category=${slug}`, []);
}

export function getRelatedBySlug(slug: string): Promise<Product[]> {
  return apiGet<Product[]>(`/products/${slug}/related`, []);
}

/* ------------------------------ Categories ------------------------------ */

export function getCategories(): Promise<Category[]> {
  return apiGet<Category[]>("/categories", []);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug);
}

/* ------------------------------- Reviews -------------------------------- */

export function getReviewsByProduct(productId: string): Promise<Review[]> {
  return apiGet<Review[]>(`/reviews?productId=${productId}`, []);
}

/* -------------------------------- Blogs --------------------------------- */
// Blogs are fetched LIVE from the backend on every request (`cache: "no-store"`)
// so the page always reflects the backend's real state — never a cached copy.
// If the backend is unreachable these throw / return undefined, and the blog
// pages respond with a 404 instead of serving stale content.

/** Throws if the backend is not configured or unreachable. */
export async function getBlogs(): Promise<Blog[]> {
  if (!BASE) throw new Error("Backend API is not configured.");
  const res = await fetch(`${BASE}/blogs`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load blogs (${res.status}).`);
  return (await res.json()) as Blog[];
}

/** Returns undefined if the blog is missing OR the backend is unreachable. */
export async function getBlogBySlug(slug: string): Promise<Blog | undefined> {
  if (!BASE) return undefined;
  try {
    const res = await fetch(`${BASE}/blogs/${slug}`, { cache: "no-store" });
    if (!res.ok) return undefined;
    return (await res.json()) as Blog;
  } catch {
    return undefined;
  }
}

export async function getRelatedBlogs(current: Blog, limit = 3): Promise<Blog[]> {
  try {
    const all = await getBlogs();
    return all.filter((b) => b.id !== current.id).slice(0, limit);
  } catch {
    return [];
  }
}

/* ----------------------------- Testimonials ----------------------------- */
// Fetched LIVE from the backend on every request (`cache: "no-store"`) so the
// homepage reflects the backend's real state. When the backend is unreachable
// this returns [] and the testimonials section is hidden — never stale/cached.

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!BASE) return [];
  try {
    const res = await fetch(`${BASE}/testimonials`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as Testimonial[];
  } catch {
    return [];
  }
}

/* --------------------------------- FAQs --------------------------------- */

export function getFaqs(): Promise<Faq[]> {
  return apiGet<Faq[]>("/faqs", []);
}

/* ------------------------------ Attributes ------------------------------ */
// Controlled option lists (fabric/fit/occasion/size/colour) from the backend.
// Falls back to the bundled lists so the UI still works if the API is down.
export const ATTRIBUTES_FALLBACK: Attributes = {
  fabrics: [...FABRICS],
  fits: [...FITS],
  occasions: [...OCCASIONS],
  sizes: [...SIZES],
  colors: [...COLORS],
};

export function getAttributes(): Promise<Attributes> {
  return apiGet<Attributes>("/attributes", ATTRIBUTES_FALLBACK);
}

/* -------------------------------- Coupons ------------------------------- */

export function getCoupons(): Promise<Coupon[]> {
  return apiGet<Coupon[]>("/coupons", []);
}

export type CouponValidation = {
  valid: boolean;
  code?: string;
  discount?: number;
  message?: string;
};

/** Validate a coupon against the current subtotal via the backend. */
export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidation> {
  if (!BASE) return { valid: false, message: "Coupons are unavailable right now." };
  try {
    const res = await fetch(`${BASE}/coupons/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, subtotal }),
    });
    if (!res.ok && res.status !== 404) {
      return { valid: false, message: "Could not validate coupon. Try again." };
    }
    return (await res.json()) as CouponValidation;
  } catch {
    return { valid: false, message: "Could not validate coupon. Try again." };
  }
}

/* -------------------------------- Orders -------------------------------- */

export function getOrders(): Promise<Order[]> {
  return apiGet<Order[]>("/orders", []);
}

/* ------------------------------- Banners -------------------------------- */

export type InstagramItem = { id: string; image: string; href: string };

/** Hero-slider banners (top of the homepage). */
export function getHeroBanners(): Promise<Banner[]> {
  return apiGet<Banner[]>("/banners?type=hero", []);
}

/** The single "New Arrivals" collection banner, or null if none is configured. */
export async function getCollectionBanner(): Promise<Banner | null> {
  const [banner] = await apiGet<Banner[]>("/banners?type=collection", []);
  return banner ?? null;
}

/** Instagram gallery tiles. Backend banners expose the link as `ctaLink`. */
export async function getInstagramGallery(): Promise<InstagramItem[]> {
  const items = await apiGet<Array<Banner & { href?: string }>>("/banners?type=instagram", []);
  return items.map((b) => ({
    id: b.id,
    image: b.image,
    href: b.href ?? b.ctaLink ?? "https://instagram.com/sruvalle",
  }));
}
