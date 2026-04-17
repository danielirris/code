"use client";

import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import Logo from "@/components/Logo";
import { useState } from "react";

const TOPICS = [
  {
    id: "bienvenida",
    title: "1. Bienvenida",
    content: (
      <div>
        <h2>Bienvenido a Copy Command Center</h2>
        <p>Esta no es una herramienta para generar textos mediocres. Esta aplicación está diseñada como un <strong>motor estructural de copywriting</strong> que forzará a la Inteligencia Artificial a pensar y escribir bajo dos marcos no-negociables:</p>
        <ul>
          <li><strong>Breakthrough Advertising (Eugene Schwartz):</strong> Niveles de consciencia (Unaware a Most Aware) y Sofisticación del Mercado.</li>
          <li><strong>Grand Slam Offers (Alex Hormozi):</strong> Ecuación de valor, reducción de fricción, y escasez/urgencia.</li>
        </ul>
        <p>Tu rol aquí no es escribir desde cero, sino <strong>orquestar</strong>: defines cómo piensa el experto, inyectas la data de la audiencia (VoC), configuras las estructuras base, y ordenas la generación.</p>
      </div>
    )
  },
  {
    id: "conceptos",
    title: "2. Conceptos clave",
    content: (
      <div>
        <h2>Los 4 Pilares del Sistema</h2>
        <p>Para triunfar con esta app, tienes que entender cómo se ensambla el prompt final que viaja a Claude:</p>
        <div className="bento-card" style={{ marginTop: "1rem", marginBottom: "1rem", border: "1px solid var(--border-light)" }}>
          <p><strong>1. Expertos:</strong> Son las personalidades base. Definen TONO y REGLAS (ej: 'Escribes agresivo', 'No usas emojis').</p>
          <p><strong>2. Conocimiento & VoC:</strong> Es la "materia prima". Archivos, links o textos crudos que se procesan para descubrir exactamente <em>cómo habla la gente</em> y <em>qué dolores tienen</em>.</p>
          <p><strong>3. Estructuras (Templates):</strong> Los esqueletos lógicos (ej: P.A.S. o Guion VSL). Ordenan <em>dónde</em> va la información.</p>
          <p><strong>4. Proyectos & Entregables:</strong> El lienzo de trabajo donde juntas un Experto + Conocimiento + Estructura para generar un resultado.</p>
        </div>
      </div>
    )
  },
  {
    id: "expertos",
    title: "3. Cómo crear un Experto",
    content: (
      <div>
        <h2>Entrenando a tus IA</h2>
        <p>Ve a "Add Expert". No llenes esto con cosas tontas como "Escribe como Neil Patel". En su lugar, usa ingeniería de prompts robusta.</p>
        <h3>Ejemplo de Buenas Instrucciones:</h3>
        <pre style={{ padding: "1rem", background: "var(--surface)", borderRadius: "8px", overflowX: "auto" }}>
          "Escribes con frases hiper-cortas. \n
          Usas retórica de pregunta-respuesta.\n
          Nunca usas jerga de marketing (no digas 'desbloquea tu potencial').\n
          Tono: Escéptico pero revelador."
        </pre>
        <p>La app ya se encarga automáticamente de añadirle Schwartz y Hormozi. Tú solo dale su <strong>voz y cadencia</strong>.</p>
      </div>
    )
  },
  {
    id: "estructuras",
    title: "4. Estructuras Globales",
    content: (
      <div>
        <h2>Configurar el esqueleto (Templates)</h2>
        <p>En el panel superior "Structures" puedes definir la anatomía exacta de una pieza de copy. Esto funciona a nivel <strong>global</strong>.</p>
        <p>Por ejemplo, si creas una estructura llamada "Email de Retargeting" y en la regla pones que tenga "Asunto + Pattern Interrupt + CTA", cuando vayas a cualquier proyecto y pidas el tipo "Email de Retargeting", Claude obedecerá ese esqueleto punto por punto.</p>
        <h3>Construyendo una estructura:</h3>
        <p>Sé secuencial. Numera del 1 al X lo que el LLM debe hacer. Ej:</p>
        <ol>
          <li>Hook a dolor explícito</li>
          <li>Transición a mecanismo único</li>
          <li>Garantía de inversión de riesgo</li>
        </ol>
      </div>
    )
  },
  {
    id: "voc",
    title: "5. Voice of Customer (VoC)",
    content: (
      <div>
        <h2>Cargar la Voz del Cliente</h2>
        <p>El mejor copy no se inventa, se <strong>sintetiza</strong>.</p>
        <p>Tanto en la pantalla del Experto (VoC general) como en la de Proyecto (VoC específico), verás un panel de Voice of Customer. Allí puedes: pegar reviews de Amazon, escrapear URLs de competidores, o subir transcripciones en PDF/DOCX de llamadas de ventas.</p>
        <p>Una vez subida la data, toca <strong>Re-procesar VoC</strong>. Esto gastará unos centavos de API, pero Claude destilará toda esa basura en: Citas literales, Dolores, Emociones de la audiencia y Nivel de Consciencia. Después, ese perfil inyectado automáticamente hará que tu copy suene increíblemente real.</p>
      </div>
    )
  },
  {
    id: "proyectos",
    title: "6. Proyectos y Knowledge",
    content: (
      <div>
        <h2>Flujo de Proyecto</h2>
        <p>1. <strong>Crea un proyecto.</strong> Asígnale un Experto. <br/>
           2. <strong>Knowledge Base:</strong> Aquí puedes subir manuales de producto, specs técnicos, y la oferta cruda que se va a vender. Es conocimiento factual, distinto a la Voz del Cliente. <br/>
           3. <strong>VoC:</strong> Puedes afinar el VoC exclusivamente para este cliente. Si no lo haces, usará el VoC generalizado de tu Experto.
        </p>
      </div>
    )
  },
  {
    id: "generacion",
    title: "7. Generar Entregables",
    content: (
      <div>
        <h2>Escribir el Briefing</h2>
        <p>Ve a la pestaña "Generate Copy" dentro de tu proyecto. El campo de "Brief & Context" debe decirle a Claude qué quieres <strong>hoy</strong>.</p>
        <pre style={{ padding: "1rem", background: "var(--surface)", borderRadius: "8px", whiteSpace: "pre-wrap" }}>
          MALO: "Escribe un email para vender el curso de fitness."
          
          BUENO: "Haz el Email #3 de la secuencia de carrito abierto. 
          Enfócate HOY en rebatir la objeción del 'No tengo tiempo'.
          Recuérdales que solo quedan 12 horas."
        </pre>
        <p>Si el resultado no es perfecto a la primera, no te estreses. El LLM es un draft-generator. Arregla un par de líneas puntuales tú mismo y listo.</p>
      </div>
    )
  },
  {
    id: "workflow",
    title: "8. Flujo End-to-End Recomendado",
    content: (
      <div>
        <h2>Metodología de Trabajo</h2>
        <p>Este es el ciclo maestro:</p>
        <ol>
          <li>Llega un nuevo cliente.</li>
          <li>Le pides las reviews de sus productos y llamadas grabadas. Haces un export de TrustPilot o Amazon y lo subes al VoC del Proyecto. Extraes el perfil de avatar.</li>
          <li>Subes un PDF con las hojas de características de su producto al modulo "Knowledge Base".</li>
          <li>Te vas al panel Global de Estructuras y revisas los "Anuncios de Captación". Re-organizas el esqueleto a tu gusto si es necesario.</li>
          <li>Vas a Generate Copy, pides "Anuncio de Captación", pones un mini-briefing y disparas. Cópialo. Fácturalo.</li>
        </ol>
      </div>
    )
  },
  {
    id: "faq",
    title: "9. Preguntas Frecuentes",
    content: (
      <div>
        <h2>Solución de Problemas</h2>
        <p><strong>P: ¿Por qué Claude ignora la estructura a veces?</strong></p>
        <p>R: El modelo Sonnet-3.7 es el mejor siguiendo reglas, pero si tu "Brief" contradice activamente la Estructura (pides algo muy corto pero una estructura de 15 pasos), se confundirá. Sé congruente.</p>
        <p><strong>P: ¿Cómo veo por qué está gastando tokens o por qué escribió algo específico?</strong></p>
        <p>R: Usa el botón "Debug Prompt" después de generar para ver EXACTAMENTE el texto crudo total que la app armó para el LLM. Es la mejor forma de auditar qué info está faltando.</p>
      </div>
    )
  },
  {
    id: "tips",
    title: "10. Atajos y Hacks Avanzados",
    content: (
      <div>
        <h2>Mastery</h2>
        <ul>
          <li><strong>Clona Expertos Mentales:</strong> Crea un experto llamado "Dan Kennedy" poniéndole sus 10 reglas inviolables de copywriting. Haz otro llamado "Ogilvy". Compara outputs.</li>
          <li><strong>Evita Alucinaciones:</strong> Claude tiende a inventar testimonios. Ponlo estricto en el Expert Prompt: "Nunca inventes nombres o testimonios ficticios, solo usa lo disponible en el VoC."</li>
          <li><strong>Mantenimiento VoC:</strong> Una vez cada semana o mes, si llega feedback nuevo de correos o comentarios de ads, súbelo a la base de VoC y vuelve a correr "Re-procesar".</li>
        </ul>
      </div>
    )
  }
];

export default function HelpPage() {
  const [activeId, setActiveId] = useState(TOPICS[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTopics = TOPICS.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTopic = TOPICS.find(t => t.id === activeId);

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <header style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "3rem" }}>
        <Logo size={28} />
        <h1 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Command Center Help</h1>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "3rem", alignItems: "start" }}>
        <aside style={{ position: "sticky", top: "2rem" }}>
          <div className="bento-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
              Table of Contents
            </h3>
            
            <div style={{ position: "relative", marginBottom: "1rem" }}>
              <Search size={16} style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
              <input 
                type="text" 
                placeholder="Search topics..." 
                className="input-base" 
                style={{ paddingLeft: "2.2rem", fontSize: "0.85rem", padding: "0.5rem" }} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {filteredTopics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  style={{
                    textAlign: "left",
                    padding: "0.5rem 0.8rem",
                    borderRadius: "8px",
                    border: "none",
                    background: activeId === t.id ? "var(--surface-hover)" : "transparent",
                    color: activeId === t.id ? "var(--text-primary)" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: activeId === t.id ? 600 : 400
                  }}
                >
                  {t.title}
                </button>
              ))}
              {filteredTopics.length === 0 && (
                <div style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", padding: "0.5rem" }}>No results found.</div>
              )}
            </nav>
          </div>
        </aside>

        <main>
          <div className="bento-card" style={{ minHeight: "60vh", padding: "3rem" }}>
            {activeTopic ? (
              <div className="help-content">
                {activeTopic.content}
              </div>
            ) : null}
          </div>
        </main>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .help-content h2 { margin-bottom: 1.5rem; font-size: 1.8rem; color: var(--accent-main); }
        .help-content h3 { margin-top: 2rem; margin-bottom: 1rem; font-size: 1.2rem; }
        .help-content p { margin-bottom: 1rem; line-height: 1.7; color: var(--text-primary); }
        .help-content ul, .help-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .help-content li { margin-bottom: 0.5rem; line-height: 1.6; }
        .help-content strong { color: var(--text-primary); }
      `}} />
    </div>
  );
}
