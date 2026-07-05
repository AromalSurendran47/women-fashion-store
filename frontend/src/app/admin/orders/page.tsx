"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, X, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuthStore } from "@/store/auth-store";
import { apiGetOrdersPage, apiUpdateOrder } from "@/lib/auth-api";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderBadge } from "@/components/profile/order-badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/store/toast-store";
import type { Order, OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
];
const PAYMENT_STATUSES = ["Pending", "Paid", "Failed", "Refunded"];
const PAGE_SIZE = 12;

export default function AdminOrdersPage() {
  return (
    <AuthGuard adminOnly>
      <OrdersManager />
    </AuthGuard>
  );
}

function OrdersManager() {
  const token = useAuthStore((s) => s.token);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [detail, setDetail] = useState<Order | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [status]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await apiGetOrdersPage(token, { page, limit: PAGE_SIZE, q: debounced, status });
    setOrders(res.orders);
    setPages(res.pages);
    setTotal(res.total);
    if (res.page > res.pages) setPage(res.pages);
    setLoading(false);
  }, [token, page, debounced, status]);

  useEffect(() => {
    load();
  }, [load]);

  // Apply an update, refresh the row locally, and keep the open detail in sync.
  const applyUpdate = async (
    order: Order,
    input: { status?: string; paymentStatus?: string; trackingNumber?: string },
    successMsg: string
  ) => {
    if (!token) return false;
    setSavingId(order.id);
    const res = await apiUpdateOrder(token, order.id, input);
    setSavingId(null);
    if (!res.ok) {
      toast.error(res.error);
      return false;
    }
    setOrders((list) => list.map((o) => (o.id === res.data.id ? res.data : o)));
    setDetail((d) => (d && d.id === res.data.id ? res.data : d));
    toast.success(successMsg);
    return true;
  };

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="container-wide py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium md:text-3xl">Manage Orders</h1>
          <p className="text-sm text-muted">{loading ? "Loading…" : `${total} orders`}</p>
        </div>
        <Link
          href="/admin"
          className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:border-ink"
        >
          <ArrowLeft size={15} /> Dashboard
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by order # or customer…"
          className="h-11 w-full max-w-sm rounded-full border border-line bg-background px-4 text-sm outline-none focus:border-ink"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-11 rounded-full border border-line bg-background px-4 text-sm outline-none focus:border-ink"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-accent-dark" size={28} />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-muted">{o.customerName || "—"}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(o.date)}</td>
                    <td className="px-4 py-3">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className="text-muted">{o.paymentMethod}</span>
                      <span
                        className={`ml-1.5 text-xs ${
                          o.paymentStatus === "Paid" ? "text-emerald-600" : "text-muted"
                        }`}
                      >
                        · {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={o.status}
                          disabled={savingId === o.id}
                          onChange={(e) =>
                            applyUpdate(o, { status: e.target.value }, `Order marked ${e.target.value}.`)
                          }
                          className="h-9 rounded-full border border-line bg-background px-3 text-xs outline-none focus:border-ink disabled:opacity-50"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {savingId === o.id && <Loader2 size={14} className="animate-spin text-muted" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          onClick={() => setDetail(o)}
                          aria-label={`View ${o.orderNumber}`}
                          className="flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-xs hover:border-ink"
                        >
                          <Eye size={14} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted">
                      No orders match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {total === 0 ? "No results" : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex h-9 items-center gap-1 rounded-full border border-line px-3 text-sm hover:border-ink disabled:opacity-40"
              >
                <ChevronLeft size={15} /> Prev
              </button>
              <span className="text-sm text-muted">
                Page {page} of {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="flex h-9 items-center gap-1 rounded-full border border-line px-3 text-sm hover:border-ink disabled:opacity-40"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </>
      )}

      {detail && (
        <OrderDetail
          order={detail}
          savingId={savingId}
          onClose={() => setDetail(null)}
          onUpdate={applyUpdate}
        />
      )}
    </div>
  );
}

function OrderDetail({
  order,
  savingId,
  onClose,
  onUpdate,
}: {
  order: Order;
  savingId: string | null;
  onClose: () => void;
  onUpdate: (
    order: Order,
    input: { status?: string; paymentStatus?: string; trackingNumber?: string },
    successMsg: string
  ) => Promise<boolean>;
}) {
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const busy = savingId === order.id;
  const addr = order.shippingAddress;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-background shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-background px-6 py-4">
          <div>
            <h2 className="text-lg font-medium">{order.orderNumber}</h2>
            <p className="text-xs text-muted">{formatDate(order.date)}</p>
          </div>
          <button aria-label="Close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-6 px-6 py-6">
          {/* Items */}
          <section className="flex flex-col gap-3">
            {order.items.map((it, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  {it.thumbnail && (
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
          </section>

          {/* Totals */}
          <dl className="space-y-1.5 border-t border-line pt-4 text-sm">
            <Row label="Subtotal" value={formatPrice(order.subtotal)} />
            {order.discount > 0 && <Row label="Discount" value={`− ${formatPrice(order.discount)}`} />}
            <Row label="Shipping" value={order.shipping === 0 ? "Free" : formatPrice(order.shipping)} />
            <Row label="Tax" value={formatPrice(order.tax)} />
            <div className="flex justify-between border-t border-line pt-2 font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </dl>

          {/* Shipping address */}
          {addr && (
            <section className="border-t border-line pt-4 text-sm">
              <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">
                Shipping to
              </h3>
              <p className="font-medium">{addr.fullName}</p>
              <p className="text-muted">{addr.phone}</p>
              <p className="text-muted">
                {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </section>
          )}

          {/* Manage */}
          <section className="flex flex-col gap-4 border-t border-line pt-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">Order status</span>
              <select
                value={order.status}
                disabled={busy}
                onChange={(e) => onUpdate(order, { status: e.target.value }, `Order marked ${e.target.value}.`)}
                className={selectCls}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">
                Payment ({order.paymentMethod})
              </span>
              <select
                value={order.paymentStatus ?? "Pending"}
                disabled={busy}
                onChange={(e) =>
                  onUpdate(order, { paymentStatus: e.target.value }, `Payment marked ${e.target.value}.`)
                }
                className={selectCls}
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">Tracking number</span>
              <div className="flex gap-2">
                <input
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="e.g. BLUEDART12345"
                  className="h-11 flex-1 rounded-xl border border-line bg-background px-3 text-sm outline-none focus:border-ink"
                />
                <Button
                  size="sm"
                  disabled={busy || tracking === (order.trackingNumber ?? "")}
                  onClick={() => onUpdate(order, { trackingNumber: tracking }, "Tracking number saved.")}
                >
                  {busy ? <Loader2 size={14} className="animate-spin" /> : "Save"}
                </Button>
              </div>
            </label>
          </section>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Current status</span>
            <OrderBadge status={order.status} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

const selectCls =
  "h-11 w-full rounded-xl border border-line bg-background px-3 text-sm outline-none focus:border-ink";
