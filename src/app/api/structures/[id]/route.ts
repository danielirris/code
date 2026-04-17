import { NextResponse } from "next/server";
import { deleteStructureById, patchStructureById } from "@/app/actions/structures";

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    await deleteStructureById(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    const body = await req.json();
    const structure = await patchStructureById(id, body);
    return NextResponse.json(structure);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
