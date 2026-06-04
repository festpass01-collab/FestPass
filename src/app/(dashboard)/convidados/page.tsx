import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge, statusQrBadge } from "@/components/ui/Badge";
import { Users, Search } from "lucide-react";
import Link from "next/link";

export default async function ConvidadosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; eventoId?: string }>;
}) {
  const session = await auth();
  const user = session!.user as any;
  const { q, eventoId } = await searchParams;

  const convidados = await prisma.convidado.findMany({
    where: {
      evento: { tenantId: user.tenantId },
      ...(eventoId ? { eventoId } : {}),
      ...(q
        ? {
            OR: [
              { nomeResponsavel: { contains: q } },
              { email: { contains: q } },
              { whatsapp: { contains: q } },
              { nomeAniversariante: { contains: q } },
            ],
          }
        : {}),
    },
    include: {
      evento: { select: { nome: true, dataEvento: true } },
      qrCode: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Convidados</h1>
          <p className="text-gray-500 text-sm mt-1">{convidados.length} convidado(s) encontrado(s)</p>
        </div>
      </div>

      {/* Busca */}
      <form method="GET" className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome, e-mail ou WhatsApp..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white text-gray-900"
        />
      </form>

      {convidados.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum convidado encontrado</p>
            <p className="text-gray-400 text-sm mt-1">
              Compartilhe o link de um evento para receber confirmações
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Responsável</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Criança</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">WhatsApp</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Evento</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Pulantes</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">QR Code</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Cadastrado em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {convidados.map((c) => {
                  const qrSb = c.qrCode ? statusQrBadge(c.qrCode.status) : null;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <p className="font-medium text-gray-900">{c.nomeResponsavel}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </td>
                      <td className="px-6 py-3 text-gray-700">
                        {c.nomeAniversariante}
                        <p className="text-xs text-gray-400">{c.dataNascimento}</p>
                      </td>
                      <td className="px-6 py-3 text-gray-600">{c.whatsapp}</td>
                      <td className="px-6 py-3">
                        <p className="text-gray-700">{c.evento.nome}</p>
                        <p className="text-xs text-gray-400">{formatDate(c.evento.dataEvento)}</p>
                      </td>
                      <td className="px-6 py-3 text-center text-gray-700">{c.qtdPulantes}</td>
                      <td className="px-6 py-3">
                        {qrSb ? (
                          <Badge variant={qrSb.variant}>{qrSb.label}</Badge>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-xs text-gray-500">
                        {formatDate(c.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
