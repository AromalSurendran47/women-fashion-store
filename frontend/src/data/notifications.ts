import type { AppNotification } from "@/types";
import { daysAgo } from "@/lib/utils";

export const notifications: AppNotification[] = [
  { id: "n-1", type: "order", title: "Order delivered", message: "Your order SRUVALLE100000 was delivered. We'd love a review!", date: daysAgo(1), read: false },
  { id: "n-2", type: "offer", title: "Festive Sale is live", message: "Flat 20% off ethnic wear. Use code FESTIVE20 at checkout.", date: daysAgo(2), read: false },
  { id: "n-3", type: "order", title: "Order shipped", message: "Order SRUVALLE100003 is on its way. Track it from your profile.", date: daysAgo(3), read: true },
  { id: "n-4", type: "system", title: "Price drop", message: "An item in your wishlist just dropped by 25%.", date: daysAgo(4), read: true },
  { id: "n-5", type: "offer", title: "New arrivals", message: "The Summer Edit just landed. Be the first to shop it.", date: daysAgo(6), read: true },
];
