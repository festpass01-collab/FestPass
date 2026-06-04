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
  const { ativo } = body;

  const target = await prisma.user.findFirst({ where: { id, tenantId: user.tenantId } });
  if (!target) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  if (user.role === "GERENTE" && ["ADM", "GERENTE"].includes(target.role)) {
    return NextResponse.json({ error: "Sem permissão para modificar este perfil" }, { status: 403 });
  }

  const updated = await prisma.user.update({ where: { id }, data: { ativo } });
  return NextResponse.json({ id: updated.id, ativo: updated.ativo });
}
