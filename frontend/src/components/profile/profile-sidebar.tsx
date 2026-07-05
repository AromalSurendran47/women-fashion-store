"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, MapPin, User, Heart, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const LINKS = [
  { href: "/profile", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile/orders", label: "Orders", icon: Package },
  { href: "/profile/addresses", label: "Addresses", icon: MapPin },
  { href: "/profile/account", label: "Account Details", icon: User },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
];

export function ProfileSidebar() {
  const pathname = usePathname();
  const { isAdmin, logout } = useAuth();

  return (
    <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
              active ? "bg-ink text-background" : "text-muted hover:bg-secondary hover:text-ink"
            )}
          >
            <Icon size={17} /> {label}
          </Link>
        );
      })}

      {isAdmin && (
        <Link
          href="/admin"
          className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-accent-dark hover:bg-secondary"
        >
          <Shield size={17} /> Admin Dashboard
        </Link>
      )}

      <button
        onClick={logout}
        className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-secondary hover:text-sale"
      >
        <LogOut size={17} /> Log Out
      </button>
    </nav>
  );
}
