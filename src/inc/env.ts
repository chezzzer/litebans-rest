import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    DATABASE_URL: z.url(),
    PORT: z.coerce.number().int().positive().default(3000),
    API_TOKENS: z
        .string()
        .transform((v) => new Set(v.split(",").map((t) => t.trim()).filter(Boolean)))
        .optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsed.data;
