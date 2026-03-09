const idParam = {
    type: "object" as const,
    properties: { id: { type: "integer" } },
    required: ["id"],
};

const paginationResponse = {
    type: "object" as const,
    properties: {
        page: { type: "integer" },
        per_page: { type: "integer" },
        total: { type: "integer" },
        total_pages: { type: "integer" },
    },
};

const punishmentListQuerystring = {
    type: "object" as const,
    properties: {
        page: { type: "integer", default: 1, minimum: 1 },
        per_page: { type: "integer", default: 20, minimum: 1, maximum: 100 },
        uuid: { type: "string", maxLength: 36, description: "Minecraft player UUID" },
        ip: { type: "string", maxLength: 45 },
        active: { type: "string", enum: ["true", "false"] },
        banned_by_uuid: { type: "string", maxLength: 36, description: "Minecraft UUID of the staff member who issued the punishment" },
    },
};

const basePunishmentProps = {
    id: { type: "integer" as const },
    uuid: { type: "string" as const, maxLength: 36 },
    ip: { type: "string" as const, maxLength: 45 },
    reason: { type: "string" as const, maxLength: 2048 },
    banned_by_uuid: { type: "string" as const, maxLength: 36 },
    banned_by_name: { type: "string" as const, maxLength: 128 },
    time: { type: "string" as const, description: "BigInt as string" },
    until: { type: "string" as const, description: "BigInt as string" },
    template: { type: "integer" as const, default: 255 },
    server_scope: { type: "string" as const, maxLength: 32 },
    server_origin: { type: "string" as const, maxLength: 32 },
    silent: { type: "boolean" as const },
    ipban: { type: "boolean" as const },
    ipban_wildcard: { type: "boolean" as const },
    active: { type: "boolean" as const },
};

const removableProps = {
    removed_by_uuid: { type: "string" as const, maxLength: 36 },
    removed_by_name: { type: "string" as const, maxLength: 128 },
    removed_by_reason: { type: "string" as const, maxLength: 2048 },
    removed_by_date: { type: "string" as const, format: "date-time" as const },
};

const banProps = { ...basePunishmentProps, ...removableProps };
const kickProps = { ...basePunishmentProps };
const muteProps = { ...basePunishmentProps, ...removableProps };
const warningProps = {
    ...basePunishmentProps,
    ...removableProps,
    warned: { type: "boolean" as const },
};
const historyProps = {
    id: { type: "integer" as const },
    name: { type: "string" as const, maxLength: 16 },
    uuid: { type: "string" as const, maxLength: 36 },
    ip: { type: "string" as const, maxLength: 45 },
    date: { type: "string" as const, format: "date-time" as const },
};

function createResourceSchemas(
    resourceProps: Record<string, unknown>,
    requiredCreate: string[],
    querystring: Record<string, unknown>,
    tag: string,
    name: string,
) {
    const namePlural = tag;
    const nameLower = name.toLowerCase();
    const item = { type: "object" as const, properties: resourceProps };
    const errorResponse = {
        type: "object" as const,
        properties: { error: { type: "string" as const } },
    };
    const tags = [tag];
    return {
        list: {
            tags,
            summary: `List ${namePlural}`,
            description: `Retrieve a paginated list of ${namePlural.toLowerCase()}. Supports filtering by uuid, ip, and other fields.`,
            operationId: `list${namePlural}`,
            querystring,
            response: {
                200: {
                    description: `A paginated list of ${namePlural.toLowerCase()}`,
                    type: "object" as const,
                    properties: {
                        data: { type: "array" as const, items: item },
                        pagination: paginationResponse,
                    },
                },
            },
        },
        getById: {
            tags,
            summary: `Get ${name} by ID`,
            description: `Retrieve a single ${nameLower} by its unique ID.`,
            operationId: `get${name}ById`,
            params: idParam,
            response: {
                200: {
                    description: `The requested ${nameLower}`,
                    type: "object" as const,
                    properties: { data: item },
                },
                404: errorResponse,
            },
        },
        create: {
            tags,
            summary: `Create ${name}`,
            description: `Create a new ${nameLower} record.`,
            operationId: `create${name}`,
            body: {
                type: "object" as const,
                properties: resourceProps,
                required: requiredCreate,
            },
            response: {
                201: {
                    description: `The newly created ${nameLower}`,
                    type: "object" as const,
                    properties: { data: item },
                },
            },
        },
        update: {
            tags,
            summary: `Update ${name}`,
            description: `Partially update an existing ${nameLower} by ID. Only provided fields will be modified.`,
            operationId: `update${name}`,
            params: idParam,
            body: { type: "object" as const, properties: resourceProps },
            response: {
                200: {
                    description: `The updated ${nameLower}`,
                    type: "object" as const,
                    properties: { data: item },
                },
                404: errorResponse,
            },
        },
        remove: {
            tags,
            summary: `Delete ${name}`,
            description: `Permanently delete a ${nameLower} by ID.`,
            operationId: `delete${name}`,
            params: idParam,
            response: {
                204: { type: "null" as const, description: `${name} deleted successfully` },
                404: errorResponse,
            },
        },
    };
}

const punishmentRequired = ["banned_by_uuid", "time", "until"];

export const banSchemas = createResourceSchemas(
    banProps,
    punishmentRequired,
    punishmentListQuerystring,
    "Bans",
    "Ban",
);
export const kickSchemas = createResourceSchemas(
    kickProps,
    punishmentRequired,
    punishmentListQuerystring,
    "Kicks",
    "Kick",
);
export const muteSchemas = createResourceSchemas(
    muteProps,
    punishmentRequired,
    punishmentListQuerystring,
    "Mutes",
    "Mute",
);
export const warningSchemas = createResourceSchemas(
    warningProps,
    punishmentRequired,
    punishmentListQuerystring,
    "Warnings",
    "Warning",
);

const historyListQuerystring = {
    type: "object" as const,
    properties: {
        page: { type: "integer", default: 1, minimum: 1 },
        per_page: { type: "integer", default: 20, minimum: 1, maximum: 100 },
        uuid: { type: "string", maxLength: 36, description: "Minecraft player UUID" },
        ip: { type: "string", maxLength: 45 },
        name: { type: "string", maxLength: 16, description: "Minecraft player name" },
    },
};

export const historySchemas = createResourceSchemas(
    historyProps,
    [],
    historyListQuerystring,
    "History",
    "History",
);

const serverProps = {
    id: { type: "integer" as const },
    name: { type: "string" as const, maxLength: 32, description: "Server name" },
    uuid: { type: "string" as const, maxLength: 32, description: "Server UUID" },
    date: { type: "string" as const, format: "date-time" as const, description: "Date the server was registered" },
};

const serverItem = { type: "object" as const, properties: serverProps };
const errorResponse = {
    type: "object" as const,
    properties: { error: { type: "string" as const } },
};

const serverListQuerystring = {
    type: "object" as const,
    properties: {
        page: { type: "integer", default: 1, minimum: 1 },
        per_page: { type: "integer", default: 20, minimum: 1, maximum: 100 },
        name: { type: "string", maxLength: 32, description: "Filter by server name" },
    },
};

export const serverSchemas = {
    list: {
        tags: ["Servers"],
        summary: "List Servers",
        description: "Retrieve a paginated list of registered servers.",
        operationId: "listServers",
        querystring: serverListQuerystring,
        response: {
            200: {
                description: "A paginated list of servers",
                type: "object" as const,
                properties: {
                    data: { type: "array" as const, items: serverItem },
                    pagination: paginationResponse,
                },
            },
        },
    },
    getById: {
        tags: ["Servers"],
        summary: "Get Server by ID",
        description: "Retrieve a single server by its unique ID.",
        operationId: "getServerById",
        params: idParam,
        response: {
            200: {
                description: "The requested server",
                type: "object" as const,
                properties: { data: serverItem },
            },
            404: errorResponse,
        },
    },
};
