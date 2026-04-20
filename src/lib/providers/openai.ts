import { calculateCost, ModelPricing } from "@/config/models";
import { GenerateRequest, GenerateResponse, ProviderError } from "./types";

export async function callOpenAI(
  req: GenerateRequest,
  apiKey: string,
  pricing: ModelPricing
): Promise<GenerateResponse> {
  const start = Date.now();
  const url = "https://api.openai.com/v1/chat/completions";

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: req.model,
        messages: [
          { role: "system", content: req.systemPrompt },
          { role: "user", content: req.userPrompt },
        ],
        max_tokens: req.maxTokens ?? 4096,
      }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new ProviderError("openai", "service", `OpenAI: error de red — ${msg}`, undefined, err);
  }

  if (!res.ok) throw await normalizeOpenAIError(res);

  const data: {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  } = await res.json();

  const content = data.choices?.[0]?.message?.content ?? "";
  const inputTokens = data.usage?.prompt_tokens ?? 0;
  const outputTokens = data.usage?.completion_tokens ?? 0;
  const totalCost = calculateCost(pricing, inputTokens, outputTokens);

  return {
    content,
    usage: { inputTokens, outputTokens, totalCost },
    model: req.model,
    provider: "openai",
    durationMs: Date.now() - start,
  };
}

async function normalizeOpenAIError(res: Response): Promise<ProviderError> {
  const status = res.status;
  const raw = await res.text();
  let msg = raw;
  let code: string | undefined;
  try {
    const parsed = JSON.parse(raw);
    msg = parsed?.error?.message || raw;
    code = parsed?.error?.code;
  } catch {
    /* keep raw */
  }
  const lower = msg.toLowerCase();

  if (status === 401)
    return new ProviderError("openai", "auth", "API key de OpenAI inválida. Revisa en platform.openai.com/api-keys", status);
  if (status === 404)
    return new ProviderError("openai", "deprecated_model", "OpenAI: el modelo no existe. Revisa el ID en platform.openai.com/docs/models", status);
  if (status === 429)
    return new ProviderError("openai", "rate_limit", "OpenAI: límite de peticiones alcanzado. Espera unos segundos.", status);
  if (status === 402 || code === "insufficient_quota")
    return new ProviderError("openai", "quota", "OpenAI: sin crédito. Recarga en platform.openai.com/settings/organization/billing", status);
  if (status === 400 && /context.?length|too large/i.test(lower))
    return new ProviderError("openai", "context_exceeded", "OpenAI: el prompt excede el contexto máximo del modelo.", status);
  if (status === 400)
    return new ProviderError("openai", "unknown", `OpenAI: ${msg}`, status);
  return new ProviderError("openai", "unknown", `OpenAI (${status}): ${msg}`, status);
}
