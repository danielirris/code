import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    await prisma.structure.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    const body = await req.json();
    const structure = await prisma.structure.update({ where: { id }, data: body });
    return NextResponse.json(structure);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
