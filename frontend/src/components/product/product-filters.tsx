"use client";

import { X } from "lucide-react";
import { useCategories, useAttributes } from "@/hooks/use-catalog";
import { cn } from "@/lib/utils";

export interface Filters {
  categories: string[];
  sizes: string[];
  colors: string[];
  fabrics: string[];
  maxPrice: number;
  inStock: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  categories: [],
  sizes: [],
  colors: [],
  fabrics: [],
  maxPrice: 5000,
  inStock: false,
};

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function ProductFilters({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const { data: categories } = useCategories();
  const { data: attributes } = useAttributes();
  const { fabrics: FABRICS, sizes: SIZES, colors: COLORS } = attributes;

  return (
    <div className="flex flex-col gap-7">
      <FilterGroup title="Category">
        {categories.map((c) => (
          <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm text-muted hover:text-ink">
            <input
              type="checkbox"
              checked={filters.categories.includes(c.slug)}
              onChange={() => set({ categories: toggle(filters.categories, c.slug) })}
              className="accent-ink"
            />
            {c.name}
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title="Price">
        <input
          type="range"
          min={499}
          max={5000}
          step={100}
          value={filters.maxPrice}
          onChange={(e) => set({ maxPrice: Number(e.target.value) })}
          className="w-full accent-ink"
        />
        <p className="text-sm text-muted">Up to ₹{filters.maxPrice.toLocaleString("en-IN")}</p>
      </FilterGroup>

      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => set({ sizes: toggle(filters.sizes, s) })}
              className={cn(
                "flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-xs",
                filters.sizes.includes(s) ? "border-ink bg-ink text-background" : "border-line"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Colour">
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((c) => (
            <button
              key={c.name}
              title={c.name}
              onClick={() => set({ colors: toggle(filters.colors, c.name) })}
              className={cn(
                "h-7 w-7 rounded-full border transition",
                filters.colors.includes(c.name)
                  ? "ring-2 ring-ink ring-offset-2"
                  : "border-line"
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Fabric">
        {FABRICS.map((f) => (
          <label key={f} className="flex cursor-pointer items-center gap-2 text-sm text-muted hover:text-ink">
            <input
              type="checkbox"
              checked={filters.fabrics.includes(f)}
              onChange={() => set({ fabrics: toggle(filters.fabrics, f) })}
              className="accent-ink"
            />
            {f}
          </label>
        ))}
      </FilterGroup>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={filters.inStock}
          onChange={(e) => set({ inStock: e.target.checked })}
          className="accent-ink"
        />
        In stock only
      </label>

      <button
        onClick={() => onChange(DEFAULT_FILTERS)}
        className="flex items-center gap-1.5 self-start text-sm text-muted hover:text-ink"
      >
        <X size={14} /> Clear all filters
      </button>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-line pb-6 last:border-0">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
