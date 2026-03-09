import { z } from "zod";

export const createHistorySchema = z.object({
    name: z.string().max(16).optional(),
    uuid: z.string().max(36).optional(),
    ip: z.string().max(45).optional(),
    date: z.coerce.date().optional(),
});

export const updateHistorySchema = createHistorySchema.partial();

export const historyListQuery = z.object({
    page: z.coerce.number().int().positive().default(1),
    per_page: z.coerce.number().int().positive().max(100).default(20),
    uuid: z.string().max(36).optional(),
    ip: z.string().max(45).optional(),
    name: z.string().max(16).optional(),
});
