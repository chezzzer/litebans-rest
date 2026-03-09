import type { FastifyInstance } from "fastify";
import { db } from "~/inc/db";
import {
    createHistorySchema,
    updateHistorySchema,
    historyListQuery,
} from "~/schemas/history";
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

    app.post("/", { schema: historySchemas.create }, async (req, res) => {
        const body = createHistorySchema.parse(req.body);
        const record = await db.litebans_history.create({ data: body });
        return res.status(201).send({ data: record });
    });

    app.patch("/:id", { schema: historySchemas.update }, async (req, res) => {
        const { id } = idParam.parse(req.params);
        const body = updateHistorySchema.parse(req.body);

        const existing = await db.litebans_history.findUnique({
            where: { id },
        });
        if (!existing)
            return res
                .status(404)
                .send({ error: "History entry not found" });

        const record = await db.litebans_history.update({
            where: { id },
            data: body,
        });
        return { data: record };
    });

    app.delete("/:id", { schema: historySchemas.remove }, async (req, res) => {
        const { id } = idParam.parse(req.params);
        const existing = await db.litebans_history.findUnique({
            where: { id },
        });
        if (!existing)
            return res
                .status(404)
                .send({ error: "History entry not found" });
        await db.litebans_history.delete({ where: { id } });
        return res.status(204).send();
    });
}
