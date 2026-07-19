"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, X, Upload, Star } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuthStore } from "@/store/auth-store";
import { getCategories } from "@/lib/api";
import {
  apiCreateCategory,
  apiUpdateCategory,
  apiDeleteCategory,
  apiUploadImage,
  type CategoryInput,
} from "@/lib/auth-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/store/toast-store";
import { confirm } from "@/store/confirm-store";
import { isValidImageSrc } from "@/lib/utils";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  return (
    <AuthGuard adminOnly>
      <CategoriesManager />
    </AuthGuard>
  );
}

type FormState = {
  name: string;
  description: string;
  image: string;
  banner: string;
  featured: boolean;
  order: string;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  image: "",
  banner: "",
  featured: false,
  order: "0",
};

function categoryToForm(c: Category): FormState {
  return {
    name: c.name,
    description: c.description ?? "",
    image: c.image,
    banner: c.banner && c.banner !== c.image ? c.banner : "",
    featured: c.featured,
    order: "0",
  };
}

function CategoriesManager() {
  const token = useAuthStore((s) => s.token);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setCategories(await getCategories());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, order: String(categories.length) });
    setError("");
    setEditorOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm(categoryToForm(c));
    setError("");
    setEditorOpen(true);
  };

  const closeEditor = () => {
    if (saving) return;
    setEditorOpen(false);
    setEditing(null);
  };

  const submit = async () => {
    if (!token) return;
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.image.trim()) return setError("A category image is required.");
    setSaving(true);
    setError("");

    const input: CategoryInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      banner: form.banner.trim() || undefined,
      featured: form.featured,
      order: Number(form.order) || 0,
    };

    const res = editing
      ? await apiUpdateCategory(token, editing.id, input)
      : await apiCreateCategory(token, input);

    setSaving(false);
    if (!res.ok) return setError(res.error);

    toast.success(editing ? `${input.name} updated.` : `${input.name} added.`);
    setEditorOpen(false);
    setEditing(null);
    await load();
  };

  const remove = async (c: Category) => {
    if (!token) return;
    if (c.productCount > 0) {
      toast.error(
        `"${c.name}" still has ${c.productCount} product${c.productCount > 1 ? "s" : ""}. Move or delete them first.`
      );
      return;
    }
    const ok = await confirm({
      title: "Delete category",
      message: `Delete "${c.name}"? This cannot be undone.`,
      confirmText: "Delete",
      destructive: true,
    });
    if (!ok) return;
    setDeletingId(c.id);
    const res = await apiDeleteCategory(token, c.id);
    setDeletingId(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(`${c.name} deleted.`);
    await load();
  };

  return (
    <div className="container-wide py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium md:text-3xl">Manage Categories</h1>
          <p className="text-sm text-muted">{loading ? "Loading…" : `${categories.length} categories`}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:border-ink"
          >
            <ArrowLeft size={15} /> Dashboard
          </Link>
          <Button onClick={openCreate} size="sm">
            <Plus size={15} /> Add Category
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-accent-dark" size={28} />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        {isValidImageSrc(c.image) && (
                          <Image src={c.image} alt={c.name} fill sizes="40px" className="object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 font-medium">{c.name}</p>
                        {c.description && (
                          <p className="line-clamp-1 max-w-xs text-xs text-muted">{c.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{c.slug}</td>
                  <td className="px-4 py-3 text-muted">{c.productCount}</td>
                  <td className="px-4 py-3">
                    {c.featured ? <Badge variant="accent">Featured</Badge> : <span className="text-muted">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        aria-label={`Edit ${c.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-line hover:border-ink"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => remove(c)}
                        disabled={deletingId === c.id}
                        aria-label={`Delete ${c.name}`}
                        title={c.productCount > 0 ? "Move or delete its products first" : undefined}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-sale hover:border-sale disabled:opacity-40"
                      >
                        {deletingId === c.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted">
                    No categories yet. Add your first one.
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
          <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-background shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-background px-6 py-4">
              <h2 className="text-lg font-medium">{editing ? "Edit Category" : "Add Category"}</h2>
              <button aria-label="Close" onClick={closeEditor}>
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4 px-6 py-6">
              <Field label="Name *">
                <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} />
                {editing && (
                  <span className="text-xs text-muted">
                    Renaming also updates the slug (currently “{editing.slug}”).
                  </span>
                )}
              </Field>

              <Field label="Description">
                <textarea
                  className={`${inputCls} h-24 resize-none py-2.5`}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>

              <ImagePicker
                label="Image *"
                hint="Shown on category cards."
                url={form.image}
                onUrl={(u) => set("image", u)}
              />

              <ImagePicker
                label="Banner"
                hint="Wide banner for the category page. Falls back to the image."
                url={form.banner}
                onUrl={(u) => set("banner", u)}
              />

              <div className="grid grid-cols-2 gap-4">
                <Field label="Sort order">
                  <input
                    type="number"
                    className={inputCls}
                    value={form.order}
                    onChange={(e) => set("order", e.target.value)}
                  />
                </Field>
                <label className="flex items-center gap-2 self-end pb-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => set("featured", e.target.checked)}
                    className="h-4 w-4 accent-ink"
                  />
                  <Star size={14} /> Featured
                </label>
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
                  "Create category"
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

/* ---------------------------- Image picker ---------------------------- */

function ImagePicker({
  label,
  hint,
  url,
  onUrl,
}: {
  label: string;
  hint: string;
  url: string;
  onUrl: (url: string) => void;
}) {
  const token = useAuthStore((s) => s.token);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !token) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5 MB.");
    setUploading(true);
    const res = await apiUploadImage(token, file);
    setUploading(false);
    if (!res.ok) return toast.error(res.error);
    onUrl(res.data.url);
  }

  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-secondary">
          {isValidImageSrc(url) && (
            <Image src={url} alt={label} fill sizes="64px" className="object-cover" />
          )}
        </div>
        <div className="flex flex-col items-start gap-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:border-ink disabled:opacity-50"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? "Uploading…" : url ? "Replace" : "Upload"}
          </button>
          <span className="text-xs text-muted">{hint}</span>
        </div>
        {url && (
          <button
            type="button"
            aria-label="Clear image"
            onClick={() => onUrl("")}
            className="ml-auto text-muted hover:text-ink"
          >
            <X size={15} />
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onPick} />
    </Field>
  );
}

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
