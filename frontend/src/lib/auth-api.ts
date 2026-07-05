import type { AuthUser, Product } from "@/types";

/** Shape the admin product form sends to the backend (create/update). */
export interface ProductInput {
  name: string;
  category: string; // category slug
  price: number;
  discountPrice?: number;
  stock?: number;
  sku?: string;
  brand?: string;
  fabric?: string;
  fit?: string;
  occasion?: string;
  description?: string;
  shortDescription?: string;
  thumbnail: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  trending?: boolean;
  flashSale?: boolean;
}

const BASE = process.env.NEXT_PUBLIC_API_URL;

export type AuthResult =
  | { ok: true; token: string; user: AuthUser }
  | { ok: false; error: string };

const NO_API =
  "Auth server is not configured. Set NEXT_PUBLIC_API_URL and start the backend (npm run dev in /backend).";

async function postAuth(path: string, body: unknown): Promise<AuthResult> {
  if (!BASE) return { ok: false, error: NO_API };
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error || "Something went wrong. Please try again." };
    return { ok: true, token: data.token, user: data.user };
  } catch {
    return { ok: false, error: "Cannot reach the server. Is the backend running?" };
  }
}

export function apiLogin(email: string, password: string) {
  return postAuth("/auth/login", { email, password });
}

export function apiRegister(input: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}) {
  return postAuth("/auth/register", input);
}

/** Fetch the current user from a token (used to validate/refresh a session). */
export async function apiMe(token: string): Promise<AuthUser | null> {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return (await res.json()).user as AuthUser;
  } catch {
    return null;
  }
}

/** Authenticated GET helper for admin/account calls. */
export async function apiGetAuthed<T>(path: string, token: string, fallback: T): Promise<T> {
  if (!BASE) return fallback;
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

/** Authenticated write helper (PUT/DELETE). */
export type WriteResult<T = any> = { ok: true; data: T } | { ok: false; error: string };

async function sendAuthed<T>(
  path: string,
  method: "PUT" | "DELETE" | "POST",
  token: string,
  body?: unknown
): Promise<WriteResult<T>> {
  if (!BASE) return { ok: false, error: NO_API };
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error || "Something went wrong. Please try again." };
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, error: "Cannot reach the server. Is the backend running?" };
  }
}

export function apiUpdateProfile(
  token: string,
  input: { name?: string; phone?: string; email?: string }
) {
  return sendAuthed<{ user: AuthUser }>("/auth/me", "PUT", token, input);
}

export function apiChangePassword(
  token: string,
  input: { currentPassword: string; newPassword: string }
) {
  return sendAuthed<{ ok: true }>("/auth/password", "PUT", token, input);
}

export function apiDeleteAccount(token: string) {
  return sendAuthed<{ ok: true }>("/auth/me", "DELETE", token);
}

/* --------------------------- Admin: product CRUD --------------------------- */

/** Create a product (admin). Returns the created product on success. */
export function apiCreateProduct(token: string, input: ProductInput) {
  return sendAuthed<Product>("/products", "POST", token, input);
}

/** Update a product by id (admin). Returns the updated product. */
export function apiUpdateProduct(token: string, id: string, input: Partial<ProductInput>) {
  return sendAuthed<Product>(`/products/${id}`, "PUT", token, input);
}

/** Delete a product by id (admin). */
export function apiDeleteProduct(token: string, id: string) {
  return sendAuthed<{ ok: true; id: string }>(`/products/${id}`, "DELETE", token);
}

/** Upload an image file to S3 via the backend (admin). Returns the public URL. */
export async function apiUploadImage(
  token: string,
  file: File
): Promise<WriteResult<{ url: string }>> {
  if (!BASE) return { ok: false, error: NO_API };
  try {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${BASE}/admin/upload`, {
      method: "POST",
      // Do NOT set Content-Type — the browser adds the multipart boundary itself.
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error || "Upload failed. Please try again." };
    return { ok: true, data: data as { url: string } };
  } catch {
    return { ok: false, error: "Cannot reach the server. Is the backend running?" };
  }
}
