"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, X } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import { useProducts } from "@/hooks/use-catalog";
import { useMounted } from "@/hooks/use-mounted";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { ProductCardSkeleton } from "@/components/ui/skeleton";

export default function WishlistPage() {
  const mounted = useMounted();
  const ids = useWishlistStore((s) => s.ids);
  const remove = useWishlistStore((s) => s.remove);
  const addItem = useCartStore((s) => s.addItem);
  const { data: products } = useProducts();

  const items = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  return (
    <div className="container-wide py-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
      <h1 className="mb-8 mt-4 text-3xl font-medium md:text-4xl">My Wishlist</h1>

      {!mounted ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save the pieces you love and find them all here."
          ctaLabel="Explore Products"
          ctaHref="/products"
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {items.map(
            (p) =>
              p && (
                <div key={p.id} className="group relative flex flex-col">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary">
                    <Link href={`/products/${p.slug}`}>
                      <Image src={p.thumbnail} alt={p.name} fill sizes="25vw" className="zoom-img object-cover" />
                    </Link>
                    <button
                      aria-label="Remove"
                      onClick={() => remove(p.id)}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 hover:bg-background"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-col gap-1">
                    <Link href={`/products/${p.slug}`} className="line-clamp-1 text-sm font-medium hover:text-accent-dark">
                      {p.name}
                    </Link>
                    <Rating value={p.rating} count={p.reviewCount} size={12} />
                    <Price price={p.price} discountPrice={p.discountPrice} discountPercentage={p.discountPercentage} size="sm" />
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        addItem(p);
                        remove(p.id);
                      }}
                    >
                      <ShoppingBag size={14} /> Move to Cart
                    </Button>
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}
