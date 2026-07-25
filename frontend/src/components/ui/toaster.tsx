"use client";

import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useToastStore, type ToastType } from "@/store/toast-store";

const ICON = { success: CheckCircle2, error: XCircle, info: Info } as const;

const ACCENT: Record<ToastType, string> = {
  success: "border-l-emerald-600",
  error: "border-l-sale",
  info: "border-l-accent-dark",
};

const ICON_COLOR: Record<ToastType, string> = {
  success: "text-emerald-600",
  error: "text-sale",
  info: "text-accent-dark",
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-5 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:right-5 sm:px-0">
      {toasts.map((t) => {
        const Icon = ICON[t.type];
        return (
          <div
            key={t.id}
            role="status"
            className={`animate-fade-up pointer-events-auto flex items-start gap-3 rounded-xl border border-line border-l-4 bg-background px-4 py-3 shadow-lg ${ACCENT[t.type]}`}
          >
            <Icon size={18} className={`mt-0.5 shrink-0 ${ICON_COLOR[t.type]}`} />
            <p className="flex-1 text-sm text-ink">{t.message}</p>
            <button
              aria-label="Dismiss"
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-muted transition hover:text-ink"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
