import { prisma } from "./prisma";
import { DEFAULT_MODEL_ID, isValidModelId } from "@/config/models";

export type LoadedSettings = {
  settings: {
    id: string;
    anthropicApiKey: string | null;
    selectedModel: string;
  } | null;
  migratedFromModel: string | null;
};

export async function loadSettings(): Promise<LoadedSettings> {
  const settings = await prisma.setting.findFirst();
  if (!settings) return { settings: null, migratedFromModel: null };

  if (!isValidModelId(settings.selectedModel)) {
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
