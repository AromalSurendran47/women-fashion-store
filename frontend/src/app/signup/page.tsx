"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { AuthShell, authInputCls } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function SignupPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ first: "", last: "", email: "", phone: "", password: "" });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!agreed) return setError("Please accept the Terms of Service to continue.");
    setLoading(true);
    const res = await register({
      name: `${form.first} ${form.last}`.trim(),
      email: form.email,
      phone: form.phone,
      password: form.password,
    });
    if (!res.ok) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Sruvalle and get 10% off your first order."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ink underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {error && (
          <p className="flex items-center gap-2 rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">
            <AlertCircle size={15} /> {error}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="First name" value={form.first} onChange={set("first")} className={authInputCls} />
          <input required placeholder="Last name" value={form.last} onChange={set("last")} className={authInputCls} />
        </div>
        <input required type="email" placeholder="Email address" value={form.email} onChange={set("email")} className={authInputCls} />
        <input placeholder="Phone number" value={form.phone} onChange={set("phone")} className={authInputCls} />
        <input required type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={set("password")} className={authInputCls} />
        <label className="flex items-start gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 accent-ink"
          />
          I agree to Sruvalle&apos;s Terms of Service and Privacy Policy.
        </label>
        <Button type="submit" block className="h-12" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Create Account"}
        </Button>
      </form>
    </AuthShell>
  );
}
