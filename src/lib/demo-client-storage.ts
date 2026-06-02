import type { AppData } from "./types";

const KEY_PREFIX = "pagos_demo_data_";

export function clientStorageKey(sessionId: string): string {
  return `${KEY_PREFIX}${sessionId}`;
}

export function readClientAppData(sessionId: string): AppData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(clientStorageKey(sessionId));
    if (!raw) return null;
    return JSON.parse(raw) as AppData;
  } catch {
    return null;
  }
}

export function writeClientAppData(sessionId: string, data: AppData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(clientStorageKey(sessionId), JSON.stringify(data));
  } catch {
    /* quota exceeded — demo only */
  }
}

export function clearClientAppData(sessionId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(clientStorageKey(sessionId));
}
