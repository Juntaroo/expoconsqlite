import dayjs from "dayjs";
import * as Crypto from "expo-crypto";
import { getDB } from "../db/sqlite";
import { getDeviceId } from "../storage/kv";
import type { Observation, OutboxEntry } from "./models";

const db = getDB();

//Normaliza valores obligatorios y tipa correctamente
function normalizeObservation(o: Partial<Observation>): Observation {
  return {
    id: o.id ?? "",
    title: o.title ?? "",
    severity: o.severity ?? "LOW",
    description: o.description ?? "",
    createdAt: o.createdAt ?? "",
    updatedAt: o.updatedAt ?? "",
    deviceId: o.deviceId ?? "",
    version: Number(o.version ?? 1),
    deleted: Number(o.deleted ?? 0),
  };
}

// Ejecuta múltiples sentencias SQL en modo sincrónico
async function runBatch(statements: any[][]) {
  for (const [query, ...params] of statements) {
    const stmt = db.prepareSync(query);
    stmt.executeSync(...params);
    stmt.finalizeSync();
  }
}

// SELECT ALL (solo activos, ordenados por updatedAt)
export async function getAllObservations(): Promise<Observation[]> {
  const stmt = db.prepareSync(
    `SELECT * FROM observations WHERE deleted = 0 ORDER BY updatedAt DESC`
  );
  const res = stmt.executeSync();
  const rows = res.getAllSync() as any[];
  stmt.finalizeSync();

  return rows.map(r => normalizeObservation(r));
}

// SELECT por ID 
async function getObservationByIdInternal(id: string): Promise<Observation | null> {
  const stmt = db.prepareSync(`SELECT * FROM observations WHERE id = ?`);
  const res = stmt.executeSync(id);
  const rows = res.getAllSync() as any[];
  stmt.finalizeSync();

  if (rows.length === 0) return null;
  return normalizeObservation(rows[0]);
}

export const getObservationById = getObservationByIdInternal;

// INSERT/UPDATE + enqueue 
export async function upsertObservation(
  partial: Partial<Observation> & { title: string; severity: "LOW" | "MEDIUM" | "HIGH" }
): Promise<Observation> {
  const now = dayjs().toISOString();
  const deviceId = await getDeviceId();
  const existing = partial.id ? await getObservationByIdInternal(partial.id) : null;

  const next: Observation = normalizeObservation({
    id: partial.id ?? await Crypto.randomUUID(),
    title: partial.title,
    severity: partial.severity,
    description: partial.description,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    deviceId: existing?.deviceId ?? deviceId,
    version: existing ? existing.version + 1 : 1,
    deleted: 0,
  });

  const opId = await Crypto.randomUUID();
  const opType: "INSERT" | "UPDATE" = existing ? "UPDATE" : "INSERT";

  await runBatch([
    [
      `INSERT OR REPLACE INTO observations
      (id, title, severity, description, createdAt, updatedAt, deviceId, version, deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      next.id,
      next.title,
      next.severity,
      next.description,
      next.createdAt,
      next.updatedAt,
      next.deviceId,
      next.version,
      next.deleted
    ],
    [
      `INSERT INTO outbox (opId, entityId, opType, payload, createdAt, tryCount, lastError)
      VALUES (?, ?, ?, ?, ?, 0, NULL)`,
      opId,
      next.id,
      opType,
      JSON.stringify(next),
      now
    ],
  ]);

  return next;
}

// SOFT DELETE + enqueue 
export async function softDeleteObservation(id: string): Promise<void> {
  const existing = await getObservationByIdInternal(id);
  if (!existing) return;

  const now = dayjs().toISOString();
  const deleted = normalizeObservation({
    ...existing,
    deleted: 1,
    updatedAt: now,
    version: existing.version + 1,
  });

  const opId = await Crypto.randomUUID();

  await runBatch([
    [
      `UPDATE observations SET deleted = 1, updatedAt = ?, version = ? WHERE id = ?`,
      deleted.updatedAt,
      deleted.version,
      id
    ],
    [
      `INSERT INTO outbox (opId, entityId, opType, payload, createdAt, tryCount, lastError)
      VALUES (?, ?, ?, ?, ?, 0, NULL)`,
      opId,
      id,
      "DELETE",
      JSON.stringify(deleted),
      now
    ],
  ]);
}

//SELECT Outbox 
export async function getOutbox(): Promise<OutboxEntry[]> {
  const stmt = db.prepareSync(`SELECT * FROM outbox ORDER BY createdAt ASC`);
  const res = stmt.executeSync();
  const rows = res.getAllSync() as any[];
  stmt.finalizeSync();

  return rows.map(r => ({
    ...r,
    payload: JSON.parse(r.payload),
  })) as OutboxEntry[];
}

// CLEAR Outbox 
export async function clearOutbox(): Promise<void> {
  const stmt = db.prepareSync(`DELETE FROM outbox`);
  stmt.executeSync();
  stmt.finalizeSync();
}
