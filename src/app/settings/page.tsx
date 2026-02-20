"use client";

import { useState, useEffect } from "react";
import { Settings, Key, Save, AlertCircle, ExternalLink } from "lucide-react";

type ProviderApiKeys = {
  anthropic: string;
  openai: string;
  xai: string;
  google: string;
  deepseek: string;
  minimax: string;
  together: string;
  groq: string;
};

const emptyKeys: ProviderApiKeys = {
  anthropic: "",
  openai: "",
  xai: "",
  google: "",
  deepseek: "",
  minimax: "",
  together: "",
  groq: "",
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

  const handleChange = (provider: keyof ProviderApiKeys, value: string) => {
    setApiKeys((prev) => ({ ...prev, [provider]: value }));
  };

  const providers: {
    name: string;
    key: keyof ProviderApiKeys;
    description: string;
    docs: string;
    placeholder: string;
  }[] = [
    {
      name: "Anthropic",
      key: "anthropic",
      description: "Claude Opus 4, Sonnet 4, Haiku 4.5",
      docs: "https://console.anthropic.com",
      placeholder: "sk-ant-...",
    },
    {
      name: "OpenAI",
      key: "openai",
      description: "GPT-4.1, GPT-4o, o3, o4 Mini",
      docs: "https://platform.openai.com/api-keys",
      placeholder: "sk-...",
    },
    {
      name: "xAI (Grok)",
      key: "xai",
      description: "Grok 3, Grok 3 Mini",
      docs: "https://console.x.ai",
      placeholder: "xai-...",
    },
    {
      name: "Google (Gemini)",
      key: "google",
      description: "Gemini 2.5 Pro, 2.5 Flash, 2.0 Flash",
      docs: "https://aistudio.google.com/apikey",
      placeholder: "AIza...",
    },
    {
      name: "DeepSeek",
      key: "deepseek",
      description: "DeepSeek V3, DeepSeek R1",
      docs: "https://platform.deepseek.com/api_keys",
      placeholder: "sk-...",
    },
    {
      name: "MiniMax",
      key: "minimax",
      description: "MiniMax M1, T1, 2.5, 2.1, 1.5 Fast",
      docs: "https://www.minimaxi.com",
      placeholder: "minimax-...",
    },
    {
      name: "Together AI",
      key: "together",
      description: "Meta Llama 4 Maverick, Scout, Llama 3.3 70B",
      docs: "https://api.together.xyz/settings/api-keys",
      placeholder: "tok-...",
    },
    {
      name: "Groq",
      key: "groq",
      description: "Meta Llama 3.3 70B, Llama 4 Scout & Maverick",
      docs: "https://console.groq.com/keys",
      placeholder: "gsk_...",
    },
  ];

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
          {providers.map((provider) => {
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
