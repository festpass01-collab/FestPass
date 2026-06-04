import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import FormNovoConvidado from "./FormNovoConvidado";

export default async function NovoConvidadoPage({
  searchParams,
}: {
  searchParams: Promise<{ eventoId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as any;
  const { eventoId } = await searchParams;

  if (!eventoId) {
    redirect("/eventos");
  }

  const evento = await prisma.evento.findFirst({
    where: { id: eventoId, tenantId: user.tenantId },
    include: { tenant: true },
  });

  if (!evento) {
    notFound();
  }

  return (
    <FormNovoConvidado
      eventoId={evento.id}
      eventoNome={evento.nome}
      corPrimaria={evento.tenant.corPrimaria}
    />
  );
}
