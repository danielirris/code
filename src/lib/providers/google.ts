import { calculateCost, ModelPricing } from "@/config/models";
import { GenerateRequest, GenerateResponse, ProviderError } from "./types";

export async function callGoogle(
  req: GenerateRequest,
  apiKey: string,
  pricing: ModelPricing
): Promise<GenerateResponse> {
  const start = Date.now();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(req.model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: req.systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: req.userPrompt }] }],
        generationConfig: { maxOutputTokens: req.maxTokens ?? 4096 },
      }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new ProviderError("google", "service", `Google: error de red — ${msg}`, undefined, err);
  }

  if (!res.ok) throw await normalizeGoogleError(res);

  const data: {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
  } = await res.json();

  const content = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  const inputTokens = data.usageMetadata?.promptTokenCount ?? 0;
  const outputTokens = data.usageMetadata?.candidatesTokenCount ?? 0;
  const totalCost = calculateCost(pricing, inputTokens, outputTokens);

  return {
    content,
    usage: { inputTokens, outputTokens, totalCost },
    model: req.model,
    provider: "google",
    durationMs: Date.now() - start,
  };
}

async function normalizeGoogleError(res: Response): Promise<ProviderError> {
  const status = res.status;
  const raw = await res.text();
  let msg = raw;
  try {
    const parsed = JSON.parse(raw);
    msg = parsed?.error?.message || raw;
  } catch {
    /* keep raw */
  }
  const lower = msg.toLowerCase();

  if (status === 400 && /api.?key/i.test(msg))
    return new ProviderError("google", "auth", "API key de Google inválida. Revisa en aistudio.google.com/apikey", status);
  if (status === 400 && /quota|billing/i.test(msg))
    return new ProviderError("google", "quota", "Google: cuota agotada o sin billing activado. Ve a console.cloud.google.com/billing", status);
  if (status === 400 && lower.includes("not found"))
    return new ProviderError("google", "deprecated_model", "Google: el modelo no existe o fue retirado.", status);
  if (status === 400)
    return new ProviderError("google", "unknown", `Google: ${msg}`, status);
  if (status === 403)
    return new ProviderError("google", "billing", "Google: billing no habilitado para este modelo. Ve a console.cloud.google.com/billing", status);
  if (status === 404)
    return new ProviderError("google", "deprecated_model", "Google: el modelo no existe o fue retirado.", status);
  if (status === 429)
    return new ProviderError("google", "rate_limit", "Google: límite de peticiones alcanzado. Espera unos segundos.", status);
  if (status === 503)
    return new ProviderError("google", "service", "Google: modelo sobrecargado. Reintenta en unos segundos.", status);
  return new ProviderError("google", "unknown", `Google (${status}): ${msg}`, status);
}
