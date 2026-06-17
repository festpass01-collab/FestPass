"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowLeft, UserCog } from "lucide-react";
import Link from "next/link";

export default function NovoUsuarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    role: "CONSULTOR",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erro ao criar usuário");
    } else {
      router.push("/usuarios");
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/usuarios">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Usuário</h1>
          <p className="text-gray-500 text-sm">Adicione um colaborador ao sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCog className="w-4 h-4 text-violet-600" />
            <CardTitle>Dados do Usuário</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome completo"
              name="nome"
              placeholder="Nome do colaborador"
              value={form.nome}
              onChange={handleChange}
              required
            />
            <Input
              label="E-mail"
              name="email"
              type="email"
              placeholder="email@exemplo.com.br"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Senha"
              name="senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.senha}
              onChange={handleChange}
              required
              hint="O usuário poderá alterar depois"
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Perfil <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white"
              >
                {/* As permissões de quem pode criar quem são validadas na API, mas podemos mostrar opções avançadas */}
                <option value="MASTER">Master (Acesso a todas as filiais)</option>
                <option value="ADM">Administrador da Filial</option>
                <option value="GERENTE">Gerente</option>
                <option value="CONSULTOR">Consultor/Vendedor</option>
                <option value="OPERADOR">Operador (Check-in)</option>
              </select>
              <p className="text-xs text-gray-500">
                {form.role === "MASTER" && "Acesso total à matriz e todas as filiais"}
                {form.role === "ADM" && "Administrador local desta filial/matriz"}
                {form.role === "GERENTE" && "Acesso a dashboards, relatórios e gestão de usuários"}
                {form.role === "CONSULTOR" && "Criação de eventos, convites e gestão de convidados"}
                {form.role === "OPERADOR" && "Apenas leitura de QR Codes no check-in"}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading} className="flex-1">
                Criar Usuário
              </Button>
              <Link href="/usuarios">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
