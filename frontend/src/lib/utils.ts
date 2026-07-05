import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Indian Rupees. */
export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Deterministic pseudo-random generator (mulberry32).
 * Used to build dummy data at module load so the SAME values are produced on
 * the server and the client — no hydration mismatches.
 */
export function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickAt<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length];
}

/** Deterministic ISO-ish date string N days before a fixed reference date. */
export function daysAgo(days: number) {
  const ref = new Date("2026-07-01T10:00:00Z").getTime();
  return new Date(ref - days * 86_400_000).toISOString();
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}
