import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ ok: false, message: "Não autenticado" }, { status: 401 });

  const user = session.user as any;
  const { qrRaw, eventoId } = await req.json();

  if (!qrRaw || !eventoId) {
    return NextResponse.json({ ok: false, message: "Dados inválidos" }, { status: 400 });
  }

  // Tenta decodificar o payload JSON do QR Code
  let convidadoId: string | null = null;

  try {
    const payload = JSON.parse(qrRaw);
    convidadoId = payload.c;
  } catch {
    // Tenta tratar como UUID direto
    convidadoId = qrRaw;
  }

  if (!convidadoId) {
    return NextResponse.json({ ok: false, message: "QR Code inválido" }, { status: 400 });
  }

  const qrCode = await prisma.qRCode.findFirst({
    where: { convidadoId },
    include: { convidado: { include: { evento: true } } },
  });

  if (!qrCode) {
    return NextResponse.json({ ok: false, message: "QR Code não encontrado" }, { status: 404 });
  }

  // Verifica tenant
  if (qrCode.convidado.evento.tenantId !== user.tenantId) {
    return NextResponse.json({ ok: false, message: "QR Code não pertence a este estabelecimento" }, { status: 403 });
  }

  // Verifica evento
  if (qrCode.convidado.eventoId !== eventoId) {
    return NextResponse.json({ ok: false, message: `Este QR Code é de outro evento: ${qrCode.convidado.evento.nome}` }, { status: 400 });
  }

  if (qrCode.status === "UTILIZADO") {
    return NextResponse.json({ ok: false, message: "⚠️ QR Code já utilizado! Este ingresso já deu entrada." }, { status: 409 });
  }

  if (qrCode.status === "CANCELADO") {
    return NextResponse.json({ ok: false, message: "QR Code cancelado. Acesso negado." }, { status: 403 });
  }

  if (qrCode.status === "EXPIRADO") {
    return NextResponse.json({ ok: false, message: "QR Code expirado." }, { status: 400 });
  }

  // Busca o operador no DB
  const dbUser = await prisma.user.findFirst({
    where: { email: user.email!, tenantId: user.tenantId },
  });
  if (!dbUser) return NextResponse.json({ ok: false, message: "Operador não encontrado" }, { status: 404 });

  // Realiza check-in
  await prisma.$transaction([
    prisma.qRCode.update({ where: { id: qrCode.id }, data: { status: "UTILIZADO" } }),
    prisma.checkIn.create({
      data: {
        qrCodeId: qrCode.id,
        operadorId: dbUser.id,
        horario: new Date(),
      },
    }),
  ]);

  const horario = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return NextResponse.json({
    ok: true,
    message: "✅ Check-in realizado com sucesso!",
    convidado: {
      nome: qrCode.convidado.nomeResponsavel,
      nomeAniversariante: qrCode.convidado.nomeAniversariante,
      qtdPulantes: qrCode.convidado.qtdPulantes,
      horario,
    },
  });
}
