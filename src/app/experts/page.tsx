import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, ArrowLeft, User } from "lucide-react";
import ExpertCardMenu from "@/components/ExpertCardMenu";

export default async function ExpertsPage() {
  const experts = await prisma.expert.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { projects: true } } }
  });

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
      </div>

      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem" }}>Biblioteca de expertos</h1>
        <Link href="/experts/new" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <PlusCircle size={18} />
          Crear experto
        </Link>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {experts.map(expert => (
          <div key={expert.id} className="bento-card" style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Link href={`/experts/${expert.id}`} style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, color: "var(--text-primary)" }}>
                <div style={{ padding: "0.6rem", background: "var(--surface-hover)", border: "1px solid var(--border)", borderRadius: "10px", flexShrink: 0 }}>
                  <User size={20} style={{ color: "var(--accent-main)" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>{expert.name}</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--accent-main)" }}>{expert.specialty}</p>
                </div>
              </Link>
              <ExpertCardMenu expertId={expert.id} expertName={expert.name} />
            </div>
            <Link href={`/experts/${expert.id}`} style={{ color: "var(--text-secondary)" }}>
              <p style={{ fontSize: "0.85rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {expert.instructions}
              </p>
            </Link>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.5rem", borderTop: "1px solid var(--border-light)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                {expert._count.projects} {expert._count.projects === 1 ? "proyecto" : "proyectos"}
              </span>
              <Link href={`/experts/${expert.id}`} style={{ fontSize: "0.85rem", color: "var(--accent-main)", fontWeight: 500 }}>
                Abrir →
              </Link>
            </div>
          </div>
        ))}
        {experts.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
            <User size={48} style={{ color: "var(--text-tertiary)", margin: "0 auto 1.5rem" }} />
            <p style={{ fontSize: "1.1rem", fontWeight: 500 }}>Aún no has creado ningún experto</p>
            <p style={{ fontSize: "0.9rem", marginTop: "0.5rem", marginBottom: "2rem" }}>
              Un experto define el estilo y las reglas para escribir un tipo de entregable.
            </p>
            <Link href="/experts/new" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <PlusCircle size={18} /> Crear mi primer experto
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
