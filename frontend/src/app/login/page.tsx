"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { AuthShell, authInputCls } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(email, password);
    if (!res.ok) {
      setError(res.error);
      setLoading(false);
    }
    // on success, useAuth redirects away
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your account."
      footer={
        <>
          New to Sruvalle?{" "}
          <Link href="/signup" className="font-medium text-ink underline">
            Create an account
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
        <input
          required
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={authInputCls}
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={authInputCls}
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted">
            <input type="checkbox" className="accent-ink" /> Remember me
          </label>
          <Link href="/forgot-password" className="text-muted hover:text-ink">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" block className="h-12" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 rounded-xl bg-secondary p-3 text-center text-xs text-muted">
        <span className="font-medium text-ink">Demo admin:</span> admin@sruvalle.in ·{" "}
        <span className="font-medium text-ink">Password123</span>
      </div>
    </AuthShell>
  );
}
