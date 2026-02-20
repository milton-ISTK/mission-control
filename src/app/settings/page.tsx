"use client";

import { useState, useEffect } from "react";
import { Key, Save, AlertCircle, ExternalLink } from "lucide-react";
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
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("llm_api_keys");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setApiKeys((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse stored API keys", e);
      }
    }
    setLoading(false);
  }, []);

  // Save to localStorage
  const handleSave = () => {
    localStorage.setItem("llm_api_keys", JSON.stringify(apiKeys));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
          Configure API keys for LLM providers used in research and content
          generation.
        </p>
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
            API keys are stored locally in your browser&apos;s localStorage.
            They are never sent to our servers or logged. Each key is only
            transmitted directly to the respective provider when executing
            research.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="glass-button-accent flex items-center gap-2 text-sm"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>

        {saved && (
          <span className="text-sm text-istk-success flex items-center gap-1 animate-in fade-in duration-200">
            ✓ Settings saved to local storage
          </span>
        )}
      </div>
    </div>
  );
}
