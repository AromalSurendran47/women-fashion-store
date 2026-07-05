"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Search, X } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useProducts } from "@/hooks/use-catalog";
import { formatPrice } from "@/lib/utils";

const TRENDING = ["Linen dress", "Kurti", "Co-ord set", "Saree", "Blazer"];

export function SearchModal() {
  const { searchOpen, closeSearch, query, setQuery } = useUIStore();
  const { data: products } = useProducts();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query, products]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={closeSearch} />
      <div className="animate-fade-up relative mx-auto mt-0 w-full bg-background p-5 shadow-2xl md:mt-0">
        <div className="container-wide">
          <div className="flex items-center gap-3 border-b border-line pb-4">
            <Search size={20} className="text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for dresses, kurtis, sarees…"
              className="h-8 flex-1 bg-transparent text-lg outline-none placeholder:text-muted"
            />
            <button aria-label="Close search" onClick={closeSearch}>
              <X size={22} />
            </button>
          </div>

          {query.trim() === "" ? (
            <div className="py-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Trending searches
              </p>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map((t) => (
                  <button
                    key={t}
                    onClick={() => setQuery(t)}
                    className="rounded-full border border-line px-4 py-2 text-sm hover:border-ink"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              No results for “{query}”. Try another search.
            </p>
          ) : (
            <div className="grid gap-2 py-5 md:grid-cols-2">
              {results.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  onClick={closeSearch}
                  className="flex items-center gap-4 rounded-xl p-2 hover:bg-secondary"
                >
                  <div className="relative h-16 w-14 overflow-hidden rounded-lg bg-secondary">
                    <Image src={p.thumbnail} alt={p.name} fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted">{p.categoryName}</p>
                    <p className="text-sm">{formatPrice(p.discountPrice)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
