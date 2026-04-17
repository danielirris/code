import { NextResponse } from "next/server";
import { duplicateExpertById } from "@/app/actions/experts";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    const newId = await duplicateExpertById(id);
    return NextResponse.json({ success: true, id: newId });
  } catch (e: any) {
    const status = e.message === "Experto no encontrado" ? 404 : 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}
