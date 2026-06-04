import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const user = session.user as any;
  const { tenantId, role } = user;

  if (!["ADM", "GERENTE", "CONSULTOR"].includes(role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const { nome, nomeAniversariante, idadeAniversariante, dataEvento, horarioInicio, horarioFim, descricao, capacidade } = body;

  if (!nome || !nomeAniversariante || !dataEvento || !horarioInicio || !horarioFim) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
  }

  const dbUser = await prisma.user.findFirst({
    where: { email: user.email!, tenantId },
  });
  if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  const evento = await prisma.evento.create({
    data: {
      nome,
      nomeAniversariante,
      idadeAniversariante: idadeAniversariante ?? null,
      dataEvento: new Date(dataEvento),
      horarioInicio,
      horarioFim,
      descricao: descricao || null,
      capacidade: capacidade ?? null,
      status: "ATIVO",
      tenantId,
      consultorId: dbUser.id,
    },
  });

  return NextResponse.json(evento, { status: 201 });
}
