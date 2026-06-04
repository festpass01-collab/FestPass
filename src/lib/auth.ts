import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
        tenantId: { label: "Tenant", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null;

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
            ...(credentials.tenantId ? { tenantId: credentials.tenantId as string } : {}),
            ativo: true,
          },
          include: { tenant: true },
        });

        if (!user) return null;

        const senhaValida = await bcrypt.compare(
          credentials.senha as string,
          user.senha
        );
        if (!senhaValida) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.nome,
          role: user.role,
          tenantId: user.tenantId,
          tenantNome: user.tenant.nomeFantasia,
          corPrimaria: user.tenant.corPrimaria,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
        token.tenantNome = (user as any).tenantNome;
        token.corPrimaria = (user as any).corPrimaria;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).role = token.role;
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).tenantNome = token.tenantNome;
        (session.user as any).corPrimaria = token.corPrimaria;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});
