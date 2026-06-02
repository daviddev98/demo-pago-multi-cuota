import type { ReciboPago } from "@/lib/types";
import { formatReciboPlano } from "@/lib/recibo-texto";

interface ReciboPagoPlanoProps {
  recibo: ReciboPago;
}

/** Recibo en texto plano — solo impresión / PDF. */
export function ReciboPagoPlano({ recibo }: ReciboPagoPlanoProps) {
  return <pre className="recibo-documento">{formatReciboPlano(recibo)}</pre>;
}
