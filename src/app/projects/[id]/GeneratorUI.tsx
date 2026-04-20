"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { Copy, Bug, Check, ChevronDown, Search, Plus, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export type StructureOption = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  content: string;
  notes: string | null;
  outputFormat: string;
};

export default function GeneratorUI({
  projectId,
  expertSpecialty,
  structures,
}: {
  projectId: string;
  expertSpecialty: string;
  structures: StructureOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ content: string; format: string; debugPrompt: string; costEstimate: string } | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"code" | "preview">("code");

  const initialSelection = useMemo(() => {
    if (structures.length === 0) return null;
    const byType = structures.find(
      (s) => s.type.toLowerCase() === expertSpecialty.toLowerCase()
    );
    return byType?.id ?? null;
  }, [structures, expertSpecialty]);

  const [selectedId, setSelectedId] = useState<string | null>(initialSelection);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedId && !structures.some((s) => s.id === selectedId)) {
      setSelectedId(initialSelection);
    }
  }, [structures, selectedId, initialSelection]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const selected = structures.find((s) => s.id === selectedId) || null;
  const showSearch = structures.length > 6;
  const filtered = useMemo(() => {
    if (!query.trim()) return structures;
    const q = query.toLowerCase();
    return structures.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q)
    );
  }, [structures, query]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedId) {
      setError("Selecciona un tipo de entregable");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const brief = formData.get("brief") as string;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, structureId: selectedId, brief }),
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

            {structures.length === 0 ? (
              <div style={{ padding: "1rem", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  No hay estructuras configuradas.
                </span>
                <Link href="/structures/new" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", padding: "0.4rem 0.9rem" }}>
                  <Plus size={14} /> Crear estructura
                </Link>
              </div>
            ) : (
              <div ref={wrapperRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setOpen((o) => !o)}
                  className="input-base"
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left" }}
                >
                  <span style={{ color: selected ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                    {selected ? selected.name : "Selecciona una estructura…"}
                  </span>
                  <ChevronDown size={16} style={{ color: "var(--text-tertiary)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                </button>

                {open && (
                  <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", boxShadow: "0 12px 32px rgba(0,0,0,0.12)", zIndex: 50, maxHeight: 360, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    {showSearch && (
                      <div style={{ padding: "0.5rem", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Search size={14} style={{ color: "var(--text-tertiary)", marginLeft: "0.4rem" }} />
                        <input
                          autoFocus
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Buscar estructura…"
                          style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "0.9rem", color: "var(--text-primary)", padding: "0.4rem 0" }}
                        />
                      </div>
                    )}
                    <div style={{ overflowY: "auto", flex: 1 }}>
                      {filtered.length === 0 ? (
                        <div style={{ padding: "1rem", textAlign: "center", color: "var(--text-tertiary)", fontSize: "0.85rem" }}>
                          Sin coincidencias
                        </div>
                      ) : (
                        filtered.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => { setSelectedId(s.id); setOpen(false); setQuery(""); }}
                            style={{ display: "block", width: "100%", padding: "0.7rem 1rem", textAlign: "left", background: s.id === selectedId ? "var(--surface-hover)" : "transparent", border: "none", cursor: "pointer", borderBottom: "1px solid var(--border-light)" }}
                            onMouseEnter={(e) => { if (s.id !== selectedId) e.currentTarget.style.background = "var(--surface-hover)"; }}
                            onMouseLeave={(e) => { if (s.id !== selectedId) e.currentTarget.style.background = "transparent"; }}
                          >
                            <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-primary)" }}>{s.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
                              {s.type}{s.description ? ` · ${s.description}` : ""}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {selected && (
                  <div style={{ marginTop: "0.6rem" }}>
                    <button
                      type="button"
                      onClick={() => setShowPreview((p) => !p)}
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "0.8rem", cursor: "pointer", padding: 0 }}
                    >
                      {showPreview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {showPreview ? "Ocultar estructura seleccionada" : "Ver estructura seleccionada"}
                    </button>
                    {showPreview && (
                      <div style={{ marginTop: "0.6rem", padding: "1rem", background: "var(--surface)", border: "1px solid var(--border-light)", borderRadius: "10px", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginBottom: "0.6rem", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem", background: "var(--border)", borderRadius: 100, color: "var(--text-primary)" }}>{selected.type}</span>
                          <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem", background: "rgba(16,185,129,0.12)", color: "var(--accent-main)", borderRadius: 100 }}>Output: {selected.outputFormat}</span>
                        </div>
                        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{selected.content}</div>
                        {selected.notes && (
                          <>
                            <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 500 }}>Notas / ejemplo</div>
                            <div style={{ whiteSpace: "pre-wrap", marginTop: "0.25rem" }}>{selected.notes}</div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Brief y contexto específico</label>
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
              ¿Qué necesitas exactamente? (ej. 'Escribe una secuencia de 3 emails para el lanzamiento. Énfasis en la garantía.')
            </p>
            <textarea name="brief" className="input-base" rows={5} required></textarea>
          </div>

          <button type="submit" className="btn-primary" disabled={loading || structures.length === 0 || !selectedId} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", padding: "0.8rem", opacity: (structures.length === 0 || !selectedId) ? 0.6 : 1 }}>
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
