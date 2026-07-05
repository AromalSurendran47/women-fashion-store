"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useCartStore } from "@/store/cart-store";
import { cn, formatPrice } from "@/lib/utils";
import { STORE } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";

export function CartDrawer() {
  const { cartOpen, closeCart } = useUIStore();
  const { items, updateQuantity, removeItem } = useCartStore();
  const subtotal = items.reduce((s, l) => s + l.price * l.quantity, 0);
  const remaining = Math.max(0, STORE.freeShippingThreshold - subtotal);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-ink/40 transition-opacity",
          cartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeCart}
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background transition-transform duration-300",
          cartOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-medium">
            Your Cart ({items.reduce((n, l) => n + l.quantity, 0)})
          </h2>
          <button aria-label="Close cart" onClick={closeCart}>
            <X size={22} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag size={40} className="text-accent-dark" />
            <p className="text-muted">Your cart is empty.</p>
            <Link href="/products" onClick={closeCart} className={buttonVariants()}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-line bg-secondary px-5 py-3 text-center text-xs">
              {remaining > 0 ? (
                <>
                  You&apos;re <span className="font-semibold">{formatPrice(remaining)}</span> away
                  from free shipping
                </>
              ) : (
                <span className="font-medium text-green-700">You&apos;ve unlocked free shipping! 🎉</span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.map((l) => (
                <div
                  key={`${l.productId}-${l.color}-${l.size}`}
                  className="flex gap-4 border-b border-line py-4 last:border-0"
                >
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                    <Image src={l.thumbnail} alt={l.name} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link
                        href={`/products/${l.slug}`}
                        onClick={closeCart}
                        className="line-clamp-1 text-sm font-medium hover:text-accent-dark"
                      >
                        {l.name}
                      </Link>
                      <button
                        aria-label="Remove"
                        onClick={() => removeItem(l.productId, l.color, l.size)}
                        className="text-muted hover:text-sale"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <p className="text-xs text-muted">
                      {l.color} · {l.size}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-line">
                        <button
                          className="flex h-7 w-7 items-center justify-center"
                          onClick={() => updateQuantity(l.productId, l.color, l.size, l.quantity - 1)}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-6 text-center text-sm">{l.quantity}</span>
                        <button
                          className="flex h-7 w-7 items-center justify-center"
                          onClick={() => updateQuantity(l.productId, l.color, l.size, l.quantity + 1)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <span className="text-sm font-medium">{formatPrice(l.price * l.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-line px-5 py-4">
              <div className="mb-3 flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/checkout" onClick={closeCart} className={buttonVariants({ block: true })}>
                  Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className={buttonVariants({ variant: "outline", block: true })}
                >
                  View Cart
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
