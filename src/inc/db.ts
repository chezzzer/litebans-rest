import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { env } from "~/inc/env";
import { PrismaClient } from "../../generated/prisma";

const createPrismaClient = () => {
    const pool = new Pool({ connectionString: env.DATABASE_URL });
    const adapter = new PrismaPg(pool);

    return new PrismaClient({
        adapter,
        log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
};

const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
