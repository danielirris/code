"use client";

import { useState, useEffect, useRef } from "react";
import { MoreVertical, Copy, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface StructureCardMenuProps {
  structureId: string;
  structureName: string;
  isActive: boolean;
}

export default function StructureCardMenu({ structureId, structureName, isActive }: StructureCardMenuProps) {
  const [open, setOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleToggle = async () => {
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/structures/${structureId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive })
      });
      if (!res.ok) throw new Error("Error al actualizar");
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/structures/${structureId}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error("Error al duplicar");
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/structures/${structureId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      setShowDeleteModal(false);
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o); }}
          style={{ color: "var(--text-tertiary)", background: "transparent", border: "none", cursor: "pointer", padding: "0.3rem", borderRadius: "6px", display: "flex" }}
          title="Opciones"
        >
          <MoreVertical size={18} />
        </button>

        {open && (
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 100, minWidth: "160px", overflow: "hidden" }}>
            <button
              onClick={handleToggle}
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.7rem 1rem", width: "100%", background: "transparent", border: "none", color: "var(--text-primary)", fontSize: "0.9rem", cursor: "pointer", textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
              {isActive ? "Desactivar" : "Activar"}
            </button>
            <button
              onClick={handleDuplicate}
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.7rem 1rem", width: "100%", background: "transparent", border: "none", color: "var(--text-primary)", fontSize: "0.9rem", cursor: "pointer", textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Copy size={14} /> Duplicar
            </button>
            <div style={{ height: "1px", background: "var(--border)", margin: "0.2rem 0" }} />
            <button
              onClick={() => { setOpen(false); setShowDeleteModal(true); }}
              style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.7rem 1rem", width: "100%", background: "transparent", border: "none", color: "#ef4444", fontSize: "0.9rem", cursor: "pointer", textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div onClick={() => setShowDeleteModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} className="bento-card" style={{ maxWidth: "440px", width: "90%", padding: "2rem" }}>
            <Trash2 size={32} style={{ color: "#ef4444", marginBottom: "1rem" }} />
            <h3 style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>¿Eliminar "{structureName}"?</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>
              Esta estructura quedará eliminada de forma permanente. Los entregables ya generados no se verán afectados.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button onClick={() => setShowDeleteModal(false)} className="btn-primary" style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Cancelar</button>
              <button onClick={handleDelete} disabled={loading} className="btn-primary" style={{ background: "#ef4444", color: "#fff", border: "none" }}>
                {loading ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
