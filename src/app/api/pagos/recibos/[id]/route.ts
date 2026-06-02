import { NextResponse } from "next/server";
import { obtenerRecibo } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idPago = parseInt(id, 10);
  if (Number.isNaN(idPago)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const recibo = await obtenerRecibo(idPago);
  if (!recibo) {
    return NextResponse.json({ error: "Recibo no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ recibo });
}
