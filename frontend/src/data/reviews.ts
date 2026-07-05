import type { Review } from "@/types";
import { seededRandom, daysAgo } from "@/lib/utils";
import { products } from "./products";
import { FIRST_NAMES, LAST_NAMES, REVIEW_COMMENTS, REVIEW_TITLES } from "./_pools";
import { avatar } from "./images";

// ~250 reviews distributed across products, deterministically.
const REVIEW_COUNT = 250;

export const reviews: Review[] = Array.from({ length: REVIEW_COUNT }, (_, i) => {
  const rnd = seededRandom(5000 + i * 13);
  const pick = <T>(arr: readonly T[]) => arr[Math.floor(rnd() * arr.length)];
  const product = products[i % products.length];
  const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  const rating = pick([3, 4, 4, 5, 5, 5, 5]);

  return {
    id: `rev-${i + 1}`,
    productId: product.id,
    userName: name,
    avatar: avatar(i),
    rating,
    title: pick(REVIEW_TITLES),
    comment: pick(REVIEW_COMMENTS),
    verifiedPurchase: rnd() < 0.8,
    date: daysAgo(Math.floor(rnd() * 180)),
    helpfulCount: Math.floor(rnd() * 40),
  };
});

export function getReviewsByProduct(productId: string) {
  return reviews.filter((r) => r.productId === productId);
}
