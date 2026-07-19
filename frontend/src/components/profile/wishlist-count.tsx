"use client";

import { useWishlistStore } from "@/store/wishlist-store";
import { useMounted } from "@/hooks/use-mounted";

/** Live wishlist item count (client-side) for the profile dashboard stats. */
export function WishlistCount() {
  const mounted = useMounted();
  const count = useWishlistStore((s) => s.ids.length);
  return <>{mounted ? count : 0}</>;
}
