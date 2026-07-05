import type { Coupon } from "@/types";

export const coupons: Coupon[] = [
  { code: "WELCOME10", description: "10% off your first order", discountType: "percentage", discountValue: 10, minOrderValue: 999, maxDiscount: 500 },
  { code: "SUMMER15", description: "15% off the summer collection", discountType: "percentage", discountValue: 15, minOrderValue: 1499, maxDiscount: 800 },
  { code: "FESTIVE20", description: "Festive season — flat 20% off", discountType: "percentage", discountValue: 20, minOrderValue: 1999, maxDiscount: 1200 },
  { code: "FLAT300", description: "Flat ₹300 off orders above ₹1,500", discountType: "fixed", discountValue: 300, minOrderValue: 1500, maxDiscount: 300 },
  { code: "FLAT500", description: "₹500 off orders above ₹2,999", discountType: "fixed", discountValue: 500, minOrderValue: 2999, maxDiscount: 500 },
];

export function findCoupon(code: string) {
  return coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
}

/** Returns the discount amount for a coupon given a subtotal, or 0 if invalid. */
export function computeDiscount(coupon: Coupon, subtotal: number) {
  if (subtotal < coupon.minOrderValue) return 0;
  const raw =
    coupon.discountType === "percentage"
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;
  return Math.round(Math.min(raw, coupon.maxDiscount));
}
