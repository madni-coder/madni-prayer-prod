// Official Prisma v6 + Supabase setup using @prisma/adapter-pg
// Fixes: connection pool exhaustion on Vercel serverless deployments
// DATABASE_URL  → Supabase Transaction Pooler (port 6543) — runtime queries
// DATABASE_DIRECT_URL → Supabase Direct connection (port 5432) — Prisma CLI only
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis;

function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not set");
    }
    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({
        adapter,
        log: ["warn", "error"],
    });
}

// In production (Vercel serverless), each function instance gets its own client.
// The global trick only applies in dev to survive Next.js hot reloads.
const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;