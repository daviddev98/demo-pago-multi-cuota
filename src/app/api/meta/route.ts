import { NextResponse } from "next/server";
import { getStorageMode, isMemoryBackendForced } from "@/lib/memory-store";

export async function GET() {
  return NextResponse.json({
    storage: getStorageMode(),
    vercel: process.env.VERCEL === "1",
    memoryForced: isMemoryBackendForced(),
    description:
      "Demo sin base de datos. Datos en memoria por sesión + respaldo en localStorage del navegador.",
  });
}
