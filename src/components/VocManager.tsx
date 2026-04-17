"use client";

import { useState } from "react";
import { FileText, Link as LinkIcon, File, Trash2, BrainCircuit, Save } from "lucide-react";
import { generateVocProfile, updateVocProfileManual } from "@/app/actions/voc";
import { useRouter } from "next/navigation";

export default function VocManager({ 
  targetId, 
  type, 
  knowledge, 
  vocProfile,
  addTextKnowledge,
  addUrlKnowledge,
  addFileKnowledge,
  deleteKnowledge
}: any) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isProcessing, setIsProcessing] = useState(false);
  const [profileText, setProfileText] = useState(vocProfile || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      await generateVocProfile(targetId, type);
      router.refresh();
      setActiveTab("profile");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateVocProfileManual(targetId, type, profileText);
      alert("¡Perfil de Voz del Cliente guardado!");
    } catch (e: any) {
      alert("Error al guardar: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bento-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.2rem" }}>Voz del Cliente (VoC)</h2>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} 
            onClick={() => setActiveTab('profile')}
            style={{ fontWeight: activeTab === 'profile' ? 600 : 400, color: activeTab === 'profile' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            Perfil sintetizado
          </button>
          <button 
            className={`tab-btn ${activeTab === 'raw' ? 'active' : ''}`} 
            onClick={() => setActiveTab('raw')}
            style={{ fontWeight: activeTab === 'raw' ? 600 : 400, color: activeTab === 'raw' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            Materiales brutos ({knowledge.length})
          </button>
        </div>
      </div>

      {activeTab === 'profile' && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              Perfil sintetizado del cliente objetivo a partir de los materiales brutos.
            </p>
            <button 
              onClick={handleProcess} 
              disabled={isProcessing || knowledge.length === 0}
              className="btn-primary" 
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--accent-main)", padding: "0.5rem 1rem", fontSize: "0.9rem" }}
            >
              {isProcessing ? <span className="animate-spin">⏳</span> : <BrainCircuit size={16} />} 
              {isProcessing ? "Procesando..." : "Re-procesar VoC"}
            </button>
          </div>

          <textarea 
            value={profileText}
            onChange={(e) => setProfileText(e.target.value)}
            className="input-base"
            rows={15}
            placeholder={knowledge.length > 0 ? "Haz clic en 'Re-procesar VoC' para sintetizar..." : "Añade materiales brutos primero y luego haz clic en 'Re-procesar VoC'."}
            style={{ fontFamily: "var(--font-inter)", resize: "vertical", marginTop: "1rem" }}
          />
          
          {profileText !== vocProfile && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
              <button 
                onClick={handleSaveProfile} 
                disabled={isSaving}
                className="btn-primary" 
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              >
                <Save size={16} /> {isSaving ? "Guardando..." : "Guardar ediciones manuales"}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'raw' && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <h3 style={{ fontSize: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileText size={16} /> Pegar texto / reseñas
              </h3>
              <form action={addTextKnowledge.bind(null, targetId)} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <input type="text" name="title" placeholder="Fuente (ej. Reseñas de Amazon)" className="input-base" required />
                <textarea name="content" className="input-base" rows={4} placeholder="Pega el texto bruto aquí..." required></textarea>
                <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start", padding: "0.5rem 1rem", fontSize: "0.85rem" }}>Añadir texto</button>
              </form>
            </div>

            <div>
              <h3 style={{ fontSize: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <LinkIcon size={16} /> Extraer desde URLs
              </h3>
              <form action={addUrlKnowledge.bind(null, targetId)} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <textarea name="urls" className="input-base" rows={3} placeholder="https://... (una por línea)" required></textarea>
                <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start", padding: "0.5rem 1rem", fontSize: "0.85rem", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>Extraer enlaces</button>
              </form>
            </div>

            <div>
              <h3 style={{ fontSize: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <File size={16} /> Subir documento(s)
              </h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const fileInput = form.elements.namedItem("file") as HTMLInputElement;
                const files = fileInput.files;
                if (!files || files.length === 0) return;
                
                const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                submitBtn.disabled = true;
                submitBtn.textContent = `Subiendo ${files.length} archivo(s)...`;
                
                try {
                  const promises = Array.from(files).map(async (file) => {
                    const fd = new FormData();
                    fd.append("file", file);
                    await addFileKnowledge(targetId, fd);
                  });
                  await Promise.all(promises);
                  form.reset();
                } catch (err) {
                  console.error(err);
                  alert("Algunos archivos no se pudieron subir");
                } finally {
                  submitBtn.disabled = false;
                  submitBtn.textContent = "Subir archivos";
                }
              }} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <input type="file" name="file" className="input-base" accept=".pdf,.txt,.docx,.csv,.md" multiple required />
                <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start", padding: "0.5rem 1rem", fontSize: "0.85rem", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>Subir archivos</button>
              </form>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Materiales guardados ({knowledge.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {knowledge.map((k: any) => (
                <div key={k.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem", background: "var(--surface)", borderRadius: "8px", border: "1px solid var(--border-light)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {k.type === "URL" ? <LinkIcon size={14} color="var(--accent-main)" /> : k.type === "FILE" ? <File size={14} color="var(--accent-main)" /> : <FileText size={14} color="var(--accent-main)" />}
                    <span style={{ fontSize: "0.9rem" }}>{k.title}</span>
                  </div>
                  <form action={deleteKnowledge.bind(null, targetId, k.id)}>
                    <button type="submit" style={{ color: "var(--text-tertiary)", background: "transparent", border: "none", cursor: "pointer" }}>
                      <Trash2 size={16} />
                    </button>
                  </form>
                </div>
              ))}
              {knowledge.length === 0 && (
                <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", fontStyle: "italic" }}>Aún no hay materiales añadidos.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
