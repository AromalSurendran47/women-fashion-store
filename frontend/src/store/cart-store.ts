"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, Product, Size } from "@/types";

interface CartState {
  items: CartLine[];
  addItem: (product: Product, opts?: { color?: string; size?: Size; quantity?: number }) => void;
  removeItem: (productId: string, color: string, size: Size) => void;
  updateQuantity: (productId: string, color: string, size: Size, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

const sameLine = (l: CartLine, productId: string, color: string, size: Size) =>
  l.productId === productId && l.color === color && l.size === size;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, opts) => {
        const color = opts?.color ?? product.colors[0]?.name ?? "Default";
        const size = opts?.size ?? product.sizes[0] ?? "M";
        const quantity = opts?.quantity ?? 1;

        set((state) => {
          const existing = state.items.find((l) => sameLine(l, product.id, color, size));
          if (existing) {
            return {
              items: state.items.map((l) =>
                sameLine(l, product.id, color, size)
                  ? { ...l, quantity: l.quantity + quantity }
                  : l
              ),
            };
          }
          const line: CartLine = {
            productId: product.id,
            name: product.name,
            slug: product.slug,
            thumbnail: product.thumbnail,
            price: product.discountPrice,
            color,
            size,
            quantity,
          };
          return { items: [...state.items, line] };
        });
      },

      removeItem: (productId, color, size) =>
        set((state) => ({
          items: state.items.filter((l) => !sameLine(l, productId, color, size)),
        })),

      updateQuantity: (productId, color, size, quantity) =>
        set((state) => ({
          items: state.items
            .map((l) =>
              sameLine(l, productId, color, size)
                ? { ...l, quantity: Math.max(1, quantity) }
                : l
            )
            .filter((l) => l.quantity > 0),
        })),

      clear: () => set({ items: [] }),

      totalItems: () => get().items.reduce((n, l) => n + l.quantity, 0),
      subtotal: () => get().items.reduce((s, l) => s + l.price * l.quantity, 0),
    }),
    { name: "aura-cart" }
  )
);
