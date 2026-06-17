import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const user = session.user as any;
  if (user.role !== "MASTER") {
    return NextResponse.json({ error: "Apenas usuários MASTER podem cadastrar filiais" }, { status: 403 });
  }

  const body = await req.json();
  const { nomeFantasia, razaoSocial, cnpj, telefone, subdominio } = body;

  if (!nomeFantasia || !razaoSocial || !cnpj || !telefone || !subdominio) {
    return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 });
  }

  const cnpjLimpo = cnpj.replace(/\D/g, "");
  const subdominioLimpo = subdominio.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");

  // Verificar CNPJ
  const cnpjExistente = await prisma.tenant.findUnique({ where: { cnpj: cnpjLimpo } });
  if (cnpjExistente) {
    return NextResponse.json({ error: "Este CNPJ já está cadastrado no sistema" }, { status: 400 });
  }

  // Verificar Subdomínio
  const subdominioExistente = await prisma.tenant.findUnique({ where: { subdominio: subdominioLimpo } });
  if (subdominioExistente) {
    return NextResponse.json({ error: "Este subdomínio já está em uso" }, { status: 400 });
  }

  // Obter tenant base (Matriz) para copiar configurações visuais e definir o parentId
  const baseTenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
  if (!baseTenant) {
    return NextResponse.json({ error: "Matriz não encontrada" }, { status: 404 });
  }

  const parentId = baseTenant.parentId || baseTenant.id;

  const novaFilial = await prisma.tenant.create({
    data: {
      parentId,
      nomeFantasia,
      razaoSocial,
      cnpj: cnpjLimpo,
      telefone,
      subdominio: subdominioLimpo,
      email: baseTenant.email, // herda email da matriz ou pode ser customizado depois
      corPrimaria: baseTenant.corPrimaria,
      corSecundaria: baseTenant.corSecundaria,
      logoUrl: baseTenant.logoUrl,
      logoStyle: baseTenant.logoStyle,
      lgpdTexto: baseTenant.lgpdTexto,
    },
  });

  return NextResponse.json({ id: novaFilial.id }, { status: 201 });
}
