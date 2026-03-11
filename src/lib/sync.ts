import { db } from "~/inc/db";

/**
 * LiteBans sync table message types (hB enum ordinals).
 * When a row is written to litebans_sync, the plugin on each server
 * polls the table and picks up changes.
 *
 * info = (typeOrdinal << 16) | serverId + 42
 */
const SyncType = {
    BAN_UUID: 8,
    MUTE_UUID: 9,
    WARN_UUID: 10,
    KICK: 11,
    UNBAN_UUID: 13,
    UNMUTE_UUID: 14,
    UNWARN_UUID: 15,
    BROADCAST: 2,
} as const;

const SEP = "\uFEFF";

const RESOURCE_SYNC_TYPES: Record<string, { create: number; remove: number }> =
    {
        Ban: { create: SyncType.BAN_UUID, remove: SyncType.UNBAN_UUID },
        Mute: { create: SyncType.MUTE_UUID, remove: SyncType.UNMUTE_UUID },
        Warning: { create: SyncType.WARN_UUID, remove: SyncType.UNWARN_UUID },
        Kick: { create: SyncType.KICK, remove: SyncType.KICK },
    };

export const API_SERVER_NAME = "__api__litebans-rest";

let cachedServerId: number | null = null;

async function getApiServerId(): Promise<number> {
    if (cachedServerId !== null) return cachedServerId;

    const existing = await db.litebans_servers.findFirst({
        where: { name: API_SERVER_NAME },
    });

    if (existing) {
        cachedServerId = existing.id;
        return existing.id;
    }

    const created = await db.litebans_servers.create({
        data: {
            name: API_SERVER_NAME,
            uuid: API_SERVER_NAME,
        },
    });

    cachedServerId = created.id;
    return created.id;
}

function buildInfo(typeOrdinal: number, serverId: number): number {
    return (typeOrdinal << 16) | (serverId + 42);
}

async function getPlayerName(uuid: string): Promise<string> {
    const history = await db.litebans_history.findFirst({
        where: { uuid },
        orderBy: { id: "desc" },
    });
    return history?.name ?? "Unknown";
}

interface SyncRecord {
    uuid?: string | null;
    banned_by_uuid?: string | null;
    banned_by_name?: string | null;
    template?: number | null;
    id?: number | null;
}

export async function writeSyncEntry(
    resourceName: string,
    action: "create" | "update" | "remove",
    record: SyncRecord,
): Promise<void> {
    const types = RESOURCE_SYNC_TYPES[resourceName];
    if (!types) return;

    const uuid = record.uuid?.replace(/-/g, "") ?? "";
    if (!uuid) return;

    const serverId = await getApiServerId();
    const typeOrdinal = action === "remove" ? types.remove : types.create;
    const info = buildInfo(typeOrdinal, serverId);

    let msg: string;

    if (resourceName === "Kick") {
        // Kick format: bannedByUUID SEP bannedByName SEP playerName SEP SEP SEP SEP template SEP id
        const playerName = await getPlayerName(record.uuid ?? "");
        const bannedByUuid = record.banned_by_uuid ?? "CONSOLE";
        const bannedByName = record.banned_by_name ?? "Console";
        const template = record.template ?? 255;
        const id = record.id ?? -1;
        msg = [
            bannedByUuid,
            bannedByName,
            playerName,
            "",
            "",
            "",
            String(template),
            String(id),
        ].join(SEP);
    } else {
        msg = `${uuid}${SEP}`;
    }

    await db.litebans_sync.create({
        data: { info, msg },
    });
}
