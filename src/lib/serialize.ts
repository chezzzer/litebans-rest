const BIT_FIELDS = new Set(["silent", "ipban", "ipban_wildcard", "active", "warned"]);

export function serializeRecord(record: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
        if (typeof value === "bigint") {
            result[key] = value.toString();
        } else if (BIT_FIELDS.has(key) && typeof value === "string") {
            result[key] = value === "1";
        } else {
            result[key] = value;
        }
    }
    return result;
}

export function prepareBitFields(data: Record<string, unknown>): Record<string, unknown> {
    const result = { ...data };
    for (const field of BIT_FIELDS) {
        if (typeof result[field] === "boolean") {
            result[field] = result[field] ? "1" : "0";
        }
    }
    return result;
}
