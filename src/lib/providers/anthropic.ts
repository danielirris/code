import Anthropic from "@anthropic-ai/sdk";
import { calculateCost, ModelPricing } from "@/config/models";
import { GenerateRequest, GenerateResponse, ProviderError } from "./types";

export async function callAnthropic(
  req: GenerateRequest,
  apiKey: string,
  pricing: ModelPricing
): Promise<GenerateResponse> {
  const client = new Anthropic({ apiKey });
  const start = Date.now();

  let response;
  try {
    response = await client.messages.create({
      model: req.model,
      max_tokens: req.maxTokens ?? 4096,
      system: req.systemPrompt,
      messages: [{ role: "user", content: req.userPrompt }],
    });
  } catch (err: unknown) {
    throw normalizeAnthropicError(err);
  }

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const totalCost = calculateCost(pricing, inputTokens, outputTokens);
  const content = response.content[0]?.type === "text" ? response.content[0].text : "";

  return {
    content,
    usage: { inputTokens, outputTokens, totalCost },
    model: req.model,
    provider: "anthropic",
    durationMs: Date.now() - start,
  };
}

function normalizeAnthropicError(err: unknown): ProviderError {
  const anyErr = err as { status?: number; message?: string };
  const status = anyErr.status;
  const msg = anyErr.message || "Error desconocido";

  if (status === 401)
    return new ProviderError("anthropic", "auth", "API key de Anthropic inválida. Revisa en console.anthropic.com/settings/keys", status, err);
  if (status === 404)
    return new ProviderError("anthropic", "deprecated_model", "El modelo de Claude configurado ya no está disponible. Ve a Configuración → Proveedores.", status, err);
  if (status === 429)
    return new ProviderError("anthropic", "rate_limit", "Anthropic: límite de peticiones alcanzado. Espera unos segundos.", status, err);
  if (status === 402)
    return new ProviderError("anthropic", "quota", "Anthropic: saldo insuficiente. Recarga en console.anthropic.com/settings/billing", status, err);
  if (msg.toLowerCase().includes("not_found_error"))
    return new ProviderError("anthropic", "deprecated_model", "El modelo de Claude configurado ya no está disponible. Ve a Configuración → Proveedores.", status, err);
  return new ProviderError("anthropic", "unknown", `Anthropic: ${msg}`, status, err);
}
