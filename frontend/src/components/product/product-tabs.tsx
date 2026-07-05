"use client";

import Image from "next/image";
import { useState } from "react";
import { CheckCircle2, ThumbsUp } from "lucide-react";
import type { Product, Review } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";

const TABS = ["Description", "Specifications", "Reviews"] as const;
type Tab = (typeof TABS)[number];

export function ProductTabs({ product, reviews }: { product: Product; reviews: Review[] }) {
  const [tab, setTab] = useState<Tab>("Description");

  return (
    <div className="mt-16">
      <div className="flex gap-6 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "relative pb-3 text-sm font-medium transition-colors",
              tab === t ? "text-ink" : "text-muted hover:text-ink"
            )}
          >
            {t}
            {t === "Reviews" && ` (${reviews.length})`}
            {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-ink" />}
          </button>
        ))}
      </div>

      <div className="py-8">
        {tab === "Description" && (
          <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
            <p>{product.description}</p>
            <div>
              <h4 className="mb-2 font-medium text-ink">Care instructions</h4>
              <ul className="space-y-1">
                {product.careInstructions.map((c) => (
                  <li key={c} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-accent-dark" /> {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === "Specifications" && (
          <dl className="grid max-w-2xl grid-cols-1 gap-y-3 text-sm sm:grid-cols-2">
            {[
              ["Brand", product.brand],
              ["Material", product.material],
              ["Fabric", product.fabric],
              ["Fit", product.fit],
              ["Category", product.categoryName],
              ["Available sizes", product.sizes.join(", ")],
              ["SKU", product.sku],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-line py-2 pr-6">
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {tab === "Reviews" && (
          <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-secondary p-6 text-center lg:h-fit">
              <span className="font-heading text-5xl font-semibold">{product.rating.toFixed(1)}</span>
              <Rating value={product.rating} />
              <p className="text-sm text-muted">Based on {product.reviewCount} reviews</p>
            </div>
            <div className="flex flex-col divide-y divide-line">
              {reviews.length === 0 && (
                <p className="text-sm text-muted">No reviews yet. Be the first!</p>
              )}
              {reviews.map((r) => (
                <article key={r.id} className="flex gap-4 py-5 first:pt-0">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-secondary">
                    <Image src={r.avatar} alt={r.userName} fill sizes="44px" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{r.userName}</span>
                      {r.verifiedPurchase && <Badge variant="light">Verified</Badge>}
                      <span className="text-xs text-muted">{formatDate(r.date)}</span>
                    </div>
                    <Rating value={r.rating} size={12} />
                    <h4 className="text-sm font-medium">{r.title}</h4>
                    <p className="text-sm text-muted">{r.comment}</p>
                    <button className="mt-1 flex items-center gap-1.5 text-xs text-muted hover:text-ink">
                      <ThumbsUp size={12} /> Helpful ({r.helpfulCount})
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
