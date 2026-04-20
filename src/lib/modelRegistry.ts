import { prisma } from "./prisma";
import {
  BUILT_IN_MODELS,
  Model,
  Provider,
  Tier,
} from "@/config/models";

function customToModel(c: {
  modelId: string;
  provider: string;
  displayName: string;
  inputPrice: number;
  outputPrice: number;
  tier: string;
}): Model {
  return {
    id: c.modelId,
    provider: c.provider as Provider,
    displayName: c.displayName,
    pricing: { input: c.inputPrice, output: c.outputPrice },
    maxContext: 0,
    tier: (c.tier as Tier) || "balanced",
    bestFor: ["Personalizado"],
  };
}

export async function getAllAvailableModels(): Promise<Model[]> {
  const customs = await prisma.customModel.findMany({ orderBy: { createdAt: "desc" } });
  return [...BUILT_IN_MODELS, ...customs.map(customToModel)];
}

export async function getModelFromRegistry(id: string): Promise<Model | null> {
  const builtIn = BUILT_IN_MODELS.find((m) => m.id === id);
  if (builtIn) return builtIn;
  const custom = await prisma.customModel.findUnique({ where: { modelId: id } });
  return custom ? customToModel(custom) : null;
}

export async function getCustomModels() {
  return prisma.customModel.findMany({ orderBy: { createdAt: "desc" } });
}
