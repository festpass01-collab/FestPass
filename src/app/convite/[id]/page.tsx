import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Calendar, Clock, MapPin, PartyPopper } from "lucide-react";
import ConviteForm from "./ConviteForm";

// Simple function to darken a hex color by 10%
const darkenColor = (hex: string, percent: number) => {
  let num = parseInt(hex.replace("#", ""), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) - amt,
    G = ((num >> 8) & 0x00ff) - amt,
    B = (num & 0x0000ff) - amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 0 ? 0 : R > 255 ? 255 : R) * 0x10000 +
      (G < 0 ? 0 : G > 255 ? 255 : G) * 0x100 +
      (B < 0 ? 0 : B > 255 ? 255 : B)
    )
      .toString(16)
      .slice(1)
  );
};

export default async function ConvitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const evento = await prisma.evento.findUnique({
    where: { id },
    include: { tenant: true },
  });

  if (!evento) notFound();

  const tenant = evento.tenant;
  const totalConfirmados = await prisma.convidado.count({ where: { eventoId: id } });
  const lotado = evento.capacidade ? totalConfirmados >= evento.capacidade : false;
  const encerrado = evento.status !== "ATIVO";

  const primaryColor = tenant.corPrimaria || "#7c3aed";
  const secondaryColor = tenant.corSecundaria || "#ede9fe";
  const primaryHoverColor = darkenColor(primaryColor, 10);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: `linear-gradient(135deg, ${tenant.corPrimaria}15, ${tenant.corSecundaria}40)` }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            --brand-primary: ${primaryColor};
            --brand-secondary: ${secondaryColor};
            --brand-primary-hover: ${primaryHoverColor};
          }
        `
      }} />
      <div className="w-full max-w-md">

        {/* Cabeçalho com identidade visual */}
        <div
          className="rounded-t-2xl p-6 text-white text-center"
          style={{ background: tenant.corPrimaria }}
        >
          <div className="flex justify-center mb-3">
            {tenant.logoUrl ? (
              <img src={tenant.logoUrl} alt={tenant.nomeFantasia} className="h-12 object-contain" />
            ) : (
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <PartyPopper className="w-6 h-6" />
              </div>
            )}
          </div>
          <p className="text-white/80 text-sm">{tenant.nomeFantasia}</p>
          <h1 className="text-xl font-bold mt-2">
            🎉 Você foi convidado(a)!
          </h1>
          <p className="text-white/90 mt-1 font-medium">
            Festa de {evento.nomeAniversariante}
            {evento.idadeAniversariante ? ` · ${evento.idadeAniversariante} anos` : ""}
          </p>
        </div>

        {/* Detalhes do evento */}
        <div className="bg-white px-6 py-4 border-x border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: tenant.corPrimaria }} />
              <span>{formatDate(evento.dataEvento)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 flex-shrink-0" style={{ color: tenant.corPrimaria }} />
              <span>{evento.horarioInicio} – {evento.horarioFim}</span>
            </div>
          </div>
          {evento.descricao && (
            <p className="text-sm text-gray-500 mt-3 leading-relaxed">{evento.descricao}</p>
          )}
        </div>

        {/* Formulário ou mensagens */}
        <div className="bg-white rounded-b-2xl border border-gray-100 shadow-lg">
          {encerrado ? (
            <div className="px-6 py-10 text-center text-gray-500">
              <p className="text-4xl mb-3">😢</p>
              <p className="font-semibold">Confirmações encerradas</p>
              <p className="text-sm mt-1">Este evento não está mais aceitando confirmações.</p>
            </div>
          ) : lotado ? (
            <div className="px-6 py-10 text-center text-gray-500">
              <p className="text-4xl mb-3">😮</p>
              <p className="font-semibold">Vagas esgotadas</p>
              <p className="text-sm mt-1">Todas as vagas já foram preenchidas.</p>
            </div>
          ) : (
            <ConviteForm
              eventoId={evento.id}
              lgpdTexto={tenant.lgpdTexto ?? undefined}
              corPrimaria={tenant.corPrimaria}
            />
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Powered by <span className="font-semibold">FestPass</span>
        </p>
      </div>
    </div>
  );
}
