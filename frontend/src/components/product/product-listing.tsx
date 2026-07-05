"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, LayoutGrid, List, X, ChevronDown } from "lucide-react";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS, type SortValue } from "@/lib/constants";
import { ProductCard } from "@/components/common/product-card";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { ProductFilters, DEFAULT_FILTERS, type Filters } from "./product-filters";
import Image from "next/image";
import Link from "next/link";

const PAGE_SIZE = 12;

export function ProductListing({
  products,
  initialFilters,
}: {
  products: Product[];
  initialFilters?: Partial<Filters>;
}) {
  // The price slider must reach the most expensive product, otherwise items
  // above the (previously hard-coded ₹5,000) ceiling are silently filtered out.
  const priceCeiling = useMemo(() => {
    const max = products.reduce((m, p) => Math.max(m, p.discountPrice), 0);
    return Math.max(5000, Math.ceil(max / 500) * 500);
  }, [products]);

  const [filters, setFilters] = useState<Filters>(() => ({
    ...DEFAULT_FILTERS,
    maxPrice: priceCeiling,
    ...initialFilters,
  }));
  const [sort, setSort] = useState<SortValue>("featured");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    const list = products.filter((p) => {
      if (filters.categories.length && !filters.categories.includes(p.category)) return false;
      if (filters.sizes.length && !filters.sizes.some((s) => p.sizes.includes(s as never)))
        return false;
      // Colour: show only products that have one of the selected colours.
      if (filters.colors.length && !p.colors.some((pc) => filters.colors.includes(pc.name)))
        return false;
      if (filters.fabrics.length && !filters.fabrics.includes(p.fabric)) return false;
      if (p.discountPrice > filters.maxPrice) return false;
      if (filters.inStock && p.stock <= 0) return false;
      return true;
    });

    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.discountPrice - b.discountPrice);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.discountPrice - a.discountPrice);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        sorted.sort((a, b) => {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tb - ta;
        });
        break;
      default:
        sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return sorted;
  }, [products, filters, sort]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  const update = (f: Filters) => {
    setFilters(f);
    setPage(1);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <ProductFilters filters={filters} onChange={update} priceCeiling={priceCeiling} />
        </div>
      </aside>

      <div>
        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between gap-3 border-b border-line pb-4">
          <button
            onClick={() => setMobileFilters(true)}
            className="flex items-center gap-2 text-sm font-medium lg:hidden"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
          <p className="hidden text-sm text-muted lg:block">{filtered.length} products</p>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortValue)}
                className="appearance-none rounded-full border border-line bg-background py-2 pl-4 pr-9 text-sm outline-none focus:border-ink"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <div className="hidden items-center rounded-full border border-line md:flex">
              <button
                aria-label="Grid view"
                onClick={() => setView("grid")}
                className={cn("flex h-9 w-9 items-center justify-center rounded-full", view === "grid" && "bg-ink text-background")}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                aria-label="List view"
                onClick={() => setView("list")}
                className={cn("flex h-9 w-9 items-center justify-center rounded-full", view === "list" && "bg-ink text-background")}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="py-20 text-center text-muted">No products match your filters.</p>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {visible.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`} className="flex gap-5 py-5">
                <div className="relative h-40 w-32 shrink-0 overflow-hidden rounded-xl bg-secondary">
                  <Image src={p.thumbnail} alt={p.name} fill sizes="128px" className="object-cover" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-wider text-muted">{p.categoryName}</span>
                  <h3 className="font-medium">{p.name}</h3>
                  <Rating value={p.rating} count={p.reviewCount} size={12} />
                  <p className="line-clamp-2 max-w-xl text-sm text-muted">{p.shortDescription}</p>
                  <Price price={p.price} discountPrice={p.discountPrice} discountPercentage={p.discountPercentage} className="mt-1" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full border border-ink px-8 py-3 text-sm font-medium transition-colors hover:bg-ink hover:text-background"
            >
              Load more
            </button>
          </div>
        )}
      </div>

      {/* Mobile filter drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileFilters(false)} />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">Filters</h2>
              <button aria-label="Close filters" onClick={() => setMobileFilters(false)}>
                <X size={22} />
              </button>
            </div>
            <ProductFilters filters={filters} onChange={update} priceCeiling={priceCeiling} />
            <button
              onClick={() => setMobileFilters(false)}
              className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-medium text-background"
            >
              Show {filtered.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
