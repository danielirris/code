"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import * as cheerio from "cheerio";
import mammoth from "mammoth";

export async function deleteKnowledge(expertId: string, knowledgeId: string) {
  await prisma.knowledge.delete({ where: { id: knowledgeId } });
  revalidatePath(`/experts/${expertId}`);
}

export async function addTextKnowledge(expertId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  
  if (content && content.trim()) {
    await prisma.knowledge.create({
      data: {
        expertId,
        title: title || "Text Note",
        type: "TEXT",
        rawContent: content
      }
    });
  }
  revalidatePath(`/experts/${expertId}`);
}

export async function addUrlKnowledge(expertId: string, formData: FormData) {
  const urls = formData.get("urls") as string;
  const urlList = urls.split("\n").map(u => u.trim()).filter(Boolean);
  
  for (const url of urlList) {
    try {
      const res = await fetch(url);
      const html = await res.text();
      const $ = cheerio.load(html);
      // Remove scripts and styles
      $("script, style, noscript, iframe").remove();
      const rawContent = $("body").text().replace(/\s+/g, " ").trim();
      const title = $("title").text() || url;
      
      await prisma.knowledge.create({
        data: { expertId, title, type: "URL", rawContent }
      });
    } catch (e) {
      console.error(`Failed to fetch ${url}`, e);
    }
  }
  
  revalidatePath(`/experts/${expertId}`);
}

export async function addFileKnowledge(expertId: string, formData: FormData) {
  const file = formData.get("file") as File;
  if (!file || file.size === 0) return;

  const { extractTextFromFile } = await import("@/lib/fileParser");
  const text = await extractTextFromFile(file);

  if (text && text.trim()) {
    await prisma.knowledge.create({
      data: {
        expertId,
        title: file.name,
        type: "FILE",
        rawContent: text.trim()
      }
    });
  }
  
  revalidatePath(`/experts/${expertId}`);
}
