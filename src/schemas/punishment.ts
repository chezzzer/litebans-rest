import { z } from "zod";

const basePunishment = {
    uuid: z.string().max(36).optional(),
    ip: z.string().max(45).optional(),
    reason: z.string().max(2048).optional(),
    banned_by_uuid: z.string().max(36),
    banned_by_name: z.string().max(128).optional(),
    time: z.coerce.bigint(),
    until: z.coerce.bigint(),
    template: z.number().int().default(255),
    server_scope: z.string().max(32).optional(),
    server_origin: z.string().max(32).optional(),
    silent: z.boolean().default(false),
    ipban: z.boolean().default(false),
    ipban_wildcard: z.boolean().default(false),
    active: z.boolean().default(true),
};

const removableFields = {
    removed_by_uuid: z.string().max(36).optional(),
    removed_by_name: z.string().max(128).optional(),
    removed_by_reason: z.string().max(2048).optional(),
    removed_by_date: z.coerce.date().optional(),
};

export const createBanSchema = z.object({ ...basePunishment, ...removableFields });
export const updateBanSchema = createBanSchema.partial();

export const createKickSchema = z.object({ ...basePunishment });
export const updateKickSchema = createKickSchema.partial();

export const createMuteSchema = z.object({ ...basePunishment, ...removableFields });
export const updateMuteSchema = createMuteSchema.partial();

export const createWarningSchema = z.object({
    ...basePunishment,
    ...removableFields,
    warned: z.boolean().default(false),
});
export const updateWarningSchema = createWarningSchema.partial();

export const punishmentListQuery = z.object({
    page: z.coerce.number().int().positive().default(1),
    per_page: z.coerce.number().int().positive().max(100).default(20),
    uuid: z.string().max(36).optional(),
    ip: z.string().max(45).optional(),
    active: z
        .enum(["true", "false"])
        .transform((v) => v === "true")
        .optional(),
    banned_by_uuid: z.string().max(36).optional(),
});

export const idParam = z.object({
    id: z.coerce.number().int().positive(),
});
