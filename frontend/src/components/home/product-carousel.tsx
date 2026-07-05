"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types";
import { SectionTitle } from "@/components/ui/section-title";
import { ProductCard } from "@/components/common/product-card";

/**
 * Horizontal, scroll-snapping product rail with arrow controls.
 * Lightweight (native scroll) — no carousel dependency needed.
 */
export function ProductCarousel({
  eyebrow,
  title,
  description,
  href,
  products,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  products: Product[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <section className="container-wide py-14 md:py-20">
      <div className="flex items-end justify-between gap-4">
        <SectionTitle
          eyebrow={eyebrow}
          title={title}
          description={description}
          href={href}
          align="left"
          className="mb-6 flex-1"
        />
        <div className="mb-6 hidden gap-2 md:flex">
          <button
            aria-label="Scroll left"
            onClick={() => scroll(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line hover:border-ink"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="Scroll right"
            onClick={() => scroll(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line hover:border-ink"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="w-[46%] shrink-0 snap-start sm:w-[38%] md:w-[30%] lg:w-[23%]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
