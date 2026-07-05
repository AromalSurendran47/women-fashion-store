"use client";

import Link from "next/link";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { AuthShell, authInputCls } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-ink underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-line py-10 text-center">
          <MailCheck size={32} className="text-accent-dark" />
          <p className="text-sm text-muted">
            If an account exists for that email, a reset link is on its way.
          </p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="flex flex-col gap-4"
        >
          <input required type="email" placeholder="Email address" className={authInputCls} />
          <Button type="submit" block className="h-12">
            Send Reset Link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
