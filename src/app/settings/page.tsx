"use client";

import { useState, useEffect } from "react";
import { Key, Save, AlertCircle, ExternalLink, CheckCircle, AlertTriangle } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PROVIDERS, type LLMProvider } from "@/lib/llm-models";

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

  // Read daemon status from Convex (real-time)
  const daemonStatusData = useQuery(api.systemStatus.getDaemonStatus);
  const daemonStatus = daemonStatusData?.status ?? "unknown";

  // Convex mutations for API key management
  const saveApiKey = useMutation(api.contentPipeline.saveApiKey);

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
    </div>
  );
}
