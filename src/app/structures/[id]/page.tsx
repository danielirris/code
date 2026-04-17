import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import { updateStructure } from "@/app/actions/structures";

export default async function EditStructurePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const structure = await prisma.structure.findUnique({ where: { id } });

  if (!structure) {
    return notFound();
  }

  const updateStructureAction = updateStructure.bind(null, id);

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/structures" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Volver a las estructuras
        </Link>
      </div>

      <header style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <Logo size={28} />
        <h1 style={{ fontSize: "1.8rem" }}>Editar estructura</h1>
      </header>
      
      <div className="bento-card">
        <form action={updateStructureAction} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Nombre de la estructura</label>
              <input type="text" name="name" className="input-base" defaultValue={structure.name} required />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Tipo de entregable</label>
              <input type="text" name="type" className="input-base" defaultValue={structure.type} required />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Descripción breve</label>
              <input type="text" name="description" className="input-base" defaultValue={structure.description || ""} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Output Format</label>
              <select name="outputFormat" className="input-base" defaultValue={structure.outputFormat}>
                <option value="PLAIN">Texto plano (Default)</option>
                <option value="MARKDOWN">Código / Markdown</option>
                <option value="HTML">HTML (Web/Email)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>
              Anatomía y reglas de estructura
            </label>
            <textarea 
              name="content" 
              className="input-base" 
              rows={12} 
              defaultValue={structure.content}
              required
              style={{ resize: "vertical", fontFamily: "var(--font-inter)" }}
            ></textarea>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Notas internas (opcional)</label>
            <textarea name="notes" className="input-base" rows={2} defaultValue={structure.notes || ""}></textarea>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input type="checkbox" name="isActive" id="isActive" defaultChecked={structure.isActive} style={{ width: "1rem", height: "1rem" }} />
            <label htmlFor="isActive" style={{ fontSize: "0.9rem" }}>Activa (disponible para generar)</label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <Link href="/structures" className="btn-primary" style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
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
