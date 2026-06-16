"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Building2, Palette, Globe, CheckCircle2, Upload, PartyPopper } from "lucide-react";

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
    logoUrl: (tenant as any).logoUrl ?? "",
    logoStyle: (tenant as any).logoStyle ?? "TRANSPARENT",
    lgpdTexto: tenant.lgpdTexto ?? "",
  });

  const coresPredefinidas = [
    { nome: "Alegria Kids (Padrão)", primária: "#7c3aed", secundária: "#ede9fe" },
    { nome: "Verde Floresta", primária: "#059669", secundária: "#d1fae5" },
    { nome: "Azul Oceano", primária: "#0284c7", secundária: "#e0f2fe" },
    { nome: "Laranja Sol", primária: "#ea580c", secundária: "#ffedd5" },
    { nome: "Rosa Choque", primária: "#db2777", secundária: "#fce7f3" },
    { nome: "Grafite Clássico", primária: "#374151", secundária: "#f3f4f6" },
  ];

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert("A imagem selecionada é muito grande. Escolha uma imagem de até 500KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setForm((prev) => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  }

  function aplicarPaleta(primaria: string, secundaria: string) {
    setForm((prev) => ({ ...prev, corPrimaria: primaria, corSecundaria: secundaria }));
  }

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
        <CardContent className="space-y-6">
          {/* Logo da Empresa */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-800">Logo da Empresa</label>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50 rounded-xl border border-gray-200/60">
              {/* Logo Preview Container */}
              <div className="w-24 h-24 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
                ) : (
                  <div className="text-center p-2 text-gray-400">
                    <Building2 className="w-8 h-8 mx-auto mb-1 opacity-40 text-violet-600" />
                    <span className="text-[10px] font-medium block">Sem Logo</span>
                  </div>
                )}
              </div>

              {/* Upload & Url Controls */}
              <div className="flex-1 w-full space-y-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-gray-600">Upload de Arquivo</span>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      id="logo-upload"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 cursor-pointer shadow-sm transition-all"
                    >
                      <Upload className="w-4 h-4 text-gray-500" />
                      Escolher imagem...
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-gray-600">Ou use uma URL externa</span>
                  <input
                    type="text"
                    name="logoUrl"
                    value={form.logoUrl}
                    onChange={handleChange}
                    placeholder="https://suaempresa.com/logo.png"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  />
                </div>
                <p className="text-[10px] text-gray-400 leading-normal">
                  Suporta arquivos JPG, PNG ou SVG. Recomendamos imagens horizontais com fundo transparente de até 500KB.
                </p>
              </div>
            </div>
          </div>

          {/* Estilo da Logo */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">Estilo de Exibição no Menu Lateral</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: "TRANSPARENT", label: "Transparente", desc: "Direto no fundo" },
                { value: "CARD", label: "Cartão Branco", desc: "Contraste em fundo branco" },
                { value: "INVERTED", label: "Branco / Invertido", desc: "Todo em cor branca" },
              ].map((styleOpt) => (
                <button
                  key={styleOpt.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, logoStyle: styleOpt.value }))}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    form.logoStyle === styleOpt.value
                      ? "border-violet-600 bg-violet-50 text-violet-900 ring-2 ring-violet-200"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <span className="text-xs font-semibold">{styleOpt.label}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5 leading-tight">{styleOpt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Paletas Predefinidas */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-800">Paletas Recomendadas</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {coresPredefinidas.map((paleta) => (
                <button
                  key={paleta.nome}
                  type="button"
                  onClick={() => aplicarPaleta(paleta.primária, paleta.secundária)}
                  className="flex items-center gap-2 p-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl transition-all shadow-xs text-left"
                >
                  <div className="flex shrink-0">
                    <div className="w-4 h-6 rounded-l-md" style={{ background: paleta.primária }} />
                    <div className="w-4 h-6 rounded-r-md" style={{ background: paleta.secundária }} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 truncate">{paleta.nome}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Cor Primária</label>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl border border-gray-200 overflow-hidden shadow-xs shrink-0">
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 font-mono"
                />
              </div>
              <span className="text-[10px] text-gray-400">Usada em botões principais, ícones ativos e cabeçalho principal.</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Cor Secundária</label>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl border border-gray-200 overflow-hidden shadow-xs shrink-0">
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 font-mono"
                />
              </div>
              <span className="text-[10px] text-gray-400">Usada como plano de fundo de seções e detalhes sutis de UI.</span>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Previews Realistas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preview da Sidebar */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-800">Visualização no Menu Lateral</label>
              <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-gray-50 p-4 flex justify-center">
                <div
                  className="w-full max-w-[240px] rounded-xl p-5 flex flex-col items-center transition-all duration-300 min-h-[170px] justify-center"
                  style={{ background: form.corPrimaria }}
                >
                  {form.logoUrl ? (
                    <>
                      {form.logoStyle === "CARD" ? (
                        <div className="h-16 w-16 bg-white rounded-xl shadow-sm p-2 flex items-center justify-center overflow-hidden">
                          <img src={form.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                        </div>
                      ) : form.logoStyle === "INVERTED" ? (
                        <div className="h-16 w-full flex items-center justify-center overflow-hidden">
                          <img src={form.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain filter brightness-0 invert" />
                        </div>
                      ) : (
                        <div className="h-16 w-full flex items-center justify-center overflow-hidden">
                          <img src={form.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                        </div>
                      )}

                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <PartyPopper className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-sm text-white">FestPass</span>
                    </div>
                  )}
                  <p className="text-white font-semibold text-[10px] tracking-wider text-center uppercase truncate w-full mt-3 leading-none">
                    {form.nomeFantasia || "SUA EMPRESA"}
                  </p>
                </div>
              </div>
            </div>

            {/* Preview do Convite */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-800">Visualização no Convite Virtual</label>
              <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white p-4">
                <div
                  className="rounded-xl border border-gray-100 p-5 flex flex-col items-center text-center transition-all duration-300 min-h-[170px] justify-center"
                  style={{ background: form.corSecundaria }}
                >
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="Logo" className="h-8 object-contain mb-3" />
                  ) : (
                    <div className="flex items-center gap-1.5 mb-3">
                      <PartyPopper className="w-5 h-5" style={{ color: form.corPrimaria }} />
                      <span className="font-bold text-base text-gray-900">FestPass</span>
                    </div>
                  )}
                  <h3 className="text-sm font-extrabold text-gray-950 mb-1 leading-tight">
                    Você está convidado para a nossa festa!
                  </h3>
                  <button
                    type="button"
                    className="px-5 py-2 rounded-lg text-[10px] font-bold text-white shadow-sm transition-all focus:outline-none mt-2"
                    style={{ background: form.corPrimaria }}
                  >
                    Confirmar Presença
                  </button>
                </div>
              </div>
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
