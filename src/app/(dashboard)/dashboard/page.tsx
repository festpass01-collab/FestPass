import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, statusEventoBadge } from "@/components/ui/Badge";
import { Users, QrCode, CalendarDays, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

import { getActiveTenantId } from "@/lib/tenant";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;
  
  const user = session.user as any;
  const tenantId = await getActiveTenantId(user);
  
  if (!tenantId) return null;

  const [totalConvidados, totalEventos, totalCheckins, proximosEventos, eventosPorStatus, totalQrCodes] =
    await Promise.all([
      prisma.convidado.count({ where: { evento: { tenantId } } }),
      prisma.evento.count({ where: { tenantId } }),
      prisma.checkIn.count({ where: { qrCode: { convidado: { evento: { tenantId } } } } }),
      prisma.evento.findMany({
        where: { tenantId, status: "ATIVO", dataEvento: { gte: new Date() } },
        orderBy: { dataEvento: "asc" },
        take: 5,
        include: {
          consultor: { select: { nome: true } },
          _count: { select: { convidados: true } },
        },
      }),
      prisma.evento.groupBy({
        by: ["status"],
        where: { tenantId },
        _count: true,
      }),
      prisma.qRCode.count({
        where: { convidado: { evento: { tenantId } } },
      }),
    ]);

  const taxaComparecimento = totalQrCodes > 0
    ? Math.round((totalCheckins / totalQrCodes) * 100)
    : 0;

  const stats = [
    {
      label: "Convidados Cadastrados",
      value: totalConvidados,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "QR Codes Gerados",
      value: totalQrCodes,
      icon: QrCode,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Check-ins Realizados",
      value: totalCheckins,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Taxa de Comparecimento",
      value: `${taxaComparecimento}%`,
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Bem-vindo, {user.name}! Aqui está o resumo de {user.tenantNome}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 leading-tight">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Próximos eventos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-600" />
            <CardTitle>Próximas Festas</CardTitle>
          </div>
          <Link href="/eventos" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
            Ver todos
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {proximosEventos.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400">
              <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma festa agendada</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {proximosEventos.map((evento) => {
                const sb = statusEventoBadge(evento.status);
                return (
                  <Link
                    key={evento.id}
                    href={`/eventos/${evento.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{evento.nome}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(evento.dataEvento)} · {evento.horarioInicio}–{evento.horarioFim}
                      </p>
                      <p className="text-xs text-gray-400">Consultor: {evento.consultor.nome}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{evento._count.convidados}</p>
                        <p className="text-xs text-gray-400">confirmados</p>
                      </div>
                      <Badge variant={sb.variant}>{sb.label}</Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo por status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { status: "ATIVO", label: "Eventos Ativos", color: "text-green-600", bg: "bg-green-50" },
          { status: "ENCERRADO", label: "Encerrados", color: "text-gray-600", bg: "bg-gray-100" },
          { status: "CANCELADO", label: "Cancelados", color: "text-red-600", bg: "bg-red-50" },
        ].map(({ status, label, color, bg }) => {
          const found = eventosPorStatus.find((e) => e.status === status);
          return (
            <Card key={status} className={`border-0 ${bg}`}>
              <CardContent className="py-4">
                <p className={`text-sm font-medium ${color}`}>{label}</p>
                <p className={`text-3xl font-bold ${color} mt-1`}>{found?._count ?? 0}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
