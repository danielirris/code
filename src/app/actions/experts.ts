"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function invalidateAll() {
  revalidatePath("/", "layout");
}

export async function createExpert(formData: FormData) {
  const name = formData.get("name") as string;
  const specialty = formData.get("specialty") as string;
  const instructions = formData.get("instructions") as string;

  const expert = await prisma.expert.create({
    data: { name, specialty, instructions },
  });

  invalidateAll();
  redirect(`/experts/${expert.id}`);
}

export async function updateExpert(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const specialty = formData.get("specialty") as string;
  const instructions = formData.get("instructions") as string;

  await prisma.expert.update({
    where: { id },
    data: { name, specialty, instructions },
  });

  invalidateAll();
  redirect(`/experts/${id}`);
}

export async function deleteExpertById(id: string) {
  await prisma.knowledge.deleteMany({ where: { expertId: id } });
  await prisma.expert.delete({ where: { id } });
  invalidateAll();
}

export async function duplicateExpertById(id: string) {
  const original = await prisma.expert.findUnique({ where: { id } });
  if (!original) throw new Error("Experto no encontrado");

  const copy = await prisma.expert.create({
    data: {
      name: `${original.name} (Copia)`,
      specialty: original.specialty,
      instructions: original.instructions,
      references: original.references,
      vocProfile: original.vocProfile,
    },
  });

  invalidateAll();
  return copy.id;
}
