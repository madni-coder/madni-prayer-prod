// Pooled runtime Prisma Client instance optimized for Vercel serverless
// DATABASE_URL points to Supabase Transaction Pooler (port 6543) - CRITICAL for serverless
// DATABASE_DIRECT_URL is used automatically by Prisma CLI for migrations/introspection
import { PrismaClient } from "@prisma/client";

// Avoid creating multiple instances during Next.js hot reload in dev
const globalForPrisma = globalThis;

// IMPORTANT: Keep connection_limit LOW for serverless (1-5 recommended by Prisma)
// Supabase Transaction Pooler handles the actual pooling
const connectionLimit = process.env.PRISMA_CONNECTION_LIMIT || "1";
const poolTimeout = process.env.PRISMA_POOL_TIMEOUT || "10"; // Lower timeout for faster failover

const buildDatasourceUrl = () => {
    if (!process.env.DATABASE_URL) return undefined;
    try {
        const url = new URL(process.env.DATABASE_URL);
        // Ensure pgbouncer=true is set (critical for Transaction Pooler mode)
        url.searchParams.set("pgbouncer", "true");
        url.searchParams.set("connection_limit", connectionLimit);
        url.searchParams.set("pool_timeout", poolTimeout);
        return url.toString();
    } catch (err) {
        console.warn("Invalid DATABASE_URL, falling back to raw env value", err);
        return process.env.DATABASE_URL;
    }
};

const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["warn", "error"],
        datasources: { db: { url: buildDatasourceUrl() } },
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;