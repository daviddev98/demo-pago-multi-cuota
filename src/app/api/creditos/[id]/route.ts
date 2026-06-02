import { NextResponse } from "next/server";
import { obtenerCredito } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idCredito = parseInt(id, 10);
  if (Number.isNaN(idCredito)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const info = await obtenerCredito(idCredito);
  if (!info) {
    return NextResponse.json({ error: "Crédito no encontrado" }, { status: 404 });
  }

  return NextResponse.json(info);
}
