"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { loadSettings, getProviderKeys } from "@/lib/settings";
import { getModelFromRegistry } from "@/lib/modelRegistry";
import { DEFAULT_VOC_MODEL_ID } from "@/config/models";
import { generateCopy, ProviderError } from "@/lib/providers";

export async function generateVocProfile(id: string, type: 'expert' | 'project') {
  const [{ settings }, keys] = await Promise.all([loadSettings(), getProviderKeys()]);

  const knowledgeList = await prisma.knowledge.findMany({
    where: type === 'expert' ? { expertId: id } : { projectId: id }
  });

  if (knowledgeList.length === 0) {
    throw new Error("No hay conocimiento base para analizar.");
  }

  const modelId = settings?.selectedModel || DEFAULT_VOC_MODEL_ID;
  const model = await getModelFromRegistry(modelId);
  if (!model) throw new Error(`Modelo ${modelId} no encontrado. Revisa Configuración.`);
  if (!keys[model.provider]) {
    throw new Error(`Configura tu API key de ${model.provider} en Configuración para generar VoC.`);
  }

  const rawTexts = knowledgeList.map(k => `[${k.title}]\n${k.rawContent}`).join("\n\n---\n\n");

  const prompt = `Eres un investigador de mercado experto en Voice of Customer (VoC).
Analiza detalladamente la siguiente raw data importada y devuelve un "Voice of Customer Profile" estructurado en Markdown.

Debes incluir OBLIGATORIAMENTE estas secciones:
## 🗣 Frases literales del avatar
Extrae 5-7 citas textuales cortas y potentes. Tal como hablan. Conserva sus palabras exactas, modismos y errores.

## 💔 Dolores principales
En orden de frecuencia o intensidad.

## ✨ Deseos y resultados soñados (Dream Outcomes)
Qué quieren lograr, usando su propio lenguaje.

## 🚫 Objeciones y dudas
Qué los frena de tomar acción o comprar.

## ♻️ Intentos fallidos previos
Qué han probado antes que no les funcionó.

## 🧠 Nivel de consciencia predominante
(Según Eugene Schwartz: unaware / problem-aware / solution-aware / product-aware / most aware). Justifica brevemente.

## 📏 Nivel de sofisticación del mercado
(1 al 5 según Schwartz). Justifica.

## 📖 Vocabulario recurrente
Glosario de 5-10 palabras o expresiones que repiten constantemente.

## 🎭 Emociones dominantes
Qué sienten frente a su problema.

DATA RAW PARA ANALIZAR:
=========================
${rawTexts}
=========================`;

  let response;
  try {
    response = await generateCopy(
      {
        provider: model.provider,
        model: model.id,
        systemPrompt: "You are a customer research analyst. Respond only in Markdown.",
        userPrompt: prompt,
        maxTokens: 3000,
      },
      keys
    );
  } catch (err) {
    if (err instanceof ProviderError) {
      throw new Error(err.userMessage);
    }
    throw err;
  }

  if (type === 'expert') {
    await prisma.expert.update({
      where: { id },
      data: { vocProfile: response.content }
    });
    revalidatePath(`/experts/${id}`);
  } else {
    await prisma.project.update({
      where: { id },
      data: { vocProfile: response.content }
    });
    revalidatePath(`/projects/${id}`);
  }
}

export async function updateVocProfileManual(id: string, type: 'expert' | 'project', content: string) {
  if (type === 'expert') {
    await prisma.expert.update({ where: { id }, data: { vocProfile: content } });
    revalidatePath(`/experts/${id}`);
  } else {
    await prisma.project.update({ where: { id }, data: { vocProfile: content } });
    revalidatePath(`/projects/${id}`);
  }
}
