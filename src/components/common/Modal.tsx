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
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className={cn(
          "w-full mx-4 animate-scale-in rounded-2xl p-6 backdrop-blur-xl",
          sizes[size]
        )}
        style={{
          background: "rgba(15,15,20,0.80)",
          border: "1px solid rgba(255,107,0,0.15)",
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.04),
            0 0 15px rgba(255,107,0,0.10),
            0 0 40px rgba(255,107,0,0.04),
            0 8px 32px rgba(0,0,0,0.5),
            0 32px 64px rgba(0,0,0,0.3)
          `,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-6">
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
        {children}
      </div>
    </div>
  );
}
