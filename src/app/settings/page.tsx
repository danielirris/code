import { loadSettings } from "@/lib/settings";
import { getAllAvailableModels, getCustomModels } from "@/lib/modelRegistry";
import { getBuiltInModelById, DEFAULT_MODEL_ID } from "@/config/models";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MigrationToast from "@/components/MigrationToast";
import ProviderSettings from "@/components/ProviderSettings";

export default async function SettingsPage() {
  const [{ settings, migratedFromModel }, allModels, customModels] = await Promise.all([
    loadSettings(),
    getAllAvailableModels(),
    getCustomModels(),
  ]);

  const selectedId = settings?.selectedModel || DEFAULT_MODEL_ID;
  const migratedDisplay = migratedFromModel
    ? getBuiltInModelById(selectedId)?.displayName || selectedId
    : "";

  const initialKeys = {
    anthropic: settings?.anthropicApiKey || "",
    google: settings?.googleApiKey || "",
    openai: settings?.openaiApiKey || "",
  };

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
      </div>

      <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Configuración</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.9rem" }}>
        Gestiona tus proveedores de IA, modelos personalizados y preferencias globales. Las keys se guardan localmente en la base SQLite y nunca salen de tu entorno.
      </p>

      <div style={{ maxWidth: "760px" }}>
        <ProviderSettings
          initialKeys={initialKeys}
          customModels={customModels.map((c) => ({
            id: c.id,
            modelId: c.modelId,
            provider: c.provider,
            displayName: c.displayName,
            inputPrice: c.inputPrice,
            outputPrice: c.outputPrice,
            tier: c.tier,
          }))}
          allModels={allModels}
          selectedModel={selectedId}
        />
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
