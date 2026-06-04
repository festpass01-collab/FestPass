import { cn } from "@/lib/utils";

type BadgeVariant = "green" | "yellow" | "red" | "blue" | "gray" | "violet";

const variants: Record<BadgeVariant, string> = {
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
  blue: "bg-blue-100 text-blue-800",
  gray: "bg-gray-100 text-gray-700",
  violet: "bg-violet-100 text-violet-800",
};

export function Badge({ variant = "gray", className, children }: {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}

export function roleBadge(role: string) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    ADM: { label: "Administrador", variant: "violet" },
    GERENTE: { label: "Gerente", variant: "blue" },
    CONSULTOR: { label: "Consultor", variant: "green" },
    OPERADOR: { label: "Operador", variant: "gray" },
  };
  return map[role] ?? { label: role, variant: "gray" };
}

export function statusQrBadge(status: string) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    PENDENTE: { label: "Pendente", variant: "yellow" },
    UTILIZADO: { label: "Utilizado", variant: "green" },
    EXPIRADO: { label: "Expirado", variant: "gray" },
    CANCELADO: { label: "Cancelado", variant: "red" },
  };
  return map[status] ?? { label: status, variant: "gray" };
}

export function statusEventoBadge(status: string) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    ATIVO: { label: "Ativo", variant: "green" },
    ENCERRADO: { label: "Encerrado", variant: "gray" },
    CANCELADO: { label: "Cancelado", variant: "red" },
  };
  return map[status] ?? { label: status, variant: "gray" };
}
