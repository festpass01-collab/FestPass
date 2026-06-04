"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { MoreVertical, CheckCircle, XCircle } from "lucide-react";

export default function EventoActions({ eventoId, status }: { eventoId: string; status: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    setOpen(false);
    await fetch(`/api/eventos/${eventoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen(!open)} loading={loading}>
        <MoreVertical className="w-4 h-4" />
        Ações
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[160px] py-1">
            {status !== "ENCERRADO" && (
              <button
                onClick={() => updateStatus("ENCERRADO")}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <CheckCircle className="w-4 h-4 text-gray-500" />
                Encerrar evento
              </button>
            )}
            {status !== "CANCELADO" && (
              <button
                onClick={() => updateStatus("CANCELADO")}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4" />
                Cancelar evento
              </button>
            )}
            {status !== "ATIVO" && (
              <button
                onClick={() => updateStatus("ATIVO")}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
              >
                <CheckCircle className="w-4 h-4" />
                Reativar evento
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
