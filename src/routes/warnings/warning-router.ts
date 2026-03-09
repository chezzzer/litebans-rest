import type { FastifyInstance } from "fastify";
import { db } from "../../inc/db";
import {
    createWarningSchema,
    updateWarningSchema,
} from "../../schemas/punishment";
import { createPunishmentCrud } from "../../lib/crud";
import { warningSchemas } from "../../lib/openapi";

export default async function warningRouter(app: FastifyInstance) {
    const handlers = createPunishmentCrud(
        db.litebans_warnings,
        createWarningSchema,
        updateWarningSchema,
        "Warning",
    );

    app.get("/", { schema: warningSchemas.list }, handlers.list);
    app.get("/:id", { schema: warningSchemas.getById }, handlers.getById);
    app.post("/", { schema: warningSchemas.create }, handlers.create);
    app.patch("/:id", { schema: warningSchemas.update }, handlers.update);
    app.delete("/:id", { schema: warningSchemas.remove }, handlers.remove);
}
