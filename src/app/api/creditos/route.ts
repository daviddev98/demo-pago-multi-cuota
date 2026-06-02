import { NextResponse } from "next/server";
import { listarCreditosPendientes } from "@/lib/store";

export async function GET() {
  const creditos = await listarCreditosPendientes();
  return NextResponse.json({ creditos });
}
