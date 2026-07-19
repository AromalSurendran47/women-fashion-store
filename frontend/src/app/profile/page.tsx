"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Package, Truck, Heart, Wallet, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { apiGetOrders } from "@/lib/auth-api";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderBadge } from "@/components/profile/order-badge";
import { WishlistCount } from "@/components/profile/wishlist-count";
import type { Order } from "@/types";

export default function ProfileDashboard() {
  const token = useAuthStore((s) => s.token);
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    (async () => {
      setOrders(await apiGetOrders(token));
      setLoading(false);
    })();
  }, [token]);

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const active = orders.filter((o) => !["Delivered", "Cancelled", "Returned"].includes(o.status));

  // "In Transit" and "Total Spent" are internal metrics — visible to admins only.
  const stats = [
    { icon: Package, label: "Total Orders", value: orders.length as React.ReactNode },
    ...(isAdmin ? [{ icon: Truck, label: "In Transit", value: active.length as React.ReactNode }] : []),
    { icon: Heart, label: "Wishlist Items", value: (<WishlistCount />) as React.ReactNode },
    ...(isAdmin
      ? [{ icon: Wallet, label: "Total Spent", value: formatPrice(totalSpent) as React.ReactNode }]
      : []),
  ];

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="animate-spin text-accent-dark" size={28} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className={`grid grid-cols-2 gap-4 ${isAdmin ? "lg:grid-cols-4" : ""}`}>
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl border border-line p-5">
            <Icon size={20} className="text-accent-dark" />
            <p className="mt-3 text-2xl font-medium">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Recent Orders</h2>
          <Link href="/profile/orders" className="text-sm text-muted hover:text-ink">
            View all →
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="rounded-2xl border border-line p-5 text-sm text-muted">
            No orders yet. When you place an order, it will show up here.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-line rounded-2xl border border-line">
            {orders.slice(0, 3).map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium">{o.orderNumber}</p>
                  <p className="text-xs text-muted">
                    {formatDate(o.date)} · {o.items.length} item{o.items.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden text-sm font-medium sm:block">{formatPrice(o.total)}</span>
                  <OrderBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
