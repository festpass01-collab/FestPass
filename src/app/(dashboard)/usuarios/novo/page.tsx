import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NovoUsuarioForm from "./NovoUsuarioForm";
import { getActiveTenantId } from "@/lib/tenant";

export default async function NovoUsuarioPage() {
  const session = await auth();
  const user = session!.user as any;
  const isMaster = user.role === "MASTER";
  const activeTenantId = await getActiveTenantId(user);

  let filiais = [];

  if (isMaster) {
    const baseTenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
    const parentId = baseTenant?.parentId || baseTenant?.id;

    // Buscar a matriz
    const matriz = await prisma.tenant.findUnique({ where: { id: parentId } });
    
    // Buscar as filiais
    const filiaisList = await prisma.tenant.findMany({
      where: { parentId },
      orderBy: { createdAt: "asc" },
    });

    if (matriz) {
      filiais.push({ id: matriz.id, nomeFantasia: `${matriz.nomeFantasia} (Matriz)` });
    }
    
    filiaisList.forEach(f => {
      filiais.push({ id: f.id, nomeFantasia: f.nomeFantasia });
    });
  }

  return (
    <NovoUsuarioForm 
      filiais={filiais} 
      isMaster={isMaster} 
      activeTenantId={activeTenantId} 
    />
  );
}
