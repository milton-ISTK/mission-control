"use client";

import { ReactNode, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 overflow-y-auto p-4" onClick={onClose}>
      <div
        className={cn(
          "w-full animate-scale-in rounded-2xl max-h-[85vh] overflow-y-auto flex flex-col bg-zinc-900 border border-zinc-700",
          sizes[size]
        )}
        style={{
          boxShadow: `
            0 8px 32px rgba(0,0,0,0.5),
            0 32px 64px rgba(0,0,0,0.3)
          `,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h2
              className="text-xl font-bold text-istk-text"
              style={{ textShadow: "0 0 15px rgba(255,107,0,0.15)" }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all duration-300 text-istk-textMuted hover:text-istk-text hover:bg-[rgba(255,107,0,0.06)] hover:border-[rgba(255,107,0,0.12)] border border-transparent hover:shadow-[0_0_8px_rgba(255,107,0,0.06)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
