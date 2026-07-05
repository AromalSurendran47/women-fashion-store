import type { Category } from "@/types";
import { CATEGORY_DEFS } from "./_pools";
import { categoryImage, categoryBanner } from "./images";

export const categories: Category[] = CATEGORY_DEFS.map((c, i) => ({
  id: `cat-${i + 1}`,
  name: c.name,
  slug: c.slug,
  image: categoryImage(c.slug),
  banner: categoryBanner(c.slug),
  description: c.description,
  featured: c.featured,
  // Filled in properly by products.ts consumers; a sensible default here.
  productCount: 8 + (i % 5) * 3,
}));

export const featuredCategories = categories.filter((c) => c.featured);

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}
