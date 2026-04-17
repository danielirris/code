"use client";

import { useState } from "react";
import { RefreshCw, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegenerateBtn({ projectId, type, brief }: { projectId: string, type: string, brief: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, type, brief }),
      });
      if (!res.ok) throw new Error("Error al regenerar");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      router.refresh(); 
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleRegenerate} 
      disabled={loading}
      style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.8rem", borderRadius: "8px", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: "0.85rem", cursor: loading ? "not-allowed" : "pointer" }}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : success ? <Check size={14} /> : <RefreshCw size={14} />}
      {loading ? "Generando..." : success ? "¡Listo!" : "Regenerar"}
    </button>
  );
}
