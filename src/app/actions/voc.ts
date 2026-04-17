"use server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";

export async function generateVocProfile(id: string, type: 'expert' | 'project') {
  const settings = await prisma.setting.findFirst();
  if (!settings?.anthropicApiKey) throw new Error("API Key not configured");

  const anthropic = new Anthropic({ apiKey: settings.anthropicApiKey });
  
  const knowledgeList = await prisma.knowledge.findMany({
    where: type === 'expert' ? { expertId: id } : { projectId: id }
  });

  if (knowledgeList.length === 0) {
    throw new Error("No hay conocimiento base para analizar.");
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

  const response = await anthropic.messages.create({
    model: "claude-3-7-sonnet-20250219",
    max_tokens: 3000,
    messages: [
      { role: "user", content: prompt }
    ]
  });

  let contentText = "";
  if (response.content[0].type === "text") {
     contentText = response.content[0].text;
  }

  if (type === 'expert') {
    await prisma.expert.update({
      where: { id },
      data: { vocProfile: contentText }
    });
    revalidatePath(`/experts/${id}`);
  } else {
    await prisma.project.update({
      where: { id },
      data: { vocProfile: contentText }
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
