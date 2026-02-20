"use client";

import { useState, useEffect } from "react";
import { Settings, Key, Save, AlertCircle } from "lucide-react";

type ProviderApiKeys = {
  anthropic: string;
  openai: string;
  grok: string;
  meta: string;
  minimax: string;
};

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ProviderApiKeys>({
    anthropic: "",
    openai: "",
    grok: "",
    meta: "",
    minimax: "",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("llm_api_keys");
    if (stored) {
      try {
        setApiKeys(JSON.parse(stored));
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
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (provider: keyof ProviderApiKeys, value: string) => {
    setApiKeys((prev) => ({ ...prev, [provider]: value }));
  };

  const providers = [
    {
      name: "Anthropic",
      key: "anthropic",
      description: "Claude Haiku, Opus, Sonnet",
      docs: "https://console.anthropic.com",
      placeholder: "sk-ant-...",
    },
    {
      name: "OpenAI",
      key: "openai",
      description: "GPT-4, GPT-4o, GPT-4 Turbo",
      docs: "https://platform.openai.com/api-keys",
      placeholder: "sk-...",
    },
    {
      name: "Grok (xAI)",
      key: "grok",
      description: "Grok-2, Grok-3",
      docs: "https://console.x.ai",
      placeholder: "xai-...",
    },
    {
      name: "Meta",
      key: "meta",
      description: "Llama 3.1, Llama 3.2",
      docs: "https://www.llama.com",
      placeholder: "llama-api-key",
    },
    {
      name: "MiniMax",
      key: "minimax",
      description: "MiniMax 2.5, MiniMax 2.1, MiniMax 1.5 Fast",
      docs: "https://www.minimaxi.com",
      placeholder: "minimax-api-key",
    },
  ] as const;

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
          Configure API keys for LLM providers used in research and content generation.
        </p>
      </div>

      {/* API Keys Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-istk-accent" />
          <h2 className="text-lg font-semibold text-istk-text">LLM Provider API Keys</h2>
        </div>

        <div className="flex flex-col gap-4">
          {providers.map((provider) => (
            <div
              key={provider.key}
              className="glass-card p-5"
              style={{
                border: "1px solid rgba(255,107,0,0.08)",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-istk-text">
                    {provider.name}
                  </h3>
                  <p className="text-sm text-istk-textMuted mt-0.5">
                    {provider.description}
                  </p>
                </div>
                <a
                  href={provider.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-istk-accent hover:text-istk-text transition-colors"
                >
                  Get API Key →
                </a>
              </div>

              <input
                type="password"
                value={apiKeys[provider.key as keyof ProviderApiKeys]}
                onChange={(e) =>
                  handleChange(provider.key as keyof ProviderApiKeys, e.target.value)
                }
                placeholder={provider.placeholder}
                className="w-full px-4 py-2 rounded-lg text-sm"
                style={{
                  background: "rgba(10,10,14,0.60)",
                  border: "1px solid rgba(255,107,0,0.12)",
                  color: "rgb(240,240,245)",
                }}
              />
            </div>
          ))}
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
          <p className="font-semibold text-istk-text mb-1">Privacy & Security</p>
          <p>
            API keys are stored locally in your browser. They are never sent to our servers or
            logged. Each API key is only transmitted directly to the provider when needed.
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
          <span className="text-sm text-istk-success flex items-center gap-1">
            ✓ Settings saved to local storage
          </span>
        )}
      </div>
    </div>
  );
}
