"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { CheckCircle2, QrCode } from "lucide-react";
import Image from "next/image";

interface Props {
  eventoId: string;
  lgpdTexto?: string;
  corPrimaria: string;
}

type Step = "form" | "success";

export default function ConviteForm({ eventoId, lgpdTexto, corPrimaria }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const [form, setForm] = useState({
    nomeResponsavel: "",
    whatsapp: "",
    email: "",
    qtdPulantes: "1",
    nomeAniversariante: "",
    dataNascimento: "",
    aceiteLgpd: false,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.aceiteLgpd) {
      setError("Você precisa aceitar a política de privacidade para continuar.");
      return;
    }

    setError("");
    setLoading(true);

    const res = await fetch(`/api/convite/${eventoId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        qtdPulantes: Number(form.qtdPulantes),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erro ao confirmar presença. Tente novamente.");
    } else {
      setQrCodeDataUrl(data.qrCodeDataUrl);
      setStep("success");
    }
  }

  if (step === "success") {
    return (
      <div className="px-6 py-8 text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${corPrimaria}20` }}>
          <CheckCircle2 className="w-7 h-7" style={{ color: corPrimaria }} />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Presença confirmada! 🎉</h2>
        <p className="text-gray-500 text-sm mt-1 mb-6">
          Guarde seu QR Code abaixo. Apresente na entrada da festa.
        </p>

        {qrCodeDataUrl && (
          <div className="flex flex-col items-center gap-3">
            <div className="border-2 border-gray-200 rounded-xl p-4 inline-block">
              <img src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48" />
            </div>
            <a
              href={qrCodeDataUrl}
              download="festpass-qrcode.png"
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: corPrimaria }}
            >
              Baixar QR Code
            </a>
          </div>
        )}

        <div className="mt-6 p-3 bg-amber-50 rounded-xl text-xs text-amber-700 border border-amber-100">
          💡 Salve o QR Code na sua galeria de fotos para acessar facilmente no dia da festa.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
      <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
        Confirmar Presença
      </h2>

      <Input
        label="Seu nome (responsável)"
        name="nomeResponsavel"
        placeholder="Nome completo"
        value={form.nomeResponsavel}
        onChange={handleChange}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="WhatsApp"
          name="whatsapp"
          type="tel"
          placeholder="(11) 99999-9999"
          value={form.whatsapp}
          onChange={handleChange}
          required
          hint="Com DDD"
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Qtd. de crianças <span className="text-red-500">*</span>
          </label>
          <select
            name="qtdPulantes"
            value={form.qtdPulantes}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white text-gray-900"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n} criança{n > 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="E-mail"
        name="email"
        type="email"
        placeholder="seu@email.com"
        value={form.email}
        onChange={handleChange}
        required
      />

      <Input
        label="Nome da criança aniversariante"
        name="nomeAniversariante"
        placeholder="Nome da criança"
        value={form.nomeAniversariante}
        onChange={handleChange}
        required
      />

      <Input
        label="Data de nascimento da criança"
        name="dataNascimento"
        type="date"
        value={form.dataNascimento}
        onChange={handleChange}
        required
      />

      {/* LGPD */}
      <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="aceiteLgpd"
          name="aceiteLgpd"
          checked={form.aceiteLgpd}
          onChange={handleChange}
          className="mt-0.5 w-4 h-4 rounded accent-violet-600"
        />
        <label htmlFor="aceiteLgpd" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
          {lgpdTexto ??
            "Ao se cadastrar, você concorda com nossa Política de Privacidade e autoriza o uso dos seus dados para envio do QR Code de acesso e comunicações relacionadas ao evento."}
        </label>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
        style={{ background: corPrimaria }}
      >
        {loading ? "Confirmando..." : "Confirmar Presença 🎉"}
      </button>
    </form>
  );
}
