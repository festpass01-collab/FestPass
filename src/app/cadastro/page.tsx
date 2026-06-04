"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PartyPopper,
  Building2,
  User,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export default function CadastroPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Estabelecimento
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  const [subdominio, setSubdominio] = useState("");

  // Step 2: Administrador
  const [adminNome, setAdminNome] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminSenha, setAdminSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);

  // Auto-generate subdomain from Nome Fantasia
  useEffect(() => {
    if (step === 1 && nomeFantasia) {
      const suggested = nomeFantasia
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/--+/g, "-");
      setSubdominio(suggested);
    }
  }, [nomeFantasia, step]);

  // Mask functions
  function handleCnpjChange(val: string) {
    const clean = val.replace(/\D/g, "");
    let masked = clean;
    if (clean.length > 2) masked = `${clean.slice(0, 2)}.${clean.slice(2)}`;
    if (clean.length > 5) masked = `${masked.slice(0, 6)}.${clean.slice(5)}`;
    if (clean.length > 8) masked = `${masked.slice(0, 10)}/${clean.slice(8)}`;
    if (clean.length > 12) masked = `${masked.slice(0, 15)}-${clean.slice(12, 14)}`;
    setCnpj(masked.slice(0, 18));
  }

  function handleTelefoneChange(val: string) {
    const clean = val.replace(/\D/g, "");
    let masked = clean;
    if (clean.length > 0) masked = `(${clean}`;
    if (clean.length > 2) masked = `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    if (clean.length > 7) {
      // (11) 99999-9999 or (11) 9999-9999
      const part1 = clean.slice(2, 7);
      const part2 = clean.slice(7, 11);
      masked = `(${clean.slice(0, 2)}) ${part1}-${part2}`;
    }
    setTelefone(masked.slice(0, 15));
  }

  function handleSubdominioChange(val: string) {
    const clean = val
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setSubdominio(clean);
  }

  // Validations
  function validateStep1() {
    setError("");
    if (!nomeFantasia.trim()) return "Nome Fantasia é obrigatório.";
    if (!razaoSocial.trim()) return "Razão Social é obrigatória.";
    if (cnpj.replace(/\D/g, "").length !== 14) return "CNPJ deve ter 14 dígitos.";
    if (telefone.replace(/\D/g, "").length < 10) return "Telefone inválido.";
    if (!subdominio.trim()) return "Subdomínio é obrigatório.";
    return null;
  }

  function validateStep2() {
    setError("");
    if (!adminNome.trim()) return "Nome do administrador é obrigatório.";
    if (!adminEmail.trim() || !adminEmail.includes("@")) return "E-mail inválido.";
    if (adminSenha.length < 6) return "A senha deve ter no mínimo 6 caracteres.";
    if (adminSenha !== confirmarSenha) return "As senhas não coincidem.";
    return null;
  }

  function nextStep() {
    const stepError = validateStep1();
    if (stepError) {
      setError(stepError);
    } else {
      setStep(2);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const stepError = validateStep2();
    if (stepError) {
      setError(stepError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nomeFantasia,
          razaoSocial,
          cnpj,
          telefone,
          subdominio,
          adminNome,
          adminEmail,
          adminSenha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocorreu um erro ao criar a conta.");
      }

      // Success - Redirect to login with success message
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-100 p-4 md:p-8">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-600 rounded-2xl shadow-lg mb-4">
            <PartyPopper className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">FestPass</h1>
          <p className="text-gray-500 text-sm mt-1">Plataforma de Convites Virtuais</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-10 relative overflow-hidden">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100">
            <div
              className="h-full bg-violet-600 transition-all duration-300 ease-out"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {step === 1 ? "Dados do Estabelecimento" : "Criar Usuário Administrador"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {step === 1
                  ? "Cadastre as informações da sua empresa ou parque de festas."
                  : "Defina os dados de acesso para gerenciar o sistema."}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full shrink-0">
              Etapa {step} de 2
            </span>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* STEP 1: ESTABELECIMENTO */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome Fantasia"
                    placeholder="Ex: Parque Alegria"
                    value={nomeFantasia}
                    onChange={(e) => setNomeFantasia(e.target.value)}
                    required
                  />
                  <Input
                    label="Razão Social"
                    placeholder="Ex: Alegria Entretenimento LTDA"
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="CNPJ"
                    placeholder="00.000.000/0000-00"
                    value={cnpj}
                    onChange={(e) => handleCnpjChange(e.target.value)}
                    required
                  />
                  <Input
                    label="Telefone de Contato"
                    placeholder="(11) 99999-9999"
                    value={telefone}
                    onChange={(e) => handleTelefoneChange(e.target.value)}
                    required
                  />
                </div>

                <div className="border-t border-gray-100 pt-4 mt-2">
                  <Input
                    label="Subdomínio Exclusivo"
                    placeholder="seuparque"
                    value={subdominio}
                    onChange={(e) => handleSubdominioChange(e.target.value)}
                    hint="Este será o seu endereço de acesso único à plataforma."
                    required
                  />
                  {subdominio && (
                    <div className="mt-2 text-xs font-medium text-violet-600 bg-violet-50/50 px-3 py-2 rounded-lg border border-violet-100 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      URL: <span className="font-semibold">{subdominio}.festpass.com.br</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-between items-center border-t border-gray-100">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    Voltar para o Login
                  </Link>
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2"
                  >
                    Próxima Etapa
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: ADMINISTRADOR */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <Input
                  label="Nome Completo"
                  placeholder="Seu nome completo"
                  value={adminNome}
                  onChange={(e) => setAdminNome(e.target.value)}
                  required
                />

                <Input
                  label="E-mail de Acesso"
                  type="email"
                  placeholder="seu@email.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Senha <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showSenha ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        value={adminSenha}
                        onChange={(e) => setAdminSenha(e.target.value)}
                        required
                        className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white text-gray-900 placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSenha(!showSenha)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Confirmar Senha <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={showSenha ? "text" : "password"}
                      placeholder="Repita a senha"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-between items-center border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Etapa Anterior
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    className="flex items-center gap-2 px-6"
                  >
                    Concluir Cadastro
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
