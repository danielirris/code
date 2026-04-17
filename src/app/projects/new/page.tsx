import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createProject } from "@/app/actions/projects";

export default async function NewProjectPage() {
  const experts = await prisma.expert.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
      </div>

      <h1 style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>Crear nuevo proyecto</h1>

      <div className="bento-card" style={{ maxWidth: "600px" }}>
        <form action={createProject} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Nombre del proyecto</label>
            <input type="text" name="name" className="input-base" placeholder="ej. Secuencia de lanzamiento Q3" required />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Cliente / Marca (opcional)</label>
            <input type="text" name="client" className="input-base" placeholder="ej. Acme Corp" />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Seleccionar experto</label>
            {experts.length === 0 ? (
              <div style={{ color: "var(--accent-main)", fontSize: "0.9rem" }}>
                Primero debes <Link href="/experts/new" style={{ textDecoration: "underline" }}>crear un experto</Link>.
              </div>
            ) : (
              <select name="expertId" className="input-base" required>
                <option value="">-- Elige un experto --</option>
                {experts.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name} ({ex.specialty})</option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <Link href="/" className="btn-primary" style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              Cancelar
            </Link>
            <button type="submit" className="btn-primary" disabled={experts.length === 0}>
              Crear proyecto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
