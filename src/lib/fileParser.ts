import mammoth from "mammoth";
import Papa from "papaparse";

export async function extractTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  if (file.name.endsWith(".pdf")) {
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return data.text;
  } else if (file.name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else if (file.name.endsWith(".csv")) {
    const text = buffer.toString("utf-8");
    const results = Papa.parse(text, { header: true });
    
    // Format as readable plain text
    // E.g. "Row 1: Header1: Value1 | Header2: Value2"
    let formattedText = "";
    if (results.data && results.data.length > 0) {
      formattedText = results.data.map((row: any, i) => {
        const parts = Object.entries(row).map(([k, v]) => `${k}: ${v}`);
        return `[Entry ${i + 1}] ${parts.join(" | ")}`;
      }).join("\n");
    }
    return formattedText;
  } else if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
    return buffer.toString("utf-8");
  }
  
  return "";
}
