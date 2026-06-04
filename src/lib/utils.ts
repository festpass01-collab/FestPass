export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function calcularIdade(dataNascimento: string): number {
  const hoje = new Date();
  const nasc = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

export function formatCNPJ(cnpj: string) {
  const clean = cnpj.replace(/\D/g, "");
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export function validarCNPJ(cnpj: string): boolean {
  const c = cnpj.replace(/\D/g, "");
  if (c.length !== 14) return false;
  if (/^(\d)\1+$/.test(c)) return false;
  const calc = (s: string, w: number[]) => {
    let sum = 0;
    for (let i = 0; i < s.length; i++) sum += parseInt(s[i]) * w[i];
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  return calc(c.slice(0, 12), w1) === parseInt(c[12]) &&
    calc(c.slice(0, 13), w2) === parseInt(c[13]);
}

export const ROLES = {
  ADM: "ADM",
  GERENTE: "GERENTE",
  CONSULTOR: "CONSULTOR",
  OPERADOR: "OPERADOR",
} as const;

export type Role = keyof typeof ROLES;

export const ROLE_LABELS: Record<string, string> = {
  ADM: "Administrador",
  GERENTE: "Gerente",
  CONSULTOR: "Consultor/Vendedor",
  OPERADOR: "Operador",
};

export const STATUS_QR_LABELS: Record<string, string> = {
  PENDENTE: "Pendente",
  UTILIZADO: "Utilizado",
  EXPIRADO: "Expirado",
  CANCELADO: "Cancelado",
};

export const STATUS_EVENTO_LABELS: Record<string, string> = {
  ATIVO: "Ativo",
  ENCERRADO: "Encerrado",
  CANCELADO: "Cancelado",
};
