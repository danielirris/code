import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  try {
    const { projectId, type, brief } = await req.json();
    
    if (!projectId || !type || !brief) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { expert: true, knowledge: true }
    });
    
    const settings = await prisma.setting.findFirst();
    
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (!settings?.anthropicApiKey) return NextResponse.json({ error: "API Key not configured in Settings" }, { status: 400 });

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

    const template = await prisma.structure.findFirst({
      where: { type, isActive: true },
    });

    let structureStr = template 
      ? `2. ESTRUCTURA GLOBAL DEL ENTREGABLE (${template.name}):
Implementa estrictamente la siguiente anatomía:
${template.content}
Notas extra: ${template.notes || 'Ninguna'}` 
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

    const response = await anthropic.messages.create({
      model: settings?.selectedModel || "claude-3-7-sonnet-20250219",
      max_tokens: 8192,
      system: systemPromptBase,
      messages: [
        { role: "user", content: fullPrompt }
      ]
    });

    let contentText = "";
    if (response.content[0].type === "text") {
       contentText = response.content[0].text;
    } else {
       contentText = "Unrecognized response type from Claude.";
    }

    // Persist Generation
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
