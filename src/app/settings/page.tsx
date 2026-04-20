import { prisma } from "@/lib/prisma";
import { loadSettings } from "@/lib/settings";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  BUILT_IN_MODELS,
  DEFAULT_MODEL_ID,
  getModelById,
} from "@/config/models";
import MigrationToast from "@/components/MigrationToast";

export default async function SettingsPage() {
  const { settings, migratedFromModel } = await loadSettings();

  async function saveApiKey(formData: FormData) {
    "use server";
    const apiKey = formData.get("apiKey") as string;
    const model = formData.get("selectedModel") as string;

    const existing = await prisma.setting.findFirst();
    if (existing) {
      await prisma.setting.update({
        where: { id: existing.id },
        data: { anthropicApiKey: apiKey, selectedModel: model },
      });
    } else {
      await prisma.setting.create({
        data: { anthropicApiKey: apiKey, selectedModel: model },
      });
    }
    revalidatePath("/settings");
  }

  const selectedId = settings?.selectedModel || DEFAULT_MODEL_ID;
  const migratedDisplay = migratedFromModel
    ? getModelById(selectedId)?.displayName || selectedId
    : "";

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
      </div>

      <h1 style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>Configuración</h1>

      <div className="bento-card" style={{ maxWidth: "600px" }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Configuración de API</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          Copy Command Center usa la API de Claude directamente. Tu clave se guarda de forma local en la base de datos SQLite y nunca sale de tu máquina.
        </p>

        <form action={saveApiKey} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>
              Clave API de Anthropic
            </label>
            <input
              type="password"
              name="apiKey"
              className="input-base"
              placeholder="sk-ant-api03-..."
              defaultValue={settings?.anthropicApiKey || ""}
              required
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>
              Modelo de IA
            </label>
            <select name="selectedModel" className="input-base" defaultValue={selectedId}>
              {BUILT_IN_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.displayName} — ${m.pricing.output}/1M out ({m.tier})
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start" }}>
            Guardar configuración
          </button>
        </form>
      </div>

      {migratedFromModel && (
        <MigrationToast
          previousModel={migratedFromModel}
          currentModel={migratedDisplay}
        />
      )}
    </div>
  );
}
