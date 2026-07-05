import type { Product, ProductVariant, Size } from "@/types";
import { seededRandom, slugify } from "@/lib/utils";
import {
  BRANDS,
  CARE,
  CATEGORY_DEFS,
  COLORS,
  DESC_BODY,
  DESC_INTRO,
  FABRICS,
  FITS,
  OCCASIONS,
  SIZES,
  STYLE_ADJ,
} from "./_pools";
import { productImages } from "./images";

const PRODUCT_COUNT = 100;

function round99(n: number) {
  return Math.max(499, Math.round(n / 10) * 10 - 1);
}

function buildProduct(i: number): Product {
  // Deterministic RNG seeded by index → identical on server & client.
  const rnd = seededRandom(1000 + i * 7);
  const pick = <T>(arr: readonly T[]) => arr[Math.floor(rnd() * arr.length)];
  const pickN = <T>(arr: readonly T[], n: number) => {
    const pool = [...arr];
    const out: T[] = [];
    for (let k = 0; k < n && pool.length; k++) {
      out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
    }
    return out;
  };

  const cat = CATEGORY_DEFS[i % CATEGORY_DEFS.length];
  const type = pick(cat.types);
  const adjective = pick(STYLE_ADJ);
  const fabric = pick(FABRICS);
  const fit = pick(FITS);
  const occasion = pick(OCCASIONS);

  const name = `${adjective} ${fabric} ${type}`;
  const slug = `${slugify(name)}-${i + 1}`;

  const price = round99(999 + Math.floor(rnd() * 4000));
  const discountPercentage = pick([0, 0, 10, 15, 20, 25, 30, 40]);
  const discountPrice =
    discountPercentage > 0 ? round99(price - (price * discountPercentage) / 100) : price;

  const colors = pickN(COLORS, 2 + Math.floor(rnd() * 3));
  const sizeCount = 4 + Math.floor(rnd() * 3);
  const sizes = SIZES.slice(0, sizeCount) as unknown as Size[];

  const variants: ProductVariant[] = [];
  let stock = 0;
  for (const color of colors) {
    for (const size of sizes) {
      const s = Math.floor(rnd() * 20);
      stock += s;
      variants.push({ color: color.name, size, stock: s });
    }
  }

  const intro = pick(DESC_INTRO)
    .replaceAll("{fabric}", fabric)
    .replaceAll("{type}", type.toLowerCase());
  const description = `${intro} ${pick(DESC_BODY)}`;

  const images = productImages(cat.slug, i);
  const rating = Math.round((3.6 + rnd() * 1.4) * 10) / 10;

  return {
    id: `prod-${i + 1}`,
    name,
    slug,
    description,
    shortDescription: `${adjective} ${type.toLowerCase()} in premium ${fabric.toLowerCase()} — ${occasion.toLowerCase()} ready.`,
    category: cat.slug,
    categoryName: cat.name,
    brand: pick(BRANDS),
    fabric,
    fit,
    occasion,
    price,
    discountPrice,
    discountPercentage,
    stock,
    sku: `SRUVALLE-${1000 + i}`,
    rating,
    reviewCount: 5 + Math.floor(rnd() * 240),
    featured: rnd() < 0.28,
    newArrival: rnd() < 0.4,
    bestSeller: rnd() < 0.25,
    trending: rnd() < 0.3,
    flashSale: discountPercentage >= 25,
    sizes,
    colors,
    material: fabric,
    careInstructions: pickN(CARE, 3),
    images,
    thumbnail: images[0],
    variants,
  };
}

export const products: Product[] = Array.from({ length: PRODUCT_COUNT }, (_, i) =>
  buildProduct(i)
);

/* ---------------- Selectors ---------------- */

export const newArrivals = products.filter((p) => p.newArrival).slice(0, 8);
export const trendingProducts = products.filter((p) => p.trending).slice(0, 8);
export const bestSellers = products.filter((p) => p.bestSeller).slice(0, 8);
export const featuredProducts = products.filter((p) => p.featured).slice(0, 8);
export const flashSaleProducts = products.filter((p) => p.flashSale).slice(0, 6);

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(slug: string) {
  return products.filter((p) => p.category === slug);
}

export function getRelatedProducts(product: Product, limit = 4) {
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}

/** Actual per-category counts, for category cards. */
export const categoryCounts: Record<string, number> = products.reduce(
  (acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);
