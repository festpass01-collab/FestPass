"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowLeft, CalendarDays } from "lucide-react";
import Link from "next/link";

export default function NovoEventoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nome: "",
    nomeAniversariante: "",
    idadeAniversariante: "",
    dataEvento: "",
    horarioInicio: "14:00",
    horarioFim: "18:00",
    descricao: "",
    capacidade: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        idadeAniversariante: form.idadeAniversariante ? Number(form.idadeAniversariante) : null,
        capacidade: form.capacidade ? Number(form.capacidade) : null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erro ao criar evento");
    } else {
      router.push(`/eventos/${data.id}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/eventos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Evento</h1>
          <p className="text-gray-500 text-sm">Crie uma nova festa</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-violet-600" />
            <CardTitle>Informações do Evento</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome do Evento"
              name="nome"
              placeholder="Ex: Festa da Sofia - Turma da Mônica"
              value={form.nome}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nome do(a) Aniversariante"
                name="nomeAniversariante"
                placeholder="Ex: Sofia"
                value={form.nomeAniversariante}
                onChange={handleChange}
                required
              />
              <Input
                label="Idade"
                name="idadeAniversariante"
                type="number"
                min="1"
                max="18"
                placeholder="Ex: 5"
                value={form.idadeAniversariante}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Data da Festa"
              name="dataEvento"
              type="date"
              value={form.dataEvento}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Horário de Início"
                name="horarioInicio"
                type="time"
                value={form.horarioInicio}
                onChange={handleChange}
                required
              />
              <Input
                label="Horário de Término"
                name="horarioFim"
                type="time"
                value={form.horarioFim}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              label="Capacidade máxima (opcional)"
              name="capacidade"
              type="number"
              min="1"
              placeholder="Ex: 30"
              value={form.capacidade}
              onChange={handleChange}
              hint="Deixe em branco para sem limite"
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Descrição (opcional)</label>
              <textarea
                name="descricao"
                placeholder="Detalhes adicionais sobre a festa..."
                value={form.descricao}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white text-gray-900 placeholder:text-gray-400 resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading} className="flex-1">
                Criar Evento
              </Button>
              <Link href="/eventos">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
