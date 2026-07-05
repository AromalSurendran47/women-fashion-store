"use client";

import Link from "next/link";
import { X, Heart, User } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { useCategories } from "@/hooks/use-catalog";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

export function MobileDrawer() {
  const { drawerOpen, closeDrawer } = useUIStore();
  const { data: categories } = useCategories();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-ink/40 transition-opacity md:hidden",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeDrawer}
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[82%] max-w-sm flex-col bg-background transition-transform duration-300 md:hidden",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <span className="font-heading text-xl font-semibold">SRUVALLE</span>
          <button aria-label="Close menu" onClick={closeDrawer}>
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={closeDrawer}
                className="rounded-lg px-2 py-2.5 text-base font-medium hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <p className="mb-2 mt-6 px-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Shop by category
          </p>
          <div className="flex flex-col gap-1">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/collections/${c.slug}`}
                onClick={closeDrawer}
                className="rounded-lg px-2 py-2 text-sm text-muted hover:bg-secondary hover:text-ink"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 border-t border-line px-5 py-4">
          <Link
            href="/wishlist"
            onClick={closeDrawer}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Heart size={18} /> Wishlist
          </Link>
          <Link
            href="/profile"
            onClick={closeDrawer}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <User size={18} /> Account
          </Link>
        </div>
      </aside>
    </>
  );
}
