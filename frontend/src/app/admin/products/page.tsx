"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, X, Upload, Zap } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuthStore } from "@/store/auth-store";
import { getProducts, getCategories } from "@/lib/api";
import {
  apiCreateProduct,
  apiUpdateProduct,
  apiDeleteProduct,
  apiUploadImage,
  type ProductInput,
} from "@/lib/auth-api";
import { formatPrice } from "@/lib/utils";
import { useAttributes } from "@/hooks/use-catalog";
import { Button } from "@/components/ui/button";
import { toast } from "@/store/toast-store";
import { confirm } from "@/store/confirm-store";
import type { Product, Category } from "@/types";

export default function AdminProductsPage() {
  return (
    <AuthGuard adminOnly>
      <ProductsManager />
    </AuthGuard>
  );
}

type FormState = {
  name: string;
  category: string;
  price: string;
  discountPrice: string;
  stock: string;
  sku: string;
  brand: string;
  fabric: string;
  fit: string;
  occasion: string;
  thumbnail: string;
  images: string;
  sizes: string;
  colors: string;
  description: string;
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  trending: boolean;
  flashSale: boolean;
};

const emptyForm: FormState = {
  name: "",
  category: "",
  price: "",
  discountPrice: "",
  stock: "0",
  sku: "",
  brand: "",
  fabric: "",
  fit: "",
  occasion: "",
  thumbnail: "",
  images: "",
  sizes: "",
  colors: "",
  description: "",
  featured: false,
  newArrival: false,
  bestSeller: false,
  trending: false,
  flashSale: false,
};

function productToForm(p: Product): FormState {
  return {
    name: p.name,
    category: p.category,
    price: String(p.price),
    discountPrice: p.discountPrice && p.discountPrice !== p.price ? String(p.discountPrice) : "",
    stock: String(p.stock ?? 0),
    sku: p.sku,
    brand: p.brand ?? "",
    fabric: p.fabric ?? "",
    fit: p.fit ?? "",
    occasion: p.occasion ?? "",
    thumbnail: p.thumbnail,
    images: (p.images ?? []).join(", "),
    sizes: (p.sizes ?? []).join(", "),
    colors: (p.colors ?? []).map((c) => c.name).join(", "),
    description: p.description ?? "",
    featured: !!p.featured,
    newArrival: !!p.newArrival,
    bestSeller: !!p.bestSeller,
    trending: !!p.trending,
    flashSale: !!p.flashSale,
  };
}

function formToInput(f: FormState): ProductInput {
  const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
  return {
    name: f.name.trim(),
    category: f.category,
    price: Number(f.price),
    discountPrice: f.discountPrice ? Number(f.discountPrice) : undefined,
    stock: Number(f.stock || 0),
    sku: f.sku.trim() || undefined,
    brand: f.brand.trim() || undefined,
    fabric: f.fabric.trim() || undefined,
    fit: f.fit || undefined,
    occasion: f.occasion || undefined,
    description: f.description.trim() || undefined,
    thumbnail: f.thumbnail.trim(),
    images: list(f.images),
    sizes: list(f.sizes),
    colors: list(f.colors),
    featured: f.featured,
    newArrival: f.newArrival,
    bestSeller: f.bestSeller,
    trending: f.trending,
    flashSale: f.flashSale,
  };
}

function ProductsManager() {
  const token = useAuthStore((s) => s.token);
  const { data: attributes } = useAttributes();
  const { fabrics: FABRICS, fits: FITS, occasions: OCCASIONS, sizes: SIZES, colors: COLORS } =
    attributes;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // Form / editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, c] = await Promise.all([getProducts(), getCategories()]);
      setProducts(p);
      setCategories(c);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q)
    );
  }, [products, query]);

  const openCreate = () => {
    setEditing(null);
    // Preview the next sequential SKU from the loaded list; the backend assigns
    // the authoritative one on save (same sequence).
    let max = 1000;
    for (const p of products) {
      const m = /^SRUVALLE-(\d+)$/.exec(p.sku ?? "");
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > max) max = n;
      }
    }
    setForm({ ...emptyForm, category: categories[0]?.slug ?? "", sku: `SRUVALLE-${max + 1}` });
    setError("");
    setEditorOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm(productToForm(p));
    setError("");
    setEditorOpen(true);
  };

  const closeEditor = () => {
    if (saving) return;
    setEditorOpen(false);
    setEditing(null);
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Sizes are stored as a comma-separated string in the form; toggle chips.
  const selectedSizes = form.sizes.split(",").map((s) => s.trim()).filter(Boolean);
  const toggleSize = (sz: string) => {
    const next = selectedSizes.includes(sz)
      ? selectedSizes.filter((s) => s !== sz)
      : [...selectedSizes, sz];
    set("sizes", next.join(", "));
  };

  // Colors are stored as a comma-separated string of names; toggle swatches.
  const selectedColors = form.colors.split(",").map((s) => s.trim()).filter(Boolean);
  const toggleColor = (name: string) => {
    const next = selectedColors.includes(name)
      ? selectedColors.filter((c) => c !== name)
      : [...selectedColors, name];
    set("colors", next.join(", "));
  };

  // Gallery images stored as a comma-separated string of URLs.
  const galleryUrls = form.images.split(",").map((s) => s.trim()).filter(Boolean);
  const removeGalleryAt = (idx: number) =>
    set("images", galleryUrls.filter((_, i) => i !== idx).join(", "));

  const uploadThumb = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !token) return;
    setUploadingThumb(true);
    setError("");
    const res = await apiUploadImage(token, file);
    setUploadingThumb(false);
    if (!res.ok) return setError(res.error);
    set("thumbnail", res.data.url);
  };

  const uploadGallery = async (files: FileList | null) => {
    if (!files || files.length === 0 || !token) return;
    setUploadingGallery(true);
    setError("");
    const urls = [...galleryUrls];
    for (const file of Array.from(files)) {
      const res = await apiUploadImage(token, file);
      if (!res.ok) {
        setError(res.error);
        break;
      }
      urls.push(res.data.url);
    }
    setUploadingGallery(false);
    set("images", urls.join(", "));
  };

  const submit = async () => {
    if (!token) return;
    if (!form.name.trim() || !form.price || !form.category) {
      return setError("Name, price and category are required.");
    }
    if (!form.thumbnail.trim() && !form.images.trim()) {
      return setError("Add a thumbnail image URL (or at least one image).");
    }
    setSaving(true);
    setError("");
    const input = formToInput(form);
    if (!input.thumbnail && input.images?.length) input.thumbnail = input.images[0];

    const res = editing
      ? await apiUpdateProduct(token, editing.id, input)
      : await apiCreateProduct(token, input);

    setSaving(false);
    if (!res.ok) return setError(res.error);

    const saved = res.data;
    setProducts((list) =>
      editing ? list.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...list]
    );
    toast.success(editing ? `${saved.name} updated.` : `${saved.name} created.`);
    setEditorOpen(false);
    setEditing(null);
  };

  const remove = async (p: Product) => {
    if (!token) return;
    const ok = await confirm({
      title: "Delete product",
      message: `Delete "${p.name}"? This cannot be undone.`,
      confirmText: "Delete",
      destructive: true,
    });
    if (!ok) return;
    setDeletingId(p.id);
    const res = await apiDeleteProduct(token, p.id);
    setDeletingId(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setProducts((list) => list.filter((x) => x.id !== p.id));
    toast.success(`${p.name} deleted.`);
  };

  return (
    <div className="container-wide py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium md:text-3xl">Manage Products</h1>
          <p className="text-sm text-muted">
            {loading ? "Loading…" : `${products.length} products`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:border-ink"
          >
            <ArrowLeft size={15} /> Dashboard
          </Link>
          <Button onClick={openCreate} size="sm">
            <Plus size={15} /> Add Product
          </Button>
        </div>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products…"
        className="mb-4 h-11 w-full max-w-sm rounded-full border border-line bg-background px-4 text-sm outline-none focus:border-ink"
      />

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-accent-dark" size={28} />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        {p.thumbnail && (
                          <Image src={p.thumbnail} alt={p.name} fill sizes="40px" className="object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 font-medium">
                          <span className="line-clamp-1">{p.name}</span>
                          {p.flashSale && (
                            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-sale/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sale">
                              <Zap size={9} className="fill-sale" /> Flash
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{p.categoryName}</td>
                  <td className="px-4 py-3">{formatPrice(p.discountPrice)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        aria-label={`Edit ${p.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-line hover:border-ink"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => remove(p)}
                        disabled={deletingId === p.id}
                        aria-label={`Delete ${p.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-sale hover:border-sale disabled:opacity-50"
                      >
                        {deletingId === p.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted">
                    No products match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor slide-over */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-ink/40" onClick={closeEditor} />
          <div className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto bg-background shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-background px-6 py-4">
              <h2 className="text-lg font-medium">{editing ? "Edit Product" : "Add Product"}</h2>
              <button aria-label="Close" onClick={closeEditor}>
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4 px-6 py-6">
              <Field label="Name *">
                <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} />
              </Field>

              <Field label="Category *">
                <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Price (₹) *">
                  <input type="number" className={inputCls} value={form.price} onChange={(e) => set("price", e.target.value)} />
                </Field>
                <Field label="Discount price (₹)">
                  <input type="number" className={inputCls} value={form.discountPrice} onChange={(e) => set("discountPrice", e.target.value)} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Stock">
                  <input type="number" className={inputCls} value={form.stock} onChange={(e) => set("stock", e.target.value)} />
                </Field>
                <Field label="Brand">
                  <input className={inputCls} value={form.brand} onChange={(e) => set("brand", e.target.value)} />
                </Field>
              </div>

              <Field label="Fabric">
                <select className={inputCls} value={form.fabric} onChange={(e) => set("fabric", e.target.value)}>
                  <option value="">Select fabric</option>
                  {FABRICS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Fit">
                  <select className={inputCls} value={form.fit} onChange={(e) => set("fit", e.target.value)}>
                    <option value="">Select fit</option>
                    {FITS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Occasion">
                  <select className={inputCls} value={form.occasion} onChange={(e) => set("occasion", e.target.value)}>
                    <option value="">Select occasion</option>
                    {OCCASIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="SKU (auto-generated)">
                <input
                  className={`${inputCls} bg-secondary text-muted`}
                  value={form.sku}
                  readOnly
                  aria-readonly
                />
              </Field>

              <Field label="Thumbnail image *">
                {form.thumbnail ? (
                  <div className="flex items-center gap-3">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      <Image src={form.thumbnail} alt="Thumbnail" fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="flex flex-col items-start gap-1.5">
                      <label className="flex cursor-pointer items-center gap-1.5 text-sm underline hover:text-accent-dark">
                        {uploadingThumb ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {uploadingThumb ? "Uploading…" : "Replace image"}
                        <input type="file" accept="image/*" className="hidden" disabled={uploadingThumb} onChange={(e) => uploadThumb(e.target.files)} />
                      </label>
                      <button type="button" onClick={() => set("thumbnail", "")} className="text-xs text-sale">
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-6 text-sm text-muted hover:border-ink">
                    {uploadingThumb ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Uploading…
                      </>
                    ) : (
                      <>
                        <Upload size={18} /> Click to upload thumbnail
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingThumb} onChange={(e) => uploadThumb(e.target.files)} />
                  </label>
                )}
              </Field>

              <Field label="Gallery images">
                <div className="flex flex-wrap gap-2">
                  {galleryUrls.map((url, i) => (
                    <div key={i} className="relative h-20 w-16 overflow-hidden rounded-lg bg-secondary">
                      <Image src={url} alt={`Image ${i + 1}`} fill sizes="64px" className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryAt(i)}
                        aria-label="Remove image"
                        className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 hover:bg-background"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                  <label className="flex h-20 w-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line text-[11px] text-muted hover:border-ink">
                    {uploadingGallery ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    <span>{uploadingGallery ? "…" : "Add"}</span>
                    <input type="file" accept="image/*" multiple className="hidden" disabled={uploadingGallery} onChange={(e) => uploadGallery(e.target.files)} />
                  </label>
                </div>
              </Field>

              <Field label="Sizes">
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((sz) => {
                    const active = selectedSizes.includes(sz);
                    return (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => toggleSize(sz)}
                        className={`rounded-full border px-4 py-1.5 text-sm transition ${
                          active ? "border-ink bg-ink text-background" : "border-line hover:border-ink"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Colors">
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => {
                    const active = selectedColors.includes(c.name);
                    return (
                      <button
                        type="button"
                        key={c.name}
                        onClick={() => toggleColor(c.name)}
                        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                          active ? "border-ink bg-ink text-background" : "border-line hover:border-ink"
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-line"
                          style={{ backgroundColor: c.hex }}
                        />
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Description">
                <textarea rows={4} className={`${inputCls} h-auto py-3`} value={form.description} onChange={(e) => set("description", e.target.value)} />
              </Field>

              <div className="flex flex-wrap gap-4 pt-1">
                {(["featured", "newArrival", "bestSeller", "trending", "flashSale"] as const).map((flag) => (
                  <label key={flag} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="checkbox" className="accent-ink" checked={form[flag]} onChange={(e) => set(flag, e.target.checked)} />
                    {FLAG_LABELS[flag]}
                  </label>
                ))}
              </div>

              {error && <p className="text-sm text-sale">{error}</p>}
            </div>

            <div className="sticky bottom-0 mt-auto flex gap-3 border-t border-line bg-background px-6 py-4">
              <Button onClick={submit} disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Saving…
                  </>
                ) : editing ? (
                  "Save changes"
                ) : (
                  "Create product"
                )}
              </Button>
              <button
                onClick={closeEditor}
                disabled={saving}
                className="rounded-full border border-line px-5 text-sm hover:border-ink disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FLAG_LABELS: Record<
  "featured" | "newArrival" | "bestSeller" | "trending" | "flashSale",
  string
> = {
  featured: "Featured",
  newArrival: "New Arrival",
  bestSeller: "Best Seller",
  trending: "Trending",
  flashSale: "Flash Sale",
};

const inputCls =
  "h-11 w-full rounded-xl border border-line bg-background px-3 text-sm outline-none focus:border-ink";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted">{label}</span>
      {children}
    </label>
  );
}
