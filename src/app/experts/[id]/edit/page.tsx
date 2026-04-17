import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { updateExpert } from "@/app/actions/experts";

export default async function EditExpertPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const expert = await prisma.expert.findUnique({ where: { id } });

  if (!expert) {
    return (
      <div className="container" style={{ paddingTop: "2rem" }}>
        <Link href="/experts" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Volver a la biblioteca
        </Link>
        <p style={{ marginTop: "2rem", color: "var(--text-secondary)" }}>Este experto no existe o fue eliminado.</p>
      </div>
    );
  }

  const updateExpertAction = updateExpert.bind(null, id);

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href={`/experts/${id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Volver al experto
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.8rem" }}>Editar experto</h1>
      </div>

      <div className="bento-card">
        <form action={updateExpertAction} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Nombre del experto</label>
              <input type="text" name="name" className="input-base" defaultValue={expert.name} required />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Especialidad (tipo de entregable)</label>
              <input type="text" name="specialty" className="input-base" defaultValue={expert.specialty} required />
            </div>
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Instrucciones maestras</label>
            <textarea 
              name="instructions" 
              className="input-base" 
              rows={15} 
              defaultValue={expert.instructions}
              required
              style={{ resize: "vertical", fontFamily: "var(--font-inter)" }}
            ></textarea>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <Link href={`/experts/${id}`} className="btn-primary" style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              Cancelar
            </Link>
            <button type="submit" className="btn-primary">
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
