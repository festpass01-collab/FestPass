"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

interface FormNovoConvidadoProps {
  eventoId: string;
  eventoNome: string;
  corPrimaria: string;
}

export default function FormNovoConvidado({
  eventoId,
  eventoNome,
  corPrimaria,
}: FormNovoConvidadoProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [qtdPulantes, setQtdPulantes] = useState("1");
  const [nomeAniversariante, setNomeAniversariante] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");

  function handleWhatsappChange(val: string) {
    const clean = val.replace(/\D/g, "");
    let masked = clean;
    if (clean.length > 0) masked = `(${clean}`;
    if (clean.length > 2) masked = `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    if (clean.length > 7) {
      const part1 = clean.slice(2, 7);
      const part2 = clean.slice(7, 11);
      masked = `(${clean.slice(0, 2)}) ${part1}-${part2}`;
    }
    setWhatsapp(masked.slice(0, 15));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (whatsapp.replace(/\D/g, "").length < 10) {
      setError("WhatsApp deve ter no mínimo 10 dígitos com o DDD.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/convite/${eventoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nomeResponsavel,
          whatsapp,
          email,
          qtdPulantes: Number(qtdPulantes),
          nomeAniversariante,
          dataNascimento,
          aceiteLgpd: true, // Aceito automaticamente pelo admin
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao adicionar convidado.");
      }

      router.push(`/eventos/${eventoId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/eventos/${eventoId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-violet-600" />
            Adicionar Convidado
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manual para o evento: <span className="font-semibold text-gray-700">{eventoNome}</span>
          </p>
        </div>
      </div>

      {/* Card Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Dados do Responsável */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
              Dados do Responsável
            </h2>
            <Input
              label="Nome do Responsável"
              placeholder="Nome completo do responsável"
              value={nomeResponsavel}
              onChange={(e) => setNomeResponsavel(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="WhatsApp"
                placeholder="(11) 99999-9999"
                value={whatsapp}
                onChange={(e) => handleWhatsappChange(e.target.value)}
                required
                hint="Com DDD"
              />
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Dados da Criança */}
          <div className="space-y-4 pt-4">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
              Dados do Convidado
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome da Criança"
                placeholder="Nome da criança"
                value={nomeAniversariante}
                onChange={(e) => setNomeAniversariante(e.target.value)}
                required
              />
              <Input
                label="Data de Nascimento"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Qtd. de Pulantes (Crianças) <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-1">
                  Número de crianças que vão brincar/usar os brinquedos do parque.
                </p>
                <select
                  value={qtdPulantes}
                  onChange={(e) => setQtdPulantes(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white text-gray-900 transition-colors"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} criança{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
            <Link href={`/eventos/${eventoId}`}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" loading={loading} className="px-6">
              Adicionar Convidado
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
