"use client";

import type { ReciboPago } from "@/lib/types";
import { ReciboPagoView } from "@/components/ReciboPagoView";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer } from "lucide-react";

interface ReciboPagoDialogProps {
  recibo: ReciboPago | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReciboPagoDialog({
  recibo,
  open,
  onOpenChange,
}: ReciboPagoDialogProps) {
  if (!recibo) return null;

  const fecha = new Date(recibo.fechaPago).toLocaleString("es-HN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  function handlePrint() {
    const r = recibo;
    if (!r) return;
    try {
      sessionStorage.setItem(`recibo_${r.idPago}`, JSON.stringify(r));
    } catch {
      /* ignore */
    }
    const url = `/pagos/recibo/${r.idPago}?print=1`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-white/10 bg-[#222428]">
        <DialogHeader className="sr-only">
          <DialogTitle>Recibo de pago #{recibo.idPago}</DialogTitle>
          <DialogDescription>{fecha}</DialogDescription>
        </DialogHeader>

        <ReciboPagoView recibo={recibo} />

        <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Imprimir / PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
