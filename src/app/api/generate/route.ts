import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { loadSettings, getProviderKeys } from "@/lib/settings";
import { getModelFromRegistry } from "@/lib/modelRegistry";
import { DEFAULT_MODEL_ID } from "@/config/models";
import { generateCopy, ProviderError } from "@/lib/providers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, structureId, type: typeInput, brief, modelId: modelIdInput } = body as {
      projectId?: string;
      structureId?: string;
      type?: string;
      brief?: string;
      modelId?: string;
    };

    if (!projectId || !brief || (!structureId && !typeInput)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [project, template, { settings }, keys] = await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
        include: { expert: true, knowledge: true },
      }),
      structureId
        ? prisma.structure.findUnique({ where: { id: structureId } })
        : prisma.structure.findFirst({ where: { type: typeInput!, isActive: true } }),
      loadSettings(),
      getProviderKeys(),
    ]);

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    if (structureId && (!template || !template.isActive)) {
      return NextResponse.json(
        { error: "La estructura seleccionada ya no está disponible. Elige otra en el dropdown." },
        { status: 400 }
      );
    }

    const resolvedModelId = modelIdInput || settings?.selectedModel || DEFAULT_MODEL_ID;
    const model = await getModelFromRegistry(resolvedModelId);
    if (!model) {
      return NextResponse.json(
        { error: `El modelo ${resolvedModelId} no existe. Ve a Configuración → Proveedores.` },
        { status: 400 }
      );
    }

    if (!keys[model.provider]) {
      return NextResponse.json(
        { error: `Configura tu API key de ${model.provider} en Configuración para usar este modelo.` },
        { status: 400 }
      );
    }

    const type = template?.type || typeInput || "Entregable";

    const systemPromptBase =
      "Eres un copywriter senior que opera bajo los frameworks de Breakthrough Advertising (Schwartz) y $100M Offers/Leads (Hormozi). Antes de escribir identificas nivel de consciencia, nivel de sofisticación, y estructuras la oferta según la value equation. Nunca escribes copy genérico.";

    const knowledgeStr =
      project.knowledge.length > 0
        ? project.knowledge
            .map((k) => `[TIPO: ${k.type} | TITULO: ${k.title}]\n${k.rawContent}`)
            .join("\n\n---\n\n")
        : "No hay contexto de conocimiento adicional suministrado por el usuario.";

    const structureStr = template
      ? `2. ESTRUCTURA GLOBAL DEL ENTREGABLE (${template.name}):
Implementa estrictamente la siguiente anatomía:
${template.content}
Notas / ejemplo: ${template.notes || "Ninguna"}`
      : "2. ESTRUCTURA LIBRE (No hay template global para este tipo. Decide tú la mejor anatomía.)";

    const vocStr =
      project.vocProfile ||
      project.expert.vocProfile ||
      "No hay Voice of Customer definido explícitamente. Asume lo mejor según el framework.";

    const fullPrompt = `1. IDENTIDAD DEL EXPERTO Y REGLAS DE LA PIEZA:
${project.expert.instructions}

${structureStr}

3. VOICE OF CUSTOMER (DATA DEL AVATAR):
======================================
Usa las frases literales y el vocabulario del avatar cuando escribas. No inventes cómo habla la audiencia: aquí está cómo hablan de verdad.
${vocStr}
======================================

4. BASE DE CONOCIMIENTO DEL PROYECTO:
======================================
${knowledgeStr}
======================================

5. BRIEFING ESPECÍFICO DE ESTE ENTREGABLE:
Tipo: ${type}
Petición (Brief): ${brief}

6. INSTRUCCIÓN FINAL:
${
  template?.outputFormat === "HTML"
    ? "⚠️ CRÍTICO: El resultado DEBE ser devuelto explícitamente en formato HTML puro listo para ser renderizado. NO uses etiquetas markdown como ```html (sólo código puro)."
    : template?.outputFormat === "MARKDOWN"
    ? "⚠️ CRÍTICO: El resultado DEBE ser devuelto en formato Markdown."
    : "Entrega solo la pieza final, lista para copiar y pegar."
}

Sin explicaciones, sin preámbulos, sin meta-comentarios.`;

    let genResponse;
    try {
      genResponse = await generateCopy(
        {
          provider: model.provider,
          model: model.id,
          systemPrompt: systemPromptBase,
          userPrompt: fullPrompt,
          maxTokens: 8192,
        },
        keys
      );
    } catch (err) {
      if (err instanceof ProviderError) {
        return NextResponse.json({ error: err.userMessage, kind: err.kind, provider: err.provider }, { status: 400 });
      }
      throw err;
    }

    const deliverable = await prisma.deliverable.create({
      data: {
        projectId,
        type,
        brief,
        content: genResponse.content,
      },
    });

    return NextResponse.json({
      content: genResponse.content,
      format: template?.outputFormat || "PLAIN",
      deliverableId: deliverable.id,
      debugPrompt: fullPrompt,
      usage: {
        inputTokens: genResponse.usage.inputTokens,
        outputTokens: genResponse.usage.outputTokens,
        totalCost: genResponse.usage.totalCost,
      },
      model: { id: model.id, displayName: model.displayName, provider: model.provider },
      durationMs: genResponse.durationMs,
      costEstimate: `Tokens In: ${genResponse.usage.inputTokens} | Tokens Out: ${genResponse.usage.outputTokens} | ~$${genResponse.usage.totalCost.toFixed(4)}`,
    });
  } catch (error: unknown) {
    console.error("API Generation Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to generate copy.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
