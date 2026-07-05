"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { STORE } from "@/lib/constants";
import { validateCoupon } from "@/lib/api";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; amount: number } | null>(null);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);

  const subtotal = items.reduce((s, l) => s + l.price * l.quantity, 0);
  const discount = applied?.amount ?? 0;
  const shipping = subtotal - discount >= STORE.freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const tax = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + shipping + tax;

  const apply = async () => {
    if (!code.trim() || applying) return;
    setApplying(true);
    setError("");
    const result = await validateCoupon(code, subtotal);
    setApplying(false);
    if (!result.valid) {
      setApplied(null);
      return setError(result.message ?? "Invalid coupon code.");
    }
    setApplied({ code: result.code ?? code.trim().toUpperCase(), amount: result.discount ?? 0 });
    setError("");
  };

  if (items.length === 0) {
    return (
      <div className="container-wide py-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Let's fix that."
          ctaLabel="Continue Shopping"
          ctaHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="container-wide py-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <h1 className="mb-8 mt-4 text-3xl font-medium md:text-4xl">Shopping Cart</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="flex flex-col divide-y divide-line">
          {items.map((l) => (
            <div key={`${l.productId}-${l.color}-${l.size}`} className="flex gap-4 py-5 first:pt-0">
              <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
                <Image src={l.thumbnail} alt={l.name} fill sizes="96px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <Link href={`/products/${l.slug}`} className="font-medium hover:text-accent-dark">
                    {l.name}
                  </Link>
                  <span className="font-medium">{formatPrice(l.price * l.quantity)}</span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {l.color} · Size {l.size}
                </p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-line">
                    <button
                      className="flex h-9 w-9 items-center justify-center"
                      onClick={() => updateQuantity(l.productId, l.color, l.size, l.quantity - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm">{l.quantity}</span>
                    <button
                      className="flex h-9 w-9 items-center justify-center"
                      onClick={() => updateQuantity(l.productId, l.color, l.size, l.quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(l.productId, l.color, l.size)}
                    className="flex items-center gap-1.5 text-sm text-muted hover:text-sale"
                  >
                    <Trash2 size={15} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-line bg-secondary/50 p-6 lg:sticky lg:top-24">
          <h2 className="mb-5 text-lg font-medium">Order Summary</h2>

          <div className="mb-4">
            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-full border border-line bg-background px-4">
                <Tag size={15} className="text-muted" />
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Coupon code"
                  className="h-11 flex-1 bg-transparent text-sm outline-none"
                />
              </div>
              <button
                onClick={apply}
                disabled={applying}
                className="rounded-full bg-ink px-5 text-sm font-medium text-background disabled:opacity-60"
              >
                {applying ? "Applying…" : "Apply"}
              </button>
            </div>
            {error && <p className="mt-2 text-xs text-sale">{error}</p>}
            {applied && (
              <p className="mt-2 text-xs text-green-700">
                Coupon {applied.code} applied — you saved {formatPrice(applied.amount)}!
              </p>
            )}
            <p className="mt-2 text-xs text-muted">Try WELCOME10, FESTIVE20 or FLAT500.</p>
          </div>

          <dl className="space-y-3 border-t border-line py-4 text-sm">
            <Row label="Subtotal" value={formatPrice(subtotal)} />
            {discount > 0 && <Row label="Discount" value={`- ${formatPrice(discount)}`} accent />}
            <Row label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} />
            <Row label="Tax (5% GST)" value={formatPrice(tax)} />
          </dl>

          <div className="flex justify-between border-t border-line pt-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <Link href="/checkout" className={`${buttonVariants({ block: true })} mt-6`}>
            Proceed to Checkout <ArrowRight size={16} />
          </Link>
          <Link
            href="/products"
            className="mt-3 block text-center text-sm text-muted hover:text-ink"
          >
            or continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={accent ? "text-green-700" : ""}>{value}</dd>
    </div>
  );
}
