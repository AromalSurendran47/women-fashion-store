"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, Heart, User, ShoppingBag, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants";
import { useCategories } from "@/hooks/use-catalog";
import { useUIStore } from "@/store/ui-store";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useAuthStore } from "@/store/auth-store";
import { useMounted } from "@/hooks/use-mounted";
import { SearchModal } from "./search-modal";
import { MobileDrawer } from "./mobile-drawer";
import { CartDrawer } from "./cart-drawer";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-background">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const mounted = useMounted();

  const { data: categories } = useCategories();
  const { openSearch, openDrawer, openCart } = useUIStore();
  const cartCount = useCartStore((s) => s.items.reduce((n, l) => n + l.quantity, 0));
  const wishCount = useWishlistStore((s) => s.ids.length);
  const authToken = useAuthStore((s) => s.token);
  const accountHref = mounted && authToken ? "/profile" : "/login";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-all duration-300",
          scrolled ? "border-line bg-background/95 backdrop-blur" : "border-transparent bg-background"
        )}
      >
        <div className="container-wide flex h-16 items-center justify-between gap-4 md:h-20">
          {/* Left: mobile menu + nav */}
          <div className="flex items-center gap-2">
            <button
              className="md:hidden"
              aria-label="Open menu"
              onClick={openDrawer}
            >
              <Menu size={22} />
            </button>
          </div>

          {/* Logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-heading text-2xl font-semibold tracking-wide md:static md:left-0 md:translate-x-0"
          >
            SRUVALLE
          </Link>

          {/* Desktop nav with mega menu */}
          <nav className="hidden items-center gap-7 md:flex">
            <div
              className="group relative"
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <Link href="/collections" className="link-underline text-sm font-medium">
                Collections
              </Link>
              {menuOpen && (
                <div className="absolute left-1/2 top-full w-[560px] -translate-x-1/2 pt-5">
                  <div className="grid grid-cols-3 gap-x-6 gap-y-2 rounded-2xl border border-line bg-background p-6 shadow-xl">
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/collections/${c.slug}`}
                        className="rounded-lg px-2 py-1.5 text-sm text-muted transition-colors hover:bg-secondary hover:text-ink"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {NAV_LINKS.filter((l) => l.label !== "Collections").map((l) => (
              <Link key={l.href} href={l.href} className="link-underline text-sm font-medium">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right: actions */}
          <div className="flex items-center gap-4 md:gap-5">
            <button aria-label="Search" onClick={openSearch}>
              <Search size={20} />
            </button>
            <Link href="/wishlist" aria-label="Wishlist" className="relative hidden sm:block">
              <Heart size={20} />
              {mounted && <CountBadge count={wishCount} />}
            </Link>
            <Link href={accountHref} aria-label="Account" className="hidden sm:block">
              <User size={20} />
            </Link>
            <button aria-label="Cart" onClick={openCart} className="relative">
              <ShoppingBag size={20} />
              {mounted && <CountBadge count={cartCount} />}
            </button>
          </div>
        </div>
      </header>

      <SearchModal />
      <MobileDrawer />
      <CartDrawer />
    </>
  );
}
