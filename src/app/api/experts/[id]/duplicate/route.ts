import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    const original = await prisma.expert.findUnique({ where: { id } });
    if (!original) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const copy = await prisma.expert.create({
      data: {
        name: `${original.name} (Copia)`,
        specialty: original.specialty,
        instructions: original.instructions,
        references: original.references,
        vocProfile: original.vocProfile,
      }
    });
    return NextResponse.json({ success: true, id: copy.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
