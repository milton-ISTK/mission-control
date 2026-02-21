"use client";

import { useState, useEffect } from "react";
import { Key, Save, AlertCircle, ExternalLink, CheckCircle, AlertTriangle, Users, Plus, Trash2, Edit2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PROVIDERS, type LLMProvider } from "@/lib/llm-models";
import { Id } from "../../../convex/_generated/dataModel";

type ProviderApiKeys = Record<LLMProvider, string>;

const emptyKeys: ProviderApiKeys = {
  anthropic: "",
  openai: "",
  google: "",
  meta: "",
  minimax: "",
  grok: "",
};

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ProviderApiKeys>({ ...emptyKeys });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Author management state
  const [showAuthorForm, setShowAuthorForm] = useState(false);
  const [editingAuthorId, setEditingAuthorId] = useState<Id<"authors"> | null>(null);
  const [authorForm, setAuthorForm] = useState({ name: "", title: "", bio: "", writingStyle: "", voiceNotes: "", isActive: true });
  const [authorError, setAuthorError] = useState("");
  const [authorSaving, setAuthorSaving] = useState(false);

  // Read daemon status from Convex (real-time)
  const daemonStatusData = useQuery(api.systemStatus.getDaemonStatus);
  const daemonStatus = daemonStatusData?.status ?? "unknown";

  // Queries
  const authors = useQuery(api.authors.getAuthors, { includeInactive: true });

  // Convex mutations
  const saveApiKey = useMutation(api.contentPipeline.saveApiKey);
  const createAuthor = useMutation(api.authors.createAuthor);
  const updateAuthor = useMutation(api.authors.updateAuthor);
  const deleteAuthor = useMutation(api.authors.deleteAuthor);

  // Load API keys on mount
  useEffect(() => {
    setLoading(false);
  }, []);

  // Save to Convex via mutation; sync daemon will poll and write to local file
  const handleSave = async () => {
    setError("");
    setSaved(false);

    try {
      let savedCount = 0;

      // Call Convex mutation for each provider's key
      for (const [provider, key] of Object.entries(apiKeys)) {
        if (key.trim()) {
          await saveApiKey({
            provider,
            key: key.trim(),
          });
          savedCount++;
        }
      }

      if (savedCount > 0) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError("No API keys to save. Please enter at least one key.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to save keys: ${message}`);
      console.error("Save error:", err);
    }
  };

  const handleChange = (provider: LLMProvider, value: string) => {
    setApiKeys((prev) => ({ ...prev, [provider]: value }));
  };

  const handleAuthorSave = async () => {
    setAuthorError("");
    if (!authorForm.name.trim() || !authorForm.title.trim()) {
      setAuthorError("Name and title are required");
      return;
    }

    setAuthorSaving(true);
    try {
      if (editingAuthorId) {
        await updateAuthor({
          id: editingAuthorId,
          name: authorForm.name.trim(),
          title: authorForm.title.trim(),
          bio: authorForm.bio.trim() || undefined,
          writingStyle: authorForm.writingStyle.trim() || undefined,
          voiceNotes: authorForm.voiceNotes.trim() || undefined,
          isActive: authorForm.isActive,
        });
      } else {
        await createAuthor({
          name: authorForm.name.trim(),
          title: authorForm.title.trim(),
          bio: authorForm.bio.trim() || undefined,
          writingStyle: authorForm.writingStyle.trim() || undefined,
          voiceNotes: authorForm.voiceNotes.trim() || undefined,
          isActive: authorForm.isActive,
        });
      }
      setAuthorForm({ name: "", title: "", bio: "", writingStyle: "", voiceNotes: "", isActive: true });
      setEditingAuthorId(null);
      setShowAuthorForm(false);
    } catch (err) {
      setAuthorError(err instanceof Error ? err.message : "Failed to save author");
    } finally {
      setAuthorSaving(false);
    }
  };

  const handleDeleteAuthor = async (id: Id<"authors">) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      await deleteAuthor({ id });
    } catch (err) {
      setAuthorError(err instanceof Error ? err.message : "Failed to delete author");
    }
  };

  const handleEditAuthor = (author: any) => {
    setAuthorForm({
      name: author.name,
      title: author.title,
      bio: author.bio || "",
      writingStyle: author.writingStyle || "",
      voiceNotes: author.voiceNotes || "",
      isActive: author.isActive,
    });
    setEditingAuthorId(author._id);
    setShowAuthorForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-istk-textMuted">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold text-gradient mb-2"
          style={{ filter: "drop-shadow(0 0 20px rgba(255,107,0,0.2))" }}
        >
          Settings
        </h1>
        <p className="text-istk-textMuted">
          Configure API keys for LLM providers. Keys are stored in Convex, synced to Milton's daemon every 10 seconds, and written to local disk only (600 permissions).
        </p>
      </div>

      {/* Daemon Status */}
      <div
        className="flex items-center gap-3 p-4 rounded-xl"
        style={{
          background:
            daemonStatus === "online"
              ? "rgba(52,211,153,0.04)"
              : "rgba(239,68,68,0.04)",
          border:
            daemonStatus === "online"
              ? "1px solid rgba(52,211,153,0.2)"
              : "1px solid rgba(239,68,68,0.2)",
        }}
      >
        {daemonStatus === "online" ? (
          <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
        )}
        <div className="text-sm">
          <p className="font-semibold text-istk-text">
            Daemon Status: {daemonStatus === "online" ? "🟢 Online" : "🔴 Offline"}
          </p>
          <p className="text-istk-textMuted text-xs mt-1">
            {daemonStatus === "online"
              ? "Connected to Mission Control daemon on Milton's Mac Mini"
              : "Cannot reach daemon. Make sure it's running: python3 /Users/milton/scripts/content-pipeline-daemon.py"}
          </p>
        </div>
      </div>

      {/* API Keys Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-istk-accent" />
          <h2 className="text-lg font-semibold text-istk-text">
            LLM Provider API Keys
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {PROVIDERS.map((provider) => {
            const hasKey = apiKeys[provider.key]?.trim().length > 0;
            return (
              <div
                key={provider.key}
                className="glass-card p-5 transition-all duration-200"
                style={{
                  border: hasKey
                    ? "1px solid rgba(52,211,153,0.2)"
                    : "1px solid rgba(255,107,0,0.08)",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-istk-text flex items-center gap-2">
                      {provider.name}
                      {hasKey && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: "rgb(52,211,153)",
                            boxShadow: "0 0 6px rgba(52,211,153,0.5)",
                          }}
                        />
                      )}
                    </h3>
                    <p className="text-sm text-istk-textMuted mt-0.5">
                      {provider.description}
                    </p>
                  </div>
                  <a
                    href={provider.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-istk-accent hover:text-istk-text transition-colors flex items-center gap-1 shrink-0"
                  >
                    Get Key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <input
                  type="password"
                  value={apiKeys[provider.key]}
                  onChange={(e) => handleChange(provider.key, e.target.value)}
                  placeholder={provider.placeholder}
                  className="w-full px-4 py-2 rounded-lg text-sm"
                  style={{
                    background: "rgba(10,10,14,0.60)",
                    border: "1px solid rgba(255,107,0,0.12)",
                    color: "rgb(240,240,245)",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Box */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{
          background: "rgba(0,217,255,0.04)",
          border: "1px solid rgba(0,217,255,0.12)",
        }}
      >
        <AlertCircle className="w-5 h-5 text-istk-cyan shrink-0 mt-0.5" />
        <div className="text-sm text-istk-textMuted">
          <p className="font-semibold text-istk-text mb-1">
            Privacy &amp; Security
          </p>
          <p>
            API keys are stored in Convex as the source of truth. This page calls the Convex mutation directly to save keys. The sync daemon on Milton's Mac Mini polls Convex every 10 seconds and 
            writes keys to <code className="text-istk-accent">~/.config/mission-control/api-keys.json</code> with 600 permissions 
            (read-only to user). Keys are never stored in browser localStorage or Vercel. They are only used by the daemon to call LLM APIs during research.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{
            background: "rgba(239,68,68,0.04)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="glass-button-accent flex items-center gap-2 text-sm"
        >
          <Save className="w-4 h-4" />
          Save to Daemon
        </button>

        {saved && (
          <span className="text-sm text-istk-success flex items-center gap-1 animate-in fade-in duration-200">
            ✓ Keys saved to daemon
          </span>
        )}
      </div>

      {/* Blog Authors Section */}
      <div className="border-t border-istk-border/10 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-istk-accent" />
          <h2 className="text-lg font-semibold text-istk-text">Blog Authors</h2>
        </div>

        {/* Author List */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          {authors && authors.length > 0 ? (
            authors.map((author: any) => (
              <div
                key={author._id}
                className="p-4 rounded-lg border"
                style={{
                  background: author.isActive ? "rgba(52,211,153,0.04)" : "rgba(100,100,100,0.04)",
                  border: author.isActive ? "1px solid rgba(52,211,153,0.12)" : "1px solid rgba(100,100,100,0.12)",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-istk-text">{author.name}</h3>
                    <p className="text-xs text-istk-textMuted mt-1">{author.title}</p>
                    {author.writingStyle && (
                      <p className="text-xs text-istk-textMuted mt-2 italic">{author.writingStyle}</p>
                    )}
                    {!author.isActive && (
                      <p className="text-xs text-istk-warning mt-2">⚠️ Inactive</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEditAuthor(author)}
                      className="p-2 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 transition-all"
                      title="Edit author"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAuthor(author._id)}
                      className="p-2 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 transition-all"
                      title="Delete author"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-istk-textMuted italic">No authors yet</p>
          )}
        </div>

        {/* Author Form */}
        {showAuthorForm && (
          <div className="p-4 rounded-lg border border-istk-border/20 bg-istk-bg/50 space-y-4">
            <h3 className="font-semibold text-istk-text">
              {editingAuthorId ? "Edit Author" : "Add New Author"}
            </h3>

            {authorError && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-sm text-red-300">
                {authorError}
              </div>
            )}

            <input
              type="text"
              placeholder="Author Name (required)"
              value={authorForm.name}
              onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: "rgba(10,10,14,0.60)",
                border: "1px solid rgba(255,107,0,0.12)",
                color: "rgb(240,240,245)",
              }}
            />

            <input
              type="text"
              placeholder="Title (required) - e.g., CEO, IntelliStake Technologies"
              value={authorForm.title}
              onChange={(e) => setAuthorForm({ ...authorForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: "rgba(10,10,14,0.60)",
                border: "1px solid rgba(255,107,0,0.12)",
                color: "rgb(240,240,245)",
              }}
            />

            <textarea
              placeholder="Bio (optional)"
              value={authorForm.bio}
              onChange={(e) => setAuthorForm({ ...authorForm, bio: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm min-h-[60px]"
              style={{
                background: "rgba(10,10,14,0.60)",
                border: "1px solid rgba(255,107,0,0.12)",
                color: "rgb(240,240,245)",
              }}
            />

            <textarea
              placeholder="Writing Style (optional) - How this author writes"
              value={authorForm.writingStyle}
              onChange={(e) => setAuthorForm({ ...authorForm, writingStyle: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm min-h-[80px]"
              style={{
                background: "rgba(10,10,14,0.60)",
                border: "1px solid rgba(255,107,0,0.12)",
                color: "rgb(240,240,245)",
              }}
            />

            <textarea
              placeholder="Voice Notes (optional) - Additional personality notes"
              value={authorForm.voiceNotes}
              onChange={(e) => setAuthorForm({ ...authorForm, voiceNotes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm min-h-[80px]"
              style={{
                background: "rgba(10,10,14,0.60)",
                border: "1px solid rgba(255,107,0,0.12)",
                color: "rgb(240,240,245)",
              }}
            />

            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={authorForm.isActive}
                onChange={(e) => setAuthorForm({ ...authorForm, isActive: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-istk-text">Active</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowAuthorForm(false);
                  setEditingAuthorId(null);
                  setAuthorForm({ name: "", title: "", bio: "", writingStyle: "", voiceNotes: "", isActive: true });
                  setAuthorError("");
                }}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-istk-textMuted border border-istk-border/20 hover:bg-istk-surfaceLight transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAuthorSave}
                disabled={authorSaving}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-istk-accent/20 text-istk-accent border border-istk-accent/40 hover:bg-istk-accent/30 transition-all disabled:opacity-50"
              >
                {authorSaving ? "Saving..." : editingAuthorId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        )}

        {!showAuthorForm && (
          <button
            onClick={() => setShowAuthorForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-istk-accent/20 text-istk-accent border border-istk-accent/40 hover:bg-istk-accent/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Author
          </button>
        )}
      </div>
    </div>
  );
}
