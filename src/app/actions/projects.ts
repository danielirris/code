"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function invalidateAll() {
  revalidatePath("/", "layout");
}

export async function createProject(formData: FormData) {
  const name = formData.get("name") as string;
  const client = formData.get("client") as string;
  const expertId = formData.get("expertId") as string;

  if (!expertId) throw new Error("El experto es obligatorio");

  const project = await prisma.project.create({
    data: { name, client, expertId, status: "active" },
  });

  invalidateAll();
  redirect(`/projects/${project.id}?tab=knowledge`);
}

export async function updateProject(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const client = formData.get("client") as string;
  const expertId = formData.get("expertId") as string;
  const status = formData.get("status") as string;

  await prisma.project.update({
    where: { id },
    data: { name, client, expertId, status },
  });

  invalidateAll();
  redirect(`/projects/${id}`);
}

export async function deleteProjectById(id: string) {
  await prisma.project.delete({ where: { id } });
  invalidateAll();
}

export async function patchProjectById(id: string, data: Record<string, unknown>) {
  const project = await prisma.project.update({ where: { id }, data });
  invalidateAll();
  return project;
}

export async function duplicateProjectById(id: string) {
  const original = await prisma.project.findUnique({ where: { id } });
  if (!original) throw new Error("Proyecto no encontrado");

  const copy = await prisma.project.create({
    data: {
      name: `${original.name} (Copia)`,
      expertId: original.expertId,
      client: original.client,
      status: "active",
      notes: original.notes,
    },
  });

  invalidateAll();
  return copy.id;
}

