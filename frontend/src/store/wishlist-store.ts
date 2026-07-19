"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "@/store/auth-store";
import {
  apiGetAuthed,
  apiAddToWishlist,
  apiRemoveFromWishlist,
  apiReplaceWishlist,
} from "@/lib/auth-api";

interface WishlistState {
  ids: string[];
  toggle: (productId: string) => void;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
  count: () => number;
  /** Merge the local list with the server's and push the union back. Call on login / app load. */
  syncWithServer: () => Promise<void>;
}

/** Mirror a single add/remove to the backend when signed in (fire-and-forget). */
function pushChange(productId: string, wished: boolean) {
  const token = useAuthStore.getState().token;
  if (!token) return;
  void (wished ? apiAddToWishlist(token, productId) : apiRemoveFromWishlist(token, productId));
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const wished = !get().ids.includes(id);
        set((s) => ({
          ids: wished ? [...s.ids, id] : s.ids.filter((x) => x !== id),
        }));
        pushChange(id, wished);
      },
      add: (id) => {
        if (get().ids.includes(id)) return;
        set((s) => ({ ids: [...s.ids, id] }));
        pushChange(id, true);
      },
      remove: (id) => {
        if (!get().ids.includes(id)) return;
        set((s) => ({ ids: s.ids.filter((x) => x !== id) }));
        pushChange(id, false);
      },
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
      count: () => get().ids.length,
      syncWithServer: async () => {
        const token = useAuthStore.getState().token;
        if (!token) return;
        // Null fallback distinguishes "unreachable/unauthorized" from a genuinely empty list,
        // so a failed fetch never overwrites the server copy with local-only data.
        const server = await apiGetAuthed<{ ids: string[] } | null>("/wishlist", token, null);
        if (!server) return;
        const merged = [...new Set([...server.ids, ...get().ids])];
        set({ ids: merged });
        if (merged.length !== server.ids.length) {
          const res = await apiReplaceWishlist(token, merged);
          // The server drops ids that no longer exist in the catalog; adopt its final list.
          if (res.ok) set({ ids: res.data.ids });
        }
      },
    }),
    { name: "aura-wishlist" }
  )
);
