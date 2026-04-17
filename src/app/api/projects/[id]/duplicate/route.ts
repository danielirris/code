import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    const original = await prisma.project.findUnique({ where: { id } });
    if (!original) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const copy = await prisma.project.create({
      data: {
        name: `${original.name} (Copia)`,
        expertId: original.expertId,
        client: original.client,
        status: "active",
        notes: original.notes,
      }
    });
    return NextResponse.json({ success: true, id: copy.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
