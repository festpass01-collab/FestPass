"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import InputMask from "react-input-mask";

export default function NovaFilialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nomeFantasia: "",
    razaoSocial: "",
    cnpj: "",
    telefone: "",
    subdominio: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/filiais", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erro ao criar filial");
    } else {
      router.push("/filiais");
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/filiais">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Filial</h1>
          <p className="text-gray-500 text-sm">Adicione uma nova unidade conectada à sua matriz</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-violet-600" />
            <CardTitle>Dados da Empresa (Filial)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome Fantasia"
                name="nomeFantasia"
                placeholder="Ex: FestPass (Shopping Sul)"
                value={form.nomeFantasia}
                onChange={handleChange}
                required
              />
              <Input
                label="Razão Social"
                name="razaoSocial"
                placeholder="Nome jurídico da filial"
                value={form.razaoSocial}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">CNPJ <span className="text-red-500">*</span></label>
                <InputMask
                  mask="99.999.999/9999-99"
                  value={form.cnpj}
                  onChange={handleChange}
                >
                  {(inputProps: any) => (
                    <input
                      {...inputProps}
                      type="text"
                      required
                      placeholder="00.000.000/0000-00"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                    />
                  )}
                </InputMask>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Telefone / WhatsApp <span className="text-red-500">*</span></label>
                <InputMask
                  mask="(99) 99999-9999"
                  value={form.telefone}
                  onChange={handleChange}
                >
                  {(inputProps: any) => (
                    <input
                      {...inputProps}
                      type="text"
                      required
                      placeholder="(00) 00000-0000"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                    />
                  )}
                </InputMask>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Subdomínio (Acesso Exclusivo) <span className="text-red-500">*</span>
              </label>
              <div className="flex rounded-lg shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  https://
                </span>
                <input
                  type="text"
                  name="subdominio"
                  required
                  placeholder="minha-filial"
                  value={form.subdominio}
                  onChange={handleChange}
                  className="flex-1 min-w-0 block w-full px-3 py-2 text-sm border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                />
                <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  .festpass.com
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                A nova filial herdará automaticamente o logotipo e as cores da matriz.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={loading} className="flex-1">
                Criar Filial
              </Button>
              <Link href="/filiais">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
