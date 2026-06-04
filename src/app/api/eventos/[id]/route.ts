import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const user = session.user as any;
  if (!["ADM", "GERENTE"].includes(user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!["ATIVO", "ENCERRADO", "CANCELADO"].includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const evento = await prisma.evento.findFirst({ where: { id, tenantId: user.tenantId } });
  if (!evento) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });

  const updated = await prisma.evento.update({ where: { id }, data: { status } });
  return NextResponse.json(updated);
}
