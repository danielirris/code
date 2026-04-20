"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Provider } from "@/config/models";
import { testProviderConnection } from "@/lib/providers";

function invalidate() {
  revalidatePath("/", "layout");
}

async function ensureSetting() {
  const existing = await prisma.setting.findFirst();
  if (existing) return existing;
  return prisma.setting.create({ data: {} });
}

export async function saveProviderKey(provider: Provider, apiKey: string) {
  const setting = await ensureSetting();
  const cleaned = apiKey.trim() || null;
  const field: Record<Provider, string> = {
    anthropic: "anthropicApiKey",
    google: "googleApiKey",
    openai: "openaiApiKey",
  };
  await prisma.setting.update({
    where: { id: setting.id },
    data: { [field[provider]]: cleaned },
  });
  invalidate();
}

export async function saveSelectedModel(modelId: string) {
  const setting = await ensureSetting();
  await prisma.setting.update({
    where: { id: setting.id },
    data: { selectedModel: modelId },
  });
  invalidate();
}

export async function testConnection(provider: Provider, apiKey: string) {
  const result = await testProviderConnection(provider, apiKey);
  return result;
}

export async function createCustomModel(formData: FormData) {
  const modelId = (formData.get("modelId") as string).trim();
  const provider = (formData.get("provider") as Provider);
  const displayName = (formData.get("displayName") as string).trim();
  const inputPrice = parseFloat((formData.get("inputPrice") as string) || "0");
  const outputPrice = parseFloat((formData.get("outputPrice") as string) || "0");
  const tier = ((formData.get("tier") as string) || "balanced").trim();

  if (!modelId || !provider || !displayName) {
    throw new Error("Faltan campos obligatorios");
  }
  if (!["anthropic", "google", "openai"].includes(provider)) {
    throw new Error("Proveedor inválido");
  }
  if (Number.isNaN(inputPrice) || Number.isNaN(outputPrice)) {
    throw new Error("Precios inválidos");
  }

  await prisma.customModel.create({
    data: { modelId, provider, displayName, inputPrice, outputPrice, tier },
  });
  invalidate();
}

export async function deleteCustomModel(id: string) {
  await prisma.customModel.delete({ where: { id } });
  invalidate();
}

export async function updateCustomModel(id: string, formData: FormData) {
  const displayName = (formData.get("displayName") as string).trim();
  const inputPrice = parseFloat((formData.get("inputPrice") as string) || "0");
  const outputPrice = parseFloat((formData.get("outputPrice") as string) || "0");
  const tier = ((formData.get("tier") as string) || "balanced").trim();

  if (!displayName) throw new Error("Nombre obligatorio");
  if (Number.isNaN(inputPrice) || Number.isNaN(outputPrice)) {
    throw new Error("Precios inválidos");
  }

  await prisma.customModel.update({
    where: { id },
    data: { displayName, inputPrice, outputPrice, tier },
  });
  invalidate();
}
