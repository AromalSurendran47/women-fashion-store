import type { AuthUser, Product, Order, Category } from "@/types";

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
  careInstructions?: string[];
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

/** Upload a profile photo (multipart). Returns the updated user. */
export async function apiUploadAvatar(
  token: string,
  file: File
): Promise<WriteResult<{ user: AuthUser }>> {
  if (!BASE) return { ok: false, error: NO_API };
  try {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${BASE}/auth/avatar`, {
      method: "POST",
      // Do NOT set Content-Type — the browser adds the multipart boundary itself.
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error || "Upload failed. Please try again." };
    return { ok: true, data: data as { user: AuthUser } };
  } catch {
    return { ok: false, error: "Cannot reach the server. Is the backend running?" };
  }
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

/* ------------------------------ Addresses ------------------------------ */

/** A saved address as returned by the backend. */
export interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

/** Shape the address form sends to the backend (create/update). */
export interface AddressInput {
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
}

type AddressList = { addresses: SavedAddress[] };

/** Fetch the signed-in user's saved addresses. */
export function apiGetAddresses(token: string) {
  return apiGetAuthed<AddressList | null>("/addresses", token, null);
}

/** Add a new address. Returns the full updated list. */
export function apiAddAddress(token: string, input: AddressInput) {
  return sendAuthed<AddressList>("/addresses", "POST", token, input);
}

/** Update an address by id. Returns the full updated list. */
export function apiUpdateAddress(token: string, id: string, input: AddressInput) {
  return sendAuthed<AddressList>(`/addresses/${id}`, "PUT", token, input);
}

/** Mark an address as the default. Returns the full updated list. */
export function apiSetDefaultAddress(token: string, id: string) {
  return sendAuthed<AddressList>(`/addresses/${id}/default`, "PUT", token);
}

/** Delete an address by id. Returns the full updated list. */
export function apiDeleteAddress(token: string, id: string) {
  return sendAuthed<AddressList>(`/addresses/${id}`, "DELETE", token);
}

/* ------------------------------- Wishlist ------------------------------- */

/** Fetch the signed-in user's wishlist product ids. */
export function apiGetWishlist(token: string) {
  return apiGetAuthed<{ ids: string[] }>("/wishlist", token, { ids: [] });
}

/** Add a product to the signed-in user's wishlist. */
export function apiAddToWishlist(token: string, productId: string) {
  return sendAuthed<{ ids: string[] }>(`/wishlist/${productId}`, "POST", token);
}

/** Remove a product from the signed-in user's wishlist. */
export function apiRemoveFromWishlist(token: string, productId: string) {
  return sendAuthed<{ ids: string[] }>(`/wishlist/${productId}`, "DELETE", token);
}

/** Replace the whole wishlist — used to merge a guest wishlist into the account. */
export function apiReplaceWishlist(token: string, ids: string[]) {
  return sendAuthed<{ ids: string[] }>("/wishlist", "PUT", token, { ids });
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

/* --------------------------- Admin: category CRUD --------------------------- */

/** Shape the admin category form sends to the backend (create/update). */
export interface CategoryInput {
  name: string;
  slug?: string;
  image: string;
  banner?: string;
  description?: string;
  featured?: boolean;
  order?: number;
}

/** Create a category (admin). Returns the created category. */
export function apiCreateCategory(token: string, input: CategoryInput) {
  return sendAuthed<Category>("/categories", "POST", token, input);
}

/** Update a category by id (admin). Returns the updated category. */
export function apiUpdateCategory(token: string, id: string, input: Partial<CategoryInput>) {
  return sendAuthed<Category>(`/categories/${id}`, "PUT", token, input);
}

/** Delete a category by id (admin). Fails while products still use it. */
export function apiDeleteCategory(token: string, id: string) {
  return sendAuthed<{ ok: true; id: string }>(`/categories/${id}`, "DELETE", token);
}

/* ------------------------------- Orders ------------------------------- */

export interface OrderAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface OrderInput {
  items: {
    productId: string;
    name: string;
    thumbnail: string;
    color: string;
    size: string;
    price: number;
    quantity: number;
  }[];
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  paymentMethod: string; // "razorpay" | "card" | "cod"
  discount?: number;
  couponCode?: string;
}

/** Place an order (authenticated). Returns the created order. */
export function apiCreateOrder(token: string, input: OrderInput) {
  return sendAuthed<Order>("/orders", "POST", token, input);
}

/** Fetch the signed-in user's own orders (for the profile page — never others'). */
export function apiGetOrders(token: string) {
  return apiGetAuthed<Order[]>("/orders?mine=1", token, []);
}

/** A page of orders plus pagination metadata (admin). */
export interface OrdersPage {
  orders: Order[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

/** Fetch a paginated / searched / status-filtered page of orders (admin). */
export function apiGetOrdersPage(
  token: string,
  opts: { page?: number; limit?: number; q?: string; status?: string } = {}
) {
  const params = new URLSearchParams();
  params.set("page", String(opts.page ?? 1));
  params.set("limit", String(opts.limit ?? 10));
  if (opts.q?.trim()) params.set("q", opts.q.trim());
  if (opts.status?.trim()) params.set("status", opts.status.trim());
  return apiGetAuthed<OrdersPage>(`/orders?${params.toString()}`, token, {
    orders: [],
    total: 0,
    page: 1,
    pages: 1,
    limit: opts.limit ?? 10,
  });
}

/** Update an order's status / payment status / tracking number (admin). */
export function apiUpdateOrder(
  token: string,
  id: string,
  input: { status?: string; paymentStatus?: string; trackingNumber?: string }
) {
  return sendAuthed<Order>(`/orders/${id}`, "PUT", token, input);
}

/* --------------------------- Admin: customer CRUD -------------------------- */

/** Shape the admin customer form sends to the backend. */
export interface CustomerInput {
  name: string;
  email: string;
  phone?: string;
  role?: AuthUser["role"];
  password?: string;
}

/** A page of customers plus pagination metadata. */
export interface UsersPage {
  users: AuthUser[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

const EMPTY_PAGE: UsersPage = { users: [], total: 0, page: 1, pages: 1, limit: 10 };

/** Fetch a paginated, optionally-searched page of customers (admin). */
export function apiGetUsersPage(
  token: string,
  opts: { page?: number; limit?: number; q?: string } = {}
) {
  const params = new URLSearchParams();
  params.set("page", String(opts.page ?? 1));
  params.set("limit", String(opts.limit ?? 10));
  if (opts.q?.trim()) params.set("q", opts.q.trim());
  return apiGetAuthed<UsersPage>(`/admin/users?${params.toString()}`, token, {
    ...EMPTY_PAGE,
    limit: opts.limit ?? 10,
  });
}

/** Create a customer/user (admin). */
export function apiCreateUser(token: string, input: CustomerInput) {
  return sendAuthed<AuthUser>("/admin/users", "POST", token, input);
}

/** Update a customer/user by id (admin). */
export function apiUpdateUser(token: string, id: string, input: Partial<CustomerInput>) {
  return sendAuthed<AuthUser>(`/admin/users/${id}`, "PUT", token, input);
}

/** Delete a customer/user by id (admin). */
export function apiDeleteUser(token: string, id: string) {
  return sendAuthed<{ ok: true; id: string }>(`/admin/users/${id}`, "DELETE", token);
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
