"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import type { ReciboPago } from "@/lib/types";
import { ReciboPagoPlano } from "@/components/ReciboPagoPlano";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { readClientAppData } from "@/lib/demo-client-storage";

export default function ReciboPrintPage() {
  return (
    <Suspense
      fallback={
        <div className="recibo-print-page flex min-h-screen items-center justify-center text-[#9ca3af]">
          Cargando recibo...
        </div>
      }
    >
      <ReciboPrintContent />
    </Suspense>
  );
}

function ReciboPrintContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const idPago = parseInt(String(params.id), 10);
  const [recibo, setRecibo] = useState<ReciboPago | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/pagos/recibos/${idPago}`);
        if (res.ok) {
          const data = await res.json();
          setRecibo(data.recibo);
          return;
        }

        try {
          const cached = sessionStorage.getItem(`recibo_${idPago}`);
          if (cached) {
            setRecibo(JSON.parse(cached) as ReciboPago);
            return;
          }
        } catch {
          /* ignore */
        }

        const metaRes = await fetch("/api/data");
        if (metaRes.ok) {
          const meta = await metaRes.json();
          const sid = meta.sessionId as string | null;
          if (sid) {
            const local = readClientAppData(sid);
            const found = local?.recibos.find((r) => r.idPago === idPago);
            if (found) {
              setRecibo(found);
              return;
            }
          }
        }

        setError(
          "No se encontró el recibo. Vuelva a la aplicación e intente de nuevo."
        );
      } catch {
        setError("Error al cargar el recibo.");
      } finally {
        setLoading(false);
      }
    }
    if (!Number.isNaN(idPago)) void load();
    else {
      setError("ID de recibo inválido");
      setLoading(false);
    }
  }, [idPago]);

  useEffect(() => {
    if (!recibo || loading) return;
    if (searchParams.get("print") === "1") {
      const t = window.setTimeout(() => window.print(), 400);
      return () => window.clearTimeout(t);
    }
  }, [recibo, loading, searchParams]);

  if (loading) {
    return (
      <div className="recibo-print-page flex min-h-screen items-center justify-center text-[#9ca3af]">
        Cargando recibo...
      </div>
    );
  }

  if (error || !recibo) {
    return (
      <div className="recibo-print-page flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-red-300">{error ?? "Recibo no disponible"}</p>
        <Button asChild variant="outline">
          <Link href="/pagos">
            <ArrowLeft className="h-4 w-4" />
            Volver a pagos
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="recibo-print-page">
      <div className="recibo-print-toolbar no-print">
        <Button asChild variant="outline" size="sm">
          <Link href="/pagos">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Imprimir / Guardar PDF
        </Button>
      </div>

      <ReciboPagoPlano recibo={recibo} />
    </div>
  );
}
