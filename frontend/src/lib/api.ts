import type { Product, Category, Review, Blog, Testimonial } from "@/types";

// Local dummy data — used as a fallback whenever the API is unreachable
// (or NEXT_PUBLIC_API_URL is not set). This keeps every page working, and lets
// `next build` succeed even without the backend running.
import {
  products as localProducts,
  getProductBySlug as localProductBySlug,
  getProductsByCategory as localByCategory,
  getRelatedProducts as localRelated,
} from "@/data/products";
import { categories as localCategories, getCategoryBySlug as localCategoryBySlug } from "@/data/categories";
import { getReviewsByProduct as localReviews } from "@/data/reviews";
import { blogs as localBlogs, getBlogBySlug as localBlogBySlug } from "@/data/blogs";
import { testimonials as localTestimonials } from "@/data/testimonials";

const BASE = process.env.NEXT_PUBLIC_API_URL;

/** Whether the app is configured to talk to the backend API. */
export const isApiEnabled = Boolean(BASE);

/**
 * Fetch JSON from the API, falling back to bundled dummy data on any failure.
 * `revalidate` lets Next cache the response (ISR) so SSG/build stays fast.
 */
async function apiGet<T>(path: string, fallback: T): Promise<T> {
  if (!BASE) return fallback;
  try {
    const res = await fetch(`${BASE}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

/* ------------------------------- Products ------------------------------- */

export function getProducts(filter?: "new" | "best" | "trending"): Promise<Product[]> {
  const local = filter
    ? localProducts.filter((p) =>
        filter === "new" ? p.newArrival : filter === "best" ? p.bestSeller : p.trending
      )
    : localProducts;
  const qs = filter ? `?filter=${filter}` : "";
  return apiGet<Product[]>(`/products${qs}`, local);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const local = localProductBySlug(slug);
  if (!BASE) return local;
  try {
    const res = await fetch(`${BASE}/products/${slug}`, { next: { revalidate: 60 } });
    if (res.status === 404) return undefined;
    if (!res.ok) return local;
    return (await res.json()) as Product;
  } catch {
    return local;
  }
}

export function getProductsByCategory(slug: string): Promise<Product[]> {
  return apiGet<Product[]>(`/products?category=${slug}`, localByCategory(slug));
}

export async function getRelatedBySlug(slug: string): Promise<Product[]> {
  const localProduct = localProductBySlug(slug);
  const local = localProduct ? localRelated(localProduct, 8) : [];
  return apiGet<Product[]>(`/products/${slug}/related`, local);
}

/* ------------------------------ Categories ------------------------------ */

export function getCategories(): Promise<Category[]> {
  return apiGet<Category[]>("/categories", localCategories);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? localCategoryBySlug(slug);
}

/* ------------------------------- Reviews -------------------------------- */

export function getReviewsByProduct(productId: string): Promise<Review[]> {
  return apiGet<Review[]>(`/reviews?productId=${productId}`, localReviews(productId));
}

/* -------------------------------- Blogs --------------------------------- */

export function getBlogs(): Promise<Blog[]> {
  return apiGet<Blog[]>("/blogs", localBlogs);
}

export async function getBlogBySlug(slug: string): Promise<Blog | undefined> {
  const local = localBlogBySlug(slug);
  if (!BASE) return local;
  try {
    const res = await fetch(`${BASE}/blogs/${slug}`, { next: { revalidate: 60 } });
    if (res.status === 404) return undefined;
    if (!res.ok) return local;
    return (await res.json()) as Blog;
  } catch {
    return local;
  }
}

export async function getRelatedBlogs(current: Blog, limit = 3): Promise<Blog[]> {
  const all = await getBlogs();
  return all.filter((b) => b.id !== current.id).slice(0, limit);
}

/* ----------------------------- Testimonials ----------------------------- */

export function getTestimonials(): Promise<Testimonial[]> {
  return apiGet<Testimonial[]>("/testimonials", localTestimonials);
}
