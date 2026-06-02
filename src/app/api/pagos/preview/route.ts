import { NextResponse } from "next/server";
import { previewDistribucion } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idCredito = parseInt(searchParams.get("idCredito") ?? "", 10);
  const monto = parseFloat(searchParams.get("monto") ?? "");

  if (Number.isNaN(idCredito) || Number.isNaN(monto)) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const result = await previewDistribucion(idCredito, monto);
  if (!result) {
    return NextResponse.json({ error: "Crédito no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    distribucion: result.distribucion,
    saldoPendiente: result.saldoPendiente,
  });
}
