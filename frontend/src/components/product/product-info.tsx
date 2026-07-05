"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBag, Check, Truck, RefreshCw, ShieldCheck } from "lucide-react";
import type { Product, Size } from "@/types";
import { cn } from "@/lib/utils";
import { Rating } from "@/components/ui/rating";
import { Price } from "@/components/ui/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useUIStore } from "@/store/ui-store";
import { useMounted } from "@/hooks/use-mounted";

export function ProductInfo({ product }: { product: Product }) {
  const router = useRouter();
  const mounted = useMounted();
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [size, setSize] = useState<Size>(product.sizes[0] ?? "M");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);
  const wished = useWishlistStore((s) => s.ids.includes(product.id));
  const toggleWish = useWishlistStore((s) => s.toggle);

  const inStock = product.stock > 0;

  const add = (buyNow = false) => {
    addItem(product, { color, size, quantity: qty });
    if (buyNow) {
      router.push("/checkout");
    } else {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
      openCart();
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className="text-xs uppercase tracking-wider text-muted">{product.brand}</span>
        <h1 className="mt-1 text-2xl font-medium md:text-3xl">{product.name}</h1>
        <div className="mt-2 flex items-center gap-3">
          <Rating value={product.rating} count={product.reviewCount} />
          {inStock ? (
            <Badge variant="new">In Stock</Badge>
          ) : (
            <Badge variant="sale">Out of Stock</Badge>
          )}
        </div>
      </div>

      <Price
        price={product.price}
        discountPrice={product.discountPrice}
        discountPercentage={product.discountPercentage}
        size="lg"
      />

      <p className="text-sm leading-relaxed text-muted">{product.shortDescription}</p>

      {/* Colour */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          Colour: <span className="text-muted">{color}</span>
        </span>
        <div className="flex flex-wrap gap-2.5">
          {product.colors.map((c) => (
            <button
              key={c.name}
              title={c.name}
              onClick={() => setColor(c.name)}
              className={cn(
                "h-9 w-9 rounded-full border transition",
                color === c.name ? "ring-2 ring-ink ring-offset-2" : "border-line"
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Size</span>
          <button className="text-xs text-muted underline">Size guide</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={cn(
                "flex h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm",
                size === s ? "border-ink bg-ink text-background" : "border-line hover:border-ink"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity + actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-line">
          <button
            aria-label="Decrease"
            className="flex h-12 w-12 items-center justify-center"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center">{qty}</span>
          <button
            aria-label="Increase"
            className="flex h-12 w-12 items-center justify-center"
            onClick={() => setQty((q) => q + 1)}
          >
            <Plus size={16} />
          </button>
        </div>
        <Button
          onClick={() => add(false)}
          disabled={!inStock}
          className="h-12 flex-1"
        >
          {added ? (
            <>
              <Check size={16} /> Added
            </>
          ) : (
            <>
              <ShoppingBag size={16} /> Add to Cart
            </>
          )}
        </Button>
        <button
          aria-label="Wishlist"
          onClick={() => toggleWish(product.id)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-line hover:border-ink"
        >
          <Heart size={18} className={cn(mounted && wished && "fill-sale text-sale")} />
        </button>
      </div>

      <Button variant="outline" className="h-12" onClick={() => add(true)} disabled={!inStock}>
        Buy Now
      </Button>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-3 border-t border-line pt-5 text-center">
        {[
          { icon: Truck, text: "Free shipping over ₹1,499" },
          { icon: RefreshCw, text: "7-day easy returns" },
          { icon: ShieldCheck, text: "Secure checkout" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex flex-col items-center gap-2 text-xs text-muted">
            <Icon size={18} className="text-accent-dark" />
            {text}
          </div>
        ))}
      </div>

      {/* Meta */}
      <dl className="grid grid-cols-2 gap-y-2 border-t border-line pt-5 text-sm">
        <dt className="text-muted">Category</dt>
        <dd>{product.categoryName}</dd>
        <dt className="text-muted">SKU</dt>
        <dd>{product.sku}</dd>
        {product.fabric && (
          <>
            <dt className="text-muted">Fabric</dt>
            <dd>{product.fabric}</dd>
          </>
        )}
        {product.fit && (
          <>
            <dt className="text-muted">Fit</dt>
            <dd>{product.fit}</dd>
          </>
        )}
        {product.occasion && (
          <>
            <dt className="text-muted">Occasion</dt>
            <dd>{product.occasion}</dd>
          </>
        )}
      </dl>
    </div>
  );
}
