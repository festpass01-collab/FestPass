import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ConfiguracoesForm from "./ConfiguracoesForm";

import { getActiveTenantId } from "@/lib/tenant";

export default async function ConfiguracoesPage() {
  const session = await auth();
  const user = session!.user as any;

  if (user.role !== "ADM" && user.role !== "MASTER") redirect("/dashboard");

  const activeTenantId = await getActiveTenantId(user);

  const tenant = await prisma.tenant.findUnique({
    where: { id: activeTenantId },
  });

  if (!tenant) redirect("/dashboard");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie os dados e a identidade visual da empresa</p>
      </div>

      <ConfiguracoesForm tenant={tenant} />
    </div>
  );
}
