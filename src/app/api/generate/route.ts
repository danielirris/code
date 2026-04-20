import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { loadSettings } from "@/lib/settings";
import {
  DEFAULT_MODEL_ID,
  isDeprecatedModelError,
  DEPRECATED_MODEL_USER_MESSAGE,
} from "@/config/models";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, structureId, type: typeInput, brief } = body as {
      projectId?: string;
      structureId?: string;
      type?: string;
      brief?: string;
    };

    if (!projectId || !brief || (!structureId && !typeInput)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [project, template, { settings }] = await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
        include: { expert: true, knowledge: true }
      }),
      structureId
        ? prisma.structure.findUnique({ where: { id: structureId } })
        : prisma.structure.findFirst({ where: { type: typeInput!, isActive: true } }),
      loadSettings(),
    ]);

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (!settings?.anthropicApiKey) return NextResponse.json({ error: "API Key not configured in Settings" }, { status: 400 });

    if (structureId && (!template || !template.isActive)) {
      return NextResponse.json(
        { error: "La estructura seleccionada ya no está disponible. Elige otra en el dropdown." },
        { status: 400 }
      );
    }

    const type = template?.type || typeInput || "Entregable";

    const anthropic = new Anthropic({
      apiKey: settings.anthropicApiKey,
    });

    // Prompt Assembler
    const systemPromptBase = "Eres un copywriter senior que opera bajo los frameworks de Breakthrough Advertising (Schwartz) y $100M Offers/Leads (Hormozi). Antes de escribir identificas nivel de consciencia, nivel de sofisticación, y estructuras la oferta según la value equation. Nunca escribes copy genérico.";

    let knowledgeStr = "";
    if (project.knowledge.length > 0) {
      knowledgeStr = project.knowledge.map((k) => `[TIPO: ${k.type} | TITULO: ${k.title}]\n${k.rawContent}`).join("\n\n---\n\n");
    } else {
      knowledgeStr = "No hay contexto de conocimiento adicional suministrado por el usuario.";
    }

    const structureStr = template
      ? `2. ESTRUCTURA GLOBAL DEL ENTREGABLE (${template.name}):
Implementa estrictamente la siguiente anatomía:
${template.content}
Notas / ejemplo: ${template.notes || 'Ninguna'}`
      : "2. ESTRUCTURA LIBRE (No hay template global para este tipo. Decide tú la mejor anatomía.)";

    const vocStr = project.vocProfile || project.expert.vocProfile || "No hay Voice of Customer definido explícitamente. Asume lo mejor según el framework.";

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
${template?.outputFormat === "HTML" ? "⚠️ CRÍTICO: El resultado DEBE ser devuelto explícitamente en formato HTML puro listo para ser renderizado. NO uses etiquetas markdown como ```html (sólo código puro)." : template?.outputFormat === "MARKDOWN" ? "⚠️ CRÍTICO: El resultado DEBE ser devuelto en formato Markdown." : "Entrega solo la pieza final, lista para copiar y pegar."}

Sin explicaciones, sin preámbulos, sin meta-comentarios.`;

    let response;
    try {
      response = await anthropic.messages.create({
        model: settings?.selectedModel || DEFAULT_MODEL_ID,
        max_tokens: 8192,
        system: systemPromptBase,
        messages: [
          { role: "user", content: fullPrompt }
        ]
      });
    } catch (err) {
      if (isDeprecatedModelError(err)) {
        return NextResponse.json({ error: DEPRECATED_MODEL_USER_MESSAGE }, { status: 400 });
      }
      throw err;
    }

    let contentText = "";
    if (response.content[0].type === "text") {
       contentText = response.content[0].text;
    } else {
       contentText = "Unrecognized response type from Claude.";
    }

    const deliverable = await prisma.deliverable.create({
      data: {
        projectId,
        type,
        brief,
        content: contentText
      }
    });

    return NextResponse.json({
      content: contentText,
      format: template?.outputFormat || "PLAIN",
      deliverableId: deliverable.id,
      debugPrompt: fullPrompt,
      costEstimate: `Tokens In: ${response.usage.input_tokens} | Tokens Out: ${response.usage.output_tokens}`
    });

  } catch (error: any) {
    console.error("API Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate copy." }, { status: 500 });
  }
}
