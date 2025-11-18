import { getDB } from "../db/sqlite";
import { getLastSyncAt, setLastSyncAt } from "../storage/kv";
import { applyOpsFromOutbox, pullSince } from "./fakeServer";
import type { Observation } from "./models";
import { clearOutbox, getOutbox } from "./repo";

const db = getDB();

//LWW batch apply (Local DB)
function applyRemoteBatch(items: Observation[]) {
  for (const item of items) {
    const stmt = db.prepareSync(
      `INSERT OR REPLACE INTO observations
      (id, title, severity, description, createdAt, updatedAt, deviceId, version, deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    stmt.executeSync(
      item.id,
      item.title,
      item.severity,
      item.description ?? "",
      item.createdAt,
      item.updatedAt,
      item.deviceId,
      item.version,
      item.deleted
    );
    stmt.finalizeSync();
  }
}

// Main orchestrator 
export async function syncNow(): Promise<{ changes: number }> {
  console.log("🔄 [SYNC] Starting...");
  let changesApplied = 0;

  //Acá se hace el PUSH 
  const outbox = await getOutbox();
  if (outbox.length > 0) {
    console.log("📤 [PUSH] Sending", outbox.length, "ops");
    const res = await applyOpsFromOutbox(outbox);
    await clearOutbox();
    console.log("📤 [PUSH] Done, serverTime:", res.serverTime);
  }

  //Acá se hace el PULL
  const lastSync = await getLastSyncAt();
  const { items, serverTime } = await pullSince(lastSync);

  if (items.length > 0) {
    applyRemoteBatch(items);
    changesApplied = items.length;
    console.log("📥 [PULL] Applied", items.length, "items");
  }

  if (serverTime) setLastSyncAt(serverTime);

  console.log("✅ [SYNC] Complete");
  return { changes: changesApplied };
}
