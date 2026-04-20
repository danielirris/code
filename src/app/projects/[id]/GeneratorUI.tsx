"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { Copy, Bug, Check, ChevronDown, Search, Plus, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import {
  Model,
  Provider,
  PROVIDER_META,
  TIER_META,
  calculateCost,
  roughTokenCount,
} from "@/config/models";

export type StructureOption = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  content: string;
  notes: string | null;
  outputFormat: string;
};

type GenerationResult = {
  content: string;
  format: string;
  debugPrompt: string;
  usage: { inputTokens: number; outputTokens: number; totalCost: number };
  model: { id: string; displayName: string; provider: Provider };
  durationMs: number;
};

export default function GeneratorUI({
  projectId,
  expertSpecialty,
  structures,
  availableModels,
  providerKeysAvailable,
  defaultModelId,
  baseContextTokens,
}: {
  projectId: string;
  expertSpecialty: string;
  structures: StructureOption[];
  availableModels: Model[];
  providerKeysAvailable: Record<Provider, boolean>;
  defaultModelId: string;
  baseContextTokens: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"code" | "preview">("code");
  const [brief, setBrief] = useState("");

  const initialStructureId = useMemo(() => {
    if (structures.length === 0) return null;
    const byType = structures.find((s) => s.type.toLowerCase() === expertSpecialty.toLowerCase());
    return byType?.id ?? null;
  }, [structures, expertSpecialty]);

  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(initialStructureId);
  const [selectedModelId, setSelectedModelId] = useState<string>(() => {
    const def = availableModels.find((m) => m.id === defaultModelId && providerKeysAvailable[m.provider]);
    if (def) return def.id;
    const firstAvailable = availableModels.find((m) => providerKeysAvailable[m.provider]);
    return firstAvailable?.id || defaultModelId;
  });

  const [structureOpen, setStructureOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [structureQuery, setStructureQuery] = useState("");
  const [showStructurePreview, setShowStructurePreview] = useState(false);
  const structureWrapRef = useRef<HTMLDivElement>(null);
  const modelWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedStructureId && !structures.some((s) => s.id === selectedStructureId)) {
      setSelectedStructureId(initialStructureId);
    }
  }, [structures, selectedStructureId, initialStructureId]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (structureWrapRef.current && !structureWrapRef.current.contains(e.target as Node)) setStructureOpen(false);
      if (modelWrapRef.current && !modelWrapRef.current.contains(e.target as Node)) setModelOpen(false);
    }
    if (structureOpen || modelOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [structureOpen, modelOpen]);

  const selectedStructure = structures.find((s) => s.id === selectedStructureId) || null;
  const selectedModel = availableModels.find((m) => m.id === selectedModelId) || null;
  const showStructureSearch = structures.length > 6;
  const filteredStructures = useMemo(() => {
    if (!structureQuery.trim()) return structures;
    const q = structureQuery.toLowerCase();
    return structures.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q)
    );
  }, [structures, structureQuery]);

  const groupedModels = useMemo(() => {
    const g: Record<Provider, Model[]> = { anthropic: [], google: [], openai: [] };
    for (const m of availableModels) g[m.provider].push(m);
    return g;
  }, [availableModels]);

  const estimatedCost = useMemo(() => {
    if (!selectedModel) return null;
    const inputTokens =
      baseContextTokens +
      roughTokenCount(selectedStructure?.content || "") +
      roughTokenCount(selectedStructure?.notes || "") +
      roughTokenCount(brief);
    const maxOutput = 8192;
    const cost = calculateCost(selectedModel.pricing, inputTokens, maxOutput);
    return { cost, inputTokens };
  }, [selectedModel, baseContextTokens, selectedStructure, brief]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStructureId) {
      setError("Selecciona un tipo de entregable");
      return;
    }
    if (!selectedModelId) {
      setError("Selecciona un modelo de IA");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, structureId: selectedStructureId, brief, modelId: selectedModelId }),
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
          {/* Structure selector */}
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
              <div ref={structureWrapRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setStructureOpen((o) => !o)}
                  className="input-base"
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left" }}
                >
                  <span style={{ color: selectedStructure ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                    {selectedStructure ? selectedStructure.name : "Selecciona una estructura…"}
                  </span>
                  <ChevronDown size={16} style={{ color: "var(--text-tertiary)", transform: structureOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                </button>

                {structureOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", boxShadow: "0 12px 32px rgba(0,0,0,0.12)", zIndex: 50, maxHeight: 360, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    {showStructureSearch && (
                      <div style={{ padding: "0.5rem", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Search size={14} style={{ color: "var(--text-tertiary)", marginLeft: "0.4rem" }} />
                        <input
                          autoFocus
                          type="text"
                          value={structureQuery}
                          onChange={(e) => setStructureQuery(e.target.value)}
                          placeholder="Buscar estructura…"
                          style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "0.9rem", color: "var(--text-primary)", padding: "0.4rem 0" }}
                        />
                      </div>
                    )}
                    <div style={{ overflowY: "auto", flex: 1 }}>
                      {filteredStructures.length === 0 ? (
                        <div style={{ padding: "1rem", textAlign: "center", color: "var(--text-tertiary)", fontSize: "0.85rem" }}>Sin coincidencias</div>
                      ) : (
                        filteredStructures.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => { setSelectedStructureId(s.id); setStructureOpen(false); setStructureQuery(""); }}
                            style={{ display: "block", width: "100%", padding: "0.7rem 1rem", textAlign: "left", background: s.id === selectedStructureId ? "var(--surface-hover)" : "transparent", border: "none", cursor: "pointer", borderBottom: "1px solid var(--border-light)" }}
                            onMouseEnter={(e) => { if (s.id !== selectedStructureId) e.currentTarget.style.background = "var(--surface-hover)"; }}
                            onMouseLeave={(e) => { if (s.id !== selectedStructureId) e.currentTarget.style.background = "transparent"; }}
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

                {selectedStructure && (
                  <div style={{ marginTop: "0.6rem" }}>
                    <button
                      type="button"
                      onClick={() => setShowStructurePreview((p) => !p)}
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "0.8rem", cursor: "pointer", padding: 0 }}
                    >
                      {showStructurePreview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {showStructurePreview ? "Ocultar estructura seleccionada" : "Ver estructura seleccionada"}
                    </button>
                    {showStructurePreview && (
                      <div style={{ marginTop: "0.6rem", padding: "1rem", background: "var(--surface)", border: "1px solid var(--border-light)", borderRadius: "10px", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginBottom: "0.6rem", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem", background: "var(--border)", borderRadius: 100, color: "var(--text-primary)" }}>{selectedStructure.type}</span>
                          <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem", background: "rgba(16,185,129,0.12)", color: "var(--accent-main)", borderRadius: 100 }}>Output: {selectedStructure.outputFormat}</span>
                        </div>
                        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{selectedStructure.content}</div>
                        {selectedStructure.notes && (
                          <>
                            <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 500 }}>Notas / ejemplo</div>
                            <div style={{ whiteSpace: "pre-wrap", marginTop: "0.25rem" }}>{selectedStructure.notes}</div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Model selector */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: 500 }}>Modelo de IA</label>
              {estimatedCost && (
                <span style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>
                  ~${estimatedCost.cost.toFixed(4)} USD estimado (peor caso)
                </span>
              )}
            </div>
            <div ref={modelWrapRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setModelOpen((o) => !o)}
                className="input-base"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left" }}
              >
                <span>
                  {selectedModel ? (
                    <>
                      <span style={{ color: PROVIDER_META[selectedModel.provider].color, marginRight: 6 }}>●</span>
                      {selectedModel.displayName}
                      <span style={{ color: "var(--text-tertiary)", marginLeft: 6 }}>
                        — ${selectedModel.pricing.output}/1M out · {TIER_META[selectedModel.tier].label}
                      </span>
                    </>
                  ) : (
                    <span style={{ color: "var(--text-tertiary)" }}>Selecciona un modelo…</span>
                  )}
                </span>
                <ChevronDown size={16} style={{ color: "var(--text-tertiary)", transform: modelOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
              </button>

              {modelOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", boxShadow: "0 12px 32px rgba(0,0,0,0.12)", zIndex: 50, maxHeight: 420, overflowY: "auto" }}>
                  {(["anthropic", "google", "openai"] as Provider[]).map((p) => {
                    const models = groupedModels[p];
                    if (models.length === 0) return null;
                    const hasKey = providerKeysAvailable[p];
                    return (
                      <div key={p}>
                        <div style={{ padding: "0.5rem 1rem", fontSize: "0.72rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", background: "var(--surface-hover)", display: "flex", justifyContent: "space-between" }}>
                          <span>
                            <span style={{ color: PROVIDER_META[p].color, marginRight: 6 }}>●</span>
                            {PROVIDER_META[p].label}
                          </span>
                          {!hasKey && <span style={{ color: "#ef4444" }}>Sin API key</span>}
                        </div>
                        {models.map((m) => {
                          const disabled = !hasKey;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              disabled={disabled}
                              title={disabled ? `Configura tu API key de ${PROVIDER_META[p].label} en Configuración` : ""}
                              onClick={() => { if (!disabled) { setSelectedModelId(m.id); setModelOpen(false); } }}
                              style={{ display: "flex", width: "100%", padding: "0.55rem 1rem", textAlign: "left", background: m.id === selectedModelId ? "var(--surface-hover)" : "transparent", border: "none", cursor: disabled ? "not-allowed" : "pointer", borderBottom: "1px solid var(--border-light)", justifyContent: "space-between", alignItems: "center", opacity: disabled ? 0.45 : 1 }}
                            >
                              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                <span style={{ fontSize: "0.75rem" }}>{TIER_META[m.tier].dot}</span>
                                <span style={{ fontSize: "0.88rem", fontWeight: 500, color: "var(--text-primary)" }}>{m.displayName}</span>
                              </span>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                                ${m.pricing.output}/1M out · {TIER_META[m.tier].label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Brief */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Brief y contexto específico</label>
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
              ¿Qué necesitas exactamente? (ej. 'Escribe una secuencia de 3 emails para el lanzamiento. Énfasis en la garantía.')
            </p>
            <textarea value={brief} onChange={(e) => setBrief(e.target.value)} name="brief" className="input-base" rows={5} required></textarea>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || structures.length === 0 || !selectedStructureId || !selectedModelId}
            style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", padding: "0.8rem", opacity: (structures.length === 0 || !selectedStructureId || !selectedModelId) ? 0.6 : 1 }}
          >
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
                  <button onClick={() => setViewMode("preview")} style={{ padding: "0.3rem 0.8rem", borderRadius: "4px", fontSize: "0.8rem", background: viewMode === "preview" ? "var(--text-primary)" : "transparent", color: viewMode === "preview" ? "var(--background)" : "var(--text-secondary)", border: "none", cursor: "pointer" }}>
                    Vista previa
                  </button>
                  <button onClick={() => setViewMode("code")} style={{ padding: "0.3rem 0.8rem", borderRadius: "4px", fontSize: "0.8rem", background: viewMode === "code" ? "var(--text-primary)" : "transparent", color: viewMode === "code" ? "var(--background)" : "var(--text-secondary)", border: "none", cursor: "pointer" }}>
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
              <iframe srcDoc={result.content} style={{ width: "100%", height: "600px", border: "none", background: "#fff", display: "block" }} title="Vista previa HTML" />
            ) : (
              <div style={{ whiteSpace: "pre-wrap", fontSize: "1rem", lineHeight: "1.8", color: "var(--text-primary)", fontFamily: result.format !== "PLAIN" ? "var(--font-geist-mono), monospace" : "inherit" }}>
                {result.content}
              </div>
            )}
          </div>

          <div style={{ marginTop: "0.75rem", padding: "0.75rem 1rem", border: "1px solid var(--border-light)", borderRadius: 10, background: "var(--surface)", fontSize: "0.82rem", color: "var(--text-secondary)", display: "flex", flexWrap: "wrap", gap: "1.2rem", alignItems: "center" }}>
            <span>
              <span style={{ color: PROVIDER_META[result.model.provider].color, marginRight: 6 }}>●</span>
              <strong style={{ color: "var(--text-primary)" }}>{result.model.displayName}</strong>
              <span style={{ color: "var(--text-tertiary)", marginLeft: 4 }}>({PROVIDER_META[result.model.provider].label.split(" ")[0]})</span>
            </span>
            <span>{result.usage.inputTokens.toLocaleString()} in / {result.usage.outputTokens.toLocaleString()} out</span>
            <span>${result.usage.totalCost.toFixed(4)} USD</span>
            <span>{(result.durationMs / 1000).toFixed(1)}s</span>
          </div>

          {showDebug && (
            <div className="bento-card" style={{ marginTop: "2rem", borderStyle: "dashed", background: "rgba(0,0,0,0.2)" }}>
              <h4 style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>Prompt enviado al modelo:</h4>
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
