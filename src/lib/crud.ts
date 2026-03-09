import type { FastifyReply, FastifyRequest } from "fastify";
import { serializeRecord, prepareBitFields } from "./serialize";
import { punishmentListQuery, idParam } from "../schemas/punishment";

interface Schema {
    parse(data: unknown): Record<string, unknown>;
}

interface PrismaDelegate {
    findMany(args: any): Promise<any[]>;
    findUnique(args: any): Promise<any | null>;
    count(args: any): Promise<number>;
    create(args: any): Promise<any>;
    update(args: any): Promise<any>;
    delete(args: any): Promise<any>;
}

export function createPunishmentCrud(
    model: PrismaDelegate,
    createSchema: Schema,
    updateSchema: Schema,
    resourceName: string,
) {
    return {
        list: async (req: FastifyRequest, res: FastifyReply) => {
            const { page, per_page, active, ...filters } =
                punishmentListQuery.parse(req.query);

            const where: Record<string, unknown> = {};
            if (filters.uuid) where.uuid = filters.uuid;
            if (filters.ip) where.ip = filters.ip;
            if (active !== undefined) where.active = active ? "1" : "0";
            if (filters.banned_by_uuid)
                where.banned_by_uuid = filters.banned_by_uuid;

            const [data, total] = await Promise.all([
                model.findMany({
                    where,
                    skip: (page - 1) * per_page,
                    take: per_page,
                    orderBy: { id: "desc" },
                }),
                model.count({ where }),
            ]);

            return {
                data: data.map(serializeRecord),
                pagination: {
                    page,
                    per_page,
                    total,
                    total_pages: Math.ceil(total / per_page),
                },
            };
        },

        getById: async (req: FastifyRequest, res: FastifyReply) => {
            const { id } = idParam.parse(req.params);
            const record = await model.findUnique({ where: { id } });
            if (!record)
                return res
                    .status(404)
                    .send({ error: `${resourceName} not found` });
            return { data: serializeRecord(record) };
        },

        create: async (req: FastifyRequest, res: FastifyReply) => {
            const body = createSchema.parse(req.body);
            const data = prepareBitFields(body);
            const record = await model.create({ data });
            return res.status(201).send({ data: serializeRecord(record) });
        },

        update: async (req: FastifyRequest, res: FastifyReply) => {
            const { id } = idParam.parse(req.params);
            const body = updateSchema.parse(req.body);

            const existing = await model.findUnique({ where: { id } });
            if (!existing)
                return res
                    .status(404)
                    .send({ error: `${resourceName} not found` });

            const data = prepareBitFields(body);
            const record = await model.update({ where: { id }, data });
            return { data: serializeRecord(record) };
        },

        remove: async (req: FastifyRequest, res: FastifyReply) => {
            const { id } = idParam.parse(req.params);
            const existing = await model.findUnique({ where: { id } });
            if (!existing)
                return res
                    .status(404)
                    .send({ error: `${resourceName} not found` });
            await model.delete({ where: { id } });
            return res.status(204).send();
        },
    };
}
