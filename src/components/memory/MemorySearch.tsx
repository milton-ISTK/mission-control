"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemorySearchProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export default function MemorySearch({ query, onQueryChange }: MemorySearchProps) {
  const [localValue, setLocalValue] = useState(query);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce: propagate to parent after 300ms of no typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      onQueryChange(localValue);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localValue, onQueryChange]);

  // Sync external changes
  useEffect(() => {
    if (query !== localValue) {
      setLocalValue(query);
    }
  }, [query]);

  const handleClear = useCallback(() => {
    setLocalValue("");
    onQueryChange("");
    inputRef.current?.focus();
  }, [onQueryChange]);

  // Keyboard shortcut: Cmd/Ctrl + K to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <Search className="w-4 h-4 text-istk-textDim" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="Search memories... (⌘K)"
        className={cn(
          "neu-input pl-11 pr-10",
          localValue && "border-istk-accent/30"
        )}
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-istk-textDim hover:text-istk-text transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
