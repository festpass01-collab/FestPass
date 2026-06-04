"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Building2, Palette, Globe, CheckCircle2 } from "lucide-react";

interface Tenant {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  site: string | null;
  instagram: string | null;
  facebook: string | null;
  corPrimaria: string;
  corSecundaria: string;
  subdominio: string | null;
  lgpdTexto: string | null;
}

export default function ConfiguracoesForm({ tenant }: { tenant: Tenant }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nomeFantasia: tenant.nomeFantasia,
    razaoSocial: tenant.razaoSocial,
    cnpj: tenant.cnpj,
    email: tenant.email,
    telefone: tenant.telefone,
    endereco: tenant.endereco ?? "",
    cidade: tenant.cidade ?? "",
    uf: tenant.uf ?? "",
    cep: tenant.cep ?? "",
    site: tenant.site ?? "",
    instagram: tenant.instagram ?? "",
    facebook: tenant.facebook ?? "",
    corPrimaria: tenant.corPrimaria,
    corSecundaria: tenant.corSecundaria,
    lgpdTexto: tenant.lgpdTexto ?? "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSaved(false);

    const res = await fetch("/api/configuracoes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erro ao salvar configurações");
    } else {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados institucionais */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-violet-600" />
            <CardTitle>Dados Institucionais</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nome Fantasia"
              name="nomeFantasia"
              value={form.nomeFantasia}
              onChange={handleChange}
              required
            />
            <Input
              label="Razão Social"
              name="razaoSocial"
              value={form.razaoSocial}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="CNPJ"
              name="cnpj"
              value={form.cnpj}
              onChange={handleChange}
              placeholder="00.000.000/0000-00"
              required
            />
            <Input
              label="Telefone"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            label="E-mail"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Endereço"
            name="endereco"
            value={form.endereco}
            onChange={handleChange}
            placeholder="Rua, número, complemento, bairro"
          />

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Input
                label="Cidade"
                name="cidade"
                value={form.cidade}
                onChange={handleChange}
              />
            </div>
            <Input
              label="UF"
              name="uf"
              value={form.uf}
              onChange={handleChange}
              maxLength={2}
              placeholder="SP"
            />
          </div>

          <Input
            label="CEP"
            name="cep"
            value={form.cep}
            onChange={handleChange}
            placeholder="00000-000"
          />
        </CardContent>
      </Card>

      {/* Redes sociais */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-violet-600" />
            <CardTitle>Site e Redes Sociais</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Site" name="site" value={form.site} onChange={handleChange} placeholder="https://seusite.com.br" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Instagram" name="instagram" value={form.instagram} onChange={handleChange} placeholder="@seuparque" />
            <Input label="Facebook" name="facebook" value={form.facebook} onChange={handleChange} placeholder="/seuparque" />
          </div>
        </CardContent>
      </Card>

      {/* Identidade visual */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-violet-600" />
            <CardTitle>Identidade Visual (White-Label)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Cor Primária</label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl border border-gray-200 overflow-hidden">
                  <input
                    type="color"
                    name="corPrimaria"
                    value={form.corPrimaria}
                    onChange={handleChange}
                    className="w-full h-full cursor-pointer border-0 p-0"
                  />
                </div>
                <input
                  type="text"
                  name="corPrimaria"
                  value={form.corPrimaria}
                  onChange={handleChange}
                  placeholder="#1e40af"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 font-mono"
                />
              </div>
              <p className="text-xs text-gray-500">Botões, cabeçalhos e destaques</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Cor Secundária</label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl border border-gray-200 overflow-hidden">
                  <input
                    type="color"
                    name="corSecundaria"
                    value={form.corSecundaria}
                    onChange={handleChange}
                    className="w-full h-full cursor-pointer border-0 p-0"
                  />
                </div>
                <input
                  type="text"
                  name="corSecundaria"
                  value={form.corSecundaria}
                  onChange={handleChange}
                  placeholder="#dbeafe"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 font-mono"
                />
              </div>
              <p className="text-xs text-gray-500">Fundos e elementos complementares</p>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <div className="p-4 text-white text-center text-sm font-medium" style={{ background: form.corPrimaria }}>
              Preview: Cabeçalho do Convite
            </div>
            <div className="p-4 text-sm text-gray-700 text-center" style={{ background: form.corSecundaria }}>
              Preview: Fundo do Convite
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Texto LGPD */}
      <Card>
        <CardHeader>
          <CardTitle>Texto de Aceite LGPD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Texto exibido no formulário de confirmação</label>
            <textarea
              name="lgpdTexto"
              value={form.lgpdTexto}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white resize-none"
              placeholder="Ao se cadastrar, você concorda com nossa Política de Privacidade..."
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4" />
          Configurações salvas com sucesso!
        </div>
      )}

      <Button type="submit" loading={loading} size="lg">
        Salvar Configurações
      </Button>
    </form>
  );
}
