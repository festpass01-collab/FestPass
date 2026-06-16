import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const user = session.user as any;
    if (user.role !== "ADM") return NextResponse.json({ error: "Apenas ADM pode alterar configurações" }, { status: 403 });

    const body = await req.json();
    const {
      nomeFantasia, razaoSocial, cnpj, email, telefone,
      endereco, cidade, uf, cep, site, instagram, facebook,
      corPrimaria, corSecundaria, lgpdTexto, logoUrl, logoStyle,
    } = body;

    if (!nomeFantasia || !razaoSocial || !cnpj || !email || !telefone) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    const updated = await prisma.tenant.update({
      where: { id: user.tenantId },
      data: {
        nomeFantasia,
        razaoSocial,
        cnpj,
        email,
        telefone,
        endereco: endereco || null,
        cidade: cidade || null,
        uf: uf || null,
        cep: cep || null,
        site: site || null,
        instagram: instagram || null,
        facebook: facebook || null,
        corPrimaria,
        corSecundaria,
        logoUrl: logoUrl || null,
        logoStyle: logoStyle || "TRANSPARENT",
        lgpdTexto: lgpdTexto || null,
      },
    });

    return NextResponse.json({ id: updated.id, nomeFantasia: updated.nomeFantasia });
  } catch (error: any) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}

