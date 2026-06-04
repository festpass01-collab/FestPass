"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { UserCheck, UserX, MoreVertical } from "lucide-react";

export default function UsuarioActions({ userId, ativo }: { userId: string; ativo: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function toggle() {
    setLoading(true);
    setOpen(false);
    await fetch(`/api/usuarios/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !ativo }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setOpen(!open)} loading={loading}>
        <MoreVertical className="w-4 h-4" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[140px] py-1">
            <button
              onClick={toggle}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 ${
                ativo ? "text-red-600" : "text-green-600"
              }`}
            >
              {ativo ? (
                <><UserX className="w-4 h-4" /> Desativar</>
              ) : (
                <><UserCheck className="w-4 h-4" /> Ativar</>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
