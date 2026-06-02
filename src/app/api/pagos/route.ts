import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { registrarPago } from "@/lib/store";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { idCredito, monto } = body as {
    idCredito?: number;
    monto?: number;
  };

  if (!idCredito || monto === undefined) {
    return NextResponse.json(
      { error: "idCredito y monto son requeridos" },
      { status: 400 }
    );
  }

  const result = await registrarPago(idCredito, monto, user.nombre);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ recibo: result.recibo });
}
