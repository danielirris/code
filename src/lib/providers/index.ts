import { Provider } from "@/config/models";
import { getModelFromRegistry } from "../modelRegistry";
import { callAnthropic } from "./anthropic";
import { callGoogle } from "./google";
import { callOpenAI } from "./openai";
import {
  GenerateRequest,
  GenerateResponse,
  ProviderError,
  ProviderKeys,
} from "./types";

export { ProviderError, isProviderError } from "./types";
export type { GenerateRequest, GenerateResponse, ProviderKeys } from "./types";

export async function generateCopy(
  req: GenerateRequest,
  keys: ProviderKeys
): Promise<GenerateResponse> {
  const model = await getModelFromRegistry(req.model);
  if (!model) {
    throw new ProviderError(
      req.provider,
      "unknown",
      `Modelo ${req.model} no encontrado en el registro.`
    );
  }

  const resolvedProvider = model.provider;
  const key = keys[resolvedProvider];
  if (!key) {
    throw new ProviderError(
      resolvedProvider,
      "auth",
      `No hay API key configurada para ${resolvedProvider}. Ve a Configuración → Proveedores.`
    );
  }

  const resolvedReq: GenerateRequest = { ...req, provider: resolvedProvider };

  switch (resolvedProvider) {
    case "anthropic":
      return callAnthropic(resolvedReq, key, model.pricing);
    case "google":
      return callGoogle(resolvedReq, key, model.pricing);
    case "openai":
      return callOpenAI(resolvedReq, key, model.pricing);
  }
}

const TEST_MODELS: Record<Provider, string> = {
  anthropic: "claude-haiku-4-5-20251001",
  google: "gemini-3.1-flash-lite",
  openai: "gpt-4o-mini",
};

export async function testProviderConnection(
  provider: Provider,
  apiKey: string
): Promise<{ ok: true; model: string } | { ok: false; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { ok: false, message: "Pega una API key antes de validar." };
  }
  const model = TEST_MODELS[provider];
  const keys: ProviderKeys = { anthropic: null, google: null, openai: null };
  keys[provider] = apiKey;

  try {
    await generateCopy(
      {
        provider,
        model,
        systemPrompt: "Respond with the single word: ok",
        userPrompt: "ping",
        maxTokens: 10,
      },
      keys
    );
    return { ok: true, model };
  } catch (err: unknown) {
    if (err instanceof ProviderError) {
      return { ok: false, message: err.userMessage };
    }
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: msg };
  }
}
