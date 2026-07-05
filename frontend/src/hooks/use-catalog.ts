"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts, getCategories, getFaqs, getAttributes, ATTRIBUTES_FALLBACK } from "@/lib/api";
import type { Product, Category, Faq, Attributes } from "@/types";

/**
 * Client-side data via React Query. Everything comes from the backend API —
 * there is no bundled fallback.
 *
 * `initialData: []` keeps `data` a stable array while the fetch is in flight, so
 * consumers can safely call `.filter` / `.find` / `.map` without guarding.
 * `initialDataUpdatedAt: 0` marks that empty seed as stale (fetched at epoch 0),
 * so — despite the global 60s `staleTime` — React Query still fetches the real
 * data from the backend immediately on mount instead of showing an empty list.
 */
export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => getProducts(),
    initialData: [],
    initialDataUpdatedAt: 0,
  });
}

export function useProductById(id: string) {
  const { data } = useProducts();
  return data.find((p) => p.id === id);
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    initialData: [],
    initialDataUpdatedAt: 0,
  });
}

export function useFaqs() {
  return useQuery<Faq[]>({
    queryKey: ["faqs"],
    queryFn: () => getFaqs(),
    initialData: [],
    initialDataUpdatedAt: 0,
  });
}

export function useAttributes() {
  return useQuery<Attributes>({
    queryKey: ["attributes"],
    queryFn: () => getAttributes(),
    initialData: ATTRIBUTES_FALLBACK,
    initialDataUpdatedAt: 0,
  });
}
