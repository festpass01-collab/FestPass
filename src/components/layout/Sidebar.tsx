"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, Users, QrCode, Settings,
  UserCog, LogOut, PartyPopper, ChevronRight, Menu, X, Building2
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: string[];
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/convidados", label: "Convidados", icon: Users },
  { href: "/checkin", label: "Check-in", icon: QrCode },
  { href: "/usuarios", label: "Usuários", icon: UserCog, roles: ["MASTER", "ADM", "GERENTE"] },
  { href: "/filiais", label: "Filiais", icon: Building2, roles: ["MASTER"] },
  { href: "/configuracoes", label: "Configurações", icon: Settings, roles: ["MASTER", "ADM"] },
];

import { TenantSwitcher } from "./TenantSwitcher";

interface SidebarProps {
  role: string;
  tenantNome: string;
  tenantLogo?: string | null;
  tenantLogoStyle?: string | null;
  userName: string;
  filiais?: any[];
  currentTenantId?: string;
}

export function Sidebar({ role, tenantNome, tenantLogo, tenantLogoStyle, userName, filiais = [], currentTenantId = "" }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const allowed = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        {tenantLogo ? (
          <div className="w-full flex flex-col items-center gap-2">
            {tenantLogoStyle === "CARD" ? (
              <div className="h-16 w-16 bg-white rounded-xl shadow-sm p-2 flex items-center justify-center overflow-hidden">
                <img src={tenantLogo} alt="Logo" className="max-h-full max-w-full object-contain" />
              </div>
            ) : tenantLogoStyle === "INVERTED" ? (
              <div className="h-16 w-full flex items-center justify-center overflow-hidden">
                <img src={tenantLogo} alt="Logo" className="max-h-full max-w-full object-contain filter brightness-0 invert" />
              </div>
            ) : (
              <div className="h-16 w-full flex items-center justify-center overflow-hidden">
                <img src={tenantLogo} alt="Logo" className="max-h-full max-w-full object-contain" />
              </div>
            )}
            <p className="text-white font-semibold text-xs tracking-wider text-center uppercase truncate w-full mt-1">{tenantNome}</p>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <PartyPopper className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">FestPass</p>
              <p className="text-violet-200 text-xs leading-tight truncate max-w-[140px]">{tenantNome}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <TenantSwitcher isMaster={role === "MASTER"} filiais={filiais} currentTenantId={currentTenantId} />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {allowed.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-white/20 text-white"
                  : "text-violet-100 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-violet-700/30">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-violet-400/40 flex items-center justify-center text-white text-sm font-semibold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{userName}</p>
            <p className="text-violet-300 text-xs">{role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-violet-200 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className="hidden md:flex w-56 lg:w-60 flex-shrink-0 flex-col bg-violet-700 min-h-screen transition-all duration-300"
        style={{ backgroundColor: "var(--brand-primary)" }}
      >
        <NavContent />
      </aside>

      {/* Mobile toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 bg-violet-700 rounded-lg flex items-center justify-center text-white shadow-lg transition-all duration-300"
          style={{ backgroundColor: "var(--brand-primary)" }}
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
          <aside
            className="md:hidden fixed left-0 top-0 bottom-0 w-60 bg-violet-700 z-50 flex flex-col transition-all duration-300"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            <NavContent />
          </aside>
        </>
      )}
    </>
  );
}
