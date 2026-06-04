import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge, statusEventoBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CalendarDays, Plus, Users, Clock } from "lucide-react";
import Link from "next/link";

export default async function EventosPage() {
  const session = await auth();
  const user = session!.user as any;
  const { tenantId, role } = user;

  const eventos = await prisma.evento.findMany({
    where: {
      tenantId,
      ...(role === "CONSULTOR" ? { consultorId: (session!.user as any).id ?? "" } : {}),
    },
    orderBy: { dataEvento: "desc" },
    include: {
      consultor: { select: { nome: true } },
      _count: { select: { convidados: true } },
    },
  });

  const podeCriar = ["ADM", "GERENTE", "CONSULTOR"].includes(role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="text-gray-500 text-sm mt-1">{eventos.length} evento(s) encontrado(s)</p>
        </div>
        {podeCriar && (
          <Link href="/eventos/novo">
            <Button>
              <Plus className="w-4 h-4" />
              Novo Evento
            </Button>
          </Link>
        )}
      </div>

      {eventos.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum evento cadastrado</p>
            <p className="text-gray-400 text-sm mt-1">Crie o primeiro evento para começar</p>
            {podeCriar && (
              <Link href="/eventos/novo" className="mt-4 inline-block">
                <Button>
                  <Plus className="w-4 h-4" />
                  Criar Evento
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {eventos.map((evento) => {
            const sb = statusEventoBadge(evento.status);
            const dataPassada = new Date(evento.dataEvento) < new Date();
            return (
              <Link key={evento.id} href={`/eventos/${evento.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="py-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant={sb.variant}>{sb.label}</Badge>
                      <span className="text-xs text-gray-400">{formatDate(evento.dataEvento)}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 leading-tight">{evento.nome}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      🎂 {evento.nomeAniversariante}
                      {evento.idadeAniversariante ? ` · ${evento.idadeAniversariante} anos` : ""}
                    </p>

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {evento.horarioInicio}–{evento.horarioFim}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {evento._count.convidados} convidados
                        {evento.capacidade ? ` / ${evento.capacidade}` : ""}
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                      Consultor: {evento.consultor.nome}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
