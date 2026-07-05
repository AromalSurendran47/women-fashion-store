"use client";

import { create } from "zustand";

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  /** Style the confirm button as a destructive (red) action. */
  destructive?: boolean;
}

interface ConfirmState {
  open: boolean;
  options: ConfirmOptions | null;
  resolve: ((value: boolean) => void) | null;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  respond: (value: boolean) => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  options: null,
  resolve: null,
  confirm: (options) =>
    new Promise<boolean>((resolve) => set({ open: true, options, resolve })),
  respond: (value) => {
    get().resolve?.(value);
    set({ open: false, options: null, resolve: null });
  },
}));

/** Promise-based confirm usable anywhere: `if (await confirm({...})) {...}`. */
export const confirm = (options: ConfirmOptions) =>
  useConfirmStore.getState().confirm(options);
