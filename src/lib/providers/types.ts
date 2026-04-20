import { Provider } from "@/config/models";

export type GenerateRequest = {
  provider: Provider;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
};

export type GenerateResponse = {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
  };
  model: string;
  provider: Provider;
  durationMs: number;
};

export type ProviderKeys = {
  anthropic: string | null;
  google: string | null;
  openai: string | null;
};

export type ProviderErrorKind =
  | "auth"
  | "rate_limit"
  | "deprecated_model"
  | "quota"
  | "context_exceeded"
  | "billing"
  | "service"
  | "unknown";

export class ProviderError extends Error {
  public provider: Provider;
  public kind: ProviderErrorKind;
  public userMessage: string;
  public status?: number;
  public rawError?: unknown;

  constructor(
    provider: Provider,
    kind: ProviderErrorKind,
    userMessage: string,
    status?: number,
    rawError?: unknown
  ) {
    super(userMessage);
    this.name = "ProviderError";
    this.provider = provider;
    this.kind = kind;
    this.userMessage = userMessage;
    this.status = status;
    this.rawError = rawError;
  }
}

export function isProviderError(err: unknown): err is ProviderError {
  return err instanceof Error && err.name === "ProviderError";
}
