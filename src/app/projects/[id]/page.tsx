import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, FileText, Link as LinkIcon } from "lucide-react";
import { addTextKnowledge, addUrlKnowledge, addFileKnowledge, deleteKnowledge } from "./actions";
import GeneratorUI from "./GeneratorUI";
import VocManager from "@/components/VocManager";
import RegenerateBtn from "@/components/RegenerateBtn";
import FileUploadForm from "./FileUploadForm";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProjectViewPage(props: Props) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
  const tab = (searchParams.tab as string) || "knowledge";
  const { id } = params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      expert: true,
      knowledge: { orderBy: { createdAt: "desc" } },
      deliverables: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!project) return notFound();

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
      </div>

      <header className="bento-card" style={{ marginBottom: "2rem", padding: "1.5rem 2rem", background: "var(--surface)", borderBottom: "4px solid var(--accent-main)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>{project.name}</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
              Client: <span style={{ color: "var(--text-primary)" }}>{project.client || "None"}</span> • Expert: <span style={{ color: "var(--accent-main)", fontWeight: 500 }}>{project.expert.name}</span>
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.85rem", padding: "0.4rem 1rem", background: "var(--border)", borderRadius: "100px", fontWeight: 500 }}>
              {project.status.toUpperCase()}
            </span>
            <Link href={`/projects/${id}/edit`} className="btn-primary" style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "0.85rem", padding: "0.4rem 1rem" }}>
              Edit
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem", flexWrap: "wrap" }}>
        <Link href={`?tab=knowledge`} className={`btn-primary`} style={{ background: tab === "knowledge" ? "var(--accent-main)" : "transparent", color: tab === "knowledge" ? "#fff" : "var(--text-secondary)", border: tab !== "knowledge" ? "1px solid var(--border)" : "1px solid var(--accent-main)" }}>
          Base de conocimiento ({project.knowledge.length})
        </Link>
        <Link href={`?tab=voc`} className={`btn-primary`} style={{ background: tab === "voc" ? "var(--accent-main)" : "transparent", color: tab === "voc" ? "#fff" : "var(--text-secondary)", border: tab !== "voc" ? "1px solid var(--border)" : "1px solid var(--accent-main)" }}>
          Voz del Cliente
        </Link>
        <Link href={`?tab=generate`} className={`btn-primary`} style={{ background: tab === "generate" ? "var(--text-primary)" : "transparent", color: tab === "generate" ? "var(--background)" : "var(--text-secondary)", border: tab !== "generate" ? "1px solid var(--border)" : "1px solid var(--text-primary)" }}>
          Generar copy
        </Link>
        <Link href={`?tab=deliverables`} className={`btn-primary`} style={{ background: tab === "deliverables" ? "var(--surface-hover)" : "transparent", color: tab === "deliverables" ? "var(--text-primary)" : "var(--text-secondary)", border: tab !== "deliverables" ? "1px solid var(--border-light)" : "1px solid var(--border)" }}>
          Historial ({project.deliverables.length})
        </Link>
      </div>

      {/* Tab Content: Knowledge */}
      {tab === "knowledge" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <h2 style={{ fontSize: "1.3rem" }}>Añadir conocimiento</h2>
            
            <div className="bento-card">
              <h3 style={{ fontSize: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><FileText size={18} /> Texto libre</h3>
              <form action={addTextKnowledge.bind(null, id)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <input type="text" name="title" placeholder="Título (ej. Notas de brainstorming)" className="input-base" />
                <textarea name="content" className="input-base" rows={4} placeholder="Pega notas, transcripciones o briefings aquí..." required></textarea>
                <button type="submit" className="btn-primary" style={{ alignSelf: "flex-end", fontSize: "0.85rem", padding: "0.4rem 1rem" }}>Añadir texto</button>
              </form>
            </div>

            <div className="bento-card">
              <h3 style={{ fontSize: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><LinkIcon size={18} /> Extraer desde URLs</h3>
              <form action={addUrlKnowledge.bind(null, id)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <textarea name="urls" className="input-base" rows={3} placeholder="https://... (una URL por línea)" required></textarea>
                <button type="submit" className="btn-primary" style={{ alignSelf: "flex-end", fontSize: "0.85rem", padding: "0.4rem 1rem" }}>Extraer y añadir</button>
              </form>
            </div>

            <FileUploadForm projectId={id} addFileKnowledge={addFileKnowledge} />
          </div>

          <div>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "1.5rem" }}>Conocimiento guardado</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {project.knowledge.length === 0 ? (
                <div className="bento-card" style={{ textAlign: "center", color: "var(--text-secondary)", borderStyle: "dashed" }}>
                  La base de conocimiento está vacía. ¡Sube contexto para que Claude lo use al generar!
                </div>
              ) : (
                project.knowledge.map(item => (
                  <div key={item.id} className="bento-card" style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", background: "var(--surface-hover)", border: "1px solid var(--border)", borderRadius: "4px" }}>
                        {item.type}
                      </span>
                      <form action={deleteKnowledge.bind(null, id, item.id)}>
                        <button type="submit" style={{ color: "var(--text-tertiary)" }} title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.5rem" }}>{item.title}</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {item.rawContent}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Deliverables History */}
      {tab === "deliverables" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
          {project.deliverables.length === 0 ? (
            <div className="bento-card" style={{ textAlign: "center", color: "var(--text-secondary)", padding: "4rem" }}>
              Aún no se han generado entregables.
            </div>
          ) : (
            project.deliverables.map(deliv => (
              <div key={deliv.id} className="bento-card" style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "2rem" }}>
                <div style={{ borderRight: "1px solid var(--border)", paddingRight: "2rem" }}>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>{deliv.type}</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", marginBottom: "1rem" }}>{new Date(deliv.createdAt).toLocaleString()}</p>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}><strong>Brief:</strong> {deliv.brief}</p>
                  <RegenerateBtn projectId={id} type={deliv.type} brief={deliv.brief} />
                </div>
                <div style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem", color: "var(--text-primary)" }}>
                  {deliv.content}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: Generate */}
      {tab === "generate" && (
        <GeneratorUI projectId={id} expertSpecialty={project.expert.specialty} />
      )}

      {/* Tab Content: VoC */}
      {tab === "voc" && (
        <VocManager 
          targetId={id} 
          type="project" 
          knowledge={project.knowledge} 
          vocProfile={project.vocProfile || ""} 
          addTextKnowledge={addTextKnowledge}
          addUrlKnowledge={addUrlKnowledge}
          addFileKnowledge={addFileKnowledge}
          deleteKnowledge={deleteKnowledge}
        />
      )}

    </div>
  );
}
