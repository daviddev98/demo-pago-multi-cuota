import type { AppData } from "./types";
import { createDefaultAppData } from "./default-data";

type SessionStoreMap = Map<string, AppData>;

const globalStore = globalThis as typeof globalThis & {
  __pagosSessionStores?: SessionStoreMap;
};

/** En Vercel no hay disco; siempre memoria por sesión. */
export function isMemoryBackendForced(): boolean {
  return (
    process.env.VERCEL === "1" ||
    process.env.STORAGE_MODE === "memory"
  );
}

export function getStorageMode(): "memory" | "file" {
  return isMemoryBackendForced() ? "memory" : "memory";
}

function stores(): SessionStoreMap {
  if (!globalStore.__pagosSessionStores) {
    globalStore.__pagosSessionStores = new Map();
  }
  return globalStore.__pagosSessionStores;
}

export function getMemoryStore(sessionId: string): AppData {
  const map = stores();
  if (!map.has(sessionId)) {
    map.set(sessionId, createDefaultAppData());
  }
  return structuredClone(map.get(sessionId)!);
}

export function setMemoryStore(sessionId: string, data: AppData): void {
  stores().set(sessionId, structuredClone(data));
}

export function clearMemoryStore(sessionId: string): void {
  stores().delete(sessionId);
}
