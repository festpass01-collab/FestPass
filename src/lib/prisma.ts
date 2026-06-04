import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function createPrismaClient() {
  const fileUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  // libsql expects file:// (absolute) or file: (relative) — keep as-is
  const adapter = new PrismaLibSql({ url: fileUrl });
  return new PrismaClient({ adapter } as any);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
