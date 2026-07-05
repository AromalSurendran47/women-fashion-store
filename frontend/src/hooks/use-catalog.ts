"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/api";
import { products as localProducts } from "@/data/products";
import type { Product } from "@/types";

/**
 * Client-side product list via React Query.
 * Falls back to bundled dummy data instantly (initialData) and refetches from
 * the API in the background when it's available.
 */
export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => getProducts(),
    initialData: localProducts,
  });
}

export function useProductById(id: string) {
  const { data } = useProducts();
  return data.find((p) => p.id === id);
}
