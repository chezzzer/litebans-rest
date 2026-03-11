import swagger from "@fastify/swagger";
import fastify from "fastify";
import { ZodError } from "zod";
import { env } from "./inc/env";
import banRouter from "./routes/bans/ban-router";
import historyRouter from "./routes/history/history-router";
import kickRouter from "./routes/kicks/kick-router";
import muteRouter from "./routes/mutes/mute-router";
import serverRouter from "./routes/servers/server-router";
import warningRouter from "./routes/warnings/warning-router";

const app = fastify({ logger: env.NODE_ENV !== "production" });

app.setErrorHandler((error, req, res) => {
    if (error instanceof ZodError) {
        return res.status(400).send({
            error: "Validation error",
            details: error.issues,
        });
    }
    const unknownError = error as any;
    if (unknownError.name === "FastifyError") {
        return res.status(400).send({
            error: "Error",
            details: unknownError.message,
        });
    }
    req.log.error(error);
    return res.status(500).send({ error: "Internal server error" });
});

if (env.API_TOKENS) {
    const tokens = env.API_TOKENS;
    app.addHook("onRequest", async (req, res) => {
        if (req.url.startsWith("/reference")) return;

        const header = req.headers.authorization;
        const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

        if (!token || !tokens.has(token)) {
            return res.status(401).send({ error: "Unauthorized" });
        }
    });
} else {
    console.warn(
        "WARNING: API_TOKENS is not set. All endpoints are publicly accessible. Set API_TOKENS to enable authentication.",
    );
}

app.register(swagger, {
    openapi: {
        info: {
            title: "LiteBans REST API",
            description: "REST API for managing LiteBans punishment data",
            version: "1.0.0",
            contact: {
                name: "Chezzer",
                url: "https://github.com/chezzzer",
            },
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                },
            },
        },
        security: [{ bearerAuth: [] }, {}],
        tags: [
            { name: "Bans", description: "Ban management" },
            { name: "Kicks", description: "Kick management" },
            { name: "Mutes", description: "Mute management" },
            { name: "Warnings", description: "Warning management" },
            { name: "History", description: "Player history (read-only)" },
            { name: "Servers", description: "Registered servers (read-only)" },
        ],
    },
});

app.register(import("@scalar/fastify-api-reference"), {
    routePrefix: "/reference",
    configuration: {
        defaultOpenAllTags: true,
    },
});

app.register(banRouter, { prefix: "/bans" });
app.register(kickRouter, { prefix: "/kicks" });
app.register(muteRouter, { prefix: "/mutes" });
app.register(warningRouter, { prefix: "/warnings" });
app.register(historyRouter, { prefix: "/history" });
app.register(serverRouter, { prefix: "/servers" });

app.listen({ port: env.PORT, host: '0.0.0.0' }, () => {
    console.log(
        `Server listening on port ${env.PORT}\nView documentation at http://localhost:${env.PORT}/reference`,
    );
});
