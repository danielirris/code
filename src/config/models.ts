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
];

export const DEFAULT_MODEL_ID = "claude-sonnet-4-6";
export const DEFAULT_VOC_MODEL_ID = "claude-sonnet-4-6";
export const DEFAULT_LONG_FORM_MODEL_ID = "claude-opus-4-7";
export const DEFAULT_FAST_MODEL_ID = "claude-haiku-4-5-20251001";

export function getAllModels(): Model[] {
  return BUILT_IN_MODELS;
}

export function getModelById(id: string): Model | undefined {
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
