"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/common/product-card";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function FlashSale({ products }: { products: Product[] }) {
  // Counts down to the next midnight; starts as null to avoid hydration mismatch.
  const [left, setLeft] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      const diff = Math.max(0, end.getTime() - now.getTime());
      setLeft({
        h: Math.floor(diff / 3.6e6),
        m: Math.floor((diff % 3.6e6) / 6e4),
        s: Math.floor((diff % 6e4) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="bg-secondary py-14 md:py-20">
      <div className="container-wide">
        <div className="mb-8 flex flex-col items-center gap-4 text-center md:mb-12">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sale">
            <Zap size={14} className="fill-sale" /> Limited Time
          </span>
          <h2 className="text-3xl font-medium md:text-4xl">Flash Sale</h2>
          <div className="flex items-center gap-2">
            {(["h", "m", "s"] as const).map((k, i) => (
              <span key={k} className="flex items-center gap-2">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-ink font-heading text-lg font-semibold text-background">
                  {left ? pad(left[k]) : "00"}
                </span>
                {i < 2 && <span className="text-lg font-semibold">:</span>}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
