import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { QrCode, CalendarDays } from "lucide-react";
import CheckinScanner from "./CheckinScanner";

export default async function CheckinPage() {
  const session = await auth();
  const user = session!.user as any;

  const eventosAtivos = await prisma.evento.findMany({
    where: {
      tenantId: user.tenantId,
      status: "ATIVO",
    },
    orderBy: { dataEvento: "asc" },
    select: { id: true, nome: true, dataEvento: true, horarioInicio: true },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Check-in</h1>
        <p className="text-gray-500 text-sm mt-1">Leia o QR Code do convidado para registrar entrada</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-violet-600" />
            <CardTitle>Selecionar Evento</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {eventosAtivos.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">Nenhum evento ativo no momento</p>
          ) : (
            <CheckinScanner eventos={eventosAtivos.map((e) => ({
              id: e.id,
              nome: e.nome,
              data: formatDate(e.dataEvento),
              horario: e.horarioInicio,
            }))} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
