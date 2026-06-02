import { NextResponse } from "next/server";
import { getSession, getSessionStoreId } from "@/lib/auth";
import { getAppData, restoreAppData, resetAppData } from "@/lib/store";
import { getStorageMode } from "@/lib/memory-store";
import type { AppData } from "@/lib/types";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const sid = await getSessionStoreId();
  const data = await getAppData();

  return NextResponse.json({
    data,
    sessionId: sid,
    storage: getStorageMode(),
  });
}

export async function PUT(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { data } = body as { data?: AppData };

  if (!data?.creditos || !Array.isArray(data.creditos)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const restored = await restoreAppData(data);
  return NextResponse.json({ data: restored, ok: true });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { action } = body as { action?: string };

  if (action === "reset") {
    const data = await resetAppData();
    return NextResponse.json({ data, ok: true });
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}
