import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge, roleBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { UserCog, Plus, UserCheck, UserX } from "lucide-react";
import Link from "next/link";
import UsuarioActions from "./UsuarioActions";

import { getActiveTenantId } from "@/lib/tenant";

export default async function UsuariosPage() {
  const session = await auth();
  const user = session!.user as any;

  if (!["MASTER", "ADM", "GERENTE"].includes(user.role)) redirect("/dashboard");
  
  const tenantId = await getActiveTenantId(user);

  const usuarios = await prisma.user.findMany({
    where: { tenantId },
    orderBy: [{ role: "asc" }, { nome: "asc" }],
  });

  const podeGerenciarTodos = ["MASTER", "ADM"].includes(user.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-500 text-sm mt-1">{usuarios.length} usuário(s) cadastrado(s)</p>
        </div>
        <Link href="/usuarios/novo">
          <Button>
            <Plus className="w-4 h-4" />
            Novo Usuário
          </Button>
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Nome</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">E-mail</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Perfil</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Desde</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuarios.map((u) => {
                const rb = roleBadge(u.role);
                const isSelf = u.email === user.email;
                const podeMexer = podeGerenciarTodos
                  ? !isSelf
                  : !isSelf && ["CONSULTOR", "OPERADOR"].includes(u.role);

                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-sm font-semibold flex-shrink-0">
                          {u.nome.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-medium text-gray-900">{u.nome}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{u.email}</td>
                    <td className="px-6 py-3">
                      <Badge variant={rb.variant}>{rb.label}</Badge>
                    </td>
                    <td className="px-6 py-3">
                      {u.ativo ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                          <UserCheck className="w-3.5 h-3.5" />
                          Ativo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                          <UserX className="w-3.5 h-3.5" />
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-500">{formatDate(u.createdAt)}</td>
                    <td className="px-6 py-3">
                      {podeMexer && (
                        <UsuarioActions userId={u.id} ativo={u.ativo} />
                      )}
                      {isSelf && <span className="text-xs text-gray-400">Você</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
