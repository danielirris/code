"use client";

import { useState } from "react";
import { File } from "lucide-react";

interface FileUploadFormProps {
  projectId: string;
  addFileKnowledge: (id: string, formData: FormData) => Promise<void>;
}

export default function FileUploadForm({ projectId, addFileKnowledge }: FileUploadFormProps) {
  const [loading, setLoading] = useState(false);
  const [filesCount, setFilesCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const files = fileInput.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setFilesCount(files.length);

    try {
      const promises = Array.from(files).map(async (file) => {
        const fd = new FormData();
        fd.append("file", file);
        await addFileKnowledge(projectId, fd);
      });
      await Promise.all(promises);
      form.reset();
      setFilesCount(0);
    } catch (err) {
      console.error(err);
      alert("Algunos archivos no se pudieron procesar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bento-card">
      <h3 style={{ fontSize: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <File size={18} /> Subir documento(s)
      </h3>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="file"
          name="file"
          className="input-base"
          accept=".pdf,.docx,.txt,.csv,.md"
          multiple
          required
          style={{ padding: "0.5rem" }}
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ alignSelf: "flex-end", fontSize: "0.85rem", padding: "0.4rem 1rem" }}
        >
          {loading ? `Procesando ${filesCount} archivo(s)…` : "Subir y añadir archivos"}
        </button>
      </form>
    </div>
  );
}
