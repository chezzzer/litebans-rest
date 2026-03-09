import type { FastifyInstance } from "fastify";
import { db } from "../../inc/db";
import { createBanSchema, updateBanSchema } from "../../schemas/punishment";
import { createPunishmentCrud } from "../../lib/crud";
import { banSchemas } from "../../lib/openapi";

export default async function banRouter(app: FastifyInstance) {
    const handlers = createPunishmentCrud(
        db.litebans_bans,
        createBanSchema,
        updateBanSchema,
        "Ban",
    );

    app.get("/", { schema: banSchemas.list }, handlers.list);
    app.get("/:id", { schema: banSchemas.getById }, handlers.getById);
    app.post("/", { schema: banSchemas.create }, handlers.create);
    app.patch("/:id", { schema: banSchemas.update }, handlers.update);
    app.delete("/:id", { schema: banSchemas.remove }, handlers.remove);
}
