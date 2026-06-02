"use client";

import { useCallback, useEffect, useRef } from "react";
import type { AppData } from "@/lib/types";
import {
  readClientAppData,
  writeClientAppData,
} from "@/lib/demo-client-storage";

/**
 * Sincroniza datos demo entre servidor (memoria por sesión) y localStorage.
 * En Vercel el cold start puede vaciar la memoria; el cliente restaura el estado.
 */
export function useDemoSync() {
  const sessionIdRef = useRef<string | null>(null);
  const syncedRef = useRef(false);

  const persistLocal = useCallback((data: AppData) => {
    const sid = sessionIdRef.current;
    if (sid) writeClientAppData(sid, data);
  }, []);

  const syncFromServer = useCallback(async () => {
    const res = await fetch("/api/data");
    if (!res.ok) return null;
    const json = await res.json();
    const { data, sessionId } = json as {
      data: AppData;
      sessionId: string | null;
    };
    if (sessionId) sessionIdRef.current = sessionId;

    const local =
      sessionId && readClientAppData(sessionId);

    if (local && hasMoreActivity(local, data)) {
      await fetch("/api/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: local }),
      });
      persistLocal(local);
      return local;
    }

    if (sessionId) persistLocal(data);
    return data;
  }, [persistLocal]);

  useEffect(() => {
    if (syncedRef.current) return;
    syncedRef.current = true;
    void syncFromServer();
  }, [syncFromServer]);

  const afterMutation = useCallback(
    async (data?: AppData) => {
      if (data) {
        persistLocal(data);
        return;
      }
      const res = await fetch("/api/data");
      if (!res.ok) return;
      const json = await res.json();
      persistLocal(json.data as AppData);
    },
    [persistLocal]
  );

  const resetDemo = useCallback(async () => {
    const res = await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    if (!res.ok) return;
    const json = await res.json();
    persistLocal(json.data as AppData);
    return json.data as AppData;
  }, [persistLocal]);

  return { syncFromServer, afterMutation, resetDemo };
}

function hasMoreActivity(local: AppData, server: AppData): boolean {
  return (
    local.recibos.length > server.recibos.length ||
    local.siguienteIdPago > server.siguienteIdPago
  );
}
