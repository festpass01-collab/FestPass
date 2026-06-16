import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, statusEventoBadge, statusQrBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Copy, Users, QrCode, CheckCircle2, Clock, Calendar, UserCircle } from "lucide-react";
import Link from "next/link";
import EventoActions from "./EventoActions";
import { headers } from "next/headers";

export default async function EventoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const user = session!.user as any;

  const evento = await prisma.evento.findFirst({
    where: { id, tenantId: user.tenantId },
    include: {
      consultor: { select: { nome: true } },
      convidados: {
        include: { qrCode: { include: { checkin: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!evento) notFound();

  const totalConvidados = evento.convidados.length;
  const totalCheckins = evento.convidados.filter((c) => c.qrCode?.status === "UTILIZADO").length;
  const taxaComparecimento = totalConvidados > 0
    ? Math.round((totalCheckins / totalConvidados) * 100)
    : 0;

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;
  const linkConvite = `${baseUrl}/convite/${evento.id}`;

  const sb = statusEventoBadge(evento.status);
  const podeCriarConvidado = ["ADM", "GERENTE", "CONSULTOR"].includes(user.role);
  const podeEditar = ["ADM", "GERENTE"].includes(user.role);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/eventos">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{evento.nome}</h1>
              <Badge variant={sb.variant}>{sb.label}</Badge>
            </div>
            <p className="text-gray-500 text-sm">
              🎂 {evento.nomeAniversariante}
              {evento.idadeAniversariante ? ` · ${evento.idadeAniversariante} anos` : ""}
            </p>
          </div>
        </div>
        {podeEditar && <EventoActions eventoId={evento.id} status={evento.status} />}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Calendar, label: "Data", value: formatDate(evento.dataEvento) },
          { icon: Clock, label: "Horário", value: `${evento.horarioInicio} – ${evento.horarioFim}` },
          { icon: Users, label: "Convidados", value: `${totalConvidados}${evento.capacidade ? ` / ${evento.capacidade}` : ""}` },
          { icon: CheckCircle2, label: "Comparecimento", value: `${taxaComparecimento}%` },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5 text-violet-500" />
                <p className="text-xs text-gray-500">{label}</p>
              </div>
              <p className="font-semibold text-gray-900 text-sm">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Link do convite */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-violet-600" />
            <CardTitle>Link do Convite Virtual</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-50 rounded-lg px-4 py-2.5 text-sm text-gray-700 font-mono border border-gray-200 truncate">
              {linkConvite}
            </div>
            <Link href={linkConvite} target="_blank">
              <Button variant="outline" size="sm">Abrir</Button>
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Compartilhe este link via WhatsApp, Instagram ou qualquer outro canal para os convidados confirmarem presença.
          </p>
        </CardContent>
      </Card>

      {/* Lista de convidados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-600" />
            <CardTitle>Convidados ({totalConvidados})</CardTitle>
          </div>
          {podeCriarConvidado && (
            <Link href={`/convidados/novo?eventoId=${evento.id}`}>
              <Button size="sm">+ Adicionar</Button>
            </Link>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {evento.convidados.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400">
              <UserCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum convidado confirmado ainda</p>
              <p className="text-xs mt-1">Compartilhe o link do convite acima</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Responsável</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Criança</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">WhatsApp</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Pulantes</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">QR Code</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Check-in</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {evento.convidados.map((c) => {
                    const qrSb = c.qrCode ? statusQrBadge(c.qrCode.status) : null;
                    return (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3">
                          <p className="font-medium text-gray-900">{c.nomeResponsavel}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </td>
                        <td className="px-6 py-3 text-gray-700">{c.nomeAniversariante}</td>
                        <td className="px-6 py-3 text-gray-600">{c.whatsapp}</td>
                        <td className="px-6 py-3 text-center text-gray-700">{c.qtdPulantes}</td>
                        <td className="px-6 py-3">
                          {qrSb ? (
                            <Badge variant={qrSb.variant}>{qrSb.label}</Badge>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-xs text-gray-500">
                          {c.qrCode?.checkin
                            ? formatDateTime(c.qrCode.checkin.horario)
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
