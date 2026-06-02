import type { ReciboPago } from "./types";
import { formatMoney } from "./utils";

const ANCHO = 56;

function linea(char = "-"): string {
  return char.repeat(ANCHO);
}

function pad(texto: string, ancho: number, alinear: "izq" | "der" = "izq"): string {
  const t = texto.length > ancho ? texto.slice(0, ancho) : texto;
  return alinear === "der" ? t.padStart(ancho) : t.padEnd(ancho);
}

/** Recibo en texto plano (misma estructura que la vista anterior). */
export function formatReciboPlano(recibo: ReciboPago): string {
  const fecha = new Date(recibo.fechaPago).toLocaleString("es-HN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const out: string[] = [];

  out.push("INVERSIONES EXPRESS");
  out.push(`Recibo de pago #${recibo.idPago}`);
  out.push(`Comprobante de aplicación de pago a cuotas — ${fecha}`);
  out.push(linea());
  out.push("");
  out.push(`Cliente:       ${recibo.clienteNombre} ${recibo.clienteApellido}`);
  out.push(`Crédito:       #${recibo.idCredito}`);
  out.push(`Artículo:      ${recibo.descripcionArticulo}`);
  out.push(`Vendedor:      ${recibo.vendedor}`);
  out.push(`Plan de pago:  ${recibo.metodoPago}`);
  out.push("");
  out.push("CUOTAS AFECTADAS");
  out.push(linea());
  out.push(
    pad("Cuota", 8) +
      pad("Saldo antes", 14, "der") +
      pad("Aplicado", 14, "der") +
      pad("Saldo después", 14, "der") +
      pad("Estado", 14)
  );
  out.push(linea("-"));

  for (const l of recibo.lineas) {
    const estado = l.cuotaCompletada ? "Pagada" : "Abono parcial";
    out.push(
      pad(`#${l.numeroCuota}`, 8) +
        pad(formatMoney(l.saldoAnterior), 14, "der") +
        pad(formatMoney(l.montoAplicado), 14, "der") +
        pad(formatMoney(l.saldoRestante), 14, "der") +
        pad(estado, 14)
    );
  }

  out.push(linea());
  out.push("");
  out.push("RESUMEN");
  out.push(linea("-"));
  out.push(`Saldo anterior:    ${formatMoney(recibo.saldoAnterior)}`);
  out.push(`Monto recibido:    ${formatMoney(recibo.montoRecibido)}`);
  out.push(`Saldo pendiente:   ${formatMoney(recibo.saldoPendienteDespues)}`);
  out.push("");
  out.push(linea());
  out.push(`Registrado por: ${recibo.registradoPor}`);
  out.push("");

  return out.join("\n");
}
