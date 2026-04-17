import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    const original = await prisma.structure.findUnique({ where: { id } });
    if (!original) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const copy = await prisma.structure.create({
      data: {
        name: `${original.name} (Copia)`,
        type: original.type,
        description: original.description,
        content: original.content,
        notes: original.notes,
        isActive: false,
        outputFormat: original.outputFormat,
      }
    });
    return NextResponse.json({ success: true, id: copy.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
