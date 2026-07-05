import Link from "next/link";
import { Package, Truck, Heart, Wallet } from "lucide-react";
import { orders } from "@/data/orders";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderBadge } from "@/components/profile/order-badge";

export default function ProfileDashboard() {
  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const active = orders.filter((o) => !["Delivered", "Cancelled", "Returned"].includes(o.status));

  const stats = [
    { icon: Package, label: "Total Orders", value: orders.length },
    { icon: Truck, label: "In Transit", value: active.length },
    { icon: Heart, label: "Wishlist Items", value: 4 },
    { icon: Wallet, label: "Total Spent", value: formatPrice(totalSpent) },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
      </div>
    </div>
  );
}
