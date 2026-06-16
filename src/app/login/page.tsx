"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { PartyPopper, Eye, EyeOff, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams?.get("registered") === "true";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cacheLimpo, setCacheLimpo] = useState(false);

  function handleLimparCache() {
    try {
      localStorage.clear();
      sessionStorage.clear();
      
      // Limpa os cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      setCacheLimpo(true);
      setTimeout(() => {
        setCacheLimpo(false);
        window.location.reload();
      }, 1000);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      senha,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("E-mail ou senha incorretos. Verifique suas credenciais.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-100 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-600 rounded-2xl shadow-lg mb-4">
            <PartyPopper className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">FestPass</h1>
          <p className="text-gray-500 text-sm mt-1">Plataforma de Convites Virtuais</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Entrar na plataforma</h2>

          {registered && (
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Cadastro realizado com sucesso! Faça login para começar.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showSenha ? "text" : "password"}
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  autoComplete="current-password"
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

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Entrar
            </Button>
          </form>

          {/* Cadastro Link */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <Link
                href="/cadastro"
                className="font-semibold text-violet-600 hover:text-violet-700 transition-colors"
              >
                Cadastre-se grátis
              </Link>
            </p>
          </div>
        </div>

        {/* Botão Limpar Cache */}
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLimparCache}
            className={`w-full flex items-center justify-center gap-2 border transition-all shadow-sm ${
              cacheLimpo
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                : "bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {cacheLimpo ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600 animate-bounce" />
                Cache limpo com sucesso!
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 text-gray-400" />
                Limpar cache
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-100 p-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-600 rounded-2xl shadow-lg mb-4 animate-bounce">
              <PartyPopper className="w-7 h-7 text-white" />
            </div>
            <p className="text-gray-500 text-sm">Carregando...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
