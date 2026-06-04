"use client";

import { useState, useRef, useEffect } from "react";
import { QrCode, CheckCircle2, XCircle, Camera, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Evento {
  id: string;
  nome: string;
  data: string;
  horario: string;
}

interface CheckinResult {
  ok: boolean;
  message: string;
  convidado?: {
    nome: string;
    nomeAniversariante: string;
    qtdPulantes: number;
    horario: string;
  };
}

export default function CheckinScanner({ eventos }: { eventos: Evento[] }) {
  const [eventoId, setEventoId] = useState(eventos[0]?.id ?? "");
  const [mode, setMode] = useState<"manual" | "camera">("manual");
  const [codigoManual, setCodigoManual] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckinResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannerRef = useRef<any>(null);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      startScanning();
    } catch {
      alert("Não foi possível acessar a câmera. Use o modo manual.");
      setMode("manual");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    scannerRef.current = null;
  }

  function startScanning() {
    if (!videoRef.current) return;
    const video = videoRef.current;

    async function scanFrame() {
      if (!video.videoWidth) {
        scannerRef.current = requestAnimationFrame(scanFrame);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0);

      try {
        if ("BarcodeDetector" in window) {
          const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
          const barcodes = await detector.detect(canvas);
          if (barcodes.length > 0) {
            await handleQrCode(barcodes[0].rawValue);
            return;
          }
        }
      } catch {}

      scannerRef.current = requestAnimationFrame(scanFrame);
    }

    scannerRef.current = requestAnimationFrame(scanFrame);
  }

  useEffect(() => {
    if (mode === "camera") startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [mode]);

  async function handleQrCode(raw: string) {
    cancelAnimationFrame(scannerRef.current);
    await processCheckin(raw);
    setTimeout(() => {
      setResult(null);
      if (mode === "camera") startScanning();
    }, 4000);
  }

  async function processCheckin(raw: string) {
    if (!eventoId) {
      setResult({ ok: false, message: "Selecione um evento primeiro." });
      return;
    }

    setLoading(true);
    setResult(null);

    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrRaw: raw, eventoId }),
    });

    const data = await res.json();
    setLoading(false);
    setResult(data);

    if (res.ok) {
      playSuccessSound();
    } else {
      playErrorSound();
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!codigoManual.trim()) return;
    await processCheckin(codigoManual.trim());
    setCodigoManual("");
  }

  function playSuccessSound() {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    osc.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  function playErrorSound() {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    osc.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  return (
    <div className="space-y-5">
      {/* Seleção de evento */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Evento</label>
        <select
          value={eventoId}
          onChange={(e) => setEventoId(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white"
        >
          {eventos.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.nome} · {ev.data} {ev.horario}
            </option>
          ))}
        </select>
      </div>

      {/* Modo de leitura */}
      <div className="flex gap-2">
        <Button
          variant={mode === "manual" ? "primary" : "outline"}
          size="sm"
          onClick={() => setMode("manual")}
        >
          <Keyboard className="w-3.5 h-3.5" />
          Manual
        </Button>
        <Button
          variant={mode === "camera" ? "primary" : "outline"}
          size="sm"
          onClick={() => setMode("camera")}
        >
          <Camera className="w-3.5 h-3.5" />
          Câmera
        </Button>
      </div>

      {/* Manual */}
      {mode === "manual" && (
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            value={codigoManual}
            onChange={(e) => setCodigoManual(e.target.value)}
            placeholder="Cole ou digite o código QR aqui..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white"
          />
          <Button type="submit" loading={loading}>
            Verificar
          </Button>
        </form>
      )}

      {/* Câmera */}
      {mode === "camera" && (
        <div className="relative rounded-xl overflow-hidden bg-black aspect-square max-w-xs mx-auto">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-white/80 rounded-xl">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-violet-400 rounded-tl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-violet-400 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-violet-400 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-violet-400 rounded-br" />
            </div>
          </div>
          {loading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div
          className={`rounded-xl p-4 border ${
            result.ok
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center gap-3">
            {result.ok ? (
              <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
            )}
            <div>
              <p className={`font-semibold ${result.ok ? "text-green-800" : "text-red-700"}`}>
                {result.message}
              </p>
              {result.convidado && (
                <div className="text-sm text-green-700 mt-1">
                  <p>👤 {result.convidado.nome}</p>
                  <p>🎂 Criança: {result.convidado.nomeAniversariante}</p>
                  <p>🎟️ Pulseiras: {result.convidado.qtdPulantes}</p>
                  <p>🕐 {result.convidado.horario}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
