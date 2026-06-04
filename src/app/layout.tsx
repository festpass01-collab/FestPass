import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FestPass — Plataforma de Convites Virtuais",
  description: "Gerencie convites, check-in e NPS para festas infantis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-gray-50 font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
