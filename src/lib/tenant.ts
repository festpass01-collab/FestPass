import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getActiveTenantId(user: any): Promise<string> {
  let activeTenantId = user.tenantId;

  if (user.role === "MASTER") {
    const cookieStore = await cookies();
    const selectedTenantId = cookieStore.get("activeTenantId")?.value;
    
    if (selectedTenantId && selectedTenantId !== user.tenantId) {
      // Verifica se a filial pertence à matriz deste usuário
      const isFilial = await prisma.tenant.findFirst({
        where: { id: selectedTenantId, parentId: user.tenantId }
      });
      if (isFilial) {
        activeTenantId = selectedTenantId;
      }
    }
  }

  return activeTenantId;
}
