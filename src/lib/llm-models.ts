/**
 * LLM Models Configuration
 * ─────────────────────────
 * Defines every available LLM model, organized by provider.
 * Used by the Content Pipeline selector, Subagent creation modal,
 * and API-key validation throughout Mission Control.
 *
 * Provider identifiers MUST match the keys stored in the
 * "llm_api_keys" JSON object in localStorage.
 */

export type LLMProvider =
  | "anthropic"
  | "openai"
  | "google"
  | "meta"
  | "minimax"
  | "grok";

export interface LLMModel {
  /** Unique identifier sent to the provider API */
  id: string;
  /** Human-readable name for dropdowns / UI */
  displayName: string;
  /** Provider key (matches localStorage "llm_api_keys" sub-key) */
  provider: LLMProvider;
  /** Group heading in the dropdown (usually provider display name) */
  group: string;
  /** Optional one-liner shown in tooltips / detail views */
  description?: string;
}

/** All provider metadata for the Settings page */
export interface ProviderMeta {
  key: LLMProvider;
  name: string;
  description: string;
  docs: string;
  placeholder: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Complete model registry
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const LLM_MODELS: LLMModel[] = [
  // ── Anthropic (Claude) ────────────────────────────────────────────────────
  {
    id: "claude-3-5-haiku-20241022",
    displayName: "Claude 3.5 Haiku",
    provider: "anthropic",
    group: "Anthropic",
    description: "Fast and affordable, great for simple tasks",
  },
  {
    id: "claude-sonnet-4-20250514",
    displayName: "Claude 4 Sonnet",
    provider: "anthropic",
    group: "Anthropic",
    description: "Balanced performance and cost",
  },
  {
    id: "claude-opus-4-20250514",
    displayName: "Claude 4 Opus",
    provider: "anthropic",
    group: "Anthropic",
    description: "Most capable Claude 4 model",
  },
  {
    id: "claude-haiku-4-5-20250315",
    displayName: "Claude 4.5 Haiku",
    provider: "anthropic",
    group: "Anthropic",
    description: "Next-gen fast model with improved reasoning",
  },
  {
    id: "claude-sonnet-4-5-20250514",
    displayName: "Claude 4.5 Sonnet",
    provider: "anthropic",
    group: "Anthropic",
    description: "Next-gen balanced model, hybrid reasoning",
  },
  {
    id: "claude-opus-4-5-20250709",
    displayName: "Claude 4.5 Opus",
    provider: "anthropic",
    group: "Anthropic",
    description: "Frontier model, maximum capability",
  },

  // ── OpenAI (GPT) ─────────────────────────────────────────────────────────
  {
    id: "o4-mini",
    displayName: "o4 Mini",
    provider: "openai",
    group: "OpenAI",
    description: "Efficient reasoning model",
  },
  {
    id: "gpt-4.1",
    displayName: "GPT-4.1",
    provider: "openai",
    group: "OpenAI",
    description: "High-capability general-purpose model",
  },
  {
    id: "gpt-4.1-mini",
    displayName: "GPT-4.1 Mini",
    provider: "openai",
    group: "OpenAI",
    description: "Cost-efficient GPT-4.1 variant",
  },
  {
    id: "gpt-4.1-nano",
    displayName: "GPT-4.1 Nano",
    provider: "openai",
    group: "OpenAI",
    description: "Ultra-fast GPT-4.1 for simple tasks",
  },
  {
    id: "gpt-5",
    displayName: "GPT-5",
    provider: "openai",
    group: "OpenAI",
    description: "Latest flagship model",
  },
  {
    id: "gpt-5-mini",
    displayName: "GPT-5 Mini",
    provider: "openai",
    group: "OpenAI",
    description: "Efficient GPT-5 variant",
  },
  {
    id: "gpt-5-nano",
    displayName: "GPT-5 Nano",
    provider: "openai",
    group: "OpenAI",
    description: "Ultra-fast GPT-5 for simple tasks",
  },
  {
    id: "gpt-5.2",
    displayName: "GPT-5.2",
    provider: "openai",
    group: "OpenAI",
    description: "Enhanced GPT-5 with improved capabilities",
  },
  {
    id: "gpt-oss-20b",
    displayName: "GPT OSS 20B",
    provider: "openai",
    group: "OpenAI",
    description: "Open-source 20B parameter model",
  },
  {
    id: "gpt-oss-120b",
    displayName: "GPT OSS 120B",
    provider: "openai",
    group: "OpenAI",
    description: "Open-source 120B parameter model",
  },

  // ── Google (Gemini) ───────────────────────────────────────────────────────
  {
    id: "gemini-2.0-flash",
    displayName: "Gemini 2.0 Flash",
    provider: "google",
    group: "Google",
    description: "Fast multimodal model",
  },
  {
    id: "gemini-2.5-pro",
    displayName: "Gemini 2.5 Pro",
    provider: "google",
    group: "Google",
    description: "Most capable Gemini model with thinking",
  },
  {
    id: "gemini-2.5-flash",
    displayName: "Gemini 2.5 Flash",
    provider: "google",
    group: "Google",
    description: "Fast and efficient with thinking capability",
  },

  // ── Meta (Llama) ──────────────────────────────────────────────────────────
  {
    id: "llama-3.1-8b-instant",
    displayName: "Llama 3.1 Instant",
    provider: "meta",
    group: "Meta (Llama)",
    description: "Ultra-fast 8B instant inference",
  },
  {
    id: "llama-3.3-70b-versatile",
    displayName: "Llama 3.3 Versatile",
    provider: "meta",
    group: "Meta (Llama)",
    description: "Versatile 70B model for complex tasks",
  },

  // ── MiniMax ───────────────────────────────────────────────────────────────
  {
    id: "minimax-2.5",
    displayName: "MiniMax M2.5",
    provider: "minimax",
    group: "MiniMax",
    description: "Latest MiniMax model with enhanced reasoning",
  },
  {
    id: "minimax-2.1",
    displayName: "MiniMax M2.1",
    provider: "minimax",
    group: "MiniMax",
    description: "Stable MiniMax model for general use",
  },

  // ── xAI (Grok) ───────────────────────────────────────────────────────────
  {
    id: "grok-4-1-fast-reasoning",
    displayName: "Grok 4.1 Fast Reasoning",
    provider: "grok",
    group: "xAI (Grok)",
    description: "Latest Grok with fast chain-of-thought",
  },
  {
    id: "grok-4-1-fast-non-reasoning",
    displayName: "Grok 4.1 Fast",
    provider: "grok",
    group: "xAI (Grok)",
    description: "Latest Grok without reasoning overhead",
  },
  {
    id: "grok-code-fast-1",
    displayName: "Grok Code Fast",
    provider: "grok",
    group: "xAI (Grok)",
    description: "Optimized for code generation",
  },
  {
    id: "grok-4-fast-reasoning",
    displayName: "Grok 4 Fast Reasoning",
    provider: "grok",
    group: "xAI (Grok)",
    description: "Grok 4 with chain-of-thought reasoning",
  },
  {
    id: "grok-4-fast-non-reasoning",
    displayName: "Grok 4 Fast",
    provider: "grok",
    group: "xAI (Grok)",
    description: "Grok 4 without reasoning overhead",
  },
  {
    id: "grok-4-0709",
    displayName: "Grok 4 (0709)",
    provider: "grok",
    group: "xAI (Grok)",
    description: "Grok 4 July 2025 snapshot",
  },
  {
    id: "grok-3-mini",
    displayName: "Grok 3 Mini",
    provider: "grok",
    group: "xAI (Grok)",
    description: "Compact Grok 3 for fast inference",
  },
  {
    id: "grok-3",
    displayName: "Grok 3",
    provider: "grok",
    group: "xAI (Grok)",
    description: "Full Grok 3 model",
  },
  {
    id: "grok-2-vision-1212",
    displayName: "Grok 2 Vision",
    provider: "grok",
    group: "xAI (Grok)",
    description: "Multimodal Grok with vision capability",
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Provider metadata (for Settings page)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PROVIDERS: ProviderMeta[] = [
  {
    key: "anthropic",
    name: "Anthropic",
    description: "Claude 3.5 Haiku, Claude 4 Sonnet/Opus, Claude 4.5 Haiku/Sonnet/Opus",
    docs: "https://console.anthropic.com",
    placeholder: "sk-ant-...",
  },
  {
    key: "openai",
    name: "OpenAI",
    description: "o4 Mini, GPT-4.1 series, GPT-5 series, GPT OSS 20B/120B",
    docs: "https://platform.openai.com/api-keys",
    placeholder: "sk-...",
  },
  {
    key: "google",
    name: "Google (Gemini)",
    description: "Gemini 2.0 Flash, Gemini 2.5 Pro, Gemini 2.5 Flash",
    docs: "https://aistudio.google.com/apikey",
    placeholder: "AIza...",
  },
  {
    key: "meta",
    name: "Meta (Llama)",
    description: "Llama 3.1 Instant, Llama 3.3 Versatile — via Groq API",
    docs: "https://console.groq.com/keys",
    placeholder: "gsk_...",
  },
  {
    key: "minimax",
    name: "MiniMax",
    description: "MiniMax M2.5, MiniMax M2.1",
    docs: "https://www.minimaxi.com",
    placeholder: "minimax-...",
  },
  {
    key: "grok",
    name: "xAI (Grok)",
    description: "Grok 4.1, Grok 4, Grok 3, Grok Code, Grok 2 Vision",
    docs: "https://console.x.ai",
    placeholder: "xai-...",
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Helpers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Default model if none selected */
export const DEFAULT_MODEL = "claude-haiku-4-5-20250315";

/** Get unique group names in insertion order */
export function getModelGroups(): string[] {
  const seen = new Set<string>();
  return LLM_MODELS.filter((m) => {
    if (seen.has(m.group)) return false;
    seen.add(m.group);
    return true;
  }).map((m) => m.group);
}

/** Find a model by its id */
export function findModel(id: string): LLMModel | undefined {
  return LLM_MODELS.find((m) => m.id === id);
}

/**
 * Map provider identifier → localStorage sub-key.
 * Currently 1:1, but abstracted in case we remap later.
 */
export function getProviderKeyName(provider: string): string {
  return provider;
}

/** Human-friendly display name for a provider key */
export function getProviderDisplayName(provider: LLMProvider): string {
  const meta = PROVIDERS.find((p) => p.key === provider);
  return meta?.name ?? provider;
}

/** All unique provider identifiers */
export function getAllProviders(): LLMProvider[] {
  const seen = new Set<LLMProvider>();
  return LLM_MODELS.filter((m) => {
    if (seen.has(m.provider)) return false;
    seen.add(m.provider);
    return true;
  }).map((m) => m.provider);
}

/**
 * Check whether a provider has an API key in localStorage.
 * Returns the trimmed key string, or "" if missing.
 */
export function getStoredApiKey(provider: string): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem("llm_api_keys");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    const keyName = getProviderKeyName(provider);
    return (parsed[keyName] ?? "").trim();
  } catch {
    return "";
  }
}
