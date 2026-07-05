"use client";

import { useEffect, useState } from "react";
import { Check, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useMounted } from "@/hooks/use-mounted";

const inputCls =
  "h-12 w-full rounded-xl border border-line bg-background px-4 text-sm outline-none focus:border-ink";

export default function AccountPage() {
  const mounted = useMounted();
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();

  return (
    <div className="flex max-w-xl flex-col gap-10">
      {mounted && user ? (
        <>
          <ProfileForm user={user} onSave={updateProfile} />
          <PasswordForm onChange={changePassword} />
          <DangerZone onDelete={deleteAccount} />
        </>
      ) : (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="animate-spin text-accent-dark" size={24} />
        </div>
      )}
    </div>
  );
}

/* --------------------------- Edit profile --------------------------- */

function ProfileForm({
  user,
  onSave,
}: {
  user: { name: string; email: string; phone: string };
  onSave: (i: { name: string; email: string; phone: string }) => Promise<any>;
}) {
  const [first = "", ...rest] = user.name.split(" ");
  const [form, setForm] = useState({
    first,
    last: rest.join(" "),
    email: user.email,
    phone: user.phone,
  });
  const [state, setState] = useState<{ loading: boolean; error: string; ok: boolean }>({
    loading: false,
    error: "",
    ok: false,
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ loading: true, error: "", ok: false });
    const res = await onSave({
      name: `${form.first} ${form.last}`.trim(),
      email: form.email,
      phone: form.phone,
    });
    setState({ loading: false, error: res.ok ? "" : res.error, ok: res.ok });
    if (res.ok) setTimeout(() => setState((s) => ({ ...s, ok: false })), 2500);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h2 className="text-lg font-medium">Account Details</h2>
      {state.error && <Alert error>{state.error}</Alert>}
      {state.ok && <Alert>Profile updated.</Alert>}
      <div className="grid grid-cols-2 gap-4">
        <Field label="First name" value={form.first} onChange={set("first")} />
        <Field label="Last name" value={form.last} onChange={set("last")} />
        <Field label="Email" type="email" value={form.email} onChange={set("email")} className="col-span-2" />
        <Field label="Phone" value={form.phone} onChange={set("phone")} className="col-span-2" />
      </div>
      <Button type="submit" className="self-start" disabled={state.loading}>
        {state.loading ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
      </Button>
    </form>
  );
}

/* --------------------------- Change password ------------------------ */

function PasswordForm({
  onChange,
}: {
  onChange: (i: { currentPassword: string; newPassword: string }) => Promise<any>;
}) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [state, setState] = useState<{ loading: boolean; error: string; ok: boolean }>({
    loading: false,
    error: "",
    ok: false,
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.next !== form.confirm) {
      return setState({ loading: false, error: "New passwords don't match.", ok: false });
    }
    setState({ loading: true, error: "", ok: false });
    const res = await onChange({ currentPassword: form.current, newPassword: form.next });
    setState({ loading: false, error: res.ok ? "" : res.error, ok: res.ok });
    if (res.ok) setForm({ current: "", next: "", confirm: "" });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 border-t border-line pt-8">
      <h3 className="text-sm font-medium">Change Password</h3>
      {state.error && <Alert error>{state.error}</Alert>}
      {state.ok && <Alert>Password updated.</Alert>}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Current password" type="password" value={form.current} onChange={set("current")} className="col-span-2" />
        <Field label="New password" type="password" value={form.next} onChange={set("next")} />
        <Field label="Confirm password" type="password" value={form.confirm} onChange={set("confirm")} />
      </div>
      <Button type="submit" variant="outline" className="self-start" disabled={state.loading}>
        {state.loading ? <Loader2 size={16} className="animate-spin" /> : "Update Password"}
      </Button>
    </form>
  );
}

/* ---------------------------- Delete account ------------------------ */

function DangerZone({ onDelete }: { onDelete: () => Promise<any> }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setLoading(true);
    const res = await onDelete();
    if (!res.ok) {
      setError(res.error);
      setLoading(false);
    }
    // on success, useAuth logs out and redirects home
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-sale/30 bg-sale/5 p-5">
      <h3 className="text-sm font-medium text-sale">Delete Account</h3>
      <p className="text-sm text-muted">
        Permanently delete your account and all associated data. This cannot be undone.
      </p>
      {error && <Alert error>{error}</Alert>}
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="flex items-center gap-2 self-start rounded-full border border-sale px-5 py-2.5 text-sm font-medium text-sale hover:bg-sale hover:text-white"
        >
          <Trash2 size={15} /> Delete my account
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Are you sure?</span>
          <button
            onClick={remove}
            disabled={loading}
            className="flex items-center gap-2 rounded-full bg-sale px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : "Yes, delete permanently"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-full border border-line px-5 py-2.5 text-sm hover:border-ink"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Shared ------------------------------ */

function Field({
  label,
  type = "text",
  value,
  onChange,
  className = "",
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-medium text-muted">{label}</label>
      <input type={type} value={value} onChange={onChange} className={inputCls} />
    </div>
  );
}

function Alert({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return (
    <p
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
        error ? "bg-sale/10 text-sale" : "bg-green-100 text-green-700"
      }`}
    >
      {error ? <AlertCircle size={15} /> : <Check size={15} />} {children}
    </p>
  );
}
