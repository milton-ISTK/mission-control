/**
 * LLM Models Registry — All providers, models, and helper functions
 * Used by: ResearchInput, Settings, CreateSubagentModal
 * Model IDs must match exact API model identifiers for daemon to work correctly
 */

// ---- Types ----

export type LLMProvider = "anthropic" | "openai" | "google" | "meta" | "minimax" | "grok";

/** @deprecated Use LLMProvider instead */
export type Provider = LLMProvider;

export interface LLMModel {
  id: string;                    // Exact API model ID (e.g. claude-3-5-haiku-20241022)
  displayName: string;
  provider: LLMProvider;
  group: string;                 // Display group for dropdown (e.g. "Anthropic (Claude)")
  description?: string;
}

export interface ProviderInfo {
  key: LLMProvider;
  name: string;
  description: string;
  docs: string;
  placeholder: string;
  apiBaseUrl: string;            // API endpoint base URL
}

// ---- Provider Registry ----

export const PROVIDERS: ProviderInfo[] = [
  {
    key: "anthropic",
    name: "Anthropic",
    description: "Claude models — Haiku, Sonnet, Opus",
    docs: "https://console.anthropic.com/settings/keys",
    placeholder: "sk-ant-api03-…",
    apiBaseUrl: "https://api.anthropic.com/v1/messages",
  },
  {
    key: "openai",
    name: "OpenAI",
    description: "GPT and o-series models",
    docs: "https://platform.openai.com/api-keys",
    placeholder: "sk-proj-…",
    apiBaseUrl: "https://api.openai.com/v1/chat/completions",
  },
  {
    key: "google",
    name: "Google",
    description: "Gemini models",
    docs: "https://aistudio.google.com/apikey",
    placeholder: "AIza…",
    apiBaseUrl: "https://generativelanguage.googleapis.com/v1beta/models",
  },
  {
    key: "meta",
    name: "Meta (via Groq)",
    description: "Llama models via Groq inference",
    docs: "https://console.groq.com/keys",
    placeholder: "gsk_…",
    apiBaseUrl: "https://api.groq.com/openai/v1/chat/completions",
  },
  {
    key: "minimax",
    name: "MiniMax",
    description: "MiniMax M-series models",
    docs: "https://platform.minimaxi.com/user-center/basic-information/interface-key",
    placeholder: "eyJ…",
    apiBaseUrl: "https://api.minimaxi.chat/v1/text/completions_v2",
  },
  {
    key: "grok",
    name: "xAI (Grok)",
    description: "Grok models from xAI",
    docs: "https://console.x.ai",
    placeholder: "xai-…",
    apiBaseUrl: "https://api.x.ai/v1/chat/completions",
  },
];

// ---- Model List ----
// Model IDs must match EXACTLY with provider API model identifiers

export const LLM_MODELS: LLMModel[] = [
  // ── Anthropic (Claude) ──
  { id: "claude-3-5-haiku-20241022",    displayName: "Claude 3.5 Haiku",    provider: "anthropic", group: "Anthropic (Claude)" },
  { id: "claude-sonnet-4-20250514",     displayName: "Claude 4 Sonnet",     provider: "anthropic", group: "Anthropic (Claude)" },
  { id: "claude-opus-4-20250514",       displayName: "Claude 4 Opus",       provider: "anthropic", group: "Anthropic (Claude)" },
  { id: "claude-sonnet-4-5-20250929",   displayName: "Claude 4.5 Sonnet",   provider: "anthropic", group: "Anthropic (Claude)" },
  { id: "claude-haiku-4-5-20251001",    displayName: "Claude 4.5 Haiku",    provider: "anthropic", group: "Anthropic (Claude)" },
  { id: "claude-opus-4-5-20251101",     displayName: "Claude 4.5 Opus",     provider: "anthropic", group: "Anthropic (Claude)" },

  // ── OpenAI (GPT / o-series) ──
  { id: "o4-mini",           displayName: "o4 mini",           provider: "openai", group: "OpenAI (GPT)" },
  { id: "gpt-4.1",           displayName: "GPT-4.1",           provider: "openai", group: "OpenAI (GPT)" },
  { id: "gpt-4.1-mini",      displayName: "GPT-4.1 mini",      provider: "openai", group: "OpenAI (GPT)" },
  { id: "gpt-4.1-nano",      displayName: "GPT-4.1 nano",      provider: "openai", group: "OpenAI (GPT)" },
  { id: "gpt-5",             displayName: "GPT-5",             provider: "openai", group: "OpenAI (GPT)" },
  { id: "gpt-5-mini",        displayName: "GPT-5 mini",        provider: "openai", group: "OpenAI (GPT)" },
  { id: "gpt-5-nano",        displayName: "GPT-5 nano",        provider: "openai", group: "OpenAI (GPT)" },
  { id: "gpt-5.2",           displayName: "GPT-5.2",           provider: "openai", group: "OpenAI (GPT)" },
  { id: "gpt-oss-20b",       displayName: "GPT OSS 20B",       provider: "openai", group: "OpenAI (GPT)" },
  { id: "gpt-oss-120b",      displayName: "GPT OSS 120B",      provider: "openai", group: "OpenAI (GPT)" },

  // ── Google (Gemini) ──
  { id: "gemini-2.0-flash",  displayName: "Gemini 2.0 Flash",  provider: "google", group: "Google (Gemini)" },
  { id: "gemini-2.5-pro",    displayName: "Gemini 2.5 Pro",    provider: "google", group: "Google (Gemini)" },
  { id: "gemini-2.5-flash",  displayName: "Gemini 2.5 Flash",  provider: "google", group: "Google (Gemini)" },

  // ── Meta (Llama via Groq) ──
  { id: "llama-3.1-8b-instant",    displayName: "Llama 3.1 Instant",    provider: "meta", group: "Meta (Llama)" },
  { id: "llama-3.3-70b-versatile", displayName: "Llama 3.3 Versatile",  provider: "meta", group: "Meta (Llama)" },

  // ── MiniMax ──
  { id: "MiniMax-M2.5", displayName: "MiniMax M2.5", provider: "minimax", group: "MiniMax" },
  { id: "MiniMax-M2.1", displayName: "MiniMax M2.1", provider: "minimax", group: "MiniMax" },

  // ── xAI (Grok) ──
  { id: "grok-4-1-fast-reasoning",      displayName: "Grok-4.1 Fast Reasoning",      provider: "grok", group: "xAI (Grok)" },
  { id: "grok-4-1-fast-non-reasoning",  displayName: "Grok-4.1 Fast Non-Reasoning",  provider: "grok", group: "xAI (Grok)" },
  { id: "grok-code-fast-1",             displayName: "Grok Code Fast-1",            provider: "grok", group: "xAI (Grok)" },
  { id: "grok-4-fast-reasoning",        displayName: "Grok-4 Fast Reasoning",       provider: "grok", group: "xAI (Grok)" },
  { id: "grok-4-fast-non-reasoning",    displayName: "Grok-4 Fast Non-Reasoning",   provider: "grok", group: "xAI (Grok)" },
  { id: "grok-4-0709",                  displayName: "Grok-4 0709",                 provider: "grok", group: "xAI (Grok)" },
  { id: "grok-3-mini-beta",             displayName: "Grok-3 mini",                 provider: "grok", group: "xAI (Grok)" },
  { id: "grok-3-beta",                  displayName: "Grok-3",                      provider: "grok", group: "xAI (Grok)" },
  { id: "grok-2-vision-1212",           displayName: "Grok-2 Vision 1212",          provider: "grok", group: "xAI (Grok)" },
];

// ---- Default ----

export const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

// ---- Helpers ----

/** Get unique model group names (preserves order of first appearance) */
export function getModelGroups(): string[] {
  const seen = new Set<string>();
  const groups: string[] = [];
  for (const m of LLM_MODELS) {
    if (!seen.has(m.group)) {
      seen.add(m.group);
      groups.push(m.group);
    }
  }
  return groups;
}

/** Find a model by ID */
export function findModel(id: string): LLMModel | undefined {
  return LLM_MODELS.find((m) => m.id === id);
}

/** Get models filtered by provider */
export function getModelsByProvider(provider: LLMProvider): LLMModel[] {
  return LLM_MODELS.filter((m) => m.provider === provider);
}

/** Get all provider keys */
export function getProviders(): LLMProvider[] {
  return PROVIDERS.map((p) => p.key);
}

/** Get provider info by key */
export function getProviderInfo(provider: LLMProvider): ProviderInfo | undefined {
  return PROVIDERS.find((p) => p.key === provider);
}

/** Get human-readable provider name */
export function getProviderDisplayName(provider: LLMProvider): string {
  const info = getProviderInfo(provider);
  return info?.name ?? provider;
}

/** Get API base URL for provider */
export function getProviderApiUrl(provider: LLMProvider): string {
  const info = getProviderInfo(provider);
  return info?.apiBaseUrl ?? "";
}

/** Read API key from localStorage for a given provider */
export function getStoredApiKey(provider: LLMProvider): string {
  if (typeof window === "undefined") return "";
  try {
    const stored = localStorage.getItem("llm_api_keys");
    if (!stored) return "";
    const keys = JSON.parse(stored) as Record<string, string>;
    return keys[provider]?.trim() ?? "";
  } catch {
    return "";
  }
}
