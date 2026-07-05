"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useConfirmStore } from "@/store/confirm-store";
import { Button } from "@/components/ui/button";

/**
 * Global confirmation modal driven by the confirm store. Mount once (in
 * Providers); trigger from anywhere with `await confirm({ ... })`.
 */
export function ConfirmDialog() {
  const { open, options, respond } = useConfirmStore();

  // Close on Escape (treated as cancel).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") respond(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, respond]);

  if (!open || !options) return null;

  const {
    title = "Are you sure?",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    destructive = false,
  } = options;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={() => respond(false)}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        className="animate-fade-up relative w-full max-w-sm rounded-2xl bg-background p-6 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              destructive ? "bg-sale/10 text-sale" : "bg-accent/20 text-accent-dark"
            }`}
          >
            <AlertTriangle size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-medium">{title}</h2>
            <p className="mt-1 text-sm text-muted">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => respond(false)}
            className="rounded-full border border-line px-5 py-2 text-sm hover:border-ink"
          >
            {cancelText}
          </button>
          <Button
            onClick={() => respond(true)}
            size="sm"
            className={destructive ? "bg-sale hover:bg-sale/90" : ""}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
