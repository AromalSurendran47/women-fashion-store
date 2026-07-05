"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { CreditCard, Truck, Wallet, Banknote, Lock } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatPrice, cn } from "@/lib/utils";
import { STORE } from "@/lib/constants";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

const PAYMENTS = [
  { id: "razorpay", label: "Razorpay (UPI / Cards)", icon: Wallet },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "cod", label: "Cash on Delivery", icon: Banknote },
];

const inputCls =
  "h-12 w-full rounded-xl border border-line bg-background px-4 text-sm outline-none focus:border-ink";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCartStore();
  const [payment, setPayment] = useState("razorpay");
  const [billingSame, setBillingSame] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>();

  const subtotal = items.reduce((s, l) => s + l.price * l.quantity, 0);
  const shipping = subtotal >= STORE.freeShippingThreshold ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  const onSubmit = () => {
    const orderNumber = `SRUVALLE${Math.floor(100000 + subtotal + items.length * 37)}`;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("aura-last-order", JSON.stringify({ orderNumber, total, payment }));
    }
    clear();
    router.push("/checkout/success");
  };

  if (items.length === 0) {
    return (
      <div className="container-wide py-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Checkout" }]} />
        <EmptyState
          icon={ShoppingBag}
          title="Nothing to check out"
          description="Your cart is empty. Add a few pieces and come back."
          ctaLabel="Shop Now"
          ctaHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="container-wide py-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="mb-8 mt-4 text-3xl font-medium md:text-4xl">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-8">
          {/* Shipping */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-medium">
              <Truck size={18} /> Shipping Address
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Field className="col-span-2" label="Full name" error={errors.fullName?.message}>
                <input className={inputCls} {...register("fullName", { required: "Required" })} />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <input type="email" className={inputCls} {...register("email", { required: "Required" })} />
              </Field>
              <Field label="Phone" error={errors.phone?.message}>
                <input className={inputCls} {...register("phone", { required: "Required" })} />
              </Field>
              <Field className="col-span-2" label="Address line 1" error={errors.line1?.message}>
                <input className={inputCls} {...register("line1", { required: "Required" })} />
              </Field>
              <Field className="col-span-2" label="Address line 2 (optional)">
                <input className={inputCls} {...register("line2")} />
              </Field>
              <Field label="City" error={errors.city?.message}>
                <input className={inputCls} {...register("city", { required: "Required" })} />
              </Field>
              <Field label="State" error={errors.state?.message}>
                <input className={inputCls} {...register("state", { required: "Required" })} />
              </Field>
              <Field label="Pincode" error={errors.pincode?.message}>
                <input className={inputCls} {...register("pincode", { required: "Required" })} />
              </Field>
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={billingSame}
                onChange={(e) => setBillingSame(e.target.checked)}
                className="accent-ink"
              />
              Billing address same as shipping
            </label>
          </section>

          {/* Payment */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-medium">
              <CreditCard size={18} /> Payment Method
            </h2>
            <div className="flex flex-col gap-3">
              {PAYMENTS.map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setPayment(id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-4 text-left text-sm",
                    payment === id ? "border-ink bg-secondary" : "border-line"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border",
                      payment === id ? "border-ink" : "border-muted"
                    )}
                  >
                    {payment === id && <span className="h-2 w-2 rounded-full bg-ink" />}
                  </span>
                  <Icon size={18} /> {label}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Order summary */}
        <div className="h-fit rounded-2xl border border-line bg-secondary/50 p-6 lg:sticky lg:top-24">
          <h2 className="mb-5 text-lg font-medium">Your Order</h2>
          <div className="mb-4 flex max-h-64 flex-col gap-3 overflow-y-auto">
            {items.map((l) => (
              <div key={`${l.productId}-${l.color}-${l.size}`} className="flex gap-3">
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-background">
                  <Image src={l.thumbnail} alt={l.name} fill sizes="48px" className="object-cover" />
                </div>
                <div className="flex-1 text-sm">
                  <p className="line-clamp-1 font-medium">{l.name}</p>
                  <p className="text-xs text-muted">
                    {l.color} · {l.size} · Qty {l.quantity}
                  </p>
                </div>
                <span className="text-sm">{formatPrice(l.price * l.quantity)}</span>
              </div>
            ))}
          </div>
          <dl className="space-y-2 border-t border-line py-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Tax (5% GST)</dt><dd>{formatPrice(tax)}</dd></div>
          </dl>
          <div className="flex justify-between border-t border-line pt-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Button type="submit" block className="mt-6 h-12">
            <Lock size={15} /> Place Order
          </Button>
          <p className="mt-3 text-center text-xs text-muted">
            Secured by Razorpay · This is a demo — no payment is taken.
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-medium text-muted">{label}</label>
      {children}
      {error && <span className="text-xs text-sale">{error}</span>}
    </div>
  );
}
