import { NextResponse } from "next/server";
import { duplicateStructureById } from "@/app/actions/structures";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    const newId = await duplicateStructureById(id);
    return NextResponse.json({ success: true, id: newId });
  } catch (e: any) {
    const status = e.message === "Estructura no encontrada" ? 404 : 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}
