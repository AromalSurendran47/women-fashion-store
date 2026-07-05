"use client";

import { create } from "zustand";

/**
 * Ephemeral UI state (not persisted): search modal, mobile drawer, cart drawer
 * and the current search query.
 */
interface UIState {
  searchOpen: boolean;
  drawerOpen: boolean;
  cartOpen: boolean;
  query: string;
  openSearch: () => void;
  closeSearch: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  openCart: () => void;
  closeCart: () => void;
  setQuery: (q: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  searchOpen: false,
  drawerOpen: false,
  cartOpen: false,
  query: "",
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  setQuery: (query) => set({ query }),
}));
