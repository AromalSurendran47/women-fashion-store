"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import {
  apiGetUsersPage,
  apiCreateUser,
  apiUpdateUser,
  apiDeleteUser,
  type CustomerInput,
} from "@/lib/auth-api";
import { formatDate } from "@/lib/utils";
import { AVATAR_FALLBACK } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/store/toast-store";
import { confirm } from "@/store/confirm-store";
import type { AuthUser, Role } from "@/types";

/** The admin list endpoint returns a few extra fields beyond AuthUser. */
type Customer = AuthUser & { createdAt?: string; emailVerified?: boolean };

const PAGE_SIZE = 10;

export default function AdminCustomersPage() {
  return (
    <AuthGuard adminOnly>
      <CustomersManager />
    </AuthGuard>
  );
}

const ROLES: Role[] = ["customer", "seller", "admin"];

type FormState = {
  name: string;
  email: string;
  phone: string;
  role: Role;
  password: string;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  phone: "",
  role: "customer",
  password: "",
};

function userToForm(u: Customer): FormState {
  return {
    name: u.name,
    email: u.email,
    phone: u.phone ?? "",
    role: u.role,
    password: "",
  };
}

function CustomersManager() {
  const { user: me } = useAuth();
  const token = useAuthStore((s) => s.token);
  const [users, setUsers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [exporting, setExporting] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Debounce the search box, and reset to page 1 whenever the term changes.
  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await apiGetUsersPage(token, { page, limit: PAGE_SIZE, q: debounced });
    setUsers(res.users as Customer[]);
    setPages(res.pages);
    setTotal(res.total);
    // If a deletion emptied the last page, step back onto a page that has rows.
    if (res.page > res.pages) setPage(res.pages);
    setLoading(false);
  }, [token, page, debounced]);

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

  const openEdit = (u: Customer) => {
    setEditing(u);
    setForm(userToForm(u));
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
    if (!form.name.trim() || !form.email.trim()) {
      return setError("Name and email are required.");
    }
    if (!editing && form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (editing && form.password && form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    setSaving(true);
    setError("");

    const input: CustomerInput = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      role: form.role,
    };
    if (form.password) input.password = form.password;

    const res = editing
      ? await apiUpdateUser(token, editing.id, input)
      : await apiCreateUser(token, input);

    setSaving(false);
    if (!res.ok) return setError(res.error);

    toast.success(editing ? `${form.name.trim()} updated.` : `${form.name.trim()} added.`);
    setEditorOpen(false);
    setEditing(null);
    // A new customer sorts to the top — jump to page 1 to reveal it.
    if (!editing && page !== 1) setPage(1);
    else await load();
  };

  const remove = async (u: Customer) => {
    if (!token) return;
    if (u.id === me?.id) {
      toast.error("You cannot delete your own account here.");
      return;
    }
    const ok = await confirm({
      title: "Delete customer",
      message: `Delete "${u.name}"? This cannot be undone.`,
      confirmText: "Delete",
      destructive: true,
    });
    if (!ok) return;
    setDeletingId(u.id);
    const res = await apiDeleteUser(token, u.id);
    setDeletingId(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(`${u.name} deleted.`);
    await load();
  };

  const exportCsv = async () => {
    if (!token) return;
    setExporting(true);
    // Pull every row matching the current search (not just the visible page).
    const res = await apiGetUsersPage(token, { page: 1, limit: 10000, q: debounced });
    setExporting(false);
    if (res.users.length === 0) {
      toast.info("No customers to export.");
      return;
    }
    downloadCsv(res.users as Customer[]);
    toast.success(`Exported ${res.users.length} customers to CSV.`);
  };

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="container-wide py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium md:text-3xl">Manage Customers</h1>
          <p className="text-sm text-muted">
            {loading ? "Loading…" : `${total} customers`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:border-ink"
          >
            <ArrowLeft size={15} /> Dashboard
          </Link>
          <button
            onClick={exportCsv}
            disabled={exporting || total === 0}
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:border-ink disabled:opacity-50"
          >
            {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            Export CSV
          </button>
          <Button onClick={openCreate} size="sm">
            <Plus size={15} /> Add Customer
          </Button>
        </div>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, email or phone…"
        className="mb-4 h-11 w-full max-w-sm rounded-full border border-line bg-background px-4 text-sm outline-none focus:border-ink"
      />

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-accent-dark" size={28} />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-secondary">
                          <Image
                            src={u.avatar || AVATAR_FALLBACK}
                            alt={u.name}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-1 font-medium">
                            {u.name}
                            {u.id === me?.id && (
                              <span className="ml-1.5 text-xs font-normal text-muted">(You)</span>
                            )}
                          </p>
                          <p className="truncate text-xs text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{u.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.role === "admin" ? "accent" : "light"}>{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {u.createdAt ? formatDate(u.createdAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          aria-label={`Edit ${u.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-line hover:border-ink"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => remove(u)}
                          disabled={deletingId === u.id || u.id === me?.id}
                          aria-label={`Delete ${u.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-sale hover:border-sale disabled:opacity-40"
                        >
                          {deletingId === u.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted">
                      No customers match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {total === 0 ? "No results" : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex h-9 items-center gap-1 rounded-full border border-line px-3 text-sm hover:border-ink disabled:opacity-40"
              >
                <ChevronLeft size={15} /> Prev
              </button>
              <span className="text-sm text-muted">
                Page {page} of {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="flex h-9 items-center gap-1 rounded-full border border-line px-3 text-sm hover:border-ink disabled:opacity-40"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Editor slide-over */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-ink/40" onClick={closeEditor} />
          <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-background shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-background px-6 py-4">
              <h2 className="text-lg font-medium">{editing ? "Edit Customer" : "Add Customer"}</h2>
              <button aria-label="Close" onClick={closeEditor}>
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4 px-6 py-6">
              <Field label="Name *">
                <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} />
              </Field>

              <Field label="Email *">
                <input
                  type="email"
                  className={inputCls}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>

              <Field label="Phone">
                <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </Field>

              <Field label="Role">
                <select
                  className={inputCls}
                  value={form.role}
                  disabled={editing?.id === me?.id}
                  onChange={(e) => set("role", e.target.value as Role)}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {editing?.id === me?.id && (
                  <span className="text-xs text-muted">You cannot change your own role.</span>
                )}
              </Field>

              <Field label={editing ? "New password (leave blank to keep)" : "Password *"}>
                <input
                  type="password"
                  autoComplete="new-password"
                  className={inputCls}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder={editing ? "••••••••" : "At least 6 characters"}
                />
              </Field>

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
                  "Create customer"
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

/** Build a CSV from the given customers and trigger a browser download. */
function downloadCsv(rows: Customer[]) {
  const headers = ["Name", "Email", "Phone", "Role", "Joined"];
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    headers.join(","),
    ...rows.map((u) =>
      [
        u.name ?? "",
        u.email ?? "",
        u.phone ?? "",
        u.role ?? "",
        u.createdAt ? formatDate(u.createdAt) : "",
      ]
        .map((v) => esc(String(v)))
        .join(",")
    ),
  ];
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
