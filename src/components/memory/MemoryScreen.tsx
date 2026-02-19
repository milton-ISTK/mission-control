"use client";

import { useState, useMemo } from "react";
import { useMemories, useSearchMemories } from "@/hooks/useMemories";
import { useFileWatcher } from "@/hooks/useFileWatcher";
import MemorySidebar from "./MemorySidebar";
import MemorySearch from "./MemorySearch";
import MemoryCard from "./MemoryCard";
import MemoryDetails from "./MemoryDetails";
import { PageLoader } from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import { Brain } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

interface Memory {
  _id: Id<"memories">;
  title: string;
  content: string;
  source: string;
  category?: string;
  tags: string[];
  isToday: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export default function MemoryScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMemory, setExpandedMemory] = useState<Memory | null>(null);

  // Sync files from disk every 2 seconds
  useFileWatcher(2000);

  // Fetch memories
  const memories = useMemories(selectedCategory);
  const searchResults = useSearchMemories(searchQuery, selectedCategory);

  // Filter by tags
  const filteredMemories = useMemo(() => {
    const source = searchQuery.length >= 2 ? searchResults : memories;
    if (!source) return undefined;

    if (selectedTags.length === 0) return source as Memory[];

    return (source as Memory[]).filter((m) =>
      selectedTags.some((tag) => m.tags.includes(tag))
    );
  }, [memories, searchResults, selectedTags, searchQuery]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedTags([]);
    setSearchQuery("");
  };

  // Show detail view
  if (expandedMemory) {
    return (
      <MemoryDetails
        memory={expandedMemory}
        onBack={() => setExpandedMemory(null)}
      />
    );
  }

  return (
    <div className="flex gap-6 min-h-[600px]">
      {/* Sidebar */}
      <MemorySidebar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedTags={selectedTags}
        onToggleTag={handleToggleTag}
        onClearFilters={handleClearFilters}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Search */}
        <MemorySearch
          query={searchQuery}
          onQueryChange={setSearchQuery}
        />

        {/* Active Filters */}
        {(selectedCategory || selectedTags.length > 0) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-istk-textDim">Filters:</span>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(undefined)}
                className="text-xs px-2 py-0.5 rounded-full bg-istk-accent/20 text-istk-accent hover:bg-istk-accent/30 transition-colors"
              >
                {selectedCategory} ✕
              </button>
            )}
            {selectedTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleToggleTag(tag)}
                className="text-xs px-2 py-0.5 rounded-full bg-istk-purple/20 text-istk-purple hover:bg-istk-purple/30 transition-colors"
              >
                {tag} ✕
              </button>
            ))}
          </div>
        )}

        {/* Memory List */}
        {filteredMemories === undefined ? (
          <PageLoader label="Loading memories..." />
        ) : filteredMemories.length === 0 ? (
          <EmptyState
            icon={Brain}
            title="No memories found"
            description={
              searchQuery
                ? "Try a different search term"
                : "Memory files will appear here as they sync from your workspace"
            }
            actionLabel={searchQuery ? "Clear Search" : undefined}
            onAction={searchQuery ? () => setSearchQuery("") : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMemories.map((memory) => (
              <MemoryCard
                key={memory._id}
                memory={memory}
                onClick={() => setExpandedMemory(memory)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
