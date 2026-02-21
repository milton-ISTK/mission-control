"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string; // HTML or plain text
  mode: "html" | "plain"; // How to render content
  children?: React.ReactNode; // Slot for action buttons (e.g., Approve/Reject)
}

export default function ContentLightbox({
  isOpen,
  onClose,
  title,
  content,
  mode,
  children,
}: ContentLightboxProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Handle Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isMounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-900/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] mx-4 flex flex-col rounded-xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-zinc-200 bg-zinc-50">
          <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-12 py-8 bg-white">
          {mode === "html" ? (
            <div
              className={cn(
                "prose prose-sm max-w-none",
                "prose-headings:text-zinc-900 prose-headings:font-bold",
                "prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl",
                "prose-p:text-zinc-700 prose-p:leading-relaxed prose-p:mb-4",
                "prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline",
                "prose-strong:text-zinc-900 prose-strong:font-bold",
                "prose-code:text-red-600 prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded",
                "prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-pre:rounded-lg prose-pre:p-4",
                "prose-ul:text-zinc-700 prose-ol:text-zinc-700",
                "prose-li:text-zinc-700 prose-li:mb-1",
                "prose-blockquote:border-zinc-300 prose-blockquote:text-zinc-600",
                "prose-hr:border-zinc-200"
              )}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="text-zinc-700 leading-relaxed whitespace-pre-wrap break-words font-sans">
              {content}
            </div>
          )}
        </div>

        {/* Footer (Action Buttons) */}
        {children && (
          <div className="px-8 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
