"use client";

import { useState } from "react";
import { Copy, Loader2, Bug, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function GeneratorUI({ projectId, expertSpecialty }: { projectId: string, expertSpecialty: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ content: string; format: string; debugPrompt: string; costEstimate: string } | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"code" | "preview">("code");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const type = formData.get("type") as string;
    const brief = formData.get("brief") as string;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, type, brief }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Error desconocido al generar");
      
      setResult(data);
      setViewMode(data.format === "HTML" ? "preview" : "code");
      router.refresh(); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
      <div className="bento-card" style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        <h2 style={{ fontSize: "1.4rem", marginBottom: "1.5rem" }}>Solicitar entregable</h2>
        
        {error && (
          <div style={{ padding: "1rem", background: "rgba(255,0,0,0.1)", color: "#ff6b6b", border: "1px solid #ff6b6b", borderRadius: "8px", marginBottom: "1rem" }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Tipo de entregable</label>
            <input type="text" name="type" className="input-base" defaultValue={expertSpecialty} required />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Brief y contexto específico</label>
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
              ¿Qué necesitas exactamente? (ej. 'Escribe una secuencia de 3 emails para el lanzamiento. Énfasis en la garantía.')
            </p>
            <textarea name="brief" className="input-base" rows={5} required></textarea>
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", padding: "0.8rem" }}>
            {loading ? <><Logo size={18} animate /> Generando...</> : "Generar copy"}
          </button>
        </form>
      </div>

      {result && (
        <div style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 600 }}>Resultado generado</h3>
              {result.format === "HTML" && (
                <div style={{ display: "flex", background: "var(--surface)", borderRadius: "8px", padding: "0.2rem", border: "1px solid var(--border)" }}>
                  <button 
                    onClick={() => setViewMode("preview")} 
                    style={{ padding: "0.3rem 0.8rem", borderRadius: "4px", fontSize: "0.8rem", background: viewMode === "preview" ? "var(--text-primary)" : "transparent", color: viewMode === "preview" ? "var(--background)" : "var(--text-secondary)", border: "none", cursor: "pointer" }}
                  >
                    Vista previa
                  </button>
                  <button 
                    onClick={() => setViewMode("code")} 
                    style={{ padding: "0.3rem 0.8rem", borderRadius: "4px", fontSize: "0.8rem", background: viewMode === "code" ? "var(--text-primary)" : "transparent", color: viewMode === "code" ? "var(--background)" : "var(--text-secondary)", border: "none", cursor: "pointer" }}
                  >
                    Código HTML
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => setShowDebug(!showDebug)} style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-secondary)", fontSize: "0.85rem", border: "none", background: "transparent", cursor: "pointer" }}>
                <Bug size={14} /> Prompt debug
              </button>
              <button onClick={copyToClipboard} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: copied ? "var(--text-primary)" : "var(--accent-main)", color: copied ? "var(--background)" : "#fff" }}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "¡Copiado!" : "Copiar"}
              </button>
            </div>
          </div>
          
          <div className="bento-card" style={{ padding: viewMode === "code" ? "2rem" : "0", overflow: "hidden" }}>
            {viewMode === "preview" && result.format === "HTML" ? (
              <iframe 
                srcDoc={result.content} 
                style={{ width: "100%", height: "600px", border: "none", background: "#fff", display: "block" }} 
                title="Vista previa HTML"
              />
            ) : (
              <div style={{ whiteSpace: "pre-wrap", fontSize: "1rem", lineHeight: "1.8", color: "var(--text-primary)", fontFamily: result.format !== "PLAIN" ? "var(--font-geist-mono), monospace" : "inherit" }}>
                {result.content}
              </div>
            )}
          </div>

          <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--text-tertiary)", textAlign: "right" }}>
            {result.costEstimate}
          </div>

          {showDebug && (
            <div className="bento-card" style={{ marginTop: "2rem", borderStyle: "dashed", background: "rgba(0,0,0,0.2)" }}>
              <h4 style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>Prompt enviado a Claude:</h4>
              <div style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem", color: "var(--text-tertiary)", fontFamily: "var(--font-geist-mono), monospace" }}>
                {result.debugPrompt}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
