import type { FastifyInstance } from "fastify";
import { db } from "~/inc/db";
import { createMuteSchema, updateMuteSchema } from "~/schemas/punishment";
import { createPunishmentCrud } from "~/lib/crud";
import { muteSchemas } from "~/lib/openapi";

export default async function muteRouter(app: FastifyInstance) {
    const handlers = createPunishmentCrud(
        db.litebans_mutes,
        createMuteSchema,
        updateMuteSchema,
        "Mute",
    );

    app.get("/", { schema: muteSchemas.list }, handlers.list);
    app.get("/:id", { schema: muteSchemas.getById }, handlers.getById);
    app.post("/", { schema: muteSchemas.create }, handlers.create);
    app.patch("/:id", { schema: muteSchemas.update }, handlers.update);
    app.delete("/:id", { schema: muteSchemas.remove }, handlers.remove);
}
