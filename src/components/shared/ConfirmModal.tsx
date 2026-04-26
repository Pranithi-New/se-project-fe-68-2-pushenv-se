"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: "danger" | "default";
};

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "danger",
}: Props) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal background"
        className="fixed inset-0 h-full w-full cursor-default border-none bg-black/50 outline-none"
        onClick={onClose}
        tabIndex={-1}
      />
      <div className="relative z-10 mx-4 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            {variant === "danger" && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-50">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
              </div>
            )}
            <p className="text-sm font-semibold text-slate-900">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {description && (
          <p className="px-5 py-4 text-sm text-slate-500">{description}</p>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-xs font-medium text-white transition-colors disabled:opacity-50 ${
              variant === "danger"
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-slate-900 hover:bg-slate-700"
            }`}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
