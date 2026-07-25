"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import { useMounted } from "@/hooks/use-mounted";

export function ProductCard({ product }: { product: Product }) {
  const mounted = useMounted();
  const wished = useWishlistStore((s) => s.ids.includes(product.id));
  const toggleWish = useWishlistStore((s) => s.toggle);
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="group relative flex flex-col">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-xl bg-secondary"
      >
        <Image
          src={product.thumbnail}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="zoom-img object-cover"
        />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && <Badge variant="new">New</Badge>}
          {product.discountPercentage > 0 && (
            <Badge variant="sale">-{product.discountPercentage}%</Badge>
          )}
        </div>

        {/* Quick add (desktop hover) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            addItem(product);
          }}
          className="absolute inset-x-3 bottom-3 hidden translate-y-2 items-center justify-center gap-2 rounded-full bg-ink py-3 text-xs font-medium text-background opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:flex"
        >
          <ShoppingBag size={15} /> Quick Add
        </button>
      </Link>

      {/* Wishlist toggle */}
      <button
        type="button"
        aria-label="Toggle wishlist"
        onClick={() => toggleWish(product.id)}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-ink shadow-sm backdrop-blur transition-colors hover:bg-background"
      >
        <Heart
          size={16}
          className={cn(mounted && wished && "fill-sale text-sale")}
        />
      </button>

      {/* Info */}
      <div className="mt-3 flex flex-col gap-1">
        <span className="text-[11px] uppercase tracking-wider text-muted">
          {product.categoryName}
        </span>
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-1 text-sm font-medium text-ink hover:text-accent-dark"
        >
          {product.name}
        </Link>
        <Rating value={product.rating} count={product.reviewCount} size={12} />
        <Price
          price={product.price}
          discountPrice={product.discountPrice}
          discountPercentage={product.discountPercentage}
          size="sm"
          className="mt-0.5"
        />
      </div>
    </div>
  );
}
