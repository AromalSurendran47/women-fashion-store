"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useMounted } from "@/hooks/use-mounted";

/**
 * Client-side route guard. Redirects unauthenticated users to /login and
 * non-admins away from admin-only areas. Renders a loader until the persisted
 * auth state has hydrated, to avoid a flash of protected content.
 */
export function AuthGuard({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const mounted = useMounted();
  const router = useRouter();
  const { user, token } = useAuthStore();

  const allowed = Boolean(token) && (!adminOnly || user?.role === "admin");

  useEffect(() => {
    if (!mounted) return;
    if (!token) router.replace(`/login?redirect=${adminOnly ? "/admin" : "/profile"}`);
    else if (adminOnly && user?.role !== "admin") router.replace("/");
  }, [mounted, token, user, adminOnly, router]);

  if (!mounted || !allowed) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-accent-dark" size={28} />
      </div>
    );
  }

  return <>{children}</>;
}
