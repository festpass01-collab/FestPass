import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { getActiveTenantId } from "@/lib/tenant";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const user = session.user as any;
  if (!["MASTER", "ADM", "GERENTE"].includes(user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const activeTenantId = await getActiveTenantId(user);

  const body = await req.json();
  const { nome, email, senha, role } = body;

  if (!nome || !email || !senha || !role) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
  }

  if (senha.length < 6) {
    return NextResponse.json({ error: "Senha deve ter no mínimo 6 caracteres" }, { status: 400 });
  }

  // Permissões
  if (user.role === "GERENTE" && ["MASTER", "ADM", "GERENTE"].includes(role)) {
    return NextResponse.json({ error: "Gerentes não podem criar este perfil" }, { status: 403 });
  }
  if (user.role === "ADM" && ["MASTER"].includes(role)) {
    return NextResponse.json({ error: "ADMs não podem criar perfis MASTER" }, { status: 403 });
  }

  const existe = await prisma.user.findFirst({
    where: { email, tenantId: activeTenantId },
  });
  if (existe) {
    return NextResponse.json({ error: "E-mail já cadastrado neste estabelecimento" }, { status: 409 });
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  const novoUser = await prisma.user.create({
    data: {
      nome,
      email,
      senha: senhaHash,
      role,
      tenantId: activeTenantId,
    },
  });

  return NextResponse.json({ id: novoUser.id, nome: novoUser.nome, email: novoUser.email }, { status: 201 });
}
