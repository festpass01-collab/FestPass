import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nomeFantasia,
      razaoSocial,
      cnpj,
      telefone,
      subdominio,
      adminNome,
      adminEmail,
      adminSenha,
    } = body;

    // 1. Validação de campos obrigatórios
    if (
      !nomeFantasia ||
      !razaoSocial ||
      !cnpj ||
      !telefone ||
      !subdominio ||
      !adminNome ||
      !adminEmail ||
      !adminSenha
    ) {
      return NextResponse.json(
        { error: "Todos os campos obrigatórios devem ser preenchidos." },
        { status: 400 }
      );
    }

    if (adminSenha.length < 6) {
      return NextResponse.json(
        { error: "A senha do administrador deve ter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    // Limpar e normalizar CNPJ e subdomínio
    const cnpjLimpo = cnpj.replace(/\D/g, "");
    const subdominioLimpo = subdominio
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "");

    if (!subdominioLimpo) {
      return NextResponse.json(
        { error: "Subdomínio inválido." },
        { status: 400 }
      );
    }

    // 2. Validações de duplicidade
    // Verificar CNPJ
    const cnpjExistente = await prisma.tenant.findUnique({
      where: { cnpj: cnpjLimpo },
    });
    if (cnpjExistente) {
      return NextResponse.json(
        { error: "Este CNPJ já está cadastrado no sistema." },
        { status: 400 }
      );
    }

    // Verificar Subdomínio
    const subdominioExistente = await prisma.tenant.findUnique({
      where: { subdominio: subdominioLimpo },
    });
    if (subdominioExistente) {
      return NextResponse.json(
        { error: "Este subdomínio já está em uso por outro estabelecimento." },
        { status: 400 }
      );
    }

    // Verificar E-mail do Administrador (globalmente único para evitar conflito de login)
    const emailExistente = await prisma.user.findFirst({
      where: { email: adminEmail.toLowerCase().trim() },
    });
    if (emailExistente) {
      return NextResponse.json(
        { error: "Este e-mail de administrador já está cadastrado." },
        { status: 400 }
      );
    }

    // 3. Hash da senha
    const senhaHash = await bcrypt.hash(adminSenha, 12);

    // 4. Criação transacional do Tenant e do Usuário Administrador
    const resultado = await prisma.$transaction(async (tx) => {
      // Criar Tenant
      const novoTenant = await tx.tenant.create({
        data: {
          nomeFantasia,
          razaoSocial,
          cnpj: cnpjLimpo,
          email: adminEmail.toLowerCase().trim(),
          telefone,
          subdominio: subdominioLimpo,
          corPrimaria: "#7c3aed", // Violeta padrão (premium)
          corSecundaria: "#ede9fe",
          lgpdTexto:
            "Ao se cadastrar, você concorda com nossa Política de Privacidade e autoriza o uso dos seus dados para envio do QR Code de acesso e comunicações relacionadas ao evento.",
        },
      });

      // Criar Usuário ADM (Master da Matriz)
      const novoUser = await tx.user.create({
        data: {
          nome: adminNome,
          email: adminEmail.toLowerCase().trim(),
          senha: senhaHash,
          role: "MASTER",
          tenantId: novoTenant.id,
          ativo: true,
        },
      });

      return { tenant: novoTenant, user: novoUser };
    });

    return NextResponse.json(
      {
        message: "Cadastro realizado com sucesso!",
        tenant: {
          id: resultado.tenant.id,
          nomeFantasia: resultado.tenant.nomeFantasia,
          subdominio: resultado.tenant.subdominio,
        },
        user: {
          id: resultado.user.id,
          nome: resultado.user.nome,
          email: resultado.user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar o cadastro." },
      { status: 500 }
    );
  }
}
