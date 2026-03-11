import type { FastifyInstance } from "fastify";
import { db } from "~/inc/db";
import { historyListQuery } from "~/schemas/history";
import { idParam } from "~/schemas/punishment";
import { historySchemas } from "~/lib/openapi";

export default async function historyRouter(app: FastifyInstance) {
    app.get("/", { schema: historySchemas.list }, async (req) => {
        const { page, per_page, ...filters } = historyListQuery.parse(
            req.query,
        );

        const where: Record<string, unknown> = {};
        if (filters.uuid) where.uuid = filters.uuid;
        if (filters.ip) where.ip = filters.ip;
        if (filters.name) where.name = filters.name;

        const [data, total] = await Promise.all([
            db.litebans_history.findMany({
                where,
                skip: (page - 1) * per_page,
                take: per_page,
                orderBy: { id: "desc" },
            }),
            db.litebans_history.count({ where }),
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

    app.get("/:id", { schema: historySchemas.getById }, async (req, res) => {
        const { id } = idParam.parse(req.params);
        const record = await db.litebans_history.findUnique({
            where: { id },
        });
        if (!record)
            return res
                .status(404)
                .send({ error: "History entry not found" });
        return { data: record };
    });
}
