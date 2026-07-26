"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Upload,
  ExternalLink,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuthStore } from "@/store/auth-store";
import {
  apiGetAdminBlogs,
  apiCreateBlog,
  apiUpdateBlog,
  apiDeleteBlog,
  apiUploadImage,
  type AdminBlog,
  type BlogInput,
} from "@/lib/auth-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/store/toast-store";
import { confirm } from "@/store/confirm-store";
import { isValidImageSrc, formatDate } from "@/lib/utils";

export default function AdminBlogsPage() {
  return (
    <AuthGuard adminOnly>
      <BlogsManager />
    </AuthGuard>
  );
}

type FormState = {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  author: string;
  authorAvatar: string;
  image: string;
  readTime: string;
  published: boolean;
};

const emptyForm: FormState = {
  title: "",
  excerpt: "",
  content: "",
  tags: "",
  author: "",
  authorAvatar: "",
  image: "",
  readTime: "4",
  published: true,
};

function blogToForm(b: AdminBlog): FormState {
  return {
    title: b.title,
    excerpt: b.excerpt ?? "",
    content: b.content,
    tags: (b.tags ?? []).join(", "),
    author: b.author,
    authorAvatar: b.authorAvatar ?? "",
    image: b.image,
    readTime: String(b.readTime || 4),
    published: b.published,
  };
}

function BlogsManager() {
  const token = useAuthStore((s) => s.token);
  const [blogs, setBlogs] = useState<AdminBlog[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBlog | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setBlogs(await apiGetAdminBlogs(token));
    setLoading(false);
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setEditorOpen(true);
  };

  const openEdit = (b: AdminBlog) => {
    setEditing(b);
    setForm(blogToForm(b));
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
    if (!form.title.trim()) return setError("Title is required.");
    if (!form.image.trim()) return setError("A cover image is required.");
    if (!form.content.trim()) return setError("Content is required.");
    if (!form.author.trim()) return setError("Author is required.");
    setSaving(true);
    setError("");

    const input: BlogInput = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      author: form.author.trim(),
      authorAvatar: form.authorAvatar.trim(),
      image: form.image.trim(),
      readTime: Number(form.readTime) || 4,
      published: form.published,
    };

    const res = editing
      ? await apiUpdateBlog(token, editing.id, input)
      : await apiCreateBlog(token, input);

    setSaving(false);
    if (!res.ok) return setError(res.error);

    toast.success(editing ? `“${input.title}” updated.` : `“${input.title}” added.`);
    setEditorOpen(false);
    setEditing(null);
    await load();
  };

  const remove = async (b: AdminBlog) => {
    if (!token) return;
    const ok = await confirm({
      title: "Delete article",
      message: `Delete “${b.title}”? This cannot be undone.`,
      confirmText: "Delete",
      destructive: true,
    });
    if (!ok) return;
    setDeletingId(b.id);
    const res = await apiDeleteBlog(token, b.id);
    setDeletingId(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(`“${b.title}” deleted.`);
    await load();
  };

  return (
    <div className="container-wide py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium md:text-3xl">Manage Blog</h1>
          <p className="text-sm text-muted">
            {loading ? "Loading…" : `${blogs.length} article${blogs.length === 1 ? "" : "s"}`}
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
            <Plus size={15} /> Add Article
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-accent-dark" size={28} />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Article</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {blogs.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        {isValidImageSrc(b.image) && (
                          <Image src={b.image} alt={b.title} fill sizes="56px" className="object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 max-w-xs font-medium">{b.title}</p>
                        {b.excerpt && (
                          <p className="line-clamp-1 max-w-xs text-xs text-muted">{b.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{b.author}</td>
                  <td className="px-4 py-3">
                    <div className="flex max-w-[180px] flex-wrap gap-1">
                      {(b.tags ?? []).slice(0, 3).map((t) => (
                        <Badge key={t} variant="light">{t}</Badge>
                      ))}
                      {(b.tags ?? []).length === 0 && <span className="text-muted">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {b.published ? <Badge variant="new">Published</Badge> : <Badge variant="light">Draft</Badge>}
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(b.date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {b.published && (
                        <Link
                          href={`/blog/${b.slug}`}
                          target="_blank"
                          aria-label={`View ${b.title}`}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-line hover:border-ink"
                        >
                          <ExternalLink size={15} />
                        </Link>
                      )}
                      <button
                        onClick={() => openEdit(b)}
                        aria-label={`Edit ${b.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-line hover:border-ink"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => remove(b)}
                        disabled={deletingId === b.id}
                        aria-label={`Delete ${b.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-sale hover:border-sale disabled:opacity-40"
                      >
                        {deletingId === b.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted">
                    No articles yet. Write your first one.
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
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-background px-6 py-4">
              <h2 className="text-lg font-medium">{editing ? "Edit Article" : "Add Article"}</h2>
              <button aria-label="Close" onClick={closeEditor}>
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4 px-6 py-6">
              <Field label="Title *">
                <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} />
                {editing && (
                  <span className="text-xs text-muted">
                    Renaming also updates the slug (currently “{editing.slug}”).
                  </span>
                )}
              </Field>

              <Field label="Excerpt">
                <textarea
                  className={`${inputCls} h-20 resize-none py-2.5`}
                  value={form.excerpt}
                  onChange={(e) => set("excerpt", e.target.value)}
                  placeholder="Short teaser shown on the journal listing."
                />
              </Field>

              <Field label="Content * (HTML)">
                <textarea
                  className={`${inputCls} h-56 resize-y py-2.5 font-mono text-xs leading-relaxed`}
                  value={form.content}
                  onChange={(e) => set("content", e.target.value)}
                  placeholder="<p>Write the article body as HTML paragraphs…</p>"
                />
                <span className="text-xs text-muted">
                  Rendered as-is on the article page — use &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt; etc.
                </span>
              </Field>

              <ImagePicker
                label="Cover image *"
                hint="Shown on the journal listing and article header."
                url={form.image}
                onUrl={(u) => set("image", u)}
              />

              <Field label="Tags">
                <input
                  className={inputCls}
                  value={form.tags}
                  onChange={(e) => set("tags", e.target.value)}
                  placeholder="styling, seasonal, layering"
                />
                <span className="text-xs text-muted">Comma-separated.</span>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Author *">
                  <input className={inputCls} value={form.author} onChange={(e) => set("author", e.target.value)} />
                </Field>
                <Field label="Read time (min)">
                  <input
                    type="number"
                    min={1}
                    className={inputCls}
                    value={form.readTime}
                    onChange={(e) => set("readTime", e.target.value)}
                  />
                </Field>
              </div>

              <ImagePicker
                label="Author avatar"
                hint="Small photo next to the author's name."
                url={form.authorAvatar}
                onUrl={(u) => set("authorAvatar", u)}
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => set("published", e.target.checked)}
                  className="h-4 w-4 accent-ink"
                />
                Published
                <span className="text-xs text-muted">— uncheck to keep it as a draft.</span>
              </label>

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
                  "Create article"
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
