import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewExpertPage() {

  async function createExpert(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const specialty = formData.get("specialty") as string;
    const instructions = formData.get("instructions") as string;
    
    const expert = await prisma.expert.create({
      data: { name, specialty, instructions }
    });
    
    redirect(`/experts/${expert.id}`);
  }

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/experts" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Volver a la biblioteca
        </Link>
      </div>

      <h1 style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>Crear nuevo experto</h1>
      
      <div className="bento-card">
        <form action={createExpert} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Nombre del experto</label>
              <input type="text" name="name" className="input-base" placeholder="ej. Maestro de emails de lanzamiento" required />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Especialidad (tipo de entregable)</label>
              <input type="text" name="specialty" className="input-base" placeholder="ej. Emails de venta" required />
            </div>
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>
              Instrucciones maestras (núcleo del prompt)
            </label>
            <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: "0.5rem" }}>
              Enseña a este experto CÓMO escribir. Incluye frameworks, reglas de tono, qué evitar y plantillas estructurales.
              (Nota: Las reglas de Breakthrough Advertising y Hormozi ya se aplican globalmente por defecto).
            </p>
            <textarea 
              name="instructions" 
              className="input-base" 
              rows={15} 
              placeholder="1. Siempre empieza con un gancho que apunte al dolor principal del lector...&#10;2. Usa párrafos cortos y directos...&#10;3. Aplica el framework PAS en la transición..."
              required
              style={{ resize: "vertical", fontFamily: "var(--font-inter)" }}
            ></textarea>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <Link href="/experts" className="btn-primary" style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              Cancelar
            </Link>
            <button type="submit" className="btn-primary">
              Guardar experto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
