export type Provider = "anthropic" | "google" | "openai";
export type Tier = "premium" | "balanced" | "fast";

export type ModelPricing = {
  input: number;
  output: number;
  inputLongContext?: number;
  outputLongContext?: number;
  longContextThreshold?: number;
};

export type Model = {
  id: string;
  provider: Provider;
  displayName: string;
  pricing: ModelPricing;
  maxContext: number;
  tier: Tier;
  bestFor: string[];
};

export const BUILT_IN_MODELS: Model[] = [
  // Anthropic
  {
    id: "claude-opus-4-7",
    provider: "anthropic",
    displayName: "Claude Opus 4.7",
    pricing: { input: 5.0, output: 25.0 },
    maxContext: 200_000,
    tier: "premium",
    bestFor: ["Páginas de venta largas", "VSLs", "Copy persuasivo de alto stake"],
  },
  {
    id: "claude-opus-4-6",
    provider: "anthropic",
    displayName: "Claude Opus 4.6",
    pricing: { input: 5.0, output: 25.0 },
    maxContext: 200_000,
    tier: "premium",
    bestFor: ["Páginas de venta largas", "VSLs"],
  },
  {
    id: "claude-sonnet-4-6",
    provider: "anthropic",
    displayName: "Claude Sonnet 4.6",
    pricing: { input: 3.0, output: 15.0 },
    maxContext: 200_000,
    tier: "balanced",
    bestFor: ["Emails", "Anuncios", "Posts de redes", "Copy diario"],
  },
  {
    id: "claude-haiku-4-5-20251001",
    provider: "anthropic",
    displayName: "Claude Haiku 4.5",
    pricing: { input: 1.0, output: 5.0 },
    maxContext: 200_000,
    tier: "fast",
    bestFor: ["Variantes rápidas", "Tareas simples"],
  },
  // Google — Pro: precio sube a $4/$18 por 1M si input > 200k tokens
  {
    id: "gemini-3.1-pro",
    provider: "google",
    displayName: "Gemini 3.1 Pro",
    pricing: {
      input: 2.0,
      output: 12.0,
      inputLongContext: 4.0,
      outputLongContext: 18.0,
      longContextThreshold: 200_000,
    },
    maxContext: 1_000_000,
    tier: "premium",
    bestFor: ["Procesamiento de contextos enormes", "Análisis"],
  },
  {
    id: "gemini-3-pro",
    provider: "google",
    displayName: "Gemini 3 Pro",
    pricing: {
      input: 2.0,
      output: 12.0,
      inputLongContext: 4.0,
      outputLongContext: 18.0,
      longContextThreshold: 200_000,
    },
    maxContext: 1_000_000,
    tier: "premium",
    bestFor: ["Contextos grandes", "Análisis"],
  },
  {
    id: "gemini-3-flash",
    provider: "google",
    displayName: "Gemini 3 Flash",
    pricing: { input: 0.5, output: 3.0 },
    maxContext: 1_000_000,
    tier: "balanced",
    bestFor: ["Voice of Customer", "Procesamiento de archivos largos"],
  },
  {
    id: "gemini-3.1-flash-lite",
    provider: "google",
    displayName: "Gemini 3.1 Flash-Lite",
    pricing: { input: 0.25, output: 1.5 },
    maxContext: 1_000_000,
    tier: "fast",
    bestFor: ["Variantes masivas", "Tareas rápidas"],
  },
  {
    id: "gemini-2.5-flash",
    provider: "google",
    displayName: "Gemini 2.5 Flash",
    pricing: { input: 0.3, output: 2.5 },
    maxContext: 1_000_000,
    tier: "fast",
    bestFor: ["Tareas rápidas"],
  },
  // OpenAI
  {
    id: "gpt-4o",
    provider: "openai",
    displayName: "GPT-4o",
    pricing: { input: 2.5, output: 10.0 },
    maxContext: 128_000,
    tier: "balanced",
    bestFor: ["Copy general"],
  },
  {
    id: "gpt-4o-mini",
    provider: "openai",
    displayName: "GPT-4o Mini",
    pricing: { input: 0.15, output: 0.6 },
    maxContext: 128_000,
    tier: "fast",
    bestFor: ["Variantes rápidas", "Tareas simples"],
  },
];

export const DEFAULT_MODEL_ID = "claude-sonnet-4-6";
export const DEFAULT_VOC_MODEL_ID = "claude-sonnet-4-6";
export const DEFAULT_LONG_FORM_MODEL_ID = "claude-opus-4-7";
export const DEFAULT_FAST_MODEL_ID = "claude-haiku-4-5-20251001";

export const PROVIDER_META: Record<Provider, { label: string; color: string; consoleUrl: string; keyLabel: string }> = {
  anthropic: {
    label: "Anthropic (Claude)",
    color: "#a855f7",
    consoleUrl: "https://console.anthropic.com/settings/keys",
    keyLabel: "Obtener API key en console.anthropic.com",
  },
  google: {
    label: "Google (Gemini)",
    color: "#3b82f6",
    consoleUrl: "https://aistudio.google.com/apikey",
    keyLabel: "Obtener API key en aistudio.google.com/apikey",
  },
  openai: {
    label: "OpenAI (GPT)",
    color: "#10b981",
    consoleUrl: "https://platform.openai.com/api-keys",
    keyLabel: "Obtener API key en platform.openai.com/api-keys",
  },
};

export const TIER_META: Record<Tier, { label: string; dot: string }> = {
  premium: { label: "Premium", dot: "🔴" },
  balanced: { label: "Balanced", dot: "🟡" },
  fast: { label: "Fast", dot: "🟢" },
};

export function getAllBuiltInModels(): Model[] {
  return BUILT_IN_MODELS;
}

export function getBuiltInModelById(id: string): Model | undefined {
  return BUILT_IN_MODELS.find((m) => m.id === id);
}

export function isValidModelId(id: string | null | undefined): boolean {
  if (!id) return false;
  return BUILT_IN_MODELS.some((m) => m.id === id);
}

export function getModelsByProvider(provider: Provider): Model[] {
  return BUILT_IN_MODELS.filter((m) => m.provider === provider);
}

export function isDeprecatedModelError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const anyErr = err as { status?: number; message?: string };
  const msg = (anyErr.message || "").toLowerCase();
  if (anyErr.status === 404) return true;
  return (
    msg.includes("not_found_error") ||
    msg.includes("model:") ||
    msg.includes("model not found")
  );
}

export const DEPRECATED_MODEL_USER_MESSAGE =
  "El modelo configurado ya no está disponible. Ve a Configuración → Proveedores para seleccionar uno activo.";

export function calculateCost(
  pricing: ModelPricing,
  inputTokens: number,
  outputTokens: number
): number {
  const threshold = pricing.longContextThreshold ?? Infinity;
  const useLong = inputTokens > threshold;
  const inRate = useLong ? pricing.inputLongContext ?? pricing.input : pricing.input;
  const outRate = useLong ? pricing.outputLongContext ?? pricing.output : pricing.output;
  return (inputTokens / 1_000_000) * inRate + (outputTokens / 1_000_000) * outRate;
}

export function roughTokenCount(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

// Keep legacy aliases for callers that still import them.
export const getModelById = getBuiltInModelById;
export function getAllModels(): Model[] {
  return BUILT_IN_MODELS;
}
