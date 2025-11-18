import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const DEVICE_KEY = "device_id";
const LAST_SYNC_KEY = "last_sync_at";

function generateId() {
  return Crypto.randomUUID();
}

async function save(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}

async function load(key: string): Promise<string | null> {
  return await SecureStore.getItemAsync(key);
}

export async function getDeviceId(): Promise<string> {
  let id = await load(DEVICE_KEY);
  if (!id) {
    id = generateId();
    await save(DEVICE_KEY, id);
  }
  return id;
}

export async function setLastSyncAt(value: string) {
  await save(LAST_SYNC_KEY, value);
}

export async function getLastSyncAt(): Promise<string | null> {
  return await load(LAST_SYNC_KEY);
}
