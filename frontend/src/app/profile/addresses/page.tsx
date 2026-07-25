"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Plus, Pencil, Trash2, Check, Loader2, AlertCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useMounted } from "@/hooks/use-mounted";
import { toast } from "@/store/toast-store";
import {
  apiGetAddresses,
  apiAddAddress,
  apiUpdateAddress,
  apiSetDefaultAddress,
  apiDeleteAddress,
  type AddressInput,
  type SavedAddress,
} from "@/lib/auth-api";

const inputCls =
  "h-12 w-full rounded-xl border border-line bg-background px-4 text-sm outline-none focus:border-ink";

const LABEL_OPTIONS = ["Home", "Work"];

const EMPTY_FORM: AddressInput = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

export default function AddressesPage() {
  const mounted = useMounted();
  const { token } = useAuth();

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // null = closed, "new" = adding, otherwise the id of the address being edited
  const [editing, setEditing] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!mounted) return;
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await apiGetAddresses(token);
      if (cancelled) return;
      if (res) setAddresses(res.addresses);
      else setError("Couldn't load your addresses. Is the backend running?");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [mounted, token]);

  async function setDefault(id: string) {
    if (!token) return;
    setBusyId(id);
    const res = await apiSetDefaultAddress(token, id);
    if (res.ok) {
      setAddresses(res.data.addresses);
      toast.success("Default address updated.");
    } else toast.error(res.error);
    setBusyId(null);
  }

  async function remove(id: string) {
    if (!token) return;
    setBusyId(id);
    const res = await apiDeleteAddress(token, id);
    if (res.ok) {
      setAddresses(res.data.addresses);
      toast.success("Address removed.");
    } else toast.error(res.error);
    setBusyId(null);
  }

  if (!mounted || loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="animate-spin text-accent-dark" size={24} />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col items-start gap-3">
        <h2 className="text-lg font-medium">Saved Addresses</h2>
        <p className="text-sm text-muted">Sign in to manage your saved addresses.</p>
        <Link href="/login" className={buttonVariants({ size: "sm" })}>
          Sign In
        </Link>
      </div>
    );
  }

  const editingAddress = editing && editing !== "new" ? addresses.find((a) => a.id === editing) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Saved Addresses</h2>
        {editing === null && (
          <Button size="sm" onClick={() => setEditing("new")}>
            <Plus size={15} /> Add New
          </Button>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-2 rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">
          <AlertCircle size={15} /> {error}
        </p>
      )}

      {editing !== null && (
        <AddressForm
          key={editing}
          initial={editingAddress}
          onCancel={() => setEditing(null)}
          onSave={async (input) => {
            const res = editingAddress
              ? await apiUpdateAddress(token, editingAddress.id, input)
              : await apiAddAddress(token, input);
            if (res.ok) {
              setAddresses(res.data.addresses);
              setEditing(null);
              setError("");
              toast.success(editingAddress ? "Address updated." : "Address added.");
              return "";
            }
            return res.error;
          }}
        />
      )}

      {addresses.length === 0 && editing === null ? (
        <p className="rounded-2xl border border-line p-5 text-sm text-muted">
          You haven&apos;t saved any addresses yet. Add one to speed up checkout.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="flex flex-col gap-3 rounded-2xl border border-line p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <MapPin size={15} className="text-accent-dark" /> {a.label}
                </span>
                {a.isDefault && <Badge variant="light">Default</Badge>}
              </div>
              <div className="text-sm text-muted">
                <p className="font-medium text-ink">{a.fullName}</p>
                <p>
                  {[a.line1, a.line2, a.city, `${a.state} ${a.pincode}`].filter(Boolean).join(", ")}
                </p>
                <p className="mt-1">{a.phone}</p>
              </div>
              <div className="mt-auto flex items-center gap-3 border-t border-line pt-3 text-sm">
                <button
                  onClick={() => setEditing(a.id)}
                  className="flex items-center gap-1.5 text-muted hover:text-ink"
                >
                  <Pencil size={14} /> Edit
                </button>
                {!a.isDefault && (
                  <>
                    <button
                      onClick={() => setDefault(a.id)}
                      disabled={busyId === a.id}
                      className="flex items-center gap-1.5 text-muted hover:text-ink disabled:opacity-50"
                    >
                      {busyId === a.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}{" "}
                      Set default
                    </button>
                    <button
                      onClick={() => remove(a.id)}
                      disabled={busyId === a.id}
                      className="ml-auto flex items-center gap-1.5 text-muted hover:text-sale disabled:opacity-50"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------- Add / edit form --------------------------- */

function AddressForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: SavedAddress;
  onSave: (input: AddressInput) => Promise<string>; // returns error message or ""
  onCancel: () => void;
}) {
  const [form, setForm] = useState<AddressInput>(
    initial
      ? {
          label: initial.label,
          fullName: initial.fullName,
          phone: initial.phone,
          line1: initial.line1,
          line2: initial.line2,
          city: initial.city,
          state: initial.state,
          pincode: initial.pincode,
          isDefault: initial.isDefault,
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof AddressInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const err = await onSave(form);
    if (err) {
      setError(err);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-2xl border border-line p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{initial ? "Edit Address" : "New Address"}</h3>
        <button type="button" aria-label="Close" onClick={onCancel} className="text-muted hover:text-ink">
          <X size={16} />
        </button>
      </div>
      {error && (
        <p className="flex items-center gap-2 rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">
          <AlertCircle size={15} /> {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted">Label</label>
          <select
            value={form.label || "Home"}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className={`${inputCls} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23888%22 stroke-width=%222%22%3E%3Cpath d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')] bg-[position:right_1rem_center] bg-no-repeat pr-10`}
          >
            {/* Keep an unexpected existing label (e.g. from older data) selectable so editing never silently changes it. */}
            {(LABEL_OPTIONS.includes(form.label || "Home")
              ? LABEL_OPTIONS
              : [form.label, ...LABEL_OPTIONS]
            ).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <Field label="Full name" value={form.fullName} onChange={set("fullName")} required />
        <Field label="Phone" value={form.phone} onChange={set("phone")} required className="col-span-2" />
        <Field label="Address line 1" value={form.line1} onChange={set("line1")} required className="col-span-2" />
        <Field label="Address line 2 (optional)" value={form.line2 ?? ""} onChange={set("line2")} className="col-span-2" />
        <Field label="City" value={form.city} onChange={set("city")} required />
        <Field label="State" value={form.state} onChange={set("state")} required />
        <Field label="Pincode" value={form.pincode} onChange={set("pincode")} required />
        <label className="col-span-2 flex items-center gap-2 text-sm sm:col-span-1 sm:self-end sm:pb-3">
          <input
            type="checkbox"
            checked={Boolean(form.isDefault)}
            onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            className="h-4 w-4 accent-ink"
          />
          Set as default
        </label>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : initial ? "Save Changes" : "Add Address"}
        </Button>
        <button type="button" onClick={onCancel} className="text-sm text-muted hover:text-ink">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-medium text-muted">{label}</label>
      <input value={value} onChange={onChange} required={required} className={inputCls} />
    </div>
  );
}
