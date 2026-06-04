import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: eventoId } = await params;

  const evento = await prisma.evento.findUnique({
    where: { id: eventoId },
    include: { tenant: true },
  });

  if (!evento) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
  if (evento.status !== "ATIVO") return NextResponse.json({ error: "Evento encerrado" }, { status: 400 });

  const body = await req.json();
  const { nomeResponsavel, whatsapp, email, qtdPulantes, nomeAniversariante, dataNascimento, aceiteLgpd } = body;

  if (!nomeResponsavel || !whatsapp || !email || !nomeAniversariante || !dataNascimento) {
    return NextResponse.json({ error: "Preencha todos os campos obrigatórios" }, { status: 400 });
  }

  if (!aceiteLgpd) {
    return NextResponse.json({ error: "Aceite os termos para continuar" }, { status: 400 });
  }

  // Verifica lotação
  if (evento.capacidade) {
    const total = await prisma.convidado.count({ where: { eventoId } });
    if (total >= evento.capacidade) {
      return NextResponse.json({ error: "Vagas esgotadas" }, { status: 400 });
    }
  }

  // Verifica duplicidade por WhatsApp
  const existe = await prisma.convidado.findFirst({ where: { eventoId, whatsapp } });
  if (existe) {
    return NextResponse.json({ error: "Este WhatsApp já está cadastrado neste evento" }, { status: 409 });
  }

  const convidado = await prisma.convidado.create({
    data: {
      nomeResponsavel,
      whatsapp,
      email,
      qtdPulantes: Number(qtdPulantes) || 1,
      nomeAniversariante,
      dataNascimento,
      aceiteLgpd: true,
      eventoId,
    },
  });

  const codigo = uuidv4();
  const qrPayload = JSON.stringify({
    c: convidado.id,
    e: eventoId,
    p: qtdPulantes,
    k: codigo.slice(0, 8),
  });

  await prisma.qRCode.create({
    data: {
      codigo,
      status: "PENDENTE",
      convidadoId: convidado.id,
      expiradoEm: evento.dataEvento,
    },
  });

  const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
    width: 400,
    margin: 2,
    color: { dark: "#1f2937", light: "#ffffff" },
  });

  return NextResponse.json({ convidadoId: convidado.id, qrCodeDataUrl }, { status: 201 });
}
