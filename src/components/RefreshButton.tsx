"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { refreshAllData } from "@/app/actions/refresh";

type Toast = { kind: "ok" | "error"; msg: string } | null;

export default function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<Toast>(null);

  const handleClick = () => {
    if (isPending) return;
    startTransition(async () => {
      try {
        await refreshAllData();
        router.refresh();
        setToast({ kind: "ok", msg: "Datos actualizados" });
      } catch {
        setToast({ kind: "error", msg: "No se pudo actualizar. Intenta de nuevo." });
      }
      setTimeout(() => setToast(null), 2000);
    });
  };

  return (
    <>
      <style>{`
        @keyframes refresh-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .refresh-btn-spinning { animation: refresh-spin 0.8s linear infinite; }
      `}</style>
      <button
        onClick={handleClick}
        disabled={isPending}
        title="Actualizar datos"
        aria-label="Actualizar datos"
        style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          zIndex: 500,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: isPending ? "default" : "pointer",
          boxShadow: "var(--shadow-subtle)",
          transition: "background 0.2s ease",
        }}
        onMouseEnter={(e) => { if (!isPending) e.currentTarget.style.background = "var(--surface-hover)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface)"; }}
      >
        <RefreshCw size={18} className={isPending ? "refresh-btn-spinning" : ""} />
      </button>
      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: "4rem",
            right: "1rem",
            zIndex: 501,
            padding: "0.6rem 1rem",
            borderRadius: "10px",
            fontSize: "0.85rem",
            fontWeight: 500,
            background: toast.kind === "ok" ? "var(--accent-main)" : "#ef4444",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}
        >
          {toast.msg}
        </div>
      )}
    </>
  );
}
