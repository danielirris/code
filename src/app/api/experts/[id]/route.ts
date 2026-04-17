import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    // Delete the expert - projects will have a dangling expertId but won't break due to SQLite
    await prisma.knowledge.deleteMany({ where: { expertId: id } });
    await prisma.expert.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
