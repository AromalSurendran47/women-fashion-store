import type { CartLine } from "@/types";
import { products } from "./products";

/** Initial demo cart — used to seed the cart store on first load. */
export const initialCart: CartLine[] = products.slice(0, 2).map((p, i) => ({
  productId: p.id,
  name: p.name,
  slug: p.slug,
  thumbnail: p.thumbnail,
  price: p.discountPrice,
  color: p.colors[0].name,
  size: p.sizes[Math.min(1, p.sizes.length - 1)],
  quantity: i + 1,
}));
