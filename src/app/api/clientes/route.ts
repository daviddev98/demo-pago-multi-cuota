import { NextResponse } from "next/server";
import { buscarClientesConCreditos } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  if (!q.trim()) {
    return NextResponse.json(
      { error: "Indique el nombre del cliente" },
      { status: 400 }
    );
  }

  const creditos = await buscarClientesConCreditos(q);
  return NextResponse.json({ creditos });
}
