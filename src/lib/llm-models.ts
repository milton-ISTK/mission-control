/**
 * LLM Models Configuration
 * Defines available LLM providers and models for Content Pipeline research.
 * Used by the UI dropdown and daemon routing.
 */

export interface LLMModel {
  provider: string;       // API provider identifier (for routing)
  modelId: string;        // Model ID sent to the provider API
  displayName: string;    // Human-readable name for the dropdown
  group: string;          // Group heading in the dropdown
}

export const LLM_MODELS: LLMModel[] = [
  // ── Anthropic ──
  { provider: "anthropic", modelId: "claude-opus-4-20250514",    displayName: "Claude Opus 4",    group: "Anthropic" },
  { provider: "anthropic", modelId: "claude-sonnet-4-20250514",  displayName: "Claude Sonnet 4",  group: "Anthropic" },
  { provider: "anthropic", modelId: "claude-haiku-4-5-20250315", displayName: "Claude Haiku 4.5", group: "Anthropic" },

  // ── OpenAI ──
  { provider: "openai", modelId: "gpt-4.1",       displayName: "GPT-4.1",       group: "OpenAI" },
  { provider: "openai", modelId: "gpt-4.1-mini",  displayName: "GPT-4.1 Mini",  group: "OpenAI" },
  { provider: "openai", modelId: "gpt-4.1-nano",  displayName: "GPT-4.1 Nano",  group: "OpenAI" },
  { provider: "openai", modelId: "gpt-4o",        displayName: "GPT-4o",        group: "OpenAI" },
  { provider: "openai", modelId: "gpt-4o-mini",   displayName: "GPT-4o Mini",   group: "OpenAI" },
  { provider: "openai", modelId: "o3",            displayName: "o3",            group: "OpenAI" },
  { provider: "openai", modelId: "o3-mini",       displayName: "o3 Mini",       group: "OpenAI" },
  { provider: "openai", modelId: "o4-mini",       displayName: "o4 Mini",       group: "OpenAI" },

  // ── xAI (Grok) ──
  { provider: "xai", modelId: "grok-3",           displayName: "Grok 3",        group: "xAI (Grok)" },
  { provider: "xai", modelId: "grok-3-mini",      displayName: "Grok 3 Mini",   group: "xAI (Grok)" },

  // ── Google (Gemini) ──
  { provider: "google", modelId: "gemini-2.5-pro",   displayName: "Gemini 2.5 Pro",   group: "Google" },
  { provider: "google", modelId: "gemini-2.5-flash", displayName: "Gemini 2.5 Flash", group: "Google" },
  { provider: "google", modelId: "gemini-2.0-flash", displayName: "Gemini 2.0 Flash", group: "Google" },

  // ── DeepSeek ──
  { provider: "deepseek", modelId: "deepseek-chat",     displayName: "DeepSeek V3",  group: "DeepSeek" },
  { provider: "deepseek", modelId: "deepseek-reasoner", displayName: "DeepSeek R1",  group: "DeepSeek" },

  // ── MiniMax ──
  { provider: "minimax", modelId: "MiniMax-M1",  displayName: "MiniMax M1",  group: "MiniMax" },
  { provider: "minimax", modelId: "MiniMax-T1",  displayName: "MiniMax T1",  group: "MiniMax" },

  // ── Meta (via Together AI) ──
  { provider: "together", modelId: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8", displayName: "Llama 4 Maverick",  group: "Meta (Together)" },
  { provider: "together", modelId: "meta-llama/Llama-4-Scout-17B-16E-Instruct",         displayName: "Llama 4 Scout",     group: "Meta (Together)" },
  { provider: "together", modelId: "meta-llama/Llama-3.3-70B-Instruct-Turbo",           displayName: "Llama 3.3 70B",     group: "Meta (Together)" },

  // ── Meta (via Groq) ──
  { provider: "groq", modelId: "llama-3.3-70b-versatile",  displayName: "Llama 3.3 70B",     group: "Meta (Groq)" },
  { provider: "groq", modelId: "llama-4-scout-17b-16e-instruct", displayName: "Llama 4 Scout", group: "Meta (Groq)" },
  { provider: "groq", modelId: "llama-4-maverick-17b-128e-instruct", displayName: "Llama 4 Maverick", group: "Meta (Groq)" },
];

/** Default model if none selected */
export const DEFAULT_MODEL = "claude-haiku-4-5-20250315";

/** Get unique group names in order */
export function getModelGroups(): string[] {
  const seen = new Set<string>();
  return LLM_MODELS.filter((m) => {
    if (seen.has(m.group)) return false;
    seen.add(m.group);
    return true;
  }).map((m) => m.group);
}

/** Find a model by its modelId */
export function findModel(modelId: string): LLMModel | undefined {
  return LLM_MODELS.find((m) => m.modelId === modelId);
}
