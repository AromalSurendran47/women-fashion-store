"use client";

import { useEffect, useState } from "react";

/**
 * Returns true after the component has mounted on the client.
 * Use to guard against hydration mismatches when rendering values that come
 * from client-only stores (e.g. persisted cart/wishlist counts).
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
