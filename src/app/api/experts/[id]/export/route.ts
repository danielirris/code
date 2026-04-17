import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    const expert = await prisma.expert.findUnique({ where: { id } });
    if (!expert) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const md = `# ${expert.name}\n\n**Especialidad:** ${expert.specialty}\n\n## Instrucciones\n\n${expert.instructions}${expert.vocProfile ? `\n\n## Perfil Voz del Cliente\n\n${expert.vocProfile}` : ""}`;

    return new NextResponse(md, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="${expert.name.toLowerCase().replace(/\s+/g, "-")}.md"`
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
