"use client";

import { BookOpen, Calendar, Tag, X } from "lucide-react";
import { useMemoryCategories, useMemoryTags } from "@/hooks/useMemories";
import { cn } from "@/lib/utils";

interface MemorySidebarProps {
  selectedCategory: string | undefined;
  onSelectCategory: (category: string | undefined) => void;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearFilters: () => void;
}

const categoryIcons: Record<string, typeof BookOpen> = {
  "long-term": BookOpen,
  "daily-log": Calendar,
};

export default function MemorySidebar({
  selectedCategory,
  onSelectCategory,
  selectedTags,
  onToggleTag,
  onClearFilters,
}: MemorySidebarProps) {
  const categories = useMemoryCategories();
  const tags = useMemoryTags();

  const hasActiveFilters = selectedCategory || selectedTags.length > 0;

  return (
    <div className="w-56 shrink-0 neu-sidebar p-4 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-istk-text uppercase tracking-wider">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-[10px] text-istk-textDim hover:text-istk-accent transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-1.5">
        <h4 className="text-[10px] text-istk-textDim uppercase tracking-wider font-semibold mb-1">
          Categories
        </h4>

        {/* All */}
        <button
          onClick={() => onSelectCategory(undefined)}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
            !selectedCategory
              ? "bg-istk-accent/10 text-istk-accent shadow-neu-sm border border-istk-accent/20"
              : "text-istk-textMuted hover:text-istk-text hover:bg-istk-surfaceLight"
          )}
        >
          <BookOpen className="w-4 h-4" />
          All Memories
        </button>

        {categories?.map((cat) => {
          const Icon = categoryIcons[cat] || BookOpen;
          const isActive = selectedCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(isActive ? undefined : cat)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-istk-accent/10 text-istk-accent shadow-neu-sm border border-istk-accent/20"
                  : "text-istk-textMuted hover:text-istk-text hover:bg-istk-surfaceLight"
              )}
            >
              <Icon className="w-4 h-4" />
              {cat}
            </button>
          );
        })}
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-[10px] text-istk-textDim uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Tag className="w-3 h-3" />
            Tags
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => {
              const isActive = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => onToggleTag(tag)}
                  className={cn(
                    "text-[10px] px-2 py-1 rounded-full font-medium transition-all",
                    isActive
                      ? "bg-istk-purple/20 text-istk-purple border border-istk-purple/30"
                      : "bg-istk-surfaceLight text-istk-textDim hover:text-istk-textMuted border border-transparent"
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
