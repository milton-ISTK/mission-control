/**
 * LLM Models List - All providers and their available models
 */

export type Provider = "anthropic" | "openai" | "google" | "meta" | "minimax" | "grok";

export interface LLMModel {
  id: string;
  displayName: string;
  provider: Provider;
  description?: string;
}

export const LLM_MODELS: LLMModel[] = [
  // ---- Anthropic (Claude) ----
  {
    id: "claude-3-5-haiku",
    displayName: "Claude 3.5 - Haiku",
    provider: "anthropic",
    description: "Fast, efficient",
  },
  {
    id: "claude-4-sonnet",
    displayName: "Claude 4 - Sonnet",
    provider: "anthropic",
    description: "Balanced performance",
  },
  {
    id: "claude-4-opus",
    displayName: "Claude 4 - Opus",
    provider: "anthropic",
    description: "Most capable",
  },
  {
    id: "claude-4-5-sonnet",
    displayName: "Claude 4.5 - Sonnet",
    provider: "anthropic",
    description: "Latest balanced model",
  },
  {
    id: "claude-4-5-haiku",
    displayName: "Claude 4.5 - Haiku",
    provider: "anthropic",
    description: "Latest fast model",
  },
  {
    id: "claude-4-5-opus",
    displayName: "Claude 4.5 - Opus",
    provider: "anthropic",
    description: "Latest most capable",
  },

  // ---- OpenAI (GPT) ----
  {
    id: "o4-mini",
    displayName: "o4 mini",
    provider: "openai",
    description: "Lightweight reasoning",
  },
  {
    id: "gpt-4-1",
    displayName: "GPT-4.1",
    provider: "openai",
    description: "Latest GPT-4",
  },
  {
    id: "gpt-4-1-mini",
    displayName: "GPT-4.1 mini",
    provider: "openai",
    description: "Efficient GPT-4",
  },
  {
    id: "gpt-4-1-nano",
    displayName: "GPT-4.1 nano",
    provider: "openai",
    description: "Very fast GPT-4",
  },
  {
    id: "gpt-5",
    displayName: "GPT-5",
    provider: "openai",
    description: "Next generation",
  },
  {
    id: "gpt-5-mini",
    displayName: "GPT-5 mini",
    provider: "openai",
    description: "Efficient GPT-5",
  },
  {
    id: "gpt-5-nano",
    displayName: "GPT-5 nano",
    provider: "openai",
    description: "Fast GPT-5",
  },
  {
    id: "gpt-5-2",
    displayName: "GPT-5.2",
    provider: "openai",
    description: "Updated GPT-5",
  },
  {
    id: "gpt-oss-20b",
    displayName: "GPT OSS 20B",
    provider: "openai",
    description: "Open source variant",
  },
  {
    id: "gpt-oss-120b",
    displayName: "GPT OSS 120B",
    provider: "openai",
    description: "Large open source",
  },

  // ---- Google (Gemini) ----
  {
    id: "gemini-2-0-flash",
    displayName: "Gemini 2.0 Flash",
    provider: "google",
    description: "Latest fast model",
  },
  {
    id: "gemini-2-5-pro",
    displayName: "Gemini 2.5 Pro",
    provider: "google",
    description: "Latest capable model",
  },
  {
    id: "gemini-2-5-flash",
    displayName: "Gemini 2.5 Flash",
    provider: "google",
    description: "Latest efficient model",
  },

  // ---- Meta (Llama) ----
  {
    id: "llama-3-1-instant",
    displayName: "Llama 3.1 Instant",
    provider: "meta",
    description: "Fast inference",
  },
  {
    id: "llama-3-3-versatile",
    displayName: "Llama 3.3 Versatile",
    provider: "meta",
    description: "General purpose",
  },

  // ---- MiniMax ----
  {
    id: "minimax-m2-5",
    displayName: "MiniMax M2.5",
    provider: "minimax",
    description: "Peak performance",
  },
  {
    id: "minimax-m2-1",
    displayName: "MiniMax M2.1",
    provider: "minimax",
    description: "Polyglot mastery",
  },

  // ---- xAI (Grok) ----
  {
    id: "grok-4-1-fast-reasoning",
    displayName: "Grok-4.1 Fast Reasoning",
    provider: "grok",
    description: "Fast with reasoning",
  },
  {
    id: "grok-4-1-fast-non-reasoning",
    displayName: "Grok-4.1 Fast Non-Reasoning",
    provider: "grok",
    description: "Fast simple inference",
  },
  {
    id: "grok-code-fast-1",
    displayName: "Grok Code Fast-1",
    provider: "grok",
    description: "Code optimization",
  },
  {
    id: "grok-4-fast-reasoning",
    displayName: "Grok-4 Fast Reasoning",
    provider: "grok",
    description: "Reasoning capability",
  },
  {
    id: "grok-4-fast-non-reasoning",
    displayName: "Grok-4 Fast Non-Reasoning",
    provider: "grok",
    description: "Simple fast inference",
  },
  {
    id: "grok-4-0709",
    displayName: "Grok-4 0709",
    provider: "grok",
    description: "Versioned model",
  },
  {
    id: "grok-3-mini",
    displayName: "Grok-3 mini",
    provider: "grok",
    description: "Lightweight model",
  },
  {
    id: "grok-3",
    displayName: "Grok-3",
    provider: "grok",
    description: "General purpose",
  },
  {
    id: "grok-2-vision-1212",
    displayName: "Grok-2 Vision 1212",
    provider: "grok",
    description: "Vision capability",
  },
];

export function getModelsByProvider(provider: Provider): LLMModel[] {
  return LLM_MODELS.filter((m) => m.provider === provider);
}

export function getProviders(): Provider[] {
  return ["anthropic", "openai", "google", "meta", "minimax", "grok"];
}

export function getProviderName(provider: Provider): string {
  const names: Record<Provider, string> = {
    anthropic: "Anthropic",
    openai: "OpenAI",
    google: "Google",
    meta: "Meta",
    minimax: "MiniMax",
    grok: "Grok (xAI)",
  };
  return names[provider];
}

export function getModelById(id: string): LLMModel | undefined {
  return LLM_MODELS.find((m) => m.id === id);
}
