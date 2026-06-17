"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";

export function TenantSwitcher({ filiais, currentTenantId, isMaster }: { filiais: any[], currentTenantId: string, isMaster: boolean }) {
  const router = useRouter();
  
  if (!isMaster || filiais.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-white/10 rounded-lg">
      <Building2 className="w-4 h-4 text-white/70" />
      <select
        value={currentTenantId}
        onChange={async (e) => {
          const val = e.target.value;
          document.cookie = `activeTenantId=${val}; path=/; max-age=86400`;
          window.location.reload();
        }}
        className="bg-transparent text-white text-sm outline-none w-full cursor-pointer appearance-none font-medium"
      >
        {filiais.map(f => (
          <option key={f.id} value={f.id} className="text-gray-900">
            {f.nomeFantasia} {f.id === f.parentId ? "(Matriz)" : "(Filial)"}
          </option>
        ))}
      </select>
    </div>
  );
}
