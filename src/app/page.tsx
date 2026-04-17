import Link from "next/link";
import { PlusCircle, Settings, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Logo from "@/components/Logo";
import SearchInput from "@/components/SearchInput";
import ProjectCardMenu from "@/components/ProjectCardMenu";

export default async function Dashboard(props: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await props.searchParams;
  const experts = await prisma.expert.findMany({
    orderBy: { createdAt: "desc" },
    take: 5
  });

  let projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: { expert: true }
  });

  if (q) {
    const qLower = q.toLowerCase();
    projects = projects.filter(p =>
      p.name.toLowerCase().includes(qLower) ||
      p.client?.toLowerCase().includes(qLower)
    );
  }

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Logo size={28} />
            <h1 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Copy Command Center</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>Gestiona tu base de conocimiento, expertos y proyectos de clientes.</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link href="/help" className="btn-primary" style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <BookOpen size={16} /> Ayuda
          </Link>
          <Link href="/structures" className="btn-primary" style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Estructuras
          </Link>
          <Link href="/settings" className="btn-primary" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Settings size={18} />
            Configuración
          </Link>
          <Link href="/projects/new" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <PlusCircle size={18} />
            Nuevo proyecto
          </Link>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "2rem" }}>
        <aside>
          <div className="bento-card" style={{ padding: "1.5rem 1rem", height: "100%" }}>
            <h2 style={{ fontSize: "1.1rem", marginBottom: "1.5rem", paddingLeft: "0.5rem" }}>Tus expertos</h2>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {experts.map((exp, i) => (
                <Link key={exp.id} href={`/experts/${exp.id}`} style={{ display: "flex", alignItems: "center", gap: "0.7rem", padding: "0.8rem", borderRadius: "12px", background: i === 0 ? "var(--surface-hover)" : "transparent", border: i === 0 ? "1px solid var(--border-light)" : "none", color: "var(--text-primary)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-main)" }}></div>
                  <span style={{ fontWeight: 500 }}>{exp.name}</span>
                </Link>
              ))}
              {experts.length === 0 && (
                <div style={{ padding: "0.8rem", color: "var(--text-tertiary)", fontSize: "0.9rem" }}>Aún no hay expertos.</div>
              )}
              <Link href="/experts/new" style={{ display: "flex", alignItems: "center", gap: "0.7rem", padding: "0.8rem", borderRadius: "12px", color: "var(--accent-main)", marginTop: "1rem" }}>
                <PlusCircle size={16} />
                <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>Crear experto</span>
              </Link>
              <Link href="/experts" style={{ display: "flex", alignItems: "center", gap: "0.7rem", padding: "0.8rem", borderRadius: "12px", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                <span style={{ fontWeight: 500, fontSize: "0.9rem", textDecoration: "underline" }}>Ver biblioteca completa</span>
              </Link>
            </nav>
          </div>
        </aside>

        <main>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Proyectos activos</h2>
            <SearchInput placeholder="Buscar proyectos..." />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {projects.length === 0 && !q && (
              <div style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "var(--radius-lg)" }}>
                <Logo size={64} className="logo-pulse" />
                <h3 style={{ fontSize: "1.2rem", marginTop: "1.5rem", marginBottom: "0.5rem" }}>Aún no tienes proyectos</h3>
                <p style={{ color: "var(--text-secondary)", textAlign: "center", maxWidth: "400px", marginBottom: "1.5rem" }}>Crea tu primer proyecto para empezar a gestionar conocimiento y generar copy de alta precisión.</p>
                <Link href="/projects/new" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <PlusCircle size={18} /> Nuevo proyecto
                </Link>
              </div>
            )}

            {projects.length === 0 && q && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
                No se encontraron proyectos para "{q}".
              </div>
            )}

            {projects.map(proj => (
              <div key={proj.id} className="bento-card" style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Link href={`/projects/${proj.id}`} style={{ flex: 1, color: "var(--text-primary)" }}>
                    <h3 style={{ fontSize: "1.1rem" }}>{proj.name}</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      Cliente: {proj.client || "Sin cliente"}
                    </p>
                  </Link>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", background: "var(--border)", borderRadius: "100px" }}>
                      {proj.status === "active" ? "activo" : proj.status === "archived" ? "archivado" : "completado"}
                    </span>
                    <ProjectCardMenu projectId={proj.id} projectName={proj.name} currentStatus={proj.status} />
                  </div>
                </div>
                <Link href={`/projects/${proj.id}`} style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "auto" }}>
                  Experto: <strong style={{ color: "var(--accent-main)" }}>{proj.expert.name}</strong>
                </Link>
              </div>
            ))}

            <Link href="/projects/new">
              <div className="bento-card" style={{ display: "flex", flexDirection: "column", borderStyle: "dashed", borderColor: "var(--border-light)", background: "transparent", alignItems: "center", justifyContent: "center", minHeight: "150px", cursor: "pointer" }}>
                <PlusCircle size={24} style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }} />
                <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Crear nuevo proyecto</p>
              </div>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
