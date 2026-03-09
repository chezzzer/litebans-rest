import type { FastifyInstance } from "fastify";
import { db } from "../../inc/db";
import { createKickSchema, updateKickSchema } from "../../schemas/punishment";
import { createPunishmentCrud } from "../../lib/crud";
import { kickSchemas } from "../../lib/openapi";

export default async function kickRouter(app: FastifyInstance) {
    const handlers = createPunishmentCrud(
        db.litebans_kicks,
        createKickSchema,
        updateKickSchema,
        "Kick",
    );

    app.get("/", { schema: kickSchemas.list }, handlers.list);
    app.get("/:id", { schema: kickSchemas.getById }, handlers.getById);
    app.post("/", { schema: kickSchemas.create }, handlers.create);
    app.patch("/:id", { schema: kickSchemas.update }, handlers.update);
    app.delete("/:id", { schema: kickSchemas.remove }, handlers.remove);
}
