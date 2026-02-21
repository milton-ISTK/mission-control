"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDangerous = false,
  isLoading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error("Error in confirm dialog:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 overflow-y-auto p-4" onClick={onClose}>
      {/* Modal */}
      <div className="w-full max-w-sm rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 shadow-2xl p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Title */}
        <h2 className="text-lg font-bold text-istk-text mb-2">{title}</h2>

        {/* Message */}
        <p className="text-sm text-istk-textMuted mb-6">{message}</p>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-istk-textMuted hover:text-istk-text hover:bg-zinc-800/50 border border-zinc-700/50 transition-all duration-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-300 disabled:opacity-50 flex items-center gap-2",
              isDangerous
                ? "bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30 hover:border-red-500/60"
                : "bg-istk-accent/20 text-istk-accent border-istk-accent/40 hover:bg-istk-accent/30 hover:border-istk-accent/60"
            )}
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {isDangerous ? "Delete" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
