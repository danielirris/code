"use client";

import { useState, useTransition } from "react";
import { Check, X, Loader2, ExternalLink, Trash2, Plus, Key } from "lucide-react";
import { Provider, PROVIDER_META, Model, Tier } from "@/config/models";
import {
  saveProviderKey,
  saveSelectedModel,
  testConnection,
  createCustomModel,
  deleteCustomModel,
} from "@/app/actions/providers";

type CustomModelRow = {
  id: string;
  modelId: string;
  provider: string;
  displayName: string;
  inputPrice: number;
  outputPrice: number;
  tier: string;
};

type TabId = "keys" | "custom" | "default";

export default function ProviderSettings({
  initialKeys,
  customModels,
  allModels,
  selectedModel,
}: {
  initialKeys: { anthropic: string; google: string; openai: string };
  customModels: CustomModelRow[];
  allModels: Model[];
  selectedModel: string;
}) {
  const [tab, setTab] = useState<TabId>("keys");

  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)", marginBottom: "1.5rem" }}>
        {(
          [
            ["keys", "API Keys"],
            ["custom", "Modelos custom"],
            ["default", "Modelo por defecto"],
          ] as [TabId, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: "0.6rem 1rem",
              background: "transparent",
              border: "none",
              borderBottom: tab === id ? "2px solid var(--accent-main)" : "2px solid transparent",
              color: tab === id ? "var(--text-primary)" : "var(--text-secondary)",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.9rem",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "keys" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {(["anthropic", "google", "openai"] as Provider[]).map((p) => (
            <ProviderKeyCard key={p} provider={p} initialKey={initialKeys[p]} />
          ))}
        </div>
      )}

      {tab === "custom" && (
        <CustomModelsPanel customModels={customModels} />
      )}

      {tab === "default" && (
        <DefaultModelPanel allModels={allModels} selectedModel={selectedModel} initialKeys={initialKeys} />
      )}
    </div>
  );
}

function ProviderKeyCard({ provider, initialKey }: { provider: Provider; initialKey: string }) {
  const meta = PROVIDER_META[provider];
  const [value, setValue] = useState(initialKey);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [testState, setTestState] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [testMsg, setTestMsg] = useState("");
  const [, startTransition] = useTransition();

  const connected = !!initialKey;

  const handleSave = () => {
    setSaveState("saving");
    startTransition(async () => {
      await saveProviderKey(provider, value);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
    });
  };

  const handleTest = () => {
    setTestState("testing");
    setTestMsg("");
    startTransition(async () => {
      const result = await testConnection(provider, value);
      if (result.ok) {
        setTestState("ok");
        setTestMsg(`Conectado · probado con ${result.model}`);
      } else {
        setTestState("error");
        setTestMsg(result.message);
      }
    });
  };

  return (
    <div className="bento-card" style={{ borderLeft: `4px solid ${meta.color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Key size={16} style={{ color: meta.color }} />
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }}>{meta.label}</h3>
        </div>
        <StatusBadge
          kind={
            testState === "ok"
              ? "ok"
              : testState === "error"
              ? "err"
              : connected
              ? "saved"
              : "idle"
          }
        />
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`API key de ${meta.label}`}
          className="input-base"
          style={{ flex: 1 }}
        />
        <button
          onClick={handleSave}
          disabled={saveState === "saving"}
          className="btn-primary"
          style={{ minWidth: 100, background: saveState === "saved" ? "var(--text-primary)" : undefined, color: saveState === "saved" ? "var(--background)" : undefined }}
        >
          {saveState === "saving" ? <Loader2 size={16} className="refresh-btn-spinning" /> : saveState === "saved" ? "✓ Guardado" : "Guardar"}
        </button>
        <button
          onClick={handleTest}
          disabled={testState === "testing" || !value.trim()}
          className="btn-primary"
          style={{ background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border)", minWidth: 110 }}
        >
          {testState === "testing" ? "Probando…" : "Validar"}
        </button>
      </div>
      {testMsg && (
        <div
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: 8,
            fontSize: "0.82rem",
            background: testState === "ok" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
            color: testState === "ok" ? "#065f46" : "#991b1b",
            marginBottom: "0.5rem",
          }}
        >
          {testMsg}
        </div>
      )}
      <a
        href={meta.consoleUrl}
        target="_blank"
        rel="noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: "var(--text-tertiary)" }}
      >
        <ExternalLink size={12} /> {meta.keyLabel}
      </a>
    </div>
  );
}

function StatusBadge({ kind }: { kind: "idle" | "saved" | "ok" | "err" }) {
  if (kind === "idle")
    return <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", background: "var(--surface-hover)", color: "var(--text-tertiary)", borderRadius: 100 }}>Sin configurar</span>;
  if (kind === "saved")
    return <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", background: "var(--surface-hover)", color: "var(--text-secondary)", borderRadius: 100 }}>Guardada</span>;
  if (kind === "ok")
    return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", padding: "0.2rem 0.5rem", background: "rgba(16,185,129,0.15)", color: "#065f46", borderRadius: 100 }}><Check size={10} /> Conectado</span>;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", padding: "0.2rem 0.5rem", background: "rgba(239,68,68,0.15)", color: "#991b1b", borderRadius: 100 }}><X size={10} /> Error</span>;
}

function CustomModelsPanel({ customModels }: { customModels: CustomModelRow[] }) {
  const [, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    modelId: "",
    provider: "openai" as Provider,
    displayName: "",
    inputPrice: "",
    outputPrice: "",
    tier: "balanced" as Tier,
  });
  const [error, setError] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("modelId", form.modelId);
    fd.set("provider", form.provider);
    fd.set("displayName", form.displayName);
    fd.set("inputPrice", form.inputPrice);
    fd.set("outputPrice", form.outputPrice);
    fd.set("tier", form.tier);
    startTransition(async () => {
      try {
        await createCustomModel(fd);
        setAdding(false);
        setForm({ modelId: "", provider: "openai", displayName: "", inputPrice: "", outputPrice: "", tier: "balanced" });
      } catch (err: any) {
        setError(err.message || "Error al guardar");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar este modelo custom?")) return;
    startTransition(async () => {
      await deleteCustomModel(id);
    });
  };

  return (
    <div>
      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
        Añade modelos que los proveedores lancen después, sin esperar a una actualización de la app.
      </p>

      {customModels.length === 0 ? (
        <div className="bento-card" style={{ textAlign: "center", padding: "2rem", color: "var(--text-tertiary)", borderStyle: "dashed" }}>
          No hay modelos custom.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
          {customModels.map((m) => {
            const meta = PROVIDER_META[m.provider as Provider];
            return (
              <div key={m.id} className="bento-card" style={{ padding: "0.9rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: `3px solid ${meta?.color || "var(--border)"}` }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{m.displayName}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", marginTop: 2 }}>
                    <code>{m.modelId}</code> · {meta?.label || m.provider} · ${m.inputPrice}/1M in · ${m.outputPrice}/1M out · {m.tier}
                  </div>
                </div>
                <button onClick={() => handleDelete(m.id)} style={{ color: "#ef4444", background: "transparent", border: "none", cursor: "pointer" }} title="Eliminar">
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {adding ? (
        <form onSubmit={handleAdd} className="bento-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>
              Model ID
              <input value={form.modelId} onChange={(e) => setForm({ ...form, modelId: e.target.value })} className="input-base" placeholder="gpt-5" required style={{ marginTop: 4 }} />
            </label>
            <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>
              Proveedor
              <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value as Provider })} className="input-base" style={{ marginTop: 4 }}>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google</option>
                <option value="openai">OpenAI</option>
              </select>
            </label>
            <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>
              Display name
              <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="input-base" placeholder="GPT-5" required style={{ marginTop: 4 }} />
            </label>
            <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>
              Tier
              <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value as Tier })} className="input-base" style={{ marginTop: 4 }}>
                <option value="premium">Premium</option>
                <option value="balanced">Balanced</option>
                <option value="fast">Fast</option>
              </select>
            </label>
            <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>
              Input $/1M
              <input type="number" step="0.01" value={form.inputPrice} onChange={(e) => setForm({ ...form, inputPrice: e.target.value })} className="input-base" placeholder="2.50" required style={{ marginTop: 4 }} />
            </label>
            <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>
              Output $/1M
              <input type="number" step="0.01" value={form.outputPrice} onChange={(e) => setForm({ ...form, outputPrice: e.target.value })} className="input-base" placeholder="10.00" required style={{ marginTop: 4 }} />
            </label>
          </div>
          {error && <div style={{ color: "#ef4444", fontSize: "0.8rem" }}>{error}</div>}
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => { setAdding(false); setError(null); }} className="btn-primary" style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          <Plus size={14} /> Añadir modelo
        </button>
      )}
    </div>
  );
}

function DefaultModelPanel({
  allModels,
  selectedModel,
  initialKeys,
}: {
  allModels: Model[];
  selectedModel: string;
  initialKeys: { anthropic: string; google: string; openai: string };
}) {
  const [value, setValue] = useState(selectedModel);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [, startTransition] = useTransition();

  const handleSave = () => {
    setSaveState("saving");
    startTransition(async () => {
      await saveSelectedModel(value);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
    });
  };

  const grouped: Record<Provider, Model[]> = { anthropic: [], google: [], openai: [] };
  for (const m of allModels) grouped[m.provider].push(m);

  const providerHasKey = (p: Provider) => !!initialKeys[p];

  return (
    <div className="bento-card">
      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
        Modelo usado por defecto cuando no eliges uno específico al generar. VoC también lo usa.
      </p>

      <select value={value} onChange={(e) => setValue(e.target.value)} className="input-base" style={{ marginBottom: "1rem" }}>
        {(Object.keys(grouped) as Provider[]).map((p) => (
          <optgroup key={p} label={PROVIDER_META[p].label + (providerHasKey(p) ? "" : " — sin API key")}>
            {grouped[p].map((m) => (
              <option key={m.id} value={m.id} disabled={!providerHasKey(p)}>
                {m.displayName} — ${m.pricing.output}/1M out · {m.tier}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <button onClick={handleSave} disabled={saveState === "saving"} className="btn-primary">
        {saveState === "saving" ? <Loader2 size={16} className="refresh-btn-spinning" /> : saveState === "saved" ? "✓ Guardado" : "Guardar modelo por defecto"}
      </button>
    </div>
  );
}
