// Pooled runtime Prisma Client instance
// DATABASE_URL points to Supabase PgBouncer (port 6543) in production
// DATABASE_DIRECT_URL is used automatically by Prisma for migrations/introspection
import { PrismaClient } from "@prisma/client";

// Avoid creating multiple instances during Next.js hot reload in dev
const globalForPrisma = globalThis;

const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ["warn", "error"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;