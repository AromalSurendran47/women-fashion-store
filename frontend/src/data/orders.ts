import type { Order, OrderItem, OrderStatus } from "@/types";
import { seededRandom, daysAgo } from "@/lib/utils";
import { products } from "./products";

const STATUSES: OrderStatus[] = [
  "Delivered",
  "Shipped",
  "Packed",
  "Confirmed",
  "Pending",
  "Cancelled",
  "Returned",
];

const PAYMENTS = ["Razorpay", "UPI", "Card", "Cash on Delivery"];

function buildOrder(i: number): Order {
  const rnd = seededRandom(9000 + i * 17);
  const pick = <T>(arr: readonly T[]) => arr[Math.floor(rnd() * arr.length)];
  const itemCount = 1 + Math.floor(rnd() * 3);

  const items: OrderItem[] = Array.from({ length: itemCount }, () => {
    const p = products[Math.floor(rnd() * products.length)];
    return {
      productId: p.id,
      name: p.name,
      thumbnail: p.thumbnail,
      color: p.colors[0].name,
      size: p.sizes[Math.min(1, p.sizes.length - 1)],
      price: p.discountPrice,
      quantity: 1 + Math.floor(rnd() * 2),
    };
  });

  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const discount = rnd() < 0.4 ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal - discount >= 1499 ? 0 : 99;
  const tax = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + shipping + tax;
  const status = STATUSES[i % STATUSES.length];

  return {
    id: `order-${i + 1}`,
    orderNumber: `SRUVALLE${100000 + i}`,
    date: daysAgo(i * 12 + 2),
    items,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    status,
    paymentMethod: pick(PAYMENTS),
    trackingNumber: ["Shipped", "Delivered", "Returned"].includes(status)
      ? `TRK${(100000 + i * 37).toString(36).toUpperCase()}`
      : undefined,
  };
}

export const orders: Order[] = Array.from({ length: 7 }, (_, i) => buildOrder(i));

export function getOrderById(id: string) {
  return orders.find((o) => o.id === id);
}
