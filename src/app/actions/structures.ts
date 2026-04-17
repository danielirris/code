"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function invalidateAll() {
  revalidatePath("/", "layout");
}

export async function createStructure(formData: FormData) {
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const content = formData.get("content") as string;
  const notes = formData.get("notes") as string;
  const isActive = formData.get("isActive") === "on";
  const outputFormat = formData.get("outputFormat") as string;

  await prisma.structure.create({
    data: { name, type, description, content, notes, isActive, outputFormat },
  });

  invalidateAll();
  redirect("/structures");
}

export async function updateStructure(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const content = formData.get("content") as string;
  const notes = formData.get("notes") as string;
  const isActive = formData.get("isActive") === "on";
  const outputFormat = formData.get("outputFormat") as string;

  await prisma.structure.update({
    where: { id },
    data: { name, type, description, content, notes, isActive, outputFormat },
  });

  invalidateAll();
  redirect("/structures");
}

export async function deleteStructureById(id: string) {
  await prisma.structure.delete({ where: { id } });
  invalidateAll();
}

export async function patchStructureById(id: string, data: Record<string, unknown>) {
  const structure = await prisma.structure.update({ where: { id }, data });
  invalidateAll();
  return structure;
}

export async function duplicateStructureById(id: string) {
  const original = await prisma.structure.findUnique({ where: { id } });
  if (!original) throw new Error("Estructura no encontrada");

  const copy = await prisma.structure.create({
    data: {
      name: `${original.name} (Copia)`,
      type: original.type,
      description: original.description,
      content: original.content,
      notes: original.notes,
      isActive: false,
      outputFormat: original.outputFormat,
    },
  });

  invalidateAll();
  return copy.id;
}
