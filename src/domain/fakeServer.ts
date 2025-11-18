import dayjs from "dayjs";
import type { Observation, OutboxEntry } from "./models";

// Base simulada de backend
let serverDB: Observation[] = [];

//Normaliza igual que el cliente
function normalizeObservationServer(o: Observation): Observation {
  return {
    ...o,
    title: o.title ?? "",
    severity: o.severity ?? "LOW",
    description: o.description ?? "",
    createdAt: o.createdAt ?? dayjs().toISOString(),
    updatedAt: o.updatedAt ?? dayjs().toISOString(),
    deviceId: o.deviceId ?? "unknown-server",
    version: Number(o.version ?? 1),
    deleted: Number(o.deleted ?? 0),
  };
}

//PUSH: aplica OUTBOX al servidor
export async function applyOpsFromOutbox(outbox: OutboxEntry[]) {
  for (const entry of outbox) {
    const normalized = normalizeObservationServer(entry.payload);

    const existingIdx = serverDB.findIndex((o) => o.id === normalized.id);

    if (entry.opType === "INSERT" || entry.opType === "UPDATE") {
      if (existingIdx >= 0) serverDB[existingIdx] = normalized;
      else serverDB.push(normalized);
    }

    if (entry.opType === "DELETE") {
      if (existingIdx >= 0) serverDB[existingIdx] = normalized;
      else serverDB.push(normalized);
    }
  }

  return { ok: true, serverTime: dayjs().toISOString() };
}

//PULL: retorna delta desde lastSyncAt
export async function pullSince(since: string | null) {
  if (!since) {
    return { items: serverDB, serverTime: dayjs().toISOString() };
  }

  const items = serverDB.filter((o) => o.updatedAt > since);

  return { items, serverTime: dayjs().toISOString() };
}

//Debug helper
export function getServerData() {
  return serverDB;
}
