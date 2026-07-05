import { products } from "./products";

/** Initial demo wishlist — product ids used to seed the wishlist store. */
export const initialWishlist: string[] = products
  .filter((p) => p.bestSeller)
  .slice(0, 4)
  .map((p) => p.id);
