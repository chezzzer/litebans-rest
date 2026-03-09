import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../../inc/db";
import { idParam } from "../../schemas/punishment";
import { serverSchemas } from "../../lib/openapi";

const serverListQuery = z.object({
    page: z.coerce.number().int().positive().default(1),
    per_page: z.coerce.number().int().positive().max(100).default(20),
    name: z.string().max(32).optional(),
});

export default async function serverRouter(app: FastifyInstance) {
    app.get("/", { schema: serverSchemas.list }, async (req) => {
        const { page, per_page, ...filters } = serverListQuery.parse(
            req.query,
        );

        const where: Record<string, unknown> = {};
        if (filters.name) where.name = filters.name;

        const [data, total] = await Promise.all([
            db.litebans_servers.findMany({
                where,
                skip: (page - 1) * per_page,
                take: per_page,
                orderBy: { id: "desc" },
            }),
            db.litebans_servers.count({ where }),
        ]);

        return {
            data,
            pagination: {
                page,
                per_page,
                total,
                total_pages: Math.ceil(total / per_page),
            },
        };
    });

    app.get("/:id", { schema: serverSchemas.getById }, async (req, res) => {
        const { id } = idParam.parse(req.params);
        const record = await db.litebans_servers.findUnique({
            where: { id },
        });
        if (!record)
            return res.status(404).send({ error: "Server not found" });
        return { data: record };
    });
}
