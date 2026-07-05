import Image from "next/image";
import Link from "next/link";
import { getOrders } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderBadge } from "@/components/profile/order-badge";
import { buttonVariants } from "@/components/ui/button";

export default async function OrdersPage() {
  const orders = await getOrders();
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
                  <Image src={it.thumbnail} alt={it.name} fill sizes="48px" className="object-cover" />
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
