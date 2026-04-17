import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, ArrowLeft, Pencil } from "lucide-react";
import Logo from "@/components/Logo";
import StructureCardMenu from "@/components/StructureCardMenu";

const DEFAULT_STRUCTURES = [
  {
    name: "Email de lanzamiento",
    type: "Email",
    description: "Secuencia The 100M Offers",
    content: "1. Asunto: Curiosidad extrema (Pattern Interrupt).\n2. Apertura: Despierta curiosidad y rompe el patrón habitual del lector.\n3. Historia: Breve anécdota o situación relatable que contextualice.\n4. Problema: El dolor sangrante o frustración principal.\n5. Solución: El puente lógico hacia la nueva forma de hacerlo.\n6. CTA Único: Llamada a la acción clara, un solo enlace."
  },
  {
    name: "Email de venta directa",
    type: "Email",
    description: "PAS Amplificado y Oferta",
    content: "1. Problem: Identifica el dolor exacto.\n2. Agitation: Haz que duela más mostrando las consecuencias de no resolverlo.\n3. Solution: Presenta el producto como la única salida lógica.\n4. Value Stack: Lista de todo lo que incluye (ofrece 10x el valor del precio).\n5. Urgencia/Escasez: Razón real para comprar HOY.\n6. CTA directo."
  },
  {
    name: "Página de venta larga (VSL escrita)",
    type: "Sales Page",
    description: "Landing de conversión alta clásica",
    content: "1. Hook (Headline y Subheadline): Promesa máxima (Dream Outcome) contrarrestando la objeción principal.\n2. Agitación del problema: 'Si estás experimentando X, Y, Z...'\n3. Introducción de Solución: El nuevo mecanismo o vehículo.\n4. Prueba: Casos de estudio, testimonios, screenshot de resultados.\n5. Oferta Grand Slam: Producto principal + Bonos + Value Stack + Precio ancla.\n6. Garantía: Inversión de riesgo brutal.\n7. CTA.\n8. FAQ."
  },
  {
    name: "Anuncio de captación (FB/IG)",
    type: "Anuncio",
    description: "Captura de leads fríos",
    content: "1. Hook visual/texto: Pattern interrupt (Pregunta o afirmación contraintuitiva).\n2. Promesa específica: Qué va a conseguir exacto si hace clic.\n3. Credibilidad: Breve 'quién soy'.\n4. CTA: Descarga gratis el Lead Magnet / Únete al webinar."
  },
  {
    name: "Anuncio de venta directa",
    type: "Anuncio",
    description: "Retargeting o tráfico caliente",
    content: "1. Hook: Enfocado directo en el producto o dolor recurrente.\n2. Producto: Qué es en una frase.\n3. Beneficio Principal: Qué logra el usuario.\n4. Prueba Social: Un micro-testimonio o métrica potente ('Más de 1,000...')\n5. Oferta: Precio o descuento.\n6. CTA: Compra ahora."
  },
  {
    name: "Guión de VSL (Video)",
    type: "Guión de video",
    description: "Estructura de video de ventas persuasivo",
    content: "1. Gancho (0-10s): Promesa grande + prueba rápida.\n2. Identificación: Contexto de por qué están viendo esto.\n3. Historia de fracaso/lucha.\n4. La Revelación/Mecanismo Único: El secreto de por qué fallaban antes no es su culpa.\n5. Introducción del Producto.\n6. Valor y Precio Ancla.\n7. Oferta y Bonos.\n8. CTA Final."
  }
];

export default async function StructuresPage() {
  let structures = await prisma.structure.findMany({
    orderBy: { createdAt: 'desc' }
  });

  if (structures.length === 0) {
    for (const st of DEFAULT_STRUCTURES) {
      await prisma.structure.create({ data: st });
    }
    structures = await prisma.structure.findMany({ orderBy: { createdAt: 'desc' } });
  }

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
      </div>

      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Logo size={28} />
          <h1 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Estructuras globales</h1>
        </div>
        <Link href="/structures/new" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <PlusCircle size={18} />
          Nueva estructura
        </Link>
      </header>

      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
        Las plantillas de entregables definen la anatomía estructural para cada tipo de copy. Estas reglas se aplican de forma global a todos los expertos cuando se genera un entregable del mismo tipo.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem" }}>
        {structures.map(st => (
          <div key={st.id} className="bento-card" style={{ display: "flex", flexDirection: "column", gap: "1rem", opacity: st.isActive ? 1 : 0.6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 600 }}>{st.name}</h3>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.25rem" }}>
                  <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", background: "var(--border)", borderRadius: "100px", color: "var(--text-primary)" }}>{st.type}</span>
                  {!st.isActive && <span style={{ fontSize: "0.75rem", color: "#EF4444" }}>Inactiva</span>}
                  {st.outputFormat && st.outputFormat !== "PLAIN" && (
                    <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", background: "rgba(99,102,241,0.15)", borderRadius: "100px", color: "#818cf8" }}>
                      {st.outputFormat}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Link href={`/structures/${st.id}`} style={{ color: "var(--text-tertiary)", display: "flex" }} title="Editar">
                  <Pencil size={15} />
                </Link>
                <StructureCardMenu structureId={st.id} structureName={st.name} isActive={st.isActive} />
              </div>
            </div>
            
            <p style={{ fontSize: "0.9rem", color: "var(--accent-main)" }}>
              {st.description}
            </p>

            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "auto", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {st.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
