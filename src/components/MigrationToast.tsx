"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function MigrationToast({
  previousModel,
  currentModel,
}: {
  previousModel: string;
  currentModel: string;
}) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        bottom: "1.25rem",
        right: "1.25rem",
        zIndex: 450,
        maxWidth: 380,
        padding: "0.9rem 2.25rem 0.9rem 1rem",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: "4px solid var(--accent-main)",
        borderRadius: 12,
        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
        fontSize: "0.85rem",
        color: "var(--text-primary)",
        lineHeight: 1.5,
      }}
    >
      Actualizamos tu modelo por defecto a <strong>{currentModel}</strong>{" "}
      porque <code style={{ fontSize: "0.78rem" }}>{previousModel}</code> fue
      retirado por Anthropic.
      <button
        onClick={() => setVisible(false)}
        aria-label="Cerrar aviso"
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "transparent",
          border: "none",
          color: "var(--text-tertiary)",
          cursor: "pointer",
          padding: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
