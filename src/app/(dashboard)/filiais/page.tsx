import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Building2, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function FiliaisPage() {
  const session = await auth();
  const user = session!.user as any;

  if (user.role !== "MASTER") redirect("/dashboard");

  // A matriz é o tenant original do MASTER
  const baseTenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
  const parentId = baseTenant?.parentId || baseTenant?.id;

  const filiais = await prisma.tenant.findMany({
    where: { parentId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Filiais</h1>
          <p className="text-gray-500 text-sm mt-1">{filiais.length} filial(is) conectada(s) à matriz</p>
        </div>
        <Link href="/filiais/nova">
          <Button>
            <Plus className="w-4 h-4" />
            Nova Filial
          </Button>
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Nome Fantasia</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">CNPJ</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Subdomínio</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Criada em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filiais.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{f.nomeFantasia}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-600">{f.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")}</td>
                  <td className="px-6 py-3">
                    <a
                      href={`https://${f.subdominio}.festpass.com`}
                      target="_blank"
                      className="text-violet-600 hover:text-violet-700 flex items-center gap-1 font-medium"
                    >
                      {f.subdominio}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{formatDate(f.createdAt)}</td>
                </tr>
              ))}
              {filiais.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma filial cadastrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
