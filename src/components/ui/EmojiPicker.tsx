"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// Curated emoji grid — agent-relevant categories
const EMOJI_GROUPS = [
  {
    label: "Work",
    emojis: [
      "🔬", "📊", "📰", "✍️", "🧑", "🏗️", "💡", "🎨", "📝", "📢",
      "🤖", "⚡", "🔍", "📡", "🧠", "💻", "📋", "🔧", "⚙️", "🛠️",
    ],
  },
  {
    label: "Creative",
    emojis: [
      "🎯", "🎬", "🎭", "🎪", "🖊️", "🖋️", "📸", "🎵", "🎶", "🎤",
      "📐", "🖼️", "🎞️", "📺", "🔮", "💎", "🌟", "✨", "🔥", "💥",
    ],
  },
  {
    label: "Objects",
    emojis: [
      "📦", "📁", "📂", "🗂️", "📇", "📈", "📉", "🗞️", "📮", "📬",
      "🔑", "🗝️", "🔐", "🔒", "🛡️", "⚔️", "🏹", "🧲", "🔭", "🧪",
    ],
  },
  {
    label: "Symbols",
    emojis: [
      "♻️", "🔄", "⏩", "⏪", "⏫", "🔀", "🔁", "🔂", "▶️", "⏸️",
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💯", "🏆",
    ],
  },
];

interface EmojiPickerProps {
  value?: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);

  return (
    <div className="relative">
      {/* Current emoji button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-lg border-2 transition-colors flex items-center justify-center text-3xl cursor-pointer",
          isOpen
            ? "border-istk-accent bg-istk-accent/10"
            : "border-zinc-700 hover:border-istk-accent bg-zinc-800/50"
        )}
        title="Change agent icon"
      >
        {value || "🤖"}
      </button>

      {/* Picker dropdown */}
      {isOpen && (
        <>
          {/* Backdrop to close */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-16 left-0 z-50 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Group tabs */}
            <div className="flex border-b border-zinc-700">
              {EMOJI_GROUPS.map((group, i) => (
                <button
                  key={group.label}
                  onClick={() => setActiveGroup(i)}
                  className={cn(
                    "flex-1 py-2 text-xs font-medium transition-colors",
                    activeGroup === i
                      ? "text-istk-accent border-b-2 border-istk-accent bg-zinc-800/50"
                      : "text-istk-textMuted hover:text-istk-text"
                  )}
                >
                  {group.label}
                </button>
              ))}
            </div>

            {/* Emoji grid */}
            <div className="p-3 grid grid-cols-10 gap-1 max-h-48 overflow-y-auto">
              {EMOJI_GROUPS[activeGroup].emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onChange(emoji);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-7 h-7 flex items-center justify-center text-lg rounded hover:bg-zinc-700 transition-colors cursor-pointer",
                    value === emoji
                      ? "bg-istk-accent/20 ring-1 ring-istk-accent"
                      : ""
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
