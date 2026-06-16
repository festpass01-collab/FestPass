import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as any;

  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
  });

  if (!tenant) redirect("/login");

  const primaryColor = tenant.corPrimaria || "#7c3aed";
  const secondaryColor = tenant.corSecundaria || "#ede9fe";

  // Simple function to darken a hex color by 10%
  const darkenColor = (hex: string, percent: number) => {
    let num = parseInt(hex.replace("#", ""), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) - amt,
      G = ((num >> 8) & 0x00ff) - amt,
      B = (num & 0x0000ff) - amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 0 ? 0 : R > 255 ? 255 : R) * 0x10000 +
        (G < 0 ? 0 : G > 255 ? 255 : G) * 0x100 +
        (B < 0 ? 0 : B > 255 ? 255 : B)
      )
        .toString(16)
        .slice(1)
    );
  };

  const primaryHoverColor = darkenColor(primaryColor, 10);

  return (
    <div className="flex min-h-screen">
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            --brand-primary: ${primaryColor};
            --brand-secondary: ${secondaryColor};
            --brand-primary-hover: ${primaryHoverColor};
          }
        `
      }} />
      <Sidebar
        role={user.role}
        tenantNome={tenant.nomeFantasia}
        tenantLogo={tenant.logoUrl}
        tenantLogoStyle={tenant.logoStyle}
        userName={user.name ?? "Usuário"}
      />
      <main className="flex-1 flex flex-col min-w-0 md:pl-0 pt-0">
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
