/**
 * LLM Models Registry — All providers, models, and helper functions
 * Used by: ResearchInput, Settings, CreateSubagentModal
 */

// ---- Types ----

export type LLMProvider = "anthropic" | "openai" | "google" | "meta" | "minimax" | "grok";

/** @deprecated Use LLMProvider instead */
export type Provider = LLMProvider;

export interface LLMModel {
  id: string;
  displayName: string;
  provider: LLMProvider;
  group: string;          // Display group for dropdown (e.g. "Anthropic (Claude)")
  description?: string;
}

export interface ProviderInfo {
  key: LLMProvider;
  name: string;
  description: string;
  docs: string;
  placeholder: string;
}

// ---- Provider Registry ----

export const PROVIDERS: ProviderInfo[] = [
  {
    key: "anthropic",
    name: "Anthropic",
    description: "Claude models — Haiku, Sonnet, Opus",
    docs: "https://console.anthropic.com/settings/keys",
    placeholder: "sk-ant-api03-…",
  },
  {
    key: "openai",
    name: "OpenAI",
    description: "GPT and o-series models",
    docs: "https://platform.openai.com/api-keys",
    placeholder: "sk-proj-…",
  },
  {
    key: "google",
    name: "Google",
    description: "Gemini models",
    docs: "https://aistudio.google.com/apikey",
    placeholder: "AIza…",
  },
  {
    key: "meta",
    name: "Meta (via Groq)",
    description: "Llama models via Groq inference",
    docs: "https://console.groq.com/keys",
    placeholder: "gsk_…",
  },
  {
    key: "minimax",
    name: "MiniMax",
    description: "MiniMax M-series models",
    docs: "https://platform.minimaxi.com/user-center/basic-information/interface-key",
    placeholder: "eyJ…",
  },
  {
    key: "grok",
    name: "xAI (Grok)",
    description: "Grok models from xAI",
    docs: "https://console.x.ai",
    placeholder: "xai-…",
  },
];

// ---- Model List ----

export const LLM_MODELS: LLMModel[] = [
  // ── Anthropic (Claude) ──
  { id: "claude-3-5-haiku",   displayName: "Claude 3.5 Haiku",    provider: "anthropic", group: "Anthropic (Claude)", description: "Fast, efficient" },
  { id: "claude-4-sonnet",    displayName: "Claude 4 Sonnet",     provider: "anthropic", group: "Anthropic (Claude)", description: "Balanced performance" },
  { id: "claude-4-opus",      displayName: "Claude 4 Opus",       provider: "anthropic", group: "Anthropic (Claude)", description: "Most capable" },
  { id: "claude-4-5-sonnet",  displayName: "Claude 4.5 Sonnet",   provider: "anthropic", group: "Anthropic (Claude)", description: "Latest balanced model" },
  { id: "claude-4-5-haiku",   displayName: "Claude 4.5 Haiku",    provider: "anthropic", group: "Anthropic (Claude)", description: "Latest fast model" },
  { id: "claude-4-5-opus",    displayName: "Claude 4.5 Opus",     provider: "anthropic", group: "Anthropic (Claude)", description: "Latest most capable" },

  // ── OpenAI (GPT / o-series) ──
  { id: "o4-mini",        displayName: "o4 mini",         provider: "openai", group: "OpenAI (GPT)", description: "Lightweight reasoning" },
  { id: "gpt-4-1",        displayName: "GPT-4.1",         provider: "openai", group: "OpenAI (GPT)", description: "Latest GPT-4" },
  { id: "gpt-4-1-mini",   displayName: "GPT-4.1 mini",    provider: "openai", group: "OpenAI (GPT)", description: "Efficient GPT-4" },
  { id: "gpt-4-1-nano",   displayName: "GPT-4.1 nano",    provider: "openai", group: "OpenAI (GPT)", description: "Very fast GPT-4" },
  { id: "gpt-5",          displayName: "GPT-5",            provider: "openai", group: "OpenAI (GPT)", description: "Next generation" },
  { id: "gpt-5-mini",     displayName: "GPT-5 mini",       provider: "openai", group: "OpenAI (GPT)", description: "Efficient GPT-5" },
  { id: "gpt-5-nano",     displayName: "GPT-5 nano",       provider: "openai", group: "OpenAI (GPT)", description: "Fast GPT-5" },
  { id: "gpt-5-2",        displayName: "GPT-5.2",          provider: "openai", group: "OpenAI (GPT)", description: "Updated GPT-5" },
  { id: "gpt-oss-20b",    displayName: "GPT OSS 20B",      provider: "openai", group: "OpenAI (GPT)", description: "Open source variant" },
  { id: "gpt-oss-120b",   displayName: "GPT OSS 120B",     provider: "openai", group: "OpenAI (GPT)", description: "Large open source" },

  // ── Google (Gemini) ──
  { id: "gemini-2-0-flash", displayName: "Gemini 2.0 Flash", provider: "google", group: "Google (Gemini)", description: "Latest fast model" },
  { id: "gemini-2-5-pro",   displayName: "Gemini 2.5 Pro",   provider: "google", group: "Google (Gemini)", description: "Latest capable model" },
  { id: "gemini-2-5-flash", displayName: "Gemini 2.5 Flash", provider: "google", group: "Google (Gemini)", description: "Latest efficient model" },

  // ── Meta (Llama via Groq) ──
  { id: "llama-3-1-instant",    displayName: "Llama 3.1 Instant",    provider: "meta", group: "Meta (Llama)", description: "Fast inference" },
  { id: "llama-3-3-versatile",  displayName: "Llama 3.3 Versatile",  provider: "meta", group: "Meta (Llama)", description: "General purpose" },

  // ── MiniMax ──
  { id: "minimax-m2-5", displayName: "MiniMax M2.5", provider: "minimax", group: "MiniMax", description: "Peak performance" },
  { id: "minimax-m2-1", displayName: "MiniMax M2.1", provider: "minimax", group: "MiniMax", description: "Polyglot mastery" },

  // ── xAI (Grok) ──
  { id: "grok-4-1-fast-reasoning",     displayName: "Grok-4.1 Fast Reasoning",     provider: "grok", group: "xAI (Grok)", description: "Fast with reasoning" },
  { id: "grok-4-1-fast-non-reasoning", displayName: "Grok-4.1 Fast Non-Reasoning", provider: "grok", group: "xAI (Grok)", description: "Fast simple inference" },
  { id: "grok-code-fast-1",            displayName: "Grok Code Fast-1",             provider: "grok", group: "xAI (Grok)", description: "Code optimization" },
  { id: "grok-4-fast-reasoning",       displayName: "Grok-4 Fast Reasoning",        provider: "grok", group: "xAI (Grok)", description: "Reasoning capability" },
  { id: "grok-4-fast-non-reasoning",   displayName: "Grok-4 Fast Non-Reasoning",    provider: "grok", group: "xAI (Grok)", description: "Simple fast inference" },
  { id: "grok-4-0709",                 displayName: "Grok-4 0709",                  provider: "grok", group: "xAI (Grok)", description: "Versioned model" },
  { id: "grok-3-mini",                 displayName: "Grok-3 mini",                  provider: "grok", group: "xAI (Grok)", description: "Lightweight model" },
  { id: "grok-3",                      displayName: "Grok-3",                       provider: "grok", group: "xAI (Grok)", description: "General purpose" },
  { id: "grok-2-vision-1212",          displayName: "Grok-2 Vision 1212",           provider: "grok", group: "xAI (Grok)", description: "Vision capability" },
];

// ---- Default ----

export const DEFAULT_MODEL = "claude-4-5-haiku";

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

/** @deprecated Use findModel instead */
export function getModelById(id: string): LLMModel | undefined {
  return findModel(id);
}

/** Get models filtered by provider */
export function getModelsByProvider(provider: LLMProvider): LLMModel[] {
  return LLM_MODELS.filter((m) => m.provider === provider);
}

/** Get all provider keys */
export function getProviders(): LLMProvider[] {
  return PROVIDERS.map((p) => p.key);
}

/** Get human-readable provider name */
export function getProviderDisplayName(provider: LLMProvider): string {
  const info = PROVIDERS.find((p) => p.key === provider);
  return info?.name ?? provider;
}

/** @deprecated Use getProviderDisplayName instead */
export function getProviderName(provider: LLMProvider): string {
  return getProviderDisplayName(provider);
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
