import { prisma } from "./prisma";
import { DEFAULT_MODEL_ID, isValidModelId } from "@/config/models";
import type { ProviderKeys } from "./providers/types";
import { getModelFromRegistry } from "./modelRegistry";

export type LoadedSettings = {
  settings: {
    id: string;
    anthropicApiKey: string | null;
    googleApiKey: string | null;
    openaiApiKey: string | null;
    selectedModel: string;
  } | null;
  migratedFromModel: string | null;
};

export async function loadSettings(): Promise<LoadedSettings> {
  const settings = await prisma.setting.findFirst();
  if (!settings) return { settings: null, migratedFromModel: null };

  const stillExists = isValidModelId(settings.selectedModel)
    ? true
    : !!(await getModelFromRegistry(settings.selectedModel));

  if (!stillExists) {
    const previous = settings.selectedModel;
    console.warn(
      `[settings] Migrating deprecated model "${previous}" → "${DEFAULT_MODEL_ID}"`
    );
    const updated = await prisma.setting.update({
      where: { id: settings.id },
      data: { selectedModel: DEFAULT_MODEL_ID },
    });
    return { settings: updated, migratedFromModel: previous };
  }

  return { settings, migratedFromModel: null };
}

export async function getActiveModelId(): Promise<string> {
  const { settings } = await loadSettings();
  return settings?.selectedModel || DEFAULT_MODEL_ID;
}

export async function getProviderKeys(): Promise<ProviderKeys> {
  const { settings } = await loadSettings();
  return {
    anthropic: settings?.anthropicApiKey ?? null,
    google: settings?.googleApiKey ?? null,
    openai: settings?.openaiApiKey ?? null,
  };
}

export function getKeyStatus(settings: LoadedSettings["settings"]): Record<string, boolean> {
  return {
    anthropic: !!settings?.anthropicApiKey,
    google: !!settings?.googleApiKey,
    openai: !!settings?.openaiApiKey,
  };
}
