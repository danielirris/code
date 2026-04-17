import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import { addTextKnowledge, addUrlKnowledge, addFileKnowledge, deleteKnowledge } from "./actions";
import VocManager from "@/components/VocManager";
import ExpertCardMenu from "@/components/ExpertCardMenu";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ExpertPage({ params }: Props) {
  const { id } = await params;
  
  const expert = await prisma.expert.findUnique({
    where: { id },
    include: { knowledge: true }
  });

  if (!expert) {
    return (
      <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            <ArrowLeft size={16} /> Volver al inicio
          </Link>
        </div>
        <div className="bento-card" style={{ maxWidth: "500px", margin: "4rem auto", padding: "4rem 2rem", textAlign: "center", borderStyle: "dashed" }}>
          <User size={48} style={{ color: "var(--text-tertiary)", margin: "0 auto 1.5rem" }} />
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Este experto no existe o fue eliminado</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Es posible que el enlace sea incorrecto o que el experto haya sido borrado recientemente.
          </p>
          <Link href="/experts" className="btn-primary" style={{ display: "inline-flex" }}>
            Ver todos los expertos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/experts" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Biblioteca de expertos
        </Link>
      </div>

      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ padding: "0.75rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px" }}>
            <User size={24} style={{ color: "var(--text-primary)" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>{expert.name}</h1>
            <p style={{ color: "var(--accent-main)", fontWeight: 500 }}>{expert.specialty}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link href={`/experts/${id}/edit`} className="btn-primary" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
            Editar instrucciones
          </Link>
          <ExpertCardMenu expertId={id} expertName={expert.name} />
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
        
        <VocManager 
          targetId={expert.id} 
          type="expert" 
          knowledge={expert.knowledge} 
          vocProfile={expert.vocProfile || ""} 
          addTextKnowledge={addTextKnowledge}
          addUrlKnowledge={addUrlKnowledge}
          addFileKnowledge={addFileKnowledge}
          deleteKnowledge={deleteKnowledge}
        />

        <div className="bento-card">
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Instrucciones del experto</h2>
          <div style={{ padding: "1.5rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px", whiteSpace: "pre-wrap", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            {expert.instructions}
          </div>
        </div>
        
      </div>
    </div>
  );
}
