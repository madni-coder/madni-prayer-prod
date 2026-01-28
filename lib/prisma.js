// Pooled runtime Prisma Client instance
// DATABASE_URL points to Supabase PgBouncer (port 6543) in production
// DATABASE_DIRECT_URL is used automatically by Prisma for migrations/introspection
import { PrismaClient } from "@prisma/client";

// Avoid creating multiple instances during Next.js hot reload in dev
const globalForPrisma = globalThis;

// Normalize pool settings for PgBouncer/Supabase; defaults keep connections low to avoid timeouts
const connectionLimit = process.env.PRISMA_CONNECTION_LIMIT || "1";
const poolTimeout = process.env.PRISMA_POOL_TIMEOUT || "30"; // seconds

const buildDatasourceUrl = () => {
    if (!process.env.DATABASE_URL) return undefined;
    try {
        const url = new URL(process.env.DATABASE_URL);
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
        log: ["warn", "error"],
        datasources: { db: { url: buildDatasourceUrl() } },
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;