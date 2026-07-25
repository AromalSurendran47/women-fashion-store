"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, Package } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { apiGetOrders } from "@/lib/auth-api";
import { formatPrice, formatDate, isValidImageSrc } from "@/lib/utils";
import { OrderBadge } from "@/components/profile/order-badge";
import { buttonVariants } from "@/components/ui/button";
import type { Order } from "@/types";

export default function OrdersPage() {
  const token = useAuthStore((s) => s.token);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    (async () => {
      setOrders(await apiGetOrders(token));
      setLoading(false);
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="animate-spin text-accent-dark" size={28} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-lg font-medium">Order History</h2>
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-line py-16 text-center">
          <Package size={32} className="text-muted" />
          <div>
            <p className="font-medium">No orders yet</p>
            <p className="text-sm text-muted">When you place an order, it will show up here.</p>
          </div>
          <Link href="/products" className={buttonVariants({ size: "sm" })}>
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-medium">Order History</h2>
      {orders.map((o) => (
        <div key={o.id} className="rounded-2xl border border-line">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
              <div>
                <p className="text-xs text-muted">Order</p>
                <p className="text-sm font-medium">{o.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Placed</p>
                <p className="text-sm">{formatDate(o.date)}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Total</p>
                <p className="text-sm font-medium">{formatPrice(o.total)}</p>
              </div>
            </div>
            <OrderBadge status={o.status} />
          </div>

          <div className="flex flex-col gap-3 p-4">
            {o.items.map((it, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  {isValidImageSrc(it.thumbnail) && (
                    <Image src={it.thumbnail} alt={it.name} fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1 text-sm">
                  <p className="line-clamp-1 font-medium">{it.name}</p>
                  <p className="text-xs text-muted">
                    {it.color} · {it.size} · Qty {it.quantity}
                  </p>
                </div>
                <span className="text-sm">{formatPrice(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line p-4">
            <p className="text-xs text-muted">
              {o.trackingNumber ? `Tracking: ${o.trackingNumber}` : "Not yet shipped"}
            </p>
            <div className="flex gap-2">
              {o.status === "Delivered" && (
                <button className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Buy Again
                </button>
              )}
              <Link href="/contact" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Need Help?
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
