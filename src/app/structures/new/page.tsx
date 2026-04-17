import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import { createStructure } from "@/app/actions/structures";

export default function NewStructurePage() {
  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/structures" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Volver a las estructuras
        </Link>
      </div>

      <header style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <Logo size={28} />
        <h1 style={{ fontSize: "1.8rem" }}>Crear nueva estructura</h1>
      </header>

      <div className="bento-card">
        <form action={createStructure} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Nombre de la estructura</label>
              <input type="text" name="name" className="input-base" placeholder="ej. Plantilla hook VSL" required />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Tipo de entregable</label>
              <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginBottom: "0.5rem" }}>Debe coincidir con el tipo usado al generar para que se active.</p>
              <input type="text" name="type" className="input-base" placeholder="ej. Sales Page" required />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Descripción breve</label>
              <input type="text" name="description" className="input-base" placeholder="¿Para qué se usa esta estructura?" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Output Format</label>
              <select name="outputFormat" className="input-base">
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
            <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: "0.5rem" }}>
              Mapea las secciones y la secuencia exactas en las que Claude debe escribir este formato de entregable.
            </p>
            <textarea
              name="content"
              className="input-base"
              rows={12}
              placeholder="1. Hook...&#10;2. Body...&#10;3. Offer...&#10;4. CTA..."
              required
              style={{ resize: "vertical", fontFamily: "var(--font-inter)" }}
            ></textarea>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Notas internas (opcional)</label>
            <textarea name="notes" className="input-base" rows={2} placeholder=""></textarea>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input type="checkbox" name="isActive" id="isActive" defaultChecked style={{ width: "1rem", height: "1rem" }} />
            <label htmlFor="isActive" style={{ fontSize: "0.9rem" }}>Activa (disponible para generar)</label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <Link href="/structures" className="btn-primary" style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              Cancelar
            </Link>
            <button type="submit" className="btn-primary">
              Guardar estructura
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
