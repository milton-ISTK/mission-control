"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";
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
          <div className="max-w-2xl mx-auto">
            {mode === "html" ? (
              <ReactMarkdown
                className="prose prose-sm max-w-none"
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold mb-4 mt-6 text-[#1a1a1a]">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold mb-3 mt-5 text-[#1a1a1a]">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold mb-2 mt-4 text-[#1a1a1a]">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-base leading-[1.8] mb-4 text-[#1a1a1a]">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-[#1a1a1a]">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-[#1a1a1a]">
                      {children}
                    </em>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-4 text-[#1a1a1a] space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-4 text-[#1a1a1a] space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-base text-[#1a1a1a]">
                      {children}
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-zinc-300 pl-4 italic text-[#1a1a1a] mb-4">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-zinc-100 text-red-600 px-2 py-1 rounded font-mono text-sm">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-4 mb-4 overflow-x-auto">
                      {children}
                    </pre>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            ) : (
              <div className="text-[#1a1a1a] leading-[1.8] whitespace-pre-wrap break-words font-sans text-base">
                {content}
              </div>
            )}
          </div>
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
