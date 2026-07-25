"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Package, Truck, Home, MessageCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<{
    orderNumber: string;
    total: number;
    payment?: string;
    waUrl?: string;
  } | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("aura-last-order");
    if (raw) setOrder(JSON.parse(raw));
  }, []);

  const isCod = order?.payment === "cod";

  return (
    <div className="container-wide flex flex-col items-center py-16 text-center md:py-24">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700">
        <CheckCircle2 size={44} />
      </div>
      <h1 className="mt-6 text-3xl font-medium md:text-4xl">Thank you for your order!</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        Your order has been placed successfully. A confirmation has been sent to your email. We&apos;ll
        notify you when it ships.
      </p>

      <div className="mt-8 w-full max-w-md rounded-2xl border border-line bg-secondary/50 p-6 text-left">
        <div className="flex justify-between border-b border-line pb-3 text-sm">
          <span className="text-muted">Order number</span>
          <span className="font-medium">{order?.orderNumber ?? "SRUVALLE100000"}</span>
        </div>
        <div className="flex justify-between pt-3 text-sm">
          <span className="text-muted">{isCod ? "Amount payable (COD)" : "Amount paid"}</span>
          <span className="font-medium">{order ? formatPrice(order.total) : "—"}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-10 flex w-full max-w-md items-center justify-between">
        {[
          { icon: CheckCircle2, label: "Confirmed", done: true },
          { icon: Package, label: "Packed", done: false },
          { icon: Truck, label: "Shipped", done: false },
          { icon: Home, label: "Delivered", done: false },
        ].map((s, i) => (
          <div key={s.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                s.done ? "bg-ink text-background" : "bg-secondary text-muted"
              }`}
            >
              <s.icon size={18} />
            </div>
            <span className={`text-xs ${s.done ? "text-ink" : "text-muted"}`}>{s.label}</span>
            {i < 3 && <span className="sr-only">then</span>}
          </div>
        ))}
      </div>

      {order?.waUrl && (
        <a
          href={order.waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white hover:bg-[#1fb959]"
        >
          <MessageCircle size={16} /> Send order details on WhatsApp
        </a>
      )}

      <div className={order?.waUrl ? "mt-4 flex gap-3" : "mt-10 flex gap-3"}>
        <Link href="/profile/orders" className={buttonVariants({ variant: "outline" })}>
          View Orders
        </Link>
        <Link href="/products" className={buttonVariants()}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
